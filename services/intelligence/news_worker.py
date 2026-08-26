from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from decimal import Decimal
import random
from typing import Any
import uuid

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from packages.config import Settings, get_settings
from packages.database.models.intelligence import NewsEventModel
from packages.domain.intelligence import NewsCategory, NewsEvent, NewsImportance
from services.intelligence.nlp import analyze_sentiment

logger = structlog.get_logger(__name__)

# Category keyword dictionaries
_CATEGORY_KEYWORDS = {
    NewsCategory.REGULATORY: [
        "sec", "cftc", "regulator", "regulation", "lawsuit", "court", "judge", "doj", "congress",
        "bill", "legislation", "sanction", "compliance", "subpoena", "ban", "legal",
    ],
    NewsCategory.EXCHANGE: [
        "binance", "coinbase", "kraken", "okx", "bybit", "listing", "delisting", "exchange",
        "insolvency", "withdrawal halted", "trading halted",
    ],
    NewsCategory.ETF: [
        "etf", "spot etf", "blackrock", "fidelity", "s-1", "19b-4", "etf approval", "etf outflow", "etf inflow",
    ],
    NewsCategory.MACROECONOMIC: [
        "cpi", "fed", "federal reserve", "rate cut", "rate hike", "inflation", "fomc", "powell",
        "treasury", "interest rates", "jobs report", "gdp",
    ],
    NewsCategory.SECURITY: [
        "hack", "hacked", "exploit", "exploited", "stolen", "drained", "vulnerability", "breach",
        "private key", "flash loan",
    ],
    NewsCategory.PROTOCOL: [
        "upgrade", "hard fork", "soft fork", "mainnet", "testnet", "eip", "halving", "validator",
        "consensus", "layer 2", "zero knowledge",
    ],
    NewsCategory.INSTITUTIONAL: [
        "microstrategy", "saylor", "institutional", "pension fund", "treasury reserve", "corporate buy",
    ],
    NewsCategory.STABLECOIN: [
        "usdt", "usdc", "tether", "circle", "depeg", "stablecoin", "backing",
    ],
}

_CRITICAL_KEYWORDS = [
    "sec approves", "etf approved", "exchange hacked", "billion stolen", "emergency rate",
    "trading halted", "insolvency", "doj indicts", "ban passed",
]

_HIGH_KEYWORDS = [
    "lawsuit", "rate decision", "halving", "fomc", "cpi", "blackrock", "million exploit",
    "delisting", "sec charges",
]

_MEDIUM_KEYWORDS = [
    "protocol upgrade", "mainnet launch", "institutional inflow", "partnership",
    "layer 2", "etf inflow",
]


