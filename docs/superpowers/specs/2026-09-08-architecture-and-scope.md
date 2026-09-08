# Autonomous Trading Platform — Architecture & Scope

## 1. Master Goal — Autonomous First Trade

**Build Hermes into a controlled autonomous trading system capable of completing its first end-to-end trade using Binance: observe real market data → analyze market structure → visualize its reasoning on the TradingView chart → create a structured trading plan → calculate and validate risk → execute an approved order → verify the resulting position → monitor it → record the complete decision and execution history.**

Binance is V1 only. The system must use an exchange-agnostic execution interface so additional exchanges (e.g., OKX, Bybit) can be added later without modifying the AI, analysis, chart, strategy, or risk architecture. 

The system must prioritize correctness, deterministic risk controls, auditability, and safe execution over feature count. **No order may bypass the risk engine.** The first autonomous execution should run in paper/testnet/simulation mode before live capital is enabled.

The first milestone is complete when Hermes can perform the entire lifecycle autonomously in a controlled environment:

```text
MARKET DATA
    ↓
MARKET ANALYSIS
    ↓
CHART VISUALIZATION
    ↓
TRADING PLAN
    ↓
RISK VALIDATION
    ↓
EXECUTION APPROVAL
    ↓
ORDER
    ↓
POSITION
    ↓
MONITORING
    ↓
AUDIT LOG
```

## 2. Current Repository State

After deep inspection of the repository (`/Users/lyyeakkhai/workspace/dockified/agi-trading`), the current state is:

- **Market Data**: Handled via `packages/exchange/binance.py` using CCXT (REST) and CCXT Pro (WebSockets). `services/market_data` provides persistence and a worker process.
- **Frontend Charting**: `apps/web/src/components/trading/MarketChart.tsx` integrates `lightweight-charts`. Currently supports basic marker rendering, but lacks the SVG overlays needed for semantic coordinate-based drawing (rectangles, trendlines).
- **Hermes Tools**: A REST-based tool contract exists in `packages/hermes_tools/client.py` routing to FastAPI services. It lacks the required drawing endpoints, deterministic quant endpoints, and a fully structured trading plan endpoint.
- **Risk Engine**: `packages/risk/core.py` implements a pure, deterministic, fail-closed risk evaluation engine independent of the AI. This perfectly supports the architectural requirement that Hermes cannot bypass risk limits.
- **Execution**: `services/execution/live.py` currently uses standard CCXT with raw API keys to place market/limit orders.
- **Database**: Comprehensive SQLAlchemy domain models exist in `packages/database/models/`, managed by Alembic.

## 3. The 6 Core Systems Architecture

The project is strictly divided into these six systems, ensuring modularity and exchange-agnosticism.

```text
┌───────────────────────────────────────────────┐
│                    HERMES                     │
│              AI ORCHESTRATOR                  │
└──────────────────────┬────────────────────────┘
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   MARKET DATA      ANALYSIS          CHART
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                TRADING PLAN
                       │
                       ▼
                  RISK ENGINE
                       │
                       ▼
              EXECUTION ENGINE
                       │
                       ▼
                    BINANCE
```

## 4. Required Tool Architecture

The AI-facing tool set must be smaller and more semantic than the internal API surface. We will build approximately 42 tools mapped across the functional domains for the first autonomous loop.

### A. Market Data Tools (6)
These are the first tools Hermes needs to observe the market. Hermes must be able to request multiple timeframes (e.g., `1m`, `5m`, `15m`, `1H`, `4H`, `1D`).
- `market.get_candles` (Supports symbol, timeframe, limit, start/end)
- `market.get_ticker`
- `market.get_order_book`
- `market.get_trades`
- `market.get_volume`
- `market.get_funding_rate`

### B. Chart Tools (10)
Hermes will not generate frontend code. It will produce semantic commands (e.g., `{"type": "support_zone", "price_low": 77000, "price_high": 77500, "reason": "Previous demand area"}`). The backend persists these and the chart engine converts them to visual objects.
- `chart.get_state`
- `chart.get_visible_range`
- `chart.get_drawings`
- `chart.draw_line`
- `chart.draw_zone`
- `chart.draw_marker`
- `chart.add_annotation`
- `chart.update_drawing`
- `chart.delete_drawing`
- `chart.clear_drawings`

### C. Analysis Tools (5)
The LLM will not calculate indicator values. It will request them from a deterministic Python backend (e.g., `pandas-ta`).
- `analysis.detect_swings`
- `analysis.detect_trend`
- `analysis.detect_support_resistance`
- `analysis.detect_market_structure`
- `analysis.calculate_indicator` (Supports RSI, EMA, SMA, MACD, ATR, VWAP, Bollinger Bands, Volume)

