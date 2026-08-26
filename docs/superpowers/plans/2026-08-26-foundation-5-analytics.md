# Foundation 5: Quantitative Analytics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the deterministic technical analysis library with TA-Lib graceful degradation, the TimescaleDB snapshot persistence worker, the market regime classifier, and the opportunity detection scanner.

**Tech Stack:** Python 3.12, NumPy, Pandas, SQLAlchemy (asyncpg), Redis Streams.

## Global Constraints
- **Graceful Degradation:** The system must never crash on boot if TA-Lib is absent. Always try/except the import and route to NumPy fallbacks.
- **Pure Math:** All logic in `packages/quant/` must be pure and stateless. It receives a Pandas DataFrame or arrays, and returns arrays/values. No DB or Redis calls.
- Commit after every task: `feat(f5): task 5.X - description`

---

### Task 5.1 & 5.2: Quant Library with TA-Lib Degradation

**Files:**
- Create: `packages/quant/indicators.py`
- Create: `packages/quant/fallback.py`
- Create: `tests/unit/test_indicators.py`

**Steps:**
- Implement `fallback.py` with pure Pandas/NumPy versions of SMA, EMA, RSI, MACD, ATR, and standard deviation.
- In `indicators.py`, attempt `import talib`. If successful, export TA-Lib wrappers. If `ImportError`, export functions from `fallback.py`.
- Write unit tests proving both paths produce the exact same mathematical results (within floating-point rounding margins).
- Commit: `feat(f5): task 5.1 and 5.2 - technical indicators with graceful degradation`

---

### Task 5.3: Market Structure & Volume Anomalies

**Files:**
- Create: `packages/quant/structure.py`

**Steps:**
- Implement swing high/low detection (local maxima/minima over a window).
- Implement RVOL (Relative Volume) calculation.
- Commit: `feat(f5): task 5.3 - market structure and volume anomaly detection`

---

### Task 5.4: Multi-Timeframe Regime Classifier

**Files:**
- Create: `packages/quant/regime.py`

**Steps:**
- Define `MarketRegime` enum (TRENDING_UP, TRENDING_DOWN, RANGING, HIGH_VOLATILITY, LOW_VOLATILITY, UNCERTAIN).
- Implement `classify_regime(df_15m, df_1h, df_4h)` that combines SMA slopes, ATR levels, and ADX (if available) to output a deterministic regime.
- Commit: `feat(f5): task 5.4 - multi-timeframe regime classifier`

---

### Task 5.5: Data-Driven Confidence Scoring

**Files:**
- Create: `packages/quant/scoring.py`

**Steps:**
- Implement a simple heuristic ruleset combining timeframe confluence, RVOL confirmation, and regime alignment to return LOW, MEDIUM, or HIGH confidence.
- Commit: `feat(f5): task 5.5 - deterministic confidence scoring engine`

---

### Task 5.6: Analytics Worker

**Files:**
- Create: `services/analytics/worker.py`

**Steps:**
- Build `AnalyticsWorker` that subscribes to F2 Redis streams (e.g., `stream:market:candles`).
- Maintains an in-memory sliding window of candle data (using Pandas or deque).
- On new candle, calculates updated indicators and regime.
- Commit: `feat(f5): task 5.6 - continuous analytics worker consuming market streams`

---

### Task 5.7: Opportunity Detection Scanner

**Files:**
- Create: `services/analytics/scanner.py`

**Steps:**
- Create `OpportunityScanner` that evaluates the latest state against basic structural rules.
- When triggered, constructs a JSON payload containing `opportunity_id` (uuid), `symbol`, `timeframe`, `regime`, `confidence`, and `snapshots`.
- Publishes to Redis `stream:market:opportunities`.
- Commit: `feat(f5): task 5.7 - deterministic opportunity detection scanner`

---

### Task 5.8: Indicator Snapshot Persistence

**Files:**
- Create: `packages/database/models/analytics.py` (for `indicator_snapshots` hypertable)
- Modify: `services/analytics/worker.py`

**Steps:**
- Batch insert the calculated indicators and regimes into TimescaleDB on every 15m/1h/4h candle close.
- Commit: `feat(f5): task 5.8 - indicator snapshot persistence to timescaledb`

---

### Task 5.9: REST API Endpoints

**Files:**
- Create: `apps/api/routers/analytics.py`
- Modify: `apps/api/main.py`

**Steps:**
- Expose `GET /api/v1/analytics/indicators` and `GET /api/v1/analytics/regime`.
- Mount router.
- Commit: `feat(f5): task 5.9 - analytics rest api endpoints`

---

### Task 5.10: Verification Test Suite

**Files:**
- Create: `tests/integration/test_analytics_pipeline.py`

**Steps:**
- Write tests simulating incoming F2 market data, ensuring the worker updates indicators, the scanner publishes to Redis, and snapshots land in the DB.
- Run `uv run pytest`, `uv run mypy`, and `uv run ruff`.
- Commit and Push: `feat(f5): task 5.10 - quant verification and scanner integration test suite`
