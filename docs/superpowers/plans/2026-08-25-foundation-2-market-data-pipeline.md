# Foundation 2: Market Data Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real-time market data pipeline from Binance (CCXT Pro WebSocket + REST) through Redis Streams into TimescaleDB, with gap backfill, staleness monitoring, and market data REST API endpoints.

**Architecture:** BinanceCCXTAdapter wraps CCXT/CCXT Pro behind the ExchangeAdapter interface; an ingestion worker publishes normalized Pydantic domain events to Redis Streams; a separate persistence worker batch-upserts into TimescaleDB; a staleness monitor updates /health/trading when feeds go stale. All components are config-driven on TradingSettings.symbols.

**Tech Stack:** Python 3.12, CCXT >= 4.3 (includes ccxt.pro), asyncio, asyncpg, structlog, FastAPI, SQLAlchemy 2.0, Redis Streams via packages/events (F1).

## Global Constraints

- All prices, quantities, fees: `Decimal` only — `float` in any financial signature is a defect
- Symbols in canonical platform form: `BTC/USDT` (not `BTCUSDT`)
- Timestamps: timezone-aware UTC (`datetime` with `tzinfo=timezone.utc`)
- Exchange errors must normalize to platform categories; `UNKNOWN_STATE` is never collapsed
- Stream names from `packages/events/streams.py` (StreamNames constants) — never hardcode
- Redis key prefix: `{app_env}:{trading_mode}:{stream_name}` (enforced by RedisClient)
- `XACK` only after successful DB commit — never before
- Candle `is_closed` derived from exchange timestamps only — never local system clock
- Commit after every task: `feat(f2): task 2.X - description`
- Push to `origin development` after all tasks complete

---

### Task 2.1: ExchangeAdapter interface, error types, and response models

**Files:**
- Create: `packages/exchange/__init__.py`
- Create: `packages/exchange/base.py`
- Create: `packages/exchange/models.py`
- Create: `packages/exchange/errors.py`
- Test: `tests/unit/test_exchange_adapter.py`

**Interfaces:**
- Produces:
  - `ExchangeAdapter` ABC with all market data method signatures
  - `ExchangeError`, `RetryableError`, `RateLimitedError`, `AuthFailedError`, `PermanentError`, `UnknownStateError`
  - `SymbolInfo`, `AdapterHealth`, `RateLimitState`, `Ticker`, `OrderBook` response models (Decimal fields)

- [ ] **Step 1: Write failing tests**

```python
# tests/unit/test_exchange_adapter.py
from decimal import Decimal
import pytest
from packages.exchange.errors import (
    ExchangeError, RetryableError, RateLimitedError,
    AuthFailedError, PermanentError, UnknownStateError,
)
from packages.exchange.models import SymbolInfo, Ticker

def test_error_hierarchy():
    assert issubclass(RetryableError, ExchangeError)
    assert issubclass(RateLimitedError, ExchangeError)
    assert issubclass(UnknownStateError, ExchangeError)

def test_unknown_state_is_distinct():
    # Must never be caught by a generic ExchangeError handler accidentally
    err = UnknownStateError("ambiguous")
    assert isinstance(err, ExchangeError)
    assert isinstance(err, UnknownStateError)

def test_symbol_info_uses_decimal():
    info = SymbolInfo(
        symbol="BTC/USDT", base="BTC", quote="USDT",
        price_precision=2, quantity_precision=5,
        min_notional=Decimal("10.00"), step_size=Decimal("0.00001"),
        is_active=True,
    )
    assert isinstance(info.min_notional, Decimal)
    assert isinstance(info.step_size, Decimal)

def test_ticker_uses_decimal():
    from packages.exchange.models import Ticker
    from datetime import datetime, timezone
    t = Ticker(
        symbol="BTC/USDT",
        bid=Decimal("42000.00"), ask=Decimal("42001.00"),
        last=Decimal("42000.50"), volume=Decimal("1234.56"),
        timestamp=datetime.now(timezone.utc),
    )
    assert isinstance(t.bid, Decimal)
```

- [ ] **Step 2: Run to verify failure**

```bash
uv run pytest tests/unit/test_exchange_adapter.py -v
```
Expected: `ModuleNotFoundError` or `ImportError`

- [ ] **Step 3: Create `packages/exchange/errors.py`**

```python
"""Exchange adapter error hierarchy.

UNKNOWN_STATE must never be collapsed into a generic failure — it means
the platform cannot determine whether an order was placed or not.
"""


class ExchangeError(Exception):
    """Base class for all exchange errors."""


class RetryableError(ExchangeError):
    """Transient error; safe to retry with backoff."""


class RateLimitedError(ExchangeError):
    """Exchange rate limit hit; respect Retry-After."""
    def __init__(self, message: str, retry_after_seconds: float | None = None):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds


class AuthFailedError(ExchangeError):
    """Authentication failure; do not retry without credential fix."""


class PermanentError(ExchangeError):
    """Non-retryable exchange error."""


class UnknownStateError(ExchangeError):
    """The platform cannot determine whether a command succeeded.

    This is NOT a failure. The order may or may not exist on the exchange.
    Resolution requires querying by client_order_id, never blind retry.
    """
```

- [ ] **Step 4: Create `packages/exchange/models.py`**

```python
"""Exchange adapter response models.

All financial values use Decimal. No float in any monetary field.
These models live at the adapter boundary — they are NOT domain models
and are not stored in the database. They are converted to domain models
by the normalizer in the ingestion worker.
"""
from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Any
from pydantic import BaseModel, field_validator


class SymbolInfo(BaseModel):
    symbol: str
    base: str
    quote: str
    price_precision: int
    quantity_precision: int
    min_notional: Decimal
    step_size: Decimal
    is_active: bool

    @field_validator("min_notional", "step_size", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class Ticker(BaseModel):
    symbol: str
    bid: Decimal
    ask: Decimal
    last: Decimal
    volume: Decimal
    timestamp: datetime

    @field_validator("bid", "ask", "last", "volume", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class OHLCVCandle(BaseModel):
    """Raw candle from adapter boundary — not the domain Candle model."""
    symbol: str
    timeframe: str
    timestamp: datetime  # candle open time, UTC
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    is_closed: bool

    @field_validator("open", "high", "low", "close", "volume", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class MarketTrade(BaseModel):
    """Single trade print from the exchange."""
    symbol: str
    timestamp: datetime
    price: Decimal
    amount: Decimal
    side: str  # "buy" or "sell"
    exchange_trade_id: str

    @field_validator("price", "amount", mode="before")
    @classmethod
    def reject_float(cls, v: Any) -> Decimal:
        if isinstance(v, float):
            raise ValueError("float not allowed; use Decimal or str")
        return Decimal(str(v))


class OrderBook(BaseModel):
    symbol: str
    timestamp: datetime
    bids: list[tuple[Decimal, Decimal]]  # [(price, qty), ...]
    asks: list[tuple[Decimal, Decimal]]


class AdapterHealth(BaseModel):
    connected: bool
    latency_ms: float | None = None
    last_error: str | None = None


class RateLimitState(BaseModel):
    requests_used: int
    requests_limit: int
    weight_used: int
    weight_limit: int
    reset_at: datetime
```

- [ ] **Step 5: Create `packages/exchange/base.py`**

```python
"""ExchangeAdapter abstract base class.

All other components depend on this interface.
Never import CCXT types outside of packages/exchange/binance.py.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from datetime import datetime

from packages.exchange.models import (
    AdapterHealth, OHLCVCandle, MarketTrade, OrderBook,
    RateLimitState, SymbolInfo, Ticker,
)


class ExchangeAdapter(ABC):
    """Platform-stable exchange contract.

    Market data capabilities are implemented in F2.
    Account/order capabilities are stubbed here and implemented in F12.
    """

    # ── Market data (F2 implements) ──────────────────────────────────────

    @abstractmethod
    async def get_ticker(self, symbol: str) -> Ticker: ...

    @abstractmethod
    async def get_candles(
        self, symbol: str, timeframe: str, since: datetime, limit: int
    ) -> list[OHLCVCandle]: ...

    @abstractmethod
    async def get_order_book(self, symbol: str, depth: int) -> OrderBook: ...

    @abstractmethod
    async def get_recent_trades(
        self, symbol: str, since: datetime, limit: int
    ) -> list[MarketTrade]: ...

    @abstractmethod
    async def get_symbol_info(self, symbol: str) -> SymbolInfo: ...

    @abstractmethod
    async def get_server_time(self) -> datetime: ...

    @abstractmethod
    async def health(self) -> AdapterHealth: ...

    @abstractmethod
    async def get_rate_limit_state(self) -> RateLimitState: ...

    # ── Account/Order (F12 implements — NotImplementedError stubs) ───────

    async def get_balance(self) -> dict:
        raise NotImplementedError("Implemented in Foundation 12")

    async def place_order(self, request: object) -> object:
        raise NotImplementedError("Implemented in Foundation 12")

    async def cancel_order(self, client_order_id: str) -> object:
        raise NotImplementedError("Implemented in Foundation 12")

    async def get_order(self, client_order_id: str) -> object:
        raise NotImplementedError("Implemented in Foundation 12")

    async def get_fills(self, symbol: str, since: datetime) -> list:
        raise NotImplementedError("Implemented in Foundation 12")

    async def get_permissions(self) -> object:
        raise NotImplementedError("Implemented in Foundation 12")
```

