from decimal import Decimal
import httpx
import pytest

from apps.api.main import app
from packages.config.settings import (
    AppSettings,
    DatabaseSettings,
    ExchangeSettings,
    ExecutionSettings,
    RedisSettings,
    RiskSettings,
    Settings,
    TradingSettings,
)


def test_live_mode_rejected_in_development_env() -> None:
    """AC-18: APP_ENV=development with TRADING_MODE=live fails to start."""
    with pytest.raises(ValueError, match="TRADING_MODE='live' cannot be used with APP_ENV='development'"):
        Settings(
            app=AppSettings(env="development"),
            trading=TradingSettings(mode="live"),
            exchange=ExchangeSettings(binance_api_key="key", binance_secret_key="sec"),
            execution=ExecutionSettings(require_owner_approval=True),
        )


def test_live_trading_enabled_false_is_default() -> None:
    """AC-18: LIVE_TRADING_ENABLED=false and safe defaults are the committed default."""
    settings = Settings()
    assert settings.execution.live_trading_enabled is False
    assert settings.trading.mode == "paper"
    assert settings.app.env == "development"
    assert settings.risk.spot_only is True
    assert settings.risk.leverage_enabled is False
    assert settings.trading.symbols == ["BTC/USDT", "ETH/USDT"]
    assert settings.execution.require_owner_approval is True
    assert settings.execution.approval_ttl_seconds == 300
    assert settings.execution.approval_ttl_max_seconds == 900
    assert settings.risk.max_risk_per_trade_percent == Decimal("0.5")


def test_paper_live_cannot_share_database_name() -> None:
    """AC-18: Paper and live configuration cannot resolve to the same database name."""
    with pytest.raises(ValueError, match="cannot match live database name"):
        Settings(
            database=DatabaseSettings(paper_db_name="shared_db", live_db_name="shared_db")
        )


def test_paper_live_cannot_share_redis_prefix() -> None:
    """AC-18: Paper and live configuration cannot resolve to the same Redis prefix."""
    with pytest.raises(ValueError, match="cannot match live redis key_prefix"):
        Settings(
            redis=RedisSettings(key_prefix="trading:", live_key_prefix="trading:")
        )


@pytest.mark.asyncio
async def test_health_trading_never_ready_in_foundation_0() -> None:
    """AC-18: /health/trading never reports ready while its preconditions are unbuilt."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health/trading")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_ready"
    assert data["ready_for_trading"] is False
    assert len(data["reasons"]) == 4

    reason_codes = [r["code"] for r in data["reasons"]]
    assert "MARKET_DATA_NOT_VERIFIED" in reason_codes
    assert "PORTFOLIO_NOT_VERIFIED" in reason_codes
    assert "RISK_ENGINE_NOT_VERIFIED" in reason_codes
    assert "EXECUTION_NOT_VERIFIED" in reason_codes
