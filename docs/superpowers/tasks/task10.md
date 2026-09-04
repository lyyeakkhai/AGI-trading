TASK 10 — BACKTESTING & STRATEGY VALIDATION

You are implementing Task 10 of an AI Trading Intelligence Platform called AGI Trading.

IMPORTANT:
Tasks 01–09 are already implemented:
- Task 01: App Shell
- Task 02: Design System + Shared Components
- Task 03: Overview
- Task 04: Markets + TradingView Lightweight Charts
- Task 05: Hermes & AI Intelligence
- Task 06: Opportunities
- Task 07: Trade Proposals
- Task 08: Positions & Portfolio
- Task 09: Strategies & Strategy Registry

Build ONLY Task 10.

Do not redesign or rewrite Tasks 01–09 unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

The product validates trading strategies through a structured ladder:

Trading Idea
    ↓
Formal Strategy
    ↓
Historical Backtest
    ↓
Out-of-Sample
    ↓
Walk-Forward
    ↓
Paper Trading
    ↓
Tiny Live Capital
    ↓
Performance Evaluation
    ↓
Approved Strategy

Task 10 implements the:

BACKTESTING WORKSPACE

This page allows the owner to inspect historical strategy performance.

IMPORTANT:

This task is primarily FRONTEND.

Use deterministic mock backtest results.

Do NOT implement a production-grade backtesting engine.

Do NOT connect to Binance.

Do NOT connect to live market data.

Do NOT implement real strategy execution.

Do NOT implement real optimization.

The goal is to establish the UX and information architecture for future
real backtesting infrastructure.

==================================================
2. ROUTE
==================================================

Create:

/backtests

If cleanly supported:

/backtests/:id

Otherwise use:

/backtests

with a selectable backtest detail panel.

The existing Strategies page should be able to navigate to:

/backtests

and ideally pass the selected strategy context.

==================================================
3. CORE QUESTION
==================================================

The Backtests workspace must answer:

- What strategy was tested?
- What market was tested?
- What timeframe?
- What historical period?
- What assumptions were used?
- How many trades occurred?
- What was the net return?
- What was the maximum drawdown?
- What was the win rate?
- What was the profit factor?
- What was expectancy?
- What were fees?
- What was estimated slippage?
- How did the equity curve behave?
- How did the strategy perform across regimes?
- Is the result suitable for the next validation stage?

Do NOT present backtesting as proof that a strategy will make money.

==================================================
4. DESIGN GOAL
==================================================

The page should feel like:

Professional quantitative research terminal
+
AI-assisted strategy validation

NOT:

- casino-style trading UI
- flashy profit dashboard
- generic analytics page
- consumer investment app

Use:

Obsidian Intelligence

Visual personality:

- analytical
- technical
- precise
- calm
- information dense
- trustworthy

==================================================
5. PAGE HEADER
==================================================

Create:

Backtests

Subtitle:

Historical strategy validation and performance analysis.

Header controls:

[ Select Strategy ]

[ New Backtest ]

[ PAPER ]

Example:

Backtests
Historical strategy validation and performance analysis.

Strategy:
Breakout Continuation v1.3

==================================================
6. BACKTEST REGISTRY
==================================================

Create a backtest list/table.

Columns:

Backtest
Strategy
Version
Market
Timeframe
Period
Trades
Net Return
Max Drawdown
Profit Factor
Status
Created

Example:

BT-0042
Breakout Continuation
v1.3
BTC/USDT
1H
Jan 2025 – Aug 2026
184
+24.8%
-8.4%
1.84
Completed
Today

BT-0041
Trend Continuation
v2.1
ETH/USDT
4H
Jan 2025 – Aug 2026
121
+17.2%
-7.1%
1.59
Completed
Yesterday

==================================================
7. NEW BACKTEST FLOW
==================================================

Create a "New Backtest" modal.

Fields:

Strategy

Market

Timeframe

Start Date

End Date

Initial Capital

Fee Model

Slippage Model

Example:

Strategy:
Breakout Continuation v1.3

Market:
BTC/USDT

Timeframe:
1H

Period:
2025-01-01 → 2026-08-31

Initial Capital:
$10,000

Fee Model:
0.10%

Slippage:
0.05%

Button:

Run Backtest

IMPORTANT:

Clicking "Run Backtest" should NOT execute a real backtest.

Use a mock flow:

Configuring
↓
Running
↓
Completed

