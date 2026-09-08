import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import (
    DateTime,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from packages.database.base import Base


class TradingPlanModel(Base):
    __tablename__ = "trading_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    market: Mapped[str] = mapped_column(String(20), nullable=False, default="spot")
    direction: Mapped[str] = mapped_column(String(10), nullable=False)  # LONG or SHORT
    
    entry_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    stop_loss_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    take_profit_prices: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)  # [{ "price": 79500 }]
    
    risk_percent: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    
    thesis: Mapped[str] = mapped_column(Text, nullable=False)
    invalidation: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="DRAFT") 
    # DRAFT, VALIDATING, APPROVED, REJECTED, EXECUTING, COMPLETED, FAILED
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
