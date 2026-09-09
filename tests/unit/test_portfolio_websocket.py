from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from decimal import Decimal
import json
from unittest.mock import AsyncMock, MagicMock, patch
import uuid
import pytest
from fastapi.testclient import TestClient

from apps.api.main import create_app
from packages.database.models.portfolio import (
    FillModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from services.portfolio.engine import PortfolioEngine


@pytest.fixture
def app():
    return create_app()


@pytest.fixture
def client(app):
    return TestClient(app)


def test_portfolio_websocket_initial_snapshot(client: TestClient):
    """Verify connecting to /api/v1/ws/portfolio receives initial positions snapshot."""
    with patch("redis.asyncio.from_url") as mock_redis_cls:
        mock_r = AsyncMock()
        # Return empty list on xread so loop can yield or wait
        mock_r.xread = AsyncMock(side_effect=[[], asyncio.CancelledError()])
        mock_redis_cls.return_value = mock_r

        with client.websocket_connect("/api/v1/ws/portfolio") as websocket:
            # Client receives the initial snapshot
            data = websocket.receive_json()
            assert data["type"] == "positions_update"
            assert isinstance(data["positions"], list)


def test_portfolio_websocket_alias_routes(client: TestClient):
    """Verify connecting to alias routes /ws/positions and /ws/v1/portfolio works."""
    with patch("redis.asyncio.from_url") as mock_redis_cls:
        mock_r = AsyncMock()
        mock_r.xread = AsyncMock(side_effect=[[], asyncio.CancelledError()])
        mock_redis_cls.return_value = mock_r

        # Test /ws/positions
        with client.websocket_connect("/ws/positions") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "positions_update"

        # Test /ws/v1/portfolio
        with client.websocket_connect("/ws/v1/portfolio") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "positions_update"


def test_portfolio_websocket_ping_pong(client: TestClient):
    """Verify client sending ping gets pong back."""
    with patch("redis.asyncio.from_url") as mock_redis_cls:
        mock_r = AsyncMock()
        mock_r.xread = AsyncMock(return_value=[])
        mock_redis_cls.return_value = mock_r

        with client.websocket_connect("/api/v1/ws/portfolio") as websocket:
            # Consume initial snapshot
            _ = websocket.receive_json()

            websocket.send_text("ping")
            response = websocket.receive_text()
            assert response == "pong"


def test_portfolio_websocket_receives_redis_stream_event(client: TestClient):
    """Verify that events published to Redis stream are delivered over websocket."""
    pos_data = {
        "id": str(uuid.uuid4()),
        "symbol": "BTC/USDT",
        "side": "long",
        "quantity": 0.5,
        "entryPrice": 62000.0,
        "currentPrice": 62500.0,
        "realizedPnl": 150.0,
    }
    fill_data = {
        "symbol": "BTC/USDT",
        "side": "buy",
        "quantity": 0.5,
        "price": 62000.0,
    }
    balance_data = {
        "asset": "USDT",
        "balance": 50000.0,
    }

    mock_msg_data = {
        "type": "position_update",
        "event": "fill",
        "symbol": "BTC/USDT",
        "side": "buy",
        "trading_mode": "paper",
        "position": json.dumps(pos_data),
        "fill": json.dumps(fill_data),
        "balance": json.dumps(balance_data),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    stream_res = [
        ("trading:paper:portfolio.update", [("1700000000-0", mock_msg_data)])
    ]

    with patch("redis.asyncio.from_url") as mock_redis_cls:
        mock_r = AsyncMock()
        # First call returns the stream event, subsequent calls return empty
        mock_r.xread = AsyncMock(side_effect=[stream_res, [], asyncio.CancelledError()])
        mock_redis_cls.return_value = mock_r

        with client.websocket_connect("/api/v1/ws/portfolio") as websocket:
            # Consume initial snapshot
            snapshot = websocket.receive_json()
            assert snapshot["type"] == "positions_update"

            # Receive the streamed position_update
            update = websocket.receive_json()
            assert update["type"] == "position_update"
            assert update["symbol"] == "BTC/USDT"
            assert update["position"]["quantity"] == 0.5
            assert update["position"]["entryPrice"] == 62000.0
            assert update["fill"]["price"] == 62000.0
            assert update["balance"]["asset"] == "USDT"


@pytest.mark.asyncio
async def test_portfolio_engine_publishes_to_redis_on_fill():
    """Verify PortfolioEngine.process_fill calls xadd and publish on Redis."""
    mock_redis = AsyncMock()
    mock_redis.xadd = AsyncMock(return_value="1700000000-0")
    mock_redis.publish = AsyncMock(return_value=1)

    engine = PortfolioEngine(redis_client=mock_redis)
    account_id = uuid.uuid4()
    trading_mode = "paper"

    session = AsyncMock()
    pos = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="ETH/USDT",
        quantity=Decimal("2.0"),
        average_entry_price=Decimal("3000.0"),
        realized_pnl=Decimal("0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )
    entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("10000.0"),
        trading_mode=trading_mode,
        updated_at=datetime.now(timezone.utc),
    )

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "positions" in stmt_str:
            mock_res.scalar_one_or_none.return_value = pos
        elif "portfolio_entries" in stmt_str:
            mock_res.scalar_one_or_none.return_value = entry
        elif "fills" in stmt_str:
            mock_res.scalar_one_or_none.return_value = None
        return mock_res

    session.execute.side_effect = mock_execute

    fill_payload = {
        "exchange_trade_id": "test_fill_pub_1",
        "symbol": "ETH/USDT",
        "side": "buy",
        "price": Decimal("3000.0"),
        "quantity": Decimal("1.0"),
        "fee": Decimal("3.0"),
        "fee_asset": "USDT",
        "trading_mode": trading_mode,
    }

    fill = await engine.process_fill(session, fill_payload, account_id=account_id)
    assert fill is not None

    # Verify Redis xadd was called
    mock_redis.xadd.assert_awaited_once()
    call_args = mock_redis.xadd.call_args
    assert "portfolio.update" in call_args.kwargs["name"]
    fields = call_args.kwargs["fields"]
    assert fields["type"] == "position_update"
    assert fields["symbol"] == "ETH/USDT"
    assert fields["side"] == "buy"
    pos_decoded = json.loads(fields["position"])
    assert pos_decoded["symbol"] == "ETH/USDT"

    # Verify Redis publish was called
    mock_redis.publish.assert_awaited_once()


def test_portfolio_websocket_production_auth(app):
    """Verify in production unauthenticated connection is rejected."""
    client = TestClient(app)
    with patch("apps.api.routers.websocket.get_settings") as mock_settings_getter:
        from packages.config.settings import get_settings
        real_settings = get_settings()
        mock_settings = MagicMock()
        mock_settings.app.env = "production"
        mock_settings.redis = real_settings.redis
        mock_settings.hermes = real_settings.hermes
        mock_settings.auth = real_settings.auth
        mock_settings_getter.return_value = mock_settings

        from starlette.websockets import WebSocketDisconnect
        with pytest.raises(WebSocketDisconnect) as exc_info:
            with client.websocket_connect("/api/v1/ws/portfolio") as ws:
                ws.receive_json()
        assert exc_info.value.code == 1008

        # With valid token query param, should connect
        mock_settings.hermes = MagicMock(service_token="valid_token_123")
        with patch("redis.asyncio.from_url") as mock_redis_cls:
            mock_r = AsyncMock()
            mock_r.xread = AsyncMock(side_effect=[[], asyncio.CancelledError()])
            mock_redis_cls.return_value = mock_r

            with client.websocket_connect("/api/v1/ws/portfolio?token=valid_token_123") as ws:
                snapshot = ws.receive_json()
                assert snapshot["type"] == "positions_update" 
