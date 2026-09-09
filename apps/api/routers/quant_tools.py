from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_hermes_token
from apps.api.routers.tools import get_binance_adapter
from packages.database.engine import get_db_session
from packages.database.models.hypertables import MarketCandleModel
from packages.logging import get_logger
from packages.quant.indicators import calculate_indicator as quant_calc_indicator
from packages.quant.structure import (
    detect_market_structure as quant_detect_market_structure,
    detect_support_resistance as quant_detect_support_resistance,
    detect_swings as quant_detect_swings,
    detect_trend as quant_detect_trend,
)

logger = get_logger("quant_tools_router")
router = APIRouter(prefix="/api/v1/tools/analysis", tags=["analysis-tools"])


class DetectSwingsRequest(BaseModel):
    symbol: str | None = None
    timeframe: str = "1h"
    limit: int = 100
    candles: list[dict[str, Any]] | None = None
    window: int = 2


class DetectMarketStructureRequest(BaseModel):
    symbol: str | None = None
    timeframe: str = "1h"
    limit: int = 100
    candles: list[dict[str, Any]] | None = None
    window: int = 2


class DetectTrendRequest(BaseModel):
    symbol: str | None = None
    timeframe: str = "1h"
    limit: int = 100
    candles: list[dict[str, Any]] | None = None
    fast_period: int = 20
    slow_period: int = 50


class DetectSupportResistanceRequest(BaseModel):
    symbol: str | None = None
    timeframe: str = "1h"
    limit: int = 100
    candles: list[dict[str, Any]] | None = None
    tolerance: float = 0.015


class CalculateIndicatorRequest(BaseModel):
    symbol: str | None = None
    timeframe: str = "1h"
    limit: int = 100
    candles: list[dict[str, Any]] | None = None
    indicator: str
    params: dict[str, Any] = Field(default_factory=dict)


