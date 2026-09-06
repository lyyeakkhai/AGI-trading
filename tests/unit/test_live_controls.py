from __future__ import annotations

import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import create_app


@pytest.fixture
def test_app():
    return create_app()


@pytest.mark.asyncio
async def test_live_trading_disabled_by_default(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res = await client.get("/api/exchange/binance/status")
        assert res.status_code == 200
        data = res.json()
        assert data["live_trading"] == "DISABLED"
        assert data["permissions"]["withdrawals"] is False


@pytest.mark.asyncio
async def test_kill_switch_unauthorized(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        # Kill switch requires owner session
        res = await client.post("/api/trades/kill-switch")
        assert res.status_code in [401, 403]


@pytest.mark.asyncio
async def test_live_readiness_endpoint(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res = await client.get("/api/live/readiness")
        assert res.status_code == 200
        data = res.json()
        assert data["total_count"] == 12
        assert len(data["gates"]) == 12
        assert data["live_trading_enabled"] is False
        assert "readiness_status" in data
        assert "telemetry" in data
        assert "limits" in data


@pytest.mark.asyncio
async def test_live_endpoints_unauthorized(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        res_act = await client.post("/api/live/activate")
        assert res_act.status_code in [401, 403]

        res_dis = await client.post("/api/live/disable")
        assert res_dis.status_code in [401, 403]

        res_stop = await client.post("/api/live/emergency-stop")
        assert res_stop.status_code in [401, 403]


@pytest.mark.asyncio
async def test_live_controls_authorized_lifecycle(test_app):
    from apps.api.dependencies import verify_owner_session
    from apps.api.routers.live import _state

    _state.reset_for_tests()
    test_app.dependency_overrides[verify_owner_session] = lambda: {"role": "owner"}

    try:
        async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
            # 1. Check initial readiness
            res = await client.get("/api/live/readiness")
            assert res.status_code == 200
            assert res.json()["live_trading_enabled"] is False

            # 2. Trigger emergency stop
            stop_res = await client.post("/api/live/emergency-stop")
            assert stop_res.status_code == 200
            assert stop_res.json()["status"] == "KILL_SWITCH_ENGAGED"

            # 3. Readiness reflects BLOCKED state
            readiness_blocked = await client.get("/api/live/readiness")
            assert readiness_blocked.json()["readiness_status"] == "BLOCKED"
            assert readiness_blocked.json()["kill_switch_active"] is True

            # 4. Activation blocked while kill switch engaged
            act_blocked = await client.post("/api/live/activate")
            assert act_blocked.status_code == 403

            # 5. Unlock emergency stop
            unlock_res = await client.post("/api/live/unlock")
            assert unlock_res.status_code == 200
            assert unlock_res.json()["status"] == "UNLOCKED"

            # 6. Verify kill switch cleared
            readiness_cleared = await client.get("/api/live/readiness")
            assert readiness_cleared.json()["kill_switch_active"] is False
    finally:
        test_app.dependency_overrides.clear()
        _state.reset_for_tests()
