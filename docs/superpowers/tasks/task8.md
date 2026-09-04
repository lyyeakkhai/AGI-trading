TASK 08 — POSITIONS & PORTFOLIO

You are implementing Task 08 of an AI Trading Intelligence Platform called AGI Trading.

IMPORTANT:
Tasks 01–07 are already implemented:
- Task 01: App Shell
- Task 02: Design System + Shared Components
- Task 03: Overview
- Task 04: Markets + TradingView Lightweight Charts
- Task 05: Hermes & AI Intelligence
- Task 06: Opportunities
- Task 07: Trade Proposals

Build ONLY Task 08.

Do not redesign or rewrite Tasks 01–07 unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

This is a private, single-user AI trading intelligence platform.

The portfolio workspace answers:

- What positions are currently open?
- What is the current P&L?
- How much capital is exposed?
- What is the position's entry price?
- What is the current price?
- Where is the stop loss?
- Where is the take profit?
- What is the unrealized P&L?
- What is the realized P&L?
- What is the portfolio exposure?
- What risk is currently being taken?
- Which strategy created the position?
- What is Hermes currently monitoring?

The product supports:

DEVELOPMENT
PAPER
LIVE

For this task:

Use PAPER mode mock data.

Do NOT connect to Binance.

Do NOT implement real execution.

Do NOT implement real portfolio synchronization.

==================================================
2. CORE ARCHITECTURE
==================================================

The conceptual flow is:

Market Data
    ↓
Hermes
    ↓
Opportunity
    ↓
Trade Proposal
    ↓
Risk Validation
    ↓
Owner Approval
    ↓
Execution
    ↓
POSITION
    ↓
Portfolio Analytics

Task 08 starts at:

POSITION

The UI should make this transition understandable.

A Trade Proposal is a proposed decision.

A Position is an actual simulated/open portfolio state.

==================================================
3. ROUTE
==================================================

Create:

/positions

The sidebar navigation item:

Positions

should navigate here.

==================================================
4. DESIGN GOAL
==================================================

The Positions page should feel like a professional trading portfolio terminal.

Think:

professional trading workstation
+
AI-aware portfolio monitoring

NOT:

crypto portfolio tracker
NOT:

consumer finance app
NOT:

generic brokerage clone

Reuse:

Obsidian Intelligence

Visual language:

- dark
- precise
- dense
- calm
- technical
- trustworthy

==================================================
5. PAGE HEADER
==================================================

Create:

Positions

Subtitle:

Open positions and portfolio exposure.

Right side:

[ PAPER ]

[ Portfolio Status ]

Example:

Positions
Open positions and portfolio exposure.

PAPER
Portfolio Active

==================================================
6. PORTFOLIO SUMMARY
==================================================

Create compact summary metrics.

Example:

Portfolio Value
$10,842.36

Available Capital
$7,214.80

Invested Capital
$3,627.56

Unrealized P&L
+$184.32

Realized P&L
+$421.77

Total Exposure
33.5%

Today's P&L
+$72.14

Do not make every metric a giant card.

Use a compact professional layout.

==================================================
7. P&L VISUAL SEMANTICS
==================================================

Use:

Green:
positive P&L

Red:
negative P&L

Gray:
neutral

Cyan:
AI/intelligence only

Important:

Do NOT use cyan for positive financial performance.

Reuse existing PnLDisplay.

Support:

+$184.32
+1.70%

and:

-$42.17
-0.39%

==================================================
8. OPEN POSITIONS TABLE
==================================================

Create the primary Positions table.

Columns:

Symbol
Side
Size
Entry
Current
Stop
Target
Unrealized P&L
P&L %
Exposure
Strategy
Opened
Status

Example:

BTC/USDT
LONG
0.035 BTC
67,200
67,842
66,500
69,000
+$22.47
+0.95%
21.8%
Breakout Continuation
2h ago
OPEN

ETH/USDT
LONG
0.42 ETH
3,360
3,421
3,280
3,550
+$25.62
+1.83%
13.2%
Trend Continuation
5h ago
OPEN

Use existing:

PositionSide
PnLDisplay
StatusIndicator
RiskBadge
Badge

==================================================
9. POSITION SELECTION
==================================================

Rows should be selectable.

When selected:

show a detailed Position panel.

Use either:

- right-side drawer
OR
- split view

Prefer a right-side drawer if consistent with Tasks 06–07.

==================================================
10. POSITION DETAIL
==================================================

Selected position:

BTC/USDT

LONG

OPEN

Show:

Entry Price
67,200

Current Price
67,842

Stop Loss
66,500

Take Profit
69,000

Position Size
0.035 BTC

Position Value
$2,374.47

Unrealized P&L
+$22.47

P&L %
+0.95%

Risk
0.50%

R:R
2.57R

Strategy
Breakout Continuation

Opened
Today, 10:31

==================================================
11. PRICE LEVEL VISUALIZATION
==================================================

Create a compact position visualization.

Show:

Take Profit
69,000
↑

Current Price
67,842

Entry
67,200

Stop Loss
66,500
↓

Use:

green = take profit

neutral = entry/current

red = stop

