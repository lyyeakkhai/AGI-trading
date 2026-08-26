"""Continuous analytics worker consuming market candle streams.

Maintains an in-memory sliding window of candle data per symbol/timeframe,
calculates technical indicators and market regimes in real-time,
and coordinates snapshot persistence and opportunity scanning.
"""
from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd
import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.events.streams import RedisStreamConsumer, StreamNames
from packages.quant.indicators import (
    adx,
    atr,
    ema,
    macd,
    rsi,
    sma,
)
from packages.quant.regime import (
    RegimeDetails,
    classify_regime_detailed,
)
from packages.quant.structure import calculate_rvol

logger = structlog.get_logger(__name__)


class AnalyticsWorker:
    """Consumes market candles, updates rolling technical indicators and market regimes."""

    def __init__(
        self,
        consumer: RedisStreamConsumer | None = None,
        session_factory: Callable[[], Any] | None = None,
        scanner: Any | None = None,
        trading_mode: str = "paper",
        max_window_size: int = 500,
    ) -> None:
        self._consumer = consumer
        self._session_factory = session_factory
        self._scanner = scanner
        self._trading_mode = trading_mode
        self._max_window_size = max_window_size
        self._running = False

        # In-memory sliding windows: (symbol, timeframe) -> list[dict]
        self._candles: dict[tuple[str, str], list[dict[str, Any]]] = {}

        # Latest analytics cache
        self._latest_indicators: dict[tuple[str, str], dict[str, Any]] = {}
        self._latest_regimes: dict[str, RegimeDetails] = {}

    @asynccontextmanager
    async def _get_session(self) -> AsyncIterator[AsyncSession]:
        if self._session_factory is None:
            raise RuntimeError("Database session factory is not configured")
        res = self._session_factory()
        if hasattr(res, "__aenter__"):
            async with res as session:
                yield session
        else:
            yield res

    def get_dataframe(self, symbol: str, timeframe: str) -> pd.DataFrame | None:
        """Return a copy of the sliding window as a Pandas DataFrame."""
        candles = self._candles.get((symbol, timeframe))
        if not candles:
            return None
        return pd.DataFrame(candles)

    def get_latest_indicators(self, symbol: str, timeframe: str) -> dict[str, Any] | None:
        """Return latest computed indicators for a symbol/timeframe."""
        return self._latest_indicators.get((symbol, timeframe))

    def get_latest_regime(self, symbol: str) -> RegimeDetails | None:
        """Return latest classified regime for a symbol."""
        return self._latest_regimes.get(symbol)

    def compute_indicators(self, df: pd.DataFrame) -> dict[str, Any]:
        """Compute all quantitative indicators from a candle DataFrame."""
        if len(df) == 0:
            return {}

        close = df["close"].to_numpy(dtype=np.float64)
        high = df["high"].to_numpy(dtype=np.float64)
        low = df["low"].to_numpy(dtype=np.float64)
        volume = df["volume"].to_numpy(dtype=np.float64)

        indicators_out: dict[str, Any] = {}

        def _last_or_none(arr: np.ndarray) -> float | None:
            if len(arr) == 0:
                return None
            val = arr[-1]
            return None if np.isnan(val) else float(val)

        # SMAs
        indicators_out["sma_20"] = _last_or_none(sma(close, period=20))
        indicators_out["sma_50"] = _last_or_none(sma(close, period=50))
        indicators_out["sma_200"] = _last_or_none(sma(close, period=200))

        # EMAs
        indicators_out["ema_9"] = _last_or_none(ema(close, period=9))
        indicators_out["ema_20"] = _last_or_none(ema(close, period=20))
        indicators_out["ema_50"] = _last_or_none(ema(close, period=50))

        # RSI
        indicators_out["rsi_14"] = _last_or_none(rsi(close, period=14))

        # MACD
        m_line, s_line, h_line = macd(close, fastperiod=12, slowperiod=26, signalperiod=9)
        indicators_out["macd"] = _last_or_none(m_line)
        indicators_out["macd_signal"] = _last_or_none(s_line)
        indicators_out["macd_hist"] = _last_or_none(h_line)

        # ATR & ADX
        indicators_out["atr_14"] = _last_or_none(atr(high, low, close, period=14))
        indicators_out["adx_14"] = _last_or_none(adx(high, low, close, period=14))

        # RVOL
        indicators_out["rvol_20"] = _last_or_none(calculate_rvol(volume, period=20))

        return indicators_out

    async def ingest_candle(self, candle_data: dict[str, Any]) -> dict[str, Any]:
        """Ingest a single candle event, update window, recalculate indicators and regime."""
        symbol = str(candle_data["symbol"])
        timeframe = str(candle_data["timeframe"])

        ts_raw = candle_data["timestamp"]
        if isinstance(ts_raw, str):
            ts = datetime.fromisoformat(ts_raw)
        elif isinstance(ts_raw, datetime):
            ts = ts_raw
        else:
            ts = datetime.now(timezone.utc)

        open_val = float(candle_data["open"])
        high_val = float(candle_data["high"])
        low_val = float(candle_data["low"])
        close_val = float(candle_data["close"])
        volume_val = float(candle_data["volume"])
        is_closed = candle_data.get("is_closed") in (True, 1, "1", "true", "True")

        key = (symbol, timeframe)
        if key not in self._candles:
            self._candles[key] = []

        window = self._candles[key]

        # Check if candle exists at timestamp
        existing_idx = next((i for i, c in enumerate(window) if c["timestamp"] == ts), None)
        candle_entry = {
            "timestamp": ts,
            "open": open_val,
            "high": high_val,
            "low": low_val,
            "close": close_val,
            "volume": volume_val,
            "is_closed": is_closed,
        }

        if existing_idx is not None:
            window[existing_idx] = candle_entry
        else:
            window.append(candle_entry)
            window.sort(key=lambda c: c["timestamp"])
            if len(window) > self._max_window_size:
                self._candles[key] = window[-self._max_window_size :]

        # Compute updated indicators
        df = pd.DataFrame(self._candles[key])
        computed_ind = self.compute_indicators(df)
        self._latest_indicators[key] = {
            "symbol": symbol,
            "timeframe": timeframe,
            "timestamp": ts,
            "indicators": computed_ind,
        }

        # Multi-timeframe regime update
        df_15m = self.get_dataframe(symbol, "15m")
        df_1h = self.get_dataframe(symbol, "1h")
        df_4h = self.get_dataframe(symbol, "4h")

        regime_details = classify_regime_detailed(
            df_15m=df_15m,
            df_1h=df_1h,
            df_4h=df_4h,
        )
        self._latest_regimes[symbol] = regime_details

        # On candle close, persist snapshots & trigger opportunity scanner
        if is_closed:
            if self._session_factory:
                await self._persist_snapshot(symbol, timeframe, ts, computed_ind)

            if self._scanner:
                await self._scanner.evaluate(
                    symbol=symbol,
                    timeframe=timeframe,
                    timestamp=ts,
                    indicators=computed_ind,
                    regime_details=regime_details,
                    df=df,
                )

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "timestamp": ts,
            "indicators": computed_ind,
            "regime": regime_details.regime.value,
        }

    async def _persist_snapshot(
        self,
        symbol: str,
        timeframe: str,
        timestamp: datetime,
        indicators_dict: dict[str, Any],
    ) -> None:
        """Persist indicator snapshot to TimescaleDB."""
        if not self._session_factory:
            return

        try:
            async with self._get_session() as session:
                stmt = text("""
                    INSERT INTO indicator_snapshots
                        (symbol, timeframe, timestamp, indicators, trading_mode)
                    VALUES
                        (:symbol, :timeframe, :timestamp, :indicators, :trading_mode)
                    ON CONFLICT (symbol, timeframe, timestamp)
                    DO UPDATE SET
                        indicators = EXCLUDED.indicators
                """)
                params = {
                    "symbol": symbol,
                    "timeframe": timeframe,
                    "timestamp": timestamp,
                    "indicators": indicators_dict,
                    "trading_mode": self._trading_mode,
                }

                if hasattr(session, "begin"):
                    begin_res = session.begin()
                    if hasattr(begin_res, "__aenter__"):
                        async with begin_res:
                            await session.execute(stmt, params)
                    else:
                        await session.execute(stmt, params)
                else:
                    await session.execute(stmt, params)
        except Exception as exc:
            logger.error(
                "persist_indicator_snapshot_failed",
                symbol=symbol,
                timeframe=timeframe,
                error=str(exc),
            )

    async def run(self) -> None:
        """Main consumer loop reading from StreamNames.MARKET_CANDLES."""
        if not self._consumer:
            raise RuntimeError("Redis stream consumer is not configured")

        self._running = True
        stream = StreamNames.MARKET_CANDLES
        await self._consumer.ensure_group(stream)

        logger.info("analytics_worker_started", stream=stream)

        while self._running:
            try:
                messages = await self._consumer.read([stream], count=100, block_ms=500)
            except Exception as exc:
                logger.error("analytics_worker_read_error", error=str(exc))
                await asyncio.sleep(1)
                continue

            for msg in messages:
                msg_id = msg["id"]
                payload = msg.get("payload") or {}
                try:
                    await self.ingest_candle(payload)
                    await self._consumer.ack(stream, msg_id)
                except Exception as exc:
                    logger.error(
                        "analytics_worker_process_error",
                        msg_id=msg_id,
                        error=str(exc),
                    )

    async def stop(self) -> None:
        self._running = False
