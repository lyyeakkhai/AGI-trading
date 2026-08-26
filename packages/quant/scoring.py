"""Deterministic confidence scoring engine.

Heuristic ruleset combining timeframe confluence, RVOL (volume confirmation),
market regime alignment, and indicator alignment into a normalized confidence score (0.0 to 1.0)
and categorized ConfidenceLevel (LOW, MEDIUM, HIGH).
"""
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Any

from packages.domain.enums import MarketRegime


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass(frozen=True)
class ConfidenceScore:
    score: Decimal
    level: ConfidenceLevel
    factors: dict[str, float]
    reason: str


def calculate_confidence(
    timeframe_confluence: float,
    rvol: float,
    regime: MarketRegime,
    signal_direction: str = "bullish",
    indicator_alignment: dict[str, Any] | None = None,
) -> ConfidenceScore:
    """Calculate deterministic confidence score.

    Args:
        timeframe_confluence: Confluence fraction across timeframes (0.0 to 1.0).
        rvol: Relative volume ratio (e.g. 1.0 normal, 2.0+ surge).
        regime: Current classified MarketRegime.
        signal_direction: 'bullish' or 'bearish'.
        indicator_alignment: Optional dict of indicator metrics (rsi, macd_hist, etc.).

    Returns:
        ConfidenceScore containing normalized score (Decimal) and ConfidenceLevel.
    """
    indicator_alignment = indicator_alignment or {}

    # 1. Multi-timeframe confluence factor (weight: 0.35)
    conf_clamped = max(0.0, min(1.0, float(timeframe_confluence)))
    confluence_score = 0.35 * conf_clamped

    # 2. RVOL volume confirmation factor (weight: 0.25)
    # RVOL >= 2.0 gets full 0.25; RVOL 1.0 gets 0.125; RVOL < 0.5 gets 0.0
    rvol_val = max(0.0, float(rvol))
    if rvol_val >= 2.0:
        rvol_score = 0.25
    elif rvol_val >= 1.0:
        rvol_score = 0.125 + 0.125 * ((rvol_val - 1.0) / 1.0)
    elif rvol_val >= 0.5:
        rvol_score = 0.125 * ((rvol_val - 0.5) / 0.5)
    else:
        rvol_score = 0.0

    # 3. Regime alignment factor (weight: 0.25)
    regime_score = 0.0
    dir_lower = signal_direction.lower()
    if dir_lower in ("bullish", "buy", "long"):
        if regime == MarketRegime.TRENDING_UP:
            regime_score = 0.25
        elif regime == MarketRegime.RANGING:
            regime_score = 0.12
        elif regime == MarketRegime.HIGH_VOLATILITY:
            regime_score = 0.05
    elif dir_lower in ("bearish", "sell", "short"):
        if regime == MarketRegime.TRENDING_DOWN:
            regime_score = 0.25
        elif regime == MarketRegime.RANGING:
            regime_score = 0.12
        elif regime == MarketRegime.HIGH_VOLATILITY:
            regime_score = 0.05
    else:
        if regime in (MarketRegime.TRENDING_UP, MarketRegime.TRENDING_DOWN):
            regime_score = 0.20
        elif regime == MarketRegime.RANGING:
            regime_score = 0.15

    # 4. Indicator alignment factor (weight: 0.15)
    indicator_score = 0.0
    rsi_val = indicator_alignment.get("rsi")
    macd_hist = indicator_alignment.get("macd_hist")

    if rsi_val is not None:
        try:
            rsi_float = float(rsi_val)
            if dir_lower in ("bullish", "buy", "long"):
                # Bullish: RSI 40-70 is healthy; > 75 overbought penalty
                if 45.0 <= rsi_float <= 70.0:
                    indicator_score += 0.08
                elif 30.0 <= rsi_float < 45.0:
                    indicator_score += 0.04
            elif dir_lower in ("bearish", "sell", "short"):
                # Bearish: RSI 30-55 is healthy; < 25 oversold penalty
                if 30.0 <= rsi_float <= 55.0:
                    indicator_score += 0.08
                elif 55.0 < rsi_float <= 70.0:
                    indicator_score += 0.04
        except (ValueError, TypeError):
            pass

    if macd_hist is not None:
        try:
            macd_float = float(macd_hist)
            if dir_lower in ("bullish", "buy", "long") and macd_float > 0:
                indicator_score += 0.07
            elif dir_lower in ("bearish", "sell", "short") and macd_float < 0:
                indicator_score += 0.07
        except (ValueError, TypeError):
            pass

    total_score = confluence_score + rvol_score + regime_score + indicator_score
    total_score = max(0.0, min(1.0, total_score))
    dec_score = Decimal(str(round(total_score, 4)))

    if dec_score >= Decimal("0.70"):
        level = ConfidenceLevel.HIGH
    elif dec_score >= Decimal("0.40"):
        level = ConfidenceLevel.MEDIUM
    else:
        level = ConfidenceLevel.LOW

    reasons: list[str] = [
        f"Confluence={conf_clamped:.0%}",
        f"RVOL={rvol_val:.1f}x",
        f"Regime={regime.value}",
    ]
    if indicator_score > 0:
        reasons.append(f"IndicatorsAligned=+{indicator_score:.2f}")

    return ConfidenceScore(
        score=dec_score,
        level=level,
        factors={
            "confluence": round(confluence_score, 4),
            "rvol": round(rvol_score, 4),
            "regime": round(regime_score, 4),
            "indicators": round(indicator_score, 4),
        },
        reason=" | ".join(reasons),
    )
