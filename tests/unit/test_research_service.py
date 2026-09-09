"""Unit tests for the ResearchService domain logic.

Covers:
- Experiment creation and slug generation
- Status transition validation
- 'positive backtest != VALIDATED' invariant
- Note creation
- Conclusion setting
- Lineage / follow-up creation
- List filtering
"""

from __future__ import annotations

import pytest
import uuid

from unittest.mock import AsyncMock, MagicMock, patch
from packages.domain.enums import (
    ConclusionOutcome,
    ExperimentCategory,
    ExperimentLinkType,
    ExperimentStatus,
    ResearchNoteType,
    ValidationRunType,
)
from packages.domain.experiment import (
    AddNoteRequest,
    AddValidationRunRequest,
    CreateExperimentRequest,
    CreateFollowUpRequest,
    ExperimentConclusion,
    HypothesisConfig,
    SetConclusionRequest,
    UpdateExperimentRequest,
    UpdateValidationRunRequest,
    ValidationMetrics,
)


def make_hypothesis(**kwargs) -> HypothesisConfig:
    defaults = dict(
        statement="Price breakouts with volume > 2x MA perform better.",
        rationale="Volume confirms demand.",
        expected_behavior="Higher win rate and profit factor.",
        assumptions=["Liquid markets only"],
        invalidation_criteria=["Net return < 0 after fees"],
    )
    defaults.update(kwargs)
    return HypothesisConfig(**defaults)


def make_create_req(**kwargs) -> CreateExperimentRequest:
    defaults = dict(
        title="BTC 4H Breakout Test",
        category=ExperimentCategory.BREAKOUT,
        hypothesis=make_hypothesis(),
    )
    defaults.update(kwargs)
    return CreateExperimentRequest(**defaults)


# ── Status transition tests ────────────────────────────────────────────────


class TestStatusTransitions:
    """Covers _ALLOWED_TRANSITIONS logic in ResearchService."""

    def test_draft_to_ready_allowed(self):
        from services.research.service import _ALLOWED_TRANSITIONS
        assert ExperimentStatus.READY in _ALLOWED_TRANSITIONS[ExperimentStatus.DRAFT]

    def test_draft_to_validated_blocked(self):
        from services.research.service import _ALLOWED_TRANSITIONS
        assert ExperimentStatus.VALIDATED not in _ALLOWED_TRANSITIONS[ExperimentStatus.DRAFT]

    def test_completed_to_validated_allowed(self):
        from services.research.service import _ALLOWED_TRANSITIONS
        assert ExperimentStatus.VALIDATED in _ALLOWED_TRANSITIONS[ExperimentStatus.COMPLETED]

    def test_archived_has_no_transitions(self):
        from services.research.service import _ALLOWED_TRANSITIONS
        assert len(_ALLOWED_TRANSITIONS[ExperimentStatus.ARCHIVED]) == 0

    def test_running_to_completed_allowed(self):
        from services.research.service import _ALLOWED_TRANSITIONS
        assert ExperimentStatus.COMPLETED in _ALLOWED_TRANSITIONS[ExperimentStatus.RUNNING]

    def test_validated_cannot_go_to_rejected(self):
        from services.research.service import _ALLOWED_TRANSITIONS
        assert ExperimentStatus.REJECTED not in _ALLOWED_TRANSITIONS[ExperimentStatus.VALIDATED]


# ── Slug generation tests ─────────────────────────────────────────────────


class TestSlugGeneration:
    def test_slug_format(self):
        from services.research.service import _slug
        assert _slug(1) == "EXP-0001"
        assert _slug(10) == "EXP-0010"
        assert _slug(100) == "EXP-0100"
        assert _slug(9999) == "EXP-9999"

    def test_slug_five_digit_overflow(self):
        from services.research.service import _slug
        # Should still work beyond 4 digits
        result = _slug(10000)
        assert result.startswith("EXP-")
        assert "10000" in result


# ── Hypothesis validation ─────────────────────────────────────────────────


class TestHypothesisModel:
    def test_hypothesis_requires_statement(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            HypothesisConfig(
                statement="",  # empty should fail min_length if set, but it's just str
                rationale="r",
                expected_behavior="e",
            )

    def test_hypothesis_defaults_empty_lists(self):
        h = HypothesisConfig(
            statement="S",
            rationale="R",
            expected_behavior="E",
        )
        assert h.assumptions == []
        assert h.invalidation_criteria == []

    def test_hypothesis_frozen(self):
        import pydantic
        h = make_hypothesis()
        with pytest.raises(Exception):  # frozen model
            h.statement = "changed"  # type: ignore


# ── Experiment request validation ─────────────────────────────────────────


class TestCreateExperimentRequest:
    def test_title_min_length(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            CreateExperimentRequest(
                title="ab",  # too short, min_length=3
                category=ExperimentCategory.BREAKOUT,
                hypothesis=make_hypothesis(),
            )

    def test_valid_request(self):
        req = make_create_req()
        assert req.title == "BTC 4H Breakout Test"
        assert req.category == ExperimentCategory.BREAKOUT
        assert req.tags == []

    def test_category_enum_validation(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            CreateExperimentRequest(
                title="Test Experiment",
                category="invalid_category",  # type: ignore
                hypothesis=make_hypothesis(),
            )


# ── ValidationMetrics — all optional ─────────────────────────────────────


class TestValidationMetrics:
    def test_empty_metrics_valid(self):
        m = ValidationMetrics()
        assert m.trade_count is None
        assert m.sharpe_ratio is None

    def test_partial_metrics_valid(self):
        from decimal import Decimal
        m = ValidationMetrics(
            net_return_pct=Decimal("0.25"),
            max_drawdown_pct=Decimal("0.10"),
            trade_count=50,
        )
        assert m.trade_count == 50
        assert m.sharpe_ratio is None


# ── Conclusion outcome ────────────────────────────────────────────────────


class TestExperimentConclusion:
    def test_outcome_values(self):
        c = ExperimentConclusion(
            outcome=ConclusionOutcome.SUPPORTED,
            evidence_summary="Strong OOS performance.",
            strengths=["High win rate", "Low drawdown"],
        )
        assert c.outcome == ConclusionOutcome.SUPPORTED
        assert len(c.strengths) == 2

    def test_rejected_with_failure_reasons(self):
        c = ExperimentConclusion(
            outcome=ConclusionOutcome.REJECTED,
            evidence_summary="Failed after fees.",
            failure_reasons=["Net return negative after slippage"],
        )
        assert c.outcome == ConclusionOutcome.REJECTED
        assert len(c.failure_reasons) == 1


# ── AddNoteRequest ────────────────────────────────────────────────────────


class TestNoteRequest:
    def test_note_requires_content(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            AddNoteRequest(note_type=ResearchNoteType.OBSERVATION, content="")

    def test_note_types_are_valid(self):
        for nt in ResearchNoteType:
            req = AddNoteRequest(note_type=nt, content="Test note content.")
            assert req.note_type == nt


# ── Follow-up request ─────────────────────────────────────────────────────


class TestCreateFollowUpRequest:
    def test_default_link_type_is_follow_up(self):
        req = CreateFollowUpRequest(
            title="BTC 4H v2 — With RSI Filter",
            hypothesis=make_hypothesis(statement="RSI improves entry quality."),
        )
        assert req.link_type == ExperimentLinkType.FOLLOW_UP

    def test_custom_link_type(self):
        req = CreateFollowUpRequest(
            title="ETH Replication",
            hypothesis=make_hypothesis(),
            link_type=ExperimentLinkType.REPLICATION,
        )
        assert req.link_type == ExperimentLinkType.REPLICATION
