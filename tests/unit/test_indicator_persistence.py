from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest

from packages.database.models.analytics import IndicatorSnapshotModel
from services.analytics.worker import AnalyticsWorker


def test_indicator_snapshot_model_structure() -> None:
    assert IndicatorSnapshotModel.__tablename__ == "indicator_snapshots"


@pytest.mark.asyncio
async def test_analytics_worker_persists_snapshot_on_closed_candle() -> None:
    mock_session = AsyncMock()
    mock_session.execute = AsyncMock()

    class MockContextManager:
        async def __aenter__(self) -> None:
            return None

        async def __aexit__(self, exc_type: object, exc_val: object, exc_tb: object) -> None:
            return None

    mock_session.begin = MagicMock(return_value=MockContextManager())

    def session_factory() -> AsyncMock:
        return mock_session

    worker = AnalyticsWorker(session_factory=session_factory, trading_mode="live")
    base_time = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)

    # Ingest 25 candles, last one is_closed=True
    for i in range(25):
        candle = {
            "symbol": "SOL/USDT",
            "timeframe": "1h",
            "timestamp": (base_time + timedelta(hours=i)).isoformat(),
            "open": 100.0 + i,
            "high": 105.0 + i,
            "low": 98.0 + i,
            "close": 102.0 + i,
            "volume": 500.0,
            "is_closed": i == 24,
        }
        await worker.ingest_candle(candle)

    mock_session.execute.assert_awaited_once()
    query_str, params = mock_session.execute.call_args[0]
    assert "INSERT INTO indicator_snapshots" in str(query_str)
    assert params["symbol"] == "SOL/USDT"
    assert params["timeframe"] == "1h"
    assert params["trading_mode"] == "live"
    assert "rsi_14" in params["indicators"]


@pytest.mark.asyncio
async def test_persistence_error_handling_does_not_crash_worker() -> None:
    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(side_effect=Exception("DB Connection Timeout"))

    class MockContextManager:
        async def __aenter__(self) -> None:
            return None

        async def __aexit__(self, exc_type: object, exc_val: object, exc_tb: object) -> None:
            return None

    mock_session.begin = MagicMock(return_value=MockContextManager())

    worker = AnalyticsWorker(session_factory=lambda: mock_session)

    candle = {
        "symbol": "SOL/USDT",
        "timeframe": "1h",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "open": 100.0,
        "high": 105.0,
        "low": 98.0,
        "close": 102.0,
        "volume": 500.0,
        "is_closed": True,
    }
    # Should not raise exception
    res = await worker.ingest_candle(candle)
    assert res["symbol"] == "SOL/USDT"
