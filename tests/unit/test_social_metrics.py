from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from services.intelligence.social_metrics import SocialMetricsEngine
from services.intelligence.x_client import RawPost


@pytest.mark.asyncio
async def test_social_metrics_engine_filter_spam() -> None:
    engine = SocialMetricsEngine(spam_threshold=Decimal("0.5"))

    spam_post = RawPost(
        id="spam_1",
        text="Guaranteed 100x gem airdrop claim free crypto http://1.co http://2.co http://3.co http://4.co $BTC $ETH $SOL",
        author_id="bot_1",
        created_at=datetime.now(timezone.utc),
        symbol="BTC",
    )
    result = engine.process_post(spam_post)
    assert result is None


@pytest.mark.asyncio
async def test_social_metrics_engine_aggregation_and_velocity() -> None:
    engine = SocialMetricsEngine()
    now = datetime.now(timezone.utc)

    # Add 5 valid bullish BTC posts
    for i in range(5):
        post = RawPost(
            id=f"btc_{i}",
            text=f"Bitcoin looking extremely bullish with strong breakout volume {i}",
            author_id=f"author_{i}",
            created_at=now - timedelta(minutes=2),
            symbol="BTC",
        )
        processed = engine.process_post(post)
        assert processed is not None

    metric = engine.calculate_window_metric("BTC", window="15m", as_of=now)
    assert metric.symbol == "BTC"
    assert metric.volume_mentions == 5
    assert metric.unique_authors == 5
    assert metric.sentiment_score > Decimal("0.0")
    assert metric.mention_velocity == Decimal("100.00")


@pytest.mark.asyncio
async def test_social_metrics_engine_persist() -> None:
    engine = SocialMetricsEngine()
    now = datetime.now(timezone.utc)

    post = RawPost(
        id="eth_1",
        text="Ethereum layer 2 upgrade showing positive momentum $ETH",
        author_id="user_1",
        created_at=now,
        symbol="ETH",
    )
    engine.process_post(post)
    metric = engine.calculate_window_metric("ETH", window="15m", as_of=now)

    mock_session = AsyncMock()
    model = await engine.persist_metric(mock_session, metric)

    assert model.symbol == "ETH"
    assert model.window == "15m"
    assert model.volume_mentions == 1
    mock_session.add.assert_called_once()
    mock_session.flush.assert_called_once()
