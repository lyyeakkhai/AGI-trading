from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import delete, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_hermes_token
from packages.database.engine import get_db_session
from packages.database.models.chart import ChartAnnotationModel, ChartDrawingModel
from packages.database.models.hypertables import MarketCandleModel
from packages.logging import get_logger

logger = get_logger("chart_tools_router")
router = APIRouter(prefix="/api/v1/tools/chart", tags=["chart_tools"])


# ── Pydantic Request Models ───────────────────────────────────────────────────

class DrawLineRequest(BaseModel):
    symbol: str
    timeframe: str | None = None
    p1: dict[str, Any] | None = None
    p2: dict[str, Any] | None = None
    time1: Any | None = None
    price1: float | None = None
    time2: Any | None = None
    price2: float | None = None
    line_type: str = "trendline"
    color: str = "#00E5FF"
    width: int = 2
    style: str = "solid"
    text: str | None = None
    reason: str | None = None


class DrawZoneRequest(BaseModel):
    symbol: str
    price_low: float
    price_high: float
    start_time: Any | None = None
    end_time: Any | None = None
    timeframe: str | None = None
    zone_type: str = "support_zone"
    color: str | None = None
    label: str | None = None
    reason: str | None = None


class DrawMarkerRequest(BaseModel):
    symbol: str
    time: Any
    price: float
    timeframe: str | None = None
    marker_type: str = "circle"
    position: str = "aboveBar"
    color: str | None = None
    label: str | None = None
    reason: str | None = None


class AddAnnotationRequest(BaseModel):
    symbol: str
    time_ms: int
    price: float
    text: str


class UpdateDrawingRequest(BaseModel):
    drawing_id: str | None = None
    parameters: dict[str, Any] | None = None
    reason: str | None = None
    is_active: bool | None = None


class DeleteDrawingRequest(BaseModel):
    drawing_id: str
    hard_delete: bool = False


class ClearDrawingsRequest(BaseModel):
    symbol: str
    timeframe: str | None = None
    drawing_type: str | None = None
    hard_delete: bool = False


# ── Helper Serializers ────────────────────────────────────────────────────────

def serialize_drawing(drawing: ChartDrawingModel) -> dict[str, Any]:
    return {
        "id": str(drawing.id),
        "symbol": drawing.symbol,
        "timeframe": drawing.timeframe,
        "drawing_type": drawing.drawing_type,
        "parameters": drawing.parameters,
        "reason": drawing.reason,
        "is_active": drawing.is_active,
        "created_at": drawing.created_at.isoformat() if drawing.created_at else None,
        "updated_at": drawing.updated_at.isoformat() if drawing.updated_at else None,
    }


def serialize_annotation(annotation: ChartAnnotationModel) -> dict[str, Any]:
    return {
        "id": str(annotation.id),
        "symbol": annotation.symbol,
        "time_ms": annotation.time_ms,
        "price": float(annotation.price),
        "text": annotation.text,
        "created_at": annotation.created_at.isoformat() if annotation.created_at else None,
    }


async def compute_visible_range(
    session: AsyncSession, symbol: str, timeframe: str = "1h", limit: int = 100
) -> dict[str, Any]:
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
        candles = list(result.scalars().all())
        if candles:
            candles = sorted(candles, key=lambda c: c.timestamp)
            lows = [float(c.low) for c in candles]
            highs = [float(c.high) for c in candles]
            from_time = int(candles[0].timestamp.timestamp())
            to_time = int(candles[-1].timestamp.timestamp())
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "from_time": from_time,
                "to_time": to_time,
                "min_price": min(lows),
                "max_price": max(highs),
                "bar_count": len(candles),
            }
    except Exception as e:
        logger.debug("compute_visible_range_db_failed", error=str(e), symbol=symbol)

    now_ts = int(datetime.now(UTC).timestamp())
    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "from_time": now_ts - 360000,
        "to_time": now_ts,
        "min_price": None,
        "max_price": None,
        "bar_count": 0,
    }


# ── Chart Endpoints ───────────────────────────────────────────────────────────

