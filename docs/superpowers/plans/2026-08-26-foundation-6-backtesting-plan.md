# Foundation 6: Strategy Registry & Backtesting — Implementation Plan

**Foundation:** F6
**Spec:** `docs/superpowers/specs/2026-08-26-foundation-6-backtesting-design.md`
**Branch:** `feat/foundation-6-backtesting`

---

## Task 6.1: Strategy Schemas & Lifecycle
- Create `packages/domain/strategy.py`.
- Define `StrategyState` enum (`DRAFT`, `BACKTESTING`, `VALIDATED`, `PAPER_TRADING`, `LIVE_LIMITED`, `APPROVED`, `REJECTED`).
- Define `StrategyParameters` and `StrategyVersion` Pydantic models. Enforce version immutability logically.

## Task 6.2: Strategy Registry Service & Database
- Create `packages/database/models/strategy.py` with SQLAlchemy models `StrategyModel` and `StrategyVersionModel`.
- Create `services/backtesting/registry.py` with `StrategyRegistry` containing methods to create strategies, version them, and transition their states.

## Task 6.3: Core Event-Driven Backtesting Engine
- Create `services/backtesting/engine.py`.
- Implement `EventDrivenBacktester`. It must loop over historical candles chronologically.
- Ensure strict look-ahead prevention: strategy `evaluate()` is called with data up to index $t$; decisions generate orders that execute against the opening price of index $t+1$.

## Task 6.4: Transaction Cost Models
- Create `packages/quant/costs.py`.
- Implement `FeeModel` (deducts 0.1% for maker/taker Binance spot).
- Implement `SlippageModel` (adds configurable bps to execution prices).
- Integrate Exchange Filter constraints (min notional, price precision) into the backtest engine execution phase.

## Task 6.5: Analytics & Metrics Engine
- Create `packages/quant/metrics.py`.
- Implement `calculate_performance_metrics()` computing Gross/Net Return, Max Drawdown, Win Rate, Expectancy, Sharpe Ratio (annualized), Sortino Ratio.

## Task 6.6: VectorBT Integration (Graceful Degradation)
- Create `services/backtesting/vbt_runner.py`.
- Attempt `import vectorbt as vbt`. If unavailable, `VBT_AVAILABLE = False`.
- Implement `run_vbt_backtest()` for high-speed parameter grid searching if available.

## Task 6.7: Async Backtest Worker
- Create `packages/database/models/backtest.py` (`BacktestJobModel`, `BacktestResultModel`).
- Create `services/backtesting/worker.py` handling queued backtest execution.
- Persist equity curves (JSONB) and trade logs.

## Task 6.8: Benchmark Engine
- Create `services/backtesting/benchmark.py`.
- Calculate Buy & Hold baseline returns over the exact same time window as the tested strategy to generate relative alpha metrics.

## Task 6.9: REST APIs
- Create `apps/api/routers/backtesting.py` exposing:
  - `POST /api/v1/strategies`
  - `POST /api/v1/strategies/{id}/versions`
  - `POST /api/v1/backtests` (queues job)
  - `GET /api/v1/backtests/{id}`
- Mount in `apps/api/main.py`.

## Task 6.10: Verification Test Suite
- Create `tests/unit/test_backtesting_engine.py` using synthetic candles to mathematically verify that a signal at $t$ executes at $t+1$.
- Create `tests/unit/test_backtesting_costs.py` verifying exact fee and slippage math.
- Create `tests/unit/test_backtesting_api.py`.
