# Foundation 9: Social and News Intelligence — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the background streaming workers for social and news data, implement local NLP sentiment scoring, build the correlation engine, and expose REST APIs for the intelligence layer.

**Tech Stack:** Python 3.12, vaderSentiment, httpx, SQLAlchemy (asyncpg), TimescaleDB.

## Global Constraints
- **Local NLP Only:** Do NOT use OpenAI, Anthropic, or any remote LLM API for sentiment scoring. Use lightweight local libraries (`vaderSentiment` or similar regex heuristics).
- **Safety Boundary:** Never import or call execution/portfolio services from the intelligence layer.
- Commit after every task: `feat(f9): task 9.X - description`

---

### Task 9.1: Database Schemas for Intelligence Layer

**Files:**
- Create: `packages/database/models/intelligence.py`
- Modify: migrations.

**Steps:**
- Define `SocialMetric` (hypertable, explicit `window` column).
- Define `NewsEvent` (hypertable or indexed table by timestamp).
- Define `EventCorrelation` (hypertable).
- Generate and run Alembic migration.
- Commit: `feat(f9): task 9.1 - database schemas for social metrics and news events`

---

### Task 9.2: Social Streaming Worker (X API)

**Files:**
- Create: `services/intelligence/social_worker.py`

**Steps:**
- Build `SocialWorker` using `httpx` to stream from a mock or real X API endpoint (use mock/stub behavior if `X_API_TOKEN` is placeholder).
- Implement exponential backoff for disconnects.
- Commit: `feat(f9): task 9.2 - social streaming worker with backoff`

---

### Task 9.3: Social Metrics Normalization & Local NLP

**Files:**
- Create: `services/intelligence/nlp.py`
- Modify: `services/intelligence/social_worker.py`
- Create: `tests/unit/test_nlp.py`

**Steps:**
- Add `vaderSentiment` (or similar) to `pyproject.toml` (quant/core group). Run `uv sync`.
- Implement `analyze_sentiment(text) -> float` mapping to -1.0 to 1.0.
- Implement basic spam heuristic (reject if > 3 URLs or > 5 cashtags).
- Aggregate valid posts into time windows and save `SocialMetric` to DB.
- Commit: `feat(f9): task 9.3 - local nlp sentiment scoring and metric aggregation`

---

### Task 9.4: Crypto News Ingestion Worker

**Files:**
- Create: `services/intelligence/news_worker.py`

**Steps:**
- Build `NewsWorker` that polls predefined RSS/JSON feeds periodically.
- Normalize items into `NewsEvent` and categorize importance via keyword matching.
- Commit: `feat(f9): task 9.4 - crypto news ingestion and categorization`

---

### Task 9.5: Market and Event Correlation Engine

**Files:**
- Create: `services/intelligence/correlator.py`

**Steps:**
- Build `CorrelationEngine` that checks recent `SocialMetric` velocity against F2 market data.
- If social velocity > 100% and volume > 30% anomaly, publish `intelligence.correlated_event` to Redis.
- Commit: `feat(f9): task 9.5 - market and event correlation engine`

---

### Task 9.6: Intelligence REST API Endpoints

**Files:**
- Create: `apps/api/routers/intelligence.py`
- Modify: `apps/api/main.py`

**Steps:**
- Implement `GET /api/v1/intelligence/social`, `/news`, and `/correlations`.
- Mount router.
- Commit: `feat(f9): task 9.6 - intelligence rest api endpoints`

---

### Task 9.7: Hermes Intelligence Tool Integrations

**Files:**
- Create: `packages/hermes_tools/intelligence.py`

**Steps:**
- Scaffold the function signatures `get_news(symbol, timeframe)` and `get_social_trends(symbol, timeframe)` that F8 will eventually bind to the LLM.
- Have them return structured dicts queried from the database.
- Commit: `feat(f9): task 9.7 - hermes intelligence tool interfaces`

---

### Task 9.8: Safety and Constraint Test Suite

**Files:**
- Create: `tests/safety/test_intelligence_safety.py`

**Steps:**
- Write tests proving the social worker cannot mutate `portfolio_accounts` or `execution_requests`.
- Write tests verifying NLP scores are deterministic.
- Run `uv run pytest tests/safety/test_intelligence_safety.py`, `uv run mypy`, and `uv run ruff`.
- Commit and Push: `feat(f9): task 9.8 - safety constraints and intelligence test suite`
