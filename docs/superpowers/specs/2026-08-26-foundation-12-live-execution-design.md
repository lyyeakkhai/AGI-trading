# Foundation 12: Live Binance Execution — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F12 of 13
**Depends on:** F0, F1, F2, F3, F4, F5, F6, F7, F8, F11
**Unlocks:** Production deployment
**Blueprint tasks:** 12.1 – 12.8

---

## 1. Purpose

Foundation 12 crosses the rubicon from paper trading to **Tiny Live Trading**. It introduces the isolated `execution-service` microservice, which is the *only* component in the entire architecture that holds Binance API keys. 

By enforcing strict sole-custody of credentials and implementing rigorous pre-submission checks, database-backed idempotency, and live ledger reconciliation, we guarantee that the AI agent can never hallucinate a live order directly and that the system fails closed at the first sign of financial divergence.

---

## 2. Scope

### In scope
- **Execution Service (`execution-service`):** A dedicated Python container holding `BINANCE_API_KEY` and `BINANCE_SECRET_KEY`.
- **Binance Adapter (`services/execution/adapters/binance.py`):** Uses CCXT to place orders, fetch fills, and cancel orders using strict `Decimal` types.
- **Precondition Evaluator:** 11 safety checks (PRD 8.3) that must pass *milliseconds* before an order is sent to Binance (e.g., kill switch is off, API permissions are trade-only, portfolio is reconciled).
- **Idempotency & State Recovery:** Ensuring a single platform command maps to a unique `client_order_id` in Postgres and Binance. Recovery logic for ambiguous `UNKNOWN` network states.
- **Live Reconciliation Engine:** Periodically comparing local database balances against real Binance balances, freezing trading if a divergence exceeds the rounding threshold.
- **Production Hardening:** Updating the Caddyfile for real TLS and IP allowlisting.

### Out of scope
- Perpetual futures or margin trading — Spot only.
- Direct portfolio deposits/withdrawals via API (explicitly forbidden).

---

## 3. Architecture & Components

### 3.1 The Order Flow (End-to-End)
1. Hermes generates a `TradeProposal` (F8).
2. Risk Engine evaluates and marks it `PENDING_APPROVAL` (F4).
3. Owner logs into the Dashboard and clicks "Approve" (F11).
4. API marks it `APPROVED` and generates an `ExecutionCommand` (F3).
5. The `execution-service` (F12) picks up the command from Redis Streams or Postgres.
6. The `Precondition Evaluator` runs its 11 checks.
7. The `BinanceExecutionAdapter` translates the command to a CCXT `create_order` call with a unique `client_order_id`.
8. The state machine transitions to `SUBMITTED`, then `FILLED`.

### 3.2 Security Boundary Enforcement
- The Binance API key is injected *only* into the `execution-service` container via `.env`.
- On startup, the service calls the Binance API to verify the key has `canTrade=True` and `canWithdraw=False`. If withdrawal is enabled, the service refuses to start.
- The `execution-service` exposes no REST endpoints; it only listens to a message queue or polls the database for `APPROVED` commands.

### 3.3 Reconciliation
- A background worker (`services/reconciliation/worker.py`) polls Binance balances every minute.
- It compares the exchange balance to `portfolio_balances` in the database.
- If a discrepancy `> $0.01` is found, it flips the `reconciliation_blocked` boolean in `Settings`, immediately halting the Precondition Evaluator.

---

## 4. Acceptance Criteria
- **AC-12.2:** `execution-service` verifies its credentials on startup and crashes if withdrawal permissions exist.
- **AC-12.3:** `BinanceExecutionAdapter` successfully executes spot trades via CCXT.
- **AC-12.4:** Precondition checks block orders if the Kill Switch is active, TRADING_MODE is paper, or reconciliation is blocked.
- **AC-12.5:** Idempotency is proven: duplicate commands fail gracefully without sending duplicate orders to Binance.
- **AC-12.7:** A forced mismatch in the database triggers a persistent `reconciliation_blocked` lock.
- **AC-12.8:** Caddy handles TLS termination properly.
