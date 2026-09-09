"""Quant package for technical analysis, market structure, regime detection, and scoring."""
from packages.domain.enums import MarketRegime
from packages.quant.indicators import (
    TALIB_AVAILABLE,
    adx,
    atr,
    bollinger_bands,
    calculate_indicator,
    ema,
    macd,
    rsi,
    sma,
    stddev,
    vwap,
)
from packages.quant.regime import (
    RegimeDetails,
    classify_regime,
    classify_regime_detailed,
)
from packages.quant.scoring import (
    ConfidenceLevel,
    ConfidenceScore,
    calculate_confidence,
)
from packages.quant.structure import (
    SwingPoint,
    calculate_rvol,
    detect_breakout,
    detect_market_structure,
    detect_support_resistance,
    detect_swing_highs_lows,
    detect_swing_points,
    detect_swings,
    detect_trend,
    detect_volume_anomalies,
    identify_key_levels,
)

__all__ = [
    "ConfidenceLevel",
    "ConfidenceScore",
    "MarketRegime",
    "RegimeDetails",
    "SwingPoint",
    "TALIB_AVAILABLE",
    "adx",
    "atr",
    "bollinger_bands",
    "calculate_confidence",
    "calculate_indicator",
    "calculate_rvol",
    "classify_regime",
    "classify_regime_detailed",
    "detect_breakout",
    "detect_market_structure",
    "detect_support_resistance",
    "detect_swing_highs_lows",
    "detect_swing_points",
    "detect_swings",
    "detect_trend",
    "detect_volume_anomalies",
    "ema",
    "identify_key_levels",
    "macd",
    "rsi",
    "sma",
    "stddev",
    "vwap",
]

