import json
from packages.logging.logger import redact_secrets_processor


def test_secret_field_is_redacted_in_log_output() -> None:
    """AC-9: A log call attempting to emit a known secret field emits [REDACTED]."""
    test_event = {
        "event": "user_action",
        "BINANCE_API_KEY": "secret_key_12345",
        "binance_secret_key": "super_secret_payload",
        "DATABASE_URL": "postgresql+asyncpg://user:pass@localhost:5432/trading",
        "REDIS_URL": "redis://:secretpass@localhost:6379",
        "X_API_TOKEN": "token_abc_xyz",
        "LLM_GATEWAY_KEY": "gateway_key_999",
        "DASHBOARD_AUTH_SECRET": "auth_cookie_token_999",
        "password": "my_password",
    }

    result = redact_secrets_processor(None, "info", test_event)

    # Convert to JSON string to simulate output stream
    json_output = json.dumps(result)

    # Assert raw sensitive values are not present
    assert "secret_key_12345" not in json_output
    assert "super_secret_payload" not in json_output
    assert "secretpass" not in json_output
    assert "token_abc_xyz" not in json_output
    assert "gateway_key_999" not in json_output
    assert "auth_cookie_token_999" not in json_output
    assert "my_password" not in json_output

    # Assert [REDACTED] is present for each redacted field
    assert result["BINANCE_API_KEY"] == "[REDACTED]"
    assert result["binance_secret_key"] == "[REDACTED]"
    assert result["DATABASE_URL"] == "[REDACTED]"
    assert result["REDIS_URL"] == "[REDACTED]"
    assert result["X_API_TOKEN"] == "[REDACTED]"
    assert result["LLM_GATEWAY_KEY"] == "[REDACTED]"
    assert result["DASHBOARD_AUTH_SECRET"] == "[REDACTED]"
    assert result["password"] == "[REDACTED]"


def test_nested_secret_field_is_redacted() -> None:
    """Nested dictionaries containing sensitive keys are recursively redacted."""
    test_event = {
        "event": "nested_event",
        "payload": {
            "credentials": {
                "api_key": "sensitive_nested_api_key",
                "secret": "hidden_nested_secret",
            },
            "public_id": "item_123",
        },
    }

    result = redact_secrets_processor(None, "info", test_event)
    json_output = json.dumps(result)

    assert "sensitive_nested_api_key" not in json_output
    assert "hidden_nested_secret" not in json_output
    assert result["payload"]["credentials"]["api_key"] == "[REDACTED]"
    assert result["payload"]["credentials"]["secret"] == "[REDACTED]"
    assert result["payload"]["public_id"] == "item_123"


def test_non_secret_field_is_not_redacted() -> None:
    """Non-sensitive fields retain their exact values."""
    test_event = {
        "event": "market_signal_emitted",
        "symbol": "BTC/USDT",
        "timeframe": "1h",
        "price": "50000.50",
    }

    result = redact_secrets_processor(None, "info", test_event)

    assert result["symbol"] == "BTC/USDT"
    assert result["timeframe"] == "1h"
    assert result["price"] == "50000.50"
    assert result["event"] == "market_signal_emitted"
