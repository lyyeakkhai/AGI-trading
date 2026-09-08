# Autonomous Trading Platform — Architecture & Scope

## 1. Executive Summary

We are building an AI-native trading intelligence, chart-planning, risk, and execution orchestration layer. The core premise is that the AI agent (Hermes) orchestrates trading by interacting with semantic objects (Trading Plans, Support/Resistance lines, Market Structure annotations) rather than interacting with a browser UI. 

Crucially, with the discovery of **Binance Agent OS**, we will pivot our exchange integration strategy. Rather than independently re-building exchange connectivity, wallets, and native order translation, we will utilize the Binance Agent OS / MCP / API infrastructure. Our proprietary system will focus purely on market intelligence, risk validation, and AI orchestration.

## 2. Current Repository State

After deep inspection of the repository (`/Users/lyyeakkhai/workspace/dockified/agi-trading`), the current state is:

- **Market Data**: Handled via `packages/exchange/binance.py` using CCXT (REST) and CCXT Pro (WebSockets). `services/market_data` provides persistence and a worker process.
- **Frontend Charting**: `apps/web/src/components/trading/MarketChart.tsx` successfully integrates `lightweight-charts` to display real-time OHLCV, volume, basic price lines, and `aiMarkers`.
- **Hermes Tools**: A REST-based tool contract exists in `packages/hermes_tools/client.py` routing to FastAPI services (e.g., `services/intelligence`).
- **Risk Engine**: `packages/risk/core.py` implements a pure, deterministic, fail-closed risk evaluation engine independent of the AI.
- **Execution**: `services/execution/live.py` currently uses standard CCXT with raw API keys to place market/limit orders.
- **Database**: Comprehensive SQLAlchemy domain models exist in `packages/database/models/`, managed by Alembic.

## 3. Existing Infrastructure

