# AI Trading Chart & Planning Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:dispatching-parallel-agents or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AI-controlled analysis, drawing, annotation, and trading-plan layer on top of our existing Binance market-data and TradingView chart infrastructure.

**Architecture:** We are extending the backend with deterministic quant tools, exposing them as Hermes tools, adding database persistence for AI analysis sessions, and building a React overlay for the lightweight-charts frontend to render structured drawings. To support parallel execution, tasks are separated by architectural boundaries with strict interfaces.

**Tech Stack:** React, lightweight-charts, FastAPI, SQLAlchemy, pandas-ta (or custom quant), Python 3.

## Global Constraints

- Backend must be asynchronous (asyncio, httpx).
- Database changes must use SQLAlchemy models and Alembic migrations.
- Frontend components use React functional components with Tailwind styling.
- All AI tool inputs must be deterministic; no LLM-driven price calculation.

---

### Task 1: Database & Domain Models (Parallelizable)

**Files:**
- Create: `packages/database/models/analysis.py`
- Modify: `packages/database/models/__init__.py:80`
- Create: `packages/domain/models/analysis.py`
- Create: `migrations/versions/xxxx_add_analysis_models.py` (via alembic)

**Interfaces:**
- Consumes: None
- Produces: `AnalysisSessionModel`, `ChartDrawingModel`, `TradingPlanModel` SQLAlchemy tables and Pydantic schemas.

- [ ] **Step 1: Write Domain Schemas**
Create Pydantic models for drawings, sessions, and trading plans.
- [ ] **Step 2: Write SQLAlchemy Models**
Create the database tables mirroring the schemas.
- [ ] **Step 3: Generate Alembic Migration**
Run `alembic revision --autogenerate -m "add analysis models"` and verify.
- [ ] **Step 4: Commit**
```bash
git add packages/database packages/domain migrations
git commit -m "feat: add analysis and drawing domain models"
```

---

### Task 2: Quant & Analytics Engine (Parallelizable)

**Files:**
- Create: `packages/quant/structure.py`
- Create: `packages/quant/indicators.py`
- Create: `tests/packages/quant/test_structure.py`
- Create: `tests/packages/quant/test_indicators.py`

**Interfaces:**
- Consumes: Raw OHLCV data `list[dict]`
- Produces: `find_swing_points(candles, window=5)`, `calculate_indicators(candles, params)`

- [ ] **Step 1: Write Swing Point Tests**
Write a test with a static array of OHLCV simulating a swing high and low.
- [ ] **Step 2: Implement Swing Point Logic**
Write deterministic fractal swing detection (e.g. 5-bar window).
- [ ] **Step 3: Write Indicator Tests**
Write a test verifying basic moving average output.
- [ ] **Step 4: Implement Indicator Wrappers**
Implement `calculate_indicators` using `pandas` / `numpy` or basic iteration.
- [ ] **Step 5: Commit**
```bash
git add packages/quant tests/packages/quant
git commit -m "feat: add deterministic quant and structure engines"
```

---

### Task 3: Hermes Tools API (Depends on Task 1 & 2, but API contract is fixed)

**Files:**
- Create: `packages/hermes_tools/chart.py`
- Modify: `packages/hermes_tools/client.py`
- Create: `services/intelligence/api/chart.py`
- Modify: `services/intelligence/main.py`

**Interfaces:**
- Consumes: `ChartDrawingModel`, `TradingPlanModel`, Quant functions.
- Produces: API endpoints `/api/v1/tools/chart/state`, `/api/v1/tools/chart/draw`, `/api/v1/tools/chart/plan`.

- [ ] **Step 1: Write API Route Tests**
Mock database and assert endpoints return expected schemas.
- [ ] **Step 2: Implement FastAPI Routes**
Write routes that parse payload, save to DB, and return success.
- [ ] **Step 3: Update Hermes Client**
Add `get_chart_state()`, `draw_on_chart(payload)`, `create_structured_plan(payload)` to `HermesToolsClient`.
- [ ] **Step 4: Commit**
```bash
git add packages/hermes_tools services/intelligence
git commit -m "feat: expose chart and planning hermes tools"
```

---

### Task 4: Frontend Chart Drawing Overlay (Parallelizable)

**Files:**
- Create: `apps/web/src/components/trading/ChartOverlay.tsx`
- Modify: `apps/web/src/components/trading/MarketChart.tsx`
- Create: `apps/web/src/hooks/useChartDrawings.ts`

**Interfaces:**
- Consumes: Lightweight charts `chartRef` (for `timeToCoordinate` / `priceToCoordinate`).
- Produces: An absolutely positioned `<svg>` overlay tracking time/price coordinates to draw rectangles, trendlines.

- [ ] **Step 1: Create Drawing Hook**
Create `useChartDrawings` to fetch drawings from the backend API.
- [ ] **Step 2: Build SVG Overlay Component**
Build `<ChartOverlay>` that takes `IChartApi` and drawing objects, converting them to X/Y pixel coordinates on render and on chart scroll/zoom events (`chart.timeScale().subscribeVisibleTimeRangeChange`).
- [ ] **Step 3: Integrate into MarketChart**
Mount the overlay inside the relative container of `MarketChart.tsx`.
- [ ] **Step 4: Commit**
```bash
git add apps/web/src/components/trading
git commit -m "feat: add ai-controlled drawing overlay to market chart"
```