Then display a deterministic mock result.

==================================================
8. BACKTEST CONFIGURATION
==================================================

When viewing a backtest, show the exact assumptions.

Section:

Backtest Configuration

Strategy:
Breakout Continuation v1.3

Market:
BTC/USDT

Timeframe:
1H

Period:
2025-01-01 → 2026-08-31

Initial Capital:
$10,000

Fees:
0.10%

Estimated Slippage:
0.05%

Execution Model:
Simulated

This section is important for reproducibility.

==================================================
9. PERFORMANCE SUMMARY
==================================================

Create compact metrics:

Initial Capital
$10,000

Final Equity
$12,480

Net Return
+24.8%

Realized P&L
+$2,480

Max Drawdown
-8.4%

Win Rate
64.1%

Profit Factor
1.84

Expectancy
+0.42R

Trade Count
184

Average Winner
+1.38R

Average Loser
-0.91R

Average Holding Time
7h 24m

Fees
$184

Estimated Slippage
$92

Use existing financial components.

==================================================
10. EQUITY CURVE
==================================================

Create the primary Backtest visualization:

Equity Curve

Show:

Initial Capital
↓
historical equity progression
↓
final equity

Use deterministic mock data.

If a chart is implemented:

Reuse the existing chart infrastructure.

Do NOT introduce another chart library.

The chart should support:

- hover/crosshair
- date
- equity value
- drawdown context if practical

Keep it professional.

==================================================
11. DRAWDOWN
==================================================

Create a:

Drawdown

visualization.

Show:

Maximum Drawdown
-8.4%

Average Drawdown
-2.7%

Longest Drawdown
34 days

Use a compact area/line visualization.

If implementing a second chart:

reuse existing chart infrastructure.

Do not introduce another chart library.

==================================================
12. TRADE DISTRIBUTION
==================================================

Create:

Trade Statistics

Show:

Winning Trades
118

Losing Trades
66

Win Rate
64.1%

Average Winner
+1.38R

Average Loser
-0.91R

Largest Winner
+3.8R

Largest Loser
-2.1R

Profit Factor
1.84

Expectancy
+0.42R

This should be easy to scan.

==================================================
13. TRADE HISTORY
==================================================

Create a backtest trade table.

Columns:

#
Date
Symbol
Side
Entry
Exit
P&L
R
Duration
Exit Reason

Example:

001
Jan 04
BTC/USDT
LONG
42,180
43,020
+$84
+1.2R
6h
Target

002
Jan 06
BTC/USDT
LONG
43,210
42,780
-$43
-0.6R
3h
Stop

Use deterministic mock trades.

At least 20 mock rows should be available.

Pagination or virtualized display is optional.

==================================================
14. FEES & SLIPPAGE
==================================================

Create:

Execution Assumptions

Show:

Trading Fees
$184

Estimated Slippage
$92

Gross P&L
+$2,756

Net P&L
+$2,480

This is critical.

The platform's objective is performance after fees and slippage.

Make gross vs net performance clearly distinguishable.

==================================================
15. REGIME ANALYSIS
==================================================

Create:

Performance by Market Regime

Example:

Trending
+18.2%
PF 2.10
72 trades

Ranging
+3.8%
PF 1.22
61 trades

High Volatility
-1.7%
PF 0.91
31 trades

Low Volatility
+4.5%
PF 1.44
20 trades

This helps evaluate strategy robustness.

Use compact cards/table.

==================================================
16. TIMEFRAME ANALYSIS
==================================================

Create:

Performance by Timeframe

Example:

15M
+4.2%
PF 1.18

1H
+14.7%
PF 1.92

4H
+5.9%
PF 1.54

1D
Not Tested

Only show relevant mock results.

==================================================
17. ASSET ANALYSIS
==================================================

Create:

Performance by Asset

Example:

BTC/USDT
+18.7%
PF 1.94

ETH/USDT
+6.1%
PF 1.42

This prepares the architecture for multi-asset validation.

==================================================
18. OUT-OF-SAMPLE
==================================================

Create an:

Out-of-Sample Validation

section.

Example:

Training Period

Jan 2025 → Dec 2025

Testing Period

Jan 2026 → Aug 2026

Training Return
+19.4%

OOS Return
+11.2%

OOS Profit Factor
1.63

OOS Max Drawdown
-7.2%

Status:

PASS

IMPORTANT:

This is mock data.

Do not claim statistical significance.

