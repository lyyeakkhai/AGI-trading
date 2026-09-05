TASK 09 — STRATEGIES & STRATEGY REGISTRY

You are implementing Task 09 of an AI Trading Intelligence Platform called AGI Trading.

IMPORTANT:
Tasks 01–08 are already implemented:
- Task 01: App Shell
- Task 02: Design System + Shared Components
- Task 03: Overview
- Task 04: Markets + TradingView Lightweight Charts
- Task 05: Hermes & AI Intelligence
- Task 06: Opportunities
- Task 07: Trade Proposals
- Task 08: Positions & Portfolio

Build ONLY Task 09.

Do not redesign or rewrite Tasks 01–08 unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

The platform uses reusable trading strategies.

The strategy validation lifecycle is:

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

This task implements the:

STRATEGY REGISTRY

and

STRATEGY DETAIL

frontend experience.

Backtesting will be implemented in Task 10.

Do NOT implement the actual backtesting engine in this task.

==================================================
2. PURPOSE OF THE PAGE
==================================================

The Strategies workspace should answer:

- What strategies exist?
- Which strategies are active?
- What version is currently used?
- What market/timeframe does the strategy target?
- What is the strategy status?
- How was the strategy validated?
- Which opportunities use this strategy?
- Which positions came from this strategy?
- What are the strategy's high-level performance metrics?
- Is the strategy approved for paper/live usage?
- What is the next validation stage?

This should feel like a serious quantitative strategy management system.

NOT:

- a strategy marketplace
- a copy-trading page
- a social trading page
- a generic settings page
- a code editor

==================================================
3. ROUTE
==================================================

Create:

/strategies

If supported cleanly:

/strategies/:id

Otherwise use:

/strategies

with a selectable strategy detail panel.

==================================================
4. DESIGN LANGUAGE
==================================================

Reuse the existing:

Obsidian Intelligence

Design characteristics:

- professional
- technical
- analytical
- information dense
- calm
- trustworthy

Avoid:

- excessive neon
- crypto-bro visuals
- gaming UI
- decorative sci-fi
- excessive gradients
- excessive glassmorphism

Color semantics:

Cyan:
AI / intelligence / active system state

Green:
positive performance / approved / healthy

Red:
negative performance / rejected / failure

Amber:
warning / validation required

Gray:
neutral / inactive

==================================================
5. PAGE HEADER
==================================================

Title:

Strategies

Subtitle:

Reusable trading strategies and validation status.

Right side:

[ PAPER ]

[ Create Strategy ]

For this task, "Create Strategy" may open a simple mock modal.

Do NOT build a full strategy creation engine.

==================================================
6. SUMMARY METRICS
==================================================

Create compact strategy metrics:

Active Strategies
4

Paper Approved
3

Under Validation
2

Backtested
5

Live Approved
0

Do not imply these are real production statistics.

They are deterministic mock values.

==================================================
7. STRATEGY REGISTRY
==================================================

Create the main strategy table.

Columns:

Strategy
Version
Market
Timeframe
Type
Validation Stage
Paper Status
Live Status
Win Rate
Profit Factor
Updated

Example:

Breakout Continuation
v1.3
BTC/USDT
1H
Trend
Paper Trading
Approved
Not Approved
64%
1.72
Today

Trend Continuation
v2.1
ETH/USDT
4H
Trend
Walk-Forward
Pending
Not Approved
61%
1.54
Yesterday

Mean Reversion
v1.1
BTC/USDT
15M
Mean Reversion
Backtest
Not Approved
Not Approved
57%
1.31
2 days ago

Momentum
v0.9
BTC/USDT + ETH/USDT
1H
Momentum
Idea
Not Approved
Not Approved
—
—
Today

==================================================
8. STRATEGY STATUS
==================================================

Support these validation stages:

Trading Idea
Formal Strategy
Backtest
Out-of-Sample
Walk-Forward
Paper Trading
Tiny Live
Performance Evaluation
Approved

Create a reusable:

StrategyValidationStage

component.

Use a visual lifecycle:

