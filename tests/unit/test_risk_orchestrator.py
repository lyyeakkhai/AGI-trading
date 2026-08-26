from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from packages.database.models.relational import (
    ExecutionRequestModel,
    OwnerApprovalModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
    RiskConfigVersionModel,
    SystemConfigModel,
    TradeProposalModel,
)
from packages.domain.enums import ApprovalStatus, ExecutionStatus
from packages.risk.models import RiskConfig, RiskDecisionType, RiskRuleCode
from services.risk.orchestrator import RiskOrchestrator
from services.risk.repository import RiskRepository


@pytest.fixture
def mock_session() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def test_config() -> RiskConfig:
    return RiskConfig(
        spot_only=True,
        leverage_enabled=False,
        max_risk_per_trade_percent=Decimal("1.0"),
        max_drawdown_percent=Decimal("0.10"),
        max_concentration_percent=Decimal("0.30"),
        max_open_positions=5,
        min_reward_risk_ratio=Decimal("1.5"),
        market_data_max_age_seconds=60,
        min_notional=Decimal("10.0"),
    )


async def test_evaluate_proposal_approved(mock_session: AsyncMock, test_config: RiskConfig) -> None:
    proposal_id = uuid.uuid4()
    correlation_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    proposal = TradeProposalModel(
        id=proposal_id,
        symbol="BTC/USDT",
        side="buy",
        order_type="limit",
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        rationale="Momentum",
        trading_mode="paper",
        correlation_id=correlation_id,
        created_at=now,
        expires_at=now,
    )

    mock_repo = MagicMock(spec=RiskRepository)
    mock_repo.get_latest_config = AsyncMock(return_value=(1, test_config))

    orchestrator = RiskOrchestrator(repository=mock_repo)

    # Mock DB queries inside _build_risk_state and evaluate_proposal
    with patch.object(orchestrator, "_build_risk_state") as mock_state:
        from packages.risk.models import RiskState
        mock_state.return_value = RiskState(
            cash_balance=Decimal("10000.00"),
            total_equity=Decimal("10000.00"),
            peak_equity=Decimal("10000.00"),
            open_positions={},
            market_price=Decimal("50000.00"),
            market_data_timestamp=now,
            kill_switch_active=False,
        )

        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = proposal
        mock_session.execute.return_value = mock_res

        decision_record = await orchestrator.evaluate_proposal(
            session=mock_session,
            proposal_id=proposal_id,
            correlation_id=correlation_id,
            trading_mode="paper",
        )

        assert decision_record.decision == RiskDecisionType.APPROVED.value
        assert decision_record.proposal_id == proposal_id
        assert decision_record.correlation_id == correlation_id
        mock_session.add.assert_called()
        mock_session.flush.assert_called()


async def test_evaluate_proposal_modified_in_place(mock_session: AsyncMock, test_config: RiskConfig) -> None:
    proposal_id = uuid.uuid4()
    correlation_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    # Requested 0.5 BTC ($25,000 > $10,000 cash)
    proposal = TradeProposalModel(
        id=proposal_id,
        symbol="BTC/USDT",
        side="buy",
        order_type="limit",
        quantity=Decimal("0.500"),
        limit_price=Decimal("50000.00"),
        rationale="Aggressive sizing",
        trading_mode="paper",
        correlation_id=correlation_id,
        created_at=now,
        expires_at=now,
    )

    mock_repo = MagicMock(spec=RiskRepository)
    mock_repo.get_latest_config = AsyncMock(return_value=(1, test_config))

    orchestrator = RiskOrchestrator(repository=mock_repo)

    with patch.object(orchestrator, "_build_risk_state") as mock_state:
        from packages.risk.models import RiskState
        mock_state.return_value = RiskState(
            cash_balance=Decimal("10000.00"),
            total_equity=Decimal("10000.00"),
            peak_equity=Decimal("10000.00"),
            open_positions={},
            market_price=Decimal("50000.00"),
            market_data_timestamp=now,
            kill_switch_active=False,
        )

        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = proposal
        mock_session.execute.return_value = mock_res

        decision_record = await orchestrator.evaluate_proposal(
            session=mock_session,
            proposal_id=proposal_id,
            correlation_id=correlation_id,
            trading_mode="paper",
        )

        assert decision_record.decision == RiskDecisionType.MODIFIED.value
        # In-place quantity modification checked
        assert proposal.quantity < Decimal("0.500")


async def test_evaluate_approval_rejection_invalidates_approval(
    mock_session: AsyncMock, test_config: RiskConfig
) -> None:
    proposal_id = uuid.uuid4()
    approval_id = uuid.uuid4()
    correlation_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    approval = OwnerApprovalModel(
        id=approval_id,
        proposal_id=proposal_id,
        status=ApprovalStatus.APPROVED.value,
        trading_mode="paper",
        correlation_id=correlation_id,
        created_at=now,
        expires_at=now,
    )

    proposal = TradeProposalModel(
        id=proposal_id,
        symbol="BTC/USDT",
        side="buy",
        order_type="limit",
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        rationale="Momentum",
        trading_mode="paper",
        correlation_id=correlation_id,
        created_at=now,
        expires_at=now,
    )

    mock_repo = MagicMock(spec=RiskRepository)
    mock_repo.get_latest_config = AsyncMock(return_value=(1, test_config))

    orchestrator = RiskOrchestrator(repository=mock_repo)

    # State with kill switch active at approval time
    with patch.object(orchestrator, "_build_risk_state") as mock_state:
        from packages.risk.models import RiskState
        mock_state.return_value = RiskState(
            cash_balance=Decimal("10000.00"),
            total_equity=Decimal("10000.00"),
            peak_equity=Decimal("10000.00"),
            open_positions={},
            market_price=Decimal("50000.00"),
            market_data_timestamp=now,
            kill_switch_active=True,
        )

        def mock_execute_side_effect(stmt: object) -> MagicMock:
            res = MagicMock()
            stmt_str = str(stmt)
            if "owner_approvals" in stmt_str:
                res.scalar_one_or_none.return_value = approval
            else:
                res.scalar_one_or_none.return_value = proposal
            return res

        mock_session.execute.side_effect = mock_execute_side_effect

        decision_record = await orchestrator.evaluate_approval(
            session=mock_session,
            proposal_id=proposal_id,
            approval_id=approval_id,
            correlation_id=correlation_id,
            trading_mode="paper",
        )

        assert decision_record.decision == RiskDecisionType.REJECTED.value
        assert approval.status == ApprovalStatus.REJECTED.value


async def test_evaluate_pre_submit_fail_closed_on_error(mock_session: AsyncMock) -> None:
    exec_id = uuid.uuid4()
    correlation_id = uuid.uuid4()

    orchestrator = RiskOrchestrator()

    # DB throws unexpected error
    mock_session.execute.side_effect = RuntimeError("DB connection dropped")

    decision_record = await orchestrator.evaluate_pre_submit(
        session=mock_session,
        execution_request_id=exec_id,
        correlation_id=correlation_id,
        trading_mode="paper",
    )

    assert decision_record.decision == RiskDecisionType.REJECTED.value
    assert RiskRuleCode.RULE_ENGINE_ERROR.value in decision_record.rule_codes
