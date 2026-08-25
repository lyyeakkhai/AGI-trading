from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Response, status
import redis.asyncio as aioredis
from sqlalchemy import text

from packages.config import get_settings
from packages.database import get_engine
from packages.logging import get_logger
from services.market_data.health import get_global_health_monitor

router = APIRouter(prefix="/health", tags=["health"])
logger = get_logger("health")

EXPECTED_MIGRATION_HEAD = "0001"


@router.get("/live")
async def health_live() -> dict[str, Any]:
    """Returns 200 alive status while the API process is running."""
    settings = get_settings()
    return {
        "status": "alive",
        "service": settings.app.service_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready")
async def health_ready(response: Response) -> dict[str, Any]:
    """Checks database connectivity, Redis reachability, and schema migration head."""
    settings = get_settings()
    checks: dict[str, bool] = {
        "database": False,
        "redis": False,
        "migrations": False,
    }

    # 1. Database reachability check
    try:
        engine = get_engine(settings)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            if result.scalar() == 1:
                checks["database"] = True

            # 2. Migrations check
            try:
                mig_result = await conn.execute(
                    text("SELECT version_num FROM alembic_version LIMIT 1")
                )
                current_head = mig_result.scalar()
                if current_head == EXPECTED_MIGRATION_HEAD:
                    checks["migrations"] = True
            except Exception as e:
                logger.warning("migration_check_failed", error=str(e))
                checks["migrations"] = False
    except Exception as e:
        logger.warning("database_check_failed", error=str(e))
        checks["database"] = False

    # 3. Redis reachability check
    try:
        redis_client = aioredis.from_url(
            settings.redis.url,
            decode_responses=True,
            socket_timeout=2.0,
        )
        redis_ok = await redis_client.ping()
        await redis_client.aclose()
        if redis_ok:
            checks["redis"] = True
    except Exception as e:
        logger.warning("redis_check_failed", error=str(e))
        checks["redis"] = False

    all_ready = all(checks.values())
    if all_ready:
        return {
            "status": "ready",
            "checks": checks,
        }
    else:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "checks": checks,
        }


@router.get("/trading")
async def health_trading() -> dict[str, Any]:
    """Reports trading system readiness based on subsystem health."""
    reasons: list[dict[str, Any]] = []

    monitor = get_global_health_monitor()
    if monitor is not None and not monitor.is_ready:
        for r in monitor.stale_reasons:
            reasons.append({
                "code": "MARKET_DATA_NOT_READY",
                "detail": r,
                "message": f"Market data feed not ready: {r}",
            })
    elif monitor is None:
        reasons.append({
            "code": "MARKET_DATA_NOT_VERIFIED",
            "message": "Market data pipeline not built (Foundation 2)",
        })

    reasons.extend([
        {
            "code": "PORTFOLIO_NOT_VERIFIED",
            "message": "Portfolio accounting not built (Foundation 3)",
        },
        {
            "code": "RISK_ENGINE_NOT_VERIFIED",
            "message": "Risk engine not built (Foundation 4)",
        },
        {
            "code": "EXECUTION_NOT_VERIFIED",
            "message": "Execution service not built (Foundation 12)",
        },
    ])

    return {
        "status": "not_ready" if reasons else "ready",
        "ready_for_trading": len(reasons) == 0,
        "reasons": reasons,
    }
