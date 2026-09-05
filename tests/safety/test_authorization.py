import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def test_hermes_endpoints_reject_invalid_token():
    # Attempt to hit a hermes endpoint without valid token
    response = client.get("/api/v1/tools/market/price", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 403

def test_tradingagents_endpoints_reject_invalid_token():
    # Attempt to hit tradingagents endpoint without valid token
    response = client.post("/api/v1/tools/research/deep_analyze", headers={"Authorization": "Bearer invalid"}, json={})
    assert response.status_code == 403

def test_owner_endpoints_reject_service_tokens():
    # Attempt to hit an owner endpoint with service token
    response = client.get("/api/v1/owner/portfolio", headers={"Authorization": "Bearer test-service-token"})
    assert response.status_code == 401
