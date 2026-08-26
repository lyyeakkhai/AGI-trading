"""Exchange adapter response models.

All financial values use Decimal. No float in any monetary field.
These models live at the adapter boundary — they are NOT domain models
and are not stored in the database. They are converted to domain models
by the normalizer in the ingestion worker.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any
from pydantic import BaseModel, field_validator


class SymbolInfo(BaseModel):
    symbol: str
    base: str
    quote: str
    price_precision: int
    quantity_precision: int
    min_notional: Decimal
    step_size: Decimal
    is_active: bool

    @field_validator("min_notional", "step_size", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class Ticker(BaseModel):
    symbol: str
    bid: Decimal
    ask: Decimal
    last: Decimal
    volume: Decimal
    timestamp: datetime

    @field_validator("bid", "ask", "last", "volume", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class OHLCVCandle(BaseModel):
    """Raw candle from adapter boundary — not the domain Candle model."""

    symbol: str
    timeframe: str
    timestamp: datetime  # candle open time, UTC
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    is_closed: bool

    @field_validator("open", "high", "low", "close", "volume", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class MarketTrade(BaseModel):
    """Single trade print from the exchange."""

    symbol: str
    timestamp: datetime
    price: Decimal
    amount: Decimal
    side: str  # "buy" or "sell"
    exchange_trade_id: str

    @field_validator("price", "amount", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class OrderBook(BaseModel):
    symbol: str
    timestamp: datetime
    bids: list[tuple[Decimal, Decimal]]  # [(price, qty), ...]
    asks: list[tuple[Decimal, Decimal]]


class AdapterHealth(BaseModel):
    connected: bool
    latency_ms: float | None = None
    last_error: str | None = None


class RateLimitState(BaseModel):
    requests_used: int
    requests_limit: int
    weight_used: int
    weight_limit: int
    reset_at: datetime
