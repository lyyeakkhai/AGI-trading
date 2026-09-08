"""Research Experiment System — domain models (Pydantic).

These are request/response contracts only.  Persistence is handled by
the ORM layer in packages/database/models/research.py.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from packages.domain.enums import (
    ConclusionOutcome,
    ExperimentCategory,
    ExperimentLinkType,
    ExperimentStatus,
    ResearchNoteType,
    ValidationRunType,
)

# ── Sub-objects ──────────────────────────────────────────────────────────────


class HypothesisConfig(BaseModel):
    """Structured hypothesis for a research experiment."""

    model_config = ConfigDict(frozen=True)

    statement: str = Field(min_length=1, description="The hypothesis statement.")
    rationale: str = Field(..., description="Why we believe this could be true.")
    expected_behavior: str = Field(..., description="What we expect to observe if true.")
    assumptions: list[str] = Field(default_factory=list)
    invalidation_criteria: list[str] = Field(
        default_factory=list,
        description="Conditions under which the hypothesis must be rejected.",
    )


class ExperimentConfig(BaseModel):
    """Full experiment configuration — what was tested and how."""

    model_config = ConfigDict(frozen=True)

    asset: str = Field(..., description="e.g. BTC, ETH")
    timeframe: str = Field(..., description="e.g. 4h, 1h, 15m")
    start_date: datetime
    end_date: datetime
    initial_capital: Decimal = Field(default=Decimal("10000"))
    fee_rate: Decimal = Field(
        default=Decimal("0.001"), description="Taker fee rate, e.g. 0.001 = 0.1%"
    )
    slippage_bps: int = Field(default=5, description="Slippage in basis points")
    position_sizing: str = Field(default="fixed", description="e.g. fixed, risk_pct, kelly")
    risk_per_trade_pct: Decimal | None = None
    strategy_version_id: UUID | None = None
    strategy_parameters: dict[str, Any] = Field(default_factory=dict)
    entry_conditions: list[str] = Field(default_factory=list)
    exit_conditions: list[str] = Field(default_factory=list)
    stop_loss_pct: Decimal | None = None
    take_profit_pct: Decimal | None = None
    notes: str | None = None


class DatasetDefinition(BaseModel):
    """Exact dataset used — enables reproducibility."""

    model_config = ConfigDict(frozen=True)

    market: str = Field(default="crypto_spot")
    symbol: str
    timeframe: str
    start_timestamp: datetime
    end_timestamp: datetime
    candle_count: int | None = None
    source_id: str | None = Field(None, description="Data source identifier")
    data_version: str | None = None
    has_missing_bars: bool = False
    data_quality: str = Field(default="unknown", description="unknown | good | degraded | poor")


class ValidationMetrics(BaseModel):
    """Numerical results from a single validation run.

    All fields are optional — a run may be partially complete.
    DO NOT populate these from AI inference; only from deterministic code.
    """

    gross_return_pct: Decimal | None = None
    net_return_pct: Decimal | None = None
    max_drawdown_pct: Decimal | None = None
    win_rate: Decimal | None = None
    trade_count: int | None = None
    profit_factor: Decimal | None = None
    expectancy: Decimal | None = None
    sharpe_ratio: Decimal | None = None
    sortino_ratio: Decimal | None = None
    avg_trade_pct: Decimal | None = None
    largest_win_pct: Decimal | None = None
    largest_loss_pct: Decimal | None = None
    volatility_annualized: Decimal | None = None
    exposure_pct: Decimal | None = None
    risk_per_trade_pct: Decimal | None = None
    max_consecutive_losses: int | None = None
    recovery_factor: Decimal | None = None
    equity_curve: list[float] | None = None
    monthly_returns: dict[str, float] | None = None
    regime_breakdown: dict[str, Any] | None = None


class ExperimentConclusion(BaseModel):
    """Structured conclusion for a completed experiment."""

    outcome: ConclusionOutcome
    evidence_summary: str
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    failure_reasons: list[str] = Field(default_factory=list)
    lessons_learned: str | None = None
    next_experiment_suggestion: str | None = None


# ── Request / Response schemas ────────────────────────────────────────────────


class CreateExperimentRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = None
    category: ExperimentCategory
    hypothesis: HypothesisConfig
    config: ExperimentConfig | None = None
    dataset: DatasetDefinition | None = None
    tags: list[str] = Field(default_factory=list)


class UpdateExperimentRequest(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=255)
    description: str | None = None
    category: ExperimentCategory | None = None
    status: ExperimentStatus | None = None
    hypothesis: HypothesisConfig | None = None
    config: ExperimentConfig | None = None
    dataset: DatasetDefinition | None = None
    tags: list[str] | None = None


class AddNoteRequest(BaseModel):
    note_type: ResearchNoteType
    content: str = Field(..., min_length=1)
    stage: str | None = Field(None, description="Experiment stage at time of note, e.g. BACKTEST")
    author: str | None = None


class NoteResponse(BaseModel):
    id: UUID
    experiment_id: UUID
    note_type: ResearchNoteType
    content: str
    stage: str | None
    author: str | None
    created_at: datetime


class AddValidationRunRequest(BaseModel):
    run_type: ValidationRunType
    description: str | None = None
    config: dict[str, Any] = Field(default_factory=dict, description="Run-specific config override")
    backtest_job_id: UUID | None = None


class UpdateValidationRunRequest(BaseModel):
    metrics: ValidationMetrics
    passed: bool | None = None
    notes: str | None = None


class ValidationRunResponse(BaseModel):
    id: UUID
    experiment_id: UUID
    run_type: ValidationRunType
    description: str | None
    config: dict[str, Any]
    metrics: ValidationMetrics | None
    passed: bool | None
    backtest_job_id: UUID | None
    notes: str | None
    started_at: datetime
    completed_at: datetime | None
    created_at: datetime


class ExperimentLinkResponse(BaseModel):
    id: UUID
    parent_experiment_id: UUID
    child_experiment_id: UUID
    link_type: ExperimentLinkType
    created_at: datetime


class ExperimentResponse(BaseModel):
    """Full experiment detail — returned by GET /research/experiments/{id}."""

    id: UUID
    experiment_id: str = Field(..., description="Human-readable slug, e.g. EXP-001")
    title: str
    description: str | None
    status: ExperimentStatus
    category: ExperimentCategory
    hypothesis: HypothesisConfig
    config: ExperimentConfig | None
    dataset: DatasetDefinition | None
    conclusion: ExperimentConclusion | None
    tags: list[str]
    validation_runs: list[ValidationRunResponse] = Field(default_factory=list)
    notes: list[NoteResponse] = Field(default_factory=list)
    parent_links: list[ExperimentLinkResponse] = Field(default_factory=list)
    child_links: list[ExperimentLinkResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ExperimentListItem(BaseModel):
    """Minimal experiment summary for list views."""

    id: UUID
    experiment_id: str
    title: str
    status: ExperimentStatus
    category: ExperimentCategory
    asset: str | None
    timeframe: str | None
    conclusion_outcome: ConclusionOutcome | None
    validation_run_count: int
    created_at: datetime
    updated_at: datetime


class CreateFollowUpRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = None
    category: ExperimentCategory | None = None
    hypothesis: HypothesisConfig
    link_type: ExperimentLinkType = ExperimentLinkType.FOLLOW_UP


class SetConclusionRequest(BaseModel):
    conclusion: ExperimentConclusion
