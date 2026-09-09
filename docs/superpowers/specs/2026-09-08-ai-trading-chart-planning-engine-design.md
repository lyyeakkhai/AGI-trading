# AI Trading Chart & Planning Engine

## 1. Goal

### Primary Goal
Build an **AI-native trading analysis and chart-planning system** that allows the autonomous trading agent to programmatically analyze real-time and historical market data, create structured technical-analysis objects, visualize its analysis on the existing trading chart, and produce a structured trading plan that can later be passed to the risk and execution systems.

The system should allow the AI agent to perform the same **planning and visual analysis workflow that a human trader performs on a trading chart**, but through deterministic, machine-readable tools rather than manual mouse interaction.

### The intended workflow
```text
Real Market Data
      ↓
Market Analysis
      ↓
AI Reasoning
      ↓
Structured Analysis
      ↓
Chart Drawings / Annotations
      ↓
Trading Plan
      ↓
Risk Validation
      ↓
Execution System
```

The system's purpose is therefore **not simply to display charts**.

Its purpose is to provide the autonomous trading agent with a reliable interface for:
1. **Understanding the market**
2. **Structuring its analysis**
3. **Visualizing its reasoning**
4. **Constructing a trading plan**
5. **Passing that plan to downstream risk/execution systems**

---

## 2. Current System
The project already has:
```text
✓ Binance integration
✓ Real market data
✓ Historical market data
✓ Backend market-data infrastructure
✓ Trading chart
✓ TradingView-based chart visualization
```

Therefore, this project **does not start by rebuilding the market-data infrastructure or the basic chart renderer**.

The new system will be built **on top of the existing infrastructure**.

---

## 3. What We Are Building
We are building the layer between:
```text
Market Data
     ↓
                 ← NEW SYSTEM →
     ↓
Trading Chart + AI Agent
```

The new system consists of five major capabilities:

### A. Chart Intelligence
Allow the agent to obtain structured information about the current chart and market.
* Chart State
* Candles
* Timeframe
* Symbol
* Price
* Visible Range

### B. Drawing & Annotation
Allow the agent to create structured visual objects on the chart.
Examples:
* Support / Resistance
* Trend lines
* Price zones
* Swing points
* Breaks of structure
* Entry / Stop loss / Take profit
* Annotations

### C. Technical Analysis
Provide deterministic tools for:
* Indicators
* Swing detection
* Market structure
* Support/resistance
* Trend
* Liquidity
* Other quantitative analysis

### D. Trading Plan
Allow the agent to convert its analysis into a structured plan:
* Direction
* Entry
* Stop Loss
* Take Profit
* Invalidation
* Risk
* Reward
* Risk/Reward ratio
* Evidence

### E. AI Tool Interface
Expose all of the above as tools that Hermes can call.
For example:
```python
chart.get_state()
chart.draw_zone()
chart.draw_line()
indicator.get()
structure.find_swings()
structure.find_levels()
trading_plan.create()
chart.draw_trading_plan()
```

---

## 4. Scope

### IN SCOPE

#### 4.1 Chart State
The system will provide the AI with structured chart information:
* Symbol
* Timeframe
* Current price
* Historical candles
* Visible time range
* Price range
* Chart session state

> **Implementation Deep Dive**: Currently, `MarketChart.tsx` tracks chart state but it isn't seamlessly exposed backward to the Hermes agent context. We will expose a `chart.get_state()` endpoint in `hermes_tools` (FastAPI backend) that queries the active session state or reads from the same DB context the frontend subscribes to. 

#### 4.2 Drawing Engine
The system will support structured drawing objects.
Initial drawing primitives:
* Horizontal line
* Vertical line
* Trend line
* Ray
* Rectangle
* Price zone
* Marker
* Text annotation

Later versions may add Fibonacci, Channels, Measured moves, Advanced geometric tools, and other technical-analysis drawings.

> **Implementation Deep Dive**: `MarketChart.tsx` uses `lightweight-charts`, which natively supports markers (`setMarkers`) and horizontal price lines (`createPriceLine`). Advanced drawings like trend lines and rectangles require a plugin system (like `lightweight-charts` primitives) or a canvas overlay synchronized with the chart's time/price coordinate system (`timeScale().timeToCoordinate()` and `priceScale().priceToCoordinate()`).

#### 4.3 AI-Controlled Drawing
The AI must be able to Create, Read, Update, Delete, and Clear chart drawings through tools.
The AI should operate using **market coordinates** (`time + price`) not browser coordinates (`x + y pixels`).

> **Implementation Deep Dive**: Drawing state will live in the database (e.g. `ChartDrawingModel`) mapped to a session/user and broadcast to the frontend via WebSockets or polling. The Hermes agent will interact with drawings via tools like `chart_draw_zone(min_price, max_price, start_time, end_time)` which inserts records into the DB. The frontend consumes this state to render the overlay.

