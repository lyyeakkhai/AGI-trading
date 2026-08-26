from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.audit import AuditRecord


async def log_financial_event(
    session: AsyncSession,
    actor: str,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID,
    trading_mode: str,
    payload: dict[str, Any],
    correlation_id: uuid.UUID | None = None,
) -> AuditRecord:
    """Record an immutable financial audit trail event in the current transaction."""
    record = AuditRecord(
        id=uuid.uuid4(),
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        trading_mode=trading_mode,
        correlation_id=correlation_id,
        payload=payload,
        timestamp=datetime.now(timezone.utc),
    )
    session.add(record)
    await session.flush()
    return record


async def get_audit_trail(
    session: AsyncSession,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    trading_mode: str | None = None,
    limit: int = 100,
) -> list[AuditRecord]:
    """Query recent audit events matching criteria."""
    stmt = select(AuditRecord)
    if entity_type is not None:
        stmt = stmt.where(AuditRecord.entity_type == entity_type)
    if entity_id is not None:
        stmt = stmt.where(AuditRecord.entity_id == entity_id)
    if trading_mode is not None:
        stmt = stmt.where(AuditRecord.trading_mode == trading_mode)

    stmt = stmt.order_by(AuditRecord.timestamp.desc()).limit(limit)
    result = await session.execute(stmt)
    return list(result.scalars().all())
