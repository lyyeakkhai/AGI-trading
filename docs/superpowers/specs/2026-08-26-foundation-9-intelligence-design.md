# Foundation 9: Social and News Intelligence — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F9 of 13
**Depends on:** F0, F1, F2
**Unlocks:** Enriches F11, F12
**Blueprint tasks:** 9.1 – 9.8

---

## 1. Purpose

Foundation 9 provides the qualitative context behind quantitative market movements. By tracking social mention velocity, measuring social sentiment, and categorizing breaking news, it allows the trading agents to understand *why* a market is moving, reducing false positives during news-driven volatility.

---

## 2. Scope

### In scope
- **Ingestion Workers:** Resilient streaming from X (Twitter) and periodic polling of crypto news feeds.
- **Local NLP Scoring:** Fast, zero-token-cost sentiment and spam classification using local Python libraries (e.g., `vaderSentiment`).
- **Metric Aggregation:** Window-based aggregation of mention velocity, unique authors, and sentiment.
- **Correlation Engine:** Fusing social velocity spikes with F2 volume/price anomalies.
- **Safety Boundary:** Ensuring qualitative data can never autonomously trigger a trade execution.
- **TimescaleDB Persistence:** Storing `social_metrics` and `news_events`.

### Out of scope
- Autonomous trade execution based purely on news (prohibited by PRD).
- Multi-agent LLM debate over news meaning (F10).
- Frontend dashboard UI (F11).

---

## 3. Architecture & Components

### 3.1 Ingestion Workers (`services/intelligence/`)
Two background services handle raw data collection:
- **Social Worker:** Maintains a persistent streaming connection to the X API filtering for target cashtags. It uses resilient error handling and exponential backoff to survive API limits and network drops.
- **News Worker:** Periodically polls standard RSS/JSON crypto news endpoints, normalizing items into a standard `NewsEvent` schema with an assigned importance tier.

### 3.2 Scoring & Aggregation
To process the firehose of social data without incurring LLM costs or latency, the system uses a local NLP library (`vaderSentiment`) to score the polarity (-1.0 to +1.0) of each post. Basic heuristics flag spam (excessive tags/links). The engine aggregates these raw scores into rolling time windows (e.g., 15m) to calculate "Mention Velocity" (percentage change in chatter) and consensus sentiment.

### 3.3 The Correlation Engine
The correlator acts as a fusion layer. It subscribes to F2 market data streams and F9 social metrics. If a predefined anomaly aligns (e.g., social mention velocity > 100% concurrently with a 15m volume breakout > 30%), the engine publishes an `intelligence.correlated_event` to Redis Streams. This flags the technical breakout as "news-driven" for future agents.

### 3.4 Safety Boundaries & Access
F9 is strictly an enrichment layer. 
- It exposes REST endpoints (`/api/v1/intelligence/*`) and prepares the internal tool schemas (`research.get_news`) that the Hermes agent (F8) will eventually call.
- A dedicated test suite (`test_intelligence_safety.py`) enforces the invariant that extreme news or social events cannot bypass the quantitative opportunity scanner or directly trigger order placement.

---

## 4. Acceptance Criteria

- **AC-9.1**: TimescaleDB hypertables created for `social_metrics` (with explicit window), `news_events`, and `event_correlations`.
- **AC-9.2**: Social worker streams from X, handling network disconnects cleanly.
- **AC-9.3**: Social normalization computes mention velocity, sentiment (-1.0 to +1.0) via local NLP, and spam scores.
- **AC-9.4**: News worker normalizes items into `NewsEvent` records with importance ratings.
- **AC-9.5**: Correlation engine flags compound events (social spike + price/volume breakout) and publishes to Redis.
- **AC-9.6**: REST API endpoints return queryable social metrics and news.
- **AC-9.7**: Hermes intelligence tool interfaces (`research.get_news`, etc.) are scaffolded.
- **AC-9.8**: Safety tests definitively prove that news/social signals cannot independently generate proposals or orders.
