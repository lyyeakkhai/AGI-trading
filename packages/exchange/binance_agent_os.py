"""Binance Agent OS MCP client and adapter implementation.

Binance Agent OS Investigation & Findings:
------------------------------------------
1. Endpoint & Transport:
   - Primary MCP Gateway: `https://agent.binance.com/mcp/agentic`
   - Transport: HTTP POST carrying JSON-RPC 2.0 protocol payloads.
   - Note: Unauthenticated GET returns 404. Direct POST without credentials returns
     HTTP 401 with `WWW-Authenticate: Bearer resource_metadata="https://agent.binance.com/.well-known/oauth-protected-resource/gateway-mcp"`.

2. Authentication & Authorization Discovery:
   - OAuth 2.0 Resource Metadata: `https://agent.binance.com/.well-known/oauth-protected-resource/gateway-mcp`
   - OAuth 2.0 Authorization Server: `https://agent.binance.com/.well-known/oauth-authorization-server`
   - Authorization Endpoint: `https://accounts.binance.com/agentic-oauth/authorize`
   - Token Endpoint: `https://accounts.binance.com/oauth-agentic/token`
   - Supported Grant Types: `authorization_code` with PKCE (code_challenge_methods_supported: `["S256"]`).

3. WebSockets vs Tool-Calling Transport:
   - Binance Agent OS MCP is a tool-calling and agent orchestration gateway (JSON-RPC 2.0 over HTTP).
   - It does NOT provide persistent bi-directional WebSocket streams for millisecond-level tick-by-tick
     market feeds or continuous depth level-2 diff streaming. Continuous market feeds and candle updates
     must continue using Binance native WebSockets / CCXT Pro (`BinanceCCXTAdapter`).

4. Account Security Model & Order Types:
   - Execution targets isolated "Agentic" sub-accounts where withdrawal permissions are disabled by default.
   - Scopes support Spot, Margin, and Futures trading (Market, Limit, Stop-Loss / Take-Profit).
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

import httpx

from packages.exchange.base import ExchangeAdapter
from packages.exchange.binance import BinanceCCXTAdapter
from packages.exchange.errors import (
    AuthFailedError,
    ExchangeError,
    PermanentError,
    RateLimitedError,
    RetryableError,
)
from packages.exchange.models import (
    AdapterHealth,
    FundingRate,
    MarketTrade,
    MarketVolume,
    OHLCVCandle,
    OrderBook,
    RateLimitState,
    SymbolInfo,
    Ticker,
)
from packages.logging import get_logger

logger = get_logger("binance_agent_os")

DEFAULT_BINANCE_AGENT_OS_URL = "https://agent.binance.com/mcp/agentic"


class BinanceAgentOSClient:
    """JSON-RPC 2.0 Client for the Binance Agent OS MCP Server."""

    def __init__(
        self,
        endpoint_url: str = DEFAULT_BINANCE_AGENT_OS_URL,
        bearer_token: str | None = None,
        timeout_seconds: float = 15.0,
    ) -> None:
        self.endpoint_url = endpoint_url
        self.bearer_token = bearer_token
        self.timeout = timeout_seconds
        self._http_client: httpx.AsyncClient | None = None

    def _get_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            if self.bearer_token:
                headers["Authorization"] = f"Bearer {self.bearer_token}"
            self._http_client = httpx.AsyncClient(
                headers=headers,
                timeout=self.timeout,
            )
        return self._http_client

    async def close(self) -> None:
        if self._http_client is not None and not self._http_client.is_closed:
            await self._http_client.aclose()
            self._http_client = None

    async def call_rpc(
        self,
        method: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute a JSON-RPC 2.0 call against the Agent OS endpoint."""
        req_id = str(uuid.uuid4())
        payload: dict[str, Any] = {
            "jsonrpc": "2.0",
            "id": req_id,
            "method": method,
            "params": params or {},
        }

        client = self._get_client()
        try:
            resp = await client.post(self.endpoint_url, json=payload)
            if resp.status_code == 401:
                raise AuthFailedError(
                    f"Binance Agent OS authentication required. WWW-Authenticate: {resp.headers.get('WWW-Authenticate')}"
                )
            if resp.status_code == 429:
                raise RateLimitedError("Binance Agent OS rate limit exceeded")
            if resp.status_code >= 500:
                raise RetryableError(f"Binance Agent OS upstream server error: {resp.status_code}")
            if resp.status_code != 200:
                raise PermanentError(f"Binance Agent OS HTTP {resp.status_code}: {resp.text}")

            data = resp.json()
            if "error" in data:
                err = data["error"]
                err_msg = err.get("message", "Unknown Agent OS RPC error")
                err_code = err.get("code", 0)
                if err_code in (-32600, -32601, -32602):
                    raise PermanentError(f"Agent OS RPC client error ({err_code}): {err_msg}")
                raise ExchangeError(f"Agent OS RPC error ({err_code}): {err_msg}")

            return data.get("result", {})
        except httpx.TimeoutException as exc:
            raise RetryableError(f"Binance Agent OS request timed out: {exc}") from exc
        except httpx.NetworkError as exc:
            raise RetryableError(f"Binance Agent OS network connection error: {exc}") from exc

    async def initialize(self) -> dict[str, Any]:
        """Initialize MCP session with client capabilities."""
        return await self.call_rpc(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {"roots": {"listChanged": True}, "sampling": {}},
                "clientInfo": {"name": "hermes-trading-agent", "version": "1.0.0"},
            },
        )

    async def list_tools(self) -> list[dict[str, Any]]:
        """List available tools exposed by the Binance Agent OS server."""
        result = await self.call_rpc("tools/list")
        return result.get("tools", [])

    async def call_tool(self, name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        """Call a specific MCP tool exposed by Binance Agent OS."""
        result = await self.call_rpc(
            "tools/call",
            {"name": name, "arguments": arguments or {}},
        )
        return result


class BinanceAgentOSAdapter(ExchangeAdapter):
    """Unified exchange adapter supporting Binance Agent OS MCP with CCXT fallback.

    For public high-frequency market data (tickers, candles, order books, trades),
    this adapter uses CCXT / BinanceCCXTAdapter for optimal speed and reliability.
    When a valid Agent OS Bearer token is present, agentic actions and MCP tools
    can be dispatched directly through the Binance Agent OS MCP server.
    """

    def __init__(
        self,
        agent_os_url: str = DEFAULT_BINANCE_AGENT_OS_URL,
        agent_os_token: str | None = None,
        ccxt_adapter: BinanceCCXTAdapter | None = None,
    ) -> None:
        self.client = BinanceAgentOSClient(
            endpoint_url=agent_os_url,
            bearer_token=agent_os_token,
        )
        self.ccxt_adapter = ccxt_adapter or BinanceCCXTAdapter()

    @property
    def has_agent_os_auth(self) -> bool:
        return bool(self.client.bearer_token)

    async def get_ticker(self, symbol: str) -> Ticker:
        return await self.ccxt_adapter.get_ticker(symbol)

    async def get_candles(
        self,
        symbol: str,
        timeframe: str,
        since: datetime,
        limit: int,
        until: datetime | None = None,
    ) -> list[OHLCVCandle]:
        return await self.ccxt_adapter.get_candles(
            symbol=symbol,
            timeframe=timeframe,
            since=since,
            limit=limit,
            until=until,
        )

    async def get_order_book(self, symbol: str, depth: int) -> OrderBook:
        return await self.ccxt_adapter.get_order_book(symbol, depth)

    async def get_recent_trades(
        self, symbol: str, since: datetime, limit: int
    ) -> list[MarketTrade]:
        return await self.ccxt_adapter.get_recent_trades(symbol, since, limit)

    async def get_volume(self, symbol: str) -> MarketVolume:
        return await self.ccxt_adapter.get_volume(symbol)

    async def get_funding_rate(self, symbol: str) -> FundingRate:
        return await self.ccxt_adapter.get_funding_rate(symbol)

    async def get_symbol_info(self, symbol: str) -> SymbolInfo:
        return await self.ccxt_adapter.get_symbol_info(symbol)

    async def get_server_time(self) -> datetime:
        return await self.ccxt_adapter.get_server_time()

    async def health(self) -> AdapterHealth:
        ccxt_health = await self.ccxt_adapter.health()
        return AdapterHealth(
            connected=ccxt_health.connected,
            latency_ms=ccxt_health.latency_ms,
            last_error=ccxt_health.last_error,
        )

    async def get_rate_limit_state(self) -> RateLimitState:
        return await self.ccxt_adapter.get_rate_limit_state()

    async def close(self) -> None:
        await self.client.close()
        await self.ccxt_adapter.close()