# 1. chart.get_state
@router.get("/state", dependencies=[Depends(verify_hermes_token)])
async def get_chart_state(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str | None = Query(None, description="Timeframe filter"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    # Query active drawings
    stmt = select(ChartDrawingModel).where(
        ChartDrawingModel.symbol == symbol,
        ChartDrawingModel.is_active.is_(True),
    )
    if timeframe:
        stmt = stmt.where(
            or_(
                ChartDrawingModel.timeframe == timeframe,
                ChartDrawingModel.timeframe.is_(None),
            )
        )
    stmt = stmt.order_by(ChartDrawingModel.created_at.asc())
    drawing_res = await session.execute(stmt)
    drawings = list(drawing_res.scalars().all())

    # Query annotations
    anno_stmt = (
        select(ChartAnnotationModel)
        .where(ChartAnnotationModel.symbol == symbol)
        .order_by(ChartAnnotationModel.created_at.asc())
    )
    anno_res = await session.execute(anno_stmt)
    annotations = list(anno_res.scalars().all())

    # Compute visible range
    tf = timeframe or "1h"
    visible_range = await compute_visible_range(session, symbol, tf)

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "drawings": [serialize_drawing(d) for d in drawings],
        "annotations": [serialize_annotation(a) for a in annotations],
        "visible_range": visible_range,
        "drawing_count": len(drawings),
        "annotation_count": len(annotations),
    }


# 2. chart.get_visible_range
@router.get("/visible_range", dependencies=[Depends(verify_hermes_token)])
async def get_visible_range(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str = Query("1h", description="Timeframe"),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    return await compute_visible_range(session, symbol, timeframe, limit=limit)


# 3. chart.get_drawings
@router.get("/drawings", dependencies=[Depends(verify_hermes_token)])
async def get_drawings(
    symbol: str = Query(..., description="Market symbol, e.g. BTC/USDT"),
    timeframe: str | None = Query(None, description="Timeframe filter"),
    drawing_type: str | None = Query(None, description="Drawing type filter"),
    is_active: bool | None = Query(True, description="Active status filter"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    stmt = select(ChartDrawingModel).where(ChartDrawingModel.symbol == symbol)
    if timeframe:
        stmt = stmt.where(
            or_(
                ChartDrawingModel.timeframe == timeframe,
                ChartDrawingModel.timeframe.is_(None),
            )
        )
    if drawing_type:
        stmt = stmt.where(ChartDrawingModel.drawing_type == drawing_type)
    if is_active is not None:
        stmt = stmt.where(ChartDrawingModel.is_active.is_(is_active))
    stmt = stmt.order_by(ChartDrawingModel.created_at.asc())

    result = await session.execute(stmt)
    drawings = list(result.scalars().all())
    return {
        "symbol": symbol,
        "drawings": [serialize_drawing(d) for d in drawings],
        "count": len(drawings),
    }


# 4. chart.draw_line
@router.post("/draw_line", dependencies=[Depends(verify_hermes_token)])
@router.post("/line", dependencies=[Depends(verify_hermes_token)], include_in_schema=False)
async def draw_line(
    req: DrawLineRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    p1 = req.p1 or ({"time": req.time1, "price": req.price1} if req.time1 is not None and req.price1 is not None else None)
    p2 = req.p2 or ({"time": req.time2, "price": req.price2} if req.time2 is not None and req.price2 is not None else None)

    if not p1 or p1.get("time") is None or p1.get("price") is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="p1 or (time1, price1) must be provided with valid values",
        )
    if not p2 or p2.get("time") is None or p2.get("price") is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="p2 or (time2, price2) must be provided with valid values",
        )

    parameters = {
        "p1": {"time": p1["time"], "price": float(p1["price"])},
        "p2": {"time": p2["time"], "price": float(p2["price"])},
        "line_type": req.line_type,
        "color": req.color,
        "width": req.width,
        "style": req.style,
        "text": req.text,
    }

    now = datetime.now(UTC)
    drawing = ChartDrawingModel(
        id=uuid.uuid4(),
        symbol=req.symbol,
        timeframe=req.timeframe,
        drawing_type=req.line_type or "trendline",
        parameters=parameters,
        reason=req.reason,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    session.add(drawing)
    await session.commit()
    await session.refresh(drawing)

    logger.info("chart_draw_line_created", id=str(drawing.id), symbol=req.symbol)
    return serialize_drawing(drawing)


# 5. chart.draw_zone
@router.post("/draw_zone", dependencies=[Depends(verify_hermes_token)])
@router.post("/zone", dependencies=[Depends(verify_hermes_token)], include_in_schema=False)
async def draw_zone(
    req: DrawZoneRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    p_low = min(float(req.price_low), float(req.price_high))
    p_high = max(float(req.price_low), float(req.price_high))

    color = req.color
    if not color:
        lower_type = req.zone_type.lower()
        if "supp" in lower_type:
            color = "rgba(0, 230, 118, 0.2)"
        elif "res" in lower_type:
            color = "rgba(255, 59, 48, 0.2)"
        else:
            color = "rgba(0, 229, 255, 0.2)"

    parameters = {
        "price_low": p_low,
        "price_high": p_high,
        "start_time": req.start_time,
        "end_time": req.end_time,
        "zone_type": req.zone_type,
        "color": color,
        "label": req.label,
    }

    now = datetime.now(UTC)
    drawing = ChartDrawingModel(
        id=uuid.uuid4(),
        symbol=req.symbol,
        timeframe=req.timeframe,
        drawing_type=req.zone_type,
        parameters=parameters,
        reason=req.reason,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    session.add(drawing)
    await session.commit()
    await session.refresh(drawing)

    logger.info("chart_draw_zone_created", id=str(drawing.id), symbol=req.symbol)
    return serialize_drawing(drawing)


# 6. chart.draw_marker
@router.post("/draw_marker", dependencies=[Depends(verify_hermes_token)])
@router.post("/marker", dependencies=[Depends(verify_hermes_token)], include_in_schema=False)
async def draw_marker(
    req: DrawMarkerRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    color = req.color
    if not color:
        m_lower = req.marker_type.lower()
        if "up" in m_lower or "buy" in m_lower or "low" in m_lower:
            color = "#00E676"
        elif "down" in m_lower or "sell" in m_lower or "high" in m_lower:
            color = "#FF3B30"
        else:
            color = "#00E5FF"

    parameters = {
        "time": req.time,
        "price": float(req.price),
        "marker_type": req.marker_type,
        "position": req.position,
        "color": color,
        "label": req.label,
    }

    now = datetime.now(UTC)
    drawing = ChartDrawingModel(
        id=uuid.uuid4(),
        symbol=req.symbol,
        timeframe=req.timeframe,
        drawing_type="marker",
        parameters=parameters,
        reason=req.reason,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    session.add(drawing)
    await session.commit()
    await session.refresh(drawing)

    logger.info("chart_draw_marker_created", id=str(drawing.id), symbol=req.symbol)
    return serialize_drawing(drawing)


# 7. chart.add_annotation
@router.post("/add_annotation", dependencies=[Depends(verify_hermes_token)])
@router.post("/annotation", dependencies=[Depends(verify_hermes_token)], include_in_schema=False)
async def add_annotation(
    req: AddAnnotationRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    now = datetime.now(UTC)
    annotation = ChartAnnotationModel(
        id=uuid.uuid4(),
        symbol=req.symbol,
        time_ms=req.time_ms,
        price=float(req.price),
        text=req.text,
        created_at=now,
    )
    session.add(annotation)
    await session.commit()
    await session.refresh(annotation)

    logger.info("chart_add_annotation_created", id=str(annotation.id), symbol=req.symbol)
    return serialize_annotation(annotation)


# 8. chart.update_drawing
@router.patch("/drawings/{drawing_id}", dependencies=[Depends(verify_hermes_token)])
@router.post("/update_drawing", dependencies=[Depends(verify_hermes_token)])
async def update_drawing(
    req: UpdateDrawingRequest,
    drawing_id: str | None = None,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    target_id_str = drawing_id or req.drawing_id
    if not target_id_str:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="drawing_id must be provided in path or body",
        )

    try:
        parsed_id = uuid.UUID(str(target_id_str))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format for drawing_id",
        )

    stmt = select(ChartDrawingModel).where(ChartDrawingModel.id == parsed_id)
    result = await session.execute(stmt)
    drawing = result.scalar_one_or_none()
    if not drawing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drawing {target_id_str} not found",
        )

    if req.parameters is not None:
        merged = dict(drawing.parameters or {})
        merged.update(req.parameters)
        drawing.parameters = merged
    if req.reason is not None:
        drawing.reason = req.reason
    if req.is_active is not None:
        drawing.is_active = req.is_active

    drawing.updated_at = datetime.now(UTC)
    await session.commit()
    await session.refresh(drawing)

    logger.info("chart_drawing_updated", id=str(drawing.id))
    return serialize_drawing(drawing)


# 9. chart.delete_drawing
@router.delete("/drawings/{drawing_id}", dependencies=[Depends(verify_hermes_token)])
@router.post("/delete_drawing", dependencies=[Depends(verify_hermes_token)])
async def delete_drawing(
    drawing_id: str | None = None,
    req: DeleteDrawingRequest | None = None,
    hard_delete: bool = Query(False),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    target_id_str = drawing_id or (req.drawing_id if req else None)
    is_hard = (req.hard_delete if req else False) or hard_delete

    if not target_id_str:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="drawing_id must be provided in path or body",
        )

    try:
        parsed_id = uuid.UUID(str(target_id_str))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format for drawing_id",
        )

    stmt = select(ChartDrawingModel).where(ChartDrawingModel.id == parsed_id)
    result = await session.execute(stmt)
    drawing = result.scalar_one_or_none()
    if not drawing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drawing {target_id_str} not found",
        )

    if is_hard:
        await session.delete(drawing)
    else:
        drawing.is_active = False
        drawing.updated_at = datetime.now(UTC)

    await session.commit()
    logger.info("chart_drawing_deleted", id=target_id_str, hard_delete=is_hard)
    return {
        "success": True,
        "id": target_id_str,
        "hard_delete": is_hard,
        "is_active": False,
    }


# 10. chart.clear_drawings
@router.post("/clear_drawings", dependencies=[Depends(verify_hermes_token)])
@router.delete("/drawings", dependencies=[Depends(verify_hermes_token)], include_in_schema=False)
async def clear_drawings(
    req: ClearDrawingsRequest | None = None,
    symbol: str | None = Query(None),
    timeframe: str | None = Query(None),
    drawing_type: str | None = Query(None),
    hard_delete: bool = Query(False),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    target_symbol = (req.symbol if req else None) or symbol
    if not target_symbol:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="symbol must be provided",
        )

    target_timeframe = (req.timeframe if req else None) or timeframe
    target_type = (req.drawing_type if req else None) or drawing_type
    is_hard = (req.hard_delete if req else False) or hard_delete

    stmt = select(ChartDrawingModel).where(ChartDrawingModel.symbol == target_symbol)
    if target_timeframe:
        stmt = stmt.where(
            or_(
                ChartDrawingModel.timeframe == target_timeframe,
                ChartDrawingModel.timeframe.is_(None),
            )
        )
    if target_type:
        stmt = stmt.where(ChartDrawingModel.drawing_type == target_type)

    res = await session.execute(stmt)
    drawings = list(res.scalars().all())
    count = len(drawings)

    now = datetime.now(UTC)
    for d in drawings:
        if is_hard:
            await session.delete(d)
        else:
            d.is_active = False
            d.updated_at = now

    # Also clear annotations if no specific drawing_type filter
    if not target_type:
        anno_stmt = select(ChartAnnotationModel).where(ChartAnnotationModel.symbol == target_symbol)
        anno_res = await session.execute(anno_stmt)
        annotations = list(anno_res.scalars().all())
        for a in annotations:
            await session.delete(a)

    await session.commit()
    logger.info("chart_drawings_cleared", symbol=target_symbol, count=count, hard_delete=is_hard)
    return {
        "success": True,
        "symbol": target_symbol,
        "deleted_count": count,
        "hard_delete": is_hard,
    }
