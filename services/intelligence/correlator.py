from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from packages.database.models.hypertables import MarketCandleModel
from packages.database.models.intelligence import EventCorrelationModel, SocialMetricModel
from packages.domain.intelligence import EventCorrelation, SocialMetric
from packages.domain.market import Candle
from packages.events.client import RedisClient
from packages.events.streams import RedisStreamPublisher

logger = structlog.get_logger(__name__)

STREAM_INTELLIGENCE_CORRELATIONS = "stream:intelligence:correlations"


class CorrelationEngine:
    """Market and Event Correlation Engine.
    
    Fuses social velocity surges (>100%) and breaking news with F2 volume (>30%)
    and price breakouts, publishing compound correlated events to Redis Streams.
    """

    def __init__(
        self,
        publisher: RedisStreamPublisher | None = None,
        velocity_threshold_pct: Decimal = Decimal("100.0"),
        volume_threshold_pct: Decimal = Decimal("30.0"),
    ) -> None:
        self._publisher = publisher
        self._velocity_threshold = velocity_threshold_pct
        self._volume_threshold = volume_threshold_pct
        self._correlations_detected_count = 0

    @property
    def correlations_detected_count(self) -> int:
        return self._correlations_detected_count

    def evaluate_correlation(
        self,
        symbol: str,
        social_velocity: Decimal,
        curr_volume: Decimal,
        prev_volume: Decimal,
        curr_price: Decimal | None = None,
        prev_price: Decimal | None = None,
        as_of: datetime | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> EventCorrelation | None:
        """Evaluate if social velocity and market volume satisfy compound anomaly criteria."""
        # Calculate volume percentage change
        if prev_volume > Decimal("0"):
            volume_change_pct = Decimal(str(round(((curr_volume - prev_volume) / prev_volume) * Decimal("100"), 2)))
        elif curr_volume > Decimal("0"):
            volume_change_pct = Decimal("100.00")
        else:
            volume_change_pct = Decimal("0.00")

        # Calculate price percentage change if prices provided
        price_change_pct: Decimal | None = None
        if curr_price is not None and prev_price is not None and prev_price > Decimal("0"):
            price_change_pct = Decimal(str(round(((curr_price - prev_price) / prev_price) * Decimal("100"), 2)))

        # Anomaly Check: social velocity > 100% AND volume anomaly > 30%
        if social_velocity >= self._velocity_threshold and volume_change_pct >= self._volume_threshold:
            self._correlations_detected_count += 1
            correlation_id = uuid.uuid4()
            timestamp = as_of or datetime.now(timezone.utc)

            details: dict[str, Any] = {
                "social_velocity_pct": str(social_velocity),
                "volume_change_pct": str(volume_change_pct),
                "curr_volume": str(curr_volume),
                "prev_volume": str(prev_volume),
            }
            if price_change_pct is not None:
                details["price_change_pct"] = str(price_change_pct)
            if metadata:
                details.update(metadata)

            correlation = EventCorrelation(
                id=correlation_id,
                symbol=symbol.upper(),
                timestamp=timestamp,
                correlation_type="social_volume_breakout",
                social_velocity=social_velocity,
                volume_change=volume_change_pct,
                price_change=price_change_pct,
                details=details,
            )

            logger.info(
                "compound_correlation_event_detected",
                symbol=correlation.symbol,
                social_velocity=str(social_velocity),
                volume_change=str(volume_change_pct),
                price_change=str(price_change_pct),
            )
            return correlation

        return None

    async def publish_correlation_event(
        self,
        correlation: EventCorrelation,
    ) -> str | None:
        """Publish correlated event to Redis Streams."""
        if not self._publisher:
            logger.debug("no_redis_publisher_configured_skipping_publish")
            return None

        payload = {
            "id": str(correlation.id),
            "symbol": correlation.symbol,
            "timestamp": correlation.timestamp.isoformat(),
            "correlation_type": correlation.correlation_type,
            "social_velocity": str(correlation.social_velocity),
            "volume_change": str(correlation.volume_change),
            "price_change": str(correlation.price_change) if correlation.price_change is not None else "0.0",
            "details": correlation.details,
            "trading_mode": correlation.trading_mode.value,
        }

        msg_id = await self._publisher.publish(
            stream=STREAM_INTELLIGENCE_CORRELATIONS,
            message=payload,
        )
        logger.info("published_correlation_event_to_redis", stream=STREAM_INTELLIGENCE_CORRELATIONS, msg_id=msg_id)
        return msg_id

    async def persist_correlation(
        self,
        session: AsyncSession,
        correlation: EventCorrelation,
    ) -> EventCorrelationModel:
        """Persist EventCorrelation record to TimescaleDB."""
        model = EventCorrelationModel(
            id=correlation.id,
            symbol=correlation.symbol,
            timestamp=correlation.timestamp,
            correlation_type=correlation.correlation_type,
            social_velocity=correlation.social_velocity,
            volume_change=correlation.volume_change,
            price_change=correlation.price_change,
            details=correlation.details,
            trading_mode=correlation.trading_mode.value,
        )
        session.add(model)
        await session.flush()
        return model
