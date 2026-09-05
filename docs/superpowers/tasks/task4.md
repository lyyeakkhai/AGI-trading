TASK 04 — MARKETS + PROFESSIONAL TRADING CHART

You are implementing Task 04 of the AGI Trading frontend.

COMPLETED:
- Task 01 — App Shell
- Task 02 — Design System & Shared Components
- Task 03 — Overview / AI Trading Command Center

Implement ONLY the Markets experience in this task.

==================================================
OBJECTIVE
==================================================

Build the primary market-analysis workspace for AGI Trading.

This page should feel like a serious professional trading terminal, not a generic dashboard.

The user should be able to quickly understand:

- Which market they are viewing
- Current price
- Price movement
- Market trend/context
- Candlestick structure
- Volume
- Timeframe
- Technical information
- AI-relevant market events
- Existing position context

Initial supported markets:

BTC/USDT
ETH/USDT

Use mock data for now.

DO NOT connect Binance or real market WebSockets in this task.

==================================================
CORE VISUAL CONCEPT
==================================================

The Markets page should be dominated by the financial chart.

Recommended structure:

┌────────────────────────────────────────────────────────────┐
│ Market Header                                              │
│ BTC/USDT   $112,482.32   +2.41%    24h High / Low / Volume│
├───────────────┬────────────────────────────────────────────┤
│               │                                            │
│   WATCHLIST   │              CANDLESTICK CHART             │
│               │                                            │
│ BTC/USDT      │                                            │
│ ETH/USDT      │                                            │
│               │                                            │
│               ├────────────────────────────────────────────┤
│               │              MARKET DETAILS               │
│               │                                            │
└───────────────┴────────────────────────────────────────────┘

The exact layout can be adapted to the existing App Shell.

The chart must remain the visual focal point.

==================================================
1. MARKET PAGE HEADER
==================================================

Create a professional market header.

Example:

BTC/USDT
$112,482.32
+2.41%

Supporting information:

24H HIGH
24H LOW
24H VOLUME

Optional:

Market regime
Trend
Volatility

Do not overload the header.

Price should use JetBrains Mono.

Positive/negative movement uses financial semantic colors.

==================================================
2. WATCHLIST
==================================================

Create a compact market watchlist.

Initial symbols:

BTC/USDT
ETH/USDT

Each row should show:

- Symbol
- Current price
- 24h change
- Market state

Example:

BTC/USDT
$112,482
+2.41%

ETH/USDT
$4,321
+1.18%

The selected market must have a clear active state.

Use cyan for selection/active intelligence.

Do not use cyan to indicate profit.

The watchlist should be reusable for future assets.

==================================================
3. TRADINGVIEW LIGHTWEIGHT CHARTS
==================================================

Use:

TradingView Lightweight Charts

This is the preferred chart library for AGI Trading.

Do not build a custom candlestick chart.

Install the dependency only if it is not already present.

Create a reusable chart component.

Suggested conceptual component:

MarketChart

Responsibilities:

- Candlestick rendering
- Time scale
- Price scale
- Volume
- Crosshair
- Responsive resizing
- Series management
- Markers

Keep chart implementation modular so future real-time data can replace mock data.

==================================================
4. CANDLESTICK DATA
==================================================

Use realistic mock OHLCV data.

Structure:

timestamp
open
high
low
close
volume

Generate enough historical candles to make the chart feel realistic.

Do not randomly change data on every render.

Keep mock data deterministic.

Support at least:

1m
5m
15m
1h
4h
1D

The initial default should be:

1H

==================================================
5. CHART TOOLBAR
==================================================

Create a compact professional chart toolbar.

Include:

Timeframes:

1m
5m
15m
1h
4h
1D

Chart controls may include:

- Candles
- Volume
- Crosshair
- Fit content

Only implement controls that are actually useful.

Do not create fake controls with no functionality.

==================================================
6. CHART STYLE
==================================================

The chart must follow the AGI Trading Design System.

Background:

#050709 / #080C10

Grid:

extremely subtle

Borders:

#1B2A32

AI accent:

#00E5FF

Positive candle:

financial positive color

Negative candle:

financial negative color

Do not make the entire chart neon.

The chart should feel like a professional terminal.

The chart should have strong readability even with a dark background.

==================================================
7. VOLUME
==================================================

Include a volume visualization beneath the price chart.

Volume should remain visually secondary.

Do not allow volume to dominate the chart.

The chart structure should communicate:

PRICE
↓
VOLUME

==================================================
8. CROSSHAIR
==================================================

Implement the Lightweight Charts crosshair.

When hovering over the chart, show useful contextual information.

At minimum:

- time
- open
- high
- low
- close
- volume

Use compact typography.

Do not create a giant tooltip.

==================================================
9. MARKET STATISTICS
==================================================

Create a compact statistics area around/below the chart.

Possible values:

24H High
24H Low
24H Volume
Volatility
Market Regime
Trend

Use mock values.

Do not create unsupported advanced indicators.

==================================================
10. MARKET REGIME
==================================================

Show the current market regime.

Example:

TREND
BULLISH

or:

RANGE
NEUTRAL

or:

HIGH VOLATILITY

This is contextual information, not a trading recommendation.

Use a reusable status component from Task 02.

==================================================
11. AI MARKET MARKERS
==================================================

Introduce a subtle AI intelligence layer on the chart.

Use mock markers for things such as:

- Opportunity detected
- Technical event
- Breakout
- Support
- Resistance

Example:

