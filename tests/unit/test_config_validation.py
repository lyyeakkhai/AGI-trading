from decimal import Decimal
import pytest

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


def test_live_enabled_true_with_paper_mode_rejected() -> None:
    """Rule 2: LIVE_TRADING_ENABLED=true AND TRADING_MODE=paper -> reject."""
    with pytest.raises(ValueError, match="LIVE_TRADING_ENABLED=True cannot be used with TRADING_MODE='paper'"):
        Settings(
            trading=TradingSettings(mode="paper"),
            execution=ExecutionSettings(live_trading_enabled=True),
        )


def test_live_mode_requires_exchange_credentials() -> None:
    """Rule 3: TRADING_MODE=live AND credentials missing -> reject."""
    with pytest.raises(ValueError, match="TRADING_MODE='live' requires BINANCE_API_KEY and BINANCE_SECRET_KEY"):
        Settings(
            app=AppSettings(env="production"),
            trading=TradingSettings(mode="live"),
            exchange=ExchangeSettings(binance_api_key=None, binance_secret_key=None),
        )

    with pytest.raises(ValueError, match="TRADING_MODE='live' requires BINANCE_API_KEY and BINANCE_SECRET_KEY"):
        Settings(
            app=AppSettings(env="production"),
            trading=TradingSettings(mode="live"),
            exchange=ExchangeSettings(binance_api_key="api_key_only", binance_secret_key=None),
        )


def test_leverage_rejected_in_live_mode() -> None:
    """Rule 4: TRADING_MODE=live AND leverage_enabled=true -> reject."""
    with pytest.raises(ValueError, match="TRADING_MODE='live' with leverage_enabled=True is not supported"):
        Settings(
            app=AppSettings(env="production"),
            trading=TradingSettings(mode="live"),
            exchange=ExchangeSettings(binance_api_key="k", binance_secret_key="s"),
            risk=RiskSettings(leverage_enabled=True),
        )


def test_spot_only_false_rejected_in_live_mode() -> None:
    """Rule 5: TRADING_MODE=live AND spot_only=false -> reject."""
    with pytest.raises(ValueError, match="TRADING_MODE='live' requires spot_only=True"):
        Settings(
            app=AppSettings(env="production"),
            trading=TradingSettings(mode="live"),
            exchange=ExchangeSettings(binance_api_key="k", binance_secret_key="s"),
            risk=RiskSettings(spot_only=False),
        )


def test_symbol_outside_allowlist_rejected() -> None:
    """Rule 6: symbol not in allowlist -> reject."""
    with pytest.raises(ValueError, match="Symbol 'DOGE/USDT' is not in allowlist"):
        Settings(
            trading=TradingSettings(
                symbols=["BTC/USDT", "DOGE/USDT"],
                allowlist=["BTC/USDT", "ETH/USDT"],
            )
        )


def test_paper_live_database_name_conflict_rejected() -> None:
    """Rule 7a: paper db name == live db name -> reject."""
    with pytest.raises(ValueError, match="cannot match live database name"):
        Settings(
            database=DatabaseSettings(paper_db_name="db", live_db_name="db")
        )


def test_paper_live_redis_prefix_conflict_rejected() -> None:
    """Rule 7b: paper redis prefix == live redis prefix -> reject."""
    with pytest.raises(ValueError, match="cannot match live redis key_prefix"):
        Settings(
            redis=RedisSettings(key_prefix="shared:", live_key_prefix="shared:")
        )


def test_approval_ttl_must_be_positive() -> None:
    """Rule 8: approval_ttl_seconds <= 0 -> reject."""
    with pytest.raises(ValueError, match="approval_ttl_seconds must be > 0"):
        Settings(
            execution=ExecutionSettings(approval_ttl_seconds=0)
        )

    with pytest.raises(ValueError, match="approval_ttl_seconds must be > 0"):
        Settings(
            execution=ExecutionSettings(approval_ttl_seconds=-30)
        )


def test_approval_ttl_cannot_exceed_max() -> None:
    """Rule 9: approval_ttl_seconds > approval_ttl_max_seconds -> reject."""
    with pytest.raises(ValueError, match="cannot exceed approval_ttl_max_seconds"):
        Settings(
            execution=ExecutionSettings(
                approval_ttl_seconds=1200,
                approval_ttl_max_seconds=900,
            )
        )


def test_market_data_max_age_must_be_positive() -> None:
    """Rule 10: market_data_max_age_seconds <= 0 -> reject."""
    with pytest.raises(ValueError, match="market_data_max_age_seconds must be > 0"):
        Settings(
            risk=RiskSettings(market_data_max_age_seconds=0)
        )

    with pytest.raises(ValueError, match="market_data_max_age_seconds must be > 0"):
        Settings(
            risk=RiskSettings(market_data_max_age_seconds=-10)
        )


def test_max_risk_per_trade_percent_bounds() -> None:
    """Rule 11: max_risk_per_trade_percent <= 0 or > 100 -> reject."""
    with pytest.raises(ValueError, match="max_risk_per_trade_percent must be > 0 and <= 100"):
        Settings(
            risk=RiskSettings(max_risk_per_trade_percent=Decimal("0"))
        )

    with pytest.raises(ValueError, match="max_risk_per_trade_percent must be > 0 and <= 100"):
        Settings(
            risk=RiskSettings(max_risk_per_trade_percent=Decimal("101.5"))
        )


def test_require_owner_approval_false_rejected_in_live_mode() -> None:
    """Rule 12: require_owner_approval=false AND TRADING_MODE=live -> reject."""
    with pytest.raises(ValueError, match="require_owner_approval=False is prohibited when TRADING_MODE='live'"):
        Settings(
            app=AppSettings(env="production"),
            trading=TradingSettings(mode="live"),
            exchange=ExchangeSettings(binance_api_key="k", binance_secret_key="s"),
            execution=ExecutionSettings(
                live_trading_enabled=True,
                require_owner_approval=False,
            ),
        )


def test_valid_production_live_configuration_passes() -> None:
    """Valid live configuration with all safety prerequisites met succeeds."""
    settings = Settings(
        app=AppSettings(env="production"),
        trading=TradingSettings(
            mode="live",
            symbols=["BTC/USDT"],
            allowlist=["BTC/USDT", "ETH/USDT"],
        ),
        exchange=ExchangeSettings(
            binance_api_key="live_key",
            binance_secret_key="live_secret",
        ),
        risk=RiskSettings(
            spot_only=True,
            leverage_enabled=False,
            max_risk_per_trade_percent=Decimal("0.5"),
            market_data_max_age_seconds=60,
        ),
        execution=ExecutionSettings(
            live_trading_enabled=True,
            require_owner_approval=True,
            approval_ttl_seconds=300,
            approval_ttl_max_seconds=900,
        ),
    )
    assert settings.trading.mode == "live"
    assert settings.execution.live_trading_enabled is True
