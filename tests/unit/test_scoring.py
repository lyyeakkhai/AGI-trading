from __future__ import annotations

from decimal import Decimal

from packages.domain.enums import MarketRegime
from packages.quant.scoring import (
    ConfidenceLevel,
    calculate_confidence,
)


def test_high_confidence_bullish_alignment() -> None:
    score = calculate_confidence(
        timeframe_confluence=1.0,  # 0.35
        rvol=2.5,                  # 0.25
        regime=MarketRegime.TRENDING_UP,  # 0.25
        signal_direction="bullish",
        indicator_alignment={"rsi": 55.0, "macd_hist": 1.2},  # 0.08 + 0.07 = 0.15
    )
    assert score.level == ConfidenceLevel.HIGH
    assert score.score >= Decimal("0.90")
    assert "Confluence=100%" in score.reason


def test_medium_confidence_partial_alignment() -> None:
    score = calculate_confidence(
        timeframe_confluence=0.6,  # 0.21
        rvol=1.2,                  # 0.15
        regime=MarketRegime.RANGING,  # 0.12
        signal_direction="bullish",
    )
    assert score.level == ConfidenceLevel.MEDIUM
    assert Decimal("0.40") <= score.score < Decimal("0.70")


def test_low_confidence_conflicting_signals() -> None:
    score = calculate_confidence(
        timeframe_confluence=0.0,
        rvol=0.2,
        regime=MarketRegime.TRENDING_DOWN,
        signal_direction="bullish",  # Opposing
    )
    assert score.level == ConfidenceLevel.LOW
    assert score.score < Decimal("0.40")
