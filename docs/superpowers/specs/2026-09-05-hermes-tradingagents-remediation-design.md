# Design Spec: Hermes Agent & TradingAgents Analytics Remediation

**Date:** 2026-09-05  
**Status:** Approved  
**Scope:** Sub-Project 1 — Core Agent Intelligence & Analytics Pipeline Remediation  
**Foundations Affected:** Foundation 7 (Hermes Tools), Foundation 8 (Hermes Main Agent), Foundation 10 (TradingAgents)

---

## 1. Executive Summary & Problem Statement

The AI Trading Platform specifies that **Hermes Agent** is the primary autonomous trading intelligence assistant, capable of continuously observing market opportunities emitted by the analytics pipeline, assembling context, requesting specialist debate analysis from **TradingAgents** when uncertainty is high, and producing structured trade proposals for deterministic risk verification by the **Risk Engine**.

In the current codebase, this loop cannot run because:
1. **Stream Name Mismatch:** The opportunity scanner emits to `stream:market:opportunities`, while Hermes listens to `opportunity.detected`, preventing any events from reaching Hermes.
2. **Broken Paths & Missing Skills:** Hermes context assembler looks for `Trader_Constitution.md` in the root repository instead of `skills/trading/Trader_Constitution.md`, and fails to load any procedural trading skills.
3. **Container Networking & Configuration Errors:** Internal service URLs default to `localhost` rather than container service names (`http://api:8000`, `http://tradingagents:8002`), causing 502/Connection Refused in Docker. `LLM_GATEWAY_URL` is omitted from container configs, and `AsyncOpenAI` crashes when keys are missing.
4. **Mocked Tool APIs:** All endpoints under `/api/v1/tools/*` return hardcoded dummy JSON rather than calling real market data, portfolio, and risk engine services.
5. **Missing Daemons:** The continuous market data ingestion worker and analytics opportunity scanner are not orchestrated in `docker-compose.yml`.

This design document defines the architectural fixes to make the intelligence and analytics pipeline completely functional end-to-end.

---

## 2. Architecture & Data Flow

```
┌───────────────────────────┐
│     Binance Exchange      │
└─────────────┬─────────────┘
              │ WebSocket / REST
              ▼
┌───────────────────────────┐
│ Market Data Worker        │ (services.market_data.worker)
└─────────────┬─────────────┘
              │ XADD stream:market:candles
              ▼
┌───────────────────────────┐
│ Redis Streams             │
└──────┬──────────────┬─────┘
       │              │
       │ XREADGROUP   │
       ▼              │
┌───────────────────────────┐
│ Analytics Worker          │ (services.analytics.worker)
│ - Calculates Indicators   │
│ - Opportunity Scanner     │
└─────────────┬─────────────┘
              │ XADD stream:market:opportunities
              ▼
┌───────────────────────────┐
│ Redis Streams             │
└─────────────┬─────────────┘
              │ XREADGROUP stream:market:opportunities
              ▼
┌─────────────────────────────────────────────────────────┐
│ Hermes Agent Orchestrator (services.hermes.orchestrator)│
│  1. ContextAssembler:                                   │
│     - skills/trading/Trader_Constitution.md             │
│     - skills/trading/*.md (Procedural Skills)           │
│     - GET /api/v1/tools/market/candles                  │
│     - GET /api/v1/tools/analytics/indicators           │
│     - GET /api/v1/tools/portfolio/positions             │
│  2. Initial Reasoning Evaluation                        │
│  3. Escalation Check:                                   │
│     If confidence < 0.6 or volatile regime:             │
│       POST /api/v1/tools/research/deep_analyze          │
│       -> TradingAgents Service (:8002)                  │
│          - TechnicalSpecialist                          │
│          - BullSpecialist & BearSpecialist (Concurrent) │
│          - SynthesizerSpecialist                        │
│  4. Hermes Final Synthesis                              │
│  5. Submit Trade Proposal:                              │
│     POST /api/v1/tools/proposal/create                  │
│     -> API forwards to RiskOrchestrator                 │
│  6. Episodic Memory Reflection:                         │
│     POST /api/v1/tools/memory/store                     │
│     -> Saved to agent_observations in DB                │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Component Details & Remediation

### 3.1 Hermes Orchestrator (`services/hermes/orchestrator.py`)
* **Stream Binding:** Bind `self.stream_name` to `StreamNames.OPPORTUNITIES` (`stream:market:opportunities`).
* **Consumer Group:** Create consumer group `hermes_group` with `id="0"`, `mkstream=True`.
* **Payload Decoding:** Gracefully parse both byte and string encoded fields from Redis Stream messages.

### 3.2 Context Assembler & Skill Loader (`services/hermes/context.py`)
* **Constitution Path:** Locate `Trader_Constitution.md` inside `skills/trading/Trader_Constitution.md`.
* **Skill Loader:** Dynamically scan `skills/trading/` for strategy instruction markdown files (e.g. `breakout/SKILL.md`, `trend_following/SKILL.md`, `mean_reversion/SKILL.md`) and append relevant rules into the context dictionary.
* **Tool Client Calls:** Fetch real candles, indicators, and portfolio positions via `HermesToolsClient`.

### 3.3 Reasoning & LLM Configuration (`services/hermes/reasoning.py` & `packages/config/settings.py`)
* **Model Selection:** Default `model_routing["reasoning"]` to `"gpt-4o"` and `model_routing["fast"]` to `"gpt-4o-mini"`.
* **Graceful Degradation:** If `LLM_GATEWAY_KEY` is not configured, log a clear warning and provide mock structural proposals in dry-run/test environments rather than crashing unhandled.

### 3.4 TradingAgents Specialist Service (`services/tradingagents/`)
* **Microservice Server (`server.py`):** Runs FastAPI on port `8002`.
* **Orchestration (`orchestrator.py`):** Runs `DebateOrchestrator`:
  1. `TechnicalSpecialist`: Computes key levels and trend summary.
  2. `BullSpecialist` & `BearSpecialist`: Concurrently generate bull and bear theses.
  3. `SynthesizerSpecialist`: Combines findings into `SynthesizedResearchReport`.
* **Container Networking:** Configured with `TRADINGAGENTS_BASE_URL=http://tradingagents:8002` when accessed by the platform API.

