from decimal import Decimal
from functools import lru_cache
from typing import Optional
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    """Application level settings (APP_ENV, service_name, log_level, timezone)."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    env: str = Field(default="development", validation_alias="APP_ENV")
    service_name: str = "agi-trading"
    log_level: str = "INFO"
    timezone: str = "UTC"


class DatabaseSettings(BaseSettings):
    """Database configuration (DATABASE_URL, pool_size, statement_timeout_ms, paper vs live db names)."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    url: str = Field(
        default="postgresql+asyncpg://trading:trading_dev@localhost:5432/trading_paper",
        validation_alias="DATABASE_URL",
    )
    pool_size: int = 10
    statement_timeout_ms: int = 30000
    paper_db_name: str = "trading_paper"
    live_db_name: str = "trading_live"


class RedisSettings(BaseSettings):
    """Redis configuration (REDIS_URL, key_prefix, stream names, consumer groups)."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    url: str = Field(default="redis://localhost:6379", validation_alias="REDIS_URL")
    key_prefix: str = "trading:paper:"
    live_key_prefix: str = "trading:live:"
    stream_names: list[str] = Field(
        default_factory=lambda: ["market_data", "signals", "orders"]
    )
    consumer_groups: list[str] = Field(
        default_factory=lambda: ["api_group", "risk_group", "execution_group"]
    )


class ExchangeSettings(BaseSettings):
    """Exchange configuration (exchange_id, sandbox_flag, credentials)."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    exchange_id: str = "binance"
    sandbox_flag: bool = True
    rate_limits_per_second: int = 10
    binance_api_key: Optional[str] = Field(default=None, validation_alias="BINANCE_API_KEY")
    binance_secret_key: Optional[str] = Field(default=None, validation_alias="BINANCE_SECRET_KEY")


class TradingSettings(BaseSettings):
    """Trading mode, symbol allowlist, and timeframe settings."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    mode: str = Field(default="paper", validation_alias="TRADING_MODE")
    symbols: list[str] = Field(default_factory=lambda: ["BTC/USDT", "ETH/USDT"])
    timeframes: list[str] = Field(default_factory=lambda: ["15m", "1h", "4h"])
    allowlist: list[str] = Field(default_factory=lambda: ["BTC/USDT", "ETH/USDT"])


class RiskSettings(BaseSettings):
    """Risk rules, staleness limits, leverage and spot flags."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    spot_only: bool = True
    leverage_enabled: bool = False
    max_risk_per_trade_percent: Decimal = Field(default=Decimal("0.5"))
    market_data_max_age_seconds: int = 60
    kill_switch_state_source: str = "redis"


class ExecutionSettings(BaseSettings):
    """Live trading authorization, owner approval requirements and TTLs."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    live_trading_enabled: bool = Field(default=False, validation_alias="LIVE_TRADING_ENABLED")
    slippage_bps: int = 10
    require_owner_approval: bool = True
    approval_ttl_seconds: int = 300
    approval_ttl_max_seconds: int = 900


class ReconciliationSettings(BaseSettings):
    """Startup and periodic reconciliation configuration."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    required_on_startup: bool = True
    block_live_on_divergence: bool = True


class HermesSettings(BaseSettings):
    """Hermes service client configuration."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    base_url: str = "http://localhost:8001"
    service_token: Optional[str] = Field(default=None, validation_alias="HERMES_SERVICE_TOKEN")
    timeout_seconds: int = 30


class TradingAgentsSettings(BaseSettings):
    """TradingAgents service client configuration."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    base_url: str = "http://localhost:8002"
    service_token: Optional[str] = Field(
        default=None, validation_alias="TRADINGAGENTS_SERVICE_TOKEN"
    )
    timeout_seconds: int = 30
    escalation_budget_usd: Decimal = Field(default=Decimal("100.0"))


