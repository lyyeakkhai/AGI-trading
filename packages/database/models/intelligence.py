import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import (
    DateTime,
    Integer,
    Numeric,
    PrimaryKeyConstraint,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from packages.database.base import Base


class SocialMetricModel(Base):
    __tablename__ = "social_metrics"
    __table_args__ = (
        PrimaryKeyConstraint("symbol", "window", "source", "timestamp", name="pk_social_metrics"),
    )

    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window: Mapped[str] = mapped_column(String(10), nullable=False)
    sentiment_score: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    volume_mentions: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)


class NewsEventModel(Base):
    __tablename__ = "news_events"
    __table_args__ = (PrimaryKeyConstraint("id", "timestamp", name="pk_news_events"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    headline: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    assets: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="general")
    importance: Mapped[str] = mapped_column(String(20), nullable=False, default="LOW")
    sentiment_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 4), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    metadata_payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default="{}"
    )
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False, default="paper")


class EventCorrelationModel(Base):
    __tablename__ = "event_correlations"
    __table_args__ = (PrimaryKeyConstraint("id", "timestamp", name="pk_event_correlations"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    correlation_type: Mapped[str] = mapped_column(String(50), nullable=False)
    social_velocity: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    volume_change: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    price_change: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 4), nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False, default="paper")