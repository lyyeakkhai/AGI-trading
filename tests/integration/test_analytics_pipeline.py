"""End-to-end integration test suite for Foundation 5 Quantitative Analytics pipeline."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
import pytest

from packages.domain.enums import MarketRegime
from packages.events.streams import StreamNames
from packages.quant.indicators import TALIB_AVAILABLE
from services.analytics.scanner import OpportunityScanner
from services.analytics.worker import AnalyticsWorker


@pytest.mark.asyncio
async def test_full_analytics_pipeline_simulation() -> None:
    # 1. Setup mocks for Redis publisher and DB session
    mock_publisher = MagicMock()
    mock_publisher.publish = AsyncMock()

    persisted_snapshots: list[dict] = []
    mock_session = AsyncMock()

    async def mock_execute(stmt, params):
        if "INSERT INTO indicator_snapshots" in str(stmt):
            persisted_snapshots.append(params)
        return MagicMock()

    mock_session.execute.side_effect = mock_execute

    class MockContextManager:
        async def __aenter__(self) -> None:
            return None

        async def __aexit__(self, exc_type: object, exc_val: object, exc_tb: object) -> None:
            return None

    mock_session.begin = MagicMock(return_value=MockContextManager())

    def session_factory() -> AsyncMock:
        return mock_session

    # 2. Instantiate scanner and analytics worker
    scanner = OpportunityScanner(
        publisher=mock_publisher,
        trading_mode="paper",
        min_confidence_score=Decimal("0.40"),
    )
    worker = AnalyticsWorker(
        session_factory=session_factory,
        scanner=scanner,
        trading_mode="paper",
    )

    # 3. Simulate 40 candles: 39 consolidation around 50k, 40th breakout to 53k with high volume
    base_time = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
    for i in range(40):
        ts = base_time + timedelta(hours=i)
        is_breakout = i == 39
        open_price = 50000.0 if not is_breakout else 50500.0
        close_price = (50000.0 + (i % 3) * 50) if not is_breakout else 53000.0
        high_price = 50200.0 if not is_breakout else 53200.0
        low_price = 49800.0 if not is_breakout else 50400.0
        volume = 100.0 if not is_breakout else 350.0

        candle = {
            "symbol": "BTC/USDT",
            "timeframe": "1h",
            "timestamp": ts.isoformat(),
            "open": open_price,
            "high": high_price,
            "low": low_price,
            "close": close_price,
            "volume": volume,
            "is_closed": True,
        }
        await worker.ingest_candle(candle)

    # 4. Verify DB persistence: 40 closed candles should result in 40 snapshot inserts
    assert len(persisted_snapshots) == 40
    last_snapshot = persisted_snapshots[-1]
    assert last_snapshot["symbol"] == "BTC/USDT"
    assert last_snapshot["timeframe"] == "1h"
    assert last_snapshot["trading_mode"] == "paper"
    assert "rsi_14" in last_snapshot["indicators"]
    assert "ema_20" in last_snapshot["indicators"]

    # 5. Verify Opportunity Scanner published breakout opportunity to Redis stream
    assert mock_publisher.publish.await_count >= 1
    calls = [c for c in mock_publisher.publish.call_args_list if c[0][0] == StreamNames.OPPORTUNITIES]
    assert len(calls) >= 1

    last_opp = calls[-1][0][1]
    assert last_opp["symbol"] == "BTC/USDT"
    assert last_opp["timeframe"] == "1h"
    assert last_opp["signal_type"] == "BULLISH_BREAKOUT"
    assert Decimal(last_opp["confidence"]) >= Decimal("0.50")
    assert last_opp["trading_mode"] == "paper"
    assert "id" in last_opp
    assert "correlation_id" in last_opp


@pytest.mark.asyncio
async def test_multi_timeframe_regime_confluence_pipeline() -> None:
    worker = AnalyticsWorker(trading_mode="paper")
    base_time = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)

    # Feed 50 candles for 15m, 1h, 4h uptrend data
    for i in range(50):
        price = 100.0 + i * 2.0
        c_15m = {
            "symbol": "ETH/USDT",
            "timeframe": "15m",
            "timestamp": (base_time + timedelta(minutes=15 * i)).isoformat(),
            "open": price,
            "high": price + 1.0,
            "low": price - 1.0,
            "close": price + 0.5,
            "volume": 100.0,
            "is_closed": True,
        }
        c_1h = {
            "symbol": "ETH/USDT",
            "timeframe": "1h",
            "timestamp": (base_time + timedelta(hours=i)).isoformat(),
            "open": price,
            "high": price + 2.0,
            "low": price - 2.0,
            "close": price + 1.0,
            "volume": 400.0,
            "is_closed": True,
        }
        c_4h = {
            "symbol": "ETH/USDT",
            "timeframe": "4h",
            "timestamp": (base_time + timedelta(hours=4 * i)).isoformat(),
            "open": price,
            "high": price + 4.0,
            "low": price - 4.0,
            "close": price + 2.0,
            "volume": 1600.0,
            "is_closed": True,
        }
        await worker.ingest_candle(c_15m)
        await worker.ingest_candle(c_1h)
        await worker.ingest_candle(c_4h)

    regime = worker.get_latest_regime("ETH/USDT")
    assert regime is not None
    assert regime.regime == MarketRegime.TRENDING_UP
    assert regime.trend_score > 0.5
    assert regime.confluence == 1.0


def test_quant_graceful_degradation_flag() -> None:
    # Ensure TALIB_AVAILABLE is a valid boolean
    assert isinstance(TALIB_AVAILABLE, bool)
