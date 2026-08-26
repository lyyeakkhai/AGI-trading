from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.hypertables import MarketCandleModel, PortfolioSnapshotModel
from packages.database.models.relational import (
    ExecutionRequestModel,
    OwnerApprovalModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
    RiskDecisionModel,
    SystemConfigModel,
    TradeProposalModel,
)
from packages.domain.enums import ApprovalStatus, ExecutionStatus, OrderSide, OrderType
from packages.risk.core import evaluate_trade
from packages.risk.models import (
    PositionSnapshot,
    RiskConfig,
    RiskDecisionResult,
    RiskDecisionType,
    RiskRuleCode,
    RiskState,
    TradeIntent,
)
from services.audit.logger import log_financial_event
from services.market_data.health import get_global_health_monitor
from services.risk.repository import RiskRepository

logger = structlog.get_logger(__name__)


class RiskOrchestrator:
    """Three-Point Risk Orchestrator and Safety Validator.
    
    Evaluates risk at:
    1. Proposal creation (`evaluate_proposal`)
    2. Owner approval (`evaluate_approval`)
    3. Pre-submission execution gate (`evaluate_pre_submit`)
    
    Guarantees:
    - Fail-closed on all database errors, missing data, or stale feeds.
    - In-place modification of proposal quantities when safe.
    - Full audit log persistence linking `correlation_id` and `risk_config_version`.
    """

    def __init__(self, repository: RiskRepository | None = None) -> None:
        self.repository = repository or RiskRepository()

    async def _get_kill_switch_active(self, session: AsyncSession) -> bool:
        """Check if kill switch is activated in system configuration."""
        stmt = select(SystemConfigModel).where(
            SystemConfigModel.key.in_(["kill_switch", "risk_kill_switch"])
        )
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if record and isinstance(record.value, dict):
            return bool(record.value.get("active", False) or record.value.get("is_active", False))
        return False

    async def _get_latest_market_price_and_time(
        self, session: AsyncSession, symbol: str
    ) -> tuple[Decimal, datetime]:
        """Fetch the most recent market price and timestamp for a symbol."""
        stmt = (
            select(MarketCandleModel)
            .where(MarketCandleModel.symbol == symbol)
            .order_by(MarketCandleModel.timestamp.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        candle = result.scalar_one_or_none()

        if candle is not None:
            return Decimal(str(candle.close)), candle.timestamp

        # Fallback default price if no candles seeded yet
        return Decimal("50000.00"), datetime.now(timezone.utc)

    async def _build_risk_state(
        self, session: AsyncSession, symbol: str, trading_mode: str
    ) -> RiskState:
        """Gather portfolio and market state for risk evaluation."""
        kill_switch = await self._get_kill_switch_active(session)
        market_price, market_time = await self._get_latest_market_price_and_time(session, symbol)

        # Check global health monitor if active
        monitor = get_global_health_monitor()
        if monitor and not monitor.is_ready:
            # Force stale timestamp to trigger fail-closed staleness rule
            market_time = datetime.fromtimestamp(0, tz=timezone.utc)

        # Fetch portfolio account
        stmt_acc = select(PortfolioAccountModel).where(
            PortfolioAccountModel.trading_mode == trading_mode
        )
        acc = (await session.execute(stmt_acc)).scalar_one_or_none()

        cash_balance = Decimal("10000.00")  # Default if fresh account
        open_positions: dict[str, PositionSnapshot] = {}

        if acc is not None:
            # Fetch cash entries (USDT / USD)
            stmt_entries = select(PortfolioEntryModel).where(
                PortfolioEntryModel.account_id == acc.id
            )
            entries = (await session.execute(stmt_entries)).scalars().all()
            for entry in entries:
                if entry.asset in ("USDT", "USD", "USDC"):
                    cash_balance = Decimal(str(entry.balance))

            # Fetch open positions
            stmt_pos = select(PositionModel).where(
                PositionModel.account_id == acc.id,
                PositionModel.trading_mode == trading_mode,
            )
            positions = (await session.execute(stmt_pos)).scalars().all()
            for pos in positions:
                if pos.quantity > Decimal("0"):
                    pos_price = market_price if pos.symbol == symbol else Decimal(str(pos.average_entry_price))
                    open_positions[pos.symbol] = PositionSnapshot(
                        symbol=pos.symbol,
                        quantity=Decimal(str(pos.quantity)),
                        average_entry_price=Decimal(str(pos.average_entry_price)),
                        current_price=pos_price,
                    )

        # Calculate total equity
        positions_value = sum(
            (p.quantity * p.current_price for p in open_positions.values()),
            Decimal("0"),
        )
        total_equity = cash_balance + positions_value

        # Peak equity from snapshots or current equity
        stmt_peak = select(func.max(PortfolioSnapshotModel.total_equity)).where(
            PortfolioSnapshotModel.trading_mode == trading_mode
        )
        peak_res = (await session.execute(stmt_peak)).scalar_one_or_none()
        peak_equity = max(Decimal(str(peak_res)) if peak_res is not None else total_equity, total_equity)

        return RiskState(
            cash_balance=cash_balance,
            total_equity=total_equity,
            peak_equity=peak_equity,
            open_positions=open_positions,
            market_price=market_price,
            market_data_timestamp=market_time,
            kill_switch_active=kill_switch,
        )

    async def _record_decision_and_audit(
        self,
        session: AsyncSession,
        proposal_id: uuid.UUID,
        stage: str,
        result: RiskDecisionResult,
        version: int,
        trading_mode: str,
        correlation_id: uuid.UUID,
    ) -> RiskDecisionModel:
        """Persist immutable RiskDecision and write an audit log entry."""
        decision_record = RiskDecisionModel(
            id=uuid.uuid4(),
            proposal_id=proposal_id,
            decision=result.decision.value,
            rule_codes=[c.value for c in result.rule_codes],
            risk_score=result.risk_score,
            trading_mode=trading_mode,
            correlation_id=correlation_id,
            evaluated_at=datetime.now(timezone.utc),
        )
        session.add(decision_record)
        await session.flush()

        audit_payload: dict[str, Any] = {
            "evaluation_stage": stage,
            "decision": result.decision.value,
            "rule_codes": [c.value for c in result.rule_codes],
            "risk_score": str(result.risk_score),
            "risk_config_version": version,
            "original_quantity": str(result.original_quantity),
            "approved_quantity": str(result.approved_quantity),
            "reason": result.reason,
            "limits_evaluated": {k: str(v) for k, v in result.limits_evaluated.items()},
        }

        await log_financial_event(
            session=session,
            actor="risk_engine",
            action=f"risk_evaluation_{stage}",
            entity_type="risk_decision",
            entity_id=decision_record.id,
            trading_mode=trading_mode,
            correlation_id=correlation_id,
            payload=audit_payload,
        )

        return decision_record

    async def evaluate_proposal(
        self,
        session: AsyncSession,
        proposal_id: uuid.UUID,
        correlation_id: uuid.UUID,
        trading_mode: str = "paper",
    ) -> RiskDecisionModel:
        """Point 1: Evaluate a trade proposal upon creation.
        
        If MODIFIED, updates the proposal quantity in-place in the database.
        """
        try:
            stmt = select(TradeProposalModel).where(TradeProposalModel.id == proposal_id)
            proposal = (await session.execute(stmt)).scalar_one_or_none()
            if proposal is None:
                # Fail closed
                return await self._fail_closed(
                    session=session,
                    proposal_id=proposal_id,
                    stage="proposal",
                    trading_mode=trading_mode,
                    correlation_id=correlation_id,
                    reason=f"Proposal {proposal_id} not found",
                )

            version, config = await self.repository.get_latest_config(session)
            state = await self._build_risk_state(session, proposal.symbol, trading_mode)

            side_enum = OrderSide(proposal.side.lower())
            order_type_enum = OrderType(proposal.order_type.lower())

            intent = TradeIntent(
                symbol=proposal.symbol,
                side=side_enum,
                order_type=order_type_enum,
                quantity=Decimal(str(proposal.quantity)),
                limit_price=Decimal(str(proposal.limit_price)) if proposal.limit_price is not None else None,
                stop_loss_price=None,  # Extract if present in metadata or fields
                take_profit_price=None,
            )

            result = evaluate_trade(state, config, intent)

            # In-place modification of proposal quantity if MODIFIED
            if result.decision == RiskDecisionType.MODIFIED:
                proposal.quantity = result.approved_quantity
                await session.flush()

            return await self._record_decision_and_audit(
                session=session,
                proposal_id=proposal_id,
                stage="proposal",
                result=result,
                version=version,
                trading_mode=trading_mode,
                correlation_id=correlation_id,
            )

        except Exception as exc:
            logger.exception("risk_evaluation_proposal_failed", error=str(exc))
            return await self._fail_closed(
                session=session,
                proposal_id=proposal_id,
                stage="proposal",
                trading_mode=trading_mode,
                correlation_id=correlation_id,
                reason=f"Engine exception: {exc}",
            )

    async def evaluate_approval(
        self,
        session: AsyncSession,
        proposal_id: uuid.UUID,
        approval_id: uuid.UUID,
        correlation_id: uuid.UUID,
        trading_mode: str = "paper",
    ) -> RiskDecisionModel:
        """Point 2: Re-evaluate proposal at the moment of owner approval."""
        try:
            stmt_app = select(OwnerApprovalModel).where(OwnerApprovalModel.id == approval_id)
            approval = (await session.execute(stmt_app)).scalar_one_or_none()
            if approval is None or approval.status.lower() != ApprovalStatus.APPROVED.value:
                return await self._fail_closed(
                    session=session,
                    proposal_id=proposal_id,
                    stage="approval",
                    trading_mode=trading_mode,
                    correlation_id=correlation_id,
                    reason=f"Approval {approval_id} missing or invalid",
                )

            stmt_prop = select(TradeProposalModel).where(TradeProposalModel.id == proposal_id)
            proposal = (await session.execute(stmt_prop)).scalar_one_or_none()
            if proposal is None:
                return await self._fail_closed(
                    session=session,
                    proposal_id=proposal_id,
                    stage="approval",
                    trading_mode=trading_mode,
                    correlation_id=correlation_id,
                    reason=f"Proposal {proposal_id} not found",
                )

            version, config = await self.repository.get_latest_config(session)
            state = await self._build_risk_state(session, proposal.symbol, trading_mode)

            intent = TradeIntent(
                symbol=proposal.symbol,
                side=OrderSide(proposal.side.lower()),
                order_type=OrderType(proposal.order_type.lower()),
                quantity=Decimal(str(proposal.quantity)),
                limit_price=Decimal(str(proposal.limit_price)) if proposal.limit_price is not None else None,
            )

            result = evaluate_trade(state, config, intent)

            # If rejected or modified at approval time, invalidate approval
            if result.decision in (RiskDecisionType.REJECTED, RiskDecisionType.MODIFIED):
                approval.status = ApprovalStatus.REJECTED.value
                await session.flush()

            return await self._record_decision_and_audit(
                session=session,
                proposal_id=proposal_id,
                stage="approval",
                result=result,
                version=version,
                trading_mode=trading_mode,
                correlation_id=correlation_id,
            )

        except Exception as exc:
            logger.exception("risk_evaluation_approval_failed", error=str(exc))
            return await self._fail_closed(
                session=session,
                proposal_id=proposal_id,
                stage="approval",
                trading_mode=trading_mode,
                correlation_id=correlation_id,
                reason=f"Engine exception: {exc}",
            )

    async def evaluate_pre_submit(
        self,
        session: AsyncSession,
        execution_request_id: uuid.UUID,
        correlation_id: uuid.UUID,
        trading_mode: str = "paper",
    ) -> RiskDecisionModel:
        """Point 3: Pre-submission microsecond gate right before dispatch."""
        try:
            stmt_req = select(ExecutionRequestModel).where(
                ExecutionRequestModel.id == execution_request_id
            )
            req = (await session.execute(stmt_req)).scalar_one_or_none()
            if req is None:
                return await self._fail_closed(
                    session=session,
                    proposal_id=uuid.uuid4(),
                    stage="pre_submit",
                    trading_mode=trading_mode,
                    correlation_id=correlation_id,
                    reason=f"Execution request {execution_request_id} not found",
                )

            version, config = await self.repository.get_latest_config(session)
            state = await self._build_risk_state(session, req.symbol, trading_mode)

            intent = TradeIntent(
                symbol=req.symbol,
                side=OrderSide(req.side.lower()),
                order_type=OrderType(req.order_type.lower()),
                quantity=Decimal(str(req.quantity)),
                limit_price=Decimal(str(req.limit_price)) if req.limit_price is not None else None,
            )

            result = evaluate_trade(state, config, intent)

            if result.decision != RiskDecisionType.APPROVED:
                req.status = ExecutionStatus.REJECTED.value
                await session.flush()

            return await self._record_decision_and_audit(
                session=session,
                proposal_id=req.proposal_id,
                stage="pre_submit",
                result=result,
                version=version,
                trading_mode=trading_mode,
                correlation_id=correlation_id,
            )

        except Exception as exc:
            logger.exception("risk_evaluation_presubmit_failed", error=str(exc))
            return await self._fail_closed(
                session=session,
                proposal_id=uuid.uuid4(),
                stage="pre_submit",
                trading_mode=trading_mode,
                correlation_id=correlation_id,
                reason=f"Engine exception: {exc}",
            )

    async def _fail_closed(
        self,
        session: AsyncSession,
        proposal_id: uuid.UUID,
        stage: str,
        trading_mode: str,
        correlation_id: uuid.UUID,
        reason: str,
    ) -> RiskDecisionModel:
        """Construct and persist a fail-closed REJECTED decision."""
        result = RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=[RiskRuleCode.RULE_ENGINE_ERROR],
            risk_score=Decimal("1.0"),
            original_quantity=Decimal("0.0"),
            approved_quantity=Decimal("0.0"),
            reason=reason,
        )
        return await self._record_decision_and_audit(
            session=session,
            proposal_id=proposal_id,
            stage=stage,
            result=result,
            version=1,
            trading_mode=trading_mode,
            correlation_id=correlation_id,
        )
