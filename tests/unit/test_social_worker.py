from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from services.intelligence.social_worker import SocialWorker
from services.intelligence.x_client import RawPost, XClient


@pytest.mark.asyncio
async def test_x_client_mock_stream() -> None:
    client = XClient(api_token="mock_token_123")
    assert client.is_mock is True

    posts: list[RawPost] = []
    async for post in client.stream_posts():
        posts.append(post)
        if len(posts) >= 3:
            break

    assert len(posts) == 3
    assert posts[0].symbol in ["BTC", "ETH"]
    assert posts[0].text is not None
    assert posts[0].author_id is not None


@pytest.mark.asyncio
async def test_social_worker_start_stop() -> None:
    client = XClient(api_token="test_token")
    worker = SocialWorker(x_client=client)

    assert not worker.is_connected
    await worker.start()
    await asyncio.sleep(0.1)

    assert worker.is_connected
    await worker.stop()
    assert not worker.is_connected


@pytest.mark.asyncio
async def test_social_worker_post_handler() -> None:
    client = XClient(api_token="test_token")
    received_posts: list[RawPost] = []

    async def handle_post(post: RawPost) -> None:
        received_posts.append(post)

    worker = SocialWorker(x_client=client, on_post=handle_post)
    await worker.start()
    await asyncio.sleep(0.15)
    await worker.stop()

    assert len(received_posts) >= 1
    assert worker.posts_received_count >= 1


@pytest.mark.asyncio
async def test_social_worker_exponential_backoff_on_error() -> None:
    mock_client = MagicMock(spec=XClient)
    mock_client.is_mock = True

    async def fail_stream() -> None:
        raise ConnectionError("Network unreachable")
        yield  # type: ignore

    mock_client.stream_posts.return_value = fail_stream()

    worker = SocialWorker(
        x_client=mock_client,
        base_backoff_seconds=0.01,
        max_backoff_seconds=0.04,
    )

    await worker.start()
    await asyncio.sleep(0.08)
    await worker.stop()

    assert worker.disconnect_count >= 1
    assert worker.current_backoff > 0.01
