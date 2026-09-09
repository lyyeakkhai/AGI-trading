from __future__ import annotations

import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from packages.config.settings import get_settings
from packages.database.engine import get_db_session
from packages.database.models.trading_plan import TradingPlanModel
from packages.hermes_tools.client import HermesToolsClient


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


# ── Trading Planner Tests (5 Tools) ──────────────────────────────────────────

def test_plan_create_persists_to_database(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    payload = {
        "symbol": "BTC/USDT",
        "direction": "LONG",
        "market": "spot",
        "entry_price": 50000.0,
        "stop_loss_price": 49000.0,
        "take_profit_prices": [{"price": 53000.0}],
        "risk_percent": 0.02,
        "thesis": "Bullish break of structure on 1H",
        "invalidation": "Hourly close below 49000",
        "evidence": ["BOS_BULLISH", "EMA20 > EMA50"],
        "status": "DRAFT",
    }

    try:
        response = client.post("/api/v1/tools/plan/create", headers=auth_headers, json=payload)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["symbol"] == "BTC/USDT"
        assert data["direction"] == "LONG"
        assert data["entry_price"] == 50000.0
        assert data["stop_loss_price"] == 49000.0
        assert data["take_profit_prices"] == [{"price": 53000.0}]
        assert data["risk_percent"] == 0.02
        assert data["thesis"] == "Bullish break of structure on 1H"
        assert data["status"] == "DRAFT"
        mock_session.add.assert_called_once()
        mock_session.commit.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_plan_get_success_and_not_found(client: TestClient, auth_headers: dict[str, str]) -> None:
    plan_uuid = uuid.uuid4()
    mock_plan = TradingPlanModel(
        id=plan_uuid,
        symbol="ETH/USDT",
        market="spot",
        direction="LONG",
        entry_price=Decimal("3000.0"),
        stop_loss_price=Decimal("2900.0"),
        take_profit_prices=[{"price": 3200.0}],
        risk_percent=Decimal("0.01"),
        thesis="Bullish flag breakout",
        invalidation="Drop below 2900",
        evidence=["Flag pattern"],
        status="DRAFT",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_plan
    mock_session.execute = AsyncMock(return_value=mock_result)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        # Success
        response = client.get(f"/api/v1/tools/plan/{plan_uuid}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(plan_uuid)
        assert data["symbol"] == "ETH/USDT"

        # Not found
        mock_result.scalar_one_or_none.return_value = None
        missing_uuid = uuid.uuid4()
        response_missing = client.get(f"/api/v1/tools/plan/{missing_uuid}", headers=auth_headers)
        assert response_missing.status_code == 404

        # Invalid UUID
        response_invalid = client.get("/api/v1/tools/plan/not-a-uuid", headers=auth_headers)
        assert response_invalid.status_code == 400
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_plan_update_modifies_fields(client: TestClient, auth_headers: dict[str, str]) -> None:
    plan_uuid = uuid.uuid4()
    mock_plan = TradingPlanModel(
        id=plan_uuid,
        symbol="BTC/USDT",
        market="spot",
        direction="LONG",
        entry_price=Decimal("50000.0"),
        stop_loss_price=Decimal("49000.0"),
        take_profit_prices=[{"price": 52000.0}],
        risk_percent=Decimal("0.01"),
        thesis="Initial thesis",
        invalidation="Initial invalidation",
        evidence=[],
        status="DRAFT",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_plan
    mock_session.execute = AsyncMock(return_value=mock_result)
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    update_payload = {
        "entry_price": 50500.0,
        "thesis": "Updated stronger thesis",
        "status": "APPROVED",
    }

    try:
        response = client.patch(f"/api/v1/tools/plan/{plan_uuid}", headers=auth_headers, json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["entry_price"] == 50500.0
        assert data["thesis"] == "Updated stronger thesis"
        assert data["status"] == "APPROVED"
        mock_session.commit.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_plan_validate_structural_rules(client: TestClient, auth_headers: dict[str, str]) -> None:
    # 1. Invalid LONG (stop loss above entry)
    bad_long = {
        "symbol": "BTC/USDT",
        "direction": "LONG",
        "entry_price": 50000.0,
        "stop_loss_price": 51000.0,  # Invalid!
        "take_profit_prices": [53000.0],
    }
    resp = client.post("/api/v1/tools/plan/validate", headers=auth_headers, json=bad_long)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_valid"] is False
    assert any("Stop loss" in err for err in data["errors"])

    # 2. Invalid SHORT (stop loss below entry)
    bad_short = {
        "symbol": "BTC/USDT",
        "direction": "SHORT",
        "entry_price": 50000.0,
        "stop_loss_price": 49000.0,  # Invalid!
        "take_profit_prices": [47000.0],
    }
    resp_short = client.post("/api/v1/tools/plan/validate", headers=auth_headers, json=bad_short)
    assert resp_short.status_code == 200
    data_short = resp_short.json()
    assert data_short["is_valid"] is False

    # 3. Valid compliant plan
    valid_plan = {
        "symbol": "BTC/USDT",
        "direction": "LONG",
        "entry_price": 50000.0,
        "stop_loss_price": 49000.0,
        "take_profit_prices": [53000.0],
        "risk_percent": 0.015,
    }
    resp_valid = client.post("/api/v1/tools/plan/validate", headers=auth_headers, json=valid_plan)
    assert resp_valid.status_code == 200
    data_valid = resp_valid.json()
    assert data_valid["is_valid"] is True
    assert len(data_valid["errors"]) == 0


def test_plan_cancel_marks_cancelled(client: TestClient, auth_headers: dict[str, str]) -> None:
    plan_uuid = uuid.uuid4()
    mock_plan = TradingPlanModel(
        id=plan_uuid,
        symbol="BTC/USDT",
        market="spot",
        direction="LONG",
        entry_price=Decimal("50000.0"),
        stop_loss_price=Decimal("49000.0"),
        take_profit_prices=[],
        risk_percent=Decimal("0.01"),
        thesis="Thesis",
        invalidation="Inv",
        evidence=[],
        status="DRAFT",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_plan
    mock_session.execute = AsyncMock(return_value=mock_result)
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        response = client.post(
            f"/api/v1/tools/plan/{plan_uuid}/cancel",
            headers=auth_headers,
            json={"reason": "Thesis invalidated by news"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "CANCELLED"
        assert data["cancelled"] is True
        assert mock_plan.status == "CANCELLED"
        mock_session.commit.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── Risk API Tests (4 Tools) ─────────────────────────────────────────────────

def test_risk_calculate_position_size(client: TestClient, auth_headers: dict[str, str]) -> None:
    # 10,000 equity, 2% risk budget = 200 USD
    # Entry = 50,000, Stop Loss = 49,000 -> Stop Distance = 1,000
    # Expected Position Size = 200 / 1,000 = 0.20 BTC
    # Position Value = 0.20 * 50,000 = 10,000 USD
    payload = {
        "total_equity": 10000.0,
        "risk_percent": 0.02,
        "entry_price": 50000.0,
        "stop_loss_price": 49000.0,
        "symbol": "BTC/USDT",
    }
    response = client.post("/api/v1/tools/risk/calculate_position_size", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["position_size"] == 0.2
    assert data["position_value"] == 10000.0
    assert data["risk_amount"] == 200.0
    assert data["stop_distance"] == 1000.0


def test_risk_calculate_exposure(client: TestClient, auth_headers: dict[str, str]) -> None:
    payload = {
        "total_equity": 10000.0,
        "cash_balance": 6000.0,
        "positions": [
            {"symbol": "BTC/USDT", "quantity": 0.04, "current_price": 50000.0},  # 2000 USD = 20%
            {"symbol": "ETH/USDT", "quantity": 0.5, "current_price": 4000.0},   # 2000 USD = 20%
        ],
    }
    response = client.post("/api/v1/tools/risk/calculate_exposure", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_exposure"] == 4000.0
    assert data["exposure_percent"] == 0.4
    assert data["asset_concentrations"]["BTC/USDT"] == 0.2
    assert data["asset_concentrations"]["ETH/USDT"] == 0.2
    assert data["within_limits"] is True


def test_risk_validate_plan_oversized_rejection(client: TestClient, auth_headers: dict[str, str]) -> None:
    """CRITICAL REQUIREMENT: Submitting an oversized plan to risk.validate_plan returns REJECTED status."""
    # Case 1: Oversized trade by huge quantity / notional exceeding concentration and cash
    oversized_payload = {
        "symbol": "BTC/USDT",
        "direction": "LONG",
        "quantity": 10.0,  # 10 BTC * 50,000 = 500,000 USD, vastly exceeds 10k equity!
        "entry_price": 50000.0,
        "stop_loss_price": 49000.0,
        "take_profit_price": 52000.0,
        "total_equity": 10000.0,
        "cash_balance": 10000.0,
    }
    response = client.post("/api/v1/tools/risk/validate_plan", headers=auth_headers, json=oversized_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "REJECTED"
    assert data["decision"] == "rejected"
    assert data["is_approved"] is False
    assert len(data["rule_codes"]) > 0

    # Case 2: Excessive portfolio drawdown halting buys
    drawdown_payload = {
        "symbol": "BTC/USDT",
        "direction": "LONG",
        "quantity": 0.01,
        "entry_price": 50000.0,
        "stop_loss_price": 49000.0,
        "take_profit_price": 53000.0,
        "total_equity": 10000.0,
        "cash_balance": 10000.0,
        "current_drawdown_percent": 0.15,  # 15% drawdown exceeds 10% limit!
    }
    resp_dd = client.post("/api/v1/tools/risk/validate_plan", headers=auth_headers, json=drawdown_payload)
    assert resp_dd.status_code == 200
    data_dd = resp_dd.json()
    assert data_dd["status"] == "REJECTED"
    assert "RULE_MAX_DRAWDOWN" in data_dd["rule_codes"]

    # Case 3: Compliant trade within limits is APPROVED
    compliant_payload = {
        "symbol": "BTC/USDT",
        "direction": "LONG",
        "quantity": 0.02,  # 1000 USD = 10% concentration, stop distance 1000 -> risk 20 USD = 0.2%
        "entry_price": 50000.0,
        "stop_loss_price": 49000.0,
        "take_profit_price": 53000.0,
        "total_equity": 10000.0,
        "cash_balance": 10000.0,
    }
    resp_comp = client.post("/api/v1/tools/risk/validate_plan", headers=auth_headers, json=compliant_payload)
    assert resp_comp.status_code == 200
    data_comp = resp_comp.json()
    assert data_comp["status"] == "APPROVED"
    assert data_comp["is_approved"] is True
    assert data_comp["decision"] == "approved"


def test_risk_check_portfolio_risk(client: TestClient, auth_headers: dict[str, str]) -> None:
    # 1. Safe portfolio
    safe_payload = {
        "total_equity": 10000.0,
        "cash_balance": 8000.0,
        "current_drawdown_percent": 0.02,
        "open_positions": {
            "BTC/USDT": {"quantity": 0.02, "current_price": 50000.0}
        },
        "kill_switch_active": False,
    }
    resp_safe = client.post("/api/v1/tools/risk/check_portfolio_risk", headers=auth_headers, json=safe_payload)
    assert resp_safe.status_code == 200
    data_safe = resp_safe.json()
    assert data_safe["status"] == "SAFE"
    assert data_safe["can_trade"] is True
    assert len(data_safe["violations"]) == 0

    # 2. Critical portfolio with Kill Switch
    halted_payload = {
        "total_equity": 10000.0,
        "cash_balance": 8000.0,
        "kill_switch_active": True,
    }
    resp_halt = client.post("/api/v1/tools/risk/check_portfolio_risk", headers=auth_headers, json=halted_payload)
    assert resp_halt.status_code == 200
    data_halt = resp_halt.json()
    assert data_halt["status"] == "CRITICAL"
    assert data_halt["can_trade"] is False
    assert "RULE_KILL_SWITCH_ACTIVE" in data_halt["violations"]

    # 3. Critical portfolio with excess drawdown
    dd_payload = {
        "total_equity": 8000.0,
        "peak_equity": 10000.0,
        "current_drawdown_percent": 0.20,
    }
    resp_crit = client.post("/api/v1/tools/risk/check_portfolio_risk", headers=auth_headers, json=dd_payload)
    assert resp_crit.status_code == 200
    data_crit = resp_crit.json()
    assert data_crit["status"] == "CRITICAL"
    assert "RULE_MAX_DRAWDOWN" in data_crit["violations"]


# ── HermesToolsClient Integration Tests for Plan & Risk ───────────────────────

def test_hermes_tools_client_plan_and_risk() -> None:
    mock_post = MagicMock()
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"status": "SUCCESS"}

    mock_get = MagicMock()
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"status": "SUCCESS"}

    mock_patch = MagicMock()
    mock_patch.return_value.status_code = 200
    mock_patch.return_value.json.return_value = {"status": "SUCCESS"}

    with patch("httpx.Client.post", mock_post), patch("httpx.Client.get", mock_get), patch("httpx.Client.patch", mock_patch):
        client = HermesToolsClient(base_url="http://test", token="mock-token")

        # Plan Tools
        client.plan.create(symbol="BTC/USDT", direction="LONG")
        assert mock_post.call_args[0][0] == "/api/v1/tools/plan/create"

        client.plan.get(plan_id=str(uuid.uuid4()))
        assert mock_get.call_args[0][0].startswith("/api/v1/tools/plan/")

        client.plan.update(plan_id=str(uuid.uuid4()), entry_price=51000.0)
        assert mock_patch.call_args[0][0].startswith("/api/v1/tools/plan/")

        client.plan.validate(symbol="BTC/USDT", direction="LONG", entry_price=50000.0, stop_loss_price=49000.0)
        assert mock_post.call_args[0][0] == "/api/v1/tools/plan/validate"

        client.plan.cancel(plan_id=str(uuid.uuid4()))
        assert mock_post.call_args[0][0].endswith("/cancel")

        # Risk API Tools
        client.risk.calculate_position_size(total_equity=10000.0, entry_price=50000.0, stop_loss_price=49000.0)
        assert mock_post.call_args[0][0] == "/api/v1/tools/risk/calculate_position_size"

        client.risk.calculate_exposure(total_equity=10000.0, cash_balance=10000.0)
        assert mock_post.call_args[0][0] == "/api/v1/tools/risk/calculate_exposure"

        client.risk.validate_plan(symbol="BTC/USDT", quantity=0.01)
        assert mock_post.call_args[0][0] == "/api/v1/tools/risk/validate_plan"

        client.risk.check_portfolio_risk(total_equity=10000.0)
        assert mock_post.call_args[0][0] == "/api/v1/tools/risk/check_portfolio_risk"

        # execute_tool mappings
        client.execute_tool("plan.create", symbol="BTC/USDT", direction="LONG")
        client.execute_tool("plan.get", plan_id=str(uuid.uuid4()))
        client.execute_tool("plan.update", plan_id=str(uuid.uuid4()), entry_price=52000.0)
        client.execute_tool("plan.validate", symbol="BTC/USDT", direction="LONG")
        client.execute_tool("plan.cancel", plan_id=str(uuid.uuid4()))
        client.execute_tool("risk.calculate_position_size", total_equity=10000.0, entry_price=50000.0, stop_loss_price=49000.0)
        client.execute_tool("risk.calculate_exposure", total_equity=10000.0, cash_balance=10000.0)
        client.execute_tool("risk.validate_plan", symbol="BTC/USDT")
        client.execute_tool("risk.check_portfolio_risk", total_equity=10000.0)
