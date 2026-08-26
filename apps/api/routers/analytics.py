"""Analytics REST API routes.

Provides endpoints to query quantitative indicator snapshots and real-time market regime classifications.
"""
from __future__ import annotations

from datetime import datetime, timezone
import json
from typing import Any

from fastapi import APIRouter, Depends, Query
import pandas as pd
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.engine import get_db_session
from packages.quant.regime import classify_regime_detailed

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


class IndicatorResponse(BaseModel):
    symbol: str
    timeframe: str
    timestamp: datetime
    indicators: dict[str, Any]
    trading_mode: str


class RegimeResponse(BaseModel):
    symbol: str
    regime: str
    trend_score: float
    adx_value: float | None
    atr_pct: float | None
    confluence: float
    summary: str
    timestamp: datetime


@router.get("/indicators", response_model=list[IndicatorResponse])
async def get_indicators(
    symbol: str,
    timeframe: str = "1h",
    from_time: datetime | None = Query(None, alias="from"),
    to_time: datetime | None = Query(None, alias="to"),
    limit: int = Query(100, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> list[IndicatorResponse]:
    """Retrieve historical indicator snapshots from TimescaleDB."""
    query = """
        SELECT symbol, timeframe, timestamp, indicators, trading_mode
        FROM indicator_snapshots
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
        IndicatorResponse(
            symbol=r.symbol,
            timeframe=r.timeframe,
            timestamp=r.timestamp,
            indicators=r.indicators if isinstance(r.indicators, dict) else json.loads(str(r.indicators)),
            trading_mode=r.trading_mode,
        )
        for r in rows
    ]


@router.get("/regime", response_model=RegimeResponse)
async def get_regime(
    symbol: str,
    session: AsyncSession = Depends(get_db_session),
) -> RegimeResponse:
    """Classify the multi-timeframe market regime for a given symbol."""
    # Query up to 100 recent candles for 15m, 1h, and 4h
    timeframes = ["15m", "1h", "4h"]
    dfs: dict[str, pd.DataFrame] = {}

    for tf in timeframes:
        res = await session.execute(
            text("""
                SELECT timestamp, open, high, low, close, volume
                FROM market_candles
                WHERE symbol = :symbol AND timeframe = :timeframe
                ORDER BY timestamp DESC
                LIMIT 100
            """),
            {"symbol": symbol, "timeframe": tf},
        )
        rows = res.fetchall()
        if rows:
            data = [
                {
                    "timestamp": r.timestamp,
                    "open": float(r.open),
                    "high": float(r.high),
                    "low": float(r.low),
                    "close": float(r.close),
                    "volume": float(r.volume),
                }
                for r in reversed(rows)
            ]
            dfs[tf] = pd.DataFrame(data)

    details = classify_regime_detailed(
        df_15m=dfs.get("15m"),
        df_1h=dfs.get("1h"),
        df_4h=dfs.get("4h"),
    )

    return RegimeResponse(
        symbol=symbol,
        regime=details.regime.value,
        trend_score=details.trend_score,
        adx_value=details.adx_value,
        atr_pct=details.atr_pct,
        confluence=details.confluence,
        summary=details.summary,
        timestamp=datetime.now(timezone.utc),
    )
