# Foundation 6: Strategy Registry & Backtesting — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F6 of 13
**Depends on:** F0, F1, F2, F5
**Unlocks:** F8
**Blueprint tasks:** 6.1 – 6.10

---

## 1. Purpose

Foundation 6 provides the "reality check" for AI-generated trading strategies. It stores versioned strategy definitions and runs historical simulations using strict event-driven logic to prove a strategy's edge before allowing it to run in paper or live modes. It guarantees that look-ahead bias is impossible and forces simulated trading to suffer the exact same fees, slippage, and minimum notional constraints as live trading.

---

## 2. Scope

### In scope
- **Strategy Registry:** Database schemas for versioned strategy records and state machine lifecycles (DRAFT -> BACKTESTING -> VALIDATED, etc.).
- **Strict Event-Driven Backtesting:** A tick-by-tick (or candle-by-candle) simulation engine guaranteeing zero look-ahead bias.
- **Realism Models:** Applying Binance maker/taker fees, order slippage, and step-size precision to all simulated fills.
- **Performance Analytics:** Calculating P&L, Sharpe/Sortino ratios, max drawdown, and comparing them to a "Buy & Hold BTC" benchmark.
- **VectorBT Fallback:** For high-speed grid searches, vectorbt is supported if the optional quant layer is installed.
- **REST APIs:** Endpoints to submit backtest jobs and view results.

### Out of scope
- The LLM generating the strategy code (F8).
- Real-time live execution (F12).
- Dashboard charting UI (F11).

---

## 3. Architecture & Components

### 3.1 The Strategy Registry (`packages/domain/strategy.py`, `services/backtesting/registry.py`)
A PostgreSQL-backed repository storing immutable strategy versions. When an AI agent tweaks a parameter, it must create a new version (e.g., `v2`). Strategies follow a strict state machine: they cannot progress to `PAPER_TRADING` unless their `BACKTESTING` phase yields a positive net return and passes Risk Validation.

### 3.2 The Core Backtesting Engine (`services/backtesting/engine.py`)
The engine iterates through historical TimescaleDB candle data strictly monotonically.
- **Time Alignment:** Signals generated on the close of candle $t$ are guaranteed to execute no earlier than the open of candle $t+1$.
- **Realism Constraints:** Every simulated order is passed through the `ExchangeFilter` (minimum notional, step size) and `FeeModel` (deducting 0.1% Binance spot fees and configurable slippage).

### 3.3 VectorBT Accelerator (`services/backtesting/vbt_runner.py`)
While the core engine is strict and event-driven, the system optionally uses the fast `vectorbt` library for rapid parameter grid searches. If the host lacks C dependencies, the system gracefully disables grid search and relies purely on the event-driven engine.

### 3.4 Async Worker & Performance Analytics (`services/backtesting/worker.py`)
Backtests can be long-running. The API accepts a backtest job, returns an ID, and an async worker processes it in the background. Once complete, it calculates risk-adjusted returns (Sharpe, Sortino, Max Drawdown) and compares the strategy's equity curve directly against a baseline "Buy and Hold" of the underlying asset.

---

## 4. Acceptance Criteria

- **AC-6.1**: Registry maintains versioned strategy records with lifecycle states (DRAFT -> APPROVED).
- **AC-6.2**: Strategy versions are immutable; updates create new versions.
- **AC-6.3**: Registry persists to Postgres and blocks unapproved strategies from live execution.
- **AC-6.4**: Strict time alignment prevents look-ahead bias (signals at $t$ execute at $t+1$).
- **AC-6.5**: Simulation models Binance fees and slippage, recording gross vs net returns.
- **AC-6.6**: Exchange filters (min notional, step size) apply to backtest orders.
- **AC-6.7**: Metrics engine computes total return, max drawdown, Sharpe/Sortino ratios, and regime breakdowns.
- **AC-6.8**: `vectorbt` runner executes fast backtests using the quant layer, degrading gracefully if omitted.
- **AC-6.9**: Backtests run asynchronously, saving equity curves and trade logs to DB.
- **AC-6.10**: Benchmark engine evaluates strategies against BTC/ETH Buy & Hold baselines.
- **AC-6.11**: REST APIs expose strategy management and backtest queuing.
- **AC-6.12**: Automated tests prove zero look-ahead bias and accurate fee deduction.