### D. Trading Plan Tools (5)
The AI never jumps directly from "BTC looks bullish" to "BUY BTC". There must be an intermediate **TradingPlan object** representing the contract between intelligence and execution.
- `plan.create`
- `plan.get`
- `plan.update`
- `plan.validate`
- `plan.cancel`

*Example internal structure:*
```json
{
  "symbol": "BTCUSDT",
  "market": "spot",
  "direction": "LONG",
  "entry": { "price": 78000 },
  "stop_loss": { "price": 77000 },
  "take_profit": [
    { "price": 79500 },
    { "price": 81000 }
  ],
  "risk": { "risk_percent": 0.5 },
  "thesis": "...",
  "invalidation": "...",
  "evidence": ["...", "..."]
}
```

### E. Risk Engine Tools (4)
Mandatory safety gates before autonomous execution. The AI cannot bypass this.
- `risk.calculate_position_size`
- `risk.calculate_exposure`
- `risk.validate_plan`
- `risk.check_portfolio_risk`

### F. Execution Tools (6)
Keep the AI-facing interface exchange-neutral. The execution engine wraps an underlying Binance Adapter (which may utilize Binance Agent OS MCP).
- `execution.get_balance`
- `execution.get_positions`
- `execution.get_open_orders`
- `execution.place_order`
- `execution.cancel_order`
- `execution.get_order`
*(Later additions: `modify_order`, `close_position`)*

### G. Position Monitoring (3)
After the first order, Hermes must manage the trade lifecycle.
- `position.get`
- `position.monitor`
- `position.close`

### H. Audit & Memory (3)
Every autonomous decision must be recorded so a human can ask, *"Why did Hermes take this trade?"* and reconstruct the entire decision.
- `decision.create_log`
- `decision.get_history`
- `trade.get_history`

## 5. The First-Trade Workflow (Integration Test)

When Hermes receives the prompt: *"Analyze BTCUSDT"*, the expected autonomous loop is:

1. **Observe**: `market.get_candles()`, `market.get_ticker()`, `market.get_order_book()`
2. **Analyze**: `analysis.detect_swings()`, `analysis.detect_trend()`, `analysis.detect_support_resistance()`, `analysis.detect_market_structure()`
3. **Visualize**: `chart.draw_line()`, `chart.draw_zone()`, `chart.add_annotation()` (TradingView updates in real-time)
4. **Create plan**: `plan.create()` (Structured object with Entry, Stop, Targets, Thesis)
5. **Risk**: `risk.calculate_position_size()`, `risk.validate_plan()`, `risk.check_portfolio_risk()`
6. **Execution**: ONLY if RISK = APPROVED, `execution.place_order()`
7. **Verify**: `execution.get_order()`, `position.get()`
8. **Monitor**: `position.monitor()`
9. **Record**: `decision.create_log()`

## 6. Definition of Done (First Trade Acceptance Test)

**Given:** BTCUSDT, real Binance market data, configured account, configured TradingView chart.
**Hermes must autonomously:**
- [ ] Retrieve market data
- [ ] Retrieve multiple timeframes
- [ ] Analyze market structure
- [ ] Identify swing points
- [ ] Identify support/resistance
- [ ] Create a market thesis
- [ ] Draw analysis on TradingView
- [ ] Create a structured TradingPlan
- [ ] Calculate position size
- [ ] Calculate exposure
- [ ] Validate risk
- [ ] Reject invalid plans
- [ ] Approve valid plans
- [ ] Create an execution request
- [ ] Submit the order in test/paper environment
- [ ] Verify the order
- [ ] Detect resulting position
- [ ] Monitor position
- [ ] Record complete audit trail
*(No manual intervention should be required inside the approved autonomous workflow)*

## 7. Explicitly Out of Scope for Milestone 1

Do not build these yet. Prove ONE AI → ONE MARKET → ONE EXCHANGE → ONE STRATEGY → ONE POSITION first, then scale.
- ❌ OKX / Multi-exchange arbitrage
- ❌ Options / DEX
- ❌ Copy trading / Social trading / Trading bots
- ❌ AI marketplace / Strategy marketplace
- ❌ 100+ indicators
- ❌ Multiple simultaneous agents trading independently

## 8. Binance Agent OS Integration Strategy

We will treat Binance Agent OS as an external infrastructure capability for Phase 1.
1. **Execution Adapter**: We will wrap the existing execution mechanics with an Agent OS adapter if the MCP provides the required trading scopes securely via Agentic sub-accounts.
2. **Investigation Required**: Before writing execution code, we must verify the exact capabilities of the Binance MCP endpoint (`https://agent.binance.com/mcp/agentic`), specifically regarding WebSocket streaming latency vs REST API limits, and supported order types. If the MCP lacks high-frequency data streams, we fall back to our existing CCXT WebSocket implementation (`packages/exchange/binance.py`) for data, but use Agent OS for execution.
