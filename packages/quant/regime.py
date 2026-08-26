"""Multi-timeframe market regime classification.

Combines exponential moving average slopes, Average True Range (ATR) volatility levels,
and Average Directional Index (ADX) trend strength across multiple timeframes (15m, 1h, 4h)
to output deterministic market regimes.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from packages.domain.enums import MarketRegime
from packages.quant.indicators import adx, atr, ema


@dataclass(frozen=True)
class RegimeDetails:
    regime: MarketRegime
    trend_score: float  # -1.0 (strong down) to +1.0 (strong up)
    adx_value: float | None
    atr_pct: float | None
    confluence: float  # 0.0 to 1.0
    summary: str


def _evaluate_single_timeframe(
    df: pd.DataFrame,
) -> tuple[float, float | None, float | None, float]:
    """Evaluate trend direction, ADX strength, ATR pct, and slope for a single timeframe.

    Returns:
        (direction_score, adx_val, atr_pct, slope)
    """
    if len(df) < 20:
        return 0.0, None, None, 0.0

    close = df["close"].to_numpy(dtype=np.float64)
    high = df["high"].to_numpy(dtype=np.float64)
    low = df["low"].to_numpy(dtype=np.float64)

    ema20 = ema(close, period=min(20, len(close) // 2))
    ema50 = ema(close, period=min(50, len(close))) if len(close) >= 50 else ema20

    curr_close = close[-1]
    curr_ema20 = ema20[-1]
    curr_ema50 = ema50[-1]

    # EMA20 slope over last 3 bars
    lookback = min(3, len(ema20) - 1)
    past_ema20 = ema20[-lookback - 1]
    slope = (curr_ema20 - past_ema20) / past_ema20 if past_ema20 > 0 else 0.0

    # Trend direction score: -1.0 to +1.0
    direction = 0.0
    if curr_close > curr_ema20 > curr_ema50 and slope > 0:
        direction = 1.0
    elif curr_close < curr_ema20 < curr_ema50 and slope < 0:
        direction = -1.0
    elif curr_close > curr_ema20 and slope > 0:
        direction = 0.5
    elif curr_close < curr_ema20 and slope < 0:
        direction = -0.5

    # ATR volatility
    atr_arr = atr(high, low, close, period=14)
    valid_atr = atr_arr[~np.isnan(atr_arr)]
    curr_atr = float(valid_atr[-1]) if len(valid_atr) > 0 else None
    atr_pct = (curr_atr / curr_close) if curr_atr and curr_close > 0 else None

    # ADX strength
    adx_arr = adx(high, low, close, period=14)
    valid_adx = adx_arr[~np.isnan(adx_arr)]
    curr_adx = float(valid_adx[-1]) if len(valid_adx) > 0 else None

    return direction, curr_adx, atr_pct, slope


def classify_regime_detailed(
    df_15m: pd.DataFrame | None = None,
    df_1h: pd.DataFrame | None = None,
    df_4h: pd.DataFrame | None = None,
    high_vol_threshold_pct: float = 0.04,
    low_vol_threshold_pct: float = 0.005,
) -> RegimeDetails:
    """Detailed multi-timeframe market regime classification."""
    available_dfs = [
        ("15m", df_15m),
        ("1h", df_1h),
        ("4h", df_4h),
    ]
    valid_dfs = [(name, df) for name, df in available_dfs if df is not None and len(df) >= 20]

    if not valid_dfs:
        return RegimeDetails(
            regime=MarketRegime.UNCERTAIN,
            trend_score=0.0,
            adx_value=None,
            atr_pct=None,
            confluence=0.0,
            summary="Insufficient candle data across timeframes",
        )

    direction_scores: list[float] = []
    adx_values: list[float] = []
    atr_pcts: list[float] = []

    # Timeframe weights: 4h (0.4), 1h (0.4), 15m (0.2)
    weights_map = {"15m": 0.2, "1h": 0.4, "4h": 0.4}
    total_weight = 0.0
    weighted_trend = 0.0

    for name, df in valid_dfs:
        direction, adx_val, atr_p, _ = _evaluate_single_timeframe(df)
        w = weights_map.get(name, 0.33)
        weighted_trend += direction * w
        total_weight += w
        direction_scores.append(direction)
        if adx_val is not None:
            adx_values.append(adx_val)
        if atr_p is not None:
            atr_pcts.append(atr_p)

    avg_trend_score = weighted_trend / total_weight if total_weight > 0 else 0.0
    primary_adx = adx_values[-1] if adx_values else None
    primary_atr_pct = float(np.mean(atr_pcts)) if atr_pcts else None

    # Calculate confluence: fraction of timeframes that match dominant trend sign
    if avg_trend_score > 0:
        agreeing = sum(1 for d in direction_scores if d > 0)
        confluence = agreeing / len(direction_scores)
    elif avg_trend_score < 0:
        agreeing = sum(1 for d in direction_scores if d < 0)
        confluence = agreeing / len(direction_scores)
    else:
        confluence = sum(1 for d in direction_scores if d == 0) / len(direction_scores)

    # Determine regime
    if primary_atr_pct and primary_atr_pct >= high_vol_threshold_pct and (primary_adx is None or primary_adx < 25):
        regime = MarketRegime.HIGH_VOLATILITY
        summary = f"High volatility (ATR {primary_atr_pct:.2%}) without clear directional trend"
    elif avg_trend_score >= 0.4 and (primary_adx is None or primary_adx >= 20):
        regime = MarketRegime.TRENDING_UP
        summary = f"Bullish trend across timeframes (score: {avg_trend_score:.2f}, confluence: {confluence:.0%})"
    elif avg_trend_score <= -0.4 and (primary_adx is None or primary_adx >= 20):
        regime = MarketRegime.TRENDING_DOWN
        summary = f"Bearish trend across timeframes (score: {avg_trend_score:.2f}, confluence: {confluence:.0%})"
    elif primary_atr_pct and primary_atr_pct <= low_vol_threshold_pct and (primary_adx is None or primary_adx < 20):
        regime = MarketRegime.LOW_VOLATILITY
        summary = f"Low volatility compression (ATR {primary_atr_pct:.2%})"
    elif (primary_adx is not None and primary_adx < 20) or abs(avg_trend_score) < 0.4:
        regime = MarketRegime.RANGING
        summary = f"Ranging market with no clear directional bias (score: {avg_trend_score:.2f})"
    else:
        regime = MarketRegime.UNCERTAIN
        summary = "Mixed signals across multi-timeframe analytics"

    return RegimeDetails(
        regime=regime,
        trend_score=round(avg_trend_score, 4),
        adx_value=round(primary_adx, 2) if primary_adx is not None else None,
        atr_pct=round(primary_atr_pct, 4) if primary_atr_pct is not None else None,
        confluence=round(confluence, 4),
        summary=summary,
    )


def classify_regime(
    df_15m: pd.DataFrame | None = None,
    df_1h: pd.DataFrame | None = None,
    df_4h: pd.DataFrame | None = None,
) -> MarketRegime:
    """Convenience function returning the classified MarketRegime enum."""
    return classify_regime_detailed(df_15m=df_15m, df_1h=df_1h, df_4h=df_4h).regime
