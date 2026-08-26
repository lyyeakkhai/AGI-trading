"""ExchangeAdapter abstract base class.

All other components depend on this interface.
Never import CCXT types outside of packages/exchange/binance.py.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from packages.exchange.models import (
    AdapterHealth,
    OHLCVCandle,
    MarketTrade,
    OrderBook,
    RateLimitState,
    SymbolInfo,
    Ticker,
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

    async def get_balance(self) -> dict[str, object]:
        raise NotImplementedError("Implemented in Foundation 12")

    async def place_order(self, request: object) -> object:
        raise NotImplementedError("Implemented in Foundation 12")

    async def cancel_order(self, client_order_id: str) -> object:
        raise NotImplementedError("Implemented in Foundation 12")

    async def get_order(self, client_order_id: str) -> object:
        raise NotImplementedError("Implemented in Foundation 12")

    async def get_fills(self, symbol: str, since: datetime) -> list[object]:
        raise NotImplementedError("Implemented in Foundation 12")

    async def get_permissions(self) -> object:
        raise NotImplementedError("Implemented in Foundation 12")
