TASK 12 — ANALYTICS & PERFORMANCE INTELLIGENCE

You are implementing Task 12 of the AGI Trading platform.

Tasks 01–11 are already implemented:

01 App Shell
02 Design System + Shared Components
03 Overview
04 Markets + TradingView Chart
05 Hermes & AI Intelligence
06 Opportunities
07 Trade Proposals
08 Positions & Portfolio
09 Strategies
10 Backtests
11 Risk Management

Build ONLY Task 12.

Do not redesign or rewrite previous tasks unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

AGI Trading is an AI-assisted trading intelligence platform.

The Analytics workspace answers:

"How is the trading system actually performing?"

Analytics must combine the conceptual outputs of:

Portfolio
Strategies
Backtests
Paper Trading
Trade Proposals
Risk
Positions

The goal is to evaluate performance, risk-adjusted performance,
strategy behavior, execution quality, and consistency.

IMPORTANT:

This task is FRONTEND ONLY.

Use deterministic mock data.

Do NOT implement the real analytics backend yet.

Do NOT connect to Binance.

Do NOT implement real performance calculations from exchange data.

==================================================
2. ROUTE
==================================================

Create:

/analytics

Optional:

/analytics/trades
/analytics/strategies

But keep the primary experience under:

/analytics

==================================================
3. PRIMARY QUESTIONS

The Analytics page must answer:

- Is the system profitable?
- What is the net P&L?
- What is the return?
- What is the maximum drawdown?
- What is the win rate?
- What is the average winner vs loser?
- What is the profit factor?
- What is expectancy?
- What is Sharpe-style performance?
- What is Sortino-style performance?
- How many trades occurred?
- How long are trades held?
- How much was paid in fees?
- How much estimated slippage occurred?
- Which strategies perform best?
- Which assets perform best?
- Which timeframes perform best?
- Which market regimes perform best?
- Is performance consistent?
- How well calibrated is AI confidence?

==================================================
4. DESIGN DIRECTION
==================================================

Use:

OBSIDIAN INTELLIGENCE

The page should feel like:

Professional quantitative performance terminal
+
AI trading intelligence analytics

NOT:

- marketing analytics
- SaaS business analytics
- generic BI dashboard
- crypto profit flex dashboard

Visual personality:

- analytical
- precise
- calm
- data dense
- trustworthy

Use existing semantic colors:

Green = positive
Red = negative
Amber = warning
Cyan = AI/intelligence
Gray = neutral

Do not use cyan to represent profit.

==================================================
5. PAGE HEADER
==================================================

Header:

Analytics

Subtitle:

Performance, risk-adjusted returns, strategy behavior, and execution quality.

Controls:

[ PAPER ]

[ Date Range ]

[ Compare ]

Example:

Analytics
Performance, risk-adjusted returns, strategy behavior, and execution quality.

Period:
Last 90 Days

==================================================
6. PERFORMANCE SUMMARY
==================================================

Create primary performance metrics.

Metrics:

Net P&L
+$2,480

Net Return
+24.8%

Max Drawdown
-8.4%

Win Rate
64.1%

Profit Factor
1.84

Expectancy
+0.42R

Sharpe-style
1.72

Sortino-style
2.31

Trade Count
184

Average Holding
7h 24m

Fees
$184

Estimated Slippage
$92

These are mock values.

Clearly label:

"Simulated / Mock Performance"

where appropriate.

==================================================
7. EQUITY PERFORMANCE
==================================================

Create:

Portfolio Equity

Show an equity curve over time.

Support:

1D
7D
30D
90D
All

Example:

Starting Equity:
$10,000

Current Equity:
$12,480

Net:
+$2,480

Use the existing chart infrastructure.

Do NOT add another chart library.

Chart should support:

- hover
- crosshair
- date
- equity value

==================================================
8. BENCHMARK COMPARISON
==================================================

Create:

Performance vs Benchmark

Example:

AGI Trading
+24.8%

BTC Buy & Hold
+18.1%

ETH Buy & Hold
+11.7%

Cash / Baseline
0%

This is mock data.

Use this to answer:

"Did the strategy/system outperform a simple passive baseline?"

Do not imply statistical significance.

==================================================
9. DRAWDOWN ANALYSIS
==================================================

Create:

Drawdown Analysis

Metrics:

