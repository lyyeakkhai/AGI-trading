TASK 11 — RISK MANAGEMENT & RISK ENGINE UI

You are implementing Task 11 of the AGI Trading platform.

Tasks 01–10 are already implemented:

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

Build ONLY Task 11.

Do not redesign or rewrite previous tasks unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

Risk is a deterministic safety layer between AI-generated trade proposals
and trading execution.

Architecture:

Hermes
   ↓
Trade Proposal
   ↓
Risk Engine
   ↓
Owner Approval
   ↓
Execution
   ↓
Exchange

IMPORTANT:

Hermes can propose.

Hermes cannot override deterministic risk controls.

The Risk Engine must be represented as an independent,
deterministic system.

This task is FRONTEND ONLY.

Use deterministic mock data.

Do NOT implement the real risk engine yet.

==================================================
2. ROUTE
==================================================

Create:

/risk

Optional:

/risk/proposals/:id

The main Risk page should provide a complete risk-control workspace.

==================================================
3. PRIMARY PURPOSE
==================================================

The Risk page must answer:

- What is the current portfolio risk?
- How much capital is exposed?
- What is the maximum allowed risk?
- Which positions are consuming risk?
- What risk rules are active?
- Which proposals passed risk validation?
- Which proposals were rejected?
- Why was a proposal rejected?
- What would happen if a proposed trade were accepted?
- Is the portfolio currently within risk limits?

The UI should feel like a serious risk-control terminal.

NOT a generic settings page.

==================================================
4. DESIGN DIRECTION
==================================================

Use the existing:

OBSIDIAN INTELLIGENCE

design system.

Personality:

- precise
- calm
- technical
- defensive
- trustworthy
- high information density

Risk should visually feel different from profitability.

Use:

Green = healthy / within limit
Red = breach / rejection / dangerous
Amber = warning / approaching limit
Cyan = AI / system intelligence
Gray = neutral

IMPORTANT:

Do NOT use cyan to mean profit.

==================================================
5. PAGE HEADER
==================================================

Header:

Risk Management

Subtitle:

Deterministic portfolio protection and trade validation.

Top-right:

[ PAPER ]

Risk Status:

● HEALTHY

Example:

Risk Management
Deterministic portfolio protection and trade validation.

Portfolio Risk: 1.8%
Daily Loss: 0.7%
Status: HEALTHY

==================================================
6. RISK OVERVIEW
==================================================

Create a high-level risk summary.

Metrics:

Portfolio Equity
$12,480

Total Exposure
$4,820

Portfolio Risk
1.8%

Available Risk
3.2%

Daily Loss
0.7%

Daily Loss Limit
3.0%

Open Positions
3

Use existing Metric components.

==================================================
7. RISK UTILIZATION
==================================================

Create:

Risk Budget

Example:

Maximum Portfolio Risk
5.0%

Current Risk
1.8%

Remaining
3.2%

Progress visualization:

1.8 / 5.0%

Show:

Healthy

If utilization becomes high:

Warning

If limit is exceeded:

Critical

Use deterministic mock values.

==================================================
8. DAILY LOSS LIMIT
==================================================

Create:

Daily Loss Protection

Example:

Daily Loss

-$84

Daily Limit

-$300

Utilization

28%

Status:

HEALTHY

Include a progress indicator.

Explain:

"Trading should be restricted if the configured daily loss threshold
is reached."

Do not claim the actual execution system enforces this yet.

==================================================
9. EXPOSURE
==================================================

Create:

Portfolio Exposure

Example:

BTC/USDT
$3,200
66%

ETH/USDT
$1,620
34%

Total:

$4,820

Show:

- absolute exposure
- percentage of portfolio
- long/short exposure

Example:

Long Exposure
100%

Short Exposure
0%

==================================================
10. POSITION RISK
==================================================

Create:

Position Risk

For each open position show:

Symbol
Side
Entry
Current
Stop
Position Size
Risk Amount
Risk %
Distance to Stop
Unrealized P&L

Example:

BTC/USDT
LONG

Entry:
$112,400

Current:
$114,180

Stop:
$110,900

Risk:
$135

Portfolio Risk:
1.08%

Status:
HEALTHY

==================================================
11. RISK LIMITS
==================================================

Create:

Risk Limits

Display configured limits.

Example:

Max Risk / Trade
1.0%

Max Portfolio Risk
5.0%

Max Daily Loss
3.0%

Max Open Positions
5

Max Asset Exposure
40%

Max Correlated Exposure
60%

Minimum Risk/Reward
1.5R

Live Trading Enabled
OFF

These are UI/mock configuration values.

Do not implement actual enforcement.

==================================================
12. RISK RULE STATUS
==================================================

Create a table:

Risk Checks

Check
Status
Current
Limit

Per Trade Risk
PASS
0.8%
1.0%

Portfolio Risk
PASS
1.8%
5.0%

Daily Loss
PASS
0.7%
3.0%

Open Positions
PASS
3
5

BTC Exposure
PASS
26%
40%

