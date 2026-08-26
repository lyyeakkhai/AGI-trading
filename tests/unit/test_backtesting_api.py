import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def test_create_strategy(mocker):
    # Mocking DB dependencies is needed since we don't have a real DB in this unit test environment
    # For now we'll just check if the endpoint returns 422 if invalid
    response = client.post("/api/v1/strategies", json={})
    assert response.status_code == 422

    # A real test would mock StrategyRegistry
    # Let's mock it
    mock_registry = mocker.patch("apps.api.routers.backtesting.StrategyRegistry")
    mock_instance = mock_registry.return_value
    
    class MockStrat:
        id = "123e4567-e89b-12d3-a456-426614174000"
        name = "My Strat"
        state = "DRAFT"
        
    import asyncio
    f = asyncio.Future()
    f.set_result(MockStrat())
    mock_instance.create_strategy.return_value = f

    response = client.post("/api/v1/strategies", json={
        "name": "My Strat",
        "author": "Alice"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "My Strat"
    assert data["state"] == "DRAFT"