#### 4.4 Indicator Engine
The system will provide deterministic indicator calculations.
Initial indicators: SMA, EMA, RSI, MACD, ATR, VWAP, Bollinger Bands, Volume analysis.
The LLM should **not independently calculate financial values** when a deterministic engine can calculate them.

> **Implementation Deep Dive**: We have `get_analytics_indicators` in `client.py` and an `analytics` service. We will use a fast math library (like `pandas-ta`, `ta-lib`, or custom numpy) in the Python backend. The AI will call `indicator_get("MACD", {"fast": 12, "slow": 26, "signal": 9})`, which executes deterministically and returns the values or signals.

#### 4.5 Market Structure
The system will eventually detect:
* Swing highs/lows
* Higher highs/lows, Lower highs/lows
* Trend
* Break of Structure / Change of Character
* Support / Resistance
* Equal highs/lows
* Liquidity levels

> **Implementation Deep Dive**: Market structure logic will be codified as deterministic Python algorithms (e.g. fractal swing detection using a 5-bar window) inside `packages/quant` or `packages/analytics`. The agent uses `structure_find_swings()` which runs the algorithm and returns structured points `[{type: "swing_high", time: X, price: Y, confirmed: true}]`.

#### 4.6 Chart Annotation
The system will connect analysis to visualization. The chart becomes a **visual representation of the agent's analysis**.

> **Implementation Deep Dive**: Combined with the Drawing Engine (4.2), text annotations will map to coordinate points with specific anchor points. The agent can supply `rationale` metadata when drawing an object, which the frontend renders in a tooltip or legend when the user hovers over the drawing.

#### 4.7 Trading Plan
The system will support structured trading plans containing:
Symbol, Timeframe, Direction, Setup, Entry, Stop Loss, Take Profit, Invalidation, Risk, Reward, Risk/Reward Ratio, Evidence, Confidence.

> **Implementation Deep Dive**: The current `create_trade_proposal` endpoint accepts an intent. We will formalize a `TradingPlanModel` in `packages/domain/models` containing these specific fields. The plan is passed down to `packages/risk` to calculate position sizing before moving to `packages/execution`.

#### 4.8 Persistence
The system will eventually preserve:
Chart state, Drawings, Indicators, Market-structure analysis, Trading plans, Analysis timestamps, Agent-generated annotations, Analysis version.
This allows previous AI decisions to be reproduced and audited.

> **Implementation Deep Dive**: We will create a new bounded context in the database (e.g. `AnalysisSessionModel`, `AnalysisDrawingModel`) that snapshots the AI's view of the market at the exact timestamp the plan was generated.

---

### OUT OF SCOPE

We are **NOT** building:
* ❌ **A complete TradingView clone**: We do not need to reproduce every TradingView feature.
* ❌ **A new exchange**: Binance remains the initial exchange/data source.
* ❌ **A new market-data provider**: We use the existing market-data infrastructure.
* ❌ **A new chart renderer**: We continue using the existing TradingView-based chart implementation unless a specific limitation requires replacing a component.
* ❌ **Social trading**: No followers, copy trading, public ideas, social feeds, community profiles.
* ❌ **Full automated execution in the first milestone**: The chart/planning system does **not** bypass the existing risk and execution architecture. The planning system produces a plan; the execution system decides whether/how that plan can become an order.

---

## 5. Core Design Principle
> **The AI does not control pixels. The AI controls structured trading objects.**

Bad: `"Draw a line at x=542, y=381"`
Good: `{"type": "support", "price": 77500, "timeframe": "1H"}`

Then the platform converts that structured object into the appropriate chart visualization.
This separation gives us `AI -> Semantic Trading Objects -> Deterministic Backend -> Chart` rather than `AI -> Browser pixels -> Unreliable chart manipulation`.

---

## 6. Success Definition
The project is successful when Hermes can perform this workflow:
> **“Analyze BTCUSDT on the 1H timeframe. Identify the important support and resistance levels, mark the latest swing high and low, explain the current market structure, and create a potential trading plan.”**

The system should then:
1. Retrieve real market data
2. Analyze deterministically
3. Return structured findings
4. Create chart annotations
5. Display them on the existing chart
6. Construct a structured trading plan
7. Validate the plan
8. Persist the analysis

The human should be able to look at the chart and understand:
> **“This is what Hermes saw, this is why it thinks the setup exists, and this is where the proposed trade would be invalidated.”**

---

## 7. Project Boundary

> **Build the AI-controlled analysis, drawing, annotation, and trading-plan layer on top of our existing Binance market-data and TradingView chart infrastructure.**

```text
                    EXISTING
                       │
        ┌──────────────┴──────────────┐
        │                             │
     Binance                    Chart Renderer
     Market Data                TradingView
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
                 ┌───────────┐
                 │   GOAL    │
                 │           │
                 │ AI Chart  │
                 │ Analysis  │
                 │ + Drawing │
                 │ + Plans   │
                 └───────────┘
                       │
                       ▼
                  Hermes Tools
                       │
                       ▼
                 Risk / Execution
```
