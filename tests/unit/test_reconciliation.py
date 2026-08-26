from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock

from packages.database.models.portfolio import PortfolioEntryModel, PositionModel
from packages.database.models.system import SystemConfigModel
from services.reconciliation.worker import ReconciliationEngine


@pytest.mark.asyncio
async def test_reconciliation_detects_mismatch_and_blocks() -> None:
    engine = ReconciliationEngine()
    session = AsyncMock()
    account_id = uuid.uuid4()
    trading_mode = "paper"

    # DB state: 10,000 USDT cash, 2.0 BTC position
    entry_usdt = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("10000.0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )
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

    system_config_store: dict[str, SystemConfigModel] = {}

    def mock_add(obj):
        if isinstance(obj, SystemConfigModel):
            system_config_store[obj.key] = obj

    session.add = MagicMock(side_effect=mock_add)

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "system_config" in stmt_str:
            mock_res.scalar_one_or_none.return_value = system_config_store.get(engine.SYSTEM_CONFIG_KEY)
        elif "portfolio_entries" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [entry_usdt]
        elif "positions" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [pos_btc]
        return mock_res

    session.execute.side_effect = mock_execute

    # Exchange reports: 9,000 USDT (1,000 difference!), 1.0 BTC (1.0 difference!)
    exchange_balances = {"USDT": Decimal("9000.0")}
    exchange_positions = {"BTC/USDT": Decimal("1.0")}

    run = await engine.run_reconciliation(
        session=session,
        account_id=account_id,
        trading_mode=trading_mode,
        exchange_balances=exchange_balances,
        exchange_positions=exchange_positions,
    )

    assert run.divergence_count == 2
    assert run.is_blocked is True
    assert run.completed_at is not None

    # Check is_blocked
    is_blocked = await engine.is_blocked(session)
    assert is_blocked is True

    # Unblock
    await engine.unblock(session, actor="admin", reason="Manual inspection verified")
    assert await engine.is_blocked(session) is False


@pytest.mark.asyncio
async def test_reconciliation_clean_run_no_blocking() -> None:
    engine = ReconciliationEngine()
    session = AsyncMock()
    account_id = uuid.uuid4()
    trading_mode = "paper"

    entry_usdt = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("10000.0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )
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

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "system_config" in stmt_str:
            mock_res.scalar_one_or_none.return_value = None
        elif "portfolio_entries" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [entry_usdt]
        elif "positions" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [pos_btc]
        return mock_res

    session.execute.side_effect = mock_execute
    session.add = MagicMock()

    # Exact match
    run = await engine.run_reconciliation(
        session=session,
        account_id=account_id,
        trading_mode=trading_mode,
        exchange_balances={"USDT": Decimal("10000.0")},
        exchange_positions={"BTC/USDT": Decimal("2.0")},
    )

    assert run.divergence_count == 0
    assert run.is_blocked is False
    assert await engine.is_blocked(session) is False