class NewsWorker:
    """Crypto News Ingestion Worker that categorizes news and rates importance."""

    def __init__(
        self,
        settings: Settings | None = None,
        poll_interval_seconds: int | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._poll_interval = (
            poll_interval_seconds
            or self._settings.intelligence.poll_interval_seconds
        )
        self._running = False
        self._task: asyncio.Task[None] | None = None
        self._events_ingested_count = 0

    @property
    def is_running(self) -> bool:
        return self._running

    @property
    def events_ingested_count(self) -> int:
        return self._events_ingested_count

    def categorize_event(self, text: str) -> str:
        """Determine news category based on keyword density."""
        text_lower = text.lower()
        best_category = NewsCategory.GENERAL.value
        max_matches = 0

        for category, keywords in _CATEGORY_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            if matches > max_matches:
                max_matches = matches
                best_category = category.value

        return best_category

    def assign_importance(self, text: str) -> str:
        """Assign importance level (LOW, MEDIUM, HIGH, CRITICAL) to news item."""
        text_lower = text.lower()
        for kw in _CRITICAL_KEYWORDS:
            if kw in text_lower:
                return NewsImportance.CRITICAL.value
        for kw in _HIGH_KEYWORDS:
            if kw in text_lower:
                return NewsImportance.HIGH.value
        for kw in _MEDIUM_KEYWORDS:
            if kw in text_lower:
                return NewsImportance.MEDIUM.value
        return NewsImportance.LOW.value

    def extract_assets(self, text: str) -> list[str]:
        """Extract affected crypto assets from headline and text."""
        text_upper = text.upper()
        assets: list[str] = []
        if "BTC" in text_upper or "BITCOIN" in text_upper:
            assets.append("BTC")
        if "ETH" in text_upper or "ETHEREUM" in text_upper:
            assets.append("ETH")
        if not assets:
            assets.append("BTC")
        return assets

    def normalize_item(
        self,
        headline: str,
        summary: str,
        source: str = "crypto_feed",
        source_url: str | None = None,
        timestamp: datetime | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> NewsEvent:
        """Normalize raw news item into a structured NewsEvent."""
        full_text = f"{headline} {summary}"
        category = self.categorize_event(full_text)
        importance = self.assign_importance(full_text)
        assets = self.extract_assets(full_text)
        sentiment = analyze_sentiment(full_text)

        event = NewsEvent(
            id=uuid.uuid4(),
            timestamp=timestamp or datetime.now(timezone.utc),
            source=source,
            headline=headline.strip(),
            summary=summary.strip(),
            assets=assets,
            category=category,
            importance=importance,
            sentiment_score=sentiment,
            source_url=source_url,
            metadata=metadata or {},
        )
        self._events_ingested_count += 1
        return event

    async def persist_news_event(
        self,
        session: AsyncSession,
        event: NewsEvent,
    ) -> NewsEventModel:
        """Persist structured NewsEvent to TimescaleDB."""
        model = NewsEventModel(
            id=event.id,
            timestamp=event.timestamp,
            source=event.source,
            headline=event.headline,
            summary=event.summary,
            assets=event.assets,
            category=event.category,
            importance=event.importance,
            sentiment_score=event.sentiment_score,
            source_url=event.source_url,
            metadata_payload=event.metadata,
            trading_mode=event.trading_mode.value,
        )
        session.add(model)
        await session.flush()
        return model

    async def poll_mock_feed(self) -> list[NewsEvent]:
        """Fetch synthetic crypto news items for testing/simulation."""
        mock_templates = [
            ("SEC Approves Spot Bitcoin ETF Applications from Major Issuers", "The Securities and Exchange Commission has approved 11 spot bitcoin ETF applications in a landmark regulatory decision.", "regulatory", "CRITICAL", ["BTC"]),
            ("Ethereum Dencun Upgrade Goes Live on Mainnet", "Ethereum network successfully completes major hard fork reducing layer 2 transaction fees significantly.", "protocol", "HIGH", ["ETH"]),
            ("Federal Reserve Cuts Interest Rates by 50 Basis Points", "Federal Reserve announced a 50 bps interest rate cut following FOMC meeting, boosting liquidity across risk assets.", "macroeconomic", "HIGH", ["BTC", "ETH"]),
            ("Leading Exchange Reports Temporary Maintenance Outage", "Binance reported brief scheduled maintenance on spot order books with no customer funds impacted.", "exchange", "MEDIUM", ["BTC", "ETH"]),
            ("MicroStrategy Purchases Additional 12,000 BTC", "MicroStrategy acquired an additional 12,000 bitcoins for approximately $800 million in cash reserves.", "institutional", "HIGH", ["BTC"]),
        ]
        chosen = random.sample(mock_templates, k=min(2, len(mock_templates)))
        events: list[NewsEvent] = []
        for headline, summary, cat, imp, assets in chosen:
            sentiment = analyze_sentiment(f"{headline} {summary}")
            ev = NewsEvent(
                id=uuid.uuid4(),
                timestamp=datetime.now(timezone.utc),
                source="mock_crypto_wire",
                headline=headline,
                summary=summary,
                assets=assets,
                category=cat,
                importance=imp,
                sentiment_score=sentiment,
                source_url="https://news.crypto.local/item",
                metadata={"mock": True},
            )
            events.append(ev)
            self._events_ingested_count += 1
        return events
