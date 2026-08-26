from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from packages.domain.enums import TradingMode


class NewsImportance(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class NewsCategory(str, Enum):
    REGULATORY = "regulatory"
    EXCHANGE = "exchange"
    ETF = "ETF"
    MACROECONOMIC = "macroeconomic"
    PROTOCOL = "protocol"
    SECURITY = "security"
    INSTITUTIONAL = "institutional"
    STABLECOIN = "stablecoin"
    LIQUIDITY = "liquidity"
    GEOPOLITICAL = "geopolitical"
    GENERAL = "general"


class SocialMetric(BaseModel):
    symbol: str
    timestamp: datetime
    window: str  # "1m", "15m", "1h"
    sentiment_score: Decimal  # -1.0 to 1.0
    volume_mentions: int
    source: str
    unique_authors: int = 0
    mention_velocity: Decimal = Decimal("0")  # Percentage change
    spam_score: Decimal = Decimal("0")  # 0.0 to 1.0


class NewsEvent(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    timestamp: datetime
    source: str
    headline: str
    summary: str
    assets: list[str] = Field(default_factory=list)
    category: str = NewsCategory.GENERAL.value
    importance: str = NewsImportance.LOW.value
    sentiment_score: Optional[Decimal] = None
    source_url: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    trading_mode: TradingMode = TradingMode.PAPER


class EventCorrelation(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    symbol: str
    timestamp: datetime
    correlation_type: str
    social_velocity: Decimal
    volume_change: Decimal
    price_change: Optional[Decimal] = None
    details: dict[str, Any] = Field(default_factory=dict)
    trading_mode: TradingMode = TradingMode.PAPER