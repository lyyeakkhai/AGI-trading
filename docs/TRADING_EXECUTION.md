# Trading Execution

The Execution Engine translates an approved `TradingPlan` into actual exchange interactions.

## Binance Adapter Refactoring
The current `BinanceCCXTAdapter` uses `{"options": {"defaultType": "spot"}}`.
- Must be updated to accept `market_type` on instantiation, creating distinct CCXT clients for Spot vs. USDⓈ-M Futures.
- **Spot**: standard limit/market orders.
- **Futures**: 
  - Must handle `reduceOnly` flags for Stop Loss and Take Profit orders.
  - Must fetch leverage and margin mode settings.

## Order Routing Flow
1. **Approval**: Plan is approved by human or automated policy.
2. **Translation**: `ExecutionRequest` is converted into a primary Entry order.
3. **Execution**: Sent to Binance via CCXT.
4. **Contingent Orders**: Once the Entry order fills (partially or fully), the Stop Loss and Take Profit orders are dispatched (or attached as OCO / conditional orders if supported by the exchange natively).

## Paper vs. Live
- **Paper**: Simulated execution engine. Uses real-time market data to trigger fills locally. No API keys used.
- **Live**: Requires authenticated Binance API keys. Strictly gated by the `TradingMode` enum.
