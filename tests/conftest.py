from collections.abc import AsyncGenerator
import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.main import app
from packages.config import get_settings
from packages.database import get_engine, get_session_factory
from packages.database.engine import AsyncSessionContext
from packages.events.client import RedisClient


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    async with AsyncSessionContext(session_factory) as session:
        yield session
    await engine.dispose()


@pytest.fixture
async def redis_client() -> AsyncGenerator[RedisClient, None]:
    client = RedisClient()
    await client.connect()
    yield client
    await client.disconnect()


@pytest.fixture
async def client() -> AsyncGenerator[httpx.AsyncClient, None]:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
