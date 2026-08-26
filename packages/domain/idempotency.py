from __future__ import annotations

from datetime import datetime, timezone
import hashlib
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.idempotency import IdempotencyKeyModel


class IdempotencyService:
    """Provides deterministic key generation and DB-enforced idempotency checking."""

    def generate_key(self, source_id: str, action: str) -> str:
        """Generate a SHA-256 idempotency key from source ID and action."""
        raw = f"{source_id}:{action}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def get_record(
        self, session: AsyncSession, key: str, trading_mode: str
    ) -> IdempotencyKeyModel | None:
        """Fetch existing idempotency record if present."""
        stmt = select(IdempotencyKeyModel).where(
            IdempotencyKeyModel.key == key,
            IdempotencyKeyModel.trading_mode == trading_mode,
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def record_key(
        self,
        session: AsyncSession,
        key: str,
        trading_mode: str,
        outcome: dict[str, Any] | None = None,
    ) -> IdempotencyKeyModel:
        """Insert idempotency key record into session.
        
        Relies on DB unique constraint to guarantee single execution.
        """
        record = IdempotencyKeyModel(
            key=key,
            trading_mode=trading_mode,
            outcome=outcome,
            created_at=datetime.now(timezone.utc),
        )
        session.add(record)
        return record
