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


def _extract_ohlcv(
    data: pd.DataFrame | dict[str, Any] | list[dict[str, Any]] | None = None,
    high: Sequence[float] | None = None,
    low: Sequence[float] | None = None,
    close: Sequence[float] | None = None,
    volume: Sequence[float] | None = None,
    timestamps: Sequence[Any] | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, list[str] | None]:
    """Helper to extract high, low, close, volume, and timestamps arrays from various inputs."""
    if data is not None:
        if isinstance(data, list):
            df = pd.DataFrame(data)
        elif isinstance(data, dict):
            df = pd.DataFrame(data)
        elif isinstance(data, pd.DataFrame):
            df = data
        else:
            raise ValueError("Unsupported data format")

        c = df["close"].to_numpy(dtype=np.float64) if "close" in df.columns else np.array([], dtype=np.float64)
        h = df["high"].to_numpy(dtype=np.float64) if "high" in df.columns else c
        l_arr = df["low"].to_numpy(dtype=np.float64) if "low" in df.columns else c
        v = df["volume"].to_numpy(dtype=np.float64) if "volume" in df.columns else np.zeros_like(c)
        ts = [str(t) for t in df["timestamp"].tolist()] if "timestamp" in df.columns else None
        return h, l_arr, c, v, ts

    if close is None and high is None:
        raise ValueError("Must provide either data or high/low/close sequences")

    c = np.asarray(close if close is not None else high, dtype=np.float64)
    h = np.asarray(high if high is not None else c, dtype=np.float64)
    l_arr = np.asarray(low if low is not None else c, dtype=np.float64)
    v = np.asarray(volume, dtype=np.float64) if volume is not None else np.zeros_like(c)
    ts = [str(t) for t in timestamps] if timestamps is not None else None
    return h, l_arr, c, v, ts


def detect_swings(
    data: pd.DataFrame | dict[str, Any] | list[dict[str, Any]] | None = None,
    high: Sequence[float] | None = None,
    low: Sequence[float] | None = None,
    timestamps: Sequence[Any] | None = None,
    window: int = 2,
) -> dict[str, Any]:
    """Detect deterministic swing points using strict 5-bar fractal logic.

    In standard 5-bar fractal logic (window=2 radius, or window=5 total bars),
    a swing high has high[i] > high[i-2], high[i-1] and high[i] >= high[i+1], high[i+2].
    A swing low has low[i] < low[i-2], low[i-1] and low[i] <= low[i+1], low[i+2].
    """
    h, l_arr, _, _, ts = _extract_ohlcv(data=data, high=high, low=low, timestamps=timestamps)
    n = len(h)

    # Normalize window: window=5 means total 5 bars (radius=2)
    radius = (window - 1) // 2 if window >= 3 else max(1, window)

    swing_highs: list[dict[str, Any]] = []
    swing_lows: list[dict[str, Any]] = []

    if n >= 2 * radius + 1:
        for i in range(radius, n - radius):
            left_h = h[i - radius : i]
            right_h = h[i + 1 : i + radius + 1]
            if len(left_h) > 0 and len(right_h) > 0:
                if h[i] > np.max(left_h) and h[i] >= np.max(right_h):
                    swing_highs.append({
                        "index": i,
                        "price": float(h[i]),
                        "timestamp": ts[i] if ts and i < len(ts) else None,
                    })

            left_l = l_arr[i - radius : i]
            right_l = l_arr[i + 1 : i + radius + 1]
            if len(left_l) > 0 and len(right_l) > 0:
                if l_arr[i] < np.min(left_l) and l_arr[i] <= np.min(right_l):
                    swing_lows.append({
                        "index": i,
                        "price": float(l_arr[i]),
                        "timestamp": ts[i] if ts and i < len(ts) else None,
                    })

    return {
        "swing_highs": swing_highs,
        "swing_lows": swing_lows,
        "total_highs": len(swing_highs),
        "total_lows": len(swing_lows),
        "recent_swing_high": swing_highs[-1]["price"] if swing_highs else None,
        "recent_swing_low": swing_lows[-1]["price"] if swing_lows else None,
    }


