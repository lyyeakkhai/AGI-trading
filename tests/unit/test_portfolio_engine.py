from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock

from packages.database.models.portfolio import (
    FillModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from services.portfolio.engine import PortfolioEngine


@pytest.mark.asyncio
async def test_portfolio_buy_and_sell_cycle() -> None:
    engine = PortfolioEngine()
    account_id = uuid.uuid4()
    trading_mode = "paper"

    # In-memory storage for test simulation
    entries: dict[str, PortfolioEntryModel] = {}
    positions: dict[str, PositionModel] = {}
    fills: dict[str, FillModel] = {}

    session = AsyncMock()

    def mock_add(obj):
        if isinstance(obj, PortfolioEntryModel):
            entries[obj.asset] = obj
        elif isinstance(obj, PositionModel):
            positions[obj.symbol] = obj
        elif isinstance(obj, FillModel):
            fills[obj.exchange_trade_id] = obj

    session.add = MagicMock(side_effect=mock_add)

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "portfolio_accounts" in stmt_str:
            acc = PortfolioAccountModel(id=account_id, name="Test Acc", trading_mode=trading_mode, created_at=datetime.now(timezone.utc))
            mock_res.scalar_one_or_none.return_value = acc
        elif "portfolio_entries" in stmt_str:
            mock_res.scalar_one_or_none.return_value = entries.get("USDT")
        elif "positions" in stmt_str:
            mock_res.scalar_one_or_none.return_value = positions.get("BTC/USDT")
        elif "fills" in stmt_str:
            mock_res.scalar_one_or_none.return_value = None
        return mock_res

    session.execute.side_effect = mock_execute

    # 1. Deposit 100,000 USDT
    entry = await engine.deposit(session, account_id, "USDT", Decimal("100000.0"), trading_mode)
    assert entry.balance == Decimal("100000.0")

    # 2. Process Buy Fill: 1.0 BTC @ 50,000 USDT, Fee = 50 USDT
    fill_buy1 = {
        "exchange_trade_id": "trade_buy_1",
        "symbol": "BTC/USDT",
        "side": "buy",
        "price": Decimal("50000.0"),
        "quantity": Decimal("1.0"),
        "fee": Decimal("50.0"),
        "fee_asset": "USDT",
        "trading_mode": trading_mode,
    }
    await engine.process_fill(session, fill_buy1, account_id=account_id)

    # Cash: 100,000 - (50,000 * 1.0 + 50) = 49,950 USDT
    assert entries["USDT"].balance == Decimal("49950.0")
    # Position: 1.0 BTC @ 50,000
    pos = positions["BTC/USDT"]
    assert pos.quantity == Decimal("1.0")
    assert pos.average_entry_price == Decimal("50000.0")
    assert pos.realized_pnl == Decimal("0")

    # 3. Process second Buy Fill: 1.0 BTC @ 60,000 USDT, Fee = 60 USDT
    fill_buy2 = {
        "exchange_trade_id": "trade_buy_2",
        "symbol": "BTC/USDT",
        "side": "buy",
        "price": Decimal("60000.0"),
        "quantity": Decimal("1.0"),
        "fee": Decimal("60.0"),
        "fee_asset": "USDT",
        "trading_mode": trading_mode,
    }
    await engine.process_fill(session, fill_buy2, account_id=account_id)

    # Cash: 49,950 - 60,060 = -10,110 (or subtracted properly)
    assert entries["USDT"].balance == Decimal("49950.0") - Decimal("60060.0")
    # Position: 2.0 BTC @ blended avg (50,000 + 60,000)/2 = 55,000
    assert pos.quantity == Decimal("2.0")
    assert pos.average_entry_price == Decimal("55000.0")

    # 4. Process Sell Fill: 1.0 BTC @ 70,000 USDT, Fee = 70 USDT
    fill_sell1 = {
        "exchange_trade_id": "trade_sell_1",
        "symbol": "BTC/USDT",
        "side": "sell",
        "price": Decimal("70000.0"),
        "quantity": Decimal("1.0"),
        "fee": Decimal("70.0"),
        "fee_asset": "USDT",
        "trading_mode": trading_mode,
    }
    await engine.process_fill(session, fill_sell1, account_id=account_id)

    # Realized PnL: (70,000 - 55,000) * 1.0 - 70 = 14,930 USDT
    assert pos.realized_pnl == Decimal("14930.0")
    # Remaining Position: 1.0 BTC @ 55,000
    assert pos.quantity == Decimal("1.0")
    assert pos.average_entry_price == Decimal("55000.0")


@pytest.mark.asyncio
async def test_portfolio_duplicate_fill_idempotent() -> None:
    engine = PortfolioEngine()
    session = AsyncMock()

    existing_fill = FillModel(
        id=uuid.uuid4(),
        order_id=uuid.uuid4(),
        exchange_trade_id="trade_dup_1",
        symbol="BTC/USDT",
        side="buy",
        quantity=Decimal("1.0"),
        price=Decimal("50000.0"),
        fee=Decimal("10.0"),
        fee_asset="USDT",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        executed_at=datetime.now(timezone.utc),
    )

    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = existing_fill
    session.execute.return_value = mock_res

    res = await engine.process_fill(
        session,
        {
            "exchange_trade_id": "trade_dup_1",
            "symbol": "BTC/USDT",
            "side": "buy",
            "price": Decimal("50000.0"),
            "quantity": Decimal("1.0"),
            "trading_mode": "paper",
        },
    )
    assert res == existing_fill
