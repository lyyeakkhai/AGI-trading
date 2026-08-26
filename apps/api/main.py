from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from fastapi import FastAPI

from apps.api.routers.analytics import router as analytics_router
from apps.api.routers.health import router as health_router
from apps.api.routers.markets import router as markets_router
from apps.api.routers.risk import router as risk_router
from apps.api.routers.intelligence import router as intelligence_router
from apps.api.routers.portfolio import router as portfolio_router
from apps.api.routers.reconciliation import router as reconciliation_router
from apps.api.routers.backtesting import router as backtesting_router
from packages.config import get_settings
from packages.database import get_engine
from packages.logging import configure_logging, get_logger


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    settings = get_settings()
    configure_logging(settings)
    logger = get_logger("main")
    logger.info("api_startup", service=settings.app.service_name, env=settings.app.env)

    # Initialize database engine
    engine = get_engine(settings)
    app.state.engine = engine

    yield

    # Shutdown
    logger.info("api_shutdown")
    await engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AI Trading Intelligence Platform API",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.include_router(health_router)
    app.include_router(markets_router)
    app.include_router(risk_router)
    app.include_router(intelligence_router)


    app.include_router(portfolio_router)
    app.include_router(reconciliation_router)
    app.include_router(analytics_router)
    app.include_router(backtesting_router)
    return app


app = create_app()
