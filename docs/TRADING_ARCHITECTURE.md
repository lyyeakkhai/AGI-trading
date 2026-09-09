# Trading Architecture

## Core Principle
**Human and AI must share the same trading system.** There is no "AI execution path" separate from the "Human execution path".

## High-Level Data Flow

```text
       HUMAN UI                           HERMES (AI Agent)
     (React / Next.js)                      (Python / LLM)
            │                                     │
            │ (REST API)                          │ (Hermes Tools Client)
            └─────────────────┬───────────────────┘
                              │
                              ▼
                     TRADING DOMAIN API
             (apps/api/routers/plan_risk_tools.py)
                              │
                              ▼
                         RISK ENGINE
                    (packages/risk/core.py)
                              │
                              ▼
                      EXECUTION ENGINE
                (services/execution/[mode].py)
                              │
                              ▼
                      EXCHANGE ADAPTER
               (packages/exchange/binance.py)
                              │
                              ▼
                           BINANCE
```

## Component Responsibilities

1. **Trading Domain API**: The entry point for creating and managing `TradingPlanModel` objects. Ensures that both humans and AI form well-structured trade intents.
2. **Risk Engine**: A deterministic gatekeeper. It evaluates the trade intent against account balance, maximum exposure, concentration limits, and stop-loss logic. Returns `APPROVED`, `MODIFIED` (which we reject for plans), or `REJECTED`.
3. **Execution Engine**: Handles the lifecycle of `ExecutionRequest` and `Order` objects. Manages paper trading vs. live trading environments.
4. **Exchange Adapter**: An abstraction over CCXT. Translates AGI Trading domain concepts into Binance-specific Spot or Futures API calls. Prevents tight coupling to Binance terminology.
