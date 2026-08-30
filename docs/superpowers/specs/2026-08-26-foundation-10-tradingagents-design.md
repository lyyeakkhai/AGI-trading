# Foundation 10: TradingAgents Deep Research Escalation — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F10 of 13
**Depends on:** F0, F1, F7, F8
**Unlocks:** Enriches F11, F12
**Blueprint tasks:** 10.1 – 10.9

---

## 1. Purpose

Foundation 10 introduces a "Slow Thinking" layer to our AI platform. While Hermes (F8) evaluates market conditions rapidly ("Fast Thinking"), there are times when market regimes are mixed or confidence is borderline. 

For these high-uncertainty, high-value setups, Hermes will escalate the opportunity to **TradingAgents** — a dedicated, containerized multi-agent committee. TradingAgents stages a structured debate between specialist LLM agents (Bull, Bear, Technical Analyst, Synthesizer) and returns a deep, reasoned consensus. 

Importantly, TradingAgents has even fewer privileges than Hermes. It is strictly limited to read-only market data and analytics. It cannot view portfolio balances, cannot see exchange keys, and cannot create trade proposals.

---

## 2. Scope

### In scope
- **TradingAgents Service (`tradingagents-service`):** A new Python FastAPI microservice dedicated purely to orchestrating the multi-agent debate.
- **REST Endpoint:** `POST /internal/v1/deep-analyze` protected by `TRADINGAGENTS_SERVICE_TOKEN`.
- **Specialist Agents:** Prompts and agent chains for a Bull Researcher, Bear Researcher, Technical Analyst, and Synthesizer.
- **Hermes Escalation Policy:** Logic inside Hermes to determine *when* to escalate (e.g., when the fast-path hypothesis is uncertain, or for higher timeframe signals where a 30s delay is acceptable).
- **Hermes Tool:** `research.deep_analyze` tool allowing Hermes to trigger the committee.
- **Fallback Grace:** If TradingAgents times out or fails, Hermes must safely fall back to its own fast-path hypothesis.

### Out of scope
- Web dashboard inspection of the debate logs (belongs to Foundation 11).
- Live execution based on the debate (belongs to Foundation 12).

---

## 3. Architecture & Components

### 3.1 `tradingagents-service` Daemon
An isolated FastAPI microservice deployed in its own Docker container.
- Exposes `POST /internal/v1/deep-analyze`.
- Calls internal LLM APIs to generate the debate.
- Queries `apps/api` using its `TRADINGAGENTS_SERVICE_TOKEN` for historical market data if needed.

### 3.2 The Debate Workflow (`services/tradingagents/specialists/`)
1. **Technical Analyst** reviews the charts, moving averages, and indicators, outputting a neutral technical fact-sheet.
2. **Bull Researcher** is given the facts and instructed to construct the strongest possible argument for going LONG.
3. **Bear Researcher** is given the facts and instructed to construct the strongest possible argument for going SHORT (or staying flat).
4. **Synthesizer** reviews the Bull and Bear cases, adjudicates the arguments, identifies logical flaws, and outputs a final `SynthesizedResearchReport` with a consensus direction and confidence score.

### 3.3 Hermes Integration (`services/hermes/escalation_policy.py`)
Hermes evaluates the initial setup. If `confidence < 80` and `timeframe >= 15m`, it triggers the `research.deep_analyze` tool. The result is injected into the LLM context, overriding or confirming the original hypothesis, and embedded into the final `TradeProposal` supporting/contradicting evidence.

---

## 4. Acceptance Criteria
- **AC-10.1:** TradingAgents runs in an isolated `tradingagents-service` Docker container.
- **AC-10.2:** The specialist committee (Bull, Bear, TA, Synthesizer) successfully generates structured research reports.
- **AC-10.3:** `DeepResearchRequest` and `SynthesizedResearchReport` schemas exist.
- **AC-10.4:** The internal endpoint is protected by `TRADINGAGENTS_SERVICE_TOKEN`.
- **AC-10.6:** Hermes uses an escalation policy to trigger deep analysis conditionally.
- **AC-10.8:** Hermes falls back seamlessly if TradingAgents is offline or times out (30s default).
- **AC-10.9:** Negative authorization tests prove TradingAgents cannot read portfolios or create proposals.
