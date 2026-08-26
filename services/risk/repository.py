from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.relational import RiskConfigVersionModel
from packages.risk.models import RiskConfig


class RiskRepositoryError(Exception):
    """Base exception for risk repository operations."""


class RiskRepository:
    """Manages immutable, versioned risk configurations in PostgreSQL."""

    def _serialize_config(self, config: RiskConfig) -> dict[str, Any]:
        """Convert RiskConfig pydantic model to a JSONB-serializable dictionary."""
        data = config.model_dump(mode="json")
        # Ensure Decimal strings or numbers are serialized cleanly
        return data

    def _deserialize_config(self, raw_data: dict[str, Any]) -> RiskConfig:
        """Parse raw database JSONB into a validated, structurally-enforced RiskConfig."""
        # Enforce structural invariants
        raw_data["spot_only"] = True
        raw_data["leverage_enabled"] = False
        return RiskConfig.model_validate(raw_data)

    async def get_latest_config_version(self, session: AsyncSession) -> RiskConfigVersionModel:
        """Fetch the most recent risk configuration version record, initializing default if empty."""
        stmt = (
            select(RiskConfigVersionModel)
            .order_by(RiskConfigVersionModel.version.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()

        if record is None:
            # Seed initial Version 1 default configuration
            default_cfg = RiskConfig()
            record = RiskConfigVersionModel(
                id=uuid.uuid4(),
                version=1,
                config=self._serialize_config(default_cfg),
                created_at=datetime.now(timezone.utc),
                created_by="system_initialization",
            )
            session.add(record)
            await session.flush()

        return record

    async def get_latest_config(self, session: AsyncSession) -> tuple[int, RiskConfig]:
        """Fetch the latest active RiskConfig instance alongside its version integer."""
        record = await self.get_latest_config_version(session)
        cfg = self._deserialize_config(dict(record.config))
        return record.version, cfg

    async def get_config_by_version(self, session: AsyncSession, version: int) -> RiskConfig | None:
        """Fetch a specific historical RiskConfig by version number."""
        stmt = select(RiskConfigVersionModel).where(RiskConfigVersionModel.version == version)
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if record is None:
            return None
        return self._deserialize_config(dict(record.config))

    async def add_new_version(
        self,
        session: AsyncSession,
        config: RiskConfig | dict[str, Any],
        created_by: str,
    ) -> RiskConfigVersionModel:
        """Append a new immutable versioned risk configuration."""
        if isinstance(config, dict):
            # Explicit safety checks on raw inputs
            if config.get("spot_only") is False:
                raise ValueError("spot_only cannot be False. Structural safety violation.")
            if config.get("leverage_enabled") is True:
                raise ValueError("leverage_enabled cannot be True. Structural safety violation.")
            validated_cfg = RiskConfig.model_validate(config)
        else:
            validated_cfg = config

        # Determine next version number
        stmt_max = select(func.coalesce(func.max(RiskConfigVersionModel.version), 0))
        max_ver = (await session.execute(stmt_max)).scalar_one()
        next_ver = int(max_ver) + 1

        record = RiskConfigVersionModel(
            id=uuid.uuid4(),
            version=next_ver,
            config=self._serialize_config(validated_cfg),
            created_at=datetime.now(timezone.utc),
            created_by=created_by,
        )
        session.add(record)
        await session.flush()
        return record
