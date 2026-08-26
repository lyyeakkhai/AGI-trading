# Foundation 3: Portfolio and Execution Engine — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F3 of 13
**Depends on:** F0, F1, F2
**Unlocks:** F4, F11, F12
**Blueprint tasks:** 3.1 – 3.13

---

## 1. Purpose

Foundation 3 builds the core accounting ledger and execution safety boundaries. It is the financial heart of the platform. It ensures that money is tracked perfectly, that no order is ever sent twice by accident, that we can paper trade realistically, and that any discrepancy between our records and the exchange immediately halts trading.

---

## 2. Scope

### In scope
- **Idempotency Engine:** Database enforced unique constraints for financial commands.
- **Execution State Machine:** Strict lifecycle transitions including fail safe `UNKNOWN` state handling.
- **Paper Execution Adapter:** Simulating market orders against live F2 market data with fixed slippage.
- **Portfolio Accounting:** `fills` ledger and cached `portfolio_accounts` / `portfolio_positions` with atomic updates.
- **Reconciliation Engine:** Background divergence detection and trading circuit breaker.
- **Audit Logging:** Append only state transition tracking via `correlation_id`.
- **REST APIs:** Portfolio and reconciliation endpoints for the future dashboard.

### Out of scope
- Live Binance API keys and live execution adapter (F12).
- Risk Engine rule execution and limit checks (F4).
- Opportunity scanner and quantitative indicator engine (F5).
- Strategy registry and vectorbt backtesting (F6).

---

## 3. Architecture & Components

### 3.1 Idempotency Engine
Before any network call to an exchange, the system generates a deterministic `idempotency_key` (e.g., hash of proposal ID and action) and inserts it into an `idempotency_keys` table. A database unique constraint ensures that if two threads attempt the same action concurrently, one will fail with a constraint violation. The system catches this and safely returns the original outcome, preventing double spend.

### 3.2 Execution State Machine
Execution requests follow strict state transitions:
`PENDING` -> `SUBMITTING` -> `SUBMITTED` -> `PARTIALLY_FILLED` / `FILLED` / `CANCELLED` / `REJECTED`.
If a network timeout occurs during `SUBMITTING`, the state transitions to `UNKNOWN`. While any order is in `UNKNOWN` state, the platform is hard blocked from placing new orders for that asset. A recovery worker will query the exchange by `client_order_id` to resolve the state (filled or dropped) before unblocking.

### 3.3 Paper Execution Adapter
The `PaperExecutionAdapter` executes simulated trades. To keep the accounting rock solid and avoid race conditions, it uses a **Simple Fixed Slippage** model. A flat percentage penalty (e.g., 0.05%) is applied to the current F2 ticker price for all simulated market orders. Exchange fee structures are simulated and deducted from the cash balance.

### 3.4 Portfolio Derivation (Cached State with Atomic Updates)
The absolute source of truth is the append only `fills` table, deduplicated by `exchange_trade_id`. To provide microsecond read performance for the Risk Engine, we maintain cached `portfolio_accounts` (cash) and `portfolio_positions` (assets) tables. When a new fill arrives, the system uses a single PostgreSQL transaction to insert the fill and update the cached tables simultaneously.

### 3.5 Reconciliation Engine
A background worker runs on startup and every 5 minutes to compare the database portfolio state against the exchange or paper adapter state. 
- Missing fills are classified as `RESOLVABLE` and pulled in idempotently.
- Missing cash or phantom assets are classified as `CRITICAL` divergence.
- A `CRITICAL` divergence sets a `reconciliation_blocked = True` flag in the database, instantly halting all trading globally.

### 3.6 Manual Unblocking
The `reconciliation_blocked` flag can only be cleared via explicit owner acknowledgement. This is implemented as a simple REST endpoint (`POST /api/v1/reconciliation/unblock`) that flips the flag back to `False` once the owner has manually resolved the discrepancy.

### 3.7 Financial Audit Logger
Every state transition (proposal created, risk evaluated, owner approved, order submitted, fill received, divergence detected) writes an immutable record to the `audit_records` table. Every action in a single sequence shares the same `correlation_id`, allowing complete timeline reconstruction of any financial event.

---

## 4. Acceptance Criteria

- **AC-3.1**: Deterministic idempotency key is persisted to PostgreSQL before any network call.
- **AC-3.2**: `client_order_id` is derived deterministically from the idempotency key.
- **AC-3.3**: Execution state machine strictly enforces valid state transitions.
- **AC-3.4**: Network timeouts transition execution state to `UNKNOWN`, blocking subsequent orders until queried.
- **AC-3.5**: `PaperExecutionAdapter` executes simulated spot trades against real market data with a fixed slippage model and simulated fees.
- **AC-3.6**: Paper execution rejects orders exceeding available balance.
- **AC-3.7**: Fills are written to the ledger deduplicated by `(exchange_trade_id, symbol, trading_mode)`.
- **AC-3.8**: Positions, cost basis, and P&L are updated transactionally alongside fills using `Decimal` arithmetic.
- **AC-3.9**: Owner approval binding validates proposal attributes and submission time TTL.
- **AC-3.10**: Portfolio snapshots are recorded to TimescaleDB.
- **AC-3.11**: Reconciliation engine runs periodically, comparing internal state against exchange state.
- **AC-3.12**: Reconciliation classifies divergences; `CRITICAL` sets `reconciliation_blocked`.
- **AC-3.13**: `reconciliation_blocked` refuses all order submissions until cleared via explicit API acknowledgement.
- **AC-3.14**: Financial audit log captures every event with `correlation_id`.
- **AC-3.15**: REST APIs expose portfolio and reconciliation endpoints.
- **AC-3.16**: `/health/trading` checks portfolio consistency and reconciliation status.
- **AC-3.17**: All financial safety test suites pass in CI.

