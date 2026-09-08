# Trading V1 Architecture

## System Boundary
The frontend `features/trading` acts as a pure client to the backend `Trading Domain`. It is critical that the frontend does **not** perform its own execution logic or bypass the risk engine.

## Unified Trading Execution
```text
React (features/trading)                   Hermes (AI Agent)
       │                                          │
       ▼                                          ▼
   Trading API                              AI Trading Tools
       │                                          │
       └──────────────────┬───────────────────────┘
                          ▼
                    Trading Domain
                          ▼
                     Risk Engine
                          ▼
                   Execution Engine
                          ▼
                   Binance Adapter
```
The UI constructs a `TradingPlan` matching the exact schema that Hermes uses.

## V1 Supported Scope
- **Markets**: Spot, USDⓈ-M Futures.
- **Order Types**: Market, Limit, Stop Loss, Take Profit.
- **Futures Semantics**: Long, Short, Leverage, Margin, Reduce Only.
