from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest
from fastapi.testclient import TestClient

from apps.api.dependencies import verify_hermes_token
from apps.api.main import app
from apps.api.routers.chart_tools import get_db_session
from packages.database.models.chart import ChartAnnotationModel, ChartDrawingModel
from packages.database.models.hypertables import MarketCandleModel
from packages.hermes_tools.client import HermesToolsClient


class FakeDatabase:
    """In-memory stateful mock database for ChartDrawingModel and ChartAnnotationModel."""

    def __init__(self) -> None:
        self.drawings: dict[uuid.UUID, ChartDrawingModel] = {}
        self.annotations: dict[uuid.UUID, ChartAnnotationModel] = {}
        self.candles: list[MarketCandleModel] = []

    def clear(self) -> None:
        self.drawings.clear()
        self.annotations.clear()
        self.candles.clear()

    def add(self, instance: Any) -> None:
        if isinstance(instance, ChartDrawingModel):
            self.drawings[instance.id] = instance
        elif isinstance(instance, ChartAnnotationModel):
            self.annotations[instance.id] = instance

    def delete(self, instance: Any) -> None:
        if isinstance(instance, ChartDrawingModel):
            self.drawings.pop(instance.id, None)
        elif isinstance(instance, ChartAnnotationModel):
            self.annotations.pop(instance.id, None)

    async def execute(self, stmt: Any) -> MagicMock:
        mock_result = MagicMock()
        bound_params: dict[str, Any] = {}
        if hasattr(stmt, "compile"):
            try:
                compiled = stmt.compile()
                bound_params = dict(compiled.params or {})
            except Exception:
                pass

        stmt_str = str(stmt).lower()

        # Handle ChartDrawingModel queries
        if "chart_drawings" in stmt_str:
            # Check if querying a specific ID
            for param_val in bound_params.values():
                if isinstance(param_val, uuid.UUID) and param_val in self.drawings:
                    d_obj = self.drawings[param_val]
                    mock_result.scalar_one_or_none.return_value = d_obj
                    mock_result.scalars.return_value.all.return_value = [d_obj]
                    return mock_result

            matched_drawings = list(self.drawings.values())

            # Check symbol filter
            symbol = None
            for param_val in bound_params.values():
                if isinstance(param_val, str) and "/" in param_val:
                    symbol = param_val
                    break
            if not symbol:
                for param in ("BTC/USDT", "ETH/USDT", "SOL/USDT"):
                    if param in str(stmt):
                        symbol = param
                        break

            if symbol:
                matched_drawings = [d for d in matched_drawings if d.symbol == symbol]

            # Check is_active filter
            for param_val in bound_params.values():
                if isinstance(param_val, bool):
                    matched_drawings = [d for d in matched_drawings if d.is_active is param_val]

            # Check timeframe filter
            for tf in ("1h", "15m", "4h", "1d"):
                if tf in bound_params.values():
                    matched_drawings = [d for d in matched_drawings if d.timeframe == tf or d.timeframe is None]
                    break

            # Check drawing_type filter
            for dtype in ("trendline", "support_zone", "resistance_zone", "marker", "order_block"):
                if dtype in bound_params.values():
                    matched_drawings = [d for d in matched_drawings if d.drawing_type == dtype]
                    break

            mock_result.scalars.return_value.all.return_value = matched_drawings
            mock_result.scalar_one_or_none.return_value = matched_drawings[0] if matched_drawings else None
            return mock_result

        # Handle ChartAnnotationModel queries
        if "chart_annotations" in stmt_str:
            matched_annos = list(self.annotations.values())
            symbol = None
            for param_val in bound_params.values():
                if isinstance(param_val, str) and "/" in param_val:
                    symbol = param_val
                    break
            if symbol:
                matched_annos = [a for a in matched_annos if a.symbol == symbol]
            mock_result.scalars.return_value.all.return_value = matched_annos
            mock_result.scalar_one_or_none.return_value = matched_annos[0] if matched_annos else None
            return mock_result

        # Handle MarketCandleModel queries
        if "market_candles" in stmt_str:
            mock_result.scalars.return_value.all.return_value = self.candles
            return mock_result

        mock_result.scalars.return_value.all.return_value = []
        mock_result.scalar_one_or_none.return_value = None
        return mock_result


@pytest.fixture
def fake_db():
    db = FakeDatabase()
    return db