Reuse existing chart/visual infrastructure when appropriate.

If a chart is used:

Use TradingView Lightweight Charts from Task 04.

Do not introduce another chart library.

==================================================
12. POSITION CHART
==================================================

If practical, show a small candlestick chart for the selected position.

Include:

- entry marker
- current price
- stop loss
- take profit

Use deterministic mock OHLCV data.

The chart should help the owner understand where the position sits.

Do NOT create a new chart implementation.

Reuse Task 04 chart infrastructure.

==================================================
13. POSITION RISK
==================================================

Create:

"Position Risk"

Show:

Risk Per Trade
0.50%

Position Exposure
21.8%

Portfolio Exposure
33.5%

Distance to Stop
1.99%

Distance to Target
1.71%

Risk State
NORMAL

Example warning state:

Risk State
ELEVATED

Reason:
"Portfolio exposure is approaching the configured limit."

This is mock data only.

Do NOT implement real risk calculations.

==================================================
14. HERMES POSITION MONITORING
==================================================

Show a compact Hermes panel for the selected position.

Example:

Hermes

Monitoring BTC/USDT

Current assessment:

"Position remains aligned with the original breakout thesis.
Price is above entry and structure remains favorable."

State:

Monitoring

Last review:
12 seconds ago

Important:

This is an operational summary.

Do NOT expose hidden chain-of-thought.

==================================================
15. POSITION THESIS
==================================================

Show why the position exists.

Section:

Original Trade Thesis

Example:

Setup:
Breakout Continuation

Reason:
Price confirmed a breakout above the previous resistance zone
with increasing volume.

Expected behavior:
Continuation toward the 2R target.

Invalidation:
Close below breakout structure.

This connects the position back to the Trade Proposal.

==================================================
16. POSITION LIFECYCLE
==================================================

Show:

Trade Proposal
✓

Risk Validation
✓

Owner Approval
✓

Execution
✓

Position Open
●

Exit
○

Use a reusable lifecycle component if possible.

For PAPER mode, execution is simulated.

Do not imply that this is a real Binance order.

==================================================
17. POSITION STATUS
==================================================

Support:

OPEN
PARTIALLY CLOSED
CLOSING
CLOSED

For the primary view:

Show OPEN positions.

Provide a filter to view:

All
Open
Closed

Closed positions should be mock historical positions.

==================================================
18. CLOSED POSITIONS
==================================================

Add a simple historical positions mode.

Example:

ETH/USDT
LONG
Closed

Entry:
3,120

Exit:
3,280

Realized P&L:
+$67.20

Return:
+5.13%

Duration:
14h 22m

Strategy:
Trend Continuation

Closed:
Yesterday

This is important because the portfolio should eventually support realized performance analytics.

==================================================
19. PORTFOLIO EXPOSURE
==================================================

Create a compact exposure visualization.

Example:

Portfolio Exposure

BTC
21.8%

ETH
13.2%

Available
65.0%

Show:

Total Exposure
35.0%

Available
65.0%

The visualization can be:

- horizontal allocation bars
OR
- compact allocation chart

Prioritize clarity.

==================================================
20. ASSET ALLOCATION
==================================================

Create:

Asset Allocation

BTC
65%

ETH
35%

Use current invested capital.

Do not create excessive charts.

One simple visualization is enough.

==================================================
21. POSITION FILTERS
==================================================

Add filters:

Status:
- All
- Open
- Closed

Asset:
- All
- BTC/USDT
- ETH/USDT

Direction:
- All
- Long
- Short

Strategy:
- All
- Breakout Continuation
- Trend Continuation
- Mean Reversion
- Momentum

Risk:
- All
- Normal
- Elevated
- High

Filtering should update the position list.

==================================================
22. SEARCH
==================================================

Add:

Search positions...

Search by:

- symbol
- strategy
- status

Example:

BTC

shows BTC positions.

==================================================
23. SORTING
==================================================

Support sorting by:

- P&L
- P&L %
- exposure
- opened time
- risk
- asset

Default:

Open positions first.

==================================================
24. PORTFOLIO HEALTH
==================================================

Create a compact:

Portfolio Health

section.

Example:

Portfolio Health
NORMAL

Metrics:

Exposure
35%
NORMAL

Daily P&L
+0.72%
NORMAL

Drawdown
1.4%
NORMAL

Open Positions
2

Risk Utilization
42%

This is a portfolio snapshot.

Do not build the complete Risk page yet.

Task 11 will handle the dedicated Risk workspace.

==================================================
25. HERMES ALERTS
==================================================

Add a small:

Position Alerts

section.

Example:

BTC/USDT
Monitoring

ETH/USDT
Target approaching

BTC/USDT
Volatility elevated

These should be mock operational alerts.

Do not create a notification backend.

==================================================
26. POSITION ACTIONS
==================================================

For PAPER mode, you may include:

View Market
View Strategy
View Proposal
View Hermes

Navigation:

View Market
→ /markets

View Strategy
→ /strategies

View Proposal
→ /trade-proposals

View Hermes
→ /hermes

Do NOT add:

Buy
Sell
Close Position
Execute

unless represented as disabled future controls.

IMPORTANT:

