from packages.config.settings import Settings


def test_agent_and_service_default_urls():
    settings = Settings()
    assert settings.hermes.base_url == "http://api:8000"
    assert settings.trading_agents.base_url == "http://tradingagents:8002"
    assert settings.llm.model_routing.get("reasoning") == "gpt-4o"
    assert settings.llm.model_routing.get("fast") == "gpt-4o-mini"
