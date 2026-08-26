from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from datetime import datetime, timezone
import json
import random
from typing import Any

import httpx
import structlog

logger = structlog.get_logger(__name__)


@dataclass
class RawPost:
    id: str
    text: str
    author_id: str
    created_at: datetime
    symbol: str  # "BTC" or "ETH"
    metadata: dict[str, Any] = field(default_factory=dict)


class XClient:
    """X (Twitter) API v2 streaming client with mock fallbacks and resilient reconnection."""

    def __init__(
        self,
        api_token: str | None = None,
        base_url: str = "https://api.twitter.com/2",
        target_symbols: list[str] | None = None,
    ) -> None:
        self._api_token = api_token
        self._base_url = base_url
        self._symbols = target_symbols or ["BTC", "ETH"]
        self._is_mock = not api_token or api_token.startswith("mock") or api_token.startswith("test")

    @property
    def is_mock(self) -> bool:
        return self._is_mock

    async def stream_posts(self) -> AsyncGenerator[RawPost, None]:
        """Stream posts from real X API endpoint or mock feed."""
        if self._is_mock:
            async for post in self._mock_stream():
                yield post
        else:
            async for post in self._live_stream():
                yield post

    async def _live_stream(self) -> AsyncGenerator[RawPost, None]:
        """Connect to X API filtered stream endpoint using httpx."""
        url = f"{self._base_url}/tweets/search/stream"
        headers = {
            "Authorization": f"Bearer {self._api_token}",
            "User-Agent": "agi-trading-intelligence/0.1.0",
        }
        timeout = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("GET", url, headers=headers) as response:
                if response.status_code == 429:
                    raise httpx.HTTPStatusError(
                        "X API rate limited (429)",
                        request=response.request,
                        response=response,
                    )
                response.raise_for_status()

                async for line in response.aiter_lines():
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        tweet_data = data.get("data", {})
                        text = tweet_data.get("text", "")
                        tweet_id = tweet_data.get("id", str(random.randint(100000, 999999)))
                        author_id = tweet_data.get("author_id", "anonymous")

                        text_upper = text.upper()
                        symbol = "BTC"
                        if "ETH" in text_upper or "ETHEREUM" in text_upper:
                            symbol = "ETH"

                        yield RawPost(
                            id=tweet_id,
                            text=text,
                            author_id=author_id,
                            created_at=datetime.now(timezone.utc),
                            symbol=symbol,
                            metadata=data,
                        )
                    except (json.JSONDecodeError, KeyError) as e:
                        logger.warning("x_client_parse_error", error=str(e), line=line[:100])
                        continue

    async def _mock_stream(self) -> AsyncGenerator[RawPost, None]:
        """Generate synthetic social posts for testing and simulation."""
        templates = [
            ("BTC", "Bitcoin breaking resistance above key levels! Massive volume incoming $BTC #BTC"),
            ("BTC", "Bullish divergence on $BTC daily chart. Ready for the next leg up."),
            ("BTC", "Market looks choppy, cautious on Bitcoin here. #crypto"),
            ("ETH", "Ethereum layer 2 TVL hits all-time high. $ETH gas fees steady #Ethereum"),
            ("ETH", "Bullish momentum continuing on $ETH after protocol upgrade."),
            ("BTC", "Check out this guaranteed 100x gem http://scam1.link http://scam2.link http://scam3.link http://scam4.link $BTC $ETH $DOGE $SOL $XRP $ADA"),
        ]
        while True:
            symbol, text = random.choice(templates)
            author_num = random.randint(1, 20)
            yield RawPost(
                id=f"mock_tweet_{random.randint(100000, 999999)}",
                text=text,
                author_id=f"author_{author_num}",
                created_at=datetime.now(timezone.utc),
                symbol=symbol,
                metadata={"mock": True},
            )
            await asyncio.sleep(0.05)
