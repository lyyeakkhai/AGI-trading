# Foundation 7: Hermes Tool APIs, Trading Knowledge, Memory, Skills — Implementation Plan

**Foundation:** F7
**Spec:** `docs/superpowers/specs/2026-08-26-foundation-7-hermes-tools-design.md`
**Branch:** `feat/foundation-7-hermes-tools`

---

## Task 7.1: Service Token Authorization Middleware
- In `packages/config/settings.py`, ensure `HERMES_SERVICE_TOKEN` and `TRADINGAGENTS_SERVICE_TOKEN` exist.
- In `apps/api/dependencies.py`, implement `verify_hermes_token`, `verify_tradingagents_token`, and `verify_owner_session` (placeholder for F11).
- Write `tests/safety/test_authorization.py` asserting negative authorization (service tokens get 403 on owner endpoints).

## Task 7.2 & 7.3: Tool API Endpoints for Market, Analytics, Portfolio
- Create `apps/api/routers/tools.py`.
- Expose `/api/v1/tools/market/price`, `/api/v1/tools/market/candles`, `/api/v1/tools/analytics/indicators`, etc.
- Expose `/api/v1/tools/portfolio/positions`, `/api/v1/tools/strategy/list`.
- These endpoints query the existing services (F2, F3, F5, F6) and format results for LLM consumption.

## Task 7.4: Trade Proposal Tool API
- In `apps/api/routers/tools.py`, expose `/api/v1/tools/proposal/create`.
- Must parse payload into `TradeIntent`, call `evaluate_trade()` from `services.risk.orchestrator`, generate an idempotency key, save the `TradeProposalModel` to DB (with status `PENDING_APPROVAL` or `REJECTED`), and return the proposal ID.

## Task 7.5: Procedural Skills & Trader Constitution
- Create directory structure `skills/trading/`.
- Create `skills/trading/Trader_Constitution.md` (immutable principles).
- Create `skills/trading/risk-management/SKILL.md` and `rules.yaml`.
- Create `skills/trading/trend-following/SKILL.md`.

## Task 7.6: Knowledge Base & Vector Embeddings
- Install `sentence-transformers` and `pgvector` python driver into the optional `quant` layer or `core` layer.
- Create `packages/database/models/knowledge.py` with `KnowledgeEmbeddingModel` (using `Vector` column type of 384 dims).
- Create `services/knowledge/embedding.py` to handle chunking and local semantic embedding using `all-MiniLM-L6-v2`.
- Expose `/api/v1/tools/knowledge/search` in `apps/api/routers/tools.py`.

## Task 7.7: Agent Observation Memory
- Create `packages/database/models/memory.py` with `AgentObservationModel` (`symbol`, `timestamp`, `observation`, `tags`).
- Expose `/api/v1/tools/memory/store` and `/api/v1/tools/memory/search`.

## Task 7.8: Hermes Tool Client & OpenAPI SDK
- Update `packages/hermes_tools/intelligence.py` or create `packages/hermes_tools/client.py`.
- Define python types and helper functions that Hermes will natively use to interact with these HTTP tool endpoints.

## Task 7.9: TradingAgents Gateway
- In `apps/api/routers/tools.py`, expose `/api/v1/tools/research/deep_analyze` protected by `TRADINGAGENTS_SERVICE_TOKEN`.

## Task 7.10 & 7.11: Verification Suites
- Create `tests/integration/test_tool_apis.py` to test all tool endpoints.
- Ensure the safety test suite `tests/safety/test_authorization.py` strictly passes.
