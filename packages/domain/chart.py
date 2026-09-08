from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class DrawingPoint(BaseModel):
    time: int | str
    price: float


class LineDrawingParameters(BaseModel):
    p1: DrawingPoint
    p2: DrawingPoint
    line_type: str = "trendline"
    color: str = "#00E5FF"
    width: int = 2
    style: str = "solid"  # solid, dashed, dotted
    text: Optional[str] = None


class ZoneDrawingParameters(BaseModel):
    price_low: float
    price_high: float
    start_time: Optional[int | str] = None
    end_time: Optional[int | str] = None
    zone_type: str = "support_zone"  # support_zone, resistance_zone, order_block, fvg
    color: Optional[str] = None
    label: Optional[str] = None


class MarkerDrawingParameters(BaseModel):
    time: int | str
    price: float
    marker_type: str = "circle"  # arrow_up, arrow_down, circle, square, swing_high, swing_low
    position: str = "aboveBar"  # aboveBar, belowBar, inBar
    color: Optional[str] = None
    label: Optional[str] = None


class ChartDrawing(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    symbol: str
    timeframe: Optional[str] = None
    drawing_type: str
    parameters: dict[str, Any]
    reason: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class ChartAnnotation(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    symbol: str
    time_ms: int
    price: float
    text: str
    created_at: datetime


class VisibleRange(BaseModel):
    symbol: str
    timeframe: Optional[str] = None
    from_time: Optional[int | str] = None
    to_time: Optional[int | str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bar_count: Optional[int] = None


class ChartState(BaseModel):
    symbol: str
    timeframe: Optional[str] = None
    drawings: list[ChartDrawing] = Field(default_factory=list)
    annotations: list[ChartAnnotation] = Field(default_factory=list)
    visible_range: Optional[VisibleRange] = None
    drawing_count: int = 0
    annotation_count: int = 0
