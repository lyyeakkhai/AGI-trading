from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from packages.domain.enums import Timeframe, TradingMode
from packages.domain.value_objects import Price, Quantity


class Asset(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    symbol: str  # "BTC/USDT"
    base: str  # "BTC"
    quote: str  # "USDT"
    is_active: bool = True
    created_at: datetime


class Candle(BaseModel):
    symbol: str
    timeframe: Timeframe
    open: Price
    high: Price
    low: Price
    close: Price
    volume: Quantity
    timestamp: datetime  # candle open time, UTC
    is_closed: bool
    trading_mode: TradingMode


class MarketEvent(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    symbol: str
    event_type: str
    payload: dict[str, Any]
    timestamp: datetime
    trading_mode: TradingMode


class IndicatorSnapshot(BaseModel):
    symbol: str
    timeframe: Timeframe
    timestamp: datetime
    indicators: dict[str, Any]  # {"rsi": Decimal("45.2"), "ema_20": Decimal("42000.5")}
    trading_mode: TradingMode


class Opportunity(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    symbol: str
    signal_type: str
    confidence: Decimal  # 0.0 to 1.0
    indicators: dict[str, Any]
    timestamp: datetime
    trading_mode: TradingMode
    correlation_id: UUID


class TradingSkill(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    version: str
    is_active: bool
    created_at: datetime


class KnowledgeEmbedding(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    content: str
    embedding: list[float]  # vector (float OK here — this is ML, not money)
    dimensions: int
    metadata: dict[str, Any]
    created_at: datetime
    trading_mode: TradingMode
