"""Market data REST API routes.

Read-only endpoints querying TimescaleDB.
No authentication in F2 (F11 adds owner auth).
All monetary values returned as strings (Decimal-safe JSON).
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
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


@router.get("/ticker", response_model=TickerResponse)
async def get_ticker(
    symbol: str,
    session: AsyncSession = Depends(get_db_session),
) -> TickerResponse:
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
    if not row:
        raise HTTPException(status_code=404, detail=f"No ticker data for {symbol}")
    return TickerResponse(
        symbol=row.symbol,
        timestamp=row.timestamp,
        last_price=str(row.last_price),
        volume=str(row.volume),
    )


@router.get("/trades", response_model=list[TradeResponse])
async def get_trades(
    symbol: str,
    since: datetime | None = None,
    limit: int = Query(100, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> list[TradeResponse]:
    query = "SELECT symbol, timestamp, price, amount, side, exchange_trade_id FROM market_trades WHERE symbol = :symbol"
    params: dict[str, Any] = {"symbol": symbol}
    if since:
        query += " AND timestamp >= :since"
        params["since"] = since
    query += " ORDER BY timestamp DESC LIMIT :limit"
    params["limit"] = limit

    result = await session.execute(text(query), params)
    rows = result.fetchall()
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


@router.get("/symbols", response_model=list[SymbolResponse])
async def get_symbols(
    session: AsyncSession = Depends(get_db_session),
) -> list[SymbolResponse]:
    result = await session.execute(
        text("SELECT DISTINCT symbol FROM market_candles ORDER BY symbol")
    )
    rows = result.fetchall()
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