class LLMSettings(BaseSettings):
    """LLM gateway configuration."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    base_url: Optional[str] = Field(default=None, validation_alias="LLM_GATEWAY_URL")
    api_key: Optional[str] = Field(default=None, validation_alias="LLM_GATEWAY_KEY")
    model_routing: dict[str, str] = Field(
        default_factory=lambda: {"fast": "gpt-4o-mini", "reasoning": "o1-preview"}
    )
    cost_cap_usd_per_day: Decimal = Field(default=Decimal("50.0"))


class IntelligenceSettings(BaseSettings):
    """Intelligence and news ingestion configuration."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    x_api_token: Optional[str] = Field(default=None, validation_alias="X_API_TOKEN")
    news_sources: list[str] = Field(
        default_factory=lambda: ["coindesk", "cointelegraph"]
    )
    poll_interval_seconds: int = 300


class MonitoringSettings(BaseSettings):
    """Metrics and observability configuration."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    metrics_port: int = 9090
    tracing_sample_rate: float = 0.1
    alert_destinations: list[str] = Field(default_factory=lambda: ["telegram"])


class AuthSettings(BaseSettings):
    """Authentication secrets configuration."""

    model_config = SettingsConfigDict(extra="ignore", frozen=True)

    dashboard_auth_secret: Optional[str] = Field(
        default=None, validation_alias="DASHBOARD_AUTH_SECRET"
    )


class Settings(BaseSettings):
    """Root configuration composing all domain settings categories with strict cross-field validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        frozen=True,
    )

    app: AppSettings = Field(default_factory=AppSettings)
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    redis: RedisSettings = Field(default_factory=RedisSettings)
    exchange: ExchangeSettings = Field(default_factory=ExchangeSettings)
    trading: TradingSettings = Field(default_factory=TradingSettings)
    risk: RiskSettings = Field(default_factory=RiskSettings)
    execution: ExecutionSettings = Field(default_factory=ExecutionSettings)
    reconciliation: ReconciliationSettings = Field(default_factory=ReconciliationSettings)
    hermes: HermesSettings = Field(default_factory=HermesSettings)
    trading_agents: TradingAgentsSettings = Field(default_factory=TradingAgentsSettings)
    llm: LLMSettings = Field(default_factory=LLMSettings)
    intelligence: IntelligenceSettings = Field(default_factory=IntelligenceSettings)
    monitoring: MonitoringSettings = Field(default_factory=MonitoringSettings)
    auth: AuthSettings = Field(default_factory=AuthSettings)

    @model_validator(mode="after")
    def validate_cross_field_rules(self) -> "Settings":
        """Enforces all 12 cross-field safety rules from PRD section 66.4."""
        # Rule 1: TRADING_MODE=live AND APP_ENV=development -> reject
        if self.trading.mode.lower() == "live" and self.app.env.lower() == "development":
            raise ValueError(
                "Invalid configuration: TRADING_MODE='live' cannot be used with APP_ENV='development'. "
                "Offending fields: trading.mode, app.env"
            )

        # Rule 2: LIVE_TRADING_ENABLED=true AND TRADING_MODE=paper -> reject
        if self.execution.live_trading_enabled and self.trading.mode.lower() == "paper":
            raise ValueError(
                "Invalid configuration: LIVE_TRADING_ENABLED=True cannot be used with TRADING_MODE='paper'. "
                "Offending fields: execution.live_trading_enabled, trading.mode"
            )

        # Rule 3: TRADING_MODE=live AND (BINANCE_API_KEY missing or BINANCE_SECRET_KEY missing) -> reject
        if self.trading.mode.lower() == "live":
            if not self.exchange.binance_api_key or not self.exchange.binance_secret_key:
                raise ValueError(
                    "Invalid configuration: TRADING_MODE='live' requires BINANCE_API_KEY and BINANCE_SECRET_KEY. "
                    "Offending fields: exchange.binance_api_key, exchange.binance_secret_key"
                )

        # Rule 4: TRADING_MODE=live AND leverage_enabled=true -> reject
        if self.trading.mode.lower() == "live" and self.risk.leverage_enabled:
            raise ValueError(
                "Invalid configuration: TRADING_MODE='live' with leverage_enabled=True is not supported. "
                "Offending fields: risk.leverage_enabled, trading.mode"
            )

        # Rule 5: TRADING_MODE=live AND spot_only=false -> reject
        if self.trading.mode.lower() == "live" and not self.risk.spot_only:
            raise ValueError(
                "Invalid configuration: TRADING_MODE='live' requires spot_only=True. "
                "Offending fields: risk.spot_only, trading.mode"
            )

        # Rule 6: Any symbol not in the allowlist -> reject
        allowlist_set = set(self.trading.allowlist)
        for symbol in self.trading.symbols:
            if symbol not in allowlist_set:
                raise ValueError(
                    f"Invalid configuration: Symbol '{symbol}' is not in allowlist {self.trading.allowlist}. "
                    f"Offending fields: trading.symbols, trading.allowlist"
                )

        # Rule 7: paper db name == live db name OR paper redis prefix == live redis prefix -> reject
        if self.database.paper_db_name == self.database.live_db_name:
            raise ValueError(
                f"Invalid configuration: paper database name '{self.database.paper_db_name}' "
                f"cannot match live database name '{self.database.live_db_name}'. "
                "Offending fields: database.paper_db_name, database.live_db_name"
            )
        if self.redis.key_prefix == self.redis.live_key_prefix:
            raise ValueError(
                f"Invalid configuration: paper redis key_prefix '{self.redis.key_prefix}' "
                f"cannot match live redis key_prefix '{self.redis.live_key_prefix}'. "
                "Offending fields: redis.key_prefix, redis.live_key_prefix"
            )

        # Rule 8: approval_ttl_seconds <= 0 -> reject
        if self.execution.approval_ttl_seconds <= 0:
            raise ValueError(
                f"Invalid configuration: approval_ttl_seconds must be > 0 (got {self.execution.approval_ttl_seconds}). "
                "Offending field: execution.approval_ttl_seconds"
            )

        # Rule 9: approval_ttl_seconds > approval_ttl_max_seconds -> reject
        if self.execution.approval_ttl_seconds > self.execution.approval_ttl_max_seconds:
            raise ValueError(
                f"Invalid configuration: approval_ttl_seconds ({self.execution.approval_ttl_seconds}) "
                f"cannot exceed approval_ttl_max_seconds ({self.execution.approval_ttl_max_seconds}). "
                "Offending fields: execution.approval_ttl_seconds, execution.approval_ttl_max_seconds"
            )

        # Rule 10: market_data_max_age_seconds <= 0 -> reject
        if self.risk.market_data_max_age_seconds <= 0:
            raise ValueError(
                f"Invalid configuration: market_data_max_age_seconds must be > 0 (got {self.risk.market_data_max_age_seconds}). "
                "Offending field: risk.market_data_max_age_seconds"
            )

        # Rule 11: max_risk_per_trade_percent <= 0 or > 100 -> reject
        if (
            self.risk.max_risk_per_trade_percent <= Decimal("0")
            or self.risk.max_risk_per_trade_percent > Decimal("100")
        ):
            raise ValueError(
                f"Invalid configuration: max_risk_per_trade_percent must be > 0 and <= 100 "
                f"(got {self.risk.max_risk_per_trade_percent}). "
                "Offending field: risk.max_risk_per_trade_percent"
            )

        # Rule 12: require_owner_approval=false AND TRADING_MODE=live -> reject
        if not self.execution.require_owner_approval and self.trading.mode.lower() == "live":
            raise ValueError(
                "Invalid configuration: require_owner_approval=False is prohibited when TRADING_MODE='live'. "
                "Offending fields: execution.require_owner_approval, trading.mode"
            )

        return self


@lru_cache
def get_settings() -> Settings:
    """Cached settings loader. Read once at startup, immutable."""
    return Settings()