@pytest.fixture
def test_client(fake_db: FakeDatabase):
    """HermesToolsClient configured with FastAPI TestClient and in-memory mock DB."""
    mock_session = AsyncMock()
    mock_session.add = MagicMock(side_effect=fake_db.add)
    mock_session.delete = AsyncMock(side_effect=fake_db.delete)
    mock_session.execute = AsyncMock(side_effect=fake_db.execute)
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db
    app.dependency_overrides[verify_hermes_token] = lambda: None

    client = HermesToolsClient(base_url="http://testserver", token="test_token")
    client.client = TestClient(app, base_url="http://testserver", headers={"Authorization": "Bearer test_token"})

    yield client

    app.dependency_overrides.clear()
    client.close()


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_hermes_tools_client_has_chart_tools(test_client: HermesToolsClient) -> None:
    """Verify that ChartTools is mounted on HermesToolsClient with all 10 tools."""
    assert hasattr(test_client, "chart")
    assert callable(test_client.chart.get_state)
    assert callable(test_client.chart.get_visible_range)
    assert callable(test_client.chart.get_drawings)
    assert callable(test_client.chart.draw_line)
    assert callable(test_client.chart.draw_zone)
    assert callable(test_client.chart.draw_marker)
    assert callable(test_client.chart.add_annotation)
    assert callable(test_client.chart.update_drawing)
    assert callable(test_client.chart.delete_drawing)
    assert callable(test_client.chart.clear_drawings)


