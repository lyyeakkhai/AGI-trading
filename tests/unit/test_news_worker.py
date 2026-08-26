from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from packages.domain.intelligence import NewsCategory, NewsImportance
from services.intelligence.news_worker import NewsWorker


def test_news_worker_categorization() -> None:
    worker = NewsWorker()

    sec_text = "SEC files new lawsuit against major crypto entity in federal court."
    assert worker.categorize_event(sec_text) == NewsCategory.REGULATORY.value

    etf_text = "BlackRock files amended S-1 for spot bitcoin ETF approval."
    assert worker.categorize_event(etf_text) == NewsCategory.ETF.value

    hack_text = "Protocol exploit results in $50 million stolen from bridge contract."
    assert worker.categorize_event(hack_text) == NewsCategory.SECURITY.value

    macro_text = "Federal Reserve announces interest rate cut following FOMC meeting."
    assert worker.categorize_event(macro_text) == NewsCategory.MACROECONOMIC.value


def test_news_worker_importance_rating() -> None:
    worker = NewsWorker()

    crit_text = "SEC approves spot bitcoin ETF applications in historic ruling."
    assert worker.assign_importance(crit_text) == NewsImportance.CRITICAL.value

    high_text = "Federal Reserve rate decision announced with CPI inflation update."
    assert worker.assign_importance(high_text) == NewsImportance.HIGH.value

    low_text = "Analyst shares opinion on cryptocurrency chart patterns for weekend."
    assert worker.assign_importance(low_text) == NewsImportance.LOW.value


def test_news_worker_normalization() -> None:
    worker = NewsWorker()
    headline = "SEC Approves Spot Bitcoin ETF Applications"
    summary = "The SEC has given final approval for spot Bitcoin ETFs to begin trading."

    event = worker.normalize_item(headline, summary, source="coindesk")
    assert event.headline == headline
    assert event.summary == summary
    assert "BTC" in event.assets
    assert event.category == NewsCategory.ETF.value or event.category == NewsCategory.REGULATORY.value
    assert event.importance in [NewsImportance.HIGH.value, NewsImportance.CRITICAL.value]
    assert event.sentiment_score is not None
    assert event.sentiment_score > Decimal("0.0")


@pytest.mark.asyncio
async def test_news_worker_persistence() -> None:
    worker = NewsWorker()
    event = worker.normalize_item(
        headline="Ethereum Mainnet Upgrade Completed",
        summary="Validators report zero issues following hard fork.",
        source="cointelegraph",
    )

    mock_session = AsyncMock()
    model = await worker.persist_news_event(mock_session, event)

    assert model.headline == event.headline
    assert model.category == event.category
    mock_session.add.assert_called_once()
    mock_session.flush.assert_called_once()
