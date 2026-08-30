from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal

class DeepResearchRequest(BaseModel):
    symbol: str
    timeframe: str
    context: Optional[str] = None

class BullBearDebateResult(BaseModel):
    bull_thesis: str
    bear_thesis: str

class SynthesizedResearchReport(BaseModel):
    consensus_direction: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    key_catalysts: List[str]
    key_risks: List[str]
    summary: str
