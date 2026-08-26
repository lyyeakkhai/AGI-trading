"""Quantitative indicators interface with graceful TA-Lib degradation.

If TA-Lib is installed in the environment, it uses C-accelerated TA-Lib functions.
Otherwise, it seamlessly degrades to pure NumPy/Pandas fallback implementations.
"""
from __future__ import annotations

from collections.abc import Sequence

import numpy as np
import pandas as pd

try:
    import talib

    TALIB_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    talib = None  # type: ignore[assignment]
    TALIB_AVAILABLE = False


if TALIB_AVAILABLE and talib is not None:

    def sma(data: Sequence[float] | np.ndarray | pd.Series, period: int = 14) -> np.ndarray:
        arr = np.asarray(data, dtype=np.float64)
        if len(arr) < period:
            return np.full_like(arr, np.nan, dtype=np.float64)
        res: np.ndarray = talib.SMA(arr, timeperiod=period)
        return res

    def ema(data: Sequence[float] | np.ndarray | pd.Series, period: int = 14) -> np.ndarray:
        arr = np.asarray(data, dtype=np.float64)
        if len(arr) < period:
            return np.full_like(arr, np.nan, dtype=np.float64)
        res: np.ndarray = talib.EMA(arr, timeperiod=period)
        return res

    def rsi(data: Sequence[float] | np.ndarray | pd.Series, period: int = 14) -> np.ndarray:
        arr = np.asarray(data, dtype=np.float64)
        if len(arr) <= period:
            return np.full_like(arr, np.nan, dtype=np.float64)
        res: np.ndarray = talib.RSI(arr, timeperiod=period)
        return res

    def macd(
        data: Sequence[float] | np.ndarray | pd.Series,
        fastperiod: int = 12,
        slowperiod: int = 26,
        signalperiod: int = 9,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        arr = np.asarray(data, dtype=np.float64)
        if len(arr) < slowperiod:
            nan_arr = np.full_like(arr, np.nan, dtype=np.float64)
            return nan_arr, nan_arr, nan_arr
        macd_line, signal_line, hist = talib.MACD(
            arr,
            fastperiod=fastperiod,
            slowperiod=slowperiod,
            signalperiod=signalperiod,
        )
        return macd_line, signal_line, hist

    def stddev(
        data: Sequence[float] | np.ndarray | pd.Series,
        period: int = 14,
        nbdev: float = 1.0,
    ) -> np.ndarray:
        arr = np.asarray(data, dtype=np.float64)
        if len(arr) < period:
            return np.full_like(arr, np.nan, dtype=np.float64)
        res: np.ndarray = talib.STDDEV(arr, timeperiod=period, nbdev=nbdev)
        return res

    def atr(
        high: Sequence[float] | np.ndarray | pd.Series,
        low: Sequence[float] | np.ndarray | pd.Series,
        close: Sequence[float] | np.ndarray | pd.Series,
        period: int = 14,
    ) -> np.ndarray:
        h_arr = np.asarray(high, dtype=np.float64)
        l_arr = np.asarray(low, dtype=np.float64)
        c_arr = np.asarray(close, dtype=np.float64)
        if len(c_arr) <= period:
            return np.full_like(c_arr, np.nan, dtype=np.float64)
        res: np.ndarray = talib.ATR(h_arr, l_arr, c_arr, timeperiod=period)
        return res

    def adx(
        high: Sequence[float] | np.ndarray | pd.Series,
        low: Sequence[float] | np.ndarray | pd.Series,
        close: Sequence[float] | np.ndarray | pd.Series,
        period: int = 14,
    ) -> np.ndarray:
        h_arr = np.asarray(high, dtype=np.float64)
        l_arr = np.asarray(low, dtype=np.float64)
        c_arr = np.asarray(close, dtype=np.float64)
        if len(c_arr) < 2 * period:
            return np.full_like(c_arr, np.nan, dtype=np.float64)
        res: np.ndarray = talib.ADX(h_arr, l_arr, c_arr, timeperiod=period)
        return res

else:
    from packages.quant.fallback import (  # type: ignore[no-redef]
        adx,
        atr,
        ema,
        macd,
        rsi,
        sma,
        stddev,
    )

__all__ = [
    "TALIB_AVAILABLE",
    "adx",
    "atr",
    "ema",
    "macd",
    "rsi",
    "sma",
    "stddev",
]
