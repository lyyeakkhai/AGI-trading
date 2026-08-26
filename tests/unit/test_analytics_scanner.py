from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
import pandas as pd
import pytest

from packages.domain.enums import MarketRegime
from packages.events.streams import StreamNames
from packages.quant.regime import RegimeDetails
from services.analytics.scanner import OpportunityScanner


@pytest.mark.asyncio
async def test_opportunity_scanner_breakout_detection() -> None:
    mock_publisher = MagicMock()
    mock_publisher.publish = AsyncMock()

    scanner = OpportunityScanner(publisher=mock_publisher)

    # 30 candles with resistance at 100, and last candle breaks out to 115 with high volume
    highs = [100.0 if i == 5 else 95.0 for i in range(30)]
    highs[-1] = 115.0
    lows = [90.0] * 30
    opens = [92.0] * 29 + [102.0]
    closes = [93.0] * 29 + [114.0]
    volumes = [100.0] * 29 + [300.0]

    base_time = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
    df = pd.DataFrame(
        {
            "timestamp": [base_time + timedelta(hours=i) for i in range(30)],
            "open": opens,
            "high": highs,
            "low": lows,
            "close": closes,
            "volume": volumes,
        }
    )

    indicators = {
        "rvol_20": 2.5,
        "rsi_14": 60.0,
        "macd_hist": 1.5,
        "ema_20": 95.0,
    }
    regime_details = RegimeDetails(
        regime=MarketRegime.TRENDING_UP,
        trend_score=0.8,
        adx_value=30.0,
        atr_pct=0.02,
        confluence=1.0,
        summary="Strong uptrend",
    )

    opps = await scanner.evaluate(
        symbol="BTC/USDT",
        timeframe="1h",
        timestamp=datetime(2026, 1, 2, 0, 0, tzinfo=timezone.utc),
        indicators=indicators,
        regime_details=regime_details,
        df=df,
    )

    assert len(opps) >= 1
    opp = opps[0]
    assert opp["symbol"] == "BTC/USDT"
    assert opp["signal_type"] == "BULLISH_BREAKOUT"
    assert Decimal(opp["confidence"]) >= Decimal("0.70")
    assert opp["trading_mode"] == "paper"

    mock_publisher.publish.assert_awaited_once()
    call_args = mock_publisher.publish.call_args
    assert call_args[0][0] == StreamNames.OPPORTUNITIES
    assert call_args[0][1]["signal_type"] == "BULLISH_BREAKOUT"
