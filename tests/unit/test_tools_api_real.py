from __future__ import annotations

import uuid
from datetime import UTC, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from packages.config.settings import get_settings
from packages.database.engine import get_db_session
from packages.database.models.hypertables import IndicatorSnapshotModel, MarketCandleModel
from packages.database.models.portfolio import (
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from packages.database.models.relational import AgentObservationModel
from packages.exchange.models import OHLCVCandle, Ticker


@pytest.fixture(autouse=True)
def mock_app_settings():
    real_settings = get_settings()
    mock_s = MagicMock(wraps=real_settings)

    mock_hermes = MagicMock()
    mock_hermes.service_token = "test-hermes-token"
    mock_s.hermes = mock_hermes

    mock_ta = MagicMock()
    mock_ta.service_token = "test-ta-token"
    mock_ta.base_url = "http://tradingagents:8002"
    mock_ta.timeout_seconds = 30
    mock_s.trading_agents = mock_ta

    app.dependency_overrides[get_settings] = lambda: mock_s
    yield mock_s
    app.dependency_overrides.pop(get_settings, None)


@pytest.fixture
def auth_headers() -> dict[str, str]:
    return {"Authorization": "Bearer test-hermes-token"}


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_proposal_create_routes_to_risk_engine(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    mock_decision = MagicMock()
    mock_decision.decision = "approved"
    mock_decision.rule_codes = ["RULE_APPROVED"]
    mock_decision.risk_score = Decimal("0.05")

    payload = {
        "symbol": "BTC/USDT",
        "direction": "long",
        "quantity": "1.0",
        "entry": "50000",
        "stop_loss": "49000",
        "take_profit": "52000",
        "supporting_evidence": ["Bullish trend"],
        "contradicting_evidence": [],
        "invalidation_rules": ["Below 49000"],
    }

    try:
        with patch(
            "apps.api.routers.tools.risk_orchestrator.evaluate_proposal",
            new=AsyncMock(return_value=mock_decision),
        ) as mock_eval:
            response = client.post(
                "/api/v1/tools/proposal/create", headers=auth_headers, json=payload
            )
            assert response.status_code == 201
            data = response.json()
            assert "decision" in data or "status" in data
            assert data.get("decision") == "approved"
            assert data.get("status") == "PENDING_APPROVAL"
            assert "proposal_id" in data
            assert data["proposal_id"] != "prop_123"
            assert data["approved_quantity"] == "1.0"
            mock_eval.assert_awaited_once()
            mock_session.commit.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_proposal_create_missing_symbol_returns_400(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post("/api/v1/tools/proposal/create", headers=auth_headers, json={})
    assert response.status_code == 400


def test_proposal_create_invalid_quantity_returns_400(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/v1/tools/proposal/create",
        headers=auth_headers,
        json={"symbol": "BTC/USDT", "quantity": "-5"},
    )
    assert response.status_code == 400


def test_proposal_create_invalid_limit_price_returns_400(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/v1/tools/proposal/create",
        headers=auth_headers,
        json={"symbol": "BTC/USDT", "quantity": "1.0", "order_type": "limit", "limit_price": "-10"},
    )
    assert response.status_code == 400


def test_proposal_create_modified_and_rejected_status(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    # 1. Test modified
    mock_modified = MagicMock()
    mock_modified.decision = "modified"
    mock_modified.rule_codes = ["RULE_MODIFIED_SIZE"]
    mock_modified.risk_score = Decimal("0.12")
    mock_modified.approved_quantity = Decimal("0.5")

    payload = {"symbol": "BTC/USDT", "direction": "long", "quantity": "1.0"}

    try:
        with patch(
            "apps.api.routers.tools.risk_orchestrator.evaluate_proposal",
            new=AsyncMock(return_value=mock_modified),
        ):
            response = client.post(
                "/api/v1/tools/proposal/create", headers=auth_headers, json=payload
            )
            assert response.status_code == 201
            assert response.json()["decision"] == "modified"
            assert response.json()["status"] == "PENDING_APPROVAL"
            assert response.json()["approved_quantity"] == "0.5"

        # 2. Test rejected
        mock_rejected = MagicMock()
        mock_rejected.decision = "rejected"
        mock_rejected.rule_codes = ["RULE_MAX_RISK_PER_TRADE"]
        mock_rejected.risk_score = Decimal("0.95")

        with patch(
            "apps.api.routers.tools.risk_orchestrator.evaluate_proposal",
            new=AsyncMock(return_value=mock_rejected),
        ):
            response = client.post(
                "/api/v1/tools/proposal/create", headers=auth_headers, json=payload
            )
            assert response.status_code == 201
            assert response.json()["decision"] == "rejected"
            assert response.json()["status"] == "REJECTED"
            assert response.json()["approved_quantity"] == "0"
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_get_market_price_from_timescaledb(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    mock_candle = MarketCandleModel(
        symbol="BTC/USDT",
        timeframe="1m",
        timestamp=datetime(2026, 9, 5, 12, 0, 0, tzinfo=UTC),
        open=Decimal("51000.0"),
        high=Decimal("51500.0"),
        low=Decimal("50900.0"),
        close=Decimal("51200.0"),
        volume=Decimal("10.5"),
        is_closed=True,
        trading_mode="paper",
    )
    scalar_result = MagicMock()
    scalar_result.scalar_one_or_none.return_value = mock_candle
    mock_session.execute = AsyncMock(return_value=scalar_result)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        response = client.get("/api/v1/tools/market/price?symbol=BTC/USDT", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "BTC/USDT"
        assert data["price"] == 51200.0
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_get_market_price_fallback_to_ccxt(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    scalar_result = MagicMock()
    scalar_result.scalar_one_or_none.return_value = None
    mock_session.execute = AsyncMock(return_value=scalar_result)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    mock_ticker = Ticker(
        symbol="BTC/USDT",
        bid=Decimal("51900.0"),
        ask=Decimal("52100.0"),
        last=Decimal("52000.0"),
        volume=Decimal("150.0"),
        timestamp=datetime(2026, 9, 5, 12, 5, 0, tzinfo=UTC),
    )

    with patch("apps.api.routers.tools.get_binance_adapter") as mock_get_adapter:
        mock_adapter = MagicMock()
        mock_adapter.get_ticker = AsyncMock(return_value=mock_ticker)
        mock_get_adapter.return_value = mock_adapter

        try:
            response = client.get(
                "/api/v1/tools/market/price?symbol=BTC/USDT", headers=auth_headers
            )
            assert response.status_code == 200
            data = response.json()
            assert data["symbol"] == "BTC/USDT"
            assert data["price"] == 52000.0
        finally:
            app.dependency_overrides.pop(get_db_session, None)


def test_get_market_price_dual_failure_fails_closed(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    scalar_result = MagicMock()
    scalar_result.scalar_one_or_none.return_value = None
    mock_session.execute = AsyncMock(return_value=scalar_result)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    with patch("apps.api.routers.tools.get_binance_adapter") as mock_get_adapter:
        mock_adapter = MagicMock()
        mock_adapter.get_ticker = AsyncMock(side_effect=Exception("Exchange down"))
        mock_get_adapter.return_value = mock_adapter

        try:
            response = client.get(
                "/api/v1/tools/market/price?symbol=BTC/USDT", headers=auth_headers
            )
            assert response.status_code == 503
            assert "Market price unavailable" in response.json()["detail"]
        finally:
            app.dependency_overrides.pop(get_db_session, None)


def test_get_market_candles_from_timescaledb(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    mock_candle = MarketCandleModel(
        symbol="BTC/USDT",
        timeframe="1h",
        timestamp=datetime(2026, 9, 5, 12, 0, 0, tzinfo=UTC),
        open=Decimal("50000.0"),
        high=Decimal("51000.0"),
        low=Decimal("49500.0"),
        close=Decimal("50800.0"),
        volume=Decimal("100.0"),
        is_closed=True,
        trading_mode="paper",
    )
    scalars_mock = MagicMock()
    scalars_mock.scalars.return_value.all.return_value = [mock_candle]
    mock_session.execute = AsyncMock(return_value=scalars_mock)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        response = client.get(
            "/api/v1/tools/market/candles?symbol=BTC/USDT&timeframe=1h", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "BTC/USDT"
        assert data["timeframe"] == "1h"
        assert len(data["candles"]) == 1
        assert data["candles"][0]["close"] == 50800.0
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_get_market_candles_fallback_to_ccxt(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    scalars_mock = MagicMock()
    scalars_mock.scalars.return_value.all.return_value = []
    mock_session.execute = AsyncMock(return_value=scalars_mock)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    mock_candle = OHLCVCandle(
        symbol="BTC/USDT",
        timeframe="1h",
        timestamp=datetime(2026, 9, 5, 12, 0, 0, tzinfo=UTC),
        open=Decimal("50100.0"),
        high=Decimal("50900.0"),
        low=Decimal("49900.0"),
        close=Decimal("50750.0"),
        volume=Decimal("42.0"),
        is_closed=True,
    )

    with patch("apps.api.routers.tools.get_binance_adapter") as mock_get_adapter:
        mock_adapter = MagicMock()
        mock_adapter.get_candles = AsyncMock(return_value=[mock_candle])
        mock_get_adapter.return_value = mock_adapter

        try:
            response = client.get(
                "/api/v1/tools/market/candles?symbol=BTC/USDT&timeframe=1h", headers=auth_headers
            )
            assert response.status_code == 200
            data = response.json()
            assert data["symbol"] == "BTC/USDT"
            assert len(data["candles"]) == 1
            assert data["candles"][0]["close"] == 50750.0
        finally:
            app.dependency_overrides.pop(get_db_session, None)


def test_get_analytics_indicators_from_db(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_snap = IndicatorSnapshotModel(
        symbol="BTC/USDT",
        timeframe="1h",
        timestamp=datetime(2026, 9, 5, 12, 0, 0, tzinfo=UTC),
        indicators={"rsi": 62.5, "macd": 2.4},
        trading_mode="paper",
    )
    scalar_res = MagicMock()
    scalar_res.scalar_one_or_none.return_value = mock_snap
    mock_session.execute = AsyncMock(return_value=scalar_res)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        response = client.get(
            "/api/v1/tools/analytics/indicators?symbol=BTC/USDT", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "BTC/USDT"
        assert data["indicators"]["rsi"] == 62.5
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_get_analytics_indicators_not_found_fails_closed(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    scalar_res = MagicMock()
    scalar_res.scalar_one_or_none.return_value = None
    mock_session.execute = AsyncMock(return_value=scalar_res)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        response = client.get(
            "/api/v1/tools/analytics/indicators?symbol=BTC/USDT", headers=auth_headers
        )
        assert response.status_code == 404
        assert "Indicators not found" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_get_portfolio_positions_returns_real_data(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(
        id=account_id,
        name="Test Account",
        trading_mode="paper",
        created_at=datetime.now(UTC),
    )
    mock_entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("15000.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )
    mock_pos = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("0.5"),
        average_entry_price=Decimal("50000.0"),
        realized_pnl=Decimal("100.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    with patch(
        "apps.api.routers.tools.portfolio_engine.get_or_create_account",
        new=AsyncMock(return_value=mock_account),
    ):
        exec_entry = MagicMock()
        exec_entry.scalars.return_value.all.return_value = [mock_entry]

        exec_pos = MagicMock()
        exec_pos.scalars.return_value.all.return_value = [mock_pos]

        mock_session.execute = AsyncMock(side_effect=[exec_entry, exec_pos])

        try:
            response = client.get("/api/v1/tools/portfolio/positions", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert "positions" in data
            assert len(data["positions"]) == 1
            assert data["positions"][0]["symbol"] == "BTC/USDT"
            assert data["positions"][0]["quantity"] == "0.5"
            assert "balances" in data
            assert data["balances"]["USDT"] == "15000.0"
        finally:
            app.dependency_overrides.pop(get_db_session, None)


def test_get_portfolio_positions_unseeded_returns_empty_balances(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(
        id=account_id,
        name="Empty Account",
        trading_mode="paper",
        created_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    with patch(
        "apps.api.routers.tools.portfolio_engine.get_or_create_account",
        new=AsyncMock(return_value=mock_account),
    ):
        exec_entry = MagicMock()
        exec_entry.scalars.return_value.all.return_value = []

        exec_pos = MagicMock()
        exec_pos.scalars.return_value.all.return_value = []

        mock_session.execute = AsyncMock(side_effect=[exec_entry, exec_pos])

        try:
            response = client.get("/api/v1/tools/portfolio/positions", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert data["positions"] == []
            assert data["balances"] == {}
        finally:
            app.dependency_overrides.pop(get_db_session, None)


def test_get_portfolio_positions_db_error_fails_closed(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    async def override_db():
        yield AsyncMock()

    app.dependency_overrides[get_db_session] = override_db

    with patch(
        "apps.api.routers.tools.portfolio_engine.get_or_create_account",
        new=AsyncMock(side_effect=Exception("DB connection error")),
    ):
        try:
            response = client.get("/api/v1/tools/portfolio/positions", headers=auth_headers)
            assert response.status_code == 503
            assert "Portfolio engine unavailable" in response.json()["detail"]
        finally:
            app.dependency_overrides.pop(get_db_session, None)


def test_store_memory_persists_observation(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    payload = {
        "agent_id": "hermes",
        "observation_type": "trade_reflection",
        "content": {"insight": "BTC consolidated around 50k support"},
        "trading_mode": "paper",
    }

    try:
        response = client.post("/api/v1/tools/memory/store", headers=auth_headers, json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "stored"
        assert "observation_id" in data
        mock_session.add.assert_called_once()
        saved_obj = mock_session.add.call_args[0][0]
        assert isinstance(saved_obj, AgentObservationModel)
        assert saved_obj.agent_id == "hermes"
        assert saved_obj.content == payload["content"]
        mock_session.commit.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_search_memory_queries_observations(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    mock_session = AsyncMock()
    mock_obs = AgentObservationModel(
        id=uuid.uuid4(),
        agent_id="hermes",
        observation_type="reflection",
        content={"summary": "Breakout above 52k failed"},
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        observed_at=datetime(2026, 9, 5, 12, 0, 0, tzinfo=UTC),
    )
    scalars_mock = MagicMock()
    scalars_mock.scalars.return_value.all.return_value = [mock_obs]
    mock_session.execute = AsyncMock(return_value=scalars_mock)

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        response = client.get("/api/v1/tools/memory/search?query=Breakout", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 1
        assert "52k" in str(data["results"][0]["content"])
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_deep_analyze_proxies_to_tradingagents(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    payload = {"symbol": "BTC/USDT", "timeframe": "1h", "context": "Test context"}
    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json = MagicMock(
        return_value={"symbol": "BTC/USDT", "status": "completed", "summary": "Bullish"}
    )

    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_response)) as mock_post:
        response = client.post(
            "/api/v1/tools/research/deep_analyze", headers=auth_headers, json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["summary"] == "Bullish"
        mock_post.assert_awaited_once()


def test_deep_analyze_error_returns_502(client: TestClient, auth_headers: dict[str, str]) -> None:
    payload = {"symbol": "BTC/USDT", "timeframe": "1h", "context": "Test context"}

    with patch(
        "httpx.AsyncClient.post",
        new=AsyncMock(side_effect=httpx.ConnectError("Service unreachable")),
    ):
        response = client.post(
            "/api/v1/tools/research/deep_analyze", headers=auth_headers, json=payload
        )
        assert response.status_code == 502
        assert "TradingAgents error" in response.json()["detail"]
