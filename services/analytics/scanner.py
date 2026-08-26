"""Deterministic opportunity detection scanner.

Evaluates multi-timeframe analytics, market structure (swing highs/lows),
volume anomalies (RVOL), and regime classifications against deterministic trading rules.
Publishes qualifying opportunities to Redis stream:market:opportunities.
"""
from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

import numpy as np
import pandas as pd
import structlog

from packages.domain.enums import MarketRegime
from packages.events.streams import RedisStreamPublisher, StreamNames
from packages.quant.regime import RegimeDetails
from packages.quant.scoring import ConfidenceScore, calculate_confidence
from packages.quant.structure import (
    detect_breakout,
    detect_swing_highs_lows,
    identify_key_levels,
)

logger = structlog.get_logger(__name__)


class OpportunityScanner:
    """Evaluates market state and emits deterministic opportunity signals."""

    def __init__(
        self,
        publisher: RedisStreamPublisher | None = None,
        trading_mode: str = "paper",
        min_confidence_score: Decimal = Decimal("0.40"),
    ) -> None:
        self._publisher = publisher
        self._trading_mode = trading_mode
        self._min_confidence_score = min_confidence_score

    async def evaluate(
        self,
        symbol: str,
        timeframe: str,
        timestamp: datetime,
        indicators: dict[str, Any],
        regime_details: RegimeDetails,
        df: pd.DataFrame,
    ) -> list[dict[str, Any]]:
        """Evaluate market conditions and publish detected opportunities.

        Returns list of generated opportunity dictionaries.
        """
        if len(df) < 15:
            return []

        close_series = df["close"].to_numpy(dtype=np.float64)
        high_series = df["high"].to_numpy(dtype=np.float64)
        low_series = df["low"].to_numpy(dtype=np.float64)
        open_series = df["open"].to_numpy(dtype=np.float64)

        curr_close = float(close_series[-1])
        curr_open = float(open_series[-1])

        # Detect swing points and key S/R levels
        window_size = max(2, min(5, len(df) // 5))
        swing_h, swing_l = detect_swing_highs_lows(high_series, low_series, window=window_size)
        levels = identify_key_levels(swing_h, swing_l)
        resistance = levels["resistance"]
        support = levels["support"]

        breakout_status = detect_breakout(curr_close, resistance, support)

        rvol = float(indicators.get("rvol_20") or 1.0)
        rsi_val = indicators.get("rsi_14")
        ema20 = indicators.get("ema_20")
        ema50 = indicators.get("ema_50")
        macd_hist = indicators.get("macd_hist")

        detected_signals: list[tuple[str, str]] = []  # (signal_type, direction)

        # 1. Breakout Rules
        if breakout_status == "bullish_breakout" and rvol >= 1.2:
            detected_signals.append(("BULLISH_BREAKOUT", "bullish"))
        elif breakout_status == "bearish_breakout" and rvol >= 1.2:
            detected_signals.append(("BEARISH_BREAKDOWN", "bearish"))

        # 2. Trend Pullback Continuation Rules
        if regime_details.regime == MarketRegime.TRENDING_UP:
            if ema20 is not None and abs(curr_close - ema20) / curr_close < 0.015:
                if curr_close >= curr_open and (rsi_val is None or 38.0 <= rsi_val <= 65.0):
                    detected_signals.append(("TREND_PULLBACK_LONG", "bullish"))
        elif regime_details.regime == MarketRegime.TRENDING_DOWN:
            if ema20 is not None and abs(curr_close - ema20) / curr_close < 0.015:
                if curr_close <= curr_open and (rsi_val is None or 35.0 <= rsi_val <= 62.0):
                    detected_signals.append(("TREND_PULLBACK_SHORT", "bearish"))

        # 3. Mean Reversion in Ranging/Low Volatility Regimes
        if regime_details.regime in (MarketRegime.RANGING, MarketRegime.LOW_VOLATILITY):
            if rsi_val is not None and rsi_val <= 30.0 and curr_close >= curr_open:
                detected_signals.append(("MEAN_REVERSION_LONG", "bullish"))
            elif rsi_val is not None and rsi_val >= 70.0 and curr_close <= curr_open:
                detected_signals.append(("MEAN_REVERSION_SHORT", "bearish"))

        opportunities: list[dict[str, Any]] = []

        for signal_type, direction in detected_signals:
            confidence = calculate_confidence(
                timeframe_confluence=regime_details.confluence,
                rvol=rvol,
                regime=regime_details.regime,
                signal_direction=direction,
                indicator_alignment={"rsi": rsi_val, "macd_hist": macd_hist},
            )

            if confidence.score < self._min_confidence_score:
                continue

            opp_id = uuid.uuid4()
            payload = {
                "id": str(opp_id),
                "symbol": symbol,
                "timeframe": timeframe,
                "signal_type": signal_type,
                "regime": regime_details.regime.value,
                "confidence": str(confidence.score),
                "confidence_level": confidence.level.value,
                "confidence_reason": confidence.reason,
                "indicators": indicators,
                "timestamp": timestamp.isoformat(),
                "trading_mode": self._trading_mode,
                "correlation_id": str(uuid.uuid4()),
            }

            if self._publisher:
                try:
                    await self._publisher.publish(StreamNames.OPPORTUNITIES, payload)
                except Exception as exc:
                    logger.error(
                        "publish_opportunity_failed",
                        opportunity_id=str(opp_id),
                        error=str(exc),
                    )

            opportunities.append(payload)

        return opportunities
