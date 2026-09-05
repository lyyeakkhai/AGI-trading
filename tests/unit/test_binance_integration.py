from __future__ import annotations

import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import create_app
from packages.config import get_settings


@pytest.fixture
def test_app():
    return create_app()


@pytest.mark.asyncio
async def test_binance_status_unconfigured(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res = await client.get("/api/exchange/binance/status")
        assert res.status_code == 200
        data = res.json()
        assert data["exchange"] == "Binance"
        assert data["live_trading"] == "DISABLED"
        assert data["permissions"]["read"] is True
        assert data["permissions"]["spot_trading"] is False
        assert data["permissions"]["withdrawals"] is False
        assert "secret" not in str(data).lower() or data.get("api_key_masked") is None


@pytest.mark.asyncio
async def test_binance_connection_test(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res = await client.post("/api/exchange/binance/test")
        assert res.status_code == 200
        data = res.json()
        assert "status" in data
        assert "secret" not in str(data).lower()


@pytest.mark.asyncio
async def test_binance_account_info(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res = await client.get("/api/exchange/binance/account")
        assert res.status_code == 200
        data = res.json()
        assert data["exchange"] == "Binance"
        assert data["environment"] == "TESTNET"
        assert data["permissions"]["withdrawals"] is False


@pytest.mark.asyncio
async def test_binance_balances(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res = await client.get("/api/exchange/binance/balances")
        assert res.status_code == 200
        data = res.json()
        assert data["data_mode"] == "SIMULATED_TESTNET"
        assets = [b["asset"] for b in data["balances"]]
        assert "USDT" in assets
        assert "BTC" in assets
        assert "ETH" in assets
        for b in data["balances"]:
            assert b["total"] >= b["available"]


@pytest.mark.asyncio
async def test_binance_health(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res = await client.get("/api/exchange/binance/health")
        assert res.status_code == 200
        data = res.json()
        assert data["api_connectivity"] == "HEALTHY"
        assert data["authentication"] == "VALID"
        assert data["latency_ms"] > 0
        assert data["rate_limit_weight"] <= data["rate_limit_max"]


@pytest.mark.asyncio
async def test_no_credential_leakage(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        for path in [
            "/api/exchange/binance/status",
            "/api/exchange/binance/account",
            "/api/exchange/binance/balances",
            "/api/exchange/binance/health",
        ]:
            res = await client.get(path)
            content = res.text
            assert "BINANCE_SECRET_KEY" not in content
            assert "api_secret" not in content
