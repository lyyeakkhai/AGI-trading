from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
import pytest

from apps.api.main import app
from apps.api.routers.risk import get_db_session, verify_owner_authorization
from packages.database.models.relational import RiskConfigVersionModel, RiskDecisionModel


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_get_risk_config(client: TestClient) -> None:
    mock_session = AsyncMock()
    mock_record = RiskConfigVersionModel(
        id=uuid.uuid4(),
        version=1,
        config={
            "spot_only": True,
            "leverage_enabled": False,
            "max_risk_per_trade_percent": "0.02",
        },
        created_at=datetime.now(timezone.utc),
        created_by="system",
    )

    async def override_get_db() -> AsyncMock:
        yield mock_session

    app.dependency_overrides[get_db_session] = override_get_db

    with patch("apps.api.routers.risk.risk_repository.get_latest_config_version", new=AsyncMock(return_value=mock_record)):
        response = client.get("/api/v1/risk/config")
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == 1
        assert data["config"]["spot_only"] is True

    app.dependency_overrides.clear()


def test_update_risk_config_owner_success(client: TestClient) -> None:
    mock_session = AsyncMock()
    mock_record = RiskConfigVersionModel(
        id=uuid.uuid4(),
        version=2,
        config={
            "spot_only": True,
            "leverage_enabled": False,
            "max_risk_per_trade_percent": "0.01",
        },
        created_at=datetime.now(timezone.utc),
        created_by="owner",
    )

    async def override_get_db() -> AsyncMock:
        yield mock_session

    def override_verify_owner() -> str:
        return "owner"

    app.dependency_overrides[get_db_session] = override_get_db
    app.dependency_overrides[verify_owner_authorization] = override_verify_owner

    with patch("apps.api.routers.risk.risk_repository.add_new_version", new=AsyncMock(return_value=mock_record)):
        payload = {
            "config": {
                "spot_only": True,
                "leverage_enabled": False,
                "max_risk_per_trade_percent": "0.01",
            },
            "created_by": "owner",
        }
        response = client.post("/api/v1/risk/config", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["version"] == 2

    app.dependency_overrides.clear()


def test_update_risk_config_rejects_leverage(client: TestClient) -> None:
    mock_session = AsyncMock()

    async def override_get_db() -> AsyncMock:
        yield mock_session

    def override_verify_owner() -> str:
        return "owner"

    app.dependency_overrides[get_db_session] = override_get_db
    app.dependency_overrides[verify_owner_authorization] = override_verify_owner

    payload = {
        "config": {
            "spot_only": True,
            "leverage_enabled": True,  # Invalid
        },
        "created_by": "owner",
    }
    response = client.post("/api/v1/risk/config", json=payload)
    assert response.status_code == 400

    app.dependency_overrides.clear()


def test_kill_switch_endpoints(client: TestClient) -> None:
    mock_session = AsyncMock()

    async def override_get_db() -> AsyncMock:
        yield mock_session

    def override_verify_owner() -> str:
        return "owner"

    app.dependency_overrides[get_db_session] = override_get_db
    app.dependency_overrides[verify_owner_authorization] = override_verify_owner

    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_res

    # GET
    res_get = client.get("/api/v1/risk/kill-switch")
    assert res_get.status_code == 200
    assert res_get.json()["active"] is False

    # POST
    res_post = client.post(
        "/api/v1/risk/kill-switch",
        json={"active": True, "reason": "Market anomaly detected"},
    )
    assert res_post.status_code == 200
    assert res_post.json()["active"] is True

    app.dependency_overrides.clear()
