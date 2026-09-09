import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from packages.database.base import Base


class AuditDecisionModel(Base):
    __tablename__ = "audit_decisions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trading_plans.id", ondelete="SET NULL"), nullable=True
    )
    
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    drawings: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    risk_result: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    execution_result: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
