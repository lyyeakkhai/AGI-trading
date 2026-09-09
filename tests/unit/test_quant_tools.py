from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from packages.config.settings import get_settings
from packages.database.engine import get_db_session
from packages.hermes_tools.client import HermesToolsClient
from packages.quant.indicators import calculate_indicator
from packages.quant.structure import (
    detect_market_structure,
    detect_support_resistance,
    detect_swings,
    detect_trend,
)


@pytest.fixture(autouse=True)
def mock_app_settings():
    real_settings = get_settings()
    mock_s = MagicMock(wraps=real_settings)

    mock_hermes = MagicMock()
    mock_hermes.service_token = "test-hermes-token"
    mock_s.hermes = mock_hermes

    app.dependency_overrides[get_settings] = lambda: mock_s
    yield mock_s
    app.dependency_overrides.pop(get_settings, None)


@pytest.fixture
def auth_headers() -> dict[str, str]:
    return {"Authorization": "Bearer test-hermes-token"}


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def sample_candles() -> list[dict[str, Any]]:
    # Create deterministic wave pattern:
    # 0 to 4 rising to peak at 4 (110)
    # 5 to 8 falling to trough at 8 (95)
    # 9 to 13 rising to higher peak at 13 (120)
    # 14 to 17 falling to higher trough at 17 (105)
    # 18 to 22 rising to highest peak at 22 (130)
    # 23 to 26 falling (115)
    prices = [
        100, 102, 105, 108, 110, 106, 101, 97, 95, 99,
        105, 112, 118, 120, 116, 110, 107, 105, 110, 118,
        125, 128, 130, 124, 119, 116, 115
    ]
    candles = []
    for i, p in enumerate(prices):
        candles.append({
            "timestamp": f"2026-09-08T{i:02d}:00:00Z",
            "open": float(p - 1),
            "high": float(p + 2),
            "low": float(p - 2),
            "close": float(p),
            "volume": float(1000 + i * 50),
        })
    return candles


# ── Unit Math Tests ──────────────────────────────────────────────────────────

def test_detect_swings_deterministic_fractal(sample_candles: list[dict[str, Any]]) -> None:
    result = detect_swings(data=sample_candles, window=2)
    highs = result["swing_highs"]
    lows = result["swing_lows"]

    assert len(highs) >= 2
    assert len(lows) >= 2
    assert result["total_highs"] == len(highs)
    assert result["total_lows"] == len(lows)
    assert result["recent_swing_high"] is not None
    assert result["recent_swing_low"] is not None

    # Verify peak at index 4 (high: 112.0) is detected
    high_indices = [h["index"] for h in highs]
    assert 4 in high_indices
    # Verify trough at index 8 (low: 93.0) is detected
    low_indices = [l["index"] for l in lows]
    assert 8 in low_indices


def test_detect_market_structure_bos_choch(sample_candles: list[dict[str, Any]]) -> None:
    result = detect_market_structure(data=sample_candles, window=2)

    assert result["structure"] in ("BULLISH", "BEARISH", "RANGING")
    assert len(result["swing_points"]) > 0
    # In an ascending wave pattern, structure should be Bullish
    assert result["structure"] == "BULLISH"
    assert len(result["bos_events"]) > 0
    assert result["bos_events"][0]["type"] == "BOS_BULLISH"


def test_detect_trend_direction_and_strength(sample_candles: list[dict[str, Any]]) -> None:
    # 1. Clear uptrend candles
    uptrend_candles = [
        {"open": 100.0 + i * 2, "high": 101.0 + i * 2, "low": 99.0 + i * 2, "close": 100.5 + i * 2, "volume": 1000.0}
        for i in range(30)
    ]
    up_res = detect_trend(data=uptrend_candles, fast_period=5, slow_period=10)
    assert up_res["direction"] == "UPTREND"
    assert up_res["is_trending"] is True
    assert up_res["strength_label"] in ("STRONG", "VERY_STRONG")

    # 2. Clear downtrend candles
    downtrend_candles = [
        {"open": 200.0 - i * 2, "high": 201.0 - i * 2, "low": 199.0 - i * 2, "close": 199.5 - i * 2, "volume": 1000.0}
        for i in range(30)
    ]
    down_res = detect_trend(data=downtrend_candles, fast_period=5, slow_period=10)
    assert down_res["direction"] == "DOWNTREND"
    assert down_res["is_trending"] is True

    # 3. Pullback / consolidation candles from sample
    sample_res = detect_trend(data=sample_candles, fast_period=5, slow_period=10)
    assert sample_res["direction"] in ("UPTREND", "DOWNTREND", "SIDEWAYS")



def test_detect_support_resistance_zones(sample_candles: list[dict[str, Any]]) -> None:
    result = detect_support_resistance(data=sample_candles, tolerance=0.03)

    assert result["current_price"] == 115.0
    assert len(result["support_zones"]) > 0
    assert len(result["resistance_zones"]) > 0
    assert result["nearest_support"] is not None
    assert result["nearest_support"] < result["current_price"]
    assert result["breakout"] in ("bullish_breakout", "bearish_breakout", "none")


