from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Union

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from packages.config.settings import DatabaseSettings, Settings, get_settings


def get_engine(settings: Union[Settings, DatabaseSettings, None] = None) -> AsyncEngine:
    """Creates and returns an async SQLAlchemy engine using asyncpg."""
    if settings is None:
        db_settings = get_settings().database
    elif isinstance(settings, Settings):
        db_settings = settings.database
    elif isinstance(settings, DatabaseSettings):
        db_settings = settings
    else:
        raise TypeError(f"Expected Settings or DatabaseSettings, got {type(settings)}")

    engine = create_async_engine(
        db_settings.url,
        pool_size=db_settings.pool_size,
        connect_args={
            "server_settings": {
                "statement_timeout": str(db_settings.statement_timeout_ms)
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


_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_global_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        _engine = get_engine()
    return _engine


def get_global_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = get_session_factory(get_global_engine())
    return _session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    factory = get_global_session_factory()
    async with AsyncSessionContext(factory) as session:
        yield session
