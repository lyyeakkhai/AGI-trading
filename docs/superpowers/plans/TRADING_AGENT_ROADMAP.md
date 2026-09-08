# TRADING AGENT ROADMAP

> **Master Goal:** Build Hermes into a controlled autonomous trading system capable of completing its first end-to-end trade using Binance. Binance is V1 only. The system must use an exchange-agnostic execution interface. No order may bypass the risk engine. The first autonomous execution must run in paper/testnet/simulation mode.

This roadmap breaks the Master Goal into 9 strictly sequential phases. **Do not begin a phase until its dependencies are fully complete and verified.** Work within a phase can be parallelized across multiple agents.

---

## Phase 1: Foundational Domain Models
**Goal:** Define the exact Python/Pydantic schemas and SQLAlchemy models that will act as the contract between the AI, the risk engine, and the execution engine.
**Dependencies:** None.

### 🤖 Parallel Tasks
- **Agent A (Database Architect):**
  - [ ] Implement `ChartDrawingModel` and `ChartAnnotationModel`.
  - [ ] Implement `TradingPlanModel` (matching the required fields: Entry, SL, TP, Risk, Thesis, Invalidation).
  - [ ] Implement `AuditDecisionModel` (capturing market data snapshot, drawings, plan, and risk result).
  - [ ] Generate and run Alembic migrations for all new models.

### ✅ Definition of Done
- [ ] Database schema successfully migrated locally.
- [ ] Pydantic domain schemas strictly map to SQLAlchemy models.

---

## Phase 2: Binance Agent OS & Market Data Tools (6 Tools)
**Goal:** Prove connectivity to Binance (verifying Agent OS MCP vs CCXT) and expose the required market data tools to Hermes.
**Dependencies:** Phase 1.

### 🤖 Parallel Tasks
- **Agent A (Integration Specialist):**
  - [ ] Investigate `agent.binance.com/mcp/agentic` (Does it support WebSockets? What order types?). Document findings.
  - [ ] Implement/Expose `market.get_candles` (supporting multiple timeframes).
  - [ ] Implement/Expose `market.get_ticker` and `market.get_order_book`.
- **Agent B (Data Engineer):**
  - [ ] Implement/Expose `market.get_trades`.
  - [ ] Implement/Expose `market.get_volume` and `market.get_funding_rate`.

### ✅ Definition of Done
- [ ] All 6 market tools are exposed via `packages/hermes_tools/client.py`.
- [ ] Hermes can successfully retrieve a 1H and 15m candle set for BTCUSDT.

---

## Phase 3: Chart Drawing Engine Backend (10 Tools)
**Goal:** Give Hermes the ability to interact with the chart state mathematically (time + price coordinates) and store those interactions.
**Dependencies:** Phase 1, Phase 2.

### 🤖 Parallel Tasks
- **Agent A (Backend API):**
  - [ ] Implement `chart.get_state`, `chart.get_visible_range`, and `chart.get_drawings`.
  - [ ] Implement `chart.draw_line`, `chart.draw_zone`, and `chart.draw_marker`.
- **Agent B (Backend API):**
  - [ ] Implement `chart.add_annotation`.
  - [ ] Implement `chart.update_drawing`, `chart.delete_drawing`, and `chart.clear_drawings`.

### ✅ Definition of Done
- [ ] All 10 chart tools are exposed and tested.
- [ ] Calling `chart.draw_zone` successfully persists a `ChartDrawingModel` in the database.

---

## Phase 4: TradingView Frontend Sync
**Goal:** Translate the semantic drawing database models into visual pixels on the user's browser, allowing humans to see Hermes's reasoning.
**Dependencies:** Phase 3.

### 🤖 Parallel Tasks
- **Agent A (Frontend React):**
  - [ ] Build a WebSocket or Polling hook `useChartDrawings` in `apps/web/src/hooks`.
  - [ ] Build an SVG `ChartOverlay` component layered over `MarketChart.tsx`.
  - [ ] Implement `timeScale().timeToCoordinate()` and `priceScale().priceToCoordinate()` mappings to correctly render the backend drawings onto the canvas.

### ✅ Definition of Done
- [ ] Database drawing records automatically appear on the React frontend.
- [ ] Zooming or panning the chart dynamically updates the SVG overlay positions.

