from __future__ import annotations

from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import get_settings
from packages.database import get_engine, get_session_factory
from packages.database.models.system import ReconciliationRunModel
from services.portfolio.engine import PortfolioEngine
from services.reconciliation.worker import ReconciliationEngine

router = APIRouter(prefix="/api/v1/reconciliation", tags=["reconciliation"])
reconciliation_engine = ReconciliationEngine()
portfolio_engine = PortfolioEngine()


async def get_db_session() -> Any:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    async with session_factory() as session:
        yield session


class UnblockRequest(BaseModel):
    actor: str
    reason: str


class RunReconciliationRequest(BaseModel):
    trading_mode: str = "paper"
    account_id: uuid.UUID | None = None
    trigger: str = "manual"


@router.get("/status")
async def get_status(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Get the current reconciliation blocked status and recent run summary."""
    blocked = await reconciliation_engine.is_blocked(session)

    # Get latest run
    stmt = (
        select(ReconciliationRunModel)
        .order_by(ReconciliationRunModel.started_at.desc())
        .limit(1)
    )
    latest_run = (await session.execute(stmt)).scalar_one_or_none()

    return {
        "blocked": blocked,
        "status": "blocked" if blocked else "ok",
        "latest_run": {
            "id": str(latest_run.id),
            "trigger": latest_run.trigger,
            "started_at": latest_run.started_at.isoformat(),
            "divergence_count": latest_run.divergence_count,
            "is_blocked": latest_run.is_blocked,
        }
        if latest_run
        else None,
    }


@router.post("/unblock")
async def unblock_trading(
    req: UnblockRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Unblock trading after investigating and resolving reconciliation divergences."""
    if not req.actor.strip() or not req.reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Actor and reason are required to unblock",
        )

    await reconciliation_engine.unblock(
        session=session,
        actor=req.actor,
        reason=req.reason,
    )
    await session.commit()

    return {
        "status": "unblocked",
        "blocked": False,
        "actor": req.actor,
        "reason": req.reason,
    }


@router.post("/run")
async def trigger_reconciliation(
    req: RunReconciliationRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Trigger a reconciliation check for an account."""
    if req.account_id is None:
        account = await portfolio_engine.get_or_create_account(session, req.trading_mode)
        acc_id = account.id
    else:
        acc_id = req.account_id

    run = await reconciliation_engine.run_reconciliation(
        session=session,
        account_id=acc_id,
        trading_mode=req.trading_mode,
        trigger=req.trigger,
    )
    await session.commit()

    return {
        "run_id": str(run.id),
        "trigger": run.trigger,
        "divergence_count": run.divergence_count,
        "is_blocked": run.is_blocked,
        "started_at": run.started_at.isoformat(),
        "completed_at": run.completed_at.isoformat() if run.completed_at else None,
    }
