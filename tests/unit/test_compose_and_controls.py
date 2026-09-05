import yaml
from pathlib import Path
from services.execution.live import LiveExecutionAdapter


def test_live_adapter_has_safe_close():
    adapter = LiveExecutionAdapter()
    assert hasattr(adapter, "close")
    assert callable(adapter.close)


def test_docker_compose_environment_and_workers():
    compose_path = Path("docker-compose.yml")
    assert compose_path.exists()

    with open(compose_path, "r") as f:
        config = yaml.safe_load(f)

    services = config.get("services", {})
    assert "api" in services
    assert "hermes" in services
    assert "tradingagents" in services
    assert "market-data-worker" in services or "market-workers" in services
    assert "analytics-worker" in services or "market-workers" in services

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
