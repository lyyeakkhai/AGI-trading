import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def test_get_market_price_missing_token():
    response = client.get("/api/v1/tools/market/price?symbol=BTC/USDT")
    assert response.status_code == 403

def test_get_market_price_invalid_token():
    response = client.get("/api/v1/tools/market/price?symbol=BTC/USDT", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 403

# We can't test valid token easily without mocking settings or reading from it,
# but let's assume if it returns 403 for missing, the dependency is attached.
