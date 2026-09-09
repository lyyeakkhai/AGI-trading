
# AGI Trading — V1 Trading System Master Plan

## 1. Master Goal

Build a unified **Trading System** for AGI Trading that can be operated by both:

1. **Human users through the Trading UI**
2. **AI agents through structured Trading Tools**

Both human and AI must use the **same underlying Trading Domain, Risk Engine, and Execution Engine**.

The goal of V1 is to make AGI Trading capable of analyzing a real market, creating a complete trade plan, visualizing that plan on the chart, validating risk, previewing the resulting orders, and safely executing the trade through Binance.

The system must not be designed as an AI-only trading interface.

Trading is a core platform capability.

```text
                    AGI TRADING
                         │
             ┌───────────┴───────────┐
             │                       │
          HUMAN                    AI
        Trading UI            Trading Tools
             │                       │
             └───────────┬───────────┘
                         ↓
                  TRADING DOMAIN
                         ↓
                    RISK ENGINE
                         ↓
                 EXECUTION ENGINE
                         ↓
                      BINANCE
```

---

# 2. Current Project State

Before planning implementation, inspect the existing repository and determine exactly what already exists.

Current known capabilities:

* Binance integration already exists.
* Real Binance market data is already available.
* TradingView is already integrated/displayed for chart visualization.
* AGI Trading already has an existing application/dashboard.
* Hermes is the autonomous AI trading agent.
* The current application has a large left-side navigation.
* We have decided to move toward a **top navigation architecture** similar in concept to Binance/OKX.
* Trading must become a first-class workspace.
* Human trading and AI trading must share the same underlying trading infrastructure.

**Do not assume any implementation exists beyond what is confirmed by inspecting the repository.**

---

# 3. V1 Scope

V1 focuses on the core trading system.

### Trading products

Implement:

```text
1. Spot
2. USDⓈ-M Futures
```

Do NOT make these part of V1 implementation:

```text
Margin
COIN-M Futures
Options
DEX
Convert
Other advanced exchange products
```

They should be considered future extensions and the architecture should avoid preventing them later.

---

# 4. V1 Trading Workspace

Create a dedicated **Trading** workspace.

The application should move away from the large permanent sidebar and use a **top navigation**.

Recommended primary navigation:

```text
AGI TRADING

Overview
Markets
Trade
Intelligence
Portfolio
System
```

The top navigation should remain compact.

### Trade dropdown

```text
Trade
├── Trading
├── Spot
├── Futures
├── Orders
└── Positions
```

The exact navigation structure must be determined after inspecting the existing application architecture.

Do not blindly replace existing navigation before understanding the current routing and components.

---

# 5. Trading Page Goal

The Trading page should function as the central workspace for both humans and AI.

Conceptually:

```text
┌─────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION                                               │
├─────────────────────────────────────────────────────────────┤
│ Market Header                                                │
├──────────────────────────────────────┬──────────────────────┤
│                                      │                      │
│                                      │                      │
│             CHART                    │     TRADE PANEL      │
│                                      │                      │
│       TradingView                    │  Spot / Futures      │
│                                      │  Order Type          │
│                                      │  Quantity            │
│                                      │  Price               │
│                                      │  Stop Loss           │
│                                      │  Take Profit         │
│                                      │  Leverage             │
│                                      │                      │
├──────────────────────────────────────┴──────────────────────┤
│ Positions                                                   │
├─────────────────────────────────────────────────────────────┤
│ Open Orders                                                 │
├─────────────────────────────────────────────────────────────┤
│ Trade History                                               │
└─────────────────────────────────────────────────────────────┘
```

The actual UI should follow the existing AGI Trading design system.

---

# 6. Trading Domain

Do not model trading as simply:

```text
BUY
SELL
```

The system needs a proper trading domain.

At minimum investigate and design:

```text
TradingPlan
Order
Position
Risk
Execution
```

Potential relationships:

```text
TradingPlan
    │
    ├── Entry
    ├── Stop Loss
    ├── Take Profit(s)
    ├── Position Size
    ├── Risk
    └── Strategy / Thesis
            │
            ↓
        Risk Engine
            │
            ↓
        Order(s)
            │
            ↓
        Execution
            │
            ↓
        Binance
            │
            ↓
        Position
```

---

# 7. TradingPlan

A TradingPlan represents **what the trader intends to do**, not necessarily the exact exchange API request.

The model should support concepts such as:

```text
symbol
market/product
direction
entry
stop loss
take profit
position size
risk
strategy
thesis
invalidation
confidence
```

Example conceptual plan:

```json
{
  "symbol": "BTCUSDT",
  "product": "FUTURES",
  "direction": "LONG",

  "entry": {
    "type": "LIMIT",
    "price": 108500
  },

  "stopLoss": {
    "price": 106800
  },

  "takeProfits": [
    {
      "price": 111000,
      "quantityPercent": 50
    },
    {
      "price": 114000,
      "quantityPercent": 50
    }
  ],

  "risk": {
    "riskPercent": 0.5
  }
}
```

This is an **illustrative domain model**, not a final implementation contract.

The agent must inspect the repository and Binance integration before defining the final schema.

---

# 8. Orders

Orders represent exchange-executable instructions.

V1 should investigate and support the appropriate order types required for:

### Spot

At minimum investigate:

```text
Market
Limit
Protective stop-related orders
Take-profit-related orders
```

### USDⓈ-M Futures

At minimum investigate:

```text
Market
Limit
Stop
Take Profit
Trailing Stop
Reduce Only
```

The implementation must be based on the **actual Binance API capabilities and the existing integration**, not assumptions.

Create an exchange adapter so the Trading Domain does not become tightly coupled to Binance-specific terminology.

---

# 9. Positions

V1 must represent the actual trading position.

Position information should include the fields actually available from the exchange and relevant to the UI/AI.

Investigate:

```text
symbol
side
quantity
entry price
mark/current price
unrealized PnL
realized PnL
leverage
margin
liquidation information
stop loss
take profit
status
```

For Spot, position semantics differ from Futures.

Do not force Futures concepts onto Spot.

---

# 10. Risk Engine

**No AI agent should be able to bypass the risk engine.**

Both:

```text
Human
AI
```

must pass through the same risk validation.

The risk engine should eventually validate:

```text
Account balance
Available balance
Position size
Maximum position size
Risk percentage
Exposure
Leverage
Margin
Existing positions
Existing orders
Stop-loss availability
Maximum portfolio exposure
Trading permissions
Paper/live mode
```

V1 should establish the foundation for these controls.

---

# 11. Execution Engine

The Execution Engine is responsible for converting an approved TradingPlan into exchange orders.

Architecture:

```text
TradingPlan
     ↓
Risk Validation
     ↓
Execution Preview
     ↓
Approval
     ↓
Order Creation
     ↓
Binance Adapter
     ↓
Binance API
     ↓
Order Status
     ↓
Position
```

The frontend must **not directly execute Binance orders**.

The AI must also **not directly bypass the execution layer**.

---

# 12. Human Trading

A human should be able to manually create a trade.

Example:

```text
Human selects BTCUSDT
        ↓
Selects Futures
        ↓
Selects Long
        ↓
Chooses Limit
        ↓
Sets Entry
        ↓
Sets Stop Loss
        ↓
Sets Take Profit
        ↓
Sets position size
        ↓
System calculates risk
        ↓
Risk validation
        ↓
Preview
        ↓
Human confirms
        ↓
Execution
```

The resulting TradingPlan should be the same type of object that Hermes can create.

---

# 13. AI Trading

Hermes should interact with the same Trading Domain through tools.

The AI should eventually have tools conceptually similar to:

```text
market.get_data()
market.get_candles()

chart.create_drawing()
chart.update_drawing()
chart.remove_drawing()

trade.create_plan()
trade.get_plan()
trade.update_plan()

risk.validate_plan()
risk.calculate_position_size()

trade.preview_execution()

execution.execute_plan()

orders.get_open()
orders.cancel()

positions.get_open()
positions.close()
```

These are **conceptual tool names only**.

The coding agent must inspect the existing tool architecture and propose the final names and contracts.

---

# 14. Chart Integration

TradingView currently provides the chart display.

Do not rebuild the entire charting engine unless repository investigation proves it is necessary.

The goal is to make the chart useful to the AI and human trader.

The Trading system should eventually support chart annotations such as:

```text
Entry
Stop Loss
Take Profit
Support
Resistance
Trend lines
Price levels
Zones
Trade setup
```

The AI should be able to create/update/remove supported drawings through a controlled chart tool layer.

The chart should visually represent a TradingPlan.

Example:

```text
TP2 ─────────────────────────

TP1 ─────────────────────────


ENTRY ────────────────────────


SL ───────────────────────────
```

---

# 15. Paper Trading First

The system must support a clear separation between:

```text
PAPER
LIVE
```

The existing UI already shows this concept.

V1 should make Paper Trading the default development/testing environment.

The architecture must prevent accidental live execution during development.

---

# 16. Navigation Redesign

Current problem:

The existing left navigation consumes too much permanent screen width.

Target:

```text
Top Navigation
```

Recommended structure:

```text
AGI TRADING

Overview
Markets
Trade
Intelligence
Portfolio
System
```

Possible dropdown structure:

```text
Trade
├── Spot
├── Futures
├── Orders
└── Positions

Intelligence
├── Hermes
├── Opportunities
├── Strategies
├── Research
└── Backtests

Portfolio
├── Overview
├── Positions
├── Risk
├── Analytics
└── History

System
├── Execution
├── Activity
├── Live Controls
└── Settings
```

Again, inspect the current code before modifying the navigation.

---

# 17. Architecture Principle

The most important architectural principle:

> **Human and AI must not have separate trading systems.**

Correct:

```text
                HUMAN
                   │
                UI/API
                   │
                   ↓
              TRADING DOMAIN
                   ↑
                   │
             AI TOOLS
                   │
                 HERMES

              TRADING DOMAIN
                   ↓
               RISK ENGINE
                   ↓
            EXECUTION ENGINE
                   ↓
             EXCHANGE ADAPTER
                   ↓
                BINANCE
```

This allows the same trading infrastructure to be reused by:

* Human traders
* Hermes
* Future AI agents
* Future exchanges

---

# 18. Exchange Abstraction

Although Binance is the first exchange, do not hard-code Binance concepts throughout the entire application.

Use an exchange adapter boundary.

Conceptually:

```text
Trading Domain
      ↓
Exchange Adapter
      ↓
┌───────────────┐
│ Binance       │
└───────────────┘

Future:

┌───────────────┐
│ OKX           │
└───────────────┘
```

The first implementation should be Binance.

Do not implement OKX in V1 unless repository architecture requires it.

---

# 19. V1 Definition of Done

V1 should be considered complete only when all of the following work:

### Market

* [ ] Real Binance market data available
* [ ] Symbol selection
* [ ] Spot market
* [ ] USDⓈ-M Futures market

### Chart

* [ ] TradingView chart displayed
* [ ] Trading plan can be represented visually
* [ ] Entry visualization
* [ ] Stop-loss visualization
* [ ] Take-profit visualization
* [ ] AI chart tools work

### Trading

* [ ] Human can create Spot trade
* [ ] Human can create Futures trade
* [ ] Human can create Long/Short Futures plan
* [ ] Human can set entry
* [ ] Human can set SL
* [ ] Human can set TP
* [ ] AI can create equivalent TradingPlan
* [ ] AI can modify equivalent TradingPlan

### Risk

* [ ] Position sizing
* [ ] Risk calculation
* [ ] Exposure validation
* [ ] Account balance validation
* [ ] Paper/live protection
* [ ] AI cannot bypass risk validation

### Execution

* [ ] Order preview
* [ ] Order submission
* [ ] Order status tracking
* [ ] Cancellation
* [ ] Position tracking
* [ ] Error handling
* [ ] Binance execution adapter

### UI

* [ ] Top navigation
* [ ] Trading workspace
* [ ] Order panel
* [ ] Positions
* [ ] Open orders
* [ ] Trade history
* [ ] Paper/live indicator

---

# 20. What the AI Coding Agent Must Do First

**Do not immediately write code.**

First perform a repository audit.

### Phase 1 — Understand

Inspect:

```text
Project structure
Frontend architecture
Backend architecture
Database
Existing Binance integration
Existing TradingView integration
Existing AI/Hermes architecture
Existing tools
Authentication
WebSocket infrastructure
Order/position models
Risk logic
Paper trading
Live trading
Navigation/routing
```

### Phase 2 — Map

Create:

```text
Current Architecture Map
Current Trading Flow
Current Binance Integration Map
Current AI Tool Map
Current Navigation Map
Current Data Model Map
```

### Phase 3 — Gap Analysis

Identify:

```text
Already implemented
Partially implemented
Missing
Needs refactor
Potential architectural risks
```

### Phase 4 — Design

Create:

```text
Trading Domain Design
TradingPlan schema
Order schema
Position schema
Risk model
Execution architecture
AI Tool contracts
Chart Tool contracts
Navigation architecture
API contracts
```

### Phase 5 — Implementation Plan

Break the work into small tasks.

Each task must contain:

```text
Task ID
Objective
Files/components affected
Dependencies
Implementation details
Acceptance criteria
Testing requirements
Risk
```

Do not create vague tasks such as:

> "Build trading system."

Instead:

```text
TRADING-001
Create TradingPlan domain model

TRADING-002
Create Spot order adapter

TRADING-003
Create Futures order adapter

TRADING-004
Create risk validation service

TRADING-005
Create execution preview

TRADING-006
Create Trading page

TRADING-007
Create AI trade planning tools

...
```

---

# 21. Agent Rules

The coding agent must follow these rules:

### Rule 1 — Inspect before changing

Never assume an existing feature is missing.

Search the repository first.

### Rule 2 — Do not duplicate systems

If a Binance service already exists, extend/refactor it rather than creating another Binance integration.

### Rule 3 — Human and AI share infrastructure

Do not build an AI-only execution path.

### Rule 4 — Risk is mandatory

No execution path may bypass risk validation.

### Rule 5 — Paper trading first

Development and testing should default to Paper mode.

### Rule 6 — Preserve existing functionality

Do not break existing:

* Binance data
* TradingView chart
* Hermes
* authentication
* existing dashboard
* existing analytics

### Rule 7 — Do not overbuild V1

Do not implement:

```text
Options
Margin
COIN-M
DEX
Multiple exchanges
Advanced automation
```

unless the repository already contains them and they are required for compatibility.

### Rule 8 — No guessing

If something cannot be confirmed from the repository or official API documentation, mark it as:

```text
UNKNOWN
```

and explain what must be verified.

---

# 22. Final Deliverables From the Planning Agent

Before implementation begins, the agent must produce:

```text
docs/
│
├── MASTER_TRADING_V1_PLAN.md
├── TRADING_ARCHITECTURE.md
├── TRADING_DOMAIN.md
├── TRADING_API.md
├── TRADING_AI_TOOLS.md
├── TRADING_CHART_TOOLS.md
├── TRADING_RISK_ENGINE.md
├── TRADING_EXECUTION.md
├── TRADING_NAVIGATION.md
├── TRADING_UI_SPEC.md
├── TRADING_TEST_PLAN.md
└── TRADING_TASKS.md
```

And `TRADING_TASKS.md` should contain the implementation sequence and dependencies.

---

# 23. Ultimate V1 Workflow

The final system should support this complete workflow:

```text
                 REAL MARKET DATA
                        ↓
                   MARKET DATA
                        ↓
                 HERMES ANALYSIS
                        ↓
                 TRADING PLAN
                        ↓
              ┌─────────┴─────────┐
              │                   │
            HUMAN                AI
          modifies             creates
              │                   │
              └─────────┬─────────┘
                        ↓
                  CHART DISPLAY
                        ↓
                  RISK ENGINE
                        ↓
                EXECUTION PREVIEW
                        ↓
                 HUMAN / POLICY
                    APPROVAL
                        ↓
                EXECUTION ENGINE
                        ↓
                 BINANCE API
                        ↓
                     ORDER
                        ↓
                   POSITION
                        ↓
                 MONITORING
                        ↓
                HERMES MANAGEMENT
```

## Master objective

> **Build the foundation for AGI Trading to become a human + autonomous AI trading terminal, where humans and Hermes use the same Trading Engine to plan, visualize, validate, execute, and manage trades safely. V1 focuses on Spot and USDⓈ-M Futures through Binance, with TradingView providing chart visualization and a shared risk/execution architecture underneath both the human UI and AI tools.**

---

### Prompt to give your main AI agent

You can give your coding agent this directly:

> **Read `docs/product/mvp.md` completely. Do not start implementing immediately. First audit the entire repository and compare the current implementation against this plan. Identify what already exists, what is partial, what is missing, and what must be refactored. Then produce a concrete implementation roadmap with dependencies and acceptance criteria. Do not guess about existing architecture. Do not duplicate existing services. Do not implement beyond V1 scope. The first deliverable is the architecture/gap-analysis/task plan, not code. After the plan is reviewed, implementation will proceed task-by-task.**


