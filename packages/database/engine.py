from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from packages.config.settings import Settings, get_settings


def get_engine(settings: Optional[Settings] = None) -> AsyncEngine:
    """Creates and returns an async SQLAlchemy engine using asyncpg."""
    active_settings = settings or get_settings()
    engine = create_async_engine(
        active_settings.database.url,
        pool_size=active_settings.database.pool_size,
        connect_args={
            "server_settings": {
                "statement_timeout": str(active_settings.database.statement_timeout_ms)
            }
        },
        future=True,
    )
    return engine


def get_session_factory(
    engine: AsyncEngine,
) -> async_sessionmaker[AsyncSession]:
    """Returns an async session factory for the provided engine."""
    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


@asynccontextmanager
async def AsyncSessionContext(
    session_factory: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[AsyncSession, None]:
    """Async context manager that provides a transaction-managed session."""
    session = session_factory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()