async def _resolve_candles(
    session: AsyncSession,
    candles: list[dict[str, Any]] | None = None,
    symbol: str | None = None,
    timeframe: str = "1h",
    limit: int = 100,
) -> list[dict[str, Any]]:
    """Fetch candles from input or fallback to database / exchange."""
    if candles and len(candles) > 0:
        return candles

    if not symbol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'candles' or 'symbol' must be provided",
        )

    resolved: list[dict[str, Any]] = []

    # 1. Query TimescaleDB
    try:
        stmt = (
            select(MarketCandleModel)
            .where(
                MarketCandleModel.symbol == symbol,
                MarketCandleModel.timeframe == timeframe,
            )
            .order_by(MarketCandleModel.timestamp.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = list(result.scalars().all())
        if rows:
            resolved = [
                {
                    "timestamp": r.timestamp.isoformat(),
                    "open": float(r.open),
                    "high": float(r.high),
                    "low": float(r.low),
                    "close": float(r.close),
                    "volume": float(r.volume),
                }
                for r in reversed(rows)
            ]
    except Exception as e:
        logger.debug("quant_tools_candles_db_failed", error=str(e), symbol=symbol)

    # 2. CCXT Fallback
    if not resolved:
        try:
            adapter = get_binance_adapter()
            durations = {
                "1m": timedelta(minutes=limit),
                "5m": timedelta(minutes=limit * 5),
                "15m": timedelta(minutes=limit * 15),
                "1h": timedelta(hours=limit),
                "4h": timedelta(hours=limit * 4),
                "1d": timedelta(days=limit),
            }
            since = datetime.now(UTC) - durations.get(timeframe, timedelta(hours=limit))
            ccxt_candles = await adapter.get_candles(symbol, timeframe, since, limit)
            resolved = [
                {
                    "timestamp": c.timestamp.isoformat(),
                    "open": float(c.open),
                    "high": float(c.high),
                    "low": float(c.low),
                    "close": float(c.close),
                    "volume": float(c.volume),
                }
                for c in ccxt_candles
            ]
        except Exception as e:
            logger.warning("quant_tools_candles_ccxt_failed", error=str(e), symbol=symbol)

    if not resolved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candle data unavailable for {symbol} ({timeframe})",
        )

    return resolved


@router.post("/detect_swings", dependencies=[Depends(verify_hermes_token)])
async def detect_swings_endpoint(
    req: DetectSwingsRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Expose deterministic 5-bar fractal swing detection tool."""
    candles = await _resolve_candles(
        session, candles=req.candles, symbol=req.symbol, timeframe=req.timeframe, limit=req.limit
    )
    result = quant_detect_swings(data=candles, window=req.window)
    return {
        "symbol": req.symbol,
        "timeframe": req.timeframe,
        **result,
    }


@router.get("/detect_swings", dependencies=[Depends(verify_hermes_token)])
async def detect_swings_get(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str = Query("1h", description="Candle timeframe"),
    limit: int = Query(100, ge=5, le=1000),
    window: int = Query(2, ge=1, le=20, description="Fractal window radius"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    req = DetectSwingsRequest(symbol=symbol, timeframe=timeframe, limit=limit, window=window)
    return await detect_swings_endpoint(req, session)


@router.post("/detect_market_structure", dependencies=[Depends(verify_hermes_token)])
async def detect_market_structure_endpoint(
    req: DetectMarketStructureRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Expose deterministic market structure detection (HH, HL, LH, LL, BOS, CHoCH)."""
    candles = await _resolve_candles(
        session, candles=req.candles, symbol=req.symbol, timeframe=req.timeframe, limit=req.limit
    )
    result = quant_detect_market_structure(data=candles, window=req.window)
    return {
        "symbol": req.symbol,
        "timeframe": req.timeframe,
        **result,
    }


@router.get("/detect_market_structure", dependencies=[Depends(verify_hermes_token)])
async def detect_market_structure_get(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str = Query("1h", description="Candle timeframe"),
    limit: int = Query(100, ge=5, le=1000),
    window: int = Query(2, ge=1, le=20),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    req = DetectMarketStructureRequest(symbol=symbol, timeframe=timeframe, limit=limit, window=window)
    return await detect_market_structure_endpoint(req, session)


@router.post("/detect_trend", dependencies=[Depends(verify_hermes_token)])
async def detect_trend_endpoint(
    req: DetectTrendRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Expose deterministic trend direction and strength analysis."""
    candles = await _resolve_candles(
        session, candles=req.candles, symbol=req.symbol, timeframe=req.timeframe, limit=req.limit
    )
    result = quant_detect_trend(
        data=candles, fast_period=req.fast_period, slow_period=req.slow_period
    )
    return {
        "symbol": req.symbol,
        "timeframe": req.timeframe,
        **result,
    }


@router.get("/detect_trend", dependencies=[Depends(verify_hermes_token)])
async def detect_trend_get(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str = Query("1h", description="Candle timeframe"),
    limit: int = Query(100, ge=5, le=1000),
    fast_period: int = Query(20, ge=2),
    slow_period: int = Query(50, ge=3),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    req = DetectTrendRequest(
        symbol=symbol,
        timeframe=timeframe,
        limit=limit,
        fast_period=fast_period,
        slow_period=slow_period,
    )
    return await detect_trend_endpoint(req, session)


@router.post("/detect_support_resistance", dependencies=[Depends(verify_hermes_token)])
async def detect_support_resistance_endpoint(
    req: DetectSupportResistanceRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Expose deterministic support and resistance levels and zones."""
    candles = await _resolve_candles(
        session, candles=req.candles, symbol=req.symbol, timeframe=req.timeframe, limit=req.limit
    )
    result = quant_detect_support_resistance(data=candles, tolerance=req.tolerance)
    return {
        "symbol": req.symbol,
        "timeframe": req.timeframe,
        **result,
    }


@router.get("/detect_support_resistance", dependencies=[Depends(verify_hermes_token)])
async def detect_support_resistance_get(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str = Query("1h", description="Candle timeframe"),
    limit: int = Query(100, ge=5, le=1000),
    tolerance: float = Query(0.015, gt=0.0),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    req = DetectSupportResistanceRequest(
        symbol=symbol, timeframe=timeframe, limit=limit, tolerance=tolerance
    )
    return await detect_support_resistance_endpoint(req, session)


@router.post("/calculate_indicator", dependencies=[Depends(verify_hermes_token)])
async def calculate_indicator_endpoint(
    req: CalculateIndicatorRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Expose deterministic technical indicator calculation (RSI, EMA, SMA, MACD, ATR, VWAP, BBANDS, VOLUME)."""
    candles = await _resolve_candles(
        session, candles=req.candles, symbol=req.symbol, timeframe=req.timeframe, limit=req.limit
    )
    try:
        result = quant_calc_indicator(
            indicator=req.indicator, data=candles, params=req.params
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return {
        "symbol": req.symbol,
        "timeframe": req.timeframe,
        **result,
    }
