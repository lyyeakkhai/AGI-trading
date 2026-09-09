import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from packages.database.base import Base


class ChartDrawingModel(Base):
    __tablename__ = "chart_drawings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timeframe: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    drawing_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., 'support_zone', 'trendline'
    parameters: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)  # price_low, price_high, start_time, etc.
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class ChartAnnotationModel(Base):
    __tablename__ = "chart_annotations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    time_ms: Mapped[int] = mapped_column(nullable=False)  # X-axis time in ms
    price: Mapped[float] = mapped_column(nullable=False)  # Y-axis price
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