### 3.5 Real Backend Tool APIs (`apps/api/routers/tools.py`)
Replace static placeholders with real production logic:
* `GET /market/price`: Query CCXT / cached price.
* `GET /market/candles`: Query TimescaleDB `market_candles` hypertable with fallback to CCXT.
* `GET /analytics/indicators`: Query latest indicators computed by `AnalyticsWorker` or database snapshot.
* `GET /portfolio/positions`: Query `PortfolioEngine.get_account_balance(...)` and open positions.
* `POST /proposal/create`: Construct `TradeIntent` from proposal and invoke `RiskOrchestrator.evaluate_proposal(...)`. If approved, save to proposals table.
* `POST /memory/store`: Insert observation record into PostgreSQL `agent_observations` table.
* `POST /research/deep_analyze`: Proxy request to `http://tradingagents:8002/internal/v1/deep-analyze`.

### 3.6 Docker Compose & Background Workers (`docker-compose.yml`)
* Add worker service(s) to run:
  * `services.market_data.worker` (Binance CCXT stream ingestion).
  * `services.analytics.worker` (Indicator computation and `OpportunityScanner`).
* Ensure all environment variables are correctly wired:
  * `HERMES_BASE_URL=http://api:8000`
  * `TRADINGAGENTS_BASE_URL=http://tradingagents:8002`
  * `LLM_GATEWAY_URL` and `LLM_GATEWAY_KEY` passed to `hermes` and `tradingagents`.

---

## 4. Error Handling & Safety Invariants

1. **Deterministic Risk Authority:** Hermes cannot execute trades. All proposals from Hermes MUST pass through `RiskOrchestrator.evaluate_proposal`.
2. **Fail Closed:** If TradingAgents deep research times out (30s) or fails, Hermes proceeds using its fast-path reasoning or declines to propose a trade.
3. **Negative Authorization:** Token authentication strictly ensures `HERMES_SERVICE_TOKEN` receives HTTP 403 on live execution and owner-only approval routes.
4. **Idempotent Observations:** All memory reflections stored in `agent_observations` are assigned unique UUIDs and correlation IDs.

---

## 5. Verification Plan

### Automated Tests
1. **Unit Tests:**
   * `tests/unit/test_hermes_context.py`: Verify constitution and skills loading.
   * `tests/unit/test_tradingagents_debate.py`: Test `DebateOrchestrator` with mocked specialist agents.
   * `tests/unit/test_tools_api_real.py`: Test `/api/v1/tools/*` endpoints wired to Risk Engine and DB sessions.
2. **Pipeline Integration Test:**
   * `tests/integration/test_hermes_pipeline_e2e.py`: Publish mock opportunity to `stream:market:opportunities`, verify Hermes receives event, evaluates context, triggers escalation, and submits proposal to Risk Engine.
3. **Linter & Typecheck:**
   * `uv run ruff check .`
   * `uv run pytest tests/`