* **Re-usable**:
  - `lightweight-charts` frontend wrapper (needs overlay extensions).
  - The pure `packages/risk` engine (completely agnostic to Binance).
  - SQLAlchemy persistence layer (`packages/database`).
  - `packages/exchange/binance.py` (specifically the CCXT Pro WebSocket streams, assuming Agent OS MCP doesn't completely replace high-throughput streaming).
  - The `hermes_tools` client/server routing pattern.

* **Missing / Needs Refactoring**:
  - **Binance Agent OS**: No MCP or Agent OS integration exists. `services/execution/live.py` relies on standard API keys.
  - **Chart Tools**: Missing semantic drawing state, endpoints, and frontend SVG overlay synchronized to chart coordinates.
  - **Quant Engine**: Missing deterministic market structure and indicator algorithms.
  - **Trading Plan Domain**: `create_trade_proposal` exists but lacks full structure (Invalidation, R:R, Strategy ID).

## 4. Binance Agent OS Integration Strategy

We will treat Binance Agent OS as an external infrastructure capability. 
1. **Execution Adapter**: We will deprecate or wrap the CCXT-based `live.py` order placement with an Agent OS adapter if the MCP provides trading scopes. 
2. **Account Balances/Positions**: We will rely on the Agentic sub-account provided by Binance Agent OS.
3. **Investigation Required**: Before writing execution code, we must verify the exact capabilities of the Binance MCP endpoint (`https://agent.binance.com/mcp/agentic`), specifically regarding WebSocket streaming latency vs REST API limits, and supported order types for USDⓈ-M Futures.

## 5. Goal

Build an AI-native trading intelligence and orchestration layer that uses deterministic market structure and risk engines, allowing Hermes to visually plan and execute trades seamlessly, backed by Binance Agent OS infrastructure.

## 6. Scope

- **Market Intelligence**: Deterministic swing detection, trend analysis, indicators.
- **Chart Intelligence**: Tools for Hermes to read chart state and visible ranges.
- **AI Drawing Engine**: Semantic creation of trendlines, zones, and annotations stored in DB and rendered over `lightweight-charts`.
- **Trading Plan Engine**: Structured plan creation, validation, and persistence.
- **Risk Engine Validation**: Enforcing limits (drawdown, R:R, position size) strictly independent of the LLM.
- **Binance Agent OS Adapter**: Routing execution through Binance's official agent infrastructure.

## 7. Out of Scope

- A full TradingView clone.
- Social trading, copy trading, or community feeds.
- Complex Option/P2P/Convert integrations in Phase 1 (Spot & Futures only).
- Non-Binance exchange integrations for the MVP.
- LLM-driven deterministic math (the LLM will not calculate RSI).

## 8. System Architecture

```text
                    HERMES
                      |
                      v
             AI ORCHESTRATION
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       MARKET       CHART       TRADING
     INTELLIGENCE  INTELLIGENCE    PLAN
          |           |           |
          +-----------+-----------+
                      |
                      v
                 RISK ENGINE (Pure Python)
                      |
                      v
             EXECUTION GATEWAY
                      |
                      v
            BINANCE AGENT OS ADAPTER
                      |
                      v
                   BINANCE
```

## 9. Domain Model

We maintain strict separation of concerns:
- **Trading Product**: Asset definitions and multipliers.
- **Order Type**: Exchange-specific execution mechanics (Limit, Market).
- **Position / Risk Management**: Portfolio state, margin, exposure.
- **Trading Plan**: The AI's intent (Setup, Entry, SL, TP, Confidence).
- **Semantic Drawing**: X/Y translated as Time/Price (`ChartDrawingModel`).

## 10. AI Tool Architecture

Hermes will interact with deterministic Python tools exposed via an API (e.g., `packages/hermes_tools`).
Example signatures:
- `chart.get_state(symbol, timeframe)`
- `chart.draw_zone(type, start_time, end_time, top_price, bottom_price)`
- `quant.find_swings(symbol, timeframe)`
- `trading_plan.propose(intent_schema)`

## 11. Chart / Drawing Architecture

**AI** -> `chart.draw_line()` -> **Backend DB** (`ChartDrawingModel`) -> **WebSocket Sync** -> **React Frontend**.
The React frontend uses `lightweight-charts` time/price coordinate APIs to render SVG overlays deterministically, completely decoupling the AI from browser pixels.

## 12. Market Intelligence Architecture

Located in `packages/quant` and `services/intelligence`. Powered by deterministic libraries (e.g., `pandas-ta`). The AI calls a tool, the tool fetches the latest CCXT OHLCV data from the DB, calculates the indicators/structure, and returns structured JSON to the AI.

## 13. Trading Plan Architecture

A pipeline spanning intent to execution. 
`Hermes (Intent)` -> `Trading Plan Engine (Validation)` -> `Risk Engine (Sizing)` -> `Execution Gateway`.

## 14. Risk Architecture

Implemented in `packages/risk/core.py`. Pure functional evaluation taking `RiskState`, `RiskConfig`, and `TradeIntent`. Fails closed. Cannot be bypassed by the AI.

## 15. Execution Architecture

An abstract `ExecutionAdapter` interface. Currently implemented as `LiveExecutionAdapter` (CCXT). Will be extended to support `BinanceAgentOSAdapter`.

## 16. Binance Adapter Architecture

Wraps the Binance Agent OS / MCP provided by `agent.binance.com`. If MCP lacks high-frequency data streams, we fall back to our existing CCXT WebSocket implementation (`packages/exchange/binance.py`) for data, but use Agent OS for execution and wallet management.

## 17. Project Phases

- **PHASE 0**: Architecture & Contracts (Agent OS Verification).
- **PHASE 1**: Chart State & AI Drawing Domain.
- **PHASE 2**: Deterministic Indicator & Structure Engine.
- **PHASE 3**: Trading Plan Domain & Tool Integration.
- **PHASE 4**: Binance Agent OS Execution Adapter.
- **PHASE 5**: Integration, Safety Testing, & UI Overlay.

## 18. Dependency Map

`Binance Agent OS Capabilities` -> `Execution Adapter`
`Domain Models` -> `Database` -> `Quant Engine`
`Quant Engine` -> `Hermes Tools API` -> `Hermes AI`
`Hermes Tools API` -> `Frontend Chart Overlays`

## 19. MVP Definition

**The Chart Control MVP**:
Hermes successfully receives a prompt to analyze a chart, fetches deterministic market structure via tools, decides on a support/resistance level, and calls `chart.draw_zone()`. The frontend successfully renders this zone on the TradingView chart without execution.

## 20. Acceptance Criteria

- AI tools strictly enforce semantic time/price coordinates.
- Risk engine strictly overrides or rejects oversized AI plans.
- Binance Agent OS is utilized for account/execution (subject to Phase 0 verification).
- Market structure (swing points) matches deterministic math, not AI hallucination.

## 21. Risks and Unknowns

- **UNKNOWN — NEEDS REPOSITORY VERIFICATION**: Does the Binance Agent OS MCP support WebSocket streaming, or is it REST only? If REST only, we must retain our CCXT WebSocket streams for market data.
- **UNKNOWN — NEEDS REPOSITORY VERIFICATION**: Does the Binance Agent OS support all required order types (e.g., Post-Only, Stop-Limit) natively, or do we need to emulate them?
- **UNKNOWN — NEEDS REPOSITORY VERIFICATION**: The exact geographical/account restrictions of the Agentic Wallet sub-accounts.

## 22. Recommended Next Step

Before writing any execution or chart overlay code, we must execute **PHASE 0**.
I recommend running an exploratory test script against the `https://agent.binance.com/mcp/agentic` endpoint to document its exact schema, supported scopes, and latency profile. Once we know the shape of the Agent OS, we can implement the domain models.