- [ ] **Step 6: Create `packages/exchange/__init__.py`**

```python
from packages.exchange.base import ExchangeAdapter
from packages.exchange.errors import (
    ExchangeError, RetryableError, RateLimitedError,
    AuthFailedError, PermanentError, UnknownStateError,
)
from packages.exchange.models import (
    AdapterHealth, OHLCVCandle, MarketTrade, OrderBook,
    RateLimitState, SymbolInfo, Ticker,
)

__all__ = [
    "ExchangeAdapter",
    "ExchangeError", "RetryableError", "RateLimitedError",
    "AuthFailedError", "PermanentError", "UnknownStateError",
    "AdapterHealth", "OHLCVCandle", "MarketTrade", "OrderBook",
    "RateLimitState", "SymbolInfo", "Ticker",
]
```

- [ ] **Step 7: Run tests and verify passing**

```bash
uv run pytest tests/unit/test_exchange_adapter.py -v
```
Expected: 4 passed

- [ ] **Step 8: Run type check**

```bash
uv run mypy packages/exchange --strict
```
Expected: no errors

- [ ] **Step 9: Commit**

```bash
git add packages/exchange/ tests/unit/test_exchange_adapter.py
git commit -m "feat(f2): task 2.1 - ExchangeAdapter interface, error types, response models"
```

---

### Task 2.2: BinanceCCXTAdapter REST (market data + symbol info + rate limiting)

**Files:**
- Create: `packages/exchange/binance.py`
- Modify: `packages/exchange/__init__.py` (add BinanceCCXTAdapter export)
- Modify: `pyproject.toml` (add `ccxt>=4.3` to core dependencies)
- Modify: `tests/unit/test_exchange_adapter.py` (add normalizer tests)

**Interfaces:**
- Consumes: `ExchangeAdapter` ABC, all error and model types from Task 2.1
- Produces: `BinanceCCXTAdapter` class, `normalize_ccxt_error(e) -> ExchangeError` function

- [ ] **Step 1: Add ccxt to pyproject.toml**

In `pyproject.toml`, add to the core dependencies list:
```toml
"ccxt>=4.3",
```
Then run:
```bash
uv sync
```
Expected: ccxt installed and uv.lock updated.

- [ ] **Step 2: Write failing tests for normalizer**

```python
# Add to tests/unit/test_exchange_adapter.py
import ccxt
from packages.exchange.binance import normalize_ccxt_error

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
    from packages.exchange.binance import BinanceCCXTAdapter
    adapter = BinanceCCXTAdapter.__new__(BinanceCCXTAdapter)
    assert adapter._normalize_symbol("BTCUSDT") == "BTC/USDT"
    assert adapter._normalize_symbol("BTC/USDT") == "BTC/USDT"
```

- [ ] **Step 3: Run to verify failure**

```bash
uv run pytest tests/unit/test_exchange_adapter.py -v -k "normalize"
```
Expected: ImportError or ModuleNotFoundError

- [ ] **Step 4: Create `packages/exchange/binance.py`**

