# Foundation 8: Hermes Main Trading Agent — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F8 of 13
**Depends on:** F0, F1, F2, F3, F4, F5, F6, F7
**Unlocks:** F12
**Blueprint tasks:** 8.1 – 8.10

---

## 1. Purpose

Foundation 8 brings our AGI Trading Platform to life by deploying **Hermes**, the autonomous LLM agent runtime. Hermes continuously monitors the market, applies procedural trading skills, evaluates hypotheses, and submits structured trade proposals to the deterministic backend (F7 APIs).

Crucially, Hermes is **not** a trading engine. It is an **intelligence engine**. It has absolutely zero direct access to exchanges, wallets, or the database. It only communicates through the `HERMES_SERVICE_TOKEN`-secured REST APIs built in F7, ensuring the determinism and safety of the financial core (Risk Engine and Execution layer) are never compromised.

---

## 2. Scope

### In scope
- **Hermes Orchestrator Loop:** Event-driven architecture using Redis Streams (`opportunity.detected`) to wake up the agent.
- **Context Assembly Engine:** Injects the Trader Constitution (F7), retrieves knowledge embeddings via `pgvector`, and loads working session state.
- **LLM Reasoning & Integration:** Integration with the LLM API gateway, using prompt engineering to guide Hermes through multi-timeframe analysis.
- **Structured Proposal Generation:** Forces the LLM to output a strict JSON payload adhering to the `TradeProposal` schema.
- **Episodic Memory Recorder:** Writes LLM trade reflections to the `agent_observations` database table (via F7 APIs) after proposal outcomes.
- **Agent Containerization:** `hermes-trader` Docker container that runs the agent loop completely isolated from the web API.

### Out of scope
- Multi-agent committee and deep research escalation (TradingAgents) — deferred to Foundation 10.
- Web dashboard for human approval of proposals — deferred to Foundation 11.
- Live exchange execution logic — deferred to Foundation 12.

---

## 3. Architecture & Components

### 3.1 `hermes-trader` Daemon (`services/hermes/`)
A long-running python process (or FastAPI background task runner) designed to continuously poll Redis Streams.
- **Orchestrator (`orchestrator.py`):** Listens to Redis Stream. When a tick/opportunity arrives, it triggers the reasoning pipeline.
- **Context Builder (`context.py`):** Fetches market data (F2), indicators (F5), and portfolio state (F3) from the F7 APIs to build the prompt context.
- **Reasoning Engine (`reasoning.py`):** Wraps the LLM calls (e.g., Anthropic Claude / OpenAI GPT-4). Implements chain-of-thought prompting.
- **Proposal Client (`proposal_client.py`):** Submits the finalized JSON proposal to `/api/v1/tools/proposal/create` via `httpx`.

### 3.2 The LLM Pipeline (The "Brain")
1. **System Prompt:** Contains the Trader Constitution (loaded from F7's markdown files) establishing the agent's core identity.
2. **User Prompt (Context):** The current market state, relevant technical indicators, and active positions.
3. **Retrieval (RAG):** The agent searches `pgvector` for similar historical setups or trading concepts.
4. **Execution:** The LLM generates a hypothesis, builds evidence, explicitly identifies *contradicting evidence*, and generates invalidation criteria.
5. **Output Generation:** The LLM uses function calling or JSON structured output to produce the final `TradeProposal`.

### 3.3 Security Boundary Enforcement
Hermes runs with `HERMES_SERVICE_TOKEN` as its only authentication.
If the LLM hallucinates an API call to approve its own trade or execute directly on Binance, the API will reject it with HTTP 403 (enforced in F7).

---

## 4. Acceptance Criteria
- **AC-8.1:** Hermes runs in an isolated `hermes-trader` Docker container.
- **AC-8.2:** The agent loop is event-driven, waking up on `opportunity.detected` via Redis Streams.
- **AC-8.3:** Prompt context always includes the Trader Constitution.
- **AC-8.6:** The LLM reliably generates complete `TradeProposal` payloads with stop-loss, take-profit, supporting/contradicting evidence, and invalidation criteria.
- **AC-8.7:** Proposals are successfully submitted via F7 REST APIs.
- **AC-8.8:** Agent reflections and reasoning are saved to `agent_observations` via the memory APIs.
- **AC-8.9:** Negative authorization tests prove Hermes cannot break out of its container or bypass the Risk Engine.
