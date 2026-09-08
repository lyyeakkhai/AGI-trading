# Trading API Contracts

The REST API serves as the bridge between the UI/AI and the underlying engines.

## Existing Endpoints to Extend/Verify

`POST /api/v1/tools/plan/create`
- Must accept `market` parameter (`spot` or `futures`).
- Must accept `leverage` (defaulting to 1 for spot).

`POST /api/v1/tools/risk/validate_plan`
- Must validate Futures-specific logic (e.g., sufficient margin given leverage).
- Must enforce paper/live context cleanly.

`POST /api/v1/tools/execution/preview` (To be added/refined)
- **Request**: `plan_id`
- **Response**: Details the exact `Order` objects that will be created, the required margin, estimated fees, and risk metrics. Used by UI to show the user a confirmation dialog.

`POST /api/v1/tools/execution/execute` (To be added/refined)
- **Request**: `plan_id`, `approval_token`
- **Response**: Dispatches the plan to the Execution Engine.

## WebSockets
- Real-time updates for Order status (`FILLED`, `CANCELED`, etc.).
- Real-time updates for Position changes (Unrealized PnL).
