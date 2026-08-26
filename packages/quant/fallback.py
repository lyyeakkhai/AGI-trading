"""Pure NumPy / Pandas quantitative indicators for graceful fallback when TA-Lib is absent.

All functions are pure, stateless mathematical transforms accepting float arrays or pandas Series
and returning 1D numpy arrays with appropriate NaN padding for initial warmup periods.
"""
from __future__ import annotations

from collections.abc import Sequence

import numpy as np
import pandas as pd


def sma(data: Sequence[float] | np.ndarray | pd.Series, period: int = 14) -> np.ndarray:
    """Calculate Simple Moving Average (SMA)."""
    if period <= 0:
        raise ValueError("period must be positive")
    arr = np.asarray(data, dtype=np.float64)
    if len(arr) < period:
        return np.full_like(arr, np.nan, dtype=np.float64)
    series = pd.Series(arr, dtype=np.float64)
    return series.rolling(window=period, min_periods=period).mean().to_numpy()


def ema(data: Sequence[float] | np.ndarray | pd.Series, period: int = 14) -> np.ndarray:
    """Calculate Exponential Moving Average (EMA) matching TA-Lib initialization.

    First valid value is at index period - 1, initialized to SMA of the first `period` points.
    Subsequent values use alpha = 2 / (period + 1).
    """
    if period <= 0:
        raise ValueError("period must be positive")
    arr = np.asarray(data, dtype=np.float64)
    out = np.full_like(arr, np.nan, dtype=np.float64)
    if len(arr) < period:
        return out

    alpha = 2.0 / (period + 1.0)
    # Seed with SMA
    out[period - 1] = float(np.mean(arr[:period]))
    for i in range(period, len(arr)):
        out[i] = alpha * arr[i] + (1.0 - alpha) * out[i - 1]
    return out


