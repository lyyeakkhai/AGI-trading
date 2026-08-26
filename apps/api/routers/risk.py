from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import get_settings
from packages.database import get_engine, get_session_factory
from packages.database.models.relational import (
    RiskConfigVersionModel,
    RiskDecisionModel,
    SystemConfigModel,
)
from packages.risk.models import RiskConfig
from services.risk.repository import RiskRepository

router = APIRouter(prefix="/api/v1/risk", tags=["risk"])
risk_repository = RiskRepository()


async def get_db_session() -> Any:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    async with session_factory() as session:
        yield session


def verify_owner_authorization(
    x_owner_secret: str | None = Header(None, alias="X-Owner-Secret"),
    authorization: str | None = Header(None, alias="Authorization"),
) -> str:
    """Verify that the request is authenticated by the owner, not an automated agent."""
    settings = get_settings()
    secret = settings.auth.dashboard_auth_secret

    # Check X-Owner-Secret or Bearer token matching dashboard auth secret
    token = None
    if x_owner_secret:
        token = x_owner_secret
    elif authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    # Check if this token matches agent tokens (which must be blocked from config edits)
    if token and (
        (settings.hermes.service_token and token == settings.hermes.service_token)
        or (settings.trading_agents.service_token and token == settings.trading_agents.service_token)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent service tokens are disallowed from modifying risk configuration",
        )

    # In production or if secret configured, verify owner token
    if secret:
        if token != secret:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing owner authorization token",
            )

    return "owner"


class UpdateRiskConfigRequest(BaseModel):
    config: dict[str, Any]
    created_by: str = "owner"


class KillSwitchRequest(BaseModel):
    active: bool
    reason: str = "Owner manual trigger"


@router.get("/config")
async def get_risk_config(
    version: int | None = Query(None, description="Specific version to fetch"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Fetch the latest active risk configuration or a specific version."""
    if version is not None:
        cfg = await risk_repository.get_config_by_version(session, version)
        if cfg is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Risk configuration version {version} not found",
            )
        return {"version": version, "config": cfg.model_dump(mode="json")}

    rec = await risk_repository.get_latest_config_version(session)
    return {
        "id": str(rec.id),
        "version": rec.version,
        "config": rec.config,
        "created_at": rec.created_at.isoformat(),
        "created_by": rec.created_by,
    }


@router.post("/config", status_code=status.HTTP_201_CREATED)
async def update_risk_config(
    req: UpdateRiskConfigRequest,
    session: AsyncSession = Depends(get_db_session),
    caller: str = Depends(verify_owner_authorization),
) -> dict[str, Any]:
    """Create a new version of the risk configuration (Owner only)."""
    try:
        new_record = await risk_repository.add_new_version(
            session=session,
            config=req.config,
            created_by=req.created_by,
        )
        await session.commit()
        return {
            "id": str(new_record.id),
            "version": new_record.version,
            "config": new_record.config,
            "created_at": new_record.created_at.isoformat(),
            "created_by": new_record.created_by,
        }
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )


@router.get("/decisions")
async def list_risk_decisions(
    proposal_id: uuid.UUID | None = Query(None, description="Filter by proposal ID"),
    trading_mode: str = Query("paper", description="Trading mode filter"),
    decision: str | None = Query(None, description="Filter by decision (approved, rejected, modified)"),
    limit: int = Query(50, ge=1, le=500),
    session: AsyncSession = Depends(get_db_session),
) -> list[dict[str, Any]]:
    """List historical risk evaluation decisions."""
    stmt = select(RiskDecisionModel).where(RiskDecisionModel.trading_mode == trading_mode)
    if proposal_id is not None:
        stmt = stmt.where(RiskDecisionModel.proposal_id == proposal_id)
    if decision is not None:
        stmt = stmt.where(RiskDecisionModel.decision == decision)

    stmt = stmt.order_by(RiskDecisionModel.evaluated_at.desc()).limit(limit)
    decisions = list((await session.execute(stmt)).scalars().all())

    return [
        {
            "id": str(d.id),
            "proposal_id": str(d.proposal_id),
            "decision": d.decision,
            "rule_codes": d.rule_codes,
            "risk_score": str(d.risk_score),
            "trading_mode": d.trading_mode,
            "correlation_id": str(d.correlation_id),
            "evaluated_at": d.evaluated_at.isoformat(),
        }
        for d in decisions
    ]


@router.get("/kill-switch")
async def get_kill_switch_status(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Query current kill switch status."""
    stmt = select(SystemConfigModel).where(SystemConfigModel.key == "kill_switch")
    rec = (await session.execute(stmt)).scalar_one_or_none()
    is_active = False
    reason = "Normal operation"
    if rec and isinstance(rec.value, dict):
        is_active = bool(rec.value.get("active", False))
        reason = str(rec.value.get("reason", ""))

    return {"active": is_active, "reason": reason}


@router.post("/kill-switch")
async def set_kill_switch_status(
    req: KillSwitchRequest,
    session: AsyncSession = Depends(get_db_session),
    caller: str = Depends(verify_owner_authorization),
) -> dict[str, Any]:
    """Engage or disengage system-wide kill switch."""
    stmt = select(SystemConfigModel).where(SystemConfigModel.key == "kill_switch")
    rec = (await session.execute(stmt)).scalar_one_or_none()
    now = datetime.now(timezone.utc)

    if rec is None:
        rec = SystemConfigModel(
            key="kill_switch",
            value={"active": req.active, "reason": req.reason, "updated_by": caller},
            updated_at=now,
        )
        session.add(rec)
    else:
        rec.value = {"active": req.active, "reason": req.reason, "updated_by": caller}
        rec.updated_at = now

    await session.commit()
    return {"active": req.active, "reason": req.reason, "updated_at": now.isoformat()}
