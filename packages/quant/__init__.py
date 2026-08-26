"""Quant package for technical analysis, market structure, regime detection, and scoring."""
from packages.domain.enums import MarketRegime
from packages.quant.indicators import (
    TALIB_AVAILABLE,
    adx,
    atr,
    ema,
    macd,
    rsi,
    sma,
    stddev,
)
from packages.quant.regime import (
    RegimeDetails,
    classify_regime,
    classify_regime_detailed,
)
from packages.quant.structure import (
    SwingPoint,
    calculate_rvol,
    detect_breakout,
    detect_swing_highs_lows,
    detect_swing_points,
    detect_volume_anomalies,
    identify_key_levels,
)

__all__ = [
    "MarketRegime",
    "RegimeDetails",
    "SwingPoint",
    "TALIB_AVAILABLE",
    "adx",
    "atr",
    "calculate_rvol",
    "classify_regime",
    "classify_regime_detailed",
    "detect_breakout",
    "detect_swing_highs_lows",
    "detect_swing_points",
    "detect_volume_anomalies",
    "ema",
    "identify_key_levels",
    "macd",
    "rsi",
    "sma",
    "stddev",
]