def test_calculate_all_indicators(sample_candles: list[dict[str, Any]]) -> None:
    for ind in ["RSI", "EMA", "SMA", "MACD", "ATR", "VWAP", "BOLLINGER_BANDS", "VOLUME"]:
        res = calculate_indicator(ind, sample_candles)
        assert res["indicator"] == ("BOLLINGER_BANDS" if "BOLL" in ind else ind)
        assert res["latest"] is not None
        assert "values" in res

    # Specific assertions
    rsi_res = calculate_indicator("RSI", sample_candles, params={"period": 14})
    assert isinstance(rsi_res["latest"], float)

    macd_res = calculate_indicator("MACD", sample_candles)
    assert isinstance(macd_res["latest"], dict)
    assert "macd" in macd_res["latest"]
    assert "signal" in macd_res["latest"]
    assert "histogram" in macd_res["latest"]

    bb_res = calculate_indicator("BOLLINGER_BANDS", sample_candles, params={"period": 10, "nbdev": 2.0})
    assert bb_res["latest"]["upper"] > bb_res["latest"]["middle"] > bb_res["latest"]["lower"]

    vol_res = calculate_indicator("VOLUME", sample_candles, params={"period": 10})
    assert "rvol" in vol_res["latest"]
    assert "is_anomaly" in vol_res["latest"]


def test_calculate_indicator_invalid() -> None:
    with pytest.raises(ValueError, match="Unsupported indicator"):
        calculate_indicator("UNKNOWN_INDICATOR", [{"close": 10.0}])


# ── FastAPI Endpoint Integration Tests ────────────────────────────────────────

def test_api_detect_swings(client: TestClient, auth_headers: dict[str, str], sample_candles: list[dict[str, Any]]) -> None:
    response = client.post(
        "/api/v1/tools/analysis/detect_swings",
        headers=auth_headers,
        json={"candles": sample_candles, "window": 2},
    )
    assert response.status_code == 200
    data = response.json()
    assert "swing_highs" in data
    assert "swing_lows" in data
    assert data["total_highs"] >= 2


def test_api_detect_market_structure(client: TestClient, auth_headers: dict[str, str], sample_candles: list[dict[str, Any]]) -> None:
    response = client.post(
        "/api/v1/tools/analysis/detect_market_structure",
        headers=auth_headers,
        json={"candles": sample_candles, "window": 2},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["structure"] == "BULLISH"
    assert len(data["swing_points"]) > 0


def test_api_detect_trend(client: TestClient, auth_headers: dict[str, str]) -> None:
    uptrend_candles = [
        {"open": 100.0 + i * 2, "high": 101.0 + i * 2, "low": 99.0 + i * 2, "close": 100.5 + i * 2, "volume": 1000.0}
        for i in range(30)
    ]
    response = client.post(
        "/api/v1/tools/analysis/detect_trend",
        headers=auth_headers,
        json={"candles": uptrend_candles, "fast_period": 5, "slow_period": 10},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["direction"] == "UPTREND"
    assert data["is_trending"] is True



def test_api_detect_support_resistance(client: TestClient, auth_headers: dict[str, str], sample_candles: list[dict[str, Any]]) -> None:
    response = client.post(
        "/api/v1/tools/analysis/detect_support_resistance",
        headers=auth_headers,
        json={"candles": sample_candles, "tolerance": 0.03},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["support_zones"]) > 0
    assert len(data["resistance_zones"]) > 0


def test_api_calculate_indicator(client: TestClient, auth_headers: dict[str, str], sample_candles: list[dict[str, Any]]) -> None:
    response = client.post(
        "/api/v1/tools/analysis/calculate_indicator",
        headers=auth_headers,
        json={"candles": sample_candles, "indicator": "RSI", "params": {"period": 14}},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["indicator"] == "RSI"
    assert data["latest"] is not None


def test_api_calculate_indicator_bad_request(client: TestClient, auth_headers: dict[str, str], sample_candles: list[dict[str, Any]]) -> None:
    response = client.post(
        "/api/v1/tools/analysis/calculate_indicator",
        headers=auth_headers,
        json={"candles": sample_candles, "indicator": "NON_EXISTENT"},
    )
    assert response.status_code == 400


# ── HermesToolsClient Dispatcher Tests ────────────────────────────────────────

def test_hermes_tools_client_analysis_tools(sample_candles: list[dict[str, Any]]) -> None:
    mock_post = MagicMock()
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"success": True, "result": "mocked"}

    with patch("httpx.Client.post", mock_post):
        client = HermesToolsClient(base_url="http://test", token="mock-token")

        # Test AnalysisTools namespace
        client.analysis.detect_swings(candles=sample_candles, window=2)
        assert mock_post.call_args[0][0] == "/api/v1/tools/analysis/detect_swings"

        client.analysis.detect_market_structure(candles=sample_candles)
        assert mock_post.call_args[0][0] == "/api/v1/tools/analysis/detect_market_structure"

        client.analysis.detect_trend(candles=sample_candles)
        assert mock_post.call_args[0][0] == "/api/v1/tools/analysis/detect_trend"

        client.analysis.detect_support_resistance(candles=sample_candles)
        assert mock_post.call_args[0][0] == "/api/v1/tools/analysis/detect_support_resistance"

        client.analysis.calculate_indicator("RSI", candles=sample_candles)
        assert mock_post.call_args[0][0] == "/api/v1/tools/analysis/calculate_indicator"

        # Test execute_tool dynamic dispatch
        client.execute_tool("analysis.detect_swings", candles=sample_candles)
        client.execute_tool("analysis.detect_market_structure", candles=sample_candles)
        client.execute_tool("analysis.detect_trend", candles=sample_candles)
        client.execute_tool("analysis.detect_support_resistance", candles=sample_candles)
        client.execute_tool("analysis.calculate_indicator", indicator="MACD", candles=sample_candles)
