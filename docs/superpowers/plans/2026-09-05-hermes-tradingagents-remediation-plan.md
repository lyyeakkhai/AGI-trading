# Hermes Agent & TradingAgents Analytics Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate the Hermes autonomous trading agent, TradingAgents specialist research team, backend tool APIs, and background worker pipeline so that detected market opportunities automatically trigger intelligent context assembly, debate analysis, and deterministic risk verification.

**Architecture:** Event-driven architecture with Redis Streams (`stream:market:opportunities`), containerized microservices communicating via token-authenticated HTTP REST (`/api/v1/tools/*`), and deterministic Risk Engine gating before any trade proposal is stored.

**Tech Stack:** Python 3.12, FastAPI, Redis Streams, TimescaleDB, SQLAlchemy asyncpg, Instructor/OpenAI client, Pydantic v2, Pytest.

## Global Constraints
- Financial calculations must use `Decimal`.
- Money state in Redis is non-authoritative; PostgreSQL/TimescaleDB is source of truth.
- Fail closed: if research or validation times out or fails, do not execute orders.
- Agents (Hermes and TradingAgents) have no direct access to financial credentials or database tables; all access is via HTTP tool routes authenticated with service tokens.

---

### Task 1: Configuration Defaults & Model Routing

**Files:**
- Modify: `packages/config/settings.py`
- Test: `tests/unit/test_agent_settings.py`

**Interfaces:**
- Consumes: `BaseSettings` from pydantic-settings.
- Produces: Correct container-aware default URLs (`http://api:8000` for Hermes, `http://tradingagents:8002` for TradingAgents) and default model routing with `gpt-4o`/`gpt-4o-mini`.

- [ ] **Step 1: Write the failing test**

```python
# tests/unit/test_agent_settings.py
import pytest
from packages.config.settings import Settings

def test_agent_and_service_default_urls():
    settings = Settings()
    assert settings.hermes.base_url == "http://api:8000"
    assert settings.trading_agents.base_url == "http://tradingagents:8002"
    assert settings.llm.model_routing.get("reasoning") == "gpt-4o"
    assert settings.llm.model_routing.get("fast") == "gpt-4o-mini"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/unit/test_agent_settings.py -v`
Expected: FAIL (defaults currently point to `localhost:8001` and `localhost:8002`, and reasoning is `o1-preview`).

- [ ] **Step 3: Update `packages/config/settings.py`**

Update `HermesSettings.base_url` default to `"http://api:8000"`, `TradingAgentsSettings.base_url` default to `"http://tradingagents:8002"`, and `LLMSettings.model_routing` to `{"fast": "gpt-4o-mini", "reasoning": "gpt-4o"}`.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/unit/test_agent_settings.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/config/settings.py tests/unit/test_agent_settings.py
git commit -m "feat(config): align default service URLs and LLM model routing"
```

---

### Task 2: Fix Hermes Context Assembler & Procedural Skill Loading

**Files:**
- Modify: `services/hermes/context.py`
- Test: `tests/unit/test_hermes_context_skills.py`

**Interfaces:**
- Consumes: `HermesToolsClient`, filesystem (`skills/trading/`).
- Produces: `ContextAssembler.assemble(symbol: str, timeframe: str) -> dict[str, Any]` containing constitution, active market data, indicators, positions, and loaded strategy rules.

- [ ] **Step 1: Write the failing test**

```python
# tests/unit/test_hermes_context_skills.py
import pytest
from unittest.mock import MagicMock, patch
from services.hermes.context import ContextAssembler

@pytest.mark.asyncio
async def test_context_assembler_loads_constitution_and_skills():
    assembler = ContextAssembler()
    
    # Constitution should be loaded from skills/trading/Trader_Constitution.md
    assert "Trader Constitution" in assembler._load_constitution()
    assert "not found" not in assembler._load_constitution()
    
    # Skills should be loaded
    skills = assembler._load_trading_skills()
    assert len(skills) > 0
    assert any("breakout" in k.lower() or "trend" in k.lower() for k in skills.keys())
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/unit/test_hermes_context_skills.py -v`
Expected: FAIL (constitution path is invalid; `_load_trading_skills` does not exist).

- [ ] **Step 3: Update `services/hermes/context.py`**

1. Set `self.constitution_path` relative to project root at `skills/trading/Trader_Constitution.md`.
2. Add `_load_trading_skills()` which reads markdown files from `skills/trading/**/SKILL.md`.
3. Include loaded skills in the return dictionary of `assemble()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/unit/test_hermes_context_skills.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/hermes/context.py tests/unit/test_hermes_context_skills.py
git commit -m "feat(hermes): fix constitution path and implement trading skill loader"
```

---

### Task 3: Fix Hermes Stream Subscription & Event Consumption

**Files:**
- Modify: `services/hermes/orchestrator.py`
- Test: `tests/unit/test_hermes_stream_binding.py`

**Interfaces:**
- Consumes: Redis Stream messages from `StreamNames.OPPORTUNITIES` (`stream:market:opportunities`).
- Produces: Invocation of `ContextAssembler`, `ReasoningEngine`, `ResearchClient`, `ProposalClient`, and `MemoryRecorder`.

- [ ] **Step 1: Write the failing test**

```python
# tests/unit/test_hermes_stream_binding.py
import pytest
from packages.events.streams import StreamNames
from services.hermes.orchestrator import HermesOrchestrator