◆ AI OPPORTUNITY

The marker should use the cyan intelligence language.

IMPORTANT:

AI markers must not visually imply guaranteed predictions.

They represent system observations/events.

Keep markers subtle.

Do not clutter the chart.

==================================================
12. POSITION CONTEXT
==================================================

If mock position data exists for the selected symbol, show its context.

Example:

ENTRY
$110,240

STOP
$108,900

TARGET
$114,800

Use chart markers/lines where appropriate.

This is contextual visualization only.

Do not implement order placement.

Do not implement execution.

==================================================
13. RIGHT-SIDE INFORMATION
==================================================

If the available screen width supports it, create a compact market information panel.

Possible content:

Market State
Trend
Volatility
Volume
AI Signal Context
Current Position

Do not create a second giant dashboard.

The chart remains the primary surface.

==================================================
14. HERMES INTEGRATION
==================================================

Do not build the Hermes page.

Do not build the Hermes agent.

Only expose a small contextual intelligence area.

Example:

HERMES
● ANALYZING

BTC momentum remains elevated
relative to the current monitoring window.

Confidence
82%

This should link/navigate to the Hermes page later.

Do not implement AI reasoning.

Use mock data.

==================================================
15. DATA ARCHITECTURE
==================================================

Separate mock market data from presentation.

Suggested:

marketData
├── BTCUSDT
└── ETHUSDT

Each market should contain:

symbol
price
change24h
high24h
low24h
volume24h
regime
trend
candles
aiEvents

Do not scatter mock values throughout components.

The future API should be able to replace the mock provider without redesigning the page.

==================================================
16. STATE MANAGEMENT
==================================================

Implement basic local UI state for:

- selected symbol
- selected timeframe
- chart visibility/options where implemented

Do not introduce complex global state unless the existing architecture already requires it.

==================================================
17. INTERACTIONS
==================================================

Implement:

- Select BTC/USDT
- Select ETH/USDT
- Change timeframe
- Hover chart
- Resize chart
- Navigate to Hermes
- Navigate to Opportunities
- Navigate to Positions if relevant

Do not implement:

- Buy
- Sell
- Order placement
- Live execution
- Binance API

==================================================
18. RESPONSIVE
==================================================

Desktop is the primary experience.

At narrower widths:

- Watchlist can become horizontal or collapsible
- Chart remains usable
- Market information can stack
- Controls should not overflow
- Tables/details should remain readable

The chart must resize correctly.

Use ResizeObserver or the appropriate mechanism for the chart container.

==================================================
19. PERFORMANCE
==================================================

The chart should render efficiently.

Avoid unnecessary re-renders.

Do not recreate all chart series on every state update.

Clean up chart instances when components unmount.

Avoid memory leaks.

==================================================
20. DESIGN SYSTEM
==================================================

Reuse Task 02 components.

Do not create duplicate:

- buttons
- badges
- metrics
- status indicators
- surfaces
- typography tokens

Use existing design tokens.

If a genuinely reusable chart-specific primitive is needed, create it in the appropriate shared location.

==================================================
21. VISUAL HIERARCHY
==================================================

Priority:

1. Current market + price
2. Candlestick chart
3. Volume
4. Market context
5. Watchlist
6. AI observations
7. Secondary statistics

The chart should visually dominate.

==================================================
22. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- Binance connection
- CCXT
- CCXT Pro
- WebSockets
- Redis Streams
- TimescaleDB
- real market data
- order execution
- trade placement
- real AI
- real Hermes
- risk engine
- strategy engine
- backtesting

Those belong to other implementation slices/tasks.

==================================================
23. ENGINEERING RULES
==================================================

Before coding:

1. Inspect the existing repository.
2. Inspect Task 01.
3. Inspect Task 02.
4. Inspect Task 03.
5. Reuse existing components.
6. Reuse existing tokens.
7. Follow existing routing conventions.
8. Follow existing TypeScript conventions.
9. Do not rewrite unrelated code.

If Lightweight Charts is already installed, reuse it.

If not, install the appropriate package.

Do not introduce another financial chart library.

==================================================
24. QUALITY BAR
==================================================

The final page should feel like:

A professional crypto quantitative trading terminal with an AI intelligence layer.

It should NOT feel like:

- a generic analytics dashboard
- a Binance clone
- a flashy crypto website
- a chart demo
- a gaming interface

The chart should be the hero.

The UI should feel calm even when the market is volatile.

==================================================
25. VERIFICATION
==================================================

After implementation:

1. Run the application.
2. Verify /markets works.
3. Verify App Shell remains functional.
4. Verify BTC selection.
5. Verify ETH selection.
6. Verify timeframe switching.
7. Verify candlesticks render correctly.
8. Verify volume renders correctly.
9. Verify crosshair.
10. Verify chart resizing.
11. Verify AI markers.
12. Verify mock position context.
13. Verify Hermes contextual panel.
14. Verify responsive behavior.
15. Verify no horizontal overflow.
16. Verify no console errors.
17. Verify no build errors.
18. Verify Task 01–03 functionality was not broken.

Perform a final visual comparison against:

- Master Prompt
- DESIGN.md
- provided reference image

Fix obvious spacing, hierarchy, typography, chart sizing, and alignment problems.

==================================================
FINAL REPORT
==================================================

Report:

- files created/changed
- components created
- components reused
- dependencies added
- mock data structures
- routes affected
- chart implementation details
- verification performed
- remaining issues

STOP after Task 04.

Do not continue to Task 05 automatically.