This task is monitoring, not execution.

==================================================
27. MOCK DATA
==================================================

Create centralized deterministic mock data.

Example:

positionMockData

Each position should include:

id
symbol
side
quantity
entryPrice
currentPrice
stopLoss
takeProfit
positionValue
unrealizedPnl
unrealizedPnlPercent
realizedPnl
riskPercent
exposurePercent
riskState
strategy
strategyVersion
openedAt
closedAt
status
thesis
hermesAssessment
alerts

Create at least:

4 open positions

and

5–8 closed historical positions.

Use BTC/USDT and ETH/USDT.

Include both positive and negative P&L.

Include different risk states.

Keep values internally consistent.

Do NOT use random values on every render.

==================================================
28. DATA RELATIONSHIP
==================================================

Where possible, mock IDs should represent the product relationship:

Opportunity
→ Trade Proposal
→ Position

Example:

opportunityId
proposalId
positionId

The UI should be able to display:

Source Proposal:
TP-0042

Source Opportunity:
OPP-018

Do not implement a database.

This is only frontend data modeling.

==================================================
29. POSITION DETAIL NAVIGATION
==================================================

From Position Detail:

Source Opportunity
→ /opportunities

Source Proposal
→ /trade-proposals

Market
→ /markets

Strategy
→ /strategies

Hermes
→ /hermes

Use existing routing architecture.

==================================================
30. EMPTY STATE
==================================================

If there are no open positions:

"No open positions"

"Hermes is currently monitoring the market. No paper positions are active."

Button:

View Opportunities

==================================================
31. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| Header                                       |
------------------------------------------------
| Portfolio Summary                            |
------------------------------------------------
| Portfolio Health | Exposure                  |
------------------------------------------------
| Positions Table                              |
------------------------------------------------
| Selected Position Detail                     |
------------------------------------------------

Tablet:

- reduce table columns
- use compact position cards
- detail becomes drawer

Mobile:

- position cards
- stacked metrics
- full-screen detail
- horizontally scrollable filter row
- no horizontal page overflow

==================================================
32. COMPONENTS
==================================================

Create reusable components where useful:

PositionsTable
PositionRow
PositionCard
PositionDetail
PositionHeader
PositionParameters
PositionPriceLevels
PositionRisk
PositionThesis
PositionLifecycle
PositionAlerts
PortfolioSummary
PortfolioHealth
PortfolioExposure
AssetAllocation
PositionFilters
PositionSearch

Reuse existing components.

Do not over-abstract.

==================================================
33. DESIGN SYSTEM
==================================================

Reuse:

Obsidian Intelligence.

Use existing:

- Card
- Surface
- Metric
- Badge
- Button
- Tabs
- Table
- PositionSide
- PnLDisplay
- RiskBadge
- StatusIndicator
- Hermes components

Typography:

Inter

Financial/data values:

JetBrains Mono where appropriate.

Keep borders subtle.

Keep information density high.

==================================================
34. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Use TypeScript if already used.

Centralize mock data.

Do not introduce a new state-management system unless the existing architecture requires it.

Do not introduce a new chart library.

Do not introduce a new UI framework.

Do not rewrite existing shared components unnecessarily.

==================================================
35. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- Binance API
- Binance WebSocket
- CCXT
- Redis
- TimescaleDB
- real portfolio synchronization
- real account balances
- real execution
- real orders
- position closing
- live trading
- real risk calculations
- real AI
- real Hermes backend
- Task 09 Strategies
- Task 10 Backtests
- Task 11 Risk

Use deterministic mock data only.

==================================================
36. ACCEPTANCE CRITERIA
==================================================

Task 08 is complete when:

1. /positions works.

2. Portfolio summary works.

3. Open positions table works.

4. Closed positions/history works.

5. Position selection works.

6. Position detail works.

7. Entry/current/stop/target are visible.

8. P&L is visible.

9. Exposure is visible.

10. Position risk information is visible.

11. Portfolio health is visible.

12. Portfolio exposure visualization works.

13. Asset allocation works.

14. Hermes position monitoring is visible.

15. Original trade thesis is visible.

16. Position lifecycle is visible.

17. Filters work.

18. Search works.

19. Sorting works.

20. Navigation to Market works.

21. Navigation to Proposal works.

22. Navigation to Opportunity works.

23. Navigation to Hermes works.

24. Mock data is centralized.

25. Values are deterministic.

26. Responsive design works.

27. No horizontal overflow.

28. No real execution actions exist.

29. No Binance/API integration exists.

30. No secrets are exposed.

31. Existing Tasks 01–07 remain functional.

32. No TypeScript/lint/build errors.

==================================================
37. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /positions.
- Test open positions.
- Test closed positions.
- Select different positions.
- Test filters.
- Test search.
- Test sorting.
- Verify P&L formatting.
- Verify exposure formatting.
- Verify entry/stop/target visualization.
- Verify Hermes monitoring.
- Verify source proposal navigation.
- Verify market navigation.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify no execution controls can place trades.
- Verify no real portfolio/API integration exists.
- Verify Tasks 01–07 still work.

STOP after completing Task 08.

Do NOT implement Task 09.