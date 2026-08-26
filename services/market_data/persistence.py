"""TimescaleDB persistence worker.

Consumes Redis Streams via consumer group 'persistence'.
Accumulates events in a batch buffer (1s or 5000 events) then flushes.
XACK is sent only after successful DB commit.
On DB failure: do not ack; message redelivered on next XREADGROUP.
"""
from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from datetime import datetime
from decimal import Decimal
from typing import Any

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.events.streams import RedisStreamConsumer, StreamNames

logger = structlog.get_logger(__name__)

BATCH_MAX_EVENTS = 5000
BATCH_MAX_SECONDS = 1.0


class PersistenceWorker:
    def __init__(
        self,
        consumer: RedisStreamConsumer,
        session_factory: Callable[[], Any],
        trading_mode: str,
    ) -> None:
        self._consumer = consumer
        self._session_factory = session_factory
        self._trading_mode = trading_mode
        self._running = False

    @asynccontextmanager
    async def _get_session(self) -> AsyncIterator[AsyncSession]:
        res = self._session_factory()
        if hasattr(res, "__aenter__"):
            async with res as session:
                yield session
        else:
            yield res

    async def run(self) -> None:
        self._running = True
        streams = [StreamNames.MARKET_CANDLES, StreamNames.MARKET_TRADES]

        for stream in streams:
            await self._consumer.ensure_group(stream)

        candle_batch: list[tuple[str, dict[str, Any]]] = []  # (message_id, data)
        trade_batch: list[tuple[str, dict[str, Any]]] = []
        loop = asyncio.get_running_loop()
        last_flush = loop.time()

        while self._running:
            try:
                messages = await self._consumer.read(streams, count=500, block_ms=500)
            except Exception as exc:
                logger.error("persistence_read_failed", error=str(exc))
                await asyncio.sleep(1)
                continue

            for msg in messages:
                stream_name = msg.get("stream", "")
                msg_id = msg["id"]
                data = msg.get("payload") or msg.get("data") or {}

                if StreamNames.MARKET_CANDLES in stream_name:
                    candle_batch.append((msg_id, data))
                elif StreamNames.MARKET_TRADES in stream_name:
                    trade_batch.append((msg_id, data))

            now = loop.time()
            should_flush = (
                len(candle_batch) + len(trade_batch) >= BATCH_MAX_EVENTS
                or (now - last_flush) >= BATCH_MAX_SECONDS
            )

            if should_flush and (candle_batch or trade_batch):
                try:
                    await self._flush(candle_batch, trade_batch)
                    # Ack only on success
                    for msg_id, _ in candle_batch:
                        await self._consumer.ack(StreamNames.MARKET_CANDLES, msg_id)
                    for msg_id, _ in trade_batch:
                        await self._consumer.ack(StreamNames.MARKET_TRADES, msg_id)
                    candle_batch.clear()
                    trade_batch.clear()
                except Exception as exc:
                    logger.error("persistence_flush_failed", error=str(exc))
                    # Do NOT clear batches — retry on next iteration
                    await asyncio.sleep(1)
                last_flush = loop.time()

    async def _flush(
        self,
        candle_batch: list[tuple[str, dict[str, Any]]],
        trade_batch: list[tuple[str, dict[str, Any]]],
    ) -> None:
        async with self._get_session() as session:
            async with session.begin():
                if candle_batch:
                    await self._upsert_candles(session, [d for _, d in candle_batch])
                if trade_batch:
                    await self._upsert_trades(session, [d for _, d in trade_batch])

    async def _upsert_candles(
        self, session: AsyncSession, batch: list[dict[str, Any]]
    ) -> None:
        rows = [
            {
                "symbol": d["symbol"],
                "timeframe": d["timeframe"],
                "timestamp": datetime.fromisoformat(str(d["timestamp"])),
                "open": Decimal(str(d["open"])),
                "high": Decimal(str(d["high"])),
                "low": Decimal(str(d["low"])),
                "close": Decimal(str(d["close"])),
                "volume": Decimal(str(d["volume"])),
                "is_closed": d.get("is_closed") in ("1", "true", "True", True, 1),
                "trading_mode": self._trading_mode,
            }
            for d in batch
        ]
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
                    open = EXCLUDED.open, high = EXCLUDED.high,
                    low = EXCLUDED.low, close = EXCLUDED.close,
                    volume = EXCLUDED.volume, is_closed = EXCLUDED.is_closed
                WHERE NOT market_candles.is_closed
            """),
            rows,
        )

    async def _upsert_trades(
        self, session: AsyncSession, batch: list[dict[str, Any]]
    ) -> None:
        rows = [
            {
                "symbol": d["symbol"],
                "timestamp": datetime.fromisoformat(str(d["timestamp"])),
                "price": Decimal(str(d["price"])),
                "amount": Decimal(str(d["amount"])),
                "side": d["side"],
                "exchange_trade_id": str(d["exchange_trade_id"]),
                "trading_mode": self._trading_mode,
            }
            for d in batch
        ]
        await session.execute(
            text("""
                INSERT INTO market_trades
                    (symbol, timestamp, price, amount, side, exchange_trade_id, trading_mode)
                VALUES
                    (:symbol, :timestamp, :price, :amount, :side, :exchange_trade_id, :trading_mode)
                ON CONFLICT DO NOTHING
            """),
            rows,
        )

    async def stop(self) -> None:
        self._running = False