Current Drawdown
-1.2%

Maximum Drawdown
-8.4%

Average Drawdown
-2.7%

Longest Drawdown
34 days

Recovery Time
19 days

Include a drawdown visualization.

Use existing chart infrastructure.

==================================================
10. RETURNS BREAKDOWN
==================================================

Create:

Returns by Period

Example:

Month      Return
January    +4.2%
February   +2.1%
March      -1.8%
April      +6.4%
May        +3.2%
June       +5.7%

Allow:

Monthly
Weekly

Use compact table/chart.

==================================================
11. TRADE PERFORMANCE
==================================================

Create:

Trade Performance

Show:

Total Trades
184

Winning
118

Losing
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

Average Holding Time
7h 24m

==================================================
12. P&L DISTRIBUTION
==================================================

Create:

Trade P&L Distribution

Show the distribution of:

- winning trades
- losing trades
- small wins/losses
- large winners
- large losers

Use an appropriate existing chart mechanism.

Keep it visually simple.

Do not create a casino-style histogram.

==================================================
13. PERFORMANCE BY STRATEGY
==================================================

Create:

Strategy Performance

Columns:

Strategy
Trades
Net P&L
Return
Win Rate
Profit Factor
Max Drawdown
Expectancy
Status

Example:

Breakout Continuation
84
+$1,420
+14.2%
66%
1.94
-6.2%
+0.48R

Trend Continuation
61
+$820
+8.2%
62%
1.71
-5.1%
+0.37R

Mean Reversion
39
+$240
+2.4%
59%
1.21
-4.8%
+0.14R

Make strategy names clickable to:

/strategies

==================================================
14. PERFORMANCE BY ASSET
==================================================

Create:

Asset Performance

Example:

BTC/USDT
Trades: 112
P&L: +$1,820
Return: +18.2%
PF: 1.91

ETH/USDT
Trades: 72
P&L: +$660
Return: +6.6%
PF: 1.52

Allow future assets without redesign.

==================================================
15. PERFORMANCE BY TIMEFRAME
==================================================

Create:

Timeframe Performance

Example:

15M
Trades: 42
Return: +3.2%
PF: 1.21

1H
Trades: 91
Return: +14.7%
PF: 1.92

4H
Trades: 38
Return: +5.1%
PF: 1.55

1D
Trades: 13
Return: +1.8%
PF: 1.31

==================================================
16. PERFORMANCE BY MARKET REGIME
==================================================

Create:

Market Regime Performance

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

This should help identify where the system works and where it struggles.

==================================================
17. LONG VS SHORT
==================================================

Create:

Directional Performance

Long:

Trades
122

Win Rate
66%

P&L
+$1,940

Profit Factor
1.93

Short:

Trades
62

Win Rate
60%

P&L
+$540

Profit Factor
1.62

Keep this compact.

==================================================
18. EXECUTION QUALITY
==================================================

Create:

Execution Quality

Show:

Total Fees
$184

Estimated Slippage
$92

Average Slippage
0.05%

Gross P&L
+$2,756

Net P&L
+$2,480

Cost Impact
-$276

This is important because the product's objective is
risk-adjusted performance AFTER fees and slippage.

==================================================
19. RISK-ADJUSTED PERFORMANCE
==================================================

Create:

Risk-Adjusted Performance

Metrics:

Sharpe-style
1.72

Sortino-style
2.31

Calmar-style
2.95

Profit Factor
1.84

Expectancy
+0.42R

Maximum Drawdown
-8.4%

IMPORTANT:

Use "-style" labels because this is currently mock analytics.

Do not claim these are production-grade statistical calculations.

==================================================
20. CONSISTENCY
==================================================

Create:

Performance Consistency

Show:

Profitable Days
61 / 90

Profitable Weeks
12 / 13

Profitable Months
7 / 8

Longest Winning Streak
9 trades

Longest Losing Streak
4 trades

Average Monthly Return
+3.1%

This helps distinguish a few large wins from consistent performance.

==================================================
21. CONFIDENCE CALIBRATION
==================================================

Because Hermes generates confidence estimates, create:

AI Confidence Calibration

Example:

Confidence Range | Win Rate | Trades

50–60%
54%
31

60–70%
61%
48

70–80%
72%
67

80–90%
81%
29

90%+
88%
9

Add a compact interpretation:

"Observed outcomes broadly increase with confidence, but the sample
is still limited."

IMPORTANT:

Do not expose hidden reasoning.

Only show aggregate results.

==================================================
22. AI / HERMES PERFORMANCE
==================================================

Create:

Hermes Performance Overview

Metrics:

Opportunities Detected
428

Investigations
176

Trade Proposals
92

Risk Approved
71

Executed / Simulated
64

Profitable
41

Proposal → Trade Conversion
69.6%

Proposal Win Rate
64.1%

This is mock data.

Clearly distinguish:

AI activity

from

actual trading performance.

==================================================
23. FUNNEL
==================================================

Create:

Trading Intelligence Funnel

Detected Opportunities
428

↓

Investigated
176

↓

Trade Proposals
92

↓

Risk Approved
71

↓

Owner Approved
64

↓

Executed / Paper
64

↓

Profitable
41

Use a clean vertical or horizontal funnel.

Do not imply that every detected opportunity should become a trade.

==================================================
24. STRATEGY COMPARISON
==================================================

Create:

Compare Strategies

Allow selecting up to 3 strategies.

Compare:

Net Return
Max Drawdown
Win Rate
Profit Factor
Expectancy
Trade Count
Sharpe-style
Sortino-style

Example:

Breakout v1.3
+24.8%
-8.4%
64%
1.84
+0.42R

Trend v2.1
+17.2%
-7.1%
61%
1.59
+0.31R

Mean Reversion v1.1
+6.2%
-5.9%
58%
1.21
+0.14R

==================================================
25. ANALYTICS FILTERS
==================================================

Support filters:

Date Range

Strategy

Asset

Timeframe

Market Regime

Direction

Trading Mode:

PAPER

LIVE

For MVP:

Default:

PAPER

Do not create fake live performance.

If LIVE has no data:

Show:

"No live performance data available."

==================================================
26. DATE RANGES
==================================================

Provide:

7D
30D
90D
YTD
All Time
Custom

Use mock data consistently.

==================================================
27. EXPORT
==================================================

Add:

[ Export Report ]

For this frontend task:

The button may show:

"Export will be available when analytics backend is connected."

Do not implement a fake downloadable financial report.

==================================================
28. HERMES CONTEXT
==================================================

Add a compact Hermes insight panel.

Example:

Hermes

Performance Review

"Performance remains positive over the selected period. The strongest
results are currently coming from BTC/USDT during trending regimes."

Show:

Top Strategy
Breakout Continuation

Best Regime
Trending

Weakest Regime
High Volatility

Do not expose chain-of-thought.

==================================================
29. DATA MODEL
==================================================

Create centralized deterministic mock data.

Example:

analyticsOverviewMock

equityCurveMock

drawdownMock

returnsByPeriodMock

tradePerformanceMock

strategyPerformanceMock

assetPerformanceMock

timeframePerformanceMock

regimePerformanceMock

directionPerformanceMock

executionQualityMock

riskAdjustedPerformanceMock

consistencyMock

confidenceCalibrationMock

hermesPerformanceMock

funnelMock

comparisonMock

Do not scatter data across components.

==================================================
30. RELATIONSHIPS
==================================================

Analytics should connect conceptually to:

Backtests
Strategies
Positions
Trade Proposals
Risk
Hermes

Possible navigation:

View Strategy
→ /strategies

View Backtest
→ /backtests

View Positions
→ /positions

View Trade Proposals
→ /trade-proposals

View Risk
→ /risk

View Hermes
→ /hermes

==================================================
31. COMPONENTS
==================================================

Create reusable components where useful:

AnalyticsHeader
PerformanceSummary
EquityCurve
DrawdownAnalysis
BenchmarkComparison
ReturnsBreakdown
TradePerformance
PnLDistribution
StrategyPerformance
AssetPerformance
TimeframePerformance
RegimePerformance
DirectionalPerformance
ExecutionQuality
RiskAdjustedPerformance
ConsistencyAnalysis
ConfidenceCalibration
HermesPerformance
TradingFunnel
StrategyComparison
AnalyticsFilters

Reuse existing components.

Do not over-abstract.

