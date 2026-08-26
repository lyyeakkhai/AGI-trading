from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock

from packages.database.models.portfolio import PortfolioEntryModel, PositionModel
from services.portfolio.snapshot import PortfolioSnapshotService


@pytest.mark.asyncio
async def test_create_snapshot_calculation() -> None:
    service = PortfolioSnapshotService()
    session = AsyncMock()
    account_id = uuid.uuid4()
    trading_mode = "paper"

    # Mock entry: 10,000 USDT
    mock_entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("10000.0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )

    # Mock positions: 2 BTC @ 50,000 avg entry; 10 ETH @ 3,000 avg entry
    pos_btc = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("2.0"),
        average_entry_price=Decimal("50000.0"),
        realized_pnl=Decimal("0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )
    pos_eth = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="ETH/USDT",
        quantity=Decimal("10.0"),
        average_entry_price=Decimal("3000.0"),
        realized_pnl=Decimal("0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "portfolio_entries" in stmt_str:
            mock_res.scalar_one_or_none.return_value = mock_entry
        elif "positions" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [pos_btc, pos_eth]
        return mock_res

    session.execute.side_effect = mock_execute
    session.add = MagicMock()

    market_prices = {
        "BTC/USDT": Decimal("55000.0"),  # +5,000 / BTC -> +10,000 unrealized, value = 110,000
        "ETH/USDT": Decimal("2800.0"),   # -200 / ETH -> -2,000 unrealized, value = 28,000
    }

    snapshot = await service.create_snapshot(
        session=session,
        account_id=account_id,
        trading_mode=trading_mode,
        market_prices=market_prices,
    )

    # Exposure: 2 * 55,000 + 10 * 2,800 = 110,000 + 28,000 = 138,000
    assert snapshot.exposure == Decimal("138000.0")
    # Unrealized PnL: +10,000 - 2,000 = +8,000
    assert snapshot.unrealized_pnl == Decimal("8000.0")
    # Cash: 10,000
    assert snapshot.cash_balance == Decimal("10000.0")
    # Total Equity: 10,000 + 138,000 = 148,000
    assert snapshot.total_equity == Decimal("148000.0")
    assert snapshot.trading_mode == "paper"
    assert session.add.called
