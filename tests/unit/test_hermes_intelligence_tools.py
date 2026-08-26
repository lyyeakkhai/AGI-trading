from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from packages.database.models.intelligence import (
    EventCorrelationModel,
    NewsEventModel,
    SocialMetricModel,
)
from packages.hermes_tools.intelligence import (
    get_news,
    get_social_trends,
    search_market_events,
)


@pytest.mark.asyncio
async def test_get_news_tool_with_session() -> None:
    now = datetime.now(timezone.utc)
    mock_session = AsyncMock()
    mock_news = NewsEventModel(
        id=uuid.uuid4(),
        timestamp=now,
        source="coindesk",
        headline="BTC Reaches New Milestone",
        summary="Spot demand continues to surge.",
        assets=["BTC"],
        category="market",
        importance="MEDIUM",
        sentiment_score=Decimal("0.6000"),
        source_url=None,
        metadata_payload={},
        trading_mode="paper",
    )
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_news]
    mock_session.execute.return_value = mock_result

    results = await get_news("BTC/USDT", session=mock_session)
    assert len(results) == 1
    assert results[0]["headline"] == "BTC Reaches New Milestone"
    assert "BTC" in results[0]["assets"]


@pytest.mark.asyncio
async def test_get_social_trends_tool() -> None:
    now = datetime.now(timezone.utc)
    mock_session = AsyncMock()
    mock_metric = SocialMetricModel(
        symbol="BTC",
        timestamp=now,
        window="15m",
        sentiment_score=Decimal("0.7200"),
        volume_mentions=150,
        source="x_stream",
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_metric
    mock_session.execute.return_value = mock_result

    trends = await get_social_trends("BTC/USDT", window="15m", session=mock_session)
    assert trends["symbol"] == "BTC"
    assert trends["window"] == "15m"
    assert trends["volume_mentions"] == 150
    assert trends["sentiment_score"] == "0.7200"


@pytest.mark.asyncio
async def test_search_market_events_tool() -> None:
    now = datetime.now(timezone.utc)
    mock_session = AsyncMock()
    mock_corr = EventCorrelationModel(
        id=uuid.uuid4(),
        symbol="ETH",
        timestamp=now,
        correlation_type="social_volume_breakout",
        social_velocity=Decimal("180.0000"),
        volume_change=Decimal("50.0000"),
        price_change=Decimal("4.0000"),
        details={},
        trading_mode="paper",
    )
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_corr]
    mock_session.execute.return_value = mock_result

    events = await search_market_events("ETH/USDT", session=mock_session)
    assert len(events) == 1
    assert events[0]["symbol"] == "ETH"
    assert events[0]["correlation_type"] == "social_volume_breakout"
