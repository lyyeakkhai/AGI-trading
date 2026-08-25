import json
from typing import Any, cast

from packages.events.client import RedisClient


class StreamNames:
    """Centralized stream name constants."""

    MARKET_CANDLES = "stream:market:candles"
    MARKET_TRADES = "stream:market:trades"
    MARKET_TICKERS = "stream:market:tickers"
    MARKET_ORDERBOOK = "stream:market:orderbook"
    OPPORTUNITIES = "stream:market:opportunities"  # ← C6 fix: pin this name


class RedisStreamPublisher:
    """Publishes messages to Redis streams with MAXLEN trimming."""

    def __init__(self, client: RedisClient):
        self._client = client

    async def publish(
        self, stream: str, message: dict[str, Any], maxlen: int = 1_000_000
    ) -> str:
        """XADD with MAXLEN ~ trimming. Returns message ID."""
        key = self._client._key(stream)
        serialized_fields: dict[Any, Any] = {}
        for k, v in message.items():
            if isinstance(v, (dict, list)):
                serialized_fields[k] = json.dumps(v)
            else:
                serialized_fields[k] = str(v)

        result = await self._client.redis.xadd(
            name=key,
            fields=serialized_fields,
            maxlen=maxlen,
            approximate=True,
        )
        return str(result)


class RedisStreamConsumer:
    """Consumes messages from Redis streams using consumer groups."""

    def __init__(self, client: RedisClient, group: str, consumer: str):
        self._client = client
        self._group = group
        self._consumer = consumer

    async def ensure_group(self, stream: str) -> None:
        """XGROUP CREATE stream group 0 MKSTREAM if not exists."""
        key = self._client._key(stream)
        try:
            await self._client.redis.xgroup_create(
                name=key,
                groupname=self._group,
                id="0",
                mkstream=True,
            )
        except Exception as e:
            if "BUSYGROUP" not in str(e):
                raise

    async def read(
        self,
        streams: list[str],
        count: int = 100,
        block_ms: int = 2000,
    ) -> list[dict[str, Any]]:
        """XREADGROUP with backpressure."""
        prefixed_streams: dict[Any, Any] = {self._client._key(s): ">" for s in streams}
        raw_results = await self._client.redis.xreadgroup(
            groupname=self._group,
            consumername=self._consumer,
            streams=prefixed_streams,
            count=count,
            block=block_ms,
        )
        messages: list[dict[str, Any]] = []
        if not raw_results or not isinstance(raw_results, list):
            return messages

        typed_results = cast(list[tuple[str, list[tuple[str, dict[str, Any]]]]], raw_results)
        for stream_key, stream_messages in typed_results:
            for msg_id, fields in stream_messages:
                messages.append(
                    {
                        "stream": stream_key,
                        "id": msg_id,
                        "payload": fields,
                    }
                )
        return messages

    async def ack(self, stream: str, message_id: str) -> None:
        """XACK after successful processing."""
        key = self._client._key(stream)
        await self._client.redis.xack(key, self._group, message_id)

    async def autoclaim(
        self,
        stream: str,
        min_idle_ms: int = 60_000,
        count: int = 100,
        start_id: str = "0-0",
    ) -> list[dict[str, Any]]:
        """XAUTOCLAIM for dead consumer recovery."""
        key = self._client._key(stream)
        result = await self._client.redis.xautoclaim(
            name=key,
            groupname=self._group,
            consumername=self._consumer,
            min_idle_time=min_idle_ms,
            start_id=start_id,
            count=count,
        )
        claimed_messages: list[dict[str, Any]] = []
        if result and isinstance(result, (list, tuple)) and len(result) >= 2:
            raw_msgs = cast(list[tuple[str, dict[str, Any]]], result[1])
            for msg_id, fields in raw_msgs:
                claimed_messages.append(
                    {
                        "stream": key,
                        "id": msg_id,
                        "payload": fields,
                    }
                )
        return claimed_messages