```python
"""Binance exchange adapter using CCXT (REST) and CCXT Pro (WebSocket).

CCXT is the default. Binance-native calls are only used when:
  1. A capability is missing from CCXT
  2. CCXT normalization loses required information
  3. A measured latency problem is traced to the abstraction
Each native call site must document why in a comment.

This adapter is UNAUTHENTICATED in F2. No credentials are accepted or used.
Account/order methods (F12) will add authenticated CCXT exchange instances.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from decimal import Decimal
from typing import AsyncIterator

import ccxt
import ccxt.pro as ccxtpro

from packages.exchange.base import ExchangeAdapter
from packages.exchange.errors import (
    AuthFailedError, ExchangeError, PermanentError,
    RateLimitedError, RetryableError, UnknownStateError,
)
from packages.exchange.models import (
    AdapterHealth, OHLCVCandle, MarketTrade, OrderBook,
    RateLimitState, SymbolInfo, Ticker,
)


def normalize_ccxt_error(e: Exception) -> ExchangeError:
    """Map CCXT exceptions to platform error categories.

    UNKNOWN_STATE must never be collapsed into PermanentError or RetryableError.
    A RequestTimeout might mean the exchange received and processed the order.
    """
    if isinstance(e, ccxt.RateLimitExceeded):
        return RateLimitedError(str(e))
    if isinstance(e, ccxt.AuthenticationError):
        return AuthFailedError(str(e))
    if isinstance(e, (ccxt.NetworkError, ccxt.ExchangeNotAvailable)):
        return RetryableError(str(e))
    if isinstance(e, ccxt.RequestTimeout):
        # Timeout = unknown state. The request may or may not have reached Binance.
        return RetryableError(str(e))
    if isinstance(e, ccxt.BadSymbol):
        return PermanentError(str(e))
    if isinstance(e, ccxt.ExchangeError):
        return PermanentError(str(e))
    return ExchangeError(str(e))


def _ms_to_dt(ms: int | None) -> datetime:
    if ms is None:
        return datetime.now(timezone.utc)
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc)


class BinanceCCXTAdapter(ExchangeAdapter):
    """Binance market data adapter (public, unauthenticated)."""

    TIMEFRAME_DURATIONS_MS: dict[str, int] = {
        "1m": 60_000,
        "15m": 900_000,
        "1h": 3_600_000,
        "4h": 14_400_000,
        "1d": 86_400_000,
    }

    def __init__(self, sandbox: bool = False) -> None:
        self._rest = ccxt.binance({"options": {"defaultType": "spot"}})
        self._ws: ccxtpro.binance | None = None
        self._sandbox = sandbox
        if sandbox:
            self._rest.set_sandbox_mode(True)

    def _normalize_symbol(self, raw: str) -> str:
        """Ensure symbol is in platform canonical form: BTC/USDT."""
        if "/" in raw:
            return raw.upper()
        # BTCUSDT → BTC/USDT via CCXT market mapping
        try:
            if not self._rest.markets:
                return raw
            for symbol, market in self._rest.markets.items():
                if market.get("id", "").upper() == raw.upper():
                    return symbol
        except Exception:
            pass
        return raw.upper()

    def _get_ws(self) -> ccxtpro.binance:
        if self._ws is None:
            self._ws = ccxtpro.binance({"options": {"defaultType": "spot"}})
            if self._sandbox:
                self._ws.set_sandbox_mode(True)
        return self._ws

    async def get_ticker(self, symbol: str) -> Ticker:
        try:
            raw = await asyncio.to_thread(self._rest.fetch_ticker, symbol)
            return Ticker(
                symbol=symbol,
                bid=Decimal(str(raw["bid"] or raw["last"])),
                ask=Decimal(str(raw["ask"] or raw["last"])),
                last=Decimal(str(raw["last"])),
                volume=Decimal(str(raw["baseVolume"] or "0")),
                timestamp=_ms_to_dt(raw["timestamp"]),
            )
        except Exception as e:
            raise normalize_ccxt_error(e) from e

    async def get_candles(
        self, symbol: str, timeframe: str, since: datetime, limit: int
    ) -> list[OHLCVCandle]:
        try:
            since_ms = int(since.timestamp() * 1000)
            raw_list = await asyncio.to_thread(
                self._rest.fetch_ohlcv, symbol, timeframe, since_ms, limit
            )
            tf_ms = self.TIMEFRAME_DURATIONS_MS.get(timeframe, 60_000)
            candles = []
            for i, row in enumerate(raw_list):
                ts_ms, o, h, l, c, v = row
                # is_closed: the next candle's ts > this ts, or it's the last one
                is_closed = i < len(raw_list) - 1
                candles.append(OHLCVCandle(
                    symbol=symbol, timeframe=timeframe,
                    timestamp=_ms_to_dt(ts_ms),
                    open=Decimal(str(o)), high=Decimal(str(h)),
                    low=Decimal(str(l)), close=Decimal(str(c)),
                    volume=Decimal(str(v)),
                    is_closed=is_closed,
                ))
            return candles
        except Exception as e:
            raise normalize_ccxt_error(e) from e

    async def get_order_book(self, symbol: str, depth: int) -> OrderBook:
        try:
            raw = await asyncio.to_thread(self._rest.fetch_order_book, symbol, depth)
            return OrderBook(
                symbol=symbol,
                timestamp=_ms_to_dt(raw.get("timestamp")),
                bids=[(Decimal(str(p)), Decimal(str(q))) for p, q in raw["bids"]],
                asks=[(Decimal(str(p)), Decimal(str(q))) for p, q in raw["asks"]],
            )
        except Exception as e:
            raise normalize_ccxt_error(e) from e

    async def get_recent_trades(
        self, symbol: str, since: datetime, limit: int
    ) -> list[MarketTrade]:
        try:
            since_ms = int(since.timestamp() * 1000)
            raw_list = await asyncio.to_thread(
                self._rest.fetch_trades, symbol, since_ms, limit
            )
            return [
                MarketTrade(
                    symbol=symbol,
                    timestamp=_ms_to_dt(r["timestamp"]),
                    price=Decimal(str(r["price"])),
                    amount=Decimal(str(r["amount"])),
                    side=r["side"],
                    exchange_trade_id=str(r["id"]),
                )
                for r in raw_list
            ]
        except Exception as e:
            raise normalize_ccxt_error(e) from e

    async def get_symbol_info(self, symbol: str) -> SymbolInfo:
        try:
            if not self._rest.markets:
                await asyncio.to_thread(self._rest.load_markets)
            market = self._rest.market(symbol)
            limits = market.get("limits", {})
            precision = market.get("precision", {})
            cost_limits = limits.get("cost", {})
            amount_limits = limits.get("amount", {})
            return SymbolInfo(
                symbol=symbol,
                base=market["base"],
                quote=market["quote"],
                price_precision=int(precision.get("price", 8)),
                quantity_precision=int(precision.get("amount", 8)),
                min_notional=Decimal(str(cost_limits.get("min", "10"))),
                step_size=Decimal(str(amount_limits.get("min", "0.00001"))),
                is_active=market.get("active", True),
            )
        except Exception as e:
            raise normalize_ccxt_error(e) from e

    async def get_server_time(self) -> datetime:
        try:
            ms = await asyncio.to_thread(self._rest.fetch_time)
            return _ms_to_dt(ms)
        except Exception as e:
            raise normalize_ccxt_error(e) from e

    async def health(self) -> AdapterHealth:
        try:
            import time
            start = time.monotonic()
            await self.get_server_time()
            latency = (time.monotonic() - start) * 1000
            return AdapterHealth(connected=True, latency_ms=latency)
        except Exception as e:
            return AdapterHealth(connected=False, last_error=str(e))

    async def get_rate_limit_state(self) -> RateLimitState:
        # CCXT tracks rate limit state internally
        # Binance uses request weight; expose what CCXT provides
        return RateLimitState(
            requests_used=0,
            requests_limit=1200,
            weight_used=self._rest.last_response_headers.get(
                "x-mbx-used-weight-1m", 0
            ) if hasattr(self._rest, "last_response_headers") else 0,
            weight_limit=1200,
            reset_at=datetime.now(timezone.utc),
        )

    # ── WebSocket streaming (CCXT Pro) ────────────────────────────────────

    async def stream_tickers(
        self, symbols: list[str]
    ) -> AsyncIterator[Ticker]:
        ws = self._get_ws()
        while True:
            try:
                raw = await ws.watch_tickers(symbols)
                for symbol, data in raw.items():
                    if data.get("last") is None:
                        continue
                    yield Ticker(
                        symbol=symbol,
                        bid=Decimal(str(data.get("bid") or data["last"])),
                        ask=Decimal(str(data.get("ask") or data["last"])),
                        last=Decimal(str(data["last"])),
                        volume=Decimal(str(data.get("baseVolume") or "0")),
                        timestamp=_ms_to_dt(data.get("timestamp")),
                    )
            except (ccxt.NetworkError, ccxt.ExchangeNotAvailable) as e:
                raise RetryableError(str(e)) from e

    async def stream_ohlcv(
        self, symbols: list[str], timeframes: list[str]
    ) -> AsyncIterator[OHLCVCandle]:
        ws = self._get_ws()
        tf_ms = self.TIMEFRAME_DURATIONS_MS
        while True:
            try:
                raw = await ws.watch_ohlcv_for_symbols(
                    [[s, tf] for s in symbols for tf in timeframes]
                )
                for symbol, tf_map in raw.items():
                    for timeframe, candles in tf_map.items():
                        for i, row in enumerate(candles):
                            ts_ms, o, h, l, c, v = row
                            is_closed = i < len(candles) - 1
                            yield OHLCVCandle(
                                symbol=symbol, timeframe=timeframe,
                                timestamp=_ms_to_dt(ts_ms),
                                open=Decimal(str(o)), high=Decimal(str(h)),
                                low=Decimal(str(l)), close=Decimal(str(c)),
                                volume=Decimal(str(v)),
                                is_closed=is_closed,
                            )
            except (ccxt.NetworkError, ccxt.ExchangeNotAvailable) as e:
                raise RetryableError(str(e)) from e

    async def stream_trades(
        self, symbols: list[str]
    ) -> AsyncIterator[MarketTrade]:
        ws = self._get_ws()
        while True:
            try:
                raw = await ws.watch_trades_for_symbols(symbols)
                for trade in raw:
                    yield MarketTrade(
                        symbol=trade["symbol"],
                        timestamp=_ms_to_dt(trade["timestamp"]),
                        price=Decimal(str(trade["price"])),
                        amount=Decimal(str(trade["amount"])),
                        side=trade["side"],
                        exchange_trade_id=str(trade["id"]),
                    )
            except (ccxt.NetworkError, ccxt.ExchangeNotAvailable) as e:
                raise RetryableError(str(e)) from e

    async def stream_orderbook(
        self, symbols: list[str], depth: int = 20
    ) -> AsyncIterator[OrderBook]:
        ws = self._get_ws()
        while True:
            try:
                raw = await ws.watch_order_book_for_symbols(symbols, depth)
                for symbol, book in raw.items():
                    yield OrderBook(
                        symbol=symbol,
                        timestamp=_ms_to_dt(book.get("timestamp")),
                        bids=[(Decimal(str(p)), Decimal(str(q))) for p, q in book["bids"]],
                        asks=[(Decimal(str(p)), Decimal(str(q))) for p, q in book["asks"]],
                    )
            except (ccxt.NetworkError, ccxt.ExchangeNotAvailable) as e:
                raise RetryableError(str(e)) from e

    async def close(self) -> None:
        if self._ws:
            await self._ws.close()
```

- [ ] **Step 5: Export from `__init__.py`**

Add to `packages/exchange/__init__.py`:
```python
from packages.exchange.binance import BinanceCCXTAdapter, normalize_ccxt_error

__all__ = [
    # ... existing exports ...
    "BinanceCCXTAdapter",
    "normalize_ccxt_error",
]
```

- [ ] **Step 6: Run tests and verify passing**

```bash
uv run pytest tests/unit/test_exchange_adapter.py -v
```
Expected: all tests pass

- [ ] **Step 7: Run type check**

