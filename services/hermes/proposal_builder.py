from typing import List, Optional
from pydantic import BaseModel, Field
from decimal import Decimal

class TradeProposal(BaseModel):
    direction: str = Field(description="Trade direction: 'long' or 'short' or 'neutral'")
    entry: Optional[Decimal] = Field(None, description="Suggested entry price")
    stop_loss: Optional[Decimal] = Field(None, description="Suggested stop loss price")
    take_profit: Optional[Decimal] = Field(None, description="Suggested take profit price")
    supporting_evidence: List[str] = Field(description="List of supporting evidence for the trade")
    contradicting_evidence: List[str] = Field(description="List of contradicting evidence against the trade")
    invalidation_rules: List[str] = Field(description="Conditions under which the trade idea is invalidated")
