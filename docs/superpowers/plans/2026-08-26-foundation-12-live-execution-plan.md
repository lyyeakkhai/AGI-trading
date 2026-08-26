# Foundation 12: Live Binance Execution — Implementation Plan

**Foundation:** F12
**Spec:** `docs/superpowers/specs/2026-08-26-foundation-12-live-execution-design.md`
**Branch:** `feat/foundation-12-live-execution`

---

## Task 12.1: Execution Service Containerization
- Add `ccxt` to `pyproject.toml` (core).
- Create `infrastructure/docker/execution.Dockerfile`.
- Add `execution` service to `docker-compose.yml`, ensuring it has access to `BINANCE_API_KEY` and `BINANCE_SECRET_KEY` env vars (these should ONLY be passed to this container).

## Task 12.2: Credential Verification
- Create `services/execution/credential_verifier.py`.
- On startup, instantiate `ccxt.binance()`. Fetch account permissions.
- Assert that `canTrade` is `True` and `canWithdraw` is `False`. Raise `SystemExit` if withdrawal is enabled.

## Task 12.3: Binance CCXT Adapter
- Create `services/execution/adapters/binance.py`.
- Implement `submit_order(symbol, side, quantity, price, client_order_id)`. Ensure all numbers are handled as Python `Decimal` before passing to CCXT to prevent floating-point drift.
- Implement `cancel_order(order_id, symbol)`.
- Implement `get_fills(order_id, symbol)`.

## Task 12.4: Precondition Evaluator
- Create `services/execution/preconditions.py`.
- Implement a `run_preflight_checks()` function that validates:
  - System Kill Switch is OFF.
  - `TRADING_MODE` is `live` and `LIVE_TRADING_ENABLED` is `true`.
  - `reconciliation_blocked` is `False`.
  - The API connection is alive (ping).

## Task 12.5 & 12.6: Idempotency & State Recovery
- Create `services/execution/worker.py`. This worker listens for `APPROVED` ExecutionCommands.
- When processing, generate a unique `client_order_id` based on the internal DB `command_id`.
- Catch CCXT network exceptions (`ccxt.NetworkError`, `ccxt.ExchangeError`). If the state is ambiguous (`UNKNOWN`), do NOT resubmit. Instead, query Binance for the `client_order_id` to see if it went through.

## Task 12.7: Live Reconciliation Engine
- Create `services/reconciliation/worker.py`.
- Run a background loop (every 60 seconds) that fetches total exchange balances via `ccxt.fetch_balance()`.
- Compare against local Postgres `portfolio_balances`.
- If difference > $0.01 in fiat value, write a `SystemAlert` and flip `reconciliation_blocked = True` in Redis/DB to halt the Precondition Evaluator.

## Task 12.8: Production Proxy Hardening
- Modify `infrastructure/caddy/Caddyfile`.
- Configure `tls` blocks for the production domain.
- Add basic Rate Limiting or IP Allowlisting (e.g., using `@blocked` remote_ip matchers) to strictly restrict who can access the owner dashboard.
