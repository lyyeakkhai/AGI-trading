"""End-to-end pipeline test: mock event → Redis → persist → DB row.

Requires: running Redis and TimescaleDB (docker compose up -d).
Mark: @pytest.mark.integration
"""
import asyncio
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.events.client import RedisClient
from packages.events.streams import RedisStreamConsumer, RedisStreamPublisher
from packages.exchange.models import OHLCVCandle
from services.market_data.persistence import PersistenceWorker
from services.market_data.publisher import MarketDataPublisher

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_candle_event_persisted_to_timescaledb(
    db_session: AsyncSession, redis_client: RedisClient
) -> None:
    """Publish a candle to Redis, run persistence worker one cycle, verify DB row."""
    pub = MarketDataPublisher(RedisStreamPublisher(redis_client))
    candle = OHLCVCandle(
        symbol="BTC/USDT",
        timeframe="1m",
        timestamp=datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc),
        open=Decimal("42000"),
        high=Decimal("42100"),
        low=Decimal("41900"),
        close=Decimal("42050"),
        volume=Decimal("10"),
        is_closed=True,
    )
    await pub.publish_candle(candle)

    consumer = RedisStreamConsumer(redis_client, group="persistence-test", consumer="worker-1")
    worker = PersistenceWorker(consumer, lambda: db_session, trading_mode="paper")

    async def run_one_cycle() -> None:
        worker._running = True
        await asyncio.wait_for(worker.run(), timeout=3.0)

    with pytest.raises(TimeoutError):
        await run_one_cycle()

    result = await db_session.execute(
        text("SELECT symbol, close FROM market_candles WHERE symbol = 'BTC/USDT' AND timeframe = '1m'")
    )
    row = result.fetchone()
    assert row is not None
    assert str(row.close) == "42050"
