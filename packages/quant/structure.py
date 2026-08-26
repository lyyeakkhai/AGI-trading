"""Market structure analysis and volume anomaly detection.

Pure, stateless quantitative functions for identifying swing highs/lows,
relative volume (RVOL), volume anomalies, and key structural levels.
"""
from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class SwingPoint:
    index: int
    price: float
    is_high: bool
    timestamp: datetime | None = None


def detect_swing_highs_lows(
    high: Sequence[float] | np.ndarray | pd.Series,
    low: Sequence[float] | np.ndarray | pd.Series,
    window: int = 5,
) -> tuple[list[tuple[int, float]], list[tuple[int, float]]]:
    """Detect swing highs and swing lows over a symmetric rolling window.

    A swing high occurs at index i if high[i] is strictly greater than all high[j]
    for j in [i - window, i + window] (j != i).
    A swing low occurs at index i if low[i] is strictly lower than all low[j]
    for j in [i - window, i + window] (j != i).

    Returns:
        (swing_highs, swing_lows) where each element is (index, price).
    """
    if window <= 0:
        raise ValueError("window must be positive")

    h = np.asarray(high, dtype=np.float64)
    l_arr = np.asarray(low, dtype=np.float64)
    n = len(h)

    swing_highs: list[tuple[int, float]] = []
    swing_lows: list[tuple[int, float]] = []

    if n < 2 * window + 1:
        return swing_highs, swing_lows

    for i in range(window, n - window):
        left_h = h[i - window : i]
        right_h = h[i + 1 : i + window + 1]
        if len(left_h) > 0 and len(right_h) > 0:
            if h[i] > np.max(left_h) and h[i] >= np.max(right_h):
                swing_highs.append((i, float(h[i])))

        left_l = l_arr[i - window : i]
        right_l = l_arr[i + 1 : i + window + 1]
        if len(left_l) > 0 and len(right_l) > 0:
            if l_arr[i] < np.min(left_l) and l_arr[i] <= np.min(right_l):
                swing_lows.append((i, float(l_arr[i])))

    return swing_highs, swing_lows


def detect_swing_points(
    df: pd.DataFrame,
    window: int = 5,
    high_col: str = "high",
    low_col: str = "low",
    time_col: str | None = "timestamp",
) -> list[SwingPoint]:
    """Detect structured SwingPoints with optional timestamps from a DataFrame."""
    if high_col not in df.columns or low_col not in df.columns:
        raise ValueError(f"DataFrame must contain '{high_col}' and '{low_col}' columns")

    highs, lows = detect_swing_highs_lows(df[high_col], df[low_col], window=window)
    points: list[SwingPoint] = []

    for idx, price in highs:
        ts = df[time_col].iloc[idx] if time_col and time_col in df.columns else None
        points.append(SwingPoint(index=idx, price=price, is_high=True, timestamp=ts))

    for idx, price in lows:
        ts = df[time_col].iloc[idx] if time_col and time_col in df.columns else None
        points.append(SwingPoint(index=idx, price=price, is_high=False, timestamp=ts))

    points.sort(key=lambda p: p.index)
    return points


def calculate_rvol(
    volume: Sequence[float] | np.ndarray | pd.Series,
    period: int = 20,
) -> np.ndarray:
    """Calculate Relative Volume (RVOL) = current volume / SMA(volume, period).

    First period - 1 entries are NaN.
    """
    if period <= 0:
        raise ValueError("period must be positive")

    vol_arr = np.asarray(volume, dtype=np.float64)
    out = np.full_like(vol_arr, np.nan, dtype=np.float64)
    if len(vol_arr) < period:
        return out

    vol_series = pd.Series(vol_arr, dtype=np.float64)
    rolling_mean = vol_series.rolling(window=period, min_periods=period).mean().to_numpy()

    with np.errstate(divide="ignore", invalid="ignore"):
        rvol = np.where(rolling_mean > 0, vol_arr / rolling_mean, 1.0)

    # Keep initial warmup as NaN
    rvol[: period - 1] = np.nan
    return rvol


def detect_volume_anomalies(
    volume: Sequence[float] | np.ndarray | pd.Series,
    period: int = 20,
    threshold: float = 2.0,
) -> np.ndarray:
    """Identify indices where Relative Volume (RVOL) exceeds the given threshold."""
    rvol = calculate_rvol(volume, period=period)
    anomalies = np.zeros(len(rvol), dtype=bool)
    valid_mask = ~np.isnan(rvol)
    anomalies[valid_mask] = rvol[valid_mask] >= threshold
    return anomalies


def identify_key_levels(
    swing_highs: list[tuple[int, float]],
    swing_lows: list[tuple[int, float]],
    tolerance: float = 0.01,
) -> dict[str, list[float]]:
    """Cluster recent swing points to identify support and resistance levels.

    Args:
        swing_highs: List of (index, price) swing highs.
        swing_lows: List of (index, price) swing lows.
        tolerance: Percentage distance within which levels are grouped.

    Returns:
        dict with "resistance" and "support" price levels sorted by price.
    """

    def _cluster_levels(prices: list[float]) -> list[float]:
        if not prices:
            return []
        sorted_prices = sorted(prices)
        clusters: list[list[float]] = [[sorted_prices[0]]]
        for p in sorted_prices[1:]:
            if (p - clusters[-1][-1]) / clusters[-1][-1] <= tolerance:
                clusters[-1].append(p)
            else:
                clusters.append([p])
        return [float(np.mean(c)) for c in clusters]

    high_prices = [p for _, p in swing_highs]
    low_prices = [p for _, p in swing_lows]

    return {
        "resistance": _cluster_levels(high_prices),
        "support": _cluster_levels(low_prices),
    }


def detect_breakout(
    close: float,
    resistance_levels: list[float],
    support_levels: list[float],
    buffer_pct: float = 0.001,
) -> str:
    """Detect if current close price breaks above resistance (bullish) or below support (bearish)."""
    for r in sorted(resistance_levels, reverse=True):
        if close > r * (1.0 + buffer_pct):
            return "bullish_breakout"
    for s in sorted(support_levels):
        if close < s * (1.0 - buffer_pct):
            return "bearish_breakout"
    return "none"
