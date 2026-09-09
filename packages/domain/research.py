from pydantic import BaseModel, ConfigDict, Field


class DeepResearchRequest(BaseModel):
    symbol: str
    timeframe: str
    context: str | None = None


class BullBearDebateResult(BaseModel):
    bull_thesis: str
    bear_thesis: str


class SynthesizedResearchReport(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    direction: str = Field(..., alias="consensus_direction")
    confidence: float = Field(..., ge=0.0, le=1.0, alias="confidence_score")
    catalysts: list[str] = Field(default_factory=list, alias="key_catalysts")
    risks: list[str] = Field(default_factory=list, alias="key_risks")
    summary: str

    @property
    def consensus_direction(self) -> str:
        return self.direction

    @property
    def confidence_score(self) -> float:
        return self.confidence

    @property
    def key_catalysts(self) -> list[str]:
        return self.catalysts

    @property
    def key_risks(self) -> list[str]:
        return self.risks
