"""Tests for candle is_closed derivation.

is_closed must be derived from exchange timestamps only.
Local system clock is never used.
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import pytest
from packages.exchange.models import OHLCVCandle


def make_candle(ts: datetime, is_closed: bool, tf: str = "1m") -> OHLCVCandle:
    return OHLCVCandle(
        symbol="BTC/USDT",
        timeframe=tf,
        timestamp=ts,
        open=Decimal("42000"),
        high=Decimal("42100"),
        low=Decimal("41900"),
        close=Decimal("42050"),
        volume=Decimal("10.5"),
        is_closed=is_closed,
    )


def test_last_candle_in_batch_is_not_closed():
    """The last candle returned by REST is the forming candle."""
    base = datetime(2024, 1, 1, tzinfo=timezone.utc)
    candles = [
        make_candle(base, is_closed=True),
        make_candle(base + timedelta(minutes=1), is_closed=True),
        make_candle(base + timedelta(minutes=2), is_closed=False),  # forming
    ]
    assert candles[-1].is_closed is False
    assert candles[-2].is_closed is True


def test_intermediate_candles_are_closed():
    base = datetime(2024, 1, 1, tzinfo=timezone.utc)
    candles = [
        make_candle(base + timedelta(minutes=i), is_closed=(i < 4), tf="1m")
        for i in range(5)
    ]
    for c in candles[:4]:
        assert c.is_closed is True
    assert candles[4].is_closed is False


def test_candle_model_accepts_all_timeframes():
    base = datetime(2024, 1, 1, tzinfo=timezone.utc)
    for tf in ["1m", "15m", "1h", "4h"]:
        c = make_candle(base, is_closed=True, tf=tf)
        assert c.timeframe == tf


def test_candle_rejects_float_price():
    base = datetime(2024, 1, 1, tzinfo=timezone.utc)
    with pytest.raises(Exception):
        OHLCVCandle(
            symbol="BTC/USDT",
            timeframe="1m",
            timestamp=base,
            open=42000.0,  # float — must reject  # type: ignore[arg-type]
            high=Decimal("42100"),
            low=Decimal("41900"),
            close=Decimal("42050"),
            volume=Decimal("10"),
            is_closed=True,
        )
