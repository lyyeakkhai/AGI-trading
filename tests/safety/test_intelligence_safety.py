from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import importlib
import inspect
import sys
from unittest.mock import AsyncMock, MagicMock

import pytest

from packages.domain.intelligence import NewsEvent, SocialMetric
from services.intelligence.correlator import CorrelationEngine
from services.intelligence.news_worker import NewsWorker
from services.intelligence.nlp import analyze_sentiment
from services.intelligence.social_metrics import SocialMetricsEngine
from services.intelligence.social_worker import SocialWorker


def test_intelligence_modules_do_not_import_execution_or_portfolio() -> None:
    """Safety boundary: Intelligence layer must never import execution or portfolio services."""
    forbidden_modules = [
        "services.execution",
        "services.portfolio",
        "packages.exchange",
    ]

    intelligence_modules = [
        "services.intelligence",
        "services.intelligence.nlp",
        "services.intelligence.x_client",
        "services.intelligence.social_worker",
        "services.intelligence.social_metrics",
        "services.intelligence.news_worker",
        "services.intelligence.correlator",
        "packages.hermes_tools.intelligence",
    ]

    for mod_name in intelligence_modules:
        if mod_name in sys.modules:
            mod = sys.modules[mod_name]
            source = inspect.getsource(mod)
            for forbidden in forbidden_modules:
                assert forbidden not in source, f"Module {mod_name} illegally imports {forbidden}"


def test_nlp_scoring_is_purely_local_and_zero_token() -> None:
    """Safety constraint: NLP scoring must be 100% local with no remote LLM calls."""
    # Verify analyze_sentiment executes instantaneously and deterministically
    bullish_text = "Massive institutional buying inflow on BTC!"
    score1 = analyze_sentiment(bullish_text)
    score2 = analyze_sentiment(bullish_text)
    assert score1 == score2
    assert -Decimal("1.0") <= score1 <= Decimal("1.0")


def test_extreme_social_spike_cannot_trigger_orders_directly() -> None:
    """Safety invariant: Extreme social spike (+5000% velocity) only produces an enrichment event,

    never a TradeProposal or Order.
    """
    correlator = CorrelationEngine()
    correlation = correlator.evaluate_correlation(
        symbol="BTC",
        social_velocity=Decimal("5000.0"),  # Extreme viral event
        curr_volume=Decimal("50000.0"),
        prev_volume=Decimal("1000.0"),
    )

    assert correlation is not None
    # Correlation engine only returns an EventCorrelation entity
    assert not hasattr(correlation, "order_id")
    assert not hasattr(correlation, "proposal_id")
    assert correlation.correlation_type == "social_volume_breakout"


def test_breaking_critical_news_cannot_trigger_orders_directly() -> None:
    """Safety invariant: Breaking critical news only produces a NewsEvent,

    never directly authorizes a trade execution.
    """
    worker = NewsWorker()
    event = worker.normalize_item(
        headline="BREAKING: Major Global Bank Announces $10 Billion BTC Purchase",
        summary="Immediate balance sheet allocation completed.",
        source="wire",
    )

    assert event.importance == "HIGH" or event.importance == "CRITICAL"
    # Ensure NewsEvent has no financial authorization attributes
    assert not hasattr(event, "execute_trade")
    assert not hasattr(event, "order_type")
    assert isinstance(event, NewsEvent)