Idea
↓
Formalized
↓
Backtest
↓
OOS
↓
Walk-Forward
↓
Paper
↓
Tiny Live
↓
Evaluation
↓
Approved

Highlight the current stage.

==================================================
9. STRATEGY DETAIL
==================================================

When selecting a strategy, show:

Strategy name

Breakout Continuation

Version:

v1.3

Status:

Paper Approved

Market:

BTC/USDT

Timeframe:

1H

Type:

Trend Following

Description:

"Captures confirmed breakouts followed by continuation momentum."

==================================================
10. STRATEGY DEFINITION
==================================================

Create:

Strategy Definition

Sections:

Market Universe

BTC/USDT

Timeframes

1H

Entry Conditions

- Price closes above confirmed resistance
- Volume confirms breakout
- Momentum remains positive

Exit Conditions

- Take profit reached
- Stop loss reached
- Structure invalidated

Risk Model

Fixed risk per trade

Default Risk:

0.50%

Do not build a strategy engine.

This is structured metadata.

==================================================
11. STRATEGY RULES
==================================================

Create a readable rules section.

Example:

ENTRY

1. Identify resistance zone.
2. Require confirmed breakout.
3. Require volume confirmation.
4. Require momentum confirmation.

INVALIDATION

1. Price closes below breakout structure.
2. Momentum invalidates.
3. Risk constraints fail.

EXIT

1. Stop loss.
2. Take profit.
3. Strategy invalidation.

The goal is readability.

Do NOT create an IDE/code editor.

==================================================
12. VALIDATION STATUS
==================================================

Create a strong:

Validation Status

panel.

Example:

Current Stage:

Paper Trading

Status:

APPROVED

Show completed stages:

Trading Idea ✓
Formal Strategy ✓
Backtest ✓
OOS ✓
Walk-Forward ✓
Paper Trading ●
Tiny Live ○
Performance Evaluation ○
Approved ○

Use clear status semantics.

==================================================
13. VALIDATION GATES
==================================================

Show validation requirements.

Example:

Historical Backtest
PASS

Out-of-Sample
PASS

Walk-Forward
PASS

Paper Trading
PASS

Tiny Live
NOT STARTED

Performance Evaluation
NOT STARTED

This should communicate that a strategy cannot simply be marked approved without validation.

==================================================
14. PERFORMANCE SNAPSHOT
==================================================

Create a compact strategy performance panel.

Metrics:

Net Return
+18.4%

Win Rate
64%

Profit Factor
1.72

Expectancy
+0.42R

Max Drawdown
-6.8%

Sharpe-style
1.48

Sortino-style
2.11

Trade Count
86

Average Winner
+1.42R

Average Loser
-0.93R

IMPORTANT:

These are mock values.

Do not implement performance calculations.

Task 10 will build actual Backtesting.

==================================================
15. STRATEGY PERFORMANCE CHART
==================================================

Show a simple equity curve preview.

Use deterministic mock data.

Example:

Initial Capital
$10,000

Current simulated value:
$11,840

The chart should be a compact preview.

If using charts:

Reuse the existing chart infrastructure.

Do not introduce a new chart library.

Task 10 will build the full Backtest visualization.

==================================================
16. STRATEGY USAGE
==================================================

Create:

"Strategy Usage"

Show where this strategy is currently being used.

Example:

Opportunities
3 active

Trade Proposals
2 pending

Open Positions
1

Closed Positions
12

Navigation:

View Opportunities
→ /opportunities

View Proposals
→ /trade-proposals

View Positions
→ /positions

This creates the relationship:

Strategy
→ Opportunity
→ Proposal
→ Position

==================================================
17. HERMES CONNECTION
==================================================

Show:

Hermes Strategy Context

Example:

Hermes is currently using:

Breakout Continuation v1.3

Active Markets:
BTC/USDT

Timeframe:
1H

Current Usage:
Monitoring 3 opportunities

Hermes assessment:

"This strategy currently meets its paper-trading validation criteria
and remains under performance observation."

Do not expose hidden chain-of-thought.

==================================================
18. VERSIONING
==================================================

Strategies must support versions.

Example:

Breakout Continuation