def detect_market_structure(
    data: pd.DataFrame | dict[str, Any] | list[dict[str, Any]] | None = None,
    high: Sequence[float] | None = None,
    low: Sequence[float] | None = None,
    close: Sequence[float] | None = None,
    timestamps: Sequence[Any] | None = None,
    window: int = 2,
) -> dict[str, Any]:
    """Detect market structure: Higher Highs (HH), Higher Lows (HL), Lower Highs (LH), Lower Lows (LL),
    Break of Structure (BOS), and Change of Character (CHoCH).
    """
    h, l_arr, c, _, ts = _extract_ohlcv(
        data=data, high=high, low=low, close=close, timestamps=timestamps
    )
    swings = detect_swings(high=h, low=l_arr, timestamps=ts, window=window)

    highs = swings["swing_highs"]
    lows = swings["swing_lows"]

    # Tag swing points
    tagged_points: list[dict[str, Any]] = []

    # Tag highs
    for i, sh in enumerate(highs):
        if i == 0:
            point_type = "HIGH"
        elif sh["price"] > highs[i - 1]["price"]:
            point_type = "HH"  # Higher High
        elif sh["price"] < highs[i - 1]["price"]:
            point_type = "LH"  # Lower High
        else:
            point_type = "EH"  # Equal High
        tagged_points.append({
            "index": sh["index"],
            "type": point_type,
            "is_high": True,
            "price": sh["price"],
            "timestamp": sh["timestamp"],
        })

    # Tag lows
    for i, sl in enumerate(lows):
        if i == 0:
            point_type = "LOW"
        elif sl["price"] > lows[i - 1]["price"]:
            point_type = "HL"  # Higher Low
        elif sl["price"] < lows[i - 1]["price"]:
            point_type = "LL"  # Lower Low
        else:
            point_type = "EL"  # Equal Low
        tagged_points.append({
            "index": sl["index"],
            "type": point_type,
            "is_high": False,
            "price": sl["price"],
            "timestamp": sl["timestamp"],
        })

    tagged_points.sort(key=lambda p: p["index"])

    # Detect BOS & CHoCH events across the candle timeline
    bos_events: list[dict[str, Any]] = []
    choch_events: list[dict[str, Any]] = []

    # Determine structural state tracking
    active_structure = "NEUTRAL"
    last_high: float | None = None
    last_low: float | None = None
    last_high_idx: int | None = None
    last_low_idx: int | None = None

    for pt in tagged_points:
        if pt["is_high"]:
            last_high = pt["price"]
            last_high_idx = pt["index"]
            if pt["type"] == "HH":
                active_structure = "BULLISH"
            elif pt["type"] == "LH":
                active_structure = "BEARISH"
        else:
            last_low = pt["price"]
            last_low_idx = pt["index"]
            if pt["type"] == "HL":
                active_structure = "BULLISH"
            elif pt["type"] == "LL":
                active_structure = "BEARISH"

    # Analyze breaks between swings and current close
    if len(highs) >= 2 and len(lows) >= 2 and len(c) > 0:
        prev_high = highs[-2]["price"]
        prev_low = lows[-2]["price"]
        curr_high = highs[-1]["price"]
        curr_low = lows[-1]["price"]

        curr_close = float(c[-1])
        curr_idx = len(c) - 1
        curr_ts = ts[-1] if ts else None

        if curr_high > prev_high:
            bos_events.append({
                "type": "BOS_BULLISH",
                "index": highs[-1]["index"],
                "price": curr_high,
                "broken_level": prev_high,
                "timestamp": highs[-1]["timestamp"],
            })
        if curr_low < prev_low:
            bos_events.append({
                "type": "BOS_BEARISH",
                "index": lows[-1]["index"],
                "price": curr_low,
                "broken_level": prev_low,
                "timestamp": lows[-1]["timestamp"],
            })

        # CHoCH: trend reversal signal
        # If previous structure was bearish and price closes above last Lower High -> Bullish CHoCH
        if active_structure == "BEARISH" and curr_close > curr_high:
            choch_events.append({
                "type": "CHOCH_BULLISH",
                "index": curr_idx,
                "price": curr_close,
                "broken_level": curr_high,
                "timestamp": curr_ts,
            })
            active_structure = "BULLISH"
        # If previous structure was bullish and price closes below last Higher Low -> Bearish CHoCH
        elif active_structure == "BULLISH" and curr_close < curr_low:
            choch_events.append({
                "type": "CHOCH_BEARISH",
                "index": curr_idx,
                "price": curr_close,
                "broken_level": curr_low,
                "timestamp": curr_ts,
            })
            active_structure = "BEARISH"

    # Overall structure label
    final_structure = "RANGING"
    if active_structure in ("BULLISH", "BEARISH"):
        final_structure = active_structure
    elif tagged_points:
        recent_types = [p["type"] for p in tagged_points[-4:]]
        if any(t in ("HH", "HL") for t in recent_types) and not any(t in ("LH", "LL") for t in recent_types):
            final_structure = "BULLISH"
        elif any(t in ("LH", "LL") for t in recent_types) and not any(t in ("HH", "HL") for t in recent_types):
            final_structure = "BEARISH"

    return {
        "structure": final_structure,
        "swing_points": tagged_points,
        "bos_events": bos_events,
        "choch_events": choch_events,
        "last_swing_high": last_high,
        "last_swing_low": last_low,
    }


