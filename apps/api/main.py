from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from apps.api.routers.analytics import router as analytics_router
from apps.api.routers.health import router as health_router
from apps.api.routers.markets import router as markets_router
from apps.api.routers.risk import router as risk_router
from apps.api.routers.intelligence import router as intelligence_router
from apps.api.routers.portfolio import router as portfolio_router
from apps.api.routers.reconciliation import router as reconciliation_router
from apps.api.routers.backtesting import router as backtesting_router
from apps.api.routers.tools import router as tools_router
from apps.api.routers.auth import router as auth_router
from apps.api.routers.websocket import router as websocket_router
from apps.api.routers.owner import router as owner_router
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
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(markets_router)
    app.include_router(risk_router)
    app.include_router(intelligence_router)


    app.include_router(portfolio_router)
    app.include_router(reconciliation_router)
    app.include_router(analytics_router)
    app.include_router(backtesting_router)
    app.include_router(tools_router)
    app.include_router(auth_router)
    app.include_router(websocket_router)
    app.include_router(owner_router)
    from apps.api.routers.trading import router as trading_router
    from apps.api.routers.exchange import router as exchange_router
    from apps.api.routers.live import router as live_router
    app.include_router(trading_router)
    app.include_router(exchange_router)
    app.include_router(live_router)
    return app


app = create_app()
