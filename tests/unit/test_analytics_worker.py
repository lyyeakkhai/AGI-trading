from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest

from packages.domain.enums import MarketRegime
from services.analytics.worker import AnalyticsWorker


@pytest.mark.asyncio
async def test_analytics_worker_ingest_candle_sliding_window() -> None:
    worker = AnalyticsWorker()
    base_time = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)

    for i in range(30):
        candle = {
            "symbol": "BTC/USDT",
            "timeframe": "1h",
            "timestamp": (base_time + timedelta(hours=i)).isoformat(),
            "open": 50000.0 + i * 100,
            "high": 50100.0 + i * 100,
            "low": 49900.0 + i * 100,
            "close": 50050.0 + i * 100,
            "volume": 10.0 + (i % 5),
            "is_closed": True,
        }
        res = await worker.ingest_candle(candle)

    assert res["symbol"] == "BTC/USDT"
    assert res["timeframe"] == "1h"
    assert "indicators" in res

    indicators = worker.get_latest_indicators("BTC/USDT", "1h")
    assert indicators is not None
    assert indicators["indicators"]["sma_20"] is not None
    assert indicators["indicators"]["ema_20"] is not None
    assert indicators["indicators"]["rsi_14"] is not None
    assert indicators["indicators"]["rvol_20"] is not None

    regime = worker.get_latest_regime("BTC/USDT")
    assert regime is not None
    assert regime.regime == MarketRegime.TRENDING_UP


@pytest.mark.asyncio
async def test_analytics_worker_consumer_loop() -> None:
    mock_consumer = MagicMock()
    mock_consumer.ensure_group = AsyncMock()
    mock_consumer.read = AsyncMock(
        side_effect=[
            [
                {
                    "id": "1-0",
                    "stream": "stream:market:candles",
                    "payload": {
                        "symbol": "ETH/USDT",
                        "timeframe": "15m",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "open": "3000",
                        "high": "3050",
                        "low": "2980",
                        "close": "3020",
                        "volume": "100",
                        "is_closed": "1",
                    },
                }
            ],
            [],
        ]
    )
    mock_consumer.ack = AsyncMock()

    worker = AnalyticsWorker(consumer=mock_consumer)

    import asyncio

    task = asyncio.create_task(worker.run())
    await asyncio.sleep(0.05)
    await worker.stop()
    await task

    mock_consumer.ensure_group.assert_awaited_once()
    mock_consumer.ack.assert_awaited_once()
    assert worker.get_latest_indicators("ETH/USDT", "15m") is not None