def detect_trend(
    data: pd.DataFrame | dict[str, Any] | list[dict[str, Any]] | None = None,
    high: Sequence[float] | None = None,
    low: Sequence[float] | None = None,
    close: Sequence[float] | None = None,
    fast_period: int = 20,
    slow_period: int = 50,
) -> dict[str, Any]:
    """Detect trend direction and strength using deterministic EMA alignment, slope, and ADX."""
    from packages.quant.indicators import adx, ema

    h, l_arr, c, _, _ = _extract_ohlcv(
        data=data, high=high, low=low, close=close
    )
    n = len(c)
    if n < 5:
        return {
            "direction": "SIDEWAYS",
            "strength": 0.0,
            "strength_label": "WEAK",
            "adx": None,
            "ema_fast": None,
            "ema_slow": None,
            "slope": 0.0,
            "is_trending": False,
        }

    fast_p = min(fast_period, max(2, n // 2))
    slow_p = min(slow_period, max(fast_p + 1, n))

    ema_f_arr = ema(c, period=fast_p)
    ema_s_arr = ema(c, period=slow_p)

    valid_f = ema_f_arr[~np.isnan(ema_f_arr)]
    valid_s = ema_s_arr[~np.isnan(ema_s_arr)]

    curr_fast = float(valid_f[-1]) if len(valid_f) > 0 else float(c[-1])
    curr_slow = float(valid_s[-1]) if len(valid_s) > 0 else curr_fast
    curr_close = float(c[-1])

    # Calculate slope over last 3 valid points
    lookback = min(3, len(valid_f) - 1)
    if lookback > 0 and valid_f[-lookback - 1] > 0:
        slope = float((curr_fast - valid_f[-lookback - 1]) / valid_f[-lookback - 1])
    else:
        slope = 0.0

    # ADX trend strength
    adx_arr = adx(h, l_arr, c, period=min(14, max(3, n // 3)))
    valid_adx = adx_arr[~np.isnan(adx_arr)]
    adx_val = float(valid_adx[-1]) if len(valid_adx) > 0 else 20.0

    # Direction determination
    if curr_fast > curr_slow and curr_close >= curr_fast and slope > 0:
        direction = "UPTREND"
    elif curr_fast < curr_slow and curr_close <= curr_fast and slope < 0:
        direction = "DOWNTREND"
    elif curr_fast > curr_slow and slope >= 0:
        direction = "UPTREND"
    elif curr_fast < curr_slow and slope <= 0:
        direction = "DOWNTREND"
    else:
        direction = "SIDEWAYS"

    # Strength determination
    strength_score = round(min(1.0, max(0.0, adx_val / 50.0)), 4)
    if adx_val >= 40.0:
        strength_label = "VERY_STRONG"
    elif adx_val >= 25.0:
        strength_label = "STRONG"
    elif adx_val >= 20.0:
        strength_label = "MODERATE"
    else:
        strength_label = "WEAK"

    is_trending = bool(adx_val >= 20.0 and direction != "SIDEWAYS")

    return {
        "direction": direction,
        "strength": strength_score,
        "strength_label": strength_label,
        "adx": round(adx_val, 2),
        "ema_fast": round(curr_fast, 4),
        "ema_slow": round(curr_slow, 4),
        "slope": round(slope, 6),
        "is_trending": is_trending,
    }


def detect_support_resistance(
    data: pd.DataFrame | dict[str, Any] | list[dict[str, Any]] | None = None,
    high: Sequence[float] | None = None,
    low: Sequence[float] | None = None,
    close: Sequence[float] | None = None,
    tolerance: float = 0.015,
) -> dict[str, Any]:
    """Detect support and resistance zones, nearest levels, and breakout state."""
    h, l_arr, c, _, _ = _extract_ohlcv(
        data=data, high=high, low=low, close=close
    )
    if len(c) == 0:
        return {
            "current_price": 0.0,
            "nearest_support": None,
            "nearest_resistance": None,
            "support_zones": [],
            "resistance_zones": [],
            "breakout": "none",
        }

    curr_close = float(c[-1])
    raw_highs, raw_lows = detect_swing_highs_lows(h, l_arr, window=2)

    def _build_zones(swing_points: list[tuple[int, float]], is_resistance: bool) -> list[dict[str, Any]]:
        if not swing_points:
            return []
        prices = [p for _, p in swing_points]
        sorted_prices = sorted(prices)
        clusters: list[list[float]] = [[sorted_prices[0]]]
        for p in sorted_prices[1:]:
            if (p - clusters[-1][-1]) / clusters[-1][-1] <= tolerance:
                clusters[-1].append(p)
            else:
                clusters.append([p])

        zones: list[dict[str, Any]] = []
        for cluster in clusters:
            avg_p = float(np.mean(cluster))
            zone_low = float(min(cluster) * 0.998)
            zone_high = float(max(cluster) * 1.002)

            # Count touches across all candles
            touches = sum(1 for idx in range(len(h)) if h[idx] >= zone_low and l_arr[idx] <= zone_high)
            touches = max(len(cluster), touches)
            strength = round(min(1.0, touches / 4.0), 2)

            zones.append({
                "type": "RESISTANCE" if is_resistance else "SUPPORT",
                "price": round(avg_p, 4),
                "zone_low": round(zone_low, 4),
                "zone_high": round(zone_high, 4),
                "touches": touches,
                "strength": strength,
            })
        return zones

    res_zones = _build_zones(raw_highs, is_resistance=True)
    sup_zones = _build_zones(raw_lows, is_resistance=False)

    # Nearest levels relative to current close
    supports_below = [z["price"] for z in sup_zones if z["price"] < curr_close]
    resistances_above = [z["price"] for z in res_zones if z["price"] > curr_close]

    nearest_support = max(supports_below) if supports_below else None
    nearest_resistance = min(resistances_above) if resistances_above else None

    # Breakout check
    all_res_levels = [z["price"] for z in res_zones]
    all_sup_levels = [z["price"] for z in sup_zones]
    breakout = detect_breakout(curr_close, all_res_levels, all_sup_levels)

    return {
        "current_price": curr_close,
        "nearest_support": nearest_support,
        "nearest_resistance": nearest_resistance,
        "support_zones": sorted(sup_zones, key=lambda z: z["price"], reverse=True),
        "resistance_zones": sorted(res_zones, key=lambda z: z["price"]),
        "breakout": breakout,
    }

