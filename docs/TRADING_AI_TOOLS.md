# Trading AI Tools (Hermes)

Hermes interacts with the trading system using a Python SDK wrapper around the Trading API.

## PlanTools
- `create_plan(...)`: Already exists. Ensure it supports `market="futures"` and `leverage`.
- `validate_plan(...)`: Triggers the deterministic risk engine.

## RiskTools
- `calculate_position_size(...)`: Calculates optimal quantity based on stop loss distance and risk percent.

## ExecutionTools
- `preview_execution(...)`: Returns the simulated order routing and margin impact.
- `execute_plan(...)`: Commits the plan to live/paper execution.

## Context Tools
- `get_positions(market)`: Retrieves current open positions (Spot balances or Futures positions).
- `get_open_orders()`: Retrieves pending limit/stop orders.