def test_chart_draw_line(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.draw_line persists a line drawing to ChartDrawingModel."""
    res = test_client.chart.draw_line(
        symbol="BTC/USDT",
        p1={"time": 1700000000, "price": 42000.0},
        p2={"time": 1700003600, "price": 43500.0},
        timeframe="1h",
        line_type="trendline",
        color="#00E5FF",
        width=2,
        style="solid",
        text="Ascending Trendline",
        reason="Higher lows structure confirmed",
    )

    assert "id" in res
    drawing_id = uuid.UUID(res["id"])
    assert drawing_id in fake_db.drawings

    saved = fake_db.drawings[drawing_id]
    assert saved.symbol == "BTC/USDT"
    assert saved.timeframe == "1h"
    assert saved.drawing_type == "trendline"
    assert saved.reason == "Higher lows structure confirmed"
    assert saved.is_active is True
    assert saved.parameters["p1"]["price"] == 42000.0
    assert saved.parameters["p2"]["price"] == 43500.0
    assert saved.parameters["color"] == "#00E5FF"
    assert saved.parameters["text"] == "Ascending Trendline"


def test_chart_draw_zone(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.draw_zone persists a zone drawing to ChartDrawingModel."""
    res = test_client.chart.draw_zone(
        symbol="BTC/USDT",
        price_low=41000.0,
        price_high=41500.0,
        start_time=1700000000,
        end_time=1700086400,
        timeframe="1h",
        zone_type="support_zone",
        label="Key Demand Zone",
        reason="Daily support with high volume confluence",
    )

    assert "id" in res
    drawing_id = uuid.UUID(res["id"])
    assert drawing_id in fake_db.drawings

    saved = fake_db.drawings[drawing_id]
    assert saved.symbol == "BTC/USDT"
    assert saved.drawing_type == "support_zone"
    assert saved.parameters["price_low"] == 41000.0
    assert saved.parameters["price_high"] == 41500.0
    assert saved.parameters["label"] == "Key Demand Zone"
    assert "0, 230, 118" in saved.parameters["color"]


def test_chart_draw_marker(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.draw_marker persists a marker drawing to ChartDrawingModel."""
    res = test_client.chart.draw_marker(
        symbol="BTC/USDT",
        time=1700010000,
        price=44000.0,
        timeframe="1h",
        marker_type="arrow_down",
        position="aboveBar",
        label="Swing High",
        reason="Fractal 5-bar swing high detected",
    )

    assert "id" in res
    drawing_id = uuid.UUID(res["id"])
    assert drawing_id in fake_db.drawings

    saved = fake_db.drawings[drawing_id]
    assert saved.symbol == "BTC/USDT"
    assert saved.drawing_type == "marker"
    assert saved.parameters["price"] == 44000.0
    assert saved.parameters["marker_type"] == "arrow_down"
    assert saved.parameters["position"] == "aboveBar"
    assert saved.parameters["label"] == "Swing High"


def test_chart_add_annotation(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.add_annotation persists to ChartAnnotationModel."""
    res = test_client.chart.add_annotation(
        symbol="BTC/USDT",
        time_ms=1700010000000,
        price=43000.0,
        text="Break of Structure (BOS) Confirmed",
    )

    assert "id" in res
    anno_id = uuid.UUID(res["id"])
    assert anno_id in fake_db.annotations

    saved = fake_db.annotations[anno_id]
    assert saved.symbol == "BTC/USDT"
    assert saved.time_ms == 1700010000000
    assert saved.price == 43000.0
    assert saved.text == "Break of Structure (BOS) Confirmed"


def test_chart_get_drawings_with_filters(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.get_drawings retrieves filtered drawings by symbol, timeframe, etc."""
    # Create 2 drawings
    d1 = test_client.chart.draw_zone(
        symbol="BTC/USDT",
        price_low=40000.0,
        price_high=40500.0,
        timeframe="1h",
        zone_type="support_zone",
    )
    d2 = test_client.chart.draw_zone(
        symbol="ETH/USDT",
        price_low=2200.0,
        price_high=2250.0,
        timeframe="1h",
        zone_type="support_zone",
    )

    # Filter for BTC/USDT
    res = test_client.chart.get_drawings(symbol="BTC/USDT")
    assert res["symbol"] == "BTC/USDT"
    assert res["count"] == 1
    assert res["drawings"][0]["id"] == d1["id"]

    # Filter for ETH/USDT
    res_eth = test_client.chart.get_drawings(symbol="ETH/USDT")
    assert res_eth["symbol"] == "ETH/USDT"
    assert res_eth["count"] == 1
    assert res_eth["drawings"][0]["id"] == d2["id"]


def test_chart_get_state(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.get_state returns drawings, annotations, and visible_range."""
    test_client.chart.draw_zone(
        symbol="BTC/USDT",
        price_low=42000.0,
        price_high=42500.0,
        zone_type="support_zone",
    )
    test_client.chart.add_annotation(
        symbol="BTC/USDT",
        time_ms=1700000000000,
        price=42250.0,
        text="Target entry zone",
    )

    state = test_client.chart.get_state(symbol="BTC/USDT", timeframe="1h")
    assert state["symbol"] == "BTC/USDT"
    assert state["timeframe"] == "1h"
    assert len(state["drawings"]) == 1
    assert len(state["annotations"]) == 1
    assert state["drawing_count"] == 1
    assert state["annotation_count"] == 1
    assert "visible_range" in state


def test_chart_get_visible_range(test_client: HermesToolsClient) -> None:
    """chart.get_visible_range returns range boundaries."""
    vr = test_client.chart.get_visible_range(symbol="BTC/USDT", timeframe="1h")
    assert vr["symbol"] == "BTC/USDT"
    assert vr["timeframe"] == "1h"
    assert "from_time" in vr
    assert "to_time" in vr


def test_chart_update_drawing(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.update_drawing updates parameters, reason, or is_active."""
    d = test_client.chart.draw_zone(
        symbol="BTC/USDT",
        price_low=40000.0,
        price_high=40500.0,
        reason="Initial thesis",
    )
    drawing_id = d["id"]

    updated = test_client.chart.update_drawing(
        drawing_id=drawing_id,
        parameters={"label": "Refined Support Zone"},
        reason="Updated after liquidity sweep",
        is_active=True,
    )

    assert updated["id"] == drawing_id
    assert updated["parameters"]["label"] == "Refined Support Zone"
    assert updated["reason"] == "Updated after liquidity sweep"

    saved = fake_db.drawings[uuid.UUID(drawing_id)]
    assert saved.parameters["label"] == "Refined Support Zone"
    assert saved.reason == "Updated after liquidity sweep"


def test_chart_delete_drawing_soft_and_hard(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.delete_drawing supports soft delete and hard delete."""
    d1 = test_client.chart.draw_zone(symbol="BTC/USDT", price_low=40000.0, price_high=40500.0)
    d2 = test_client.chart.draw_zone(symbol="BTC/USDT", price_low=41000.0, price_high=41500.0)

    # Soft delete d1
    res1 = test_client.chart.delete_drawing(drawing_id=d1["id"], hard_delete=False)
    assert res1["success"] is True
    assert res1["is_active"] is False
    assert fake_db.drawings[uuid.UUID(d1["id"])].is_active is False

    # Hard delete d2
    res2 = test_client.chart.delete_drawing(drawing_id=d2["id"], hard_delete=True)
    assert res2["success"] is True
    assert res2["hard_delete"] is True
    assert uuid.UUID(d2["id"]) not in fake_db.drawings


def test_chart_clear_drawings(test_client: HermesToolsClient, fake_db: FakeDatabase) -> None:
    """chart.clear_drawings deactivates or removes all drawings for a symbol."""
    test_client.chart.draw_zone(symbol="BTC/USDT", price_low=40000.0, price_high=40500.0)
    test_client.chart.draw_line(
        symbol="BTC/USDT",
        p1={"time": 1, "price": 40000.0},
        p2={"time": 2, "price": 41000.0},
    )
    test_client.chart.add_annotation(symbol="BTC/USDT", time_ms=1000, price=40500.0, text="Note")

    # Clear soft
    res = test_client.chart.clear_drawings(symbol="BTC/USDT", hard_delete=False)
    assert res["success"] is True
    assert res["symbol"] == "BTC/USDT"
    assert res["deleted_count"] == 2

    for d in fake_db.drawings.values():
        if d.symbol == "BTC/USDT":
            assert d.is_active is False


def test_execute_tool_dynamic_dispatch_all_10_tools(test_client: HermesToolsClient) -> None:
    """Test dynamic dispatch via client.execute_tool for all 10 chart tools."""
    # 1. chart.draw_line
    line_res = test_client.execute_tool(
        "chart.draw_line",
        symbol="BTC/USDT",
        p1={"time": 1700000000, "price": 42000.0},
        p2={"time": 1700003600, "price": 43000.0},
    )
    assert "id" in line_res

    # 2. chart.draw_zone
    zone_res = test_client.execute_tool(
        "chart.draw_zone",
        symbol="BTC/USDT",
        price_low=41000.0,
        price_high=41500.0,
    )
    assert "id" in zone_res

    # 3. chart.draw_marker
    marker_res = test_client.execute_tool(
        "chart.draw_marker",
        symbol="BTC/USDT",
        time=1700000000,
        price=42000.0,
    )
    assert "id" in marker_res

    # 4. chart.add_annotation
    anno_res = test_client.execute_tool(
        "chart.add_annotation",
        symbol="BTC/USDT",
        time_ms=1700000000000,
        price=42000.0,
        text="Test dynamic dispatch",
    )
    assert "id" in anno_res

    # 5. chart.get_state
    state_res = test_client.execute_tool("chart.get_state", symbol="BTC/USDT")
    assert state_res["symbol"] == "BTC/USDT"

    # 6. chart.get_visible_range
    vr_res = test_client.execute_tool("chart.get_visible_range", symbol="BTC/USDT")
    assert vr_res["symbol"] == "BTC/USDT"

    # 7. chart.get_drawings
    drawings_res = test_client.execute_tool("chart.get_drawings", symbol="BTC/USDT")
    assert drawings_res["symbol"] == "BTC/USDT"

    # 8. chart.update_drawing
    updated = test_client.execute_tool(
        "chart.update_drawing",
        drawing_id=zone_res["id"],
        reason="Updated via dynamic dispatch",
    )
    assert updated["reason"] == "Updated via dynamic dispatch"

    # 9. chart.delete_drawing
    deleted = test_client.execute_tool(
        "chart.delete_drawing",
        drawing_id=line_res["id"],
        hard_delete=True,
    )
    assert deleted["success"] is True

    # 10. chart.clear_drawings
    cleared = test_client.execute_tool("chart.clear_drawings", symbol="BTC/USDT")
    assert cleared["success"] is True


def test_execute_tool_unsupported_name(test_client: HermesToolsClient) -> None:
    """execute_tool raises ValueError on unrecognized tool name."""
    with pytest.raises(ValueError, match="Unsupported tool name"):
        test_client.execute_tool("invalid.tool_name", symbol="BTC/USDT")


def test_chart_tools_error_handling(test_client: HermesToolsClient) -> None:
    """Verify appropriate HTTP errors (404, 422) for invalid operations."""
    # 404 on unknown drawing id update
    non_existent = str(uuid.uuid4())
    with pytest.raises(httpx.HTTPStatusError) as exc_info:
        test_client.chart.update_drawing(drawing_id=non_existent, reason="Won't work")
    assert exc_info.value.response.status_code == 404

    # 404 on unknown drawing id delete
    with pytest.raises(httpx.HTTPStatusError) as exc_info:
        test_client.chart.delete_drawing(drawing_id=non_existent)
    assert exc_info.value.response.status_code == 404

    # 422 on invalid UUID format
    with pytest.raises(httpx.HTTPStatusError) as exc_info:
        test_client.chart.delete_drawing(drawing_id="not-a-uuid")
    assert exc_info.value.response.status_code == 422

    # 422 on incomplete line points
    with pytest.raises(httpx.HTTPStatusError) as exc_info:
        test_client.chart.draw_line(symbol="BTC/USDT", p1=None, p2=None)
    assert exc_info.value.response.status_code == 422


def test_chart_tools_auth_dependency() -> None:
    """Verify that verify_hermes_token dependency blocks unauthorized requests."""
    # Clear overrides to test actual dependency
    app.dependency_overrides.clear()

    raw_client = TestClient(app, base_url="http://test")
    res = raw_client.get("/api/v1/tools/chart/state?symbol=BTC/USDT")
    assert res.status_code == 403

    res_draw = raw_client.post(
        "/api/v1/tools/chart/draw_zone",
        json={"symbol": "BTC/USDT", "price_low": 40000, "price_high": 41000},
    )
    assert res_draw.status_code == 403