v1.3 ACTIVE

Previous:

v1.2
Archived

v1.1
Archived

Create a compact version history.

Show:

Version
Status
Created
Change Summary

Example:

v1.3
Active
Today
Adjusted breakout confirmation threshold

v1.2
Archived
Aug 28
Improved volume confirmation

Do not implement Git-like version control.

This is UI/mock metadata.

==================================================
19. STRATEGY FILTERS
==================================================

Add filters:

Status:
- All
- Active
- Archived
- Draft

Validation Stage:
- All
- Idea
- Formal Strategy
- Backtest
- OOS
- Walk-Forward
- Paper
- Tiny Live
- Evaluation
- Approved

Market:
- All
- BTC/USDT
- ETH/USDT
- Multi-Asset

Timeframe:
- All
- 15M
- 1H
- 4H
- 1D

Type:
- All
- Trend
- Breakout
- Mean Reversion
- Momentum

==================================================
20. SEARCH
==================================================

Add:

Search strategies...

Search by:

- strategy name
- version
- market
- type

Example:

breakout

should return:

Breakout Continuation

==================================================
21. SORTING
==================================================

Support sorting by:

- validation stage
- net return
- win rate
- profit factor
- max drawdown
- updated time

Default:

Active strategies first.

==================================================
22. CREATE STRATEGY MOCK FLOW
==================================================

Create a lightweight mock "Create Strategy" modal.

Fields:

Strategy Name

Description

Market

Timeframe

Strategy Type

Initial Idea

Example:

Strategy Name:
Momentum Expansion

Market:
BTC/USDT

Timeframe:
1H

Type:
Momentum

Initial Idea:
"Identify volatility expansion following compressed market structure."

Button:

Create Draft

After submission:

Create a local mock strategy with:

Status:
Draft

Validation Stage:
Trading Idea

IMPORTANT:

Do not build real strategy persistence.

Do not connect to backend.

==================================================
23. STRATEGY ARCHIVE
==================================================

Support:

Active
Draft
Archived

Archived strategies should remain accessible.

Example:

Breakout Continuation v1.1
Archived

Reason:

"Superseded by v1.2."

This is important for strategy history and reproducibility.

==================================================
24. STRATEGY RELATIONSHIP TO POSITIONS
==================================================

When viewing a strategy, show example positions generated by it.

Example:

BTC/USDT
LONG
+$42.18
OPEN

BTC/USDT
LONG
+$31.72
CLOSED

ETH/USDT
LONG
-$18.42
CLOSED

Provide:

View All Positions

→ /positions

Use deterministic mock data.

==================================================
25. STRATEGY RISK PROFILE
==================================================

Create:

Strategy Risk Profile

Show:

Default Risk:
0.50%

Maximum Risk:
1.00%

Typical R:R:
2.0R

Max Concurrent Positions:
2

Preferred Regime:
Trending

Avoid:

"Guaranteed risk"

This is strategy metadata only.

Task 11 will build the dedicated Risk workspace.

==================================================
26. MOCK DATA
==================================================

Create centralized deterministic mock data.

Example:

strategyMockData

Each strategy should contain:

id
name
version
status
description
marketUniverse
timeframes
type
validationStage
validationHistory
definition
entryConditions
exitConditions
invalidationConditions
riskProfile
performanceSnapshot
usage
versions
hermesContext
createdAt
updatedAt

Create at least:

6 strategies.

Suggested:

1. Breakout Continuation
2. Trend Continuation
3. Mean Reversion
4. Momentum Expansion
5. Volatility Reversal
6. BTC Range Reversion

Use different validation stages.

Include:

- active
- draft
- archived
- paper-approved
- under-validation

Keep all values deterministic.

==================================================
27. DATA RELATIONSHIPS
==================================================

Mock relationships:

strategyId
opportunityId
proposalId
positionId

Example:

Strategy:
STRAT-001

Opportunity:
OPP-018

Proposal:
TP-0042

Position:
POS-001

This should communicate traceability:

Strategy
→ Opportunity
→ Proposal
→ Position

Do not build database logic.

