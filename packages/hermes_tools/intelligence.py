from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.intelligence import (
    EventCorrelationModel,
    NewsEventModel,
    SocialMetricModel,
)


async def get_news(
    symbol: str,
    timeframe: str = "1h",
    limit: int = 10,
    category: str | None = None,
    session: AsyncSession | None = None,
) -> list[dict[str, Any]]:
    """Fetch structured news events for an asset symbol and timeframe.
    
    Hermes Tool: research.get_news
    """
    clean_symbol = symbol.split("/")[0].upper()

    if session is not None:
        stmt = select(NewsEventModel)
        if category:
            stmt = stmt.where(NewsEventModel.category == category.lower())
        stmt = stmt.order_by(NewsEventModel.timestamp.desc()).limit(limit * 2)
        records = list((await session.execute(stmt)).scalars().all())

        # Filter for asset in assets list
        filtered = [r for r in records if clean_symbol in r.assets][:limit]
        return [
            {
                "id": str(r.id),
                "timestamp": r.timestamp.isoformat(),
                "source": r.source,
                "headline": r.headline,
                "summary": r.summary,
                "category": r.category,
                "importance": r.importance,
                "sentiment_score": str(r.sentiment_score) if r.sentiment_score is not None else "0.0",
                "assets": r.assets,
            }
            for r in filtered
        ]

    # Offline / default response structure for tool testing
    return [
        {
            "id": "mock_news_1",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "crypto_news_wire",
            "headline": f"{clean_symbol} Market Momentum Continues Amid Strong Spot Demand",
            "summary": f"Trading volumes and institutional interest for {clean_symbol} show strong upside continuation.",
            "category": "market",
            "importance": "MEDIUM",
            "sentiment_score": "0.4500",
            "assets": [clean_symbol],
        }
    ]


async def get_social_trends(
    symbol: str,
    timeframe: str = "1h",
    window: str = "15m",
    session: AsyncSession | None = None,
) -> dict[str, Any]:
    """Fetch latest social sentiment score, mention count, and mention velocity.
    
    Hermes Tool: research.get_social_trends
    """
    clean_symbol = symbol.split("/")[0].upper()

    if session is not None:
        stmt = (
            select(SocialMetricModel)
            .where(
                SocialMetricModel.symbol == clean_symbol,
                SocialMetricModel.window == window,
            )
            .order_by(SocialMetricModel.timestamp.desc())
            .limit(1)
        )
        record = (await session.execute(stmt)).scalar_one_or_none()
        if record is not None:
            return {
                "symbol": record.symbol,
                "window": record.window,
                "sentiment_score": str(record.sentiment_score),
                "volume_mentions": record.volume_mentions,
                "source": record.source,
                "timestamp": record.timestamp.isoformat(),
            }

    # Default baseline trends structure
    return {
        "symbol": clean_symbol,
        "window": window,
        "sentiment_score": "0.3500",
        "volume_mentions": 120,
        "source": "x_stream",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def search_market_events(
    symbol: str,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    limit: int = 20,
    session: AsyncSession | None = None,
) -> list[dict[str, Any]]:
    """Search correlated market and social anomalies.
    
    Hermes Tool: research.search_market_events
    """
    clean_symbol = symbol.split("/")[0].upper()

    if session is not None:
        stmt = select(EventCorrelationModel).where(
            EventCorrelationModel.symbol == clean_symbol
        )
        if start_time is not None:
            stmt = stmt.where(EventCorrelationModel.timestamp >= start_time)
        if end_time is not None:
            stmt = stmt.where(EventCorrelationModel.timestamp <= end_time)

        stmt = stmt.order_by(EventCorrelationModel.timestamp.desc()).limit(limit)
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
            }
            for r in records
        ]

    return []
