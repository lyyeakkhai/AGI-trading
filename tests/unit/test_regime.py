from __future__ import annotations

import pandas as pd

from packages.domain.enums import MarketRegime
from packages.quant.regime import (
    RegimeDetails,
    classify_regime,
    classify_regime_detailed,
)


def _make_df(prices: list[float], spread: float = 1.0) -> pd.DataFrame:
    n = len(prices)
    return pd.DataFrame(
        {
            "open": prices,
            "high": [p + spread for p in prices],
            "low": [p - spread for p in prices],
            "close": prices,
            "volume": [1000.0] * n,
        }
    )


def test_classify_regime_empty_data() -> None:
    assert classify_regime() == MarketRegime.UNCERTAIN
    assert classify_regime(df_1h=_make_df([100.0] * 5)) == MarketRegime.UNCERTAIN


def test_classify_regime_trending_up() -> None:
    # 60 candles with strong steady uptrend from 100 to 220
    prices = [100.0 + i * 2.0 for i in range(60)]
    df_1h = _make_df(prices, spread=1.0)
    df_4h = _make_df(prices, spread=1.0)

    regime = classify_regime(df_1h=df_1h, df_4h=df_4h)
    assert regime == MarketRegime.TRENDING_UP

    details = classify_regime_detailed(df_1h=df_1h, df_4h=df_4h)
    assert isinstance(details, RegimeDetails)
    assert details.regime == MarketRegime.TRENDING_UP
    assert details.trend_score > 0
    assert details.confluence == 1.0


def test_classify_regime_trending_down() -> None:
    # 60 candles with strong steady downtrend from 220 to 100
    prices = [220.0 - i * 2.0 for i in range(60)]
    df_1h = _make_df(prices, spread=1.0)
    df_4h = _make_df(prices, spread=1.0)

    regime = classify_regime(df_1h=df_1h, df_4h=df_4h)
    assert regime == MarketRegime.TRENDING_DOWN


def test_classify_regime_ranging() -> None:
    # Small oscillating sideways around 100 (low ATR, no directional slope)
    prices = [100.0 + (1.0 if i % 4 < 2 else -1.0) for i in range(60)]
    df_1h = _make_df(prices, spread=0.2)

    regime = classify_regime(df_1h=df_1h)
    assert regime in (MarketRegime.RANGING, MarketRegime.LOW_VOLATILITY, MarketRegime.UNCERTAIN)


def test_classify_regime_high_volatility() -> None:
    # Flat price around 100 but huge high/low spread (ATR ~ 20 / 100 = 20%)
    prices = [100.0] * 60
    df = pd.DataFrame(
        {
            "open": prices,
            "high": [110.0] * 60,
            "low": [90.0] * 60,
            "close": prices,
            "volume": [1000.0] * 60,
        }
    )
    regime = classify_regime(df_1h=df)
    assert regime == MarketRegime.HIGH_VOLATILITY
