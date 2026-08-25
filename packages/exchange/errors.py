"""Exchange adapter error hierarchy.

UNKNOWN_STATE must never be collapsed into a generic failure — it means
the platform cannot determine whether an order was placed or not.
"""


class ExchangeError(Exception):
    """Base class for all exchange errors."""


class RetryableError(ExchangeError):
    """Transient error; safe to retry with backoff."""


class RateLimitedError(ExchangeError):
    """Exchange rate limit hit; respect Retry-After."""

    def __init__(self, message: str, retry_after_seconds: float | None = None):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds


class AuthFailedError(ExchangeError):
    """Authentication failure; do not retry without credential fix."""


class PermanentError(ExchangeError):
    """Non-retryable exchange error."""


class UnknownStateError(ExchangeError):
    """The platform cannot determine whether a command succeeded.

    This is NOT a failure. The order may or may not exist on the exchange.
    Resolution requires querying by client_order_id, never blind retry.
    """