def rsi(data: Sequence[float] | np.ndarray | pd.Series, period: int = 14) -> np.ndarray:
    """Calculate Relative Strength Index (RSI) using Wilder's smoothing matching TA-Lib.

    First valid value is at index `period`.
    """
    if period <= 0:
        raise ValueError("period must be positive")
    arr = np.asarray(data, dtype=np.float64)
    out = np.full_like(arr, np.nan, dtype=np.float64)
    if len(arr) <= period:
        return out

    diff = np.diff(arr)
    gains = np.where(diff > 0, diff, 0.0)
    losses = np.where(diff < 0, -diff, 0.0)

    # Initial average gain and loss (simple mean of first `period` changes)
    avg_gain = float(np.mean(gains[:period]))
    avg_loss = float(np.mean(losses[:period]))

    if avg_loss == 0.0:
        out[period] = 100.0 if avg_gain > 0.0 else 50.0
    else:
        rs = avg_gain / avg_loss
        out[period] = 100.0 - (100.0 / (1.0 + rs))

    for i in range(period, len(diff)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        idx = i + 1
        if avg_loss == 0.0:
            out[idx] = 100.0 if avg_gain > 0.0 else 50.0
        else:
            rs = avg_gain / avg_loss
            out[idx] = 100.0 - (100.0 / (1.0 + rs))

    return out


def macd(
    data: Sequence[float] | np.ndarray | pd.Series,
    fastperiod: int = 12,
    slowperiod: int = 26,
    signalperiod: int = 9,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Calculate Moving Average Convergence Divergence (MACD).

    Returns:
        (macd_line, signal_line, histogram)
    """
    if fastperiod <= 0 or slowperiod <= 0 or signalperiod <= 0:
        raise ValueError("periods must be positive")
    if fastperiod >= slowperiod:
        raise ValueError("fastperiod must be less than slowperiod")

    arr = np.asarray(data, dtype=np.float64)
    macd_line = np.full_like(arr, np.nan, dtype=np.float64)
    signal_line = np.full_like(arr, np.nan, dtype=np.float64)
    hist = np.full_like(arr, np.nan, dtype=np.float64)

    if len(arr) < slowperiod:
        return macd_line, signal_line, hist

    fast_ema = ema(arr, fastperiod)
    slow_ema = ema(arr, slowperiod)

    macd_line[slowperiod - 1 :] = fast_ema[slowperiod - 1 :] - slow_ema[slowperiod - 1 :]

    valid_macd = macd_line[slowperiod - 1 :]
    if len(valid_macd) >= signalperiod:
        sig_sub = ema(valid_macd, signalperiod)
        signal_line[slowperiod - 1 :] = sig_sub
        hist = macd_line - signal_line

    return macd_line, signal_line, hist


def stddev(
    data: Sequence[float] | np.ndarray | pd.Series,
    period: int = 14,
    nbdev: float = 1.0,
) -> np.ndarray:
    """Calculate rolling standard deviation (population std dev, ddof=0) matching TA-Lib STDDEV."""
    if period <= 0:
        raise ValueError("period must be positive")
    arr = np.asarray(data, dtype=np.float64)
    if len(arr) < period:
        return np.full_like(arr, np.nan, dtype=np.float64)
    series = pd.Series(arr, dtype=np.float64)
    rolling_std = series.rolling(window=period, min_periods=period).std(ddof=0).to_numpy()
    return rolling_std * nbdev


def atr(
    high: Sequence[float] | np.ndarray | pd.Series,
    low: Sequence[float] | np.ndarray | pd.Series,
    close: Sequence[float] | np.ndarray | pd.Series,
    period: int = 14,
) -> np.ndarray:
    """Calculate Average True Range (ATR) using Wilder's smoothing matching TA-Lib.

    First valid value is at index `period`.
    """
    if period <= 0:
        raise ValueError("period must be positive")
    h_arr = np.asarray(high, dtype=np.float64)
    l_arr = np.asarray(low, dtype=np.float64)
    c_arr = np.asarray(close, dtype=np.float64)
    n = len(c_arr)

    out = np.full_like(c_arr, np.nan, dtype=np.float64)
    if n <= period or len(h_arr) != n or len(l_arr) != n:
        return out

    # True Range
    tr = np.zeros(n, dtype=np.float64)
    tr[0] = h_arr[0] - l_arr[0]
    for i in range(1, n):
        tr[i] = max(h_arr[i] - l_arr[i], abs(h_arr[i] - c_arr[i - 1]), abs(l_arr[i] - c_arr[i - 1]))

    out[period] = float(np.mean(tr[1 : period + 1]))
    for i in range(period + 1, n):
        out[i] = (out[i - 1] * (period - 1) + tr[i]) / period

    return out


def adx(
    high: Sequence[float] | np.ndarray | pd.Series,
    low: Sequence[float] | np.ndarray | pd.Series,
    close: Sequence[float] | np.ndarray | pd.Series,
    period: int = 14,
) -> np.ndarray:
    """Calculate Average Directional Index (ADX) matching Wilder's formulation."""
    if period <= 0:
        raise ValueError("period must be positive")
    h_arr = np.asarray(high, dtype=np.float64)
    l_arr = np.asarray(low, dtype=np.float64)
    c_arr = np.asarray(close, dtype=np.float64)
    n = len(c_arr)

    out = np.full_like(c_arr, np.nan, dtype=np.float64)
    if n < 2 * period or len(h_arr) != n or len(l_arr) != n:
        return out

    tr = np.zeros(n, dtype=np.float64)
    plus_dm = np.zeros(n, dtype=np.float64)
    minus_dm = np.zeros(n, dtype=np.float64)

    tr[0] = h_arr[0] - l_arr[0]
    for i in range(1, n):
        tr[i] = max(
            h_arr[i] - l_arr[i],
            abs(h_arr[i] - c_arr[i - 1]),
            abs(l_arr[i] - c_arr[i - 1]),
        )
        up_move = h_arr[i] - h_arr[i - 1]
        down_move = l_arr[i - 1] - l_arr[i]

        if up_move > down_move and up_move > 0:
            plus_dm[i] = up_move
        else:
            plus_dm[i] = 0.0

        if down_move > up_move and down_move > 0:
            minus_dm[i] = down_move
        else:
            minus_dm[i] = 0.0

    smooth_tr = np.full(n, np.nan, dtype=np.float64)
    smooth_plus_dm = np.full(n, np.nan, dtype=np.float64)
    smooth_minus_dm = np.full(n, np.nan, dtype=np.float64)
    dx = np.full(n, np.nan, dtype=np.float64)

    smooth_tr[period] = float(np.sum(tr[1 : period + 1]))
    smooth_plus_dm[period] = float(np.sum(plus_dm[1 : period + 1]))
    smooth_minus_dm[period] = float(np.sum(minus_dm[1 : period + 1]))

    for i in range(period, n):
        if i > period:
            smooth_tr[i] = smooth_tr[i - 1] - (smooth_tr[i - 1] / period) + tr[i]
            smooth_plus_dm[i] = (
                smooth_plus_dm[i - 1] - (smooth_plus_dm[i - 1] / period) + plus_dm[i]
            )
            smooth_minus_dm[i] = (
                smooth_minus_dm[i - 1] - (smooth_minus_dm[i - 1] / period) + minus_dm[i]
            )

        pdi = 100.0 * (smooth_plus_dm[i] / smooth_tr[i]) if smooth_tr[i] != 0 else 0.0
        mdi = 100.0 * (smooth_minus_dm[i] / smooth_tr[i]) if smooth_tr[i] != 0 else 0.0
        di_sum = pdi + mdi
        dx[i] = 100.0 * (abs(pdi - mdi) / di_sum) if di_sum != 0 else 0.0

    adx_start = 2 * period - 1
    if adx_start < n:
        out[adx_start] = float(np.mean(dx[period : adx_start + 1]))
        for i in range(adx_start + 1, n):
            out[i] = (out[i - 1] * (period - 1) + dx[i]) / period

    return out
