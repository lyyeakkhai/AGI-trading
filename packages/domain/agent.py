from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from packages.domain.enums import TradingMode


class AgentObservation(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    agent_id: str
    observation_type: str
    content: dict[str, Any]
    trading_mode: TradingMode
    correlation_id: UUID | None = None
    observed_at: datetime


class AgentDecision(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    agent_id: str
    observation_id: UUID | None = None
    decision_type: str
    reasoning: str
    outcome: dict[str, Any]
    trading_mode: TradingMode
    correlation_id: UUID | None = None
    decided_at: datetime
