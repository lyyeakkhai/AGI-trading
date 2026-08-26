# Foundation 5: Quantitative Analytics — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F5 of 13
**Depends on:** F0, F1, F2
**Unlocks:** F6, F8
**Blueprint tasks:** 5.1 – 5.10

---

## 1. Purpose

Foundation 5 builds the deterministic mathematical brain of the platform. It computes standard technical indicators, classifies the market regime across multiple timeframes, and continuously scans for structural trade setups. By publishing candidate opportunities to Redis Streams, it relieves the LLM agents from the expensive burden of continuous market monitoring.

---

## 2. Scope

### In scope
- **Quant Library:** Pure mathematical functions for indicators, market structure, and regime classification.
- **Graceful Degradation:** Seamless fallback from TA-Lib (C library) to NumPy/Pandas.
- **Analytics Worker:** Continuous consumption of F2 market streams to update live indicator states.
- **TimescaleDB Persistence:** Saving `indicator_snapshots` and regimes for backtesting.
- **Opportunity Scanner:** Data-driven confidence scoring and publishing of `opportunity.detected` events.
- **REST APIs:** Endpoints for querying live indicators and recent opportunities.

### Out of scope
- Strategy definition and backtesting (F6).
- AI agent prompt generation or decision making (F7/F8).
- Social/News sentiment analysis (F9).

---

## 3. Architecture & Components

### 3.1 The Quant Library (`packages/quant/`)
A pure Python library that exposes deterministic technical analysis functions (SMA, EMA, RSI, MACD, ATR, RVOL). 
- **Graceful Degradation:** The library attempts to import the fast `talib` C extension. If absent, it silently routes the math to perfectly equivalent NumPy/Pandas fallback functions. The platform continues to operate without degradation of functionality, only a slight CPU penalty.

### 3.2 Market Structure & Regime Classification
The library analyzes price action across three timeframes (15m, 1h, 4h).
- **Structure:** Identifies swing highs, swing lows, and support/resistance zones.
- **Regime Classifier:** Categorizes the market into one of six deterministic states: `TRENDING_UP`, `TRENDING_DOWN`, `RANGING`, `HIGH_VOLATILITY`, `LOW_VOLATILITY`, or `UNCERTAIN`.

### 3.3 Analytics Worker (`services/analytics/`)
A background supervisor that listens to the Redis candle streams published by Foundation 2. When a candle closes, it feeds the updated OHLCV data into the Quant Library. The resulting indicators and market regime are cached in memory for API access and batch-inserted into the TimescaleDB `indicator_snapshots` hypertable for historical analysis.

### 3.4 Opportunity Scanner & Confidence Engine
Operating alongside the Analytics Worker, the Scanner evaluates the fresh indicators against hardcoded structural setups. 
- **Confidence Scoring:** If a setup aligns, it calculates a purely mathematical confidence score (`LOW`, `MEDIUM`, `HIGH`) based on timeframe confluence and volume confirmation—no LLMs involved.
- **Event Publishing:** It publishes a structured `opportunity.detected` JSON payload to the Redis Stream `stream:market:opportunities`. Future agent workers will consume this stream to initiate trades.

---

## 4. Acceptance Criteria

- **AC-5.1**: Technical indicators (SMA, EMA, RSI, MACD, ATR, RVOL) are calculated deterministically with unit tests proving mathematical accuracy.
- **AC-5.2**: The system gracefully falls back to NumPy/Polars if TA-Lib is not installed, allowing the API to boot and function normally.
- **AC-5.3**: Market structure engine identifies swing highs/lows and support/resistance.
- **AC-5.4**: Volume anomaly detector computes rolling volume percentiles (RVOL).
- **AC-5.5**: Regime classifier accurately assigns one of six regimes based on trend and volatility metrics.
- **AC-5.6**: Signal confidence engine assigns LOW/MEDIUM/HIGH ratings based on data confluence.
- **AC-5.7**: Analytics worker consumes Redis candle streams and persists snapshots to TimescaleDB.
- **AC-5.8**: Scanner continuously evaluates configured symbols and timeframes without LLM calls.
- **AC-5.9**: Detected candidates are published as `opportunity.detected` to `stream:market:opportunities`.
- **AC-5.10**: TimescaleDB correctly stores historical indicator data.
- **AC-5.11**: REST APIs expose endpoints for indicators, regimes, and opportunities.
- **AC-5.12**: Automated test suite validates math against known statistical reference vectors.
