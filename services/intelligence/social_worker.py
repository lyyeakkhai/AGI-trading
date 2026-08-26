from __future__ import annotations

import asyncio
from collections.abc import Callable, Coroutine
import time
from typing import Any

import httpx
import structlog

from packages.config import Settings, get_settings
from services.intelligence.x_client import RawPost, XClient

logger = structlog.get_logger(__name__)


class SocialWorker:
    """Social Streaming Worker with exponential backoff and disconnection recovery."""

    def __init__(
        self,
        x_client: XClient | None = None,
        settings: Settings | None = None,
        on_post: Callable[[RawPost], Coroutine[Any, Any, None]] | None = None,
        base_backoff_seconds: float = 1.0,
        max_backoff_seconds: float = 60.0,
    ) -> None:
        self._settings = settings or get_settings()
        self._client = x_client or XClient(
            api_token=self._settings.intelligence.x_api_token,
            target_symbols=self._settings.trading.symbols,
        )
        self._on_post = on_post
        self._base_backoff = base_backoff_seconds
        self._max_backoff = max_backoff_seconds
        self._current_backoff = base_backoff_seconds

        self._running = False
        self._connected = False
        self._disconnect_count = 0
        self._posts_received_count = 0
        self._last_post_time: float | None = None
        self._stream_task: asyncio.Task[None] | None = None

    @property
    def is_connected(self) -> bool:
        return self._connected

    @property
    def disconnect_count(self) -> int:
        return self._disconnect_count

    @property
    def posts_received_count(self) -> int:
        return self._posts_received_count

    @property
    def current_backoff(self) -> float:
        return self._current_backoff

    def set_post_handler(
        self, handler: Callable[[RawPost], Coroutine[Any, Any, None]]
    ) -> None:
        self._on_post = handler

    async def start(self) -> None:
        """Start background streaming task."""
        if self._running:
            return
        self._running = True
        self._stream_task = asyncio.create_task(self._run_loop())

    async def stop(self) -> None:
        """Stop background streaming task gracefully."""
        self._running = False
        self._connected = False
        if self._stream_task and not self._stream_task.done():
            self._stream_task.cancel()
            try:
                await self._stream_task
            except asyncio.CancelledError:
                pass
        self._stream_task = None

    async def _run_loop(self) -> None:
        """Supervised streaming loop with exponential backoff on disconnects."""
        while self._running:
            try:
                logger.info("social_worker_connecting", mock=self._client.is_mock)
                self._connected = True
                self._current_backoff = self._base_backoff

                async for post in self._client.stream_posts():
                    if not self._running:
                        break
                    self._posts_received_count += 1
                    self._last_post_time = time.monotonic()

                    if self._on_post:
                        try:
                            await self._on_post(post)
                        except Exception as post_err:
                            logger.error(
                                "social_worker_post_handler_error",
                                error=str(post_err),
                                post_id=post.id,
                            )

            except asyncio.CancelledError:
                self._connected = False
                break
            except (httpx.HTTPError, httpx.StreamError, TimeoutError, Exception) as exc:
                self._connected = False
                self._disconnect_count += 1
                logger.warning(
                    "social_worker_disconnected",
                    error=str(exc),
                    disconnect_count=self._disconnect_count,
                    backoff_seconds=self._current_backoff,
                )

                if self._running:
                    try:
                        await asyncio.sleep(self._current_backoff)
                    except asyncio.CancelledError:
                        break
                    self._current_backoff = min(
                        self._current_backoff * 2.0, self._max_backoff
                    )
            finally:
                if not self._running:
                    self._connected = False

        self._connected = False