==================================================
19. WALK-FORWARD PREVIEW
==================================================

Create a compact:

Walk-Forward Validation

section.

Show:

Window 01
PASS

Window 02
PASS

Window 03
PASS

Window 04
PASS

Overall:

PASS

This is only a frontend representation.

Do NOT implement the actual walk-forward engine.

==================================================
20. VALIDATION DECISION
==================================================

At the bottom, create:

Validation Assessment

Example:

Historical Backtest
PASS

Out-of-Sample
PASS

Walk-Forward
PASS

Costs Included
PASS

Data Coverage
PASS

Final Assessment:

"Results meet the current mock validation thresholds and may proceed
to paper trading evaluation."

Status:

READY FOR PAPER TRADING

IMPORTANT:

This is a UI/mock assessment.

Do not automatically change the strategy's real status.

==================================================
21. STRATEGY CONNECTION
==================================================

Show:

Strategy

Breakout Continuation v1.3

Current validation stage:

Historical Backtest

Link:

View Strategy

→ /strategies

Also show:

Strategy Version:
v1.3

This ensures backtests are tied to an immutable strategy version.

==================================================
22. HERMES CONNECTION
==================================================

Add a compact Hermes panel.

Example:

Hermes

Backtest Review

"Hermes is reviewing historical performance for
Breakout Continuation v1.3."

Show:

Status:
Reviewing

Assessment:

"Historical performance remains positive after modeled fees and
slippage, but performance varies across market regimes."

Again:

Do NOT expose hidden chain-of-thought.

Only display concise analytical summaries.

==================================================
23. BACKTEST STATUS
==================================================

Support:

Draft
Queued
Running
Completed
Failed
Cancelled

For the UI, create mock examples.

The selected backtest should normally be:

Completed

==================================================
24. BACKTEST FILTERS
==================================================

Add filters:

Strategy
- All
- Breakout Continuation
- Trend Continuation
- Mean Reversion
- Momentum

Market
- All
- BTC/USDT
- ETH/USDT

Timeframe
- All
- 15M
- 1H
- 4H
- 1D

Status
- All
- Draft
- Running
- Completed
- Failed
- Cancelled

==================================================
25. SEARCH
==================================================

Add:

Search backtests...

Search by:

- backtest ID
- strategy
- market
- version

==================================================
26. SORTING
==================================================

Support sorting by:

- net return
- max drawdown
- profit factor
- trade count
- created time

Default:

Most recent completed backtests first.

==================================================
27. COMPARISON
==================================================

Add a lightweight:

Compare Backtests

interaction.

Allow selecting up to 2–3 backtests.

Show:

Strategy
Return
Max Drawdown
Win Rate
Profit Factor
Expectancy
Trade Count

Example:

Breakout v1.3
+24.8%
-8.4%
64%
1.84
+0.42R
184

Trend v2.1
+17.2%
-7.1%
61%
1.59
+0.31R
121

Keep comparison simple.

Do not build a complete research platform.

==================================================
28. MOCK DATA
==================================================

Create centralized deterministic mock data.

Example:

backtestMockData

Each backtest should contain:

id
strategyId
strategyName
strategyVersion
market
timeframe
startDate
endDate
initialCapital
finalEquity
grossPnl
netPnl
netReturn
maxDrawdown
averageDrawdown
longestDrawdown
winRate
profitFactor
expectancy
tradeCount
winningTrades
losingTrades
averageWinner
averageLoser
largestWinner
largestLoser
averageHoldingTime
fees
slippage
equityCurve
drawdownCurve
trades
regimePerformance
timeframePerformance
assetPerformance
oosResults
walkForwardResults
validationAssessment
status
createdAt

Create at least 5 backtests.

Include:

- strong result
- moderate result
- weak result
- failed validation
- running/completed mock state

==================================================
29. DATA RELATIONSHIPS
==================================================

Maintain traceability:

Strategy
→ Backtest
→ Opportunity
→ Trade Proposal
→ Position

Example:

strategyId:
STRAT-001

backtestId:
BT-0042

Do not implement a database.

Use mock IDs.

==================================================
30. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| Header / Strategy / New Backtest             |
------------------------------------------------
| Backtest Registry                            |
------------------------------------------------
| Selected Backtest                            |
------------------------------------------------
| Performance Metrics                          |
------------------------------------------------
| Equity Curve                                 |
------------------------------------------------
| Drawdown | Trade Statistics                  |
------------------------------------------------
| Trade History                                |
------------------------------------------------
| Regime | OOS | Walk-Forward                  |
------------------------------------------------

