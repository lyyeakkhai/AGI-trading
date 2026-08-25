import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    Numeric,
    PrimaryKeyConstraint,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from packages.database.base import Base


class MarketCandleModel(Base):
    __tablename__ = "market_candles"
    __table_args__ = (
        PrimaryKeyConstraint("symbol", "timeframe", "timestamp", name="pk_market_candles"),
    )

    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(5), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    open: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    high: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    low: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    close: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    volume: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    is_closed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)


class MarketTradeModel(Base):
    __tablename__ = "market_trades"
    __table_args__ = (
        PrimaryKeyConstraint(
            "symbol", "exchange_trade_id", "trading_mode", "timestamp", name="pk_market_trades"
        ),
    )

    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    side: Mapped[str] = mapped_column(String(10), nullable=False)
    exchange_trade_id: Mapped[str] = mapped_column(String(64), nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)


class IndicatorSnapshotModel(Base):
    __tablename__ = "indicator_snapshots"
    __table_args__ = (
        PrimaryKeyConstraint("symbol", "timeframe", "timestamp", name="pk_indicator_snapshots"),
    )

    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(5), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    indicators: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)


class MarketEventModel(Base):
    __tablename__ = "market_events"
    __table_args__ = (PrimaryKeyConstraint("id", "timestamp", name="pk_market_events"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)


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


class SignalEventModel(Base):
    __tablename__ = "signal_events"
    __table_args__ = (PrimaryKeyConstraint("id", "timestamp", name="pk_signal_events"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    signal_type: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)


class PortfolioSnapshotModel(Base):
    __tablename__ = "portfolio_snapshots"
    __table_args__ = (
        PrimaryKeyConstraint("account_id", "timestamp", name="pk_portfolio_snapshots"),
    )

    account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_equity: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    cash_balance: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    unrealized_pnl: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    exposure: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)
