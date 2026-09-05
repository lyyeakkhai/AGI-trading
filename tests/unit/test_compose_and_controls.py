from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import yaml

from services.analytics import worker as analytics_worker_module
from services.execution.live import LiveExecutionAdapter
from services.market_data import worker as market_worker_module


@pytest.mark.asyncio
async def test_live_adapter_has_safe_close():
    with patch("ccxt.async_support.binance") as mock_binance:
        mock_instance = AsyncMock()
        mock_instance.set_sandbox_mode = MagicMock()
        mock_binance.return_value = mock_instance

        adapter = LiveExecutionAdapter()
        assert hasattr(adapter, "close")
        assert callable(adapter.close)

        await adapter.close()
        mock_instance.close.assert_awaited_once()


def test_worker_modules_expose_run_entrypoints():
    assert hasattr(market_worker_module, "run_worker")
    assert callable(market_worker_module.run_worker)

    assert hasattr(analytics_worker_module, "run_worker")
    assert callable(analytics_worker_module.run_worker)


def test_docker_compose_environment_and_workers():
    compose_path = Path("docker-compose.yml")
    assert compose_path.exists()

    with open(compose_path) as f:
        config = yaml.safe_load(f)

    services = config.get("services", {})
    assert "api" in services
    assert "hermes" in services
    assert "tradingagents" in services
    assert "market-data-worker" in services
    assert "analytics-worker" in services

    assert services["market-data-worker"].get("restart") == "unless-stopped"
    assert services["analytics-worker"].get("restart") == "unless-stopped"

    hermes_env = services["hermes"].get("environment", [])
    assert any("HERMES_BASE_URL" in env for env in hermes_env)
    assert any("TRADINGAGENTS_BASE_URL" in env for env in hermes_env)
    assert any("LLM_GATEWAY_KEY" in env for env in hermes_env)
    assert any("LLM_GATEWAY_URL" in env for env in hermes_env)

    ta_env = services["tradingagents"].get("environment", [])
    assert any("LLM_GATEWAY_KEY" in env for env in ta_env)
    assert any("LLM_GATEWAY_URL" in env for env in ta_env)

    api_env = services["api"].get("environment", [])
    assert any("TRADINGAGENTS_BASE_URL" in env for env in api_env)
