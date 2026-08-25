import logging
from typing import Any, Callable, Optional, Set
import structlog
from structlog.contextvars import bind_contextvars, clear_contextvars

from packages.config.settings import Settings, get_settings

KNOWN_SECRET_KEYS: Set[str] = {
    "database_url",
    "redis_url",
    "binance_api_key",
    "binance_secret_key",
    "x_api_token",
    "llm_gateway_url",
    "llm_gateway_key",
    "hermes_service_token",
    "tradingagents_service_token",
    "dashboard_auth_secret",
    "password",
    "secret",
    "key",
    "token",
    "api_key",
}


def is_secret_field(key: Any) -> bool:
    """Returns True if key name matches known secret field names or contains sensitive tokens."""
    if not isinstance(key, str):
        return False
    normalized = key.strip().lower()
    if normalized in KNOWN_SECRET_KEYS:
        return True
    if any(token in normalized for token in ["password", "secret", "token", "api_key"]):
        return True
    if normalized.endswith("_key"):
        return True
    return False


def _redact_value(val: Any) -> Any:
    """Recursively redacts dictionary keys, lists, and tuples."""
    if isinstance(val, dict):
        return {
            k: ("[REDACTED]" if is_secret_field(k) else _redact_value(v))
            for k, v in val.items()
        }
    elif isinstance(val, list):
        return [_redact_value(item) for item in val]
    elif isinstance(val, tuple):
        return tuple(_redact_value(item) for item in val)
    return val


def redact_secrets_processor(
    logger: Any, method_name: str, event_dict: dict[str, Any]
) -> dict[str, Any]:
    """Structlog processor that replaces any sensitive fields with [REDACTED]."""
    redacted: dict[str, Any] = {}
    for k, v in event_dict.items():
        if is_secret_field(k):
            redacted[k] = "[REDACTED]"
        else:
            redacted[k] = _redact_value(v)
    return redacted


def _make_env_injector(settings: Settings) -> Callable[[Any, str, dict[str, Any]], dict[str, Any]]:
    """Creates a structlog processor that injects static environment context into every log event."""
    def inject_env_context(
        logger: Any, method_name: str, event_dict: dict[str, Any]
    ) -> dict[str, Any]:
        event_dict.setdefault("service", settings.app.service_name)
        event_dict.setdefault("app_env", settings.app.env)
        event_dict.setdefault("trading_mode", settings.trading.mode)
        event_dict.setdefault("live_trading_enabled", settings.execution.live_trading_enabled)
        return event_dict

    return inject_env_context


def configure_logging(settings: Optional[Settings] = None) -> None:
    """Configures structured JSON logging with UTC timestamps, environment context, and redaction."""
    active_settings = settings or get_settings()

    log_level = getattr(logging, active_settings.app.log_level.upper(), logging.INFO)

    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        _make_env_injector(active_settings),
        redact_secrets_processor,
        structlog.processors.JSONRenderer(),
    ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.PrintLoggerFactory(),
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        cache_logger_on_first_use=False,
    )

    # Log resolved non-secret configuration once at startup
    logger = get_logger("config")
    non_secret_config = {
        "service": active_settings.app.service_name,
        "app_env": active_settings.app.env,
        "trading_mode": active_settings.trading.mode,
        "live_trading_enabled": active_settings.execution.live_trading_enabled,
        "spot_only": active_settings.risk.spot_only,
        "leverage_enabled": active_settings.risk.leverage_enabled,
        "symbols": active_settings.trading.symbols,
        "timeframes": active_settings.trading.timeframes,
        "approval_ttl_seconds": active_settings.execution.approval_ttl_seconds,
        "approval_ttl_max_seconds": active_settings.execution.approval_ttl_max_seconds,
    }
    logger.info("configuration_resolved", **non_secret_config)


def get_logger(name: Optional[str] = None) -> structlog.stdlib.BoundLogger:
    """Returns a bound structlog logger."""
    return structlog.get_logger(name)  # type: ignore[no-any-return]


def bind_correlation_id(correlation_id: str) -> None:
    """Binds correlation ID to current contextvar context."""
    bind_contextvars(correlation_id=correlation_id)


def clear_correlation_context() -> None:
    """Clears contextvars context."""
    clear_contextvars()
