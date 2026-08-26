# Foundation 8: Hermes Main Trading Agent — Implementation Plan

**Foundation:** F8
**Spec:** `docs/superpowers/specs/2026-08-26-foundation-8-hermes-agent-design.md`
**Branch:** `feat/foundation-8-hermes-agent`

---

## Task 8.1: Containerization and Config
- In `pyproject.toml`, add `openai` and `instructor` (or `pydantic` output parsers) to the `core` dependencies for LLM integration.
- Update `packages/config/settings.py` to ensure `LLMSettings` (API keys, base URL) are properly loaded.
- Create `infrastructure/docker/hermes.Dockerfile`.
- Add the `hermes` service to `docker-compose.yml`, passing `HERMES_SERVICE_TOKEN` and `LLM_GATEWAY_KEY` in the environment.

## Task 8.2: Event-Driven Orchestrator
- Create `services/hermes/orchestrator.py`.
- Implement a Redis Stream consumer loop that listens to the `opportunity.detected` stream.
- When an event is received, parse the symbol and timeframe, and trigger the reasoning pipeline.

## Task 8.3 & 8.4: Context Assembly and Skills Loading
- Create `services/hermes/context.py`.
- Implement logic to load the `Trader_Constitution.md` from the filesystem.
- Use the `HermesToolsClient` (built in F7) to fetch current market candles, technical indicators (from F5), and active positions (from F3).
- Format this data into the prompt string.

## Task 8.5 & 8.6: LLM Reasoning and Structured Output
- Create `services/hermes/reasoning.py` and `services/hermes/proposal_builder.py`.
- Initialize the LLM client (e.g., OpenAI or Anthropic via `httpx`).
- Design the System Prompt and User Prompt.
- Use `pydantic` schemas to define the expected `TradeProposal` JSON output (Direction, Entry, Stop Loss, Take Profit, Supporting Evidence, Contradicting Evidence, Invalidation Rules).
- Implement retry logic in case the LLM hallucinates an invalid JSON structure.

## Task 8.7: Proposal Submission
- Create `services/hermes/proposal_client.py`.
- Upon successful generation of a `TradeProposal`, use the `HermesToolsClient` to submit a `POST /api/v1/tools/proposal/create` request.
- Log the returned `RiskDecision` (Approved, Modified, or Rejected).

## Task 8.8: Episodic Memory
- Create `services/hermes/memory_recorder.py`.
- After a proposal is generated, optionally prompt the LLM for a brief "reflection" on its decision process.
- Submit the reflection to `POST /api/v1/tools/memory/store` to save it in `agent_observations`.

## Task 8.9 & 8.10: Verification and Evaluation Harness
- Create `tests/unit/test_hermes_evaluation.py` to mock the LLM responses and verify the orchestrator properly handles invalid JSON, properly submits valid proposals, and handles API errors gracefully.
- Run negative authorization integration tests to guarantee Hermes cannot mutate state directly.
