from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from packages.domain.intelligence import EventCorrelation
from packages.events.streams import RedisStreamPublisher
from services.intelligence.correlator import CorrelationEngine


def test_correlation_engine_detects_anomaly() -> None:
    engine = CorrelationEngine(
        velocity_threshold_pct=Decimal("100.0"),
        volume_threshold_pct=Decimal("30.0"),
    )

    # Social velocity +150% (>= 100%) and Volume change +50% (>= 30%)
    correlation = engine.evaluate_correlation(
        symbol="BTC",
        social_velocity=Decimal("150.0"),
        curr_volume=Decimal("1500.0"),
        prev_volume=Decimal("1000.0"),
        curr_price=Decimal("51000.0"),
        prev_price=Decimal("50000.0"),
    )

    assert correlation is not None
    assert correlation.symbol == "BTC"
    assert correlation.social_velocity == Decimal("150.0")
    assert correlation.volume_change == Decimal("50.0")
    assert correlation.price_change == Decimal("2.0")
    assert correlation.correlation_type == "social_volume_breakout"
    assert engine.correlations_detected_count == 1


def test_correlation_engine_rejects_sub_threshold() -> None:
    engine = CorrelationEngine()

    # Social velocity high (+120%) but volume low (+10% < 30%)
    correlation = engine.evaluate_correlation(
        symbol="BTC",
        social_velocity=Decimal("120.0"),
        curr_volume=Decimal("1100.0"),
        prev_volume=Decimal("1000.0"),
    )
    assert correlation is None


@pytest.mark.asyncio
async def test_correlation_engine_publishes_to_redis() -> None:
    mock_publisher = AsyncMock(spec=RedisStreamPublisher)
    mock_publisher.publish.return_value = "1724650000-0"

    engine = CorrelationEngine(publisher=mock_publisher)
    correlation = EventCorrelation(
        symbol="ETH",
        timestamp=datetime.now(timezone.utc),
        correlation_type="social_volume_breakout",
        social_velocity=Decimal("120.0"),
        volume_change=Decimal("45.0"),
        price_change=Decimal("3.5"),
    )

    msg_id = await engine.publish_correlation_event(correlation)
    assert msg_id == "1724650000-0"
    mock_publisher.publish.assert_called_once()


@pytest.mark.asyncio
async def test_correlation_engine_persist() -> None:
    engine = CorrelationEngine()
    correlation = EventCorrelation(
        symbol="BTC",
        timestamp=datetime.now(timezone.utc),
        correlation_type="social_volume_breakout",
        social_velocity=Decimal("200.0"),
        volume_change=Decimal("60.0"),
    )

    mock_session = AsyncMock()
    model = await engine.persist_correlation(mock_session, correlation)

    assert model.symbol == "BTC"
    assert model.correlation_type == "social_volume_breakout"
    mock_session.add.assert_called_once()
    mock_session.flush.assert_called_once()
