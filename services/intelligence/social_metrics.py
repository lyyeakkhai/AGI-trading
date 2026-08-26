from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from packages.database.models.intelligence import SocialMetricModel
from packages.domain.intelligence import SocialMetric
from services.intelligence.nlp import analyze_sentiment, calculate_spam_score
from services.intelligence.x_client import RawPost

logger = structlog.get_logger(__name__)

WINDOW_SECONDS = {
    "1m": 60,
    "15m": 900,
    "1h": 3600,
}


class ProcessedPost:
    __slots__ = ("id", "symbol", "author_id", "sentiment", "spam_score", "timestamp")

    def __init__(
        self,
        id: str,
        symbol: str,
        author_id: str,
        sentiment: Decimal,
        spam_score: Decimal,
        timestamp: float,
    ) -> None:
        self.id = id
        self.symbol = symbol
        self.author_id = author_id
        self.sentiment = sentiment
        self.spam_score = spam_score
        self.timestamp = timestamp


class SocialMetricsEngine:
    """Normalizes raw social posts into rolling multi-window metrics."""

    def __init__(
        self,
        spam_threshold: Decimal = Decimal("0.6"),
        windows: list[str] | None = None,
    ) -> None:
        self._spam_threshold = spam_threshold
        self._windows = windows or ["1m", "15m", "1h"]
        # History buffers per symbol: deque of ProcessedPost
        self._posts_by_symbol: dict[str, deque[ProcessedPost]] = defaultdict(deque)
        # Previous window counts for velocity calculation
        self._prev_window_counts: dict[tuple[str, str], int] = defaultdict(int)

    def process_post(self, post: RawPost) -> ProcessedPost | None:
        """Score post sentiment and spam. Filter spam and retain valid posts."""
        spam_score = calculate_spam_score(post.text, post.author_id, post.metadata)
        if spam_score >= self._spam_threshold:
            logger.debug("post_filtered_as_spam", post_id=post.id, spam_score=str(spam_score))
            return None

        sentiment = analyze_sentiment(post.text)
        processed = ProcessedPost(
            id=post.id,
            symbol=post.symbol.upper(),
            author_id=post.author_id,
            sentiment=sentiment,
            spam_score=spam_score,
            timestamp=post.created_at.timestamp(),
        )

        symbol = post.symbol.upper()
        self._posts_by_symbol[symbol].append(processed)

        # Prune old posts beyond maximum window (e.g., 2 hours)
        cutoff = post.created_at.timestamp() - 7200
        while self._posts_by_symbol[symbol] and self._posts_by_symbol[symbol][0].timestamp < cutoff:
            self._posts_by_symbol[symbol].popleft()

        return processed

    def calculate_window_metric(
        self,
        symbol: str,
        window: str = "15m",
        as_of: datetime | None = None,
    ) -> SocialMetric:
        """Calculate aggregated social metrics for a symbol over a specific window."""
        now_dt = as_of or datetime.now(timezone.utc)
        now_ts = now_dt.timestamp()
        window_sec = WINDOW_SECONDS.get(window, 900)

        window_start = now_ts - window_sec
        prev_window_start = now_ts - (2 * window_sec)

        symbol = symbol.upper()
        posts = self._posts_by_symbol[symbol]

        curr_posts = [p for p in posts if window_start <= p.timestamp <= now_ts]
        prev_posts_count = len([p for p in posts if prev_window_start <= p.timestamp < window_start])

        if prev_posts_count == 0 and (symbol, window) in self._prev_window_counts:
            prev_posts_count = self._prev_window_counts[(symbol, window)]

        curr_count = len(curr_posts)
        self._prev_window_counts[(symbol, window)] = curr_count

        # Mention velocity: percentage change
        if prev_posts_count > 0:
            velocity = Decimal(str(round(((curr_count - prev_posts_count) / prev_posts_count) * 100, 2)))
        elif curr_count > 0:
            velocity = Decimal("100.00")
        else:
            velocity = Decimal("0.00")

        # Unique authors
        unique_authors = len({p.author_id for p in curr_posts})

        # Average sentiment
        if curr_posts:
            avg_sentiment = Decimal(str(round(sum(p.sentiment for p in curr_posts) / Decimal(str(curr_count)), 4)))
            avg_spam = Decimal(str(round(sum(p.spam_score for p in curr_posts) / Decimal(str(curr_count)), 4)))
        else:
            avg_sentiment = Decimal("0.0000")
            avg_spam = Decimal("0.0000")

        return SocialMetric(
            symbol=symbol,
            timestamp=now_dt,
            window=window,
            sentiment_score=avg_sentiment,
            volume_mentions=curr_count,
            source="x_stream",
            unique_authors=unique_authors,
            mention_velocity=velocity,
            spam_score=avg_spam,
        )

    async def persist_metric(
        self,
        session: AsyncSession,
        metric: SocialMetric,
    ) -> SocialMetricModel:
        """Persist a social metric record to TimescaleDB."""
        model = SocialMetricModel(
            symbol=metric.symbol,
            timestamp=metric.timestamp,
            window=metric.window,
            sentiment_score=metric.sentiment_score,
            volume_mentions=metric.volume_mentions,
            source=metric.source,
        )
        session.add(model)
        await session.flush()
        return model