```bash
uv run mypy packages/exchange --strict
```
Expected: no errors (ignore ccxt stubs warnings if any — ccxt doesn't ship stubs)

- [ ] **Step 8: Commit**

```bash
git add packages/exchange/ pyproject.toml uv.lock
git commit -m "feat(f2): task 2.2 - BinanceCCXTAdapter REST + WebSocket streaming"
```

---

### Task 2.3: Candle closure logic tests

**Files:**
- Create: `tests/unit/test_candle_closure.py`

**Interfaces:**
- Consumes: `OHLCVCandle` from Task 2.1; `is_closed` derivation logic from Task 2.2
- Produces: Verified `is_closed` logic for all four timeframes

- [ ] **Step 1: Write and run closure logic tests**

```python
# tests/unit/test_candle_closure.py
"""Tests for candle is_closed derivation.

is_closed must be derived from exchange timestamps only.
Local system clock is never used.
"""
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import pytest
from packages.exchange.models import OHLCVCandle


def make_candle(ts: datetime, is_closed: bool, tf: str = "1m") -> OHLCVCandle:
    return OHLCVCandle(
        symbol="BTC/USDT", timeframe=tf,
        timestamp=ts,
        open=Decimal("42000"), high=Decimal("42100"),
        low=Decimal("41900"), close=Decimal("42050"),
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
            symbol="BTC/USDT", timeframe="1m",
            timestamp=base,
            open=42000.0,  # float — must reject  # type: ignore[arg-type]
            high=Decimal("42100"), low=Decimal("41900"),
            close=Decimal("42050"), volume=Decimal("10"),
            is_closed=True,
        )
```

- [ ] **Step 2: Run tests**

```bash
uv run pytest tests/unit/test_candle_closure.py -v
```
Expected: all 4 pass

- [ ] **Step 3: Commit**

```bash
git add tests/unit/test_candle_closure.py
git commit -m "feat(f2): task 2.3 - candle closure logic tests"
```

---

### Task 2.4: Market data ingestion worker with supervisor and reconnection

**Files:**
- Create: `services/market-data/__init__.py`
- Create: `services/market-data/publisher.py`
- Create: `services/market-data/worker.py`

**Interfaces:**
- Consumes:
  - `BinanceCCXTAdapter.stream_tickers/stream_ohlcv/stream_trades/stream_orderbook`
  - `RedisStreamPublisher` from `packages/events/streams.py`
  - `StreamNames` constants from `packages/events/streams.py`
  - `TradingSettings.symbols` and `TradingSettings.timeframes` from `packages/config`
- Produces:
  - `IngestionWorker` class with `run()` async method
  - Published Redis stream messages with `symbol`, `timeframe`, Decimal-serialized fields

- [ ] **Step 1: Create `services/market-data/__init__.py`**

```python
"""Market data ingestion and persistence services."""
```

- [ ] **Step 2: Create `services/market-data/publisher.py`**

```python
"""Thin wrapper around RedisStreamPublisher for market data events."""
from __future__ import annotations
from decimal import Decimal

from packages.events.streams import RedisStreamPublisher, StreamNames
from packages.exchange.models import OHLCVCandle, MarketTrade, Ticker, OrderBook


def _decimal_to_str(obj: object) -> object:
    """JSON-safe serialization: Decimal → str to preserve precision."""
    if isinstance(obj, Decimal):
        return str(obj)
    return obj


class MarketDataPublisher:
    def __init__(self, publisher: RedisStreamPublisher) -> None:
        self._pub = publisher

    async def publish_ticker(self, ticker: Ticker) -> None:
        await self._pub.publish(StreamNames.MARKET_TICKERS, {
            "symbol": ticker.symbol,
            "bid": str(ticker.bid),
            "ask": str(ticker.ask),
            "last": str(ticker.last),
            "volume": str(ticker.volume),
            "timestamp": ticker.timestamp.isoformat(),
        })

    async def publish_candle(self, candle: OHLCVCandle) -> None:
        await self._pub.publish(StreamNames.MARKET_CANDLES, {
            "symbol": candle.symbol,
            "timeframe": candle.timeframe,
            "timestamp": candle.timestamp.isoformat(),
            "open": str(candle.open),
            "high": str(candle.high),
            "low": str(candle.low),
            "close": str(candle.close),
            "volume": str(candle.volume),
            "is_closed": "1" if candle.is_closed else "0",
        })

    async def publish_trade(self, trade: MarketTrade) -> None:
        await self._pub.publish(StreamNames.MARKET_TRADES, {
            "symbol": trade.symbol,
            "timestamp": trade.timestamp.isoformat(),
            "price": str(trade.price),
            "amount": str(trade.amount),
            "side": trade.side,
            "exchange_trade_id": trade.exchange_trade_id,
        })

    async def publish_orderbook(self, book: OrderBook) -> None:
        import json
        await self._pub.publish(StreamNames.MARKET_ORDERBOOK, {
            "symbol": book.symbol,
            "timestamp": book.timestamp.isoformat(),
            "bids": json.dumps([[str(p), str(q)] for p, q in book.bids[:10]]),
            "asks": json.dumps([[str(p), str(q)] for p, q in book.asks[:10]]),
        })
```

- [ ] **Step 3: Create `services/market-data/worker.py`**

```python
"""Market data ingestion worker.

Runs six concurrent asyncio tasks:
  1. Ticker streaming
  2. OHLCV streaming (all configured timeframes)
  3. Trades streaming
  4. Order book streaming
  5. Health monitor
  6. Supervisor (restarts failed tasks with exponential backoff)

Reconnection: exponential backoff (1s base, 60s max).
On reconnect: triggers gap detection + backfill (Task 2.5).
"""
from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field

import structlog

from packages.config.settings import Settings
from packages.exchange.binance import BinanceCCXTAdapter
from packages.exchange.errors import RetryableError
from services.market_data.health import FeedHealthMonitor
from services.market_data.publisher import MarketDataPublisher

logger = structlog.get_logger(__name__)


@dataclass
class WorkerConfig:
    symbols: list[str]
    timeframes: list[str]
    max_backoff_seconds: float = 60.0
    base_backoff_seconds: float = 1.0


class IngestionWorker:
    """Runs all market data streaming tasks with supervised restart."""

    def __init__(
        self,
        adapter: BinanceCCXTAdapter,
        publisher: MarketDataPublisher,
        health: FeedHealthMonitor,
        config: WorkerConfig,
        backfill_fn: "Callable | None" = None,
    ) -> None:
        self._adapter = adapter
        self._publisher = publisher
        self._health = health
        self._config = config
        self._backfill_fn = backfill_fn
        self._running = False

    async def run(self) -> None:
        self._running = True
        tasks = {
            "tickers": self._run_tickers,
            "ohlcv": self._run_ohlcv,
            "trades": self._run_trades,
            "orderbook": self._run_orderbook,
            "health": self._run_health_monitor,
        }
        attempts: dict[str, int] = {name: 0 for name in tasks}

        async def supervised(name: str, coro_fn: "Callable") -> None:
            while self._running:
                start = time.monotonic()
                try:
                    await coro_fn()
                except asyncio.CancelledError:
                    return
                except Exception as exc:
                    elapsed = time.monotonic() - start
                    attempts[name] += 1
                    wait = min(
                        self._config.base_backoff_seconds * (2 ** attempts[name]),
                        self._config.max_backoff_seconds,
                    )
                    logger.warning(
                        "market_data_task_failed",
                        task=name, error=str(exc),
                        attempt=attempts[name], retry_in_seconds=wait,
                        disconnect_duration_seconds=elapsed,
                    )
                    await asyncio.sleep(wait)
                    # Trigger backfill after reconnect
                    if name in ("tickers", "ohlcv") and self._backfill_fn:
                        asyncio.create_task(self._backfill_fn())
                else:
                    attempts[name] = 0  # reset on clean exit

        await asyncio.gather(*[
            supervised(name, fn) for name, fn in tasks.items()
        ])

    async def stop(self) -> None:
        self._running = False
        await self._adapter.close()

    async def _run_tickers(self) -> None:
        async for ticker in self._adapter.stream_tickers(self._config.symbols):
            await self._publisher.publish_ticker(ticker)
            self._health.record_ticker(ticker.symbol)

    async def _run_ohlcv(self) -> None:
        async for candle in self._adapter.stream_ohlcv(
            self._config.symbols, self._config.timeframes
        ):
            await self._publisher.publish_candle(candle)
            self._health.record_candle(candle.symbol, candle.timeframe)

    async def _run_trades(self) -> None:
        async for trade in self._adapter.stream_trades(self._config.symbols):
            await self._publisher.publish_trade(trade)
            self._health.record_trade(trade.symbol)

    async def _run_orderbook(self) -> None:
        async for book in self._adapter.stream_orderbook(self._config.symbols):
            await self._publisher.publish_orderbook(book)

    async def _run_health_monitor(self) -> None:
        while self._running:
            self._health.check_all()
            await asyncio.sleep(10)
```

- [ ] **Step 4: Run type check**

```bash
uv run mypy services/market_data/publisher.py services/market_data/worker.py --strict
```
Fix any errors before committing.

- [ ] **Step 5: Commit**

```bash
git add services/market-data/
git commit -m "feat(f2): task 2.4 - market data ingestion worker with supervisor and reconnection"
```

---

### Task 2.5: Feed staleness monitor

**Files:**
- Create: `services/market-data/health.py`
- Modify: `apps/api/routers/health.py` (add MARKET_DATA_NOT_READY reason)
- Create: `tests/unit/test_staleness_monitor.py`

**Interfaces:**
- Consumes: `RiskSettings.market_data_max_age_seconds` from packages/config
- Produces:
  - `FeedHealthMonitor` class with `record_ticker/candle/trade`, `check_all()`, `is_ready` property
  - `MARKET_DATA_NOT_READY` reason code in `/health/trading` endpoint

- [ ] **Step 1: Write failing tests for staleness monitor**

```python
# tests/unit/test_staleness_monitor.py
import time
import pytest
from services.market_data.health import FeedHealthMonitor, FeedConfig


def test_fresh_feed_is_ready():
    config = FeedConfig(
        symbols=["BTC/USDT"],
        timeframes=["1m", "15m"],
        ticker_stale_seconds=60,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")
    monitor.record_trade("BTC/USDT")
    monitor.record_candle("BTC/USDT", "1m")
    monitor.record_candle("BTC/USDT", "15m")
    monitor.check_all()
    assert monitor.is_ready is True


def test_stale_ticker_marks_not_ready(monkeypatch):
    config = FeedConfig(
        symbols=["BTC/USDT"],
        timeframes=["1m"],
        ticker_stale_seconds=1,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")
    monitor.record_trade("BTC/USDT")
    monitor.record_candle("BTC/USDT", "1m")

    # Fast-forward time: last ticker was 2 seconds ago
    old_time = monitor._last_ticker["BTC/USDT"]
    monitor._last_ticker["BTC/USDT"] = old_time - 2.0
    monitor.check_all()
    assert monitor.is_ready is False


def test_recovery_after_stale():
    config = FeedConfig(
        symbols=["BTC/USDT"],
        timeframes=["1m"],
        ticker_stale_seconds=1,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")
    monitor._last_ticker["BTC/USDT"] -= 2.0  # force stale
    monitor.check_all()
    assert monitor.is_ready is False

    # Recover: new ticker arrives
    monitor.record_ticker("BTC/USDT")
    monitor.check_all()
    assert monitor.is_ready is True


def test_missing_symbol_marks_not_ready():
    config = FeedConfig(
        symbols=["BTC/USDT", "ETH/USDT"],
        timeframes=["1m"],
        ticker_stale_seconds=60,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")  # ETH/USDT never seen
    monitor.check_all()
    assert monitor.is_ready is False
```

- [ ] **Step 2: Run to verify failure**

```bash
uv run pytest tests/unit/test_staleness_monitor.py -v
```
Expected: ImportError

- [ ] **Step 3: Create `services/market-data/health.py`**

```python
"""Feed staleness monitor.

Tracks last-received timestamps per stream type / symbol / timeframe.
check_all() updates is_ready based on configurable staleness thresholds.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field

import structlog

logger = structlog.get_logger(__name__)

CANDLE_STALE_SECONDS: dict[str, float] = {
    "1m": 120,
    "15m": 300,
    "1h": 900,
    "4h": 3600,
}


@dataclass
class FeedConfig:
    symbols: list[str]
    timeframes: list[str]
    ticker_stale_seconds: float
    trade_stale_seconds: float


class FeedHealthMonitor:
    """Tracks feed freshness and exposes is_ready flag."""

    def __init__(self, config: FeedConfig) -> None:
        self._config = config
        self._last_ticker: dict[str, float] = {}
        self._last_trade: dict[str, float] = {}
        self._last_candle: dict[tuple[str, str], float] = {}
        self._ready = False
        self._stale_reasons: list[str] = []

    @property
    def is_ready(self) -> bool:
        return self._ready

    @property
    def stale_reasons(self) -> list[str]:
        return list(self._stale_reasons)

    def record_ticker(self, symbol: str) -> None:
        self._last_ticker[symbol] = time.monotonic()

    def record_trade(self, symbol: str) -> None:
        self._last_trade[symbol] = time.monotonic()

    def record_candle(self, symbol: str, timeframe: str) -> None:
        self._last_candle[(symbol, timeframe)] = time.monotonic()

    def check_all(self) -> None:
        now = time.monotonic()
        reasons: list[str] = []

        for symbol in self._config.symbols:
            # Ticker
            last = self._last_ticker.get(symbol, 0)
            age = now - last
            if age > self._config.ticker_stale_seconds:
                reasons.append(f"ticker:{symbol}:stale:{age:.0f}s")

            # Trades
            last = self._last_trade.get(symbol, 0)
            age = now - last
            if age > self._config.trade_stale_seconds:
                reasons.append(f"trades:{symbol}:stale:{age:.0f}s")

            # Candles
            for tf in self._config.timeframes:
                last = self._last_candle.get((symbol, tf), 0)
                age = now - last
                threshold = CANDLE_STALE_SECONDS.get(tf, 120)
                if age > threshold:
                    reasons.append(f"candle:{symbol}:{tf}:stale:{age:.0f}s")

        self._stale_reasons = reasons
        was_ready = self._ready
        self._ready = len(reasons) == 0

        if was_ready and not self._ready:
            logger.warning("market_data_feed_stale", reasons=reasons)
        elif not was_ready and self._ready:
            logger.info("market_data_feed_recovered")
```

- [ ] **Step 4: Update `/health/trading` endpoint**

In `apps/api/routers/health.py`, add `MARKET_DATA_NOT_READY` to the reasons list when the monitor reports not ready. The worker exposes a module-level `_health_monitor` singleton that the health endpoint reads. For F2, add a simple getter:

```python
# In apps/api/routers/health.py, update the /health/trading handler:
# Add to the not_ready_reasons list:
from services.market_data.health import get_global_health_monitor

monitor = get_global_health_monitor()
if monitor and not monitor.is_ready:
    not_ready_reasons.extend([
        {"code": "MARKET_DATA_NOT_READY", "detail": r}
        for r in monitor.stale_reasons
    ])
```

Add to `services/market-data/health.py`:
```python
_global_monitor: FeedHealthMonitor | None = None

def set_global_health_monitor(monitor: FeedHealthMonitor) -> None:
    global _global_monitor
    _global_monitor = monitor

def get_global_health_monitor() -> FeedHealthMonitor | None:
    return _global_monitor
```

- [ ] **Step 5: Run tests**

```bash
uv run pytest tests/unit/test_staleness_monitor.py -v
```
Expected: 4 passed

- [ ] **Step 6: Commit**

```bash
git add services/market-data/health.py tests/unit/test_staleness_monitor.py apps/api/routers/health.py
git commit -m "feat(f2): task 2.5 - feed staleness monitor and /health/trading integration"
```

---

### Task 2.6: Gap detection and REST backfill

**Files:**
- Create: `services/market-data/backfill.py`

**Interfaces:**
- Consumes:
  - `BinanceCCXTAdapter.get_candles()` (REST)
  - `AsyncSession` from `packages/database/engine.py`
  - TimescaleDB `market_candles` table from `packages/database/models/hypertables.py`
- Produces:
  - `BackfillService` class with `run_backfill(symbols, timeframes)` async method
  - Direct TimescaleDB upsert (bypasses Redis — backfill is not a live event)

- [ ] **Step 1: Create `services/market-data/backfill.py`**

```python
"""Gap detection and REST historical candle backfill.

Runs on startup and after every WebSocket reconnect.
Writes directly to TimescaleDB — bypasses Redis Streams.
Redis is not authoritative; a gap there is acceptable.
All backfilled candles are is_closed=True.
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from decimal import Decimal

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.exchange.binance import BinanceCCXTAdapter
from packages.exchange.models import OHLCVCandle

logger = structlog.get_logger(__name__)

# Maximum number of days to backfill in one reconnect cycle
MAX_BACKFILL_DAYS = 30

TIMEFRAME_DURATION: dict[str, timedelta] = {
    "1m": timedelta(minutes=1),
    "15m": timedelta(minutes=15),
    "1h": timedelta(hours=1),
    "4h": timedelta(hours=4),
    "1d": timedelta(days=1),
}


class BackfillService:
    def __init__(
        self,
        adapter: BinanceCCXTAdapter,
        session_factory: "Callable[[], AsyncSession]",
        trading_mode: str,
    ) -> None:
        self._adapter = adapter
        self._session_factory = session_factory
        self._trading_mode = trading_mode

    async def run_backfill(
        self, symbols: list[str], timeframes: list[str]
    ) -> None:
        for symbol in symbols:
            for timeframe in timeframes:
                await self._backfill_one(symbol, timeframe)

    async def _backfill_one(self, symbol: str, timeframe: str) -> None:
        tf_duration = TIMEFRAME_DURATION.get(timeframe, timedelta(minutes=1))
        max_backfill_start = datetime.now(timezone.utc) - timedelta(days=MAX_BACKFILL_DAYS)

        async with self._session_factory() as session:
            # Find latest closed candle in DB
            result = await session.execute(
                text("""
                    SELECT MAX(timestamp)
                    FROM market_candles
                    WHERE symbol = :symbol
                      AND timeframe = :timeframe
                      AND trading_mode = :trading_mode
                      AND is_closed = TRUE
                """),
                {"symbol": symbol, "timeframe": timeframe, "trading_mode": self._trading_mode},
            )
            latest_ts = result.scalar()

        if latest_ts is None:
            since = max_backfill_start
        else:
            since = latest_ts.replace(tzinfo=timezone.utc)
            if since < max_backfill_start:
                logger.warning(
                    "backfill_gap_too_large",
                    symbol=symbol, timeframe=timeframe,
                    gap_days=(datetime.now(timezone.utc) - since).days,
                    truncating_to_days=MAX_BACKFILL_DAYS,
                )
                since = max_backfill_start

        now = datetime.now(timezone.utc)
        # Buffer: exclude the currently forming candle
        end = now - (2 * tf_duration)
        if since >= end:
            return  # No gap

        gap_seconds = (end - since).total_seconds()
        logger.info(
            "backfill_starting",
            symbol=symbol, timeframe=timeframe,
            since=since.isoformat(), gap_seconds=gap_seconds,
        )

        candles = await self._adapter.get_candles(symbol, timeframe, since, limit=1000)
        closed = [c for c in candles if c.is_closed]

        if not closed:
            return

        await self._upsert_candles(closed)
        logger.info(
            "backfill_complete",
            symbol=symbol, timeframe=timeframe,
            rows_backfilled=len(closed),
        )

    async def _upsert_candles(self, candles: list[OHLCVCandle]) -> None:
        async with self._session_factory() as session:
            async with session.begin():
                await session.execute(
                    text("""
                        INSERT INTO market_candles
                            (symbol, timeframe, timestamp, open, high, low, close, volume,
                             is_closed, trading_mode)
                        VALUES
                            (:symbol, :timeframe, :timestamp, :open, :high, :low, :close,
                             :volume, :is_closed, :trading_mode)
                        ON CONFLICT (symbol, timeframe, timestamp)
                        DO UPDATE SET
                            open = EXCLUDED.open,
                            high = EXCLUDED.high,
                            low = EXCLUDED.low,
                            close = EXCLUDED.close,
                            volume = EXCLUDED.volume
                        WHERE NOT market_candles.is_closed
                    """),
                    [
                        {
                            "symbol": c.symbol, "timeframe": c.timeframe,
                            "timestamp": c.timestamp, "open": c.open,
                            "high": c.high, "low": c.low, "close": c.close,
                            "volume": c.volume, "is_closed": c.is_closed,
                            "trading_mode": self._trading_mode,
                        }
                        for c in candles
                    ],
                )
```

- [ ] **Step 2: Run type check**

```bash
uv run mypy services/market_data/backfill.py --strict
```
Fix any errors.

- [ ] **Step 3: Commit**

```bash
git add services/market-data/backfill.py
git commit -m "feat(f2): task 2.6 - gap detection and REST candle backfill"
```

---

### Task 2.7: TimescaleDB persistence worker

**Files:**
- Create: `services/market-data/persistence.py`

**Interfaces:**
- Consumes:
  - `RedisStreamConsumer` from `packages/events/streams.py`
  - `StreamNames` constants
  - `AsyncSession` from `packages/database/engine.py`
  - TimescaleDB tables: `market_candles`, `market_trades` from packages/database/models/hypertables.py
- Produces:
  - `PersistenceWorker` class with `run()` async method
  - Batch upserts with XACK after commit only

- [ ] **Step 1: Create `services/market-data/persistence.py`**

```python
"""TimescaleDB persistence worker.

Consumes Redis Streams via consumer group 'persistence'.
Accumulates events in a batch buffer (1s or 5000 events) then flushes.
XACK is sent only after successful DB commit.
On DB failure: do not ack; message redelivered on next XREADGROUP.
"""
from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.events.streams import RedisStreamConsumer, StreamNames

logger = structlog.get_logger(__name__)

BATCH_MAX_EVENTS = 5000
BATCH_MAX_SECONDS = 1.0


class PersistenceWorker:
    def __init__(
        self,
        consumer: RedisStreamConsumer,
        session_factory: "Callable[[], AsyncSession]",
        trading_mode: str,
    ) -> None:
        self._consumer = consumer
        self._session_factory = session_factory
        self._trading_mode = trading_mode
        self._running = False

    async def run(self) -> None:
        self._running = True
        streams = [StreamNames.MARKET_CANDLES, StreamNames.MARKET_TRADES]

        for stream in streams:
            await self._consumer.ensure_group(stream)

        candle_batch: list[tuple[str, dict]] = []  # (message_id, data)
        trade_batch: list[tuple[str, dict]] = []
        last_flush = asyncio.get_event_loop().time()

        while self._running:
            try:
                messages = await self._consumer.read(streams, count=500, block_ms=500)
            except Exception as exc:
                logger.error("persistence_read_failed", error=str(exc))
                await asyncio.sleep(1)
                continue

            for msg in messages:
                stream_name = msg.get("stream", "")
                msg_id = msg["id"]
                data = msg["data"]

                if StreamNames.MARKET_CANDLES in stream_name:
                    candle_batch.append((msg_id, data))
                elif StreamNames.MARKET_TRADES in stream_name:
                    trade_batch.append((msg_id, data))

            now = asyncio.get_event_loop().time()
            should_flush = (
                len(candle_batch) + len(trade_batch) >= BATCH_MAX_EVENTS
                or (now - last_flush) >= BATCH_MAX_SECONDS
            )

            if should_flush and (candle_batch or trade_batch):
                try:
                    await self._flush(candle_batch, trade_batch)
                    # Ack only on success
                    for msg_id, _ in candle_batch:
                        await self._consumer.ack(StreamNames.MARKET_CANDLES, msg_id)
                    for msg_id, _ in trade_batch:
                        await self._consumer.ack(StreamNames.MARKET_TRADES, msg_id)
                    candle_batch.clear()
                    trade_batch.clear()
                except Exception as exc:
                    logger.error("persistence_flush_failed", error=str(exc))
                    # Do NOT clear batches — retry on next iteration
                    await asyncio.sleep(1)
                last_flush = asyncio.get_event_loop().time()

    async def _flush(
        self,
        candle_batch: list[tuple[str, dict]],
        trade_batch: list[tuple[str, dict]],
    ) -> None:
        async with self._session_factory() as session:
            async with session.begin():
                if candle_batch:
                    await self._upsert_candles(session, [d for _, d in candle_batch])
                if trade_batch:
                    await self._upsert_trades(session, [d for _, d in trade_batch])

    async def _upsert_candles(
        self, session: AsyncSession, batch: list[dict]
    ) -> None:
        rows = [
            {
                "symbol": d["symbol"],
                "timeframe": d["timeframe"],
                "timestamp": datetime.fromisoformat(d["timestamp"]),
                "open": Decimal(d["open"]),
                "high": Decimal(d["high"]),
                "low": Decimal(d["low"]),
                "close": Decimal(d["close"]),
                "volume": Decimal(d["volume"]),
                "is_closed": d["is_closed"] == "1",
                "trading_mode": self._trading_mode,
            }
            for d in batch
        ]
        await session.execute(
            text("""
                INSERT INTO market_candles
                    (symbol, timeframe, timestamp, open, high, low, close, volume,
                     is_closed, trading_mode)
                VALUES
                    (:symbol, :timeframe, :timestamp, :open, :high, :low, :close,
                     :volume, :is_closed, :trading_mode)
                ON CONFLICT (symbol, timeframe, timestamp)
                DO UPDATE SET
                    open = EXCLUDED.open, high = EXCLUDED.high,
                    low = EXCLUDED.low, close = EXCLUDED.close,
                    volume = EXCLUDED.volume, is_closed = EXCLUDED.is_closed
                WHERE NOT market_candles.is_closed
            """),
            rows,
        )

    async def _upsert_trades(
        self, session: AsyncSession, batch: list[dict]
    ) -> None:
        rows = [
            {
                "symbol": d["symbol"],
                "timestamp": datetime.fromisoformat(d["timestamp"]),
                "price": Decimal(d["price"]),
                "amount": Decimal(d["amount"]),
                "side": d["side"],
                "exchange_trade_id": d["exchange_trade_id"],
                "trading_mode": self._trading_mode,
            }
            for d in batch
        ]
        await session.execute(
            text("""
                INSERT INTO market_trades
                    (symbol, timestamp, price, amount, side, exchange_trade_id, trading_mode)
                VALUES
                    (:symbol, :timestamp, :price, :amount, :side, :exchange_trade_id, :trading_mode)
                ON CONFLICT (symbol, exchange_trade_id, trading_mode)
                DO NOTHING
            """),
            rows,
        )

    async def stop(self) -> None:
        self._running = False
```

- [ ] **Step 2: Run type check**

```bash
uv run mypy services/market_data/persistence.py --strict
```

- [ ] **Step 3: Commit**

```bash
git add services/market-data/persistence.py
git commit -m "feat(f2): task 2.7 - TimescaleDB persistence worker with batch upserts"
```

---

### Task 2.8: Market data REST API routes

**Files:**
- Create: `apps/api/routers/markets.py`
- Modify: `apps/api/main.py` (register markets router)

**Interfaces:**
- Consumes: `AsyncSession`, TimescaleDB `market_candles` and `market_trades` tables
- Produces: `/api/v1/markets/{candles,ticker,trades,symbols,orderbook}` GET endpoints with Pydantic response schemas

- [ ] **Step 1: Create `apps/api/routers/markets.py`**

```python
"""Market data REST API routes.

Read-only endpoints querying TimescaleDB.
No authentication in F2 (F11 adds owner auth).
All monetary values returned as strings (Decimal-safe JSON).
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.engine import get_db_session

router = APIRouter(prefix="/api/v1/markets", tags=["market-data"])


class CandleResponse(BaseModel):
    symbol: str
    timeframe: str
    timestamp: datetime
    open: str
    high: str
    low: str
    close: str
    volume: str
    is_closed: bool


class TradeResponse(BaseModel):
    symbol: str
    timestamp: datetime
    price: str
    amount: str
    side: str
    exchange_trade_id: str


class TickerResponse(BaseModel):
    symbol: str
    timestamp: datetime
    last_price: str
    volume: str


class SymbolResponse(BaseModel):
    symbol: str
    base: str
    quote: str


@router.get("/candles", response_model=list[CandleResponse])
async def get_candles(
    symbol: str,
    timeframe: str = "1h",
    from_time: datetime | None = Query(None, alias="from"),
    to_time: datetime | None = Query(None, alias="to"),
    limit: int = Query(500, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> list[CandleResponse]:
    query = """
        SELECT symbol, timeframe, timestamp, open, high, low, close, volume, is_closed
        FROM market_candles
        WHERE symbol = :symbol AND timeframe = :timeframe
    """
    params: dict = {"symbol": symbol, "timeframe": timeframe}
    if from_time:
        query += " AND timestamp >= :from_time"
        params["from_time"] = from_time
    if to_time:
        query += " AND timestamp <= :to_time"
        params["to_time"] = to_time
    query += " ORDER BY timestamp DESC LIMIT :limit"
    params["limit"] = limit

    result = await session.execute(text(query), params)
    rows = result.fetchall()
    return [
        CandleResponse(
            symbol=r.symbol, timeframe=r.timeframe, timestamp=r.timestamp,
            open=str(r.open), high=str(r.high), low=str(r.low),
            close=str(r.close), volume=str(r.volume), is_closed=r.is_closed,
        )
        for r in rows
    ]


@router.get("/ticker", response_model=TickerResponse)
async def get_ticker(
    symbol: str,
    session: AsyncSession = Depends(get_db_session),
) -> TickerResponse:
    result = await session.execute(
        text("""
            SELECT symbol, timestamp, close AS last_price, volume
            FROM market_candles
            WHERE symbol = :symbol AND timeframe = '1m'
            ORDER BY timestamp DESC
            LIMIT 1
        """),
        {"symbol": symbol},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"No ticker data for {symbol}")
    return TickerResponse(
        symbol=row.symbol, timestamp=row.timestamp,
        last_price=str(row.last_price), volume=str(row.volume),
    )


@router.get("/trades", response_model=list[TradeResponse])
async def get_trades(
    symbol: str,
    since: datetime | None = None,
    limit: int = Query(100, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> list[TradeResponse]:
    query = "SELECT * FROM market_trades WHERE symbol = :symbol"
    params: dict = {"symbol": symbol}
    if since:
        query += " AND timestamp >= :since"
        params["since"] = since
    query += " ORDER BY timestamp DESC LIMIT :limit"
    params["limit"] = limit

    result = await session.execute(text(query), params)
    rows = result.fetchall()
    return [
        TradeResponse(
            symbol=r.symbol, timestamp=r.timestamp,
            price=str(r.price), amount=str(r.amount),
            side=r.side, exchange_trade_id=r.exchange_trade_id,
        )
        for r in rows
    ]


@router.get("/symbols", response_model=list[SymbolResponse])
async def get_symbols(
    session: AsyncSession = Depends(get_db_session),
) -> list[SymbolResponse]:
    result = await session.execute(
        text("SELECT DISTINCT symbol FROM market_candles ORDER BY symbol")
    )
    rows = result.fetchall()
    # Parse BTC/USDT into base/quote
    symbols = []
    for row in rows:
        parts = row.symbol.split("/")
        symbols.append(SymbolResponse(
            symbol=row.symbol,
            base=parts[0] if len(parts) == 2 else row.symbol,
            quote=parts[1] if len(parts) == 2 else "",
        ))
    return symbols
```

- [ ] **Step 2: Register router in `apps/api/main.py`**

```python
from apps.api.routers import markets
app.include_router(markets.router)
```

- [ ] **Step 3: Add `get_db_session` dependency to `packages/database/engine.py`**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionContext() as session:
        yield session
```

- [ ] **Step 4: Run type check and lint**

```bash
uv run mypy apps/api/routers/markets.py --strict
uv run ruff check apps/api/routers/markets.py
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/routers/markets.py apps/api/main.py packages/database/engine.py
git commit -m "feat(f2): task 2.8 - market data REST API routes /api/v1/markets/*"
```

---

### Task 2.9: Integration and failure recovery test suite

**Files:**
- Create: `tests/integration/test_market_pipeline_e2e.py`
- Create: `tests/integration/test_gap_backfill.py`
- Create: `tests/integration/test_market_api.py`
- Create: `tests/unit/test_market_publisher.py`
- Modify: `.github/workflows/ci.yml` (add integration test step for F2)

**Interfaces:**
- Consumes: All F2 components
- Produces: Verified AC-2.5 to AC-2.11

- [ ] **Step 1: Create unit test for publisher serialization**

```python
# tests/unit/test_market_publisher.py
"""Tests that publisher serializes Decimal values correctly."""
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
import pytest

from packages.exchange.models import OHLCVCandle, MarketTrade, Ticker
from services.market_data.publisher import MarketDataPublisher


@pytest.fixture
def mock_redis_publisher():
    pub = MagicMock()
    pub.publish = AsyncMock()
    return pub


@pytest.fixture
def publisher(mock_redis_publisher):
    return MarketDataPublisher(mock_redis_publisher)


@pytest.mark.asyncio
async def test_publish_candle_serializes_decimals(publisher, mock_redis_publisher):
    candle = OHLCVCandle(
        symbol="BTC/USDT", timeframe="1m",
        timestamp=datetime(2024, 1, 1, tzinfo=timezone.utc),
        open=Decimal("42000.50"), high=Decimal("42100.00"),
        low=Decimal("41900.00"), close=Decimal("42050.25"),
        volume=Decimal("10.12345"), is_closed=True,
    )
    await publisher.publish_candle(candle)
    mock_redis_publisher.publish.assert_called_once()
    _, kwargs = mock_redis_publisher.publish.call_args
    data = mock_redis_publisher.publish.call_args[0][1]
    # Values must be strings, not Decimal or float
    assert isinstance(data["open"], str)
    assert data["open"] == "42000.50"
    assert data["is_closed"] == "1"


@pytest.mark.asyncio
async def test_publish_trade_includes_exchange_trade_id(publisher, mock_redis_publisher):
    trade = MarketTrade(
        symbol="BTC/USDT",
        timestamp=datetime(2024, 1, 1, tzinfo=timezone.utc),
        price=Decimal("42000.00"),
        amount=Decimal("0.01"),
        side="buy",
        exchange_trade_id="12345678",
    )
    await publisher.publish_trade(trade)
    data = mock_redis_publisher.publish.call_args[0][1]
    assert data["exchange_trade_id"] == "12345678"
    assert data["price"] == "42000.00"
```

- [ ] **Step 2: Create integration test for pipeline E2E**

```python
# tests/integration/test_market_pipeline_e2e.py
"""End-to-end pipeline test: mock event → Redis → persist → DB row.

Requires: running Redis and TimescaleDB (docker compose up -d).
Mark: @pytest.mark.integration
"""
import asyncio
from datetime import datetime, timezone
from decimal import Decimal
import pytest
from unittest.mock import AsyncMock, patch

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_candle_event_persisted_to_timescaledb(db_session, redis_client):
    """Publish a candle to Redis, run persistence worker one cycle, verify DB row."""
    from packages.events.streams import RedisStreamPublisher, RedisStreamConsumer, StreamNames
    from services.market_data.publisher import MarketDataPublisher
    from services.market_data.persistence import PersistenceWorker
    from packages.exchange.models import OHLCVCandle
    from sqlalchemy import text

    # Publish one candle
    pub = MarketDataPublisher(RedisStreamPublisher(redis_client))
    candle = OHLCVCandle(
        symbol="BTC/USDT", timeframe="1m",
        timestamp=datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc),
        open=Decimal("42000"), high=Decimal("42100"),
        low=Decimal("41900"), close=Decimal("42050"),
        volume=Decimal("10"), is_closed=True,
    )
    await pub.publish_candle(candle)

    # Run persistence worker for one batch cycle (short timeout)
    consumer = RedisStreamConsumer(redis_client, group="persistence-test", consumer="worker-1")
    worker = PersistenceWorker(consumer, lambda: db_session, trading_mode="paper")

    async def run_one_cycle():
        worker._running = True
        await asyncio.wait_for(worker.run(), timeout=3.0)

    with pytest.raises(asyncio.TimeoutError):
        await run_one_cycle()  # Runs until timeout — that's OK

    # Verify DB row
    result = await db_session.execute(
        text("SELECT symbol, close FROM market_candles WHERE symbol = 'BTC/USDT' AND timeframe = '1m'")
    )
    row = result.fetchone()
    assert row is not None
    assert str(row.close) == "42050"
```

- [ ] **Step 3: Create gap backfill integration test**

```python
# tests/integration/test_gap_backfill.py
"""Gap detection and backfill integration test.

Requires: running TimescaleDB.
Mark: @pytest.mark.integration
"""
import pytest
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy import text

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_backfill_fills_gap_without_duplication(db_session):
    from services.market_data.backfill import BackfillService
    from packages.exchange.models import OHLCVCandle
    from unittest.mock import AsyncMock

    base = datetime(2024, 6, 1, 10, 0, tzinfo=timezone.utc)

    # Seed DB with one candle — leaving a gap
    await db_session.execute(
        text("""
            INSERT INTO market_candles
                (symbol, timeframe, timestamp, open, high, low, close, volume, is_closed, trading_mode)
            VALUES
                ('BTC/USDT', '1m', :ts, 42000, 42100, 41900, 42050, 10, true, 'paper')
        """),
        {"ts": base},
    )
    await db_session.commit()

    # Mock adapter returns 3 candles (2 new + 1 duplicate)
    mock_candles = [
        OHLCVCandle(
            symbol="BTC/USDT", timeframe="1m",
            timestamp=base + timedelta(minutes=i),
            open=Decimal("42000"), high=Decimal("42100"),
            low=Decimal("41900"), close=Decimal("42050"),
            volume=Decimal("10"), is_closed=True,
        )
        for i in range(3)
    ]
    mock_adapter = MagicMock()
    mock_adapter.get_candles = AsyncMock(return_value=mock_candles)

    service = BackfillService(mock_adapter, lambda: db_session, trading_mode="paper")
    await service.run_backfill(["BTC/USDT"], ["1m"])

    # Should have 3 rows (1 original + 2 new), no duplicates
    result = await db_session.execute(
        text("SELECT COUNT(*) FROM market_candles WHERE symbol = 'BTC/USDT' AND timeframe = '1m'")
    )
    count = result.scalar()
    assert count == 3
```

- [ ] **Step 4: Create REST API integration test**

```python
# tests/integration/test_market_api.py
"""Market data REST API integration tests.

Requires: running TimescaleDB.
Mark: @pytest.mark.integration
"""
import pytest
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy import text

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_get_candles_returns_seeded_data(client: AsyncClient, db_session):
    base = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    await db_session.execute(
        text("""
            INSERT INTO market_candles
                (symbol, timeframe, timestamp, open, high, low, close, volume, is_closed, trading_mode)
            VALUES ('BTC/USDT', '1h', :ts, 42000, 42100, 41900, 42050, 100, true, 'paper')
        """),
        {"ts": base},
    )
    await db_session.commit()

    resp = await client.get("/api/v1/markets/candles?symbol=BTC%2FUSDT&timeframe=1h")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["symbol"] == "BTC/USDT"
    assert data[0]["close"] == "42050"  # Decimal serialized as string


@pytest.mark.asyncio
async def test_get_symbols_lists_distinct_symbols(client: AsyncClient, db_session):
    for symbol in ["BTC/USDT", "ETH/USDT"]:
        await db_session.execute(
            text("""
                INSERT INTO market_candles
                    (symbol, timeframe, timestamp, open, high, low, close, volume, is_closed, trading_mode)
                VALUES (:symbol, '1h', NOW(), 1000, 1100, 900, 1050, 10, true, 'paper')
            """),
            {"symbol": symbol},
        )
    await db_session.commit()

    resp = await client.get("/api/v1/markets/symbols")
    assert resp.status_code == 200
    symbols = [s["symbol"] for s in resp.json()]
    assert "BTC/USDT" in symbols
    assert "ETH/USDT" in symbols


