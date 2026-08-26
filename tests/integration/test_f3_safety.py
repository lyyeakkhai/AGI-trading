from __future__ import annotations

from datetime import datetime, timedelta, timezone
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
from packages.database.models.relational import (
    ExecutionRequestModel,
    OwnerApprovalModel,
)
from packages.database.models.system import SystemConfigModel
from packages.domain.execution import ExecutionState, ExecutionStateMachine
from packages.domain.idempotency import IdempotencyService
from packages.exchange.models import Ticker
from services.audit.logger import log_financial_event
from services.execution.approvals import (
    ApprovalAlreadyConsumedError,
    ApprovalExpiredError,
    OwnerApprovalService,
)
from services.execution.paper import PaperExecutionAdapter
from services.portfolio.engine import PortfolioEngine
from services.portfolio.snapshot import PortfolioSnapshotService
from services.reconciliation.worker import ReconciliationEngine


@pytest.mark.asyncio
async def test_f3_end_to_end_paper_execution_pipeline() -> None:
    """E2E test combining Idempotency, Approval TTL, Paper Execution, Atomic Ledger, Snapshots, and Reconciliation."""
    account_id = uuid.uuid4()
    proposal_id = uuid.uuid4()
    correlation_id = uuid.uuid4()
    trading_mode = "paper"
    symbol = "BTC/USDT"

    # Services
    idempotency_service = IdempotencyService()
    approval_service = OwnerApprovalService()
    portfolio_engine = PortfolioEngine()
    snapshot_service = PortfolioSnapshotService()
    reconciliation_engine = ReconciliationEngine()
    state_machine = ExecutionStateMachine()

    # In-memory storage for test isolation
    db_store: dict[str, Any] = {
        "entries": {},
        "positions": {},
        "fills": {},
        "approvals": {},
        "config": {},
    }

    session = AsyncMock()

    def mock_add(obj):
        if isinstance(obj, PortfolioEntryModel):
            db_store["entries"][obj.asset] = obj
        elif isinstance(obj, PositionModel):
            db_store["positions"][obj.symbol] = obj
        elif isinstance(obj, FillModel):
            db_store["fills"][obj.exchange_trade_id] = obj
        elif isinstance(obj, OwnerApprovalModel):
            db_store["approvals"][obj.id] = obj
        elif isinstance(obj, SystemConfigModel):
            db_store["config"][obj.key] = obj

    session.add = MagicMock(side_effect=mock_add)

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "portfolio_accounts" in stmt_str:
            acc = PortfolioAccountModel(
                id=account_id,
                name="Paper Account",
                trading_mode=trading_mode,
                created_at=datetime.now(timezone.utc),
            )
            mock_res.scalar_one_or_none.return_value = acc
        elif "portfolio_entries" in stmt_str:
            mock_res.scalar_one_or_none.return_value = db_store["entries"].get("USDT")
            mock_res.scalars.return_value.all.return_value = list(db_store["entries"].values())
        elif "positions" in stmt_str:
            mock_res.scalar_one_or_none.return_value = db_store["positions"].get(symbol)
            mock_res.scalars.return_value.all.return_value = list(db_store["positions"].values())
        elif "owner_approvals" in stmt_str:
            mock_res.scalar_one_or_none.return_value = next(iter(db_store["approvals"].values()), None)
        elif "system_config" in stmt_str:
            mock_res.scalar_one_or_none.return_value = db_store["config"].get(reconciliation_engine.SYSTEM_CONFIG_KEY)
        elif "fills" in stmt_str:
            mock_res.scalar_one_or_none.return_value = None
        return mock_res

    session.execute.side_effect = mock_execute

    # 1. Seed initial capital: 100,000 USDT
    await portfolio_engine.deposit(session, account_id, "USDT", Decimal("100000.0"), trading_mode)

    # 2. Idempotency Key Generation
    idem_key = idempotency_service.generate_key(str(proposal_id), "execute_market_buy")
    assert len(idem_key) == 64

    # 3. Create Owner Approval with 300s TTL
    approval = await approval_service.create_approval(
        session=session,
        proposal_id=proposal_id,
        trading_mode=trading_mode,
        ttl_seconds=300,
        correlation_id=correlation_id,
    )
    assert approval.status == "approved"
    assert approval.consumed_at is None

    # 4. State Machine Transition: PENDING -> SUBMITTING -> SUBMITTED
    state = state_machine.transition(ExecutionState.PENDING, ExecutionState.SUBMITTING)
    state = state_machine.transition(state, ExecutionState.SUBMITTED)
    assert state == ExecutionState.SUBMITTED

    # 5. Paper Execution against live ticker
    mock_md = AsyncMock()
    mock_md.get_ticker.return_value = Ticker(
        symbol=symbol,
        bid=Decimal("50000.0"),
        ask=Decimal("50010.0"),
        last=Decimal("50005.0"),
        volume=Decimal("1000.0"),
        timestamp=datetime.now(timezone.utc),
    )
    paper_adapter = PaperExecutionAdapter(
        market_data_adapter=mock_md,
        slippage=Decimal("0.0005"),
        fee_rate=Decimal("0.001"),
    )
    exec_result = await paper_adapter.execute_market_order(
        symbol=symbol,
        side="buy",
        quantity=Decimal("1.0"),
    )
    # Price = 50010 * 1.0005 = 50035.005
    assert exec_result["price"] == Decimal("50010.0") * Decimal("1.0005")
    assert exec_result["fee"] == exec_result["price"] * Decimal("1.0") * Decimal("0.001")

    # 6. Validate and Consume Owner Approval
    consumed_approval = await approval_service.validate_and_consume(
        session=session,
        approval_id=approval.id,
        proposal_id=proposal_id,
    )
    assert consumed_approval.status == "consumed"
    assert consumed_approval.consumed_at is not None

    # Verify single-use: cannot consume again!
    with pytest.raises(ApprovalAlreadyConsumedError):
        await approval_service.validate_and_consume(
            session=session,
            approval_id=approval.id,
            proposal_id=proposal_id,
        )

    # 7. Atomic Portfolio Ledger Update
    fill_record = await portfolio_engine.process_fill(
        session=session,
        fill_data={
            "exchange_trade_id": exec_result["exchange_trade_id"],
            "symbol": symbol,
            "side": "buy",
            "price": exec_result["price"],
            "quantity": exec_result["quantity"],
            "fee": exec_result["fee"],
            "fee_asset": exec_result["fee_asset"],
            "trading_mode": trading_mode,
            "correlation_id": correlation_id,
        },
        account_id=account_id,
    )
    assert fill_record.symbol == symbol

    # 8. State Machine: SUBMITTED -> FILLED
    state = state_machine.transition(state, ExecutionState.FILLED)
    assert state_machine.is_terminal(state) is True

    # 9. Audit Event Logging
    audit_record = await log_financial_event(
        session=session,
        actor="execution_engine",
        action="order_filled",
        entity_type="execution_request",
        entity_id=proposal_id,
        trading_mode=trading_mode,
        payload={"fill_id": str(fill_record.id), "price": str(exec_result["price"])},
        correlation_id=correlation_id,
    )
    assert audit_record.action == "order_filled"

    # 10. Portfolio Snapshot to TimescaleDB
    snapshot = await snapshot_service.create_snapshot(
        session=session,
        account_id=account_id,
        trading_mode=trading_mode,
        market_prices={symbol: Decimal("52000.0")},
    )
    # 1 BTC bought at ~50035.005, now valued at 52,000 -> unrealized gain ~1,964.995
    assert snapshot.exposure == Decimal("52000.0")
    assert snapshot.unrealized_pnl == (Decimal("52000.0") - exec_result["price"]) * Decimal("1.0")

    # 11. Reconciliation Engine Check: Verify healthy state
    rec_run = await reconciliation_engine.run_reconciliation(
        session=session,
        account_id=account_id,
        trading_mode=trading_mode,
        exchange_balances={"USDT": db_store["entries"]["USDT"].balance},
        exchange_positions={symbol: Decimal("1.0")},
    )
    assert rec_run.divergence_count == 0
    assert rec_run.is_blocked is False
    assert await reconciliation_engine.is_blocked(session) is False