==================================================
28. STRATEGY DETAIL NAVIGATION
==================================================

From strategy detail:

Opportunities
→ /opportunities

Trade Proposals
→ /trade-proposals

Positions
→ /positions

Hermes
→ /hermes

Backtests
→ /backtests

Backtests may not exist yet.

That route is for the upcoming Task 10.

==================================================
29. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| Header / Filters                             |
------------------------------------------------
| Summary Metrics                              |
------------------------------------------------
| Strategy Registry                            |
------------------------------------------------
| Strategy Detail                              |
| Definition | Validation | Performance        |
------------------------------------------------

Tablet:

- reduce table columns
- use compact strategy cards
- detail becomes drawer

Mobile:

- strategy cards
- stacked metrics
- collapsible sections
- full-screen detail
- horizontally scrollable filters
- no horizontal page overflow

==================================================
30. COMPONENTS
==================================================

Create reusable components where appropriate:

StrategyTable
StrategyRow
StrategyCard
StrategyDetail
StrategyHeader
StrategyDefinition
StrategyRules
StrategyValidation
StrategyValidationStage
ValidationGate
StrategyPerformance
StrategyPerformanceChart
StrategyUsage
StrategyVersions
StrategyRiskProfile
StrategyFilters
StrategySearch
CreateStrategyModal

Reuse existing components whenever possible.

Do not over-abstract.

==================================================
31. DESIGN SYSTEM
==================================================

Reuse:

Obsidian Intelligence.

Existing components:

- Card
- Surface
- Button
- Badge
- Metric
- Table
- Tabs
- StatusIndicator
- RiskBadge
- PnLDisplay
- Hermes components

Typography:

Inter

Financial metrics:

JetBrains Mono where appropriate.

==================================================
32. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Use TypeScript if the project uses it.

Centralize mock data.

Use deterministic values.

No new UI framework.

No new chart library.

No backend.

No database.

No API integration.

Do not rewrite existing shared components unnecessarily.

==================================================
33. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- real strategy engine
- strategy execution
- real backtesting
- real optimization
- parameter optimization
- Binance
- CCXT
- Redis
- TimescaleDB
- WebSockets
- real AI
- real Hermes backend
- real performance calculations
- real strategy persistence
- live strategy approval
- Task 10 Backtesting
- Task 11 Risk

==================================================
34. ACCEPTANCE CRITERIA
==================================================

Task 09 is complete when:

1. /strategies works.

2. Strategy registry works.

3. Strategy detail works.

4. Strategy definition is visible.

5. Strategy rules are visible.

6. Validation lifecycle is visible.

7. Validation gates are visible.

8. Performance snapshot works with mock data.

9. Equity curve preview works.

10. Strategy usage is visible.

11. Hermes strategy context is visible.

12. Strategy versions are visible.

13. Strategy risk profile is visible.

14. Filters work.

15. Search works.

16. Sorting works.

17. Create Strategy mock flow works.

18. Draft strategy can be created locally.

19. Archived strategies are visible.

20. Strategy → Opportunity relationship is visible.

21. Strategy → Proposal relationship is visible.

22. Strategy → Position relationship is visible.

23. Navigation works.

24. Responsive design works.

25. No horizontal overflow.

26. Mock data is centralized.

27. No backend/API integration exists.

28. No real strategy execution exists.

29. No real backtesting exists.

30. Existing Tasks 01–08 remain functional.

31. No TypeScript/lint/build errors.

==================================================
35. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /strategies.
- Test strategy selection.
- Test filters.
- Test search.
- Test sorting.
- Open strategy detail.
- Review validation lifecycle.
- Review performance snapshot.
- Review strategy versions.
- Review Hermes context.
- Review strategy usage.
- Create a draft strategy.
- Verify archived strategies.
- Test navigation to Opportunities.
- Test navigation to Proposals.
- Test navigation to Positions.
- Test navigation to Hermes.
- Test navigation to Backtests.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify no real trading behavior exists.
- Verify no real backtesting was implemented.
- Verify Tasks 01–08 still work.

STOP after completing Task 09.

Do NOT implement Task 10.