---

## Phase 5: Deterministic Analysis Engine (5 Tools)
**Goal:** Provide Hermes with rigorous mathematical facts about the market, removing the need for the LLM to calculate indicators.
**Dependencies:** Phase 2.

### 🤖 Parallel Tasks
- **Agent A (Quant Engineer):**
  - [ ] Implement `analysis.detect_swings` and `analysis.detect_market_structure`.
  - [ ] Implement `analysis.detect_trend` and `analysis.detect_support_resistance`.
- **Agent B (Quant Engineer):**
  - [ ] Implement `analysis.calculate_indicator` (wrapping a library like `pandas-ta` to support RSI, EMA, SMA, MACD, ATR, VWAP, Bollinger Bands, Volume).

### ✅ Definition of Done
- [ ] All 5 analysis tools are exposed.
- [ ] Swings are calculated deterministically (e.g., using a strict 5-bar fractal logic, no LLM guessing).

---

## Phase 6: Trading Plan & Risk Validation (9 Tools)
**Goal:** Allow Hermes to formulate a structured trading plan and subject it to the immutable Risk Engine.
**Dependencies:** Phase 1, Phase 5.

### 🤖 Parallel Tasks
- **Agent A (Trading Planner):**
  - [ ] Implement `plan.create`, `plan.get`, `plan.update`, `plan.validate`, and `plan.cancel`.
- **Agent B (Risk API):**
  - [ ] Wrap the existing `packages/risk/core.py` functions into tools: `risk.calculate_position_size`, `risk.calculate_exposure`, `risk.validate_plan`, `risk.check_portfolio_risk`.

### ✅ Definition of Done
- [ ] Hermes can output a structured Trading Plan JSON.
- [ ] Submitting an oversized plan to `risk.validate_plan` correctly returns a `REJECTED` status.

---

## Phase 7: Execution & Position Monitoring (9 Tools)
**Goal:** Route approved plans to Binance (testnet) and track their lifecycle.
**Dependencies:** Phase 2 (Binance Agent OS research), Phase 6.

### 🤖 Parallel Tasks
- **Agent A (Execution Adapter):**
  - [ ] Implement exchange-agnostic execution tools: `execution.get_balance`, `execution.get_positions`, `execution.get_open_orders`.
  - [ ] Implement `execution.place_order`, `execution.cancel_order`, and `execution.get_order`. (Routing to the Binance Adapter/Agent OS).
- **Agent B (Position Manager):**
  - [ ] Implement `position.get`, `position.monitor`, and `position.close`.

### ✅ Definition of Done
- [ ] `execution.place_order` successfully executes a testnet limit order on Binance.
- [ ] The `position.monitor` tool accurately reflects the open testnet position.

---

## Phase 8: Audit & Memory (3 Tools)
**Goal:** Ensure every autonomous action is strictly logged for human review.
**Dependencies:** Phase 6, Phase 7.

### 🤖 Parallel Tasks
- **Agent A (Audit Engineer):**
  - [ ] Implement `decision.create_log`, `decision.get_history`, and `trade.get_history`.

### ✅ Definition of Done
- [ ] A complete trace (Market Data -> Reasoning -> Plan -> Risk -> Execution) can be queried and displayed.

---

## Phase 9: The First-Trade Integration Test
**Goal:** Run Hermes completely hands-off through the exact 9-step workflow defined in the Master Goal.
**Dependencies:** Phases 1-8.

### 🤖 Sequential Task (Single Coordinator)
- [ ] Pass the prompt *"Analyze BTCUSDT"* to Hermes.
- [ ] Monitor Hermes as it uses `market.*` and `analysis.*` to read the market.
- [ ] Verify Hermes uses `chart.*` tools and that the frontend updates in real-time.
- [ ] Verify Hermes calls `plan.create` and passes it to `risk.validate_plan`.
- [ ] Verify Hermes calls `execution.place_order` (in Testnet).
- [ ] Verify Hermes loops into `position.monitor` and logs via `decision.create_log`.

### ✅ Definition of Done (Master Goal Achieved)
- [ ] Hermes successfully executed the entire autonomous trading loop with zero human intervention.
- [ ] Risk parameters were strictly honored.
- [ ] A visual artifact exists on the TradingView chart explaining the trade.