Tablet:

- reduce table columns
- use cards where appropriate
- stack analytical sections

Mobile:

- backtest cards
- stacked metrics
- horizontally scrollable tables only where necessary
- collapsible analytical sections
- no horizontal page overflow

==================================================
31. COMPONENTS
==================================================

Create reusable components where useful:

BacktestRegistry
BacktestTable
BacktestRow
BacktestDetail
BacktestConfiguration
BacktestSummary
EquityCurve
DrawdownChart
TradeStatistics
TradeHistory
ExecutionAssumptions
RegimeAnalysis
TimeframeAnalysis
AssetAnalysis
OutOfSampleValidation
WalkForwardValidation
ValidationAssessment
BacktestComparison
BacktestFilters
BacktestSearch
NewBacktestModal

Reuse existing components.

Do not over-abstract.

==================================================
32. DESIGN SYSTEM
==================================================

Reuse:

Obsidian Intelligence.

Use:

- Card
- Surface
- Metric
- Table
- Badge
- Tabs
- StatusIndicator
- PnLDisplay
- RiskBadge
- Button
- Hermes components
- Strategy components

Financial semantics:

Green:
positive

Red:
negative

Amber:
warning

Cyan:
AI / intelligence

Do not use cyan to represent profitability.

==================================================
33. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Use TypeScript if already used.

Use deterministic mock data.

Reuse the existing chart infrastructure.

Do not add another chart library.

Do not add another UI framework.

Do not introduce backend services.

Do not introduce database logic.

==================================================
34. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- real backtesting engine
- strategy simulation engine
- optimization
- parameter search
- Monte Carlo engine
- real historical data ingestion
- Binance
- CCXT
- Redis
- TimescaleDB
- WebSockets
- real AI
- real Hermes backend
- real performance calculations
- real strategy approval
- real paper trading
- real live trading
- Task 11 Risk
- Task 12 Analytics

==================================================
35. IMPORTANT FINANCIAL UX RULE
==================================================

Never make the UI imply:

"Past performance guarantees future results."

Do not use marketing language such as:

"Winning strategy"
"Guaranteed returns"
"Safe profits"

Prefer:

"Historical performance"
"Simulated result"
"Validation result"
"Mock backtest"
"Observed performance"

Clearly distinguish:

Gross P&L

from

Net P&L after modeled costs.

==================================================
36. ACCEPTANCE CRITERIA
==================================================

Task 10 is complete when:

1. /backtests works.

2. Backtest registry works.

3. Backtest selection works.

4. New Backtest modal works.

5. Mock backtest lifecycle works.

6. Backtest configuration is visible.

7. Performance summary works.

8. Equity curve works.

9. Drawdown visualization works.

10. Trade statistics work.

11. Trade history works.

12. Fees are visible.

13. Slippage is visible.

14. Gross vs net performance is visible.

15. Regime analysis works.

16. Timeframe analysis works.

17. Asset analysis works.

18. Out-of-sample section works.

19. Walk-forward section works.

20. Validation assessment works.

21. Strategy relationship is visible.

22. Hermes context is visible.

23. Filters work.

24. Search works.

25. Sorting works.

26. Backtest comparison works.

27. Mock data is centralized.

28. Data is deterministic.

29. No real backtesting engine exists.

30. No real market/API integration exists.

31. No real trading execution exists.

32. No strategy status is automatically changed.

33. No misleading profitability claims exist.

34. Responsive design works.

35. No horizontal overflow.

36. Existing Tasks 01–09 remain functional.

37. No TypeScript/lint/build errors.

==================================================
37. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /backtests.
- Select different backtests.
- Test filters.
- Test search.
- Test sorting.
- Open New Backtest.
- Create a mock backtest.
- Verify mock Running → Completed state.
- Inspect equity curve.
- Inspect drawdown.
- Inspect trade history.
- Inspect fees/slippage.
- Inspect regime analysis.
- Inspect OOS.
- Inspect Walk-Forward.
- Test comparison.
- Navigate back to Strategies.
- Navigate to Hermes.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify no real backtest is running.
- Verify no real trading can happen.
- Verify no misleading guarantees exist.
- Verify Tasks 01–09 remain functional.

STOP after completing Task 10.

Do NOT implement Task 11.