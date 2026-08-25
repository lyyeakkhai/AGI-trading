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
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from decimal import Decimal
import time
from typing import Any

import ccxt  # type: ignore[import-untyped]
import ccxt.pro as ccxtpro  # type: ignore[import-untyped]

from packages.exchange.base import ExchangeAdapter
from packages.exchange.errors import (
    AuthFailedError,
    ExchangeError,
    PermanentError,
    RateLimitedError,
    RetryableError,
    UnknownStateError,
)
from packages.exchange.models import (
    AdapterHealth,
    MarketTrade,
    OHLCVCandle,
    OrderBook,
    RateLimitState,
    SymbolInfo,
    Ticker,
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
            if hasattr(self, "_rest") and self._rest and self._rest.markets:
                for symbol, market in self._rest.markets.items():
                    if market.get("id", "").upper() == raw.upper():
                        return str(symbol)
        except Exception:
            pass
        for quote in ("USDT", "USDC", "BUSD", "FDUSD", "TUSD", "BTC", "ETH", "BNB", "EUR", "USD"):
            if raw.upper().endswith(quote) and len(raw) > len(quote):
                base = raw.upper()[:-len(quote)]
                return f"{base}/{quote}"
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
            candles: list[OHLCVCandle] = []
            for i, row in enumerate(raw_list):
                ts_ms, o, h, l, c, v = row
                # is_closed: the next candle's ts > this ts, or it's the last one
                is_closed = i < len(raw_list) - 1
                candles.append(
                    OHLCVCandle(
                        symbol=symbol,
                        timeframe=timeframe,
                        timestamp=_ms_to_dt(ts_ms),
                        open=Decimal(str(o)),
                        high=Decimal(str(h)),
                        low=Decimal(str(l)),
                        close=Decimal(str(c)),
                        volume=Decimal(str(v)),
                        is_closed=is_closed,
                    )
                )
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
            start = time.monotonic()
            await self.get_server_time()
            latency = (time.monotonic() - start) * 1000
            return AdapterHealth(connected=True, latency_ms=latency)
        except Exception as e:
            return AdapterHealth(connected=False, last_error=str(e))

    async def get_rate_limit_state(self) -> RateLimitState:
        # CCXT tracks rate limit state internally
        # Binance uses request weight; expose what CCXT provides
        weight_used = 0
        if hasattr(self._rest, "last_response_headers") and self._rest.last_response_headers:
            val = self._rest.last_response_headers.get("x-mbx-used-weight-1m", 0)
            try:
                weight_used = int(val)
            except (ValueError, TypeError):
                weight_used = 0
        return RateLimitState(
            requests_used=0,
            requests_limit=1200,
            weight_used=weight_used,
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
                                symbol=symbol,
                                timeframe=timeframe,
                                timestamp=_ms_to_dt(ts_ms),
                                open=Decimal(str(o)),
                                high=Decimal(str(h)),
                                low=Decimal(str(l)),
                                close=Decimal(str(c)),
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
