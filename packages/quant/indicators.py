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
        bollinger_bands,
        ema,
        macd,
        rsi,
        sma,
        stddev,
        vwap,
    )

if TALIB_AVAILABLE and talib is not None:
    from packages.quant.fallback import bollinger_bands, vwap  # type: ignore[no-redef]



def calculate_indicator(
    indicator: str,
    data: pd.DataFrame | dict[str, Any] | list[dict[str, Any]],
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Calculate deterministic technical indicator from candle data.

    Supported indicators:
    - RSI: Relative Strength Index (params: period)
    - EMA: Exponential Moving Average (params: period)
    - SMA: Simple Moving Average (params: period)
    - MACD: Moving Average Convergence Divergence (params: fastperiod, slowperiod, signalperiod)
    - ATR: Average True Range (params: period)
    - VWAP: Volume Weighted Average Price
    - BOLLINGER_BANDS / BBANDS: Bollinger Bands (params: period, nbdev)
    - VOLUME: Volume moving average and relative volume (params: period)
    """
    if params is None:
        params = {}

    if isinstance(data, pd.DataFrame):
        df = data
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    elif isinstance(data, dict):
        df = pd.DataFrame(data)
    else:
        raise ValueError("Unsupported data format for indicator calculation")

    if "close" not in df.columns:
        raise ValueError("Data must contain 'close' column")

    close = df["close"].to_numpy(dtype=np.float64)
    high = df["high"].to_numpy(dtype=np.float64) if "high" in df.columns else close
    low = df["low"].to_numpy(dtype=np.float64) if "low" in df.columns else close
    volume = (
        df["volume"].to_numpy(dtype=np.float64)
        if "volume" in df.columns
        else np.zeros_like(close)
    )

    timestamps = (
        [str(t) for t in df["timestamp"].tolist()] if "timestamp" in df.columns else None
    )

    def _clean_series(arr: np.ndarray) -> list[float | None]:
        return [None if np.isnan(x) or np.isinf(x) else round(float(x), 6) for x in arr]

    def _latest_val(cleaned: list[float | None]) -> float | None:
        return next((x for x in reversed(cleaned) if x is not None), None)

    name = indicator.upper().strip()

    if name == "RSI":
        period = int(params.get("period", 14))
        res = rsi(close, period=period)
        cleaned = _clean_series(res)
        return {
            "indicator": "RSI",
            "params": {"period": period},
            "values": cleaned,
            "latest": _latest_val(cleaned),
            "timestamps": timestamps,
        }

    elif name == "EMA":
        period = int(params.get("period", 20))
        res = ema(close, period=period)
        cleaned = _clean_series(res)
        return {
            "indicator": "EMA",
            "params": {"period": period},
            "values": cleaned,
            "latest": _latest_val(cleaned),
            "timestamps": timestamps,
        }

    elif name == "SMA":
        period = int(params.get("period", 20))
        res = sma(close, period=period)
        cleaned = _clean_series(res)
        return {
            "indicator": "SMA",
            "params": {"period": period},
            "values": cleaned,
            "latest": _latest_val(cleaned),
            "timestamps": timestamps,
        }

    elif name == "MACD":
        fast = int(params.get("fastperiod", 12))
        slow = int(params.get("slowperiod", 26))
        signal = int(params.get("signalperiod", 9))
        macd_line, signal_line, hist = macd(
            close, fastperiod=fast, slowperiod=slow, signalperiod=signal
        )
        c_macd = _clean_series(macd_line)
        c_sig = _clean_series(signal_line)
        c_hist = _clean_series(hist)
        return {
            "indicator": "MACD",
            "params": {"fastperiod": fast, "slowperiod": slow, "signalperiod": signal},
            "values": {
                "macd": c_macd,
                "signal": c_sig,
                "histogram": c_hist,
            },
            "latest": {
                "macd": _latest_val(c_macd),
                "signal": _latest_val(c_sig),
                "histogram": _latest_val(c_hist),
            },
            "timestamps": timestamps,
        }

    elif name == "ATR":
        period = int(params.get("period", 14))
        res = atr(high, low, close, period=period)
        cleaned = _clean_series(res)
        return {
            "indicator": "ATR",
            "params": {"period": period},
            "values": cleaned,
            "latest": _latest_val(cleaned),
            "timestamps": timestamps,
        }

    elif name == "VWAP":
        res = vwap(high, low, close, volume)
        cleaned = _clean_series(res)
        return {
            "indicator": "VWAP",
            "params": {},
            "values": cleaned,
            "latest": _latest_val(cleaned),
            "timestamps": timestamps,
        }

    elif name in ("BOLLINGER_BANDS", "BBANDS"):
        period = int(params.get("period", 20))
        nbdev = float(params.get("nbdev", 2.0))
        upper, middle, lower, bandwidth, percent_b = bollinger_bands(
            close, period=period, nbdev=nbdev
        )
        c_upper = _clean_series(upper)
        c_middle = _clean_series(middle)
        c_lower = _clean_series(lower)
        c_bandwidth = _clean_series(bandwidth)
        c_percent_b = _clean_series(percent_b)
        return {
            "indicator": "BOLLINGER_BANDS",
            "params": {"period": period, "nbdev": nbdev},
            "values": {
                "upper": c_upper,
                "middle": c_middle,
                "lower": c_lower,
                "bandwidth": c_bandwidth,
                "percent_b": c_percent_b,
            },
            "latest": {
                "upper": _latest_val(c_upper),
                "middle": _latest_val(c_middle),
                "lower": _latest_val(c_lower),
                "bandwidth": _latest_val(c_bandwidth),
                "percent_b": _latest_val(c_percent_b),
            },
            "timestamps": timestamps,
        }

    elif name == "VOLUME":
        from packages.quant.structure import calculate_rvol

        period = int(params.get("period", 20))
        vol_sma = sma(volume, period=period)
        rvol = calculate_rvol(volume, period=period)

        c_vol = _clean_series(volume)
        c_vol_sma = _clean_series(vol_sma)
        c_rvol = _clean_series(rvol)

        latest_rvol = _latest_val(c_rvol)
        is_anomaly = bool(latest_rvol is not None and latest_rvol >= 2.0)

        return {
            "indicator": "VOLUME",
            "params": {"period": period},
            "values": {
                "volume": c_vol,
                "volume_sma": c_vol_sma,
                "rvol": c_rvol,
            },
            "latest": {
                "volume": _latest_val(c_vol),
                "volume_sma": _latest_val(c_vol_sma),
                "rvol": latest_rvol,
                "is_anomaly": is_anomaly,
            },
            "timestamps": timestamps,
        }

    else:
        raise ValueError(
            f"Unsupported indicator: {indicator}. Supported: RSI, EMA, SMA, MACD, ATR, VWAP, BOLLINGER_BANDS, VOLUME"
        )


__all__ = [
    "TALIB_AVAILABLE",
    "adx",
    "atr",
    "bollinger_bands",
    "calculate_indicator",
    "ema",
    "macd",
    "rsi",
    "sma",
    "stddev",
    "vwap",
]

