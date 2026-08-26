from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import httpx
import pytest

from apps.api.main import app
from apps.api.routers.analytics import get_db_session as analytics_get_db


@pytest.mark.asyncio
async def test_get_indicators_api() -> None:
    mock_session = AsyncMock()

    mock_row = MagicMock()
    mock_row.symbol = "BTC/USDT"
    mock_row.timeframe = "1h"
    mock_row.timestamp = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    mock_row.indicators = {"rsi_14": 55.4, "ema_20": 48200.0}
    mock_row.trading_mode = "paper"

    mock_res = MagicMock()
    mock_res.fetchall.return_value = [mock_row]
    mock_session.execute.return_value = mock_res

    async def override_db() -> AsyncIterator[AsyncMock]:
        yield mock_session

    app.dependency_overrides[analytics_get_db] = override_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/indicators?symbol=BTC/USDT&timeframe=1h")

    app.dependency_overrides.clear()

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["symbol"] == "BTC/USDT"
    assert data[0]["indicators"]["rsi_14"] == 55.4


@pytest.mark.asyncio
async def test_get_regime_api() -> None:
    mock_session = AsyncMock()

    # Generate 50 mock candle rows with strong uptrend
    mock_rows: list[MagicMock] = []
    for i in range(50):
        row = MagicMock()
        row.timestamp = datetime(2026, 1, 1, i, 0, tzinfo=timezone.utc)
        row.open = 100.0 + i * 2
        row.high = 102.0 + i * 2
        row.low = 99.0 + i * 2
        row.close = 101.0 + i * 2
        row.volume = 1000.0
        mock_rows.append(row)

    mock_res = MagicMock()
    mock_res.fetchall.return_value = mock_rows
    mock_session.execute.return_value = mock_res

    async def override_db() -> AsyncIterator[AsyncMock]:
        yield mock_session

    app.dependency_overrides[analytics_get_db] = override_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/regime?symbol=BTC/USDT")

    app.dependency_overrides.clear()

    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "BTC/USDT"
    assert data["regime"] == "trending_up"
    assert data["trend_score"] > 0
