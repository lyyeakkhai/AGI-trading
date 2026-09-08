# AGI Trading — V1 Trading System Master Plan

## Executive Summary
The V1 Trading System for AGI Trading establishes a unified foundation where both human traders (via UI) and autonomous agents (like Hermes, via tools) share the exact same Trading Domain, Risk Engine, and Execution Engine. V1 targets Spot and USDⓈ-M Futures on Binance.

## Gap Analysis (Current vs. V1 Target)

### 1. Navigation
- **Current**: Large permanent left sidebar (`Sidebar.tsx`, `AppShell.tsx`).
- **Target**: Compact top navigation with dropdowns for Trade, Intelligence, Portfolio, System.
- **Gap**: Requires complete refactoring of the main application shell and routing layout.

### 2. Trading Workspace
- **Current**: Fragmented pages (`/markets`, `/execution`, `/positions`, `/trade-proposals`). No cohesive trading interface.
- **Target**: A centralized `/trade` workspace featuring a Market Header, TradingView Chart, Order Panel (Spot/Futures), Open Orders, and Positions.
- **Gap**: The `/trade` page and the unified Order Panel must be built from scratch, composing existing chart and order book components.

### 3. Trading Domain & API
- **Current**: `TradingPlanModel` exists with `symbol`, `market`, `direction`, `entry_price`, `stop_loss_price`, `take_profit_prices`, and `risk_percent`. `TradeProposal` exists. Risk evaluation logic is present. 
- **Target**: Seamless support for Futures semantics (leverage, reduce-only flags).
- **Gap**: The domain models are mostly complete but require minor updates to accommodate Futures-specific execution parameters.

### 4. Exchange Adapter (Binance)
- **Current**: CCXT integration in `packages/exchange/binance.py` is hard-coded to `spot` default type.
- **Target**: Support both Spot and USDⓈ-M Futures.
- **Gap**: Must refactor the adapter to support multiple CCXT instances or dynamic configuration for Spot vs. Futures, and map the execution logic accordingly.

### 5. AI Tools
- **Current**: Comprehensive toolset in `packages/hermes_tools/client.py` and backend API endpoints.
- **Target**: Hermes should be able to create, validate, and execute plans for both Spot and Futures.
- **Gap**: Ensure tools expose the `market` parameter correctly and that the backend respects Futures logic during risk validation and execution.

## Deliverables
Detailed specifications and task breakdowns have been generated in the `docs/` directory.

- `TRADING_ARCHITECTURE.md`: System design and shared engine patterns.
- `TRADING_DOMAIN.md`: Domain schema definitions.
- `TRADING_API.md`: Backend API contracts.
- `TRADING_AI_TOOLS.md`: Hermes tool definitions.
- `TRADING_CHART_TOOLS.md`: TradingView integration specs.
- `TRADING_RISK_ENGINE.md`: Validation and safety limits.
- `TRADING_EXECUTION.md`: Binance adapter and routing logic.
- `TRADING_NAVIGATION.md`: Top navigation migration.
- `TRADING_UI_SPEC.md`: Unified trading workspace layout.
- `TRADING_TEST_PLAN.md`: Quality assurance approach.
- `TRADING_TASKS.md`: Concrete implementation roadmap.
