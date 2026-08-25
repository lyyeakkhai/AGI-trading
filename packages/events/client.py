from typing import Optional

from redis.asyncio import Redis, from_url

from packages.config.settings import RedisSettings, get_settings


class RedisClient:
    """Redis client with key-prefix isolation per APP_ENV + TRADING_MODE.

    Redis is NEVER authoritative for financial state.
    """

    def __init__(
        self,
        settings: Optional[RedisSettings] = None,
        app_env: str = "development",
        trading_mode: str = "paper",
    ):
        redis_settings = settings or get_settings().redis
        self._prefix: str = f"{app_env}:{trading_mode}"  # e.g. "development:paper"
        self._redis: Redis = from_url(
            redis_settings.url,
            decode_responses=True,
        )

    def _key(self, name: str) -> str:
        """Derives an environment and trading-mode isolated Redis key."""
        return f"{self._prefix}:{name}"

    @property
    def redis(self) -> Redis:
        return self._redis

    async def ping(self) -> bool:
        """Pings Redis server and returns True if connected."""
        result = await self._redis.ping()
        return bool(result)

    async def close(self) -> None:
        """Closes the Redis connection pool."""
        await self._redis.aclose()
