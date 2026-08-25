"""Gap detection and REST historical candle backfill.

Runs on startup and after every WebSocket reconnect.
Writes directly to TimescaleDB — bypasses Redis Streams.
Redis is not authoritative; a gap there is acceptable.
All backfilled candles are is_closed=True.
"""
from __future__ import annotations

from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.exchange.binance import BinanceCCXTAdapter
from packages.exchange.models import OHLCVCandle

logger = structlog.get_logger(__name__)

# Maximum number of days to backfill in one reconnect cycle
MAX_BACKFILL_DAYS = 30

TIMEFRAME_DURATION: dict[str, timedelta] = {
    "1m": timedelta(minutes=1),
    "15m": timedelta(minutes=15),
    "1h": timedelta(hours=1),
    "4h": timedelta(hours=4),
    "1d": timedelta(days=1),
}


class BackfillService:
    def __init__(
        self,
        adapter: BinanceCCXTAdapter,
        session_factory: Callable[[], Any],
        trading_mode: str,
    ) -> None:
        self._adapter = adapter
        self._session_factory = session_factory
        self._trading_mode = trading_mode

    @asynccontextmanager
    async def _get_session(self) -> AsyncIterator[AsyncSession]:
        res = self._session_factory()
        if hasattr(res, "__aenter__"):
            async with res as session:
                yield session
        else:
            yield res

    async def run_backfill(
        self, symbols: list[str], timeframes: list[str]
    ) -> None:
        for symbol in symbols:
            for timeframe in timeframes:
                await self._backfill_one(symbol, timeframe)

    async def _backfill_one(self, symbol: str, timeframe: str) -> None:
        tf_duration = TIMEFRAME_DURATION.get(timeframe, timedelta(minutes=1))
        max_backfill_start = datetime.now(timezone.utc) - timedelta(days=MAX_BACKFILL_DAYS)

        async with self._get_session() as session:
            # Find latest closed candle in DB
            result = await session.execute(
                text("""
                    SELECT MAX(timestamp)
                    FROM market_candles
                    WHERE symbol = :symbol
                      AND timeframe = :timeframe
                      AND trading_mode = :trading_mode
                      AND is_closed = TRUE
                """),
                {"symbol": symbol, "timeframe": timeframe, "trading_mode": self._trading_mode},
            )
            latest_ts = result.scalar()

        if latest_ts is None:
            since = max_backfill_start
        else:
            if latest_ts.tzinfo is None:
                since = latest_ts.replace(tzinfo=timezone.utc)
            else:
                since = latest_ts
            if since < max_backfill_start:
                logger.warning(
                    "backfill_gap_too_large",
                    symbol=symbol,
                    timeframe=timeframe,
                    gap_days=(datetime.now(timezone.utc) - since).days,
                    truncating_to_days=MAX_BACKFILL_DAYS,
                )
                since = max_backfill_start

        now = datetime.now(timezone.utc)
        # Buffer: exclude the currently forming candle
        end = now - (2 * tf_duration)
        if since >= end:
            return  # No gap

        gap_seconds = (end - since).total_seconds()
        logger.info(
            "backfill_starting",
            symbol=symbol,
            timeframe=timeframe,
            since=since.isoformat(),
            gap_seconds=gap_seconds,
        )

        candles = await self._adapter.get_candles(symbol, timeframe, since, limit=1000)
        closed = [c for c in candles if c.is_closed]

        if not closed:
            return

        await self._upsert_candles(closed)
        logger.info(
            "backfill_complete",
            symbol=symbol,
            timeframe=timeframe,
            rows_backfilled=len(closed),
        )

    async def _upsert_candles(self, candles: list[OHLCVCandle]) -> None:
        async with self._get_session() as session:
            async with session.begin():
                await session.execute(
                    text("""
                        INSERT INTO market_candles
                            (symbol, timeframe, timestamp, open, high, low, close, volume,
                             is_closed, trading_mode)
                        VALUES
                            (:symbol, :timeframe, :timestamp, :open, :high, :low, :close,
                             :volume, :is_closed, :trading_mode)
                        ON CONFLICT (symbol, timeframe, timestamp)
                        DO UPDATE SET
                            open = EXCLUDED.open,
                            high = EXCLUDED.high,
                            low = EXCLUDED.low,
                            close = EXCLUDED.close,
                            volume = EXCLUDED.volume
                        WHERE NOT market_candles.is_closed
                    """),
                    [
                        {
                            "symbol": c.symbol,
                            "timeframe": c.timeframe,
                            "timestamp": c.timestamp,
                            "open": c.open,
                            "high": c.high,
                            "low": c.low,
                            "close": c.close,
                            "volume": c.volume,
                            "is_closed": c.is_closed,
                            "trading_mode": self._trading_mode,
                        }
                        for c in candles
                    ],
                )
