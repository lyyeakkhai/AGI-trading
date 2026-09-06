"""Market data REST API routes.

Provides endpoints querying TimescaleDB when available, with resilient live fallback
to Binance via CCXT for real-time tickers, candlesticks, and orderbook.
All monetary values returned as strings (Decimal-safe JSON) or numeric floats for UI charts.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.engine import get_db_session
from packages.exchange.binance import BinanceCCXTAdapter
from packages.logging import get_logger

logger = get_logger("markets_router")
router = APIRouter(prefix="/api/v1/markets", tags=["market-data"])

SUPPORTED_SYMBOLS = [
    "BTC/USDT",
    "ETH/USDT",
    "SOL/USDT",
    "BNB/USDT",
    "AVAX/USDT",
    "DOGE/USDT",
    "XRP/USDT",
    "ADA/USDT",
    "LINK/USDT",
]

_adapter: BinanceCCXTAdapter | None = None
_tickers_cache: list[MarketTickerItem] = []
_tickers_cache_time: float = 0.0
TICKERS_CACHE_TTL_SEC = 3.0


def get_binance_adapter() -> BinanceCCXTAdapter:
    global _adapter
    if _adapter is None:
        _adapter = BinanceCCXTAdapter()
    return _adapter


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


class MarketTickerItem(BaseModel):
    symbol: str
    price: float
    change24h: float
    high24h: float
    low24h: float
    volume24h: str
    quoteVolume24h: str
    timestamp: datetime


class OrderBookEntry(BaseModel):
    price: float
    size: float


class OrderBookResponse(BaseModel):
    symbol: str
    timestamp: datetime
    bids: list[OrderBookEntry]
    asks: list[OrderBookEntry]


@router.get("/candles", response_model=list[CandleResponse])
async def get_candles(
    symbol: str,
    timeframe: str = "1h",
    from_time: datetime | None = Query(None, alias="from"),
    to_time: datetime | None = Query(None, alias="to"),
    limit: int = Query(200, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> list[CandleResponse]:
    # 1. Attempt TimescaleDB fetch
    try:
        query = """
            SELECT symbol, timeframe, timestamp, open, high, low, close, volume, is_closed
            FROM market_candles
            WHERE symbol = :symbol AND timeframe = :timeframe
        """
        params: dict[str, Any] = {"symbol": symbol, "timeframe": timeframe}
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
        if rows:
            return [
                CandleResponse(
                    symbol=r.symbol,
                    timeframe=r.timeframe,
                    timestamp=r.timestamp,
                    open=str(r.open),
                    high=str(r.high),
                    low=str(r.low),
                    close=str(r.close),
                    volume=str(r.volume),
                    is_closed=r.is_closed,
                )
                for r in rows
            ]
    except Exception as e:
        logger.debug("markets_db_candles_failed_falling_back_to_ccxt", error=str(e))

    # 2. Live CCXT Binance Fallback
    try:
        adapter = get_binance_adapter()
        canonical_symbol = adapter._normalize_symbol(symbol.replace("-", "/"))
        durations = {
            "1m": timedelta(minutes=limit),
            "5m": timedelta(minutes=limit * 5),
            "15m": timedelta(minutes=limit * 15),
            "1h": timedelta(hours=limit),
            "4h": timedelta(hours=limit * 4),
            "1d": timedelta(days=limit),
        }
        since = from_time or (datetime.now(timezone.utc) - durations.get(timeframe, timedelta(hours=limit)))
        candles = await adapter.get_candles(canonical_symbol, timeframe, since, limit)
        return [
            CandleResponse(
                symbol=c.symbol,
                timeframe=c.timeframe,
                timestamp=c.timestamp,
                open=str(c.open),
                high=str(c.high),
                low=str(c.low),
                close=str(c.close),
                volume=str(c.volume),
                is_closed=c.is_closed,
            )
            for c in candles
        ]
    except Exception as e:
        logger.warning("markets_ccxt_candles_failed", error=str(e), symbol=symbol)
        return []


@router.get("/ticker", response_model=TickerResponse)
async def get_ticker(
    symbol: str,
    session: AsyncSession = Depends(get_db_session),
) -> TickerResponse:
    # 1. Attempt TimescaleDB fetch
    try:
        result = await session.execute(
            text("""
                SELECT symbol, timestamp, close AS last_price, volume
                FROM market_candles
                WHERE symbol = :symbol
                ORDER BY timestamp DESC
                LIMIT 1
            """),
            {"symbol": symbol},
        )
        row = result.fetchone()
        if row:
            return TickerResponse(
                symbol=row.symbol,
                timestamp=row.timestamp,
                last_price=str(row.last_price),
                volume=str(row.volume),
            )
    except Exception:
        pass

    # 2. Live CCXT Binance Fallback
    try:
        adapter = get_binance_adapter()
        canonical_symbol = adapter._normalize_symbol(symbol.replace("-", "/"))
        ticker = await adapter.get_ticker(canonical_symbol)
        return TickerResponse(
            symbol=ticker.symbol,
            timestamp=ticker.timestamp,
            last_price=str(ticker.last),
            volume=str(ticker.volume),
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"No ticker data for {symbol}: {e}")


@router.get("/tickers", response_model=list[MarketTickerItem])
async def get_all_tickers() -> list[MarketTickerItem]:
    """Returns real-time 24h market tickers for all supported symbols with in-memory caching."""
    global _tickers_cache, _tickers_cache_time
    now = time.monotonic()
    if _tickers_cache and (now - _tickers_cache_time < TICKERS_CACHE_TTL_SEC):
        return _tickers_cache

    adapter = get_binance_adapter()
    try:
        raw_tickers = await asyncio.to_thread(adapter._rest.fetch_tickers, SUPPORTED_SYMBOLS)
        items: list[MarketTickerItem] = []
        now_dt = datetime.now(timezone.utc)

        for sym in SUPPORTED_SYMBOLS:
            raw = raw_tickers.get(sym) or raw_tickers.get(sym.replace("/", ""))
            if not raw:
                continue
            last_price = float(raw.get("last") or 0.0)
            change_pct = float(raw.get("percentage") or 0.0)
            high = float(raw.get("high") or last_price)
            low = float(raw.get("low") or last_price)
            base_vol = raw.get("baseVolume") or 0.0
            quote_vol = raw.get("quoteVolume") or 0.0

            if quote_vol >= 1_000_000_000:
                quote_vol_str = f"${quote_vol / 1_000_000_000:.2f}B"
            elif quote_vol >= 1_000_000:
                quote_vol_str = f"${quote_vol / 1_000_000:.1f}M"
            else:
                quote_vol_str = f"${quote_vol:,.0f}"

            items.append(
                MarketTickerItem(
                    symbol=sym,
                    price=last_price,
                    change24h=round(change_pct, 2),
                    high24h=high,
                    low24h=low,
                    volume24h=f"{base_vol:,.1f}",
                    quoteVolume24h=quote_vol_str,
                    timestamp=now_dt,
                )
            )

        if items:
            _tickers_cache = items
            _tickers_cache_time = now
        return items
    except Exception as e:
        logger.error("markets_batch_tickers_failed", error=str(e))
        if _tickers_cache:
            return _tickers_cache
        return []


@router.get("/orderbook", response_model=OrderBookResponse)
async def get_orderbook(
    symbol: str,
    depth: int = Query(20, le=50),
) -> OrderBookResponse:
    """Returns live order book bids and asks from Binance."""
    adapter = get_binance_adapter()
    canonical_symbol = adapter._normalize_symbol(symbol.replace("-", "/"))
    try:
        ob = await adapter.get_order_book(canonical_symbol, depth)
        return OrderBookResponse(
            symbol=ob.symbol,
            timestamp=ob.timestamp,
            bids=[OrderBookEntry(price=float(p), size=float(q)) for p, q in ob.bids[:depth]],
            asks=[OrderBookEntry(price=float(p), size=float(q)) for p, q in ob.asks[:depth]],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch order book: {e}")


@router.get("/trades", response_model=list[TradeResponse])
async def get_trades(
    symbol: str,
    since: datetime | None = None,
    limit: int = Query(50, le=200),
    session: AsyncSession = Depends(get_db_session),
) -> list[TradeResponse]:
    try:
        query = "SELECT symbol, timestamp, price, amount, side, exchange_trade_id FROM market_trades WHERE symbol = :symbol"
        params: dict[str, Any] = {"symbol": symbol}
        if since:
            query += " AND timestamp >= :since"
            params["since"] = since
        query += " ORDER BY timestamp DESC LIMIT :limit"
        params["limit"] = limit

        result = await session.execute(text(query), params)
        rows = result.fetchall()
        if rows:
            return [
                TradeResponse(
                    symbol=r.symbol,
                    timestamp=r.timestamp,
                    price=str(r.price),
                    amount=str(r.amount),
                    side=r.side,
                    exchange_trade_id=r.exchange_trade_id,
                )
                for r in rows
            ]
    except Exception:
        pass

    try:
        adapter = get_binance_adapter()
        canonical_symbol = adapter._normalize_symbol(symbol.replace("-", "/"))
        recent = await adapter.get_recent_trades(
            canonical_symbol, since or (datetime.now(timezone.utc) - timedelta(minutes=10)), limit
        )
        return [
            TradeResponse(
                symbol=t.symbol,
                timestamp=t.timestamp,
                price=str(t.price),
                amount=str(t.amount),
                side=t.side,
                exchange_trade_id=t.exchange_trade_id,
            )
            for t in recent
        ]
    except Exception as e:
        logger.warning("markets_ccxt_trades_failed", error=str(e), symbol=symbol)
        return []


@router.get("/symbols", response_model=list[SymbolResponse])
async def get_symbols(
    session: AsyncSession = Depends(get_db_session),
) -> list[SymbolResponse]:
    try:
        result = await session.execute(
            text("SELECT DISTINCT symbol FROM market_candles ORDER BY symbol")
        )
        rows = result.fetchall()
        if rows:
            symbols: list[SymbolResponse] = []
            for row in rows:
                parts = row.symbol.split("/")
                symbols.append(
                    SymbolResponse(
                        symbol=row.symbol,
                        base=parts[0] if len(parts) == 2 else row.symbol,
                        quote=parts[1] if len(parts) == 2 else "",
                    )
                )
            return symbols
    except Exception:
        pass

    return [
        SymbolResponse(symbol=s, base=s.split("/")[0], quote=s.split("/")[1])
        for s in SUPPORTED_SYMBOLS
    ]
