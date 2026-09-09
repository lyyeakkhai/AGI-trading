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
from packages.database.models.portfolio import (
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from packages.database.models.relational import FillModel, OrderModel
from packages.exchange.models import Ticker
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


def test_execution_and_position_require_auth(client: TestClient) -> None:
    res = client.get("/api/v1/tools/execution/balance")
    assert res.status_code == 403

    res = client.get("/api/v1/tools/execution/positions")
    assert res.status_code == 403

    res = client.get("/api/v1/tools/execution/orders/open")
    assert res.status_code == 403

    res = client.post("/api/v1/tools/execution/order", json={})
    assert res.status_code == 403

    res = client.get("/api/v1/tools/position?symbol=BTC/USDT")
    assert res.status_code == 403

    res = client.get("/api/v1/tools/position/monitor")
    assert res.status_code == 403

    res = client.post("/api/v1/tools/position/close", json={})
    assert res.status_code == 403


# ── Execution Balance Tests ──────────────────────────────────────────────────


def test_get_execution_balance_paper(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(
        id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC)
    )
    mock_entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("50000.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)):
            exec_mock = MagicMock()
            exec_mock.scalars.return_value.all.return_value = [mock_entry]
            mock_session.execute = AsyncMock(return_value=exec_mock)

            res = client.get("/api/v1/tools/execution/balance", headers=auth_headers, params={"trading_mode": "paper"})
            assert res.status_code == 200
            data = res.json()
            assert data["trading_mode"] == "paper"
            assert "USDT" in data["balances"]
            assert data["balances"]["USDT"]["total"] == 50000.0
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_get_execution_balance_testnet(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        mock_live = AsyncMock()
        mock_live.get_portfolio.return_value = {"USDT": 12500.0, "BTC": 0.5}
        with patch("apps.api.routers.execution_tools.get_live_adapter", return_value=mock_live):
            res = client.get("/api/v1/tools/execution/balance", headers=auth_headers, params={"trading_mode": "testnet"})
            assert res.status_code == 200
            data = res.json()
            assert data["trading_mode"] == "testnet"
            assert data["balances"]["USDT"]["total"] == 12500.0
            assert data["balances"]["BTC"]["total"] == 0.5
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── Execution Positions Tests ────────────────────────────────────────────────


def test_get_execution_positions_paper(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC))
    mock_pos = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("1.5"),
        average_entry_price=Decimal("60000.0"),
        realized_pnl=Decimal("250.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)), \
             patch("apps.api.routers.execution_tools._get_current_price", new=AsyncMock(return_value=Decimal("65000.0"))):
            exec_mock = MagicMock()
            exec_mock.scalars.return_value.all.return_value = [mock_pos]
            mock_session.execute = AsyncMock(return_value=exec_mock)

            res = client.get("/api/v1/tools/execution/positions", headers=auth_headers, params={"trading_mode": "paper"})
            assert res.status_code == 200
            data = res.json()
            assert data["trading_mode"] == "paper"
            assert len(data["positions"]) == 1
            pos = data["positions"][0]
            assert pos["symbol"] == "BTC/USDT"
            assert pos["quantity"] == "1.5"
            assert pos["average_entry_price"] == "60000.0"
            assert pos["current_price"] == "65000.0"
            assert Decimal(pos["unrealized_pnl"]) == Decimal("7500.0")  # (65000 - 60000) * 1.5
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── Execution Open Orders Tests ──────────────────────────────────────────────


def test_get_execution_open_orders(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_order = OrderModel(
        id=uuid.uuid4(),
        execution_request_id=uuid.uuid4(),
        client_order_id="limit_ord_1",
        symbol="BTC/USDT",
        side="buy",
        order_type="limit",
        quantity=Decimal("0.5"),
        filled_quantity=Decimal("0"),
        limit_price=Decimal("59000.0"),
        status="OPEN",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        exec_mock = MagicMock()
        exec_mock.scalars.return_value.all.return_value = [mock_order]
        mock_session.execute = AsyncMock(return_value=exec_mock)

        res = client.get("/api/v1/tools/execution/orders/open", headers=auth_headers, params={"trading_mode": "paper"})
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == 1
        assert data["orders"][0]["client_order_id"] == "limit_ord_1"
        assert data["orders"][0]["status"] == "OPEN"
        assert data["orders"][0]["limit_price"] == "59000.0"
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── Place Order Tests ────────────────────────────────────────────────────────


def test_place_execution_order_paper_market_buy(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    mock_fill = {
        "exchange_trade_id": "paper_trade_123",
        "symbol": "BTC/USDT",
        "side": "buy",
        "price": Decimal("64000.0"),
        "quantity": Decimal("0.25"),
        "fee": Decimal("16.0"),
        "fee_asset": "USDT",
        "executed_at": datetime.now(UTC),
    }

    try:
        with patch("services.execution.paper.PaperExecutionAdapter.execute_market_order", new=AsyncMock(return_value=mock_fill)), \
             patch("apps.api.routers.execution_tools.portfolio_engine.process_fill", new=AsyncMock()) as mock_proc:
            payload = {
                "symbol": "BTC/USDT",
                "side": "buy",
                "order_type": "market",
                "quantity": "0.25",
                "trading_mode": "paper",
            }
            res = client.post("/api/v1/tools/execution/order", headers=auth_headers, json=payload)
            assert res.status_code == 201
            data = res.json()
            assert data["status"] == "FILLED"
            assert data["symbol"] == "BTC/USDT"
            assert data["side"] == "buy"
            assert data["filled_quantity"] == "0.25"
            assert len(data["fills"]) == 1
            assert data["fills"][0]["exchange_trade_id"] == "paper_trade_123"
            mock_proc.assert_awaited_once()
            mock_session.commit.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_place_execution_order_paper_limit_resting(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        # None indicates resting unfilled limit order
        with patch("services.execution.paper.PaperExecutionAdapter.execute_limit_order", new=AsyncMock(return_value=None)):
            payload = {
                "symbol": "BTC/USDT",
                "side": "buy",
                "order_type": "limit",
                "quantity": "0.1",
                "limit_price": "50000.0",
                "trading_mode": "paper",
            }
            res = client.post("/api/v1/tools/execution/order", headers=auth_headers, json=payload)
            assert res.status_code == 201
            data = res.json()
            assert data["status"] == "OPEN"
            assert data["filled_quantity"] == "0"
            assert len(data["fills"]) == 0
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_place_execution_order_validation_errors(client: TestClient, auth_headers: dict[str, str]) -> None:
    # Invalid side
    res = client.post(
        "/api/v1/tools/execution/order",
        headers=auth_headers,
        json={"symbol": "BTC/USDT", "side": "invalid", "quantity": "1.0"},
    )
    assert res.status_code == 400

    # Invalid order_type
    res = client.post(
        "/api/v1/tools/execution/order",
        headers=auth_headers,
        json={"symbol": "BTC/USDT", "side": "buy", "order_type": "stop", "quantity": "1.0"},
    )
    assert res.status_code == 400

    # Limit order without price
    res = client.post(
        "/api/v1/tools/execution/order",
        headers=auth_headers,
        json={"symbol": "BTC/USDT", "side": "buy", "order_type": "limit", "quantity": "1.0"},
    )
    assert res.status_code == 400


# ── Cancel Order Tests ───────────────────────────────────────────────────────


def test_cancel_execution_order_success(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    order_id = uuid.uuid4()
    mock_order = OrderModel(
        id=order_id,
        execution_request_id=uuid.uuid4(),
        client_order_id="client_ord_99",
        symbol="BTC/USDT",
        side="buy",
        order_type="limit",
        quantity=Decimal("1.0"),
        filled_quantity=Decimal("0"),
        limit_price=Decimal("55000.0"),
        status="OPEN",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        exec_mock = MagicMock()
        exec_mock.scalar_one_or_none.return_value = mock_order
        mock_session.execute = AsyncMock(return_value=exec_mock)

        res = client.post(f"/api/v1/tools/execution/orders/{order_id}/cancel", headers=auth_headers, params={"trading_mode": "paper"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "CANCELLED"
        assert mock_order.status == "CANCELLED"
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_cancel_execution_order_already_filled_returns_400(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    order_id = uuid.uuid4()
    mock_order = OrderModel(
        id=order_id,
        execution_request_id=uuid.uuid4(),
        client_order_id="client_ord_done",
        symbol="BTC/USDT",
        side="buy",
        order_type="market",
        quantity=Decimal("1.0"),
        filled_quantity=Decimal("1.0"),
        status="FILLED",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        exec_mock = MagicMock()
        exec_mock.scalar_one_or_none.return_value = mock_order
        mock_session.execute = AsyncMock(return_value=exec_mock)

        res = client.post(f"/api/v1/tools/execution/orders/{order_id}/cancel", headers=auth_headers)
        assert res.status_code == 400
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── Get Order Tests ──────────────────────────────────────────────────────────


def test_get_execution_order_success(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    order_id = uuid.uuid4()
    mock_order = OrderModel(
        id=order_id,
        execution_request_id=uuid.uuid4(),
        client_order_id="client_ord_fetch",
        symbol="BTC/USDT",
        side="buy",
        order_type="market",
        quantity=Decimal("0.5"),
        filled_quantity=Decimal("0.5"),
        status="FILLED",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    mock_fill = FillModel(
        id=uuid.uuid4(),
        order_id=order_id,
        exchange_trade_id="fill_abc",
        symbol="BTC/USDT",
        side="buy",
        quantity=Decimal("0.5"),
        price=Decimal("62000.0"),
        fee=Decimal("31.0"),
        fee_asset="USDT",
        trading_mode="paper",
        correlation_id=mock_order.correlation_id,
        executed_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        order_exec = MagicMock()
        order_exec.scalar_one_or_none.return_value = mock_order
        fill_exec = MagicMock()
        fill_exec.scalars.return_value.all.return_value = [mock_fill]

        mock_session.execute = AsyncMock(side_effect=[order_exec, fill_exec])

        res = client.get(f"/api/v1/tools/execution/orders/{order_id}", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["order_id"] == str(order_id)
        assert data["status"] == "FILLED"
        assert len(data["fills"]) == 1
        assert data["fills"][0]["exchange_trade_id"] == "fill_abc"
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── Position Manager Tests (position.get, position.monitor, position.close) ──


def test_position_get_active_position(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC))
    mock_pos = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("2.0"),
        average_entry_price=Decimal("50000.0"),
        realized_pnl=Decimal("1000.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)), \
             patch("apps.api.routers.execution_tools._get_current_price", new=AsyncMock(return_value=Decimal("55000.0"))):
            pos_exec = MagicMock()
            pos_exec.scalar_one_or_none.return_value = mock_pos
            mock_session.execute = AsyncMock(return_value=pos_exec)

            res = client.get("/api/v1/tools/position", headers=auth_headers, params={"symbol": "BTC/USDT", "trading_mode": "paper"})
            assert res.status_code == 200
            data = res.json()
            assert data["symbol"] == "BTC/USDT"
            assert data["quantity"] == "2.0"
            assert data["average_entry_price"] == "50000.0"
            assert data["current_price"] == "55000.0"
            assert Decimal(data["unrealized_pnl"]) == Decimal("10000.0")  # (55000-50000)*2
            assert data["status"] == "LONG"
            assert data["return_pct"] == 10.0
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_position_get_flat_when_none(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC))

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)), \
             patch("apps.api.routers.execution_tools._get_current_price", new=AsyncMock(return_value=Decimal("50000.0"))):
            pos_exec = MagicMock()
            pos_exec.scalar_one_or_none.return_value = None
            mock_session.execute = AsyncMock(return_value=pos_exec)

            res = client.get("/api/v1/tools/position", headers=auth_headers, params={"symbol": "BTC/USDT", "trading_mode": "paper"})
            assert res.status_code == 200
            data = res.json()
            assert data["symbol"] == "BTC/USDT"
            assert data["quantity"] == "0"
            assert data["status"] == "FLAT"
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_position_monitor(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC))
    mock_pos_btc = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("1.0"),
        average_entry_price=Decimal("60000.0"),
        realized_pnl=Decimal("500.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )
    mock_pos_eth = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="ETH/USDT",
        quantity=Decimal("10.0"),
        average_entry_price=Decimal("3000.0"),
        realized_pnl=Decimal("200.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    async def mock_price(sym: str, sess: Any):
        return Decimal("65000.0") if "BTC" in sym else Decimal("3200.0")

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)), \
             patch("apps.api.routers.execution_tools._get_current_price", side_effect=mock_price):
            exec_mock = MagicMock()
            exec_mock.scalars.return_value.all.return_value = [mock_pos_btc, mock_pos_eth]
            mock_session.execute = AsyncMock(return_value=exec_mock)

            res = client.get("/api/v1/tools/position/monitor", headers=auth_headers, params={"trading_mode": "paper"})
            assert res.status_code == 200
            data = res.json()
            assert data["total_open_positions"] == 2
            # BTC: (65000-60000)*1 = 5000, ETH: (3200-3000)*10 = 2000 => Total unrealized = 7000.0
            assert data["total_unrealized_pnl"] == 7000.0
            # Total realized = 500 + 200 = 700.0
            assert data["total_realized_pnl"] == 700.0
            # Total notional: 65000*1 + 3200*10 = 97000.0
            assert data["total_notional_exposure"] == 97000.0
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_position_close_full(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC))
    mock_pos = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("1.0"),
        average_entry_price=Decimal("60000.0"),
        realized_pnl=Decimal("0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    # After close, quantity is 0, realized P&L is 4000
    mock_pos_after = PositionModel(
        id=mock_pos.id,
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("0"),
        average_entry_price=Decimal("0"),
        realized_pnl=Decimal("4000.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    mock_fill = {
        "exchange_trade_id": "close_fill_123",
        "symbol": "BTC/USDT",
        "side": "sell",
        "price": Decimal("64000.0"),
        "quantity": Decimal("1.0"),
        "fee": Decimal("64.0"),
        "fee_asset": "USDT",
    }

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)), \
             patch("services.execution.paper.PaperExecutionAdapter.execute_market_order", new=AsyncMock(return_value=mock_fill)), \
             patch("apps.api.routers.execution_tools.portfolio_engine.process_fill", new=AsyncMock()):
            first_exec = MagicMock()
            first_exec.scalar_one_or_none.return_value = mock_pos
            second_exec = MagicMock()
            second_exec.scalar_one.return_value = mock_pos_after

            mock_session.execute = AsyncMock(side_effect=[first_exec, second_exec])

            payload = {"symbol": "BTC/USDT", "trading_mode": "paper"}
            res = client.post("/api/v1/tools/position/close", headers=auth_headers, json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "CLOSED"
            assert data["closed_quantity"] == "1.0"
            assert data["remaining_quantity"] == "0"
            assert data["realized_pnl"] == "4000.0"
    finally:
        app.dependency_overrides.pop(get_db_session, None)


def test_position_close_no_position_returns_400(client: TestClient, auth_headers: dict[str, str]) -> None:
    mock_session = AsyncMock()
    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC))

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)):
            exec_mock = MagicMock()
            exec_mock.scalar_one_or_none.return_value = None
            mock_session.execute = AsyncMock(return_value=exec_mock)

            payload = {"symbol": "BTC/USDT", "trading_mode": "paper"}
            res = client.post("/api/v1/tools/position/close", headers=auth_headers, json=payload)
            assert res.status_code == 400
    finally:
        app.dependency_overrides.pop(get_db_session, None)


# ── HermesToolsClient Dispatch Tests ─────────────────────────────────────────


def test_hermes_tools_client_execution_and_position(client: TestClient) -> None:
    hermes_client = HermesToolsClient(base_url="http://testserver", token="test-hermes-token")
    client.headers.update(hermes_client.headers)
    hermes_client.client = client

    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    account_id = uuid.uuid4()
    mock_account = PortfolioAccountModel(id=account_id, name="Paper Account", trading_mode="paper", created_at=datetime.now(UTC))
    mock_entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("100000.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )
    mock_pos = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("1.0"),
        average_entry_price=Decimal("60000.0"),
        realized_pnl=Decimal("0.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db

    try:
        with patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=mock_account)), \
             patch("apps.api.routers.execution_tools._get_current_price", new=AsyncMock(return_value=Decimal("62000.0"))):

            # 1. execution.get_balance via client namespace & execute_tool
            exec_entry = MagicMock()
            exec_entry.scalars.return_value.all.return_value = [mock_entry]
            mock_session.execute = AsyncMock(return_value=exec_entry)

            bal1 = hermes_client.execution.get_balance(trading_mode="paper")
            assert "USDT" in bal1["balances"]

            bal2 = hermes_client.execute_tool("execution.get_balance", trading_mode="paper")
            assert "USDT" in bal2["balances"]

            # 2. position.get via client namespace & execute_tool
            pos_exec = MagicMock()
            pos_exec.scalar_one_or_none.return_value = mock_pos
            mock_session.execute = AsyncMock(return_value=pos_exec)

            p1 = hermes_client.position.get(symbol="BTC/USDT", trading_mode="paper")
            assert p1["symbol"] == "BTC/USDT"
            assert p1["quantity"] == "1.0"

            pos_exec2 = MagicMock()
            pos_exec2.scalar_one_or_none.return_value = mock_pos
            mock_session.execute = AsyncMock(return_value=pos_exec2)
            p2 = hermes_client.execute_tool("position.get", symbol="BTC/USDT", trading_mode="paper")
            assert p2["symbol"] == "BTC/USDT"
    finally:
        app.dependency_overrides.pop(get_db_session, None)