def test_hermes_stream_name_matches_scanner():
    orch = HermesOrchestrator()
    # Must listen to the exact same stream that OpportunityScanner publishes to
    assert orch.stream_name.endswith(StreamNames.OPPORTUNITIES)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/unit/test_hermes_stream_binding.py -v`
Expected: FAIL (currently listening to `opportunity.detected`).

- [ ] **Step 3: Update `services/hermes/orchestrator.py`**

1. Import `StreamNames` from `packages.events.streams`.
2. Set `self.stream_name = f"{self.settings.redis.key_prefix}{StreamNames.OPPORTUNITIES}"`.
3. In `process_opportunity`, safely handle both `str` and `bytes` keys/values when decoding.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/unit/test_hermes_stream_binding.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/hermes/orchestrator.py tests/unit/test_hermes_stream_binding.py
git commit -m "fix(hermes): bind orchestrator to correct opportunities stream name"
```

---

### Task 4: TradingAgents Specialist Robustness & Debate Orchestrator

**Files:**
- Modify: `services/tradingagents/specialists/*.py`, `services/tradingagents/orchestrator.py`
- Test: `tests/unit/test_tradingagents_debate.py`

**Interfaces:**
- Consumes: `DeepResearchRequest` (symbol, timeframe, context).
- Produces: `SynthesizedResearchReport` (direction, confidence, catalysts, risks, summary).

- [ ] **Step 1: Write the failing test**

```python
# tests/unit/test_tradingagents_debate.py
import pytest
from unittest.mock import AsyncMock, patch
from packages.domain.research import SynthesizedResearchReport
from services.tradingagents.orchestrator import DebateOrchestrator
from services.tradingagents.specialists.technical import TechnicalAnalysisResult

@pytest.mark.asyncio
async def test_debate_orchestrator_runs_concurrently():
    orchestrator = DebateOrchestrator()
    
    # Mock specialists
    orchestrator.technical.analyze = AsyncMock(return_value=TechnicalAnalysisResult(
        trend="bullish", key_levels=["50000"], signals=["RSI oversold"]
    ))
    orchestrator.bull.argue = AsyncMock(return_value="Strong upside target")
    orchestrator.bear.argue = AsyncMock(return_value="Resistance at 52000")
    orchestrator.synthesizer.synthesize = AsyncMock(return_value=SynthesizedResearchReport(
        direction="long", confidence=0.75, catalysts=["Breakout"], risks=["Drawdown"], summary="Buy setup"
    ))
    
    report = await orchestrator.run_deep_research("BTC/USDT", "1h", "Test context")
    assert report.direction == "long"
    assert report.confidence == 0.75
    orchestrator.bull.argue.assert_called_once()
    orchestrator.bear.argue.assert_called_once()
```

- [ ] **Step 2: Run test to verify it fails or throws errors**

Run: `uv run pytest tests/unit/test_tradingagents_debate.py -v`
Expected: Run test to verify behavior.

- [ ] **Step 3: Update specialists and orchestrator**

Ensure `AsyncOpenAI` client handles missing API keys gracefully with lazy initialization or mock fallback in dev/test mode.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/unit/test_tradingagents_debate.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/tradingagents/ tests/unit/test_tradingagents_debate.py
git commit -m "feat(tradingagents): implement robust specialist debate orchestrator and tests"
```

---

### Task 5: Implement Real Tool Endpoints in API Gateway

**Files:**
- Modify: `apps/api/routers/tools.py`
- Test: `tests/unit/test_tools_api_real.py`

**Interfaces:**
- Consumes: `RiskOrchestrator`, `TimescaleDB` session, `agent_observations` model.
- Produces: Real HTTP endpoints for `/api/v1/tools/market/candles`, `/api/v1/tools/analytics/indicators`, `/api/v1/tools/portfolio/positions`, `/api/v1/tools/proposal/create`, `/api/v1/tools/memory/store`.

- [ ] **Step 1: Write the failing test**

```python
# tests/unit/test_tools_api_real.py
import pytest
from fastapi.testclient import TestClient
from apps.api.main import app
from packages.config.settings import get_settings

client = TestClient(app)

