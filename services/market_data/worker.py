"""Market data ingestion worker.

Runs six concurrent asyncio tasks:
  1. Ticker streaming
  2. OHLCV streaming (all configured timeframes)
  3. Trades streaming
  4. Order book streaming
  5. Health monitor
  6. Supervisor (restarts failed tasks with exponential backoff)

Reconnection: exponential backoff (1s base, 60s max).
On reconnect: triggers gap detection + backfill (Task 2.5/2.6).
"""
from __future__ import annotations

import asyncio
from collections.abc import Callable, Coroutine
from dataclasses import dataclass
import time
from typing import Any

import structlog

from packages.exchange.binance import BinanceCCXTAdapter
from services.market_data.health import FeedHealthMonitor
from services.market_data.publisher import MarketDataPublisher

logger = structlog.get_logger(__name__)


@dataclass
class WorkerConfig:
    symbols: list[str]
    timeframes: list[str]
    max_backoff_seconds: float = 60.0
    base_backoff_seconds: float = 1.0


class IngestionWorker:
    """Runs all market data streaming tasks with supervised restart."""

    def __init__(
        self,
        adapter: BinanceCCXTAdapter,
        publisher: MarketDataPublisher,
        health: FeedHealthMonitor,
        config: WorkerConfig,
        backfill_fn: Callable[[], Coroutine[Any, Any, None]] | None = None,
    ) -> None:
        self._adapter = adapter
        self._publisher = publisher
        self._health = health
        self._config = config
        self._backfill_fn = backfill_fn
        self._running = False

    async def run(self) -> None:
        self._running = True
        tasks: dict[str, Callable[[], Coroutine[Any, Any, None]]] = {
            "tickers": self._run_tickers,
            "ohlcv": self._run_ohlcv,
            "trades": self._run_trades,
            "orderbook": self._run_orderbook,
            "health": self._run_health_monitor,
        }
        attempts: dict[str, int] = {name: 0 for name in tasks}

        async def supervised(name: str, coro_fn: Callable[[], Coroutine[Any, Any, None]]) -> None:
            while self._running:
                start = time.monotonic()
                try:
                    await coro_fn()
                except asyncio.CancelledError:
                    return
                except Exception as exc:
                    elapsed = time.monotonic() - start
                    attempts[name] += 1
                    wait = min(
                        self._config.base_backoff_seconds * (2 ** attempts[name]),
                        self._config.max_backoff_seconds,
                    )
                    logger.warning(
                        "market_data_task_failed",
                        task=name,
                        error=str(exc),
                        attempt=attempts[name],
                        retry_in_seconds=wait,
                        disconnect_duration_seconds=elapsed,
                    )
                    await asyncio.sleep(wait)
                    # Trigger backfill after reconnect
                    if name in ("tickers", "ohlcv") and self._backfill_fn:
                        asyncio.create_task(self._backfill_fn())
                else:
                    attempts[name] = 0  # reset on clean exit

        await asyncio.gather(*[
            supervised(name, fn) for name, fn in tasks.items()
        ])

    async def stop(self) -> None:
        self._running = False
        await self._adapter.close()

    async def _run_tickers(self) -> None:
        async for ticker in self._adapter.stream_tickers(self._config.symbols):
            await self._publisher.publish_ticker(ticker)
            self._health.record_ticker(ticker.symbol)

    async def _run_ohlcv(self) -> None:
        async for candle in self._adapter.stream_ohlcv(
            self._config.symbols, self._config.timeframes
        ):
            await self._publisher.publish_candle(candle)
            self._health.record_candle(candle.symbol, candle.timeframe)

    async def _run_trades(self) -> None:
        async for trade in self._adapter.stream_trades(self._config.symbols):
            await self._publisher.publish_trade(trade)
            self._health.record_trade(trade.symbol)

    async def _run_orderbook(self) -> None:
        async for book in self._adapter.stream_orderbook(self._config.symbols):
            await self._publisher.publish_orderbook(book)

    async def _run_health_monitor(self) -> None:
        while self._running:
            self._health.check_all()
            await asyncio.sleep(10)
