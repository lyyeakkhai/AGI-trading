# Foundation 10: TradingAgents Deep Research Escalation — Implementation Plan

**Foundation:** F10
**Spec:** `docs/superpowers/specs/2026-08-26-foundation-10-tradingagents-design.md`
**Branch:** `feat/foundation-10-tradingagents`

---

## Task 10.1: Containerization and Setup
- Create `services/tradingagents/server.py` containing a new minimal FastAPI app.
- Create `infrastructure/docker/tradingagents.Dockerfile`.
- Add `tradingagents` service to `docker-compose.yml`, using `TRADINGAGENTS_SERVICE_TOKEN` and sharing the `trading-net`.
- Add TradingAgents settings to `packages/config/settings.py` (e.g., internal service URL).

## Task 10.3: Domain Schemas
- In `packages/domain/research.py`, define Pydantic models:
  - `DeepResearchRequest` (symbol, timeframe, context)
  - `BullBearDebateResult` (bull_thesis, bear_thesis)
  - `SynthesizedResearchReport` (consensus_direction, confidence_score, key_catalysts, key_risks)

## Task 10.2: Specialist Agents implementation
- Create `services/tradingagents/specialists/technical.py`.
- Create `services/tradingagents/specialists/bull.py`.
- Create `services/tradingagents/specialists/bear.py`.
- Create `services/tradingagents/specialists/synthesizer.py`.
- Create `services/tradingagents/orchestrator.py` which sequences the LLM calls (TA -> Bull & Bear concurrently -> Synthesizer).

## Task 10.4: Internal Research API Endpoint
- In `services/tradingagents/server.py`, implement `POST /internal/v1/deep-analyze`.
- It accepts `DeepResearchRequest`, runs the orchestrator, and returns `SynthesizedResearchReport`.
- Note: This endpoint is on the TradingAgents microservice itself. But `apps/api` should act as the gateway, so `apps/api/routers/tools.py` exposes `/api/v1/tools/research/deep_analyze` which proxies to the internal service, verifying `TRADINGAGENTS_SERVICE_TOKEN`. (Actually, F7 already exposed this! So we just need to route the F7 endpoint to this new microservice.)

## Task 10.5 & 10.6: Hermes Escalation Client & Policy
- In `services/hermes/escalation_policy.py`, write a function `should_escalate(symbol, timeframe, initial_confidence, regime) -> bool`.
- In `services/hermes/research_client.py` or existing `proposal_client.py`, add `trigger_deep_research(symbol, timeframe)`.
- Ensure an `httpx` timeout of 30 seconds is strictly enforced.

## Task 10.7 & 10.8: Proposal Integration & Fallback
- Modify `services/hermes/orchestrator.py` and `reasoning.py` to call `should_escalate`.
- If true, call deep research. If it times out or fails (try/except), log a warning and proceed with fast-path data.
- If it succeeds, append the `SynthesizedResearchReport` string to the LLM context so the proposal builder sees it.

## Task 10.9: Safety Test Suite
- Create `tests/safety/test_tradingagents_security_boundary.py`.
- Verify the `TRADINGAGENTS_SERVICE_TOKEN` correctly receives a 403 on `/api/v1/tools/portfolio/positions`, `/api/v1/tools/proposal/create`, etc. (Some of this was built in F7, expand as needed).