==================================================
32. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| Analytics Header                             |
------------------------------------------------
| Performance Metrics                          |
------------------------------------------------
| Equity Curve                                 |
------------------------------------------------
| Drawdown | Benchmark                         |
------------------------------------------------
| Returns | Trade Performance                   |
------------------------------------------------
| Strategy Performance                         |
------------------------------------------------
| Asset | Timeframe | Regime                   |
------------------------------------------------
| Execution | Risk Adjusted                    |
------------------------------------------------
| Consistency | AI Calibration                 |
------------------------------------------------
| Hermes | Trading Funnel                      |
------------------------------------------------

Tablet:

- stack analytical sections
- simplify tables
- allow horizontal scrolling for dense tables

Mobile:

- stacked metric cards
- collapsible sections
- horizontal table scrolling only when necessary
- no page-level horizontal overflow

==================================================
33. PERFORMANCE SEMANTICS
==================================================

Always distinguish:

Gross P&L
from
Net P&L

and:

Backtest
from
Paper Trading

and:

Paper Trading
from
Live Trading

Do not combine them into one misleading number.

==================================================
34. MOCK DATA RULES
==================================================

All data must be deterministic.

Use realistic but clearly simulated values.

Maintain internal consistency.

Example:

If:

Initial Equity = $10,000

and:

Final Equity = $12,480

then:

Net P&L = +$2,480

and:

Net Return = +24.8%

Make related metrics reasonably consistent.

Do not generate random values on every render.

==================================================
35. IMPORTANT FINANCIAL UX RULES
==================================================

Do not use:

"Guaranteed"

"Safe"

"Risk-free"

"Winning system"

"Guaranteed return"

Prefer:

"Observed performance"

"Historical performance"

"Simulated performance"

"Mock result"

"Risk-adjusted metric"

"Current observation"

==================================================
36. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Reuse:

- design tokens
- existing components
- routing
- chart infrastructure
- typography

Do NOT add another chart library.

Do NOT add:

- Binance integration
- CCXT
- Redis
- TimescaleDB
- WebSockets
- analytics backend
- real performance engine
- real statistical engine
- real exchange data
- real live data

==================================================
37. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- production analytics engine
- real Sharpe calculation
- real Sortino calculation
- real performance attribution engine
- real AI calibration engine
- real exchange synchronization
- real reporting backend
- real export service
- live trading analytics
- Task 13 Activity/Audit
- Task 14 Settings

==================================================
38. ACCEPTANCE CRITERIA
==================================================

Task 12 is complete when:

1. /analytics works.

2. Performance summary works.

3. Net P&L is visible.

4. Net return is visible.

5. Maximum drawdown is visible.

6. Win rate is visible.

7. Profit factor is visible.

8. Expectancy is visible.

9. Sharpe-style metric is visible.

10. Sortino-style metric is visible.

11. Equity curve works.

12. Drawdown analysis works.

13. Benchmark comparison works.

14. Returns breakdown works.

15. Trade performance works.

16. P&L distribution works.

17. Strategy performance works.

18. Asset performance works.

19. Timeframe performance works.

20. Regime performance works.

21. Long/short performance works.

22. Execution costs are visible.

23. Risk-adjusted performance works.

24. Consistency metrics work.

25. AI confidence calibration works.

26. Hermes performance section works.

27. Trading funnel works.

28. Strategy comparison works.

29. Filters work.

30. Date ranges work.

31. Paper/live distinction is clear.

32. No fake live data is shown.

33. Mock data is centralized.

34. Mock data is deterministic.

35. Related metrics are internally consistent.

36. No misleading financial claims exist.

37. Responsive layout works.

38. No page-level horizontal overflow.

39. Existing Tasks 01–11 remain functional.

40. No TypeScript/lint/build errors.

==================================================
39. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /analytics.
- Test date filters.
- Test strategy filters.
- Test asset filters.
- Test timeframe filters.
- Test regime filters.
- Verify performance metrics.
- Verify equity curve.
- Verify drawdown.
- Verify benchmark.
- Verify strategy performance.
- Verify asset performance.
- Verify regime performance.
- Verify execution costs.
- Verify risk-adjusted metrics.
- Verify confidence calibration.
- Verify Hermes panel.
- Verify strategy comparison.
- Verify PAPER/LIVE distinction.
- Verify no fake live performance.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify Tasks 01–11 remain functional.
- Verify no build/lint/type errors.

STOP after completing Task 12.

Do NOT implement Task 13.