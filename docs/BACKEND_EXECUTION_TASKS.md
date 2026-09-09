# Backend Execution Tasks

**Objective**: Connect the UI intents to the backend engines and refactor the exchange adapters to route Spot vs. USDⓈ-M Futures.

## Task 1: Update BinanceCCXTAdapter
- **File**: `packages/exchange/binance.py`
- **Goal**: Allow the exchange adapter to correctly execute against `fapi` (Futures) when `market="FUTURES"`.
- **Implementation**:
  - Update initialization to accept or switch `options={'defaultType': 'future'}` for CCXT.
  - Expose a `set_leverage(symbol, leverage)` method wrapper around CCXT's `setLeverage()`.
  - Pass the `reduceOnly` flag in the `params` dictionary for order creation when closing positions.

## Task 2: Implement Margin Simulation API
- **File**: `routers/execution_tools.py` & `services/execution/simulator.py`
- **Goal**: Create an endpoint that receives a draft `TradingPlanCreate` payload and returns the required margin, estimated fees, and liquidation price before the user executes it.
- **Implementation**:
  - Add `POST /api/v1/tools/execution/simulate`.
  - The service should fetch the current ticker price, calculate `(price * size) / leverage`, add the maker/taker fee tiers, and return the `ExecutionPreview` model.

## Task 3: Wire Execute Route
- **File**: `routers/execution_tools.py`
- **Goal**: Update the live `execute_plan` endpoint to call `set_leverage` before placing entry orders if the market is FUTURES.