Risk/Reward
PASS
2.1R
1.5R

All checks should have:

PASS
WARNING
FAIL

states.

==================================================
13. TRADE PROPOSAL VALIDATION
==================================================

Create:

Recent Risk Decisions

This connects directly to Trade Proposals.

Columns:

Proposal
Symbol
Side
Risk
R:R
Risk Decision
Reason
Time

Example:

PROP-042
BTC/USDT
LONG
0.8%
2.4R
APPROVED
All limits satisfied

PROP-041
ETH/USDT
LONG
1.4%
1.8R
REJECTED
Per-trade risk exceeds limit

PROP-040
BTC/USDT
LONG
0.7%
1.2R
REJECTED
Minimum R:R not satisfied

Use deterministic mock data.

==================================================
14. RISK DECISION DETAIL
==================================================

When selecting a proposal, show a detail panel.

Example:

Risk Validation

Proposal:
PROP-042

BTC/USDT LONG

Requested Risk:
0.8%

Portfolio Risk Before:
1.8%

Portfolio Risk After:
2.6%

Maximum:
5.0%

Result:

PASS

Checks:

Per Trade Risk       PASS
Portfolio Risk       PASS
Daily Loss            PASS
Asset Exposure        PASS
Open Positions        PASS
Risk/Reward           PASS

Final Decision:

RISK APPROVED

IMPORTANT:

This is only a frontend mock.

==================================================
15. REJECTION DETAIL
==================================================

For rejected proposals show:

Risk Decision

REJECTED

Reason:

Per-trade risk exceeds configured limit.

Requested:

1.4%

Maximum:

1.0%

Suggested Action:

Reduce position size or increase stop distance.

Do not allow the UI to imply that the AI can bypass this decision.

==================================================
16. POSITION SIZING
==================================================

Create:

Position Size Calculator

This is UI-only.

Inputs:

Account Equity
$12,480

Risk %
1.0%

Entry Price
$114,000

Stop Price
$112,500

Risk Amount
$124.80

Calculated Position Size:

0.0832 BTC

Notional:

$9,484.80

IMPORTANT:

If calculations are implemented locally, make them deterministic
and mathematically correct.

Formula:

Risk Amount = Equity × Risk %

Position Size =
Risk Amount / |Entry Price - Stop Price|

Do not connect to execution.

==================================================
17. WHAT-IF RISK PREVIEW
==================================================

Create:

Trade Risk Preview

Allow the user to modify mock:

Entry
Stop
Target
Position Size

Show:

Risk Amount
Risk %
R:R
Portfolio Risk After Trade
Exposure After Trade

Example:

Current Portfolio Risk
1.8%

After Proposed Trade
2.6%

Limit
5.0%

Result:

PASS

This is a local UI simulation only.

==================================================
18. CORRELATION / CONCENTRATION
==================================================

Create:

Concentration Risk

Example:

BTC Exposure
26%

ETH Exposure
13%

BTC + ETH Combined
39%

Maximum Combined
60%

Status:

HEALTHY

Add a small explanation:

"Concentration limits help prevent excessive exposure to correlated
assets."

Keep this section compact.

==================================================
19. RISK EVENTS
==================================================

Create:

Risk Activity

Examples:

09:42
PROP-042 risk validation passed

09:36
Portfolio risk increased to 1.8%

09:12
Daily loss utilization reached 28%

Yesterday
PROP-041 rejected — per-trade risk exceeded

These are system events.

Do NOT expose hidden Hermes chain-of-thought.

==================================================
20. HERMES CONNECTION
==================================================

Add a compact Hermes panel.

Example:

Hermes

Risk Awareness

"Current portfolio risk remains within configured limits."

Show:

Portfolio Risk
1.8%

Risk Budget Remaining
3.2%

Open Risk Warnings
0

Hermes can observe risk state.

Hermes cannot override risk rules.

==================================================
21. RISK STATES
==================================================

Support:

HEALTHY

WARNING

CRITICAL

LOCKED

Example:

HEALTHY
Risk within limits.

WARNING
Risk approaching configured limit.

CRITICAL
One or more risk limits exceeded.

LOCKED
New trading activity should be blocked.

These are mock UI states.

==================================================
22. EMERGENCY / SAFETY STATE
==================================================

Create a compact:

Trading Safety

Current:

Trading Lock
OFF

Live Trading
OFF

Paper Trading
ON

Emergency Stop
INACTIVE

Do NOT implement a real emergency stop.

Do NOT connect this button to real execution.

If showing a button:

[ View Safety Controls ]

not a functional live kill switch.

==================================================
23. FILTERS
==================================================

For Risk Decisions support:

Status:

All
Approved
Rejected
Warning

Symbol:

All
BTC/USDT
ETH/USDT

Time:

Today
7 Days
30 Days

==================================================
24. SEARCH
==================================================

Search:

Search proposals, symbols, decisions...

Search by:

- proposal ID
- symbol
- reason

==================================================
25. DATA MODEL
==================================================

