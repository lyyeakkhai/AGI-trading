# Trading Tasks Roadmap

## Phase 1: Architecture & UI Refactor
**Objective**: Establish the new navigational structure and prepare the workspace.

**TRADING-001: Implement Top Navigation**
- **Files**: `Sidebar.tsx`, `AppShell.tsx`, `Header.tsx`
- **Details**: Remove left sidebar. Build a responsive top navigation bar with dropdown menus matching the MVP spec.
- **Dependencies**: None.

**TRADING-002: Create Trading Workspace Structure**
- **Files**: `src/app/trade/page.tsx`, `TradingWorkspace.tsx`
- **Details**: Scaffold the grid layout containing placeholders for Header, Chart, Order Panel, and Bottom Tabs.
- **Dependencies**: TRADING-001.

## Phase 2: Exchange & Execution Foundation
**Objective**: Enable backend support for both Spot and USDⓈ-M Futures.

**TRADING-003: Upgrade Binance Adapter for Futures**
- **Files**: `packages/exchange/binance.py`
- **Details**: Refactor `BinanceCCXTAdapter` to accept `market_type` (Spot or Futures). Ensure CCXT handles USDⓈ-M endpoints correctly.
- **Dependencies**: None.

**TRADING-004: Enhance TradingPlan Model**
- **Files**: `packages/database/models/trading_plan.py`, `trading.py` (domain)
- **Details**: Add `leverage` field. Add `reduce_only` flag support for orders. Ensure schema supports Futures nuances.
- **Dependencies**: None.

## Phase 3: The Order Panel & UI Integration
**Objective**: Build the interface for humans to create trades.

**TRADING-005: Build Order Panel Component**
- **Files**: `OrderPanel.tsx`, `RiskPreview.tsx`
- **Details**: Create the form for Spot/Futures, Buy/Sell, Size, Price, SL, TP. Implement dynamic risk calculation preview based on current form state.
- **Dependencies**: TRADING-002.

**TRADING-006: Build Bottom Panel (Positions & Orders)**
- **Files**: `PositionsTable.tsx`, `OpenOrdersTable.tsx`
- **Details**: Display current state. Connect to backend websocket/REST endpoints for live updates.
- **Dependencies**: TRADING-002.

## Phase 4: Risk & Execution Wiring
**Objective**: Connect the UI intents to the backend engines.

**TRADING-007: Implement Execution Preview API**
- **Files**: `routers/execution_tools.py`, `services/execution/`
- **Details**: Create an endpoint that takes a draft TradingPlan and simulates the execution (margin required, fees, resulting orders) before final approval.
- **Dependencies**: TRADING-004.

**TRADING-008: Wire Order Panel to Execution API**
- **Files**: `OrderPanel.tsx`
- **Details**: Connect the "Execute" button to the create plan -> validate risk -> execute pipeline.
- **Dependencies**: TRADING-005, TRADING-007.

## Phase 5: AI & Charting Polish
**Objective**: Ensure Hermes and the UI chart can fully utilize the new system.

**TRADING-009: Verify & Update Hermes Tools**
- **Files**: `packages/hermes_tools/client.py`
- **Details**: Ensure Hermes `create_plan` and execution tools pass `market="futures"` and `leverage` correctly.
- **Dependencies**: TRADING-004.

**TRADING-010: Chart Plan Visualization**
- **Files**: `ChartOverlay.tsx`, `chart.py`
- **Details**: Render active `TradingPlan` (Entry, SL, TP) as lines/zones on the TradingView chart. Ensure AI drawings sync to UI.
- **Dependencies**: TRADING-002.
