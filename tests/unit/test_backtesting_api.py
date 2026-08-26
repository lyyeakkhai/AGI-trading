import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def test_create_strategy(mocker):
    response = client.post("/api/v1/strategies", json={})
    assert response.status_code == 422
