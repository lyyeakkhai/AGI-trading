from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

class StrategyState(str, Enum):
    DRAFT = "DRAFT"
    BACKTESTING = "BACKTESTING"
    VALIDATED = "VALIDATED"
    PAPER_TRADING = "PAPER_TRADING"
    LIVE_LIMITED = "LIVE_LIMITED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class StrategyParameters(BaseModel):
    model_config = ConfigDict(frozen=True)
    
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary strategy parameters")

class StrategyVersion(BaseModel):
    model_config = ConfigDict(frozen=True)
    
    id: UUID
    strategy_id: UUID
    version: int
    parameters: StrategyParameters
    code_reference: str = Field(..., description="Git hash or path to strategy code")
    description: Optional[str] = None
