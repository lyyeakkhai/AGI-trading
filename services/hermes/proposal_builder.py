from decimal import Decimal

from pydantic import BaseModel, Field


class TradeProposal(BaseModel):
    symbol: str | None = Field(None, description="Market symbol, e.g. BTC/USDT")
    direction: str = Field(description="Trade direction: 'long' or 'short' or 'neutral'")
    confidence: float = Field(0.0, description="Confidence score from 0.0 to 1.0")
    quantity: Decimal | None = Field(Decimal("0.01"), description="Proposed trade quantity")

    entry: Decimal | None = Field(None, description="Suggested entry price")
    stop_loss: Decimal | None = Field(None, description="Suggested stop loss price")
    take_profit: Decimal | None = Field(None, description="Suggested take profit price")
    supporting_evidence: list[str] = Field(
        default_factory=list, description="List of supporting evidence for the trade"
    )
    contradicting_evidence: list[str] = Field(
        default_factory=list, description="List of contradicting evidence against the trade"
    )
    invalidation_rules: list[str] = Field(
        default_factory=list, description="Conditions under which the trade idea is invalidated"
    )
