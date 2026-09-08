from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from packages.hermes_tools.client import HermesToolsClient


class ChartTools:
    """Namespace for chart drawing and annotation tools."""

    def __init__(self, client: HermesToolsClient) -> None:
        self._client = client

    def get_state(
        self,
        symbol: str,
        timeframe: str | None = None,
    ) -> dict[str, Any]:
        """Retrieve complete chart state (drawings, annotations, visible range)."""
        params: dict[str, Any] = {"symbol": symbol}
        if timeframe:
            params["timeframe"] = timeframe
        resp = self._client.client.get("/api/v1/tools/chart/state", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_visible_range(
        self,
        symbol: str,
        timeframe: str = "1h",
        limit: int = 100,
    ) -> dict[str, Any]:
        """Get visible chart range (time and price limits) for a symbol."""
        params: dict[str, Any] = {
            "symbol": symbol,
            "timeframe": timeframe,
            "limit": limit,
        }
        resp = self._client.client.get("/api/v1/tools/chart/visible_range", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_drawings(
        self,
        symbol: str,
        timeframe: str | None = None,
        drawing_type: str | None = None,
        is_active: bool | None = True,
    ) -> dict[str, Any]:
        """Get drawings with optional filters."""
        params: dict[str, Any] = {"symbol": symbol}
        if timeframe is not None:
            params["timeframe"] = timeframe
        if drawing_type is not None:
            params["drawing_type"] = drawing_type
        if is_active is not None:
            params["is_active"] = is_active
        resp = self._client.client.get("/api/v1/tools/chart/drawings", params=params)
        resp.raise_for_status()
        return resp.json()

    def draw_line(
        self,
        symbol: str,
        p1: dict[str, Any] | None = None,
        p2: dict[str, Any] | None = None,
        time1: Any | None = None,
        price1: float | None = None,
        time2: Any | None = None,
        price2: float | None = None,
        timeframe: str | None = None,
        line_type: str = "trendline",
        color: str = "#00E5FF",
        width: int = 2,
        style: str = "solid",
        text: str | None = None,
        reason: str | None = None,
    ) -> dict[str, Any]:
        """Draw a line (trendline, horizontal level, ray) on the chart."""
        payload: dict[str, Any] = {
            "symbol": symbol,
            "timeframe": timeframe,
            "line_type": line_type,
            "color": color,
            "width": width,
            "style": style,
            "text": text,
            "reason": reason,
        }
        if p1 is not None:
            payload["p1"] = p1
        if p2 is not None:
            payload["p2"] = p2
        if time1 is not None:
            payload["time1"] = time1
        if price1 is not None:
            payload["price1"] = price1
        if time2 is not None:
            payload["time2"] = time2
        if price2 is not None:
            payload["price2"] = price2

        resp = self._client.client.post("/api/v1/tools/chart/draw_line", json=payload)
        resp.raise_for_status()
        return resp.json()

    def draw_zone(
        self,
        symbol: str,
        price_low: float,
        price_high: float,
        start_time: Any | None = None,
        end_time: Any | None = None,
        timeframe: str | None = None,
        zone_type: str = "support_zone",
        color: str | None = None,
        label: str | None = None,
        reason: str | None = None,
    ) -> dict[str, Any]:
        """Draw a price zone (support, resistance, order block, FVG) on the chart."""
        payload: dict[str, Any] = {
            "symbol": symbol,
            "price_low": price_low,
            "price_high": price_high,
            "start_time": start_time,
            "end_time": end_time,
            "timeframe": timeframe,
            "zone_type": zone_type,
            "color": color,
            "label": label,
            "reason": reason,
        }
        resp = self._client.client.post("/api/v1/tools/chart/draw_zone", json=payload)
        resp.raise_for_status()
        return resp.json()

    def draw_marker(
        self,
        symbol: str,
        time: Any,
        price: float,
        timeframe: str | None = None,
        marker_type: str = "circle",
        position: str = "aboveBar",
        color: str | None = None,
        label: str | None = None,
        reason: str | None = None,
    ) -> dict[str, Any]:
        """Draw a marker (point marker, swing point, signal) on the chart."""
        payload: dict[str, Any] = {
            "symbol": symbol,
            "time": time,
            "price": price,
            "timeframe": timeframe,
            "marker_type": marker_type,
            "position": position,
            "color": color,
            "label": label,
            "reason": reason,
        }
        resp = self._client.client.post("/api/v1/tools/chart/draw_marker", json=payload)
        resp.raise_for_status()
        return resp.json()

    def add_annotation(
        self,
        symbol: str,
        time_ms: int,
        price: float,
        text: str,
    ) -> dict[str, Any]:
        """Add a text annotation anchored to time and price."""
        payload: dict[str, Any] = {
            "symbol": symbol,
            "time_ms": time_ms,
            "price": price,
            "text": text,
        }
        resp = self._client.client.post("/api/v1/tools/chart/add_annotation", json=payload)
        resp.raise_for_status()
        return resp.json()

    def update_drawing(
        self,
        drawing_id: str,
        parameters: dict[str, Any] | None = None,
        reason: str | None = None,
        is_active: bool | None = None,
    ) -> dict[str, Any]:
        """Update an existing chart drawing."""
        payload: dict[str, Any] = {"drawing_id": drawing_id}
        if parameters is not None:
            payload["parameters"] = parameters
        if reason is not None:
            payload["reason"] = reason
        if is_active is not None:
            payload["is_active"] = is_active

        resp = self._client.client.patch(
            f"/api/v1/tools/chart/drawings/{drawing_id}",
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()

    def delete_drawing(
        self,
        drawing_id: str,
        hard_delete: bool = False,
    ) -> dict[str, Any]:
        """Delete or deactivate a chart drawing by ID."""
        resp = self._client.client.delete(
            f"/api/v1/tools/chart/drawings/{drawing_id}",
            params={"hard_delete": hard_delete},
        )
        resp.raise_for_status()
        return resp.json()

    def clear_drawings(
        self,
        symbol: str,
        timeframe: str | None = None,
        drawing_type: str | None = None,
        hard_delete: bool = False,
    ) -> dict[str, Any]:
        """Clear drawings for a symbol."""
        payload: dict[str, Any] = {
            "symbol": symbol,
            "timeframe": timeframe,
            "drawing_type": drawing_type,
            "hard_delete": hard_delete,
        }
        resp = self._client.client.post("/api/v1/tools/chart/clear_drawings", json=payload)
        resp.raise_for_status()
        return resp.json()
