from __future__ import annotations

import contextlib
from datetime import datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_hermes_token
from packages.database.engine import get_db_session
from packages.database.models.audit_decision import AuditDecisionModel
from packages.database.models.portfolio import TradeModel
from packages.logging import get_logger

logger = get_logger("audit_tools")

decision_router = APIRouter(
    prefix="/api/v1/tools/decision",
    tags=["decision_tools"],
    dependencies=[Depends(verify_hermes_token)],
)

trade_router = APIRouter(
    prefix="/api/v1/tools/trade",
    tags=["trade_tools"],
    dependencies=[Depends(verify_hermes_token)],
)


# ── Pydantic Request Models ───────────────────────────────────────────────────


class CreateDecisionLogRequest(BaseModel):
    snapshot: dict[str, Any] = Field(..., description="Market data snapshot at decision time")
    drawings: list[dict[str, Any]] = Field(
        default_factory=list, description="Chart drawings and annotations state"
    )
    plan_id: str | None = Field(None, description="Optional associated TradingPlan UUID")
    risk_result: dict[str, Any] | None = Field(None, description="Risk engine evaluation output")
    execution_result: dict[str, Any] | None = Field(None, description="Execution adapter result")


# ── Decision Tools (Phase 8) ──────────────────────────────────────────────────


@decision_router.post("/log", status_code=status.HTTP_201_CREATED)
@decision_router.post("/create_log", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@decision_router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_decision_log(
    payload: CreateDecisionLogRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """decision.create_log: Persist complete reasoning trace snapshot to AuditDecisionModel."""
    parsed_plan_id = None
    if payload.plan_id:
        with contextlib.suppress(ValueError, TypeError):
            parsed_plan_id = uuid.UUID(str(payload.plan_id))

    record = AuditDecisionModel(
        id=uuid.uuid4(),
        plan_id=parsed_plan_id,
        snapshot=payload.snapshot,
        drawings=payload.drawings,
        risk_result=payload.risk_result,
        execution_result=payload.execution_result,
        created_at=datetime.now(timezone.utc),
    )
    session.add(record)
    await session.commit()

    return {
        "id": str(record.id),
        "plan_id": str(record.plan_id) if record.plan_id else None,
        "snapshot": record.snapshot,
        "drawings": record.drawings,
        "risk_result": record.risk_result,
        "execution_result": record.execution_result,
        "created_at": record.created_at.isoformat(),
    }


@decision_router.get("/history")
@decision_router.get("", include_in_schema=False)
async def get_decision_history(
    plan_id: str | None = Query(None, description="Optional TradingPlan ID filter"),
    limit: int = Query(20, ge=1, le=100, description="Max records to retrieve"),
    since: datetime | None = Query(None, description="Retrieve logs created after timestamp"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """decision.get_history: Query audit decision history."""
    stmt = select(AuditDecisionModel)

    if plan_id:
        with contextlib.suppress(ValueError):
            parsed_uuid = uuid.UUID(plan_id)
            stmt = stmt.where(AuditDecisionModel.plan_id == parsed_uuid)

    if since:
        stmt = stmt.where(AuditDecisionModel.created_at >= since)

    stmt = stmt.order_by(AuditDecisionModel.created_at.desc()).limit(limit)
    records = list((await session.execute(stmt)).scalars().all())

    return {
        "decisions": [
            {
                "id": str(d.id),
                "plan_id": str(d.plan_id) if d.plan_id else None,
                "snapshot": d.snapshot,
                "drawings": d.drawings,
                "risk_result": d.risk_result,
                "execution_result": d.execution_result,
                "created_at": d.created_at.isoformat(),
            }
            for d in records
        ],
        "count": len(records),
    }


# ── Trade History Tools (Phase 8) ─────────────────────────────────────────────


@trade_router.get("/history")
@trade_router.get("", include_in_schema=False)
async def get_trade_history(
    symbol: str | None = Query(None, description="Optional symbol filter, e.g. BTC/USDT"),
    trading_mode: str = Query("paper", description="Trading mode: paper, testnet, live"),
    limit: int = Query(50, ge=1, le=200, description="Max trades to retrieve"),
    since: datetime | None = Query(None, description="Retrieve trades opened after timestamp"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """trade.get_history: Query persistent trade execution ledger history."""
    stmt = select(TradeModel).where(TradeModel.trading_mode == trading_mode)

    if symbol:
        stmt = stmt.where(TradeModel.symbol == symbol)

    if since:
        stmt = stmt.where(TradeModel.opened_at >= since)

    stmt = stmt.order_by(TradeModel.opened_at.desc()).limit(limit)
    trades = list((await session.execute(stmt)).scalars().all())

    return {
        "trading_mode": trading_mode,
        "trades": [
            {
                "id": str(t.id),
                "account_id": str(t.account_id),
                "symbol": t.symbol,
                "side": t.side,
                "quantity": str(t.quantity),
                "entry_price": str(t.entry_price),
                "exit_price": str(t.exit_price) if t.exit_price is not None else None,
                "realized_pnl": str(t.realized_pnl) if t.realized_pnl is not None else None,
                "trading_mode": t.trading_mode,
                "correlation_id": str(t.correlation_id),
                "opened_at": t.opened_at.isoformat(),
                "closed_at": t.closed_at.isoformat() if t.closed_at else None,
            }
            for t in trades
        ],
        "count": len(trades),
    }
