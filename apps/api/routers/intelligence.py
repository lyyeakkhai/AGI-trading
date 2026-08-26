from __future__ import annotations

from datetime import datetime
from typing import Any
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import get_settings
from packages.database import get_engine, get_session_factory
from packages.database.models.intelligence import (
    EventCorrelationModel,
    NewsEventModel,
    SocialMetricModel,
)

router = APIRouter(prefix="/api/v1/intelligence", tags=["intelligence"])


async def get_db_session() -> Any:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    async with session_factory() as session:
        yield session


def verify_intelligence_access(
    authorization: str | None = Header(None, alias="Authorization"),
    x_service_token: str | None = Header(None, alias="X-Service-Token"),
    x_owner_secret: str | None = Header(None, alias="X-Owner-Secret"),
) -> str:
    """Verify that request comes from owner dashboard session or authorized Hermes service."""
    settings = get_settings()
    token = None
    if x_service_token:
        token = x_service_token
    elif x_owner_secret:
        token = x_owner_secret
    elif authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    # Allow in development if no secrets are configured
    if not settings.auth.dashboard_auth_secret and not settings.hermes.service_token:
        return "development_anonymous"

    # Match against owner secret or hermes service token
    if token:
        if settings.auth.dashboard_auth_secret and token == settings.auth.dashboard_auth_secret:
            return "owner"
        if settings.hermes.service_token and token == settings.hermes.service_token:
            return "hermes"

    # Default to read access for local API calls if unauthenticated
    return "read_only"


@router.get("/social")
async def get_social_metrics(
    symbol: str | None = Query(None, description="Filter by asset symbol (e.g. BTC, ETH)"),
    window: str = Query("15m", description="Rolling window (1m, 15m, 1h)"),
    source: str | None = Query(None, description="Filter by data source (e.g. x_stream)"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    _auth: str = Depends(verify_intelligence_access),
) -> list[dict[str, Any]]:
    """Query historical and real-time social metrics."""
    stmt = select(SocialMetricModel).where(SocialMetricModel.window == window)
    if symbol is not None:
        stmt = stmt.where(SocialMetricModel.symbol == symbol.upper())
    if source is not None:
        stmt = stmt.where(SocialMetricModel.source == source)

    stmt = stmt.order_by(SocialMetricModel.timestamp.desc()).offset(offset).limit(limit)
    records = list((await session.execute(stmt)).scalars().all())

    return [
        {
            "symbol": r.symbol,
            "window": r.window,
            "sentiment_score": str(r.sentiment_score),
            "volume_mentions": r.volume_mentions,
            "source": r.source,
            "timestamp": r.timestamp.isoformat(),
        }
        for r in records
    ]


@router.get("/news")
async def get_news_events(
    asset: str | None = Query(None, description="Filter by affected asset symbol"),
    category: str | None = Query(None, description="Filter by category (regulatory, ETF, etc.)"),
    importance: str | None = Query(None, description="Filter by importance (LOW, MEDIUM, HIGH, CRITICAL)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    _auth: str = Depends(verify_intelligence_access),
) -> list[dict[str, Any]]:
    """Query ingested cryptocurrency news events."""
    stmt = select(NewsEventModel)
    if category is not None:
        stmt = stmt.where(NewsEventModel.category == category.lower())
    if importance is not None:
        stmt = stmt.where(NewsEventModel.importance == importance.upper())

    stmt = stmt.order_by(NewsEventModel.timestamp.desc()).offset(offset).limit(limit)
    records = list((await session.execute(stmt)).scalars().all())

    if asset is not None:
        target_asset = asset.upper()
        records = [r for r in records if target_asset in r.assets]

    return [
        {
            "id": str(r.id),
            "timestamp": r.timestamp.isoformat(),
            "source": r.source,
            "headline": r.headline,
            "summary": r.summary,
            "assets": r.assets,
            "category": r.category,
            "importance": r.importance,
            "sentiment_score": str(r.sentiment_score) if r.sentiment_score is not None else None,
            "source_url": r.source_url,
            "metadata": r.metadata_payload,
            "trading_mode": r.trading_mode,
        }
        for r in records
    ]


@router.get("/correlations")
async def get_correlations(
    symbol: str | None = Query(None, description="Filter by symbol"),
    correlation_type: str | None = Query(None, description="Filter by correlation type"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    _auth: str = Depends(verify_intelligence_access),
) -> list[dict[str, Any]]:
    """Query compound social-market event correlations."""
    stmt = select(EventCorrelationModel)
    if symbol is not None:
        stmt = stmt.where(EventCorrelationModel.symbol == symbol.upper())
    if correlation_type is not None:
        stmt = stmt.where(EventCorrelationModel.correlation_type == correlation_type)

    stmt = stmt.order_by(EventCorrelationModel.timestamp.desc()).offset(offset).limit(limit)
    records = list((await session.execute(stmt)).scalars().all())

    return [
        {
            "id": str(r.id),
            "symbol": r.symbol,
            "timestamp": r.timestamp.isoformat(),
            "correlation_type": r.correlation_type,
            "social_velocity": str(r.social_velocity),
            "volume_change": str(r.volume_change),
            "price_change": str(r.price_change) if r.price_change is not None else None,
            "details": r.details,
            "trading_mode": r.trading_mode,
        }
        for r in records
    ]
