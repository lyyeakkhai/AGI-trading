from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch
import uuid

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from packages.config.settings import get_settings
from packages.database.engine import get_db_session
from packages.database.models.audit_decision import AuditDecisionModel
from packages.database.models.portfolio import TradeModel
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


# ── Auth Tests ───────────────────────────────────────────────────────────────


def test_audit_tools_require_auth(client: TestClient) -> None:
    res = client.post("/api/v1/tools/decision/log", json={})
    assert res.status_code == 403

    res = client.get("/api/v1/tools/decision/history")
    assert res.status_code == 403

    res = client.get("/api/v1/tools/trade/history")
    assert res.status_code == 403


# ── Decision Tools Tests ─────────────────────────────────────────────────────


def test_create_decision_log(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    plan_id = str(uuid.uuid4())
    payload = {
        "snapshot": {"symbol": "BTC/USDT", "price": 64500.0, "rsi": 58.2},
        "drawings": [{"type": "zone", "coordinates": {"start_price": 64000, "end_price": 64200}}],
        "plan_id": plan_id,
        "risk_result": {"decision": "APPROVED", "risk_score": 0.04},
        "execution_result": {"status": "FILLED", "order_id": str(uuid.uuid4())},
    }

    try:
        res = client.post("/api/v1/tools/decision/log", headers=auth_headers, json=payload)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        assert data["plan_id"] == plan_id
        assert data["snapshot"]["price"] == 64500.0
        assert len(data["drawings"]) == 1
        assert data["risk_result"]["decision"] == "APPROVED"
        assert data["execution_result"]["status"] == "FILLED"
        assert "created_at" in data
        mock_session.add.assert_called_once()
        mock_session.commit.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_create_decision_log_minimal(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    payload = {
        "snapshot": {"symbol": "ETH/USDT", "price": 3200.0},
    }

    try:
        res = client.post("/api/v1/tools/decision/log", headers=auth_headers, json=payload)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        assert data["plan_id"] is None
        assert data["drawings"] == []
        assert data["risk_result"] is None
        assert data["execution_result"] is None
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_get_decision_history(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    plan_id = uuid.uuid4()
    mock_record1 = AuditDecisionModel(
        id=uuid.uuid4(),
        plan_id=plan_id,
        snapshot={"symbol": "BTC/USDT", "price": 65000.0},
        drawings=[],
        risk_result={"decision": "APPROVED"},
        execution_result=None,
        created_at=datetime.now(UTC),
    )
    mock_record2 = AuditDecisionModel(
        id=uuid.uuid4(),
        plan_id=plan_id,
        snapshot={"symbol": "BTC/USDT", "price": 64800.0},
        drawings=[],
        risk_result={"decision": "REJECTED"},
        execution_result=None,
        created_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        exec_mock = MagicMock()
        exec_mock.scalars.return_value.all.return_value = [mock_record1, mock_record2]
        mock_session.execute = AsyncMock(return_value=exec_mock)

        res = client.get("/api/v1/tools/decision/history", headers=auth_headers, params={"plan_id": str(plan_id), "limit": 10})
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == 2
        assert len(data["decisions"]) == 2
        assert data["decisions"][0]["plan_id"] == str(plan_id)
        assert data["decisions"][0]["snapshot"]["price"] == 65000.0
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── Trade History Tools Tests ────────────────────────────────────────────────


def test_get_trade_history(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_trade1 = TradeModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        side="buy",
        quantity=Decimal("1.0"),
        entry_price=Decimal("60000.0"),
        exit_price=None,
        realized_pnl=None,
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        opened_at=datetime.now(UTC),
        closed_at=None,
    )
    mock_trade2 = TradeModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        side="sell",
        quantity=Decimal("1.0"),
        entry_price=Decimal("60000.0"),
        exit_price=Decimal("64000.0"),
        realized_pnl=Decimal("4000.0"),
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        opened_at=datetime.now(UTC),
        closed_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        exec_mock = MagicMock()
        exec_mock.scalars.return_value.all.return_value = [mock_trade2, mock_trade1]
        mock_session.execute = AsyncMock(return_value=exec_mock)

        res = client.get("/api/v1/tools/trade/history", headers=auth_headers, params={"symbol": "BTC/USDT", "trading_mode": "paper"})
        assert res.status_code == 200
        data = res.json()
        assert data["trading_mode"] == "paper"
        assert data["count"] == 2
        assert len(data["trades"]) == 2
        assert data["trades"][0]["symbol"] == "BTC/USDT"
        assert data["trades"][0]["realized_pnl"] == "4000.0"
        assert data["trades"][1]["realized_pnl"] is None
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── HermesToolsClient Dispatch Tests ─────────────────────────────────────────


def test_hermes_tools_client_audit_and_trade(client: TestClient) -> None:
    hermes_client = HermesToolsClient(base_url="http://testserver", token="test-hermes-token")
    client.headers.update(hermes_client.headers)
    hermes_client.client = client

    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()

    record_id = uuid.uuid4()
    mock_record = AuditDecisionModel(
        id=record_id,
        plan_id=None,
        snapshot={"symbol": "SOL/USDT", "price": 145.0},
        drawings=[],
        risk_result={"decision": "APPROVED"},
        execution_result=None,
        created_at=datetime.now(UTC),
    )

    trade_id = uuid.uuid4()
    mock_trade = TradeModel(
        id=trade_id,
        account_id=uuid.uuid4(),
        symbol="SOL/USDT",
        side="buy",
        quantity=Decimal("10.0"),
        entry_price=Decimal("140.0"),
        exit_price=None,
        realized_pnl=None,
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        opened_at=datetime.now(UTC),
        closed_at=None,
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        # 1. decision.create_log via namespace
        res1 = hermes_client.decision.create_log(
            snapshot={"symbol": "SOL/USDT", "price": 145.0},
            drawings=[],
        )
        assert "id" in res1
        assert res1["snapshot"]["price"] == 145.0

        # 2. decision.create_log via execute_tool
        res2 = hermes_client.execute_tool(
            "decision.create_log",
            snapshot={"symbol": "SOL/USDT", "price": 145.0},
            drawings=[],
        )
        assert "id" in res2

        # 3. decision.get_history via namespace & execute_tool
        exec_hist = MagicMock()
        exec_hist.scalars.return_value.all.return_value = [mock_record]
        mock_session.execute = AsyncMock(return_value=exec_hist)

        h1 = hermes_client.decision.get_history(limit=5)
        assert h1["count"] == 1
        assert h1["decisions"][0]["snapshot"]["price"] == 145.0

        h2 = hermes_client.execute_tool("decision.get_history", limit=5)
        assert h2["count"] == 1

        # 4. trade.get_history via namespace & execute_tool
        exec_trade = MagicMock()
        exec_trade.scalars.return_value.all.return_value = [mock_trade]
        mock_session.execute = AsyncMock(return_value=exec_trade)

        t1 = hermes_client.trade.get_history(symbol="SOL/USDT", trading_mode="paper")
        assert t1["count"] == 1
        assert t1["trades"][0]["symbol"] == "SOL/USDT"

        t2 = hermes_client.execute_tool("trade.get_history", symbol="SOL/USDT", trading_mode="paper")
        assert t2["count"] == 1
    finally:
        app.dependency_overrides.pop(get_db_session, None)