@pytest.mark.asyncio
async def test_reconciliation_divergence_blocks_and_unblocks() -> None:
    """Safety test: Unexpected balance discrepancy halts trading until manual unblock."""
    engine = ReconciliationEngine()
    session = AsyncMock()
    account_id = uuid.uuid4()
    trading_mode = "paper"

    db_config: dict[str, SystemConfigModel] = {}

    def mock_add(obj):
        if isinstance(obj, SystemConfigModel):
            db_config[obj.key] = obj

    session.add = MagicMock(side_effect=mock_add)

    entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("100000.0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "system_config" in stmt_str:
            mock_res.scalar_one_or_none.return_value = db_config.get(engine.SYSTEM_CONFIG_KEY)
        elif "portfolio_entries" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [entry]
        elif "positions" in stmt_str:
            mock_res.scalars.return_value.all.return_value = []
        return mock_res

    session.execute.side_effect = mock_execute

    # Exchange reports 80,000 USDT (20,000 missing!)
    run = await engine.run_reconciliation(
        session=session,
        account_id=account_id,
        trading_mode=trading_mode,
        exchange_balances={"USDT": Decimal("80000.0")},
        exchange_positions={},
    )

    assert run.divergence_count == 1
    assert run.is_blocked is True
    assert await engine.is_blocked(session) is True

    # Manual unblock
    await engine.unblock(session, actor="risk_officer_bob", reason="Investigated missing funds, adjustment posted")
    assert await engine.is_blocked(session) is False
