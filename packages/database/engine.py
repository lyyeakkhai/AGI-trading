from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from packages.config.settings import DatabaseSettings, Settings, get_settings


def get_engine(settings: Optional[Union[Settings, DatabaseSettings]] = None) -> AsyncEngine:
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
