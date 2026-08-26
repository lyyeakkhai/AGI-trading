from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
import httpx
import pytest
from unittest.mock import AsyncMock, MagicMock

from apps.api.main import app
from apps.api.routers.portfolio import get_db_session as portfolio_get_db
from apps.api.routers.reconciliation import get_db_session as rec_get_db
from packages.database.models.portfolio import (
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from packages.database.models.system import ReconciliationRunModel


@pytest.mark.asyncio
async def test_get_portfolio_accounts() -> None:
    account_id = uuid.uuid4()
    mock_acc = PortfolioAccountModel(
        id=account_id,
        name="Test Account",
        trading_mode="paper",
        created_at=datetime.now(timezone.utc),
    )
    mock_entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=account_id,
        asset="USDT",
        balance=Decimal("50000.0"),
        trading_mode="paper",
        updated_at=datetime.now(timezone.utc),
    )

    mock_session = AsyncMock()

    async def mock_execute(stmt):
        mock_res = MagicMock()
        stmt_str = str(stmt).lower()
        if "portfolio_accounts" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [mock_acc]
        elif "portfolio_entries" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [mock_entry]
        return mock_res

    mock_session.execute.side_effect = mock_execute

    async def override_db():
        yield mock_session

    app.dependency_overrides[portfolio_get_db] = override_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/portfolio/accounts?trading_mode=paper")

    app.dependency_overrides.clear()

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["id"] == str(account_id)
    assert data[0]["balances"] == {"USDT": "50000.0"}


@pytest.mark.asyncio
async def test_get_portfolio_positions() -> None:
    account_id = uuid.uuid4()
    mock_pos = PositionModel(
        id=uuid.uuid4(),
        account_id=account_id,
        symbol="BTC/USDT",
        quantity=Decimal("1.5"),
        average_entry_price=Decimal("48000.0"),
        realized_pnl=Decimal("250.0"),
        trading_mode="paper",
        updated_at=datetime.now(timezone.utc),
    )

    mock_session = AsyncMock()
    mock_res = MagicMock()
    mock_res.scalars.return_value.all.return_value = [mock_pos]
    mock_session.execute.return_value = mock_res

    async def override_db():
        yield mock_session

    app.dependency_overrides[portfolio_get_db] = override_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/portfolio/positions?trading_mode=paper")

    app.dependency_overrides.clear()

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["symbol"] == "BTC/USDT"
    assert data[0]["quantity"] == "1.5"


@pytest.mark.asyncio
async def test_reconciliation_unblock_api() -> None:
    mock_session = AsyncMock()
    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_res
    mock_session.add = MagicMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[rec_get_db] = override_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/reconciliation/unblock",
            json={"actor": "operator_alice", "reason": "Verified exchange order book manually"},
        )

    app.dependency_overrides.clear()

    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "unblocked"
    assert data["blocked"] is False