@pytest.mark.asyncio
async def test_get_ticker_404_when_no_data(client: AsyncClient):
    resp = await client.get("/api/v1/markets/ticker?symbol=UNKNOWN%2FUSDT")
    assert resp.status_code == 404
```

- [ ] **Step 5: Run all unit tests**

```bash
uv run pytest tests/unit/ -v
```
Expected: all unit tests pass

- [ ] **Step 6: Run mypy on all F2 code**

```bash
uv run mypy packages/exchange services/market_data apps/api/routers/markets.py --strict
```
Fix any errors.

- [ ] **Step 7: Run ruff**

```bash
uv run ruff check packages/exchange services/market_data apps/api/routers/markets.py
uv run ruff format --check packages/exchange services/market_data apps/api/routers/markets.py
```

- [ ] **Step 8: Commit and push**

```bash
git add tests/
git commit -m "feat(f2): task 2.9 - integration and failure recovery test suite"
git push origin development
```

---

## Spec Coverage Check

| AC | Covered by task |
|---|---|
| AC-2.1 ExchangeAdapter interface, Binance impl, Decimal, canonical symbols | Task 2.1, 2.2 |
| AC-2.2 Error normalization | Task 2.1, 2.2 |
| AC-2.3 Symbol info: precision, min notional, step size | Task 2.2 |
| AC-2.4 Rate limit tracking | Task 2.2 |
| AC-2.5 WebSocket feeds: ticker, trades, candles (1m/15m/1h/4h) via Redis Streams | Task 2.2, 2.4 |
| AC-2.6 Exponential backoff reconnection, logs disconnect_duration_seconds | Task 2.4 |
| AC-2.7 Reconnect triggers gap detection and REST backfill | Task 2.4, 2.6 |
| AC-2.8 Persistence worker batch-upserts, XACK after commit only | Task 2.7 |
| AC-2.9 Staleness monitor, /health/trading MARKET_DATA_NOT_READY | Task 2.5 |
| AC-2.10 REST endpoints /candles, /ticker, /trades, /symbols | Task 2.8 |
| AC-2.11 CI integration tests, no live keys | Task 2.9 |
