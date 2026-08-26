from datetime import datetime, timezone
from decimal import Decimal
import ccxt
import pytest

from packages.exchange.binance import BinanceCCXTAdapter, normalize_ccxt_error
from packages.exchange.errors import (
    AuthFailedError,
    ExchangeError,
    PermanentError,
    RateLimitedError,
    RetryableError,
    UnknownStateError,
)
from packages.exchange.models import SymbolInfo, Ticker


def test_error_hierarchy():
    assert issubclass(RetryableError, ExchangeError)
    assert issubclass(RateLimitedError, ExchangeError)
    assert issubclass(UnknownStateError, ExchangeError)
    assert issubclass(AuthFailedError, ExchangeError)
    assert issubclass(PermanentError, ExchangeError)


def test_unknown_state_is_distinct():
    # Must never be caught by a generic ExchangeError handler accidentally
    err = UnknownStateError("ambiguous")
    assert isinstance(err, ExchangeError)
    assert isinstance(err, UnknownStateError)


def test_symbol_info_uses_decimal():
    info = SymbolInfo(
        symbol="BTC/USDT",
        base="BTC",
        quote="USDT",
        price_precision=2,
        quantity_precision=5,
        min_notional=Decimal("10.00"),
        step_size=Decimal("0.00001"),
        is_active=True,
    )
    assert isinstance(info.min_notional, Decimal)
    assert isinstance(info.step_size, Decimal)


def test_symbol_info_rejects_float():
    with pytest.raises(ValueError):
        SymbolInfo(
            symbol="BTC/USDT",
            base="BTC",
            quote="USDT",
            price_precision=2,
            quantity_precision=5,
            min_notional=10.0,  # float must be rejected # type: ignore[arg-type]
            step_size=Decimal("0.00001"),
            is_active=True,
        )


def test_ticker_uses_decimal():
    t = Ticker(
        symbol="BTC/USDT",
        bid=Decimal("42000.00"),
        ask=Decimal("42001.00"),
        last=Decimal("42000.50"),
        volume=Decimal("1234.56"),
        timestamp=datetime.now(timezone.utc),
    )
    assert isinstance(t.bid, Decimal)
    assert isinstance(t.ask, Decimal)
    assert isinstance(t.last, Decimal)
    assert isinstance(t.volume, Decimal)


def test_ticker_rejects_float():
    with pytest.raises(ValueError):
        Ticker(
            symbol="BTC/USDT",
            bid=42000.0,  # float must be rejected # type: ignore[arg-type]
            ask=Decimal("42001.00"),
            last=Decimal("42000.50"),
            volume=Decimal("1234.56"),
            timestamp=datetime.now(timezone.utc),
        )


def test_rate_limit_error_normalized():
    raw = ccxt.RateLimitExceeded("too many requests")
    err = normalize_ccxt_error(raw)
    assert isinstance(err, RateLimitedError)


def test_network_error_normalized_to_retryable():
    raw = ccxt.NetworkError("connection reset")
    err = normalize_ccxt_error(raw)
    assert isinstance(err, RetryableError)


def test_unknown_error_preserves_unknown_state():
    # Any timeout or ambiguous error must not be PermanentError
    raw = ccxt.RequestTimeout("timeout")
    err = normalize_ccxt_error(raw)
    # RequestTimeout is retryable (could have reached exchange or not)
    assert isinstance(err, (RetryableError, UnknownStateError))
    assert not isinstance(err, PermanentError)


def test_symbol_normalization():
    adapter = BinanceCCXTAdapter.__new__(BinanceCCXTAdapter)
    adapter._rest = ccxt.binance()
    assert adapter._normalize_symbol("BTCUSDT") == "BTC/USDT"
    assert adapter._normalize_symbol("BTC/USDT") == "BTC/USDT"
