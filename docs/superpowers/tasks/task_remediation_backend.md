# Task Prompt: Phase 2 Exchange, Execution Engine & Safety Remediation (Tasks 16, 17, 18)

## Overview
Implement the remaining features and gap remediation for the backend exchange integration, execution engine lifecycle, and live trading safety controls to bring Tasks 16, 17, and 18 from 55%–65% to 100% complete.

## Requirements

### 1. Task 16 (Binance Integration Foundation)
- In `apps/api/routers/exchange.py`:
  - Connect `/account`, `/balances`, and `/test` endpoints directly to `BinanceCCXTAdapter` instead of returning mock sleeps or static responses.
- In `packages/exchange/binance.py`:
  - Implement real account fetch and balance queries using authenticated CCXT testnet calls when credentials are provided.
- In `apps/web/src/components/settings/ExchangeConnectionsSection.tsx`:
  - Wire dynamic connection status and ping latency to the exchange API instead of hardcoded JSX text.

### 2. Task 17 (Execution Engine & Lifecycle)
- In `services/execution/` and `apps/api/routers/`:
  - Implement execution service orchestrator class hooking orders into the lifecycle state machine.
  - Refactor `services/execution/live.py` to use `BinanceCCXTAdapter` interface rather than direct CCXT calls.
  - Model `PARTIALLY_FILLED` orders and retry mechanics for `FAILED` orders.
  - Update `apps/web/src/app/execution/` to include dedicated execution history table.
  - Update frontend execution store to mutate position balances and emit activity events on filled paper orders.

### 3. Task 18 (Live Trading Controls & Safety)
- In `apps/api/routers/live.py`:
  - Create authoritative backend endpoints:
    - `GET /api/live/readiness`: runs 12 quantitative readiness checks server-side.
    - `POST /api/live/activate`: verifies checks, records owner acknowledgement, sets live state.
    - `POST /api/live/disable`: deactivates live trading.
    - `POST /api/live/emergency-stop`: unified kill switch cancelling all open orders and flattening risk.
- Wire `apps/web/src/components/live/` to call these authoritative endpoints rather than manipulating client-side state alone.
- Add audit logging to persistent activity stream on all live trading transitions.

## Verification
- Run backend test suite: `pytest tests/unit/test_binance_integration.py tests/unit/test_live_controls.py`.
- Run frontend build: `npm run build`.