Create centralized deterministic mock data.

Example:

riskOverviewMock

riskLimitsMock

riskChecksMock

positionRiskMock

riskDecisionsMock

riskEventsMock

riskCalculatorMock

Do not scatter mock data throughout components.

==================================================
26. RELATIONSHIPS
==================================================

Maintain traceability:

Strategy
→ Backtest
→ Opportunity
→ Trade Proposal
→ Risk Validation
→ Owner Approval
→ Position

Example:

proposalId:
PROP-042

strategyId:
STRAT-001

backtestId:
BT-0042

Risk page should be able to navigate to:

/trade-proposals

/positions

/strategies

/backtests

==================================================
27. COMPONENTS
==================================================

Create reusable components where useful:

RiskOverview
RiskBudget
DailyLossProtection
ExposureOverview
PositionRiskTable
RiskLimits
RiskCheckTable
RiskDecisionTable
RiskDecisionDetail
PositionSizeCalculator
TradeRiskPreview
ConcentrationRisk
RiskActivity
RiskStatus
SafetyStatus

Reuse existing components.

Do not over-abstract.

==================================================
28. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| Risk Management              PAPER  HEALTHY |
------------------------------------------------
| Portfolio Risk | Exposure | Daily Loss       |
------------------------------------------------
| Risk Budget           | Daily Loss           |
------------------------------------------------
| Exposure              | Position Risk        |
------------------------------------------------
| Risk Limits                                  |
------------------------------------------------
| Risk Checks                                  |
------------------------------------------------
| Recent Risk Decisions                        |
------------------------------------------------
| Position Calculator                          |
------------------------------------------------
| Concentration | Hermes                      |
------------------------------------------------

Tablet:

- stack cards
- simplify tables
- use horizontal scrolling where necessary

Mobile:

- stacked metrics
- cards instead of wide tables where possible
- collapsible sections
- horizontally scroll tables only when unavoidable
- no page-level horizontal overflow

==================================================
29. VISUAL RULES
==================================================

Risk UI must NOT look like a profit dashboard.

Prioritize:

- limits
- thresholds
- exposure
- warnings
- validation
- safety
- deterministic decisions

Use subtle visual hierarchy.

Avoid:

- huge glowing numbers
- excessive red
- neon effects
- gambling-style visuals
- decorative animations

==================================================
30. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Reuse existing:

- design tokens
- components
- routing
- chart infrastructure
- layout
- typography

Do not add:

- backend
- database
- Binance integration
- CCXT
- Redis
- TimescaleDB
- WebSockets
- real risk engine
- real execution
- real portfolio sync

==================================================
31. IMPORTANT ARCHITECTURE RULE
==================================================

The UI must communicate this boundary clearly:

Hermes:
PROPOSES

Risk Engine:
VALIDATES

Owner:
APPROVES

Execution Service:
EXECUTES

Exchange:
FILLS

Never present Hermes as having authority to bypass risk controls.

==================================================
32. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- real risk engine
- real order validation
- real position sizing service
- real portfolio risk calculation
- real exchange integration
- real Binance API
- live credentials
- real emergency stop
- real trading lock
- automatic trade rejection backend
- automatic live trading
- Task 12 Analytics

==================================================
33. ACCEPTANCE CRITERIA
==================================================

Task 11 is complete when:

1. /risk works.

2. Risk overview works.

3. Portfolio risk is visible.

4. Risk budget is visible.

5. Daily loss protection is visible.

6. Portfolio exposure is visible.

7. Position-level risk is visible.

8. Risk limits are visible.

9. Risk checks are visible.

10. PASS/WARNING/FAIL states work.

11. Recent risk decisions work.

12. Proposal risk detail works.

13. Rejection reasons are clear.

14. Position size calculator works locally.

15. What-if risk preview works locally.

16. Concentration risk is visible.

17. Risk activity is visible.

18. Hermes risk context is visible.

19. Safety state is visible.

20. Filters work.

21. Search works.

22. Strategy/backtest/proposal/position relationships are represented.

23. Mock data is centralized.

24. Data is deterministic.

25. No real risk engine exists.

26. No real trading can happen.

27. No real Binance credentials are used.

28. Hermes cannot visually bypass risk controls.

29. Risk states are visually clear.

30. Responsive design works.

31. No horizontal page overflow.

32. Existing Tasks 01–10 remain functional.

33. No TypeScript/lint/build errors.

==================================================
34. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /risk.
- Verify risk overview.
- Verify risk budget.
- Verify daily loss.
- Verify exposure.
- Verify position risk.
- Verify risk limits.
- Verify risk checks.
- Select an approved proposal.
- Select a rejected proposal.
- Verify rejection reason.
- Test filters.
- Test search.
- Test position-size calculator.
- Test what-if preview.
- Verify Hermes panel.
- Verify safety state.
- Test responsive layout.
- Verify no horizontal overflow.
- Verify no real execution is possible.
- Verify Tasks 01–10 remain functional.

STOP after completing Task 11.

Do NOT implement Task 12.