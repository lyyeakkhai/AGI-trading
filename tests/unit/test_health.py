import httpx
import pytest

from apps.api.main import app


@pytest.mark.asyncio
async def test_health_live_endpoint() -> None:
    """GET /health/live returns 200 alive with service name and timestamp."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health/live")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "service" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_ready_endpoint_structure() -> None:
    """GET /health/ready returns status and checks dict."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health/ready")

    assert response.status_code in [200, 503]
    data = response.json()
    assert data["status"] in ["ready", "not_ready"]
    assert "checks" in data
    assert "database" in data["checks"]
    assert "redis" in data["checks"]
    assert "migrations" in data["checks"]


@pytest.mark.asyncio
async def test_health_trading_endpoint() -> None:
    """GET /health/trading returns not_ready with all 4 unbuilt precondition reasons."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health/trading")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_ready"
    assert data["ready_for_trading"] is False
    assert len(data["reasons"]) == 4
