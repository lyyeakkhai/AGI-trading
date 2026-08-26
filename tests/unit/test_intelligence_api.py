from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
import pytest

from apps.api.main import app
from apps.api.routers.intelligence import get_db_session
from packages.database.models.intelligence import (
    EventCorrelationModel,
    NewsEventModel,
    SocialMetricModel,
)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_get_social_metrics_api(client: TestClient) -> None:
    now = datetime.now(timezone.utc)
    mock_session = AsyncMock()
    mock_metric = SocialMetricModel(
        symbol="BTC",
        timestamp=now,
        window="15m",
        sentiment_score=Decimal("0.5500"),
        volume_mentions=42,
        source="x_stream",
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_metric]
    mock_session.execute.return_value = mock_result

    async def override_db() -> AsyncMock:
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    response = client.get("/api/v1/intelligence/social?symbol=BTC&window=15m")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["symbol"] == "BTC"
    assert data[0]["volume_mentions"] == 42
    assert data[0]["window"] == "15m"

    app.dependency_overrides.clear()


def test_get_news_api(client: TestClient) -> None:
    now = datetime.now(timezone.utc)
    mock_session = AsyncMock()
    mock_news = NewsEventModel(
        id=uuid.uuid4(),
        timestamp=now,
        source="coindesk",
        headline="SEC Approves Bitcoin ETF",
        summary="Final approvals have been issued.",
        assets=["BTC"],
        category="regulatory",
        importance="CRITICAL",
        sentiment_score=Decimal("0.8000"),
        source_url="https://coindesk.com/test",
        metadata_payload={},
        trading_mode="paper",
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_news]
    mock_session.execute.return_value = mock_result

    async def override_db() -> AsyncMock:
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    response = client.get("/api/v1/intelligence/news?category=regulatory")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["headline"] == "SEC Approves Bitcoin ETF"
    assert data[0]["importance"] == "CRITICAL"

    app.dependency_overrides.clear()


def test_get_correlations_api(client: TestClient) -> None:
    now = datetime.now(timezone.utc)
    mock_session = AsyncMock()
    mock_corr = EventCorrelationModel(
        id=uuid.uuid4(),
        symbol="BTC",
        timestamp=now,
        correlation_type="social_volume_breakout",
        social_velocity=Decimal("150.0000"),
        volume_change=Decimal("45.0000"),
        price_change=Decimal("2.5000"),
        details={"reason": "breakout"},
        trading_mode="paper",
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_corr]
    mock_session.execute.return_value = mock_result

    async def override_db() -> AsyncMock:
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    response = client.get("/api/v1/intelligence/correlations?symbol=BTC")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["symbol"] == "BTC"
    assert data[0]["correlation_type"] == "social_volume_breakout"

    app.dependency_overrides.clear()
