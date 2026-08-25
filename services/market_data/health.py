"""Feed staleness monitor.

Tracks last-received timestamps per stream type / symbol / timeframe.
check_all() updates is_ready based on configurable staleness thresholds.
"""
from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Any

import structlog

logger = structlog.get_logger(__name__)

CANDLE_STALE_SECONDS: dict[str, float] = {
    "1m": 120,
    "15m": 300,
    "1h": 900,
    "4h": 3600,
}


@dataclass
class FeedConfig:
    symbols: list[str]
    timeframes: list[str]
    ticker_stale_seconds: float
    trade_stale_seconds: float


class FeedHealthMonitor:
    """Tracks feed freshness and exposes is_ready flag."""

    def __init__(self, config: FeedConfig) -> None:
        self._config = config
        self._last_ticker: dict[str, float] = {}
        self._last_trade: dict[str, float] = {}
        self._last_candle: dict[tuple[str, str], float] = {}
        self._ready = False
        self._stale_reasons: list[str] = []

    @property
    def is_ready(self) -> bool:
        return self._ready

    @property
    def stale_reasons(self) -> list[str]:
        return list(self._stale_reasons)

    def record_ticker(self, symbol: str) -> None:
        self._last_ticker[symbol] = time.monotonic()

    def record_trade(self, symbol: str) -> None:
        self._last_trade[symbol] = time.monotonic()

    def record_candle(self, symbol: str, timeframe: str) -> None:
        self._last_candle[(symbol, timeframe)] = time.monotonic()

    def check_all(self) -> None:
        now = time.monotonic()
        reasons: list[str] = []

        for symbol in self._config.symbols:
            # Ticker
            last = self._last_ticker.get(symbol, 0.0)
            age = now - last if last > 0 else float("inf")
            if age > self._config.ticker_stale_seconds:
                reasons.append(f"ticker:{symbol}:stale:{age:.0f}s" if last > 0 else f"ticker:{symbol}:missing")

            # Trades
            last = self._last_trade.get(symbol, 0.0)
            age = now - last if last > 0 else float("inf")
            if age > self._config.trade_stale_seconds:
                reasons.append(f"trades:{symbol}:stale:{age:.0f}s" if last > 0 else f"trades:{symbol}:missing")

            # Candles
            for tf in self._config.timeframes:
                last = self._last_candle.get((symbol, tf), 0.0)
                age = now - last if last > 0 else float("inf")
                threshold = CANDLE_STALE_SECONDS.get(tf, 120.0)
                if age > threshold:
                    reasons.append(f"candle:{symbol}:{tf}:stale:{age:.0f}s" if last > 0 else f"candle:{symbol}:{tf}:missing")

        self._stale_reasons = reasons
        was_ready = self._ready
        self._ready = len(reasons) == 0

        if was_ready and not self._ready:
            logger.warning("market_data_feed_stale", reasons=reasons)
        elif not was_ready and self._ready:
            logger.info("market_data_feed_recovered")


_global_monitor: FeedHealthMonitor | None = None


def set_global_health_monitor(monitor: FeedHealthMonitor) -> None:
    global _global_monitor
    _global_monitor = monitor


def get_global_health_monitor() -> FeedHealthMonitor | None:
    return _global_monitor