def test_proposal_create_routes_to_risk_engine():
    settings = get_settings()
    token = settings.hermes.service_token or "test-hermes-token"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "symbol": "BTC/USDT",
        "direction": "long",
        "entry": "50000",
        "stop_loss": "49000",
        "take_profit": "52000",
        "supporting_evidence": ["Bullish trend"],
        "contradicting_evidence": [],
        "invalidation_rules": ["Below 49000"]
    }
    
    response = client.post("/api/v1/tools/proposal/create", headers=headers, json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "decision" in data or "status" in data
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/unit/test_tools_api_real.py -v`
Expected: FAIL or return the old dummy `"prop_123"` format.

- [ ] **Step 3: Update `apps/api/routers/tools.py`**

Wire the routes to:
1. `RiskOrchestrator.evaluate_proposal` on `POST /proposal/create`.
2. Real hypertable queries on `GET /market/candles`.
3. `AgentObservationModel` database insert on `POST /memory/store`.
4. Proxy `POST /research/deep_analyze` to `settings.trading_agents.base_url`.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/unit/test_tools_api_real.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/routers/tools.py tests/unit/test_tools_api_real.py
git commit -m "feat(api): connect tool routes to risk engine, database, and tradingagents"
```

---

### Task 6: Docker Compose & Background Workers Orchestration

**Files:**
- Modify: `docker-compose.yml`, `apps/api/routers/trading.py`
- Test: `tests/unit/test_compose_and_controls.py`

**Interfaces:**
- Consumes: Docker compose service definitions.
- Produces: Automated background ingestion and opportunity generation; fixes the `adapter.close()` crash in kill-switch.

- [ ] **Step 1: Write test for kill-switch close safety**

```python
# tests/unit/test_compose_and_controls.py
import pytest
from services.execution.live import LiveExecutionAdapter

def test_live_adapter_has_safe_close():
    adapter = LiveExecutionAdapter()
    assert hasattr(adapter, "close")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/unit/test_compose_and_controls.py -v`
Expected: FAIL (`LiveExecutionAdapter` has no attribute `close`).

- [ ] **Step 3: Implement fixes**

1. In `services/execution/live.py`, add `async def close(self) -> None: await self.exchange.close()`.
2. In `docker-compose.yml`, pass `HERMES_BASE_URL=http://api:8000`, `TRADINGAGENTS_BASE_URL=http://tradingagents:8002`, `LLM_GATEWAY_URL` to the `hermes` and `tradingagents` services.
3. Add a `market-workers` service running `services.market_data.worker` and `services.analytics.worker`.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/unit/test_compose_and_controls.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/execution/live.py docker-compose.yml tests/unit/test_compose_and_controls.py
git commit -m "fix(execution,docker): add adapter close method and wire compose networking"
```

---

### Task 7: End-to-End Pipeline Integration Test

**Files:**
- Create: `tests/integration/test_hermes_pipeline_e2e.py`

**Interfaces:**
- Consumes: Redis client, Hermes orchestrator, simulated market opportunity.
- Produces: Verifiable execution flow from opportunity detection -> context assembly -> proposal generation -> risk decision -> memory reflection.

- [ ] **Step 1: Write the end-to-end pipeline test**

```python
# tests/integration/test_hermes_pipeline_e2e.py
import pytest
from unittest.mock import AsyncMock, patch
from decimal import Decimal
from services.hermes.orchestrator import HermesOrchestrator
from services.hermes.proposal_builder import TradeProposal

@pytest.mark.asyncio
async def test_full_hermes_pipeline_flow():
    orch = HermesOrchestrator()
    event_data = {
        b"symbol": b"BTC/USDT",
        b"timeframe": b"1h",
        b"signal_type": b"BULLISH_BREAKOUT",
        b"confidence": b"0.45"  # Low confidence to test escalation
    }
    
    with patch.object(orch.context_assembler, "assemble", new_callable=AsyncMock) as mock_ctx, \
         patch.object(orch.reasoning, "evaluate", new_callable=AsyncMock) as mock_reason, \
         patch.object(orch.research_client, "trigger_deep_research", new_callable=AsyncMock) as mock_research, \
         patch.object(orch.proposal_client, "submit", new_callable=AsyncMock) as mock_submit, \
         patch.object(orch.memory, "record", new_callable=AsyncMock) as mock_mem:
        
        mock_ctx.return_value = {"symbol": "BTC/USDT", "timeframe": "1h", "indicators": {}}
        proposal = TradeProposal(
            direction="long",
            confidence=0.5,
            entry=Decimal("50000"),
            stop_loss=Decimal("49000"),
            take_profit=Decimal("52000"),
            supporting_evidence=["Breakout"],
            contradicting_evidence=[],
            invalidation_rules=["Below 49000"]
        )
        mock_reason.return_value = proposal
        mock_research.return_value = {"direction": "long", "confidence": 0.8}
        mock_submit.return_value = {"decision": "Approved", "proposal_id": "prop_test_123"}
        
        await orch.process_opportunity(event_data)
        
        mock_ctx.assert_called_once_with("BTC/USDT", "1h")
        # Should escalate because confidence 0.5 < 0.6
        mock_research.assert_called_once()
        mock_submit.assert_called_once()
        mock_mem.assert_called_once()
```

- [ ] **Step 2: Run test to verify it passes**

Run: `uv run pytest tests/integration/test_hermes_pipeline_e2e.py -v`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/integration/test_hermes_pipeline_e2e.py
git commit -m "test(hermes): add end-to-end opportunity to proposal pipeline integration test"
```
