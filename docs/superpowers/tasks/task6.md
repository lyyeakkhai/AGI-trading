TASK 06 — OPPORTUNITIES / OPPORTUNITY DETECTION

You are implementing Task 06 of an AI Trading Intelligence Platform called AGI Trading.

IMPORTANT:
Tasks 01–05 are already implemented:
- Task 01: App Shell
- Task 02: Design System + Shared Components
- Task 03: Overview
- Task 04: Markets + TradingView Lightweight Charts
- Task 05: Hermes & AI Intelligence

Build ONLY Task 06.

Do not redesign or rewrite Tasks 01–05 unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

This is a private, single-user AI trading intelligence platform.

Hermes is the Main Trading Agent.

The Opportunity Detection system helps Hermes identify and evaluate
potential trading opportunities across the supported market universe.

The frontend should make it easy for the owner to understand:

- What opportunities currently exist?
- Which assets are being monitored?
- Why did Hermes detect the opportunity?
- What strategy/setup is involved?
- What timeframe is involved?
- How strong is the opportunity?
- What evidence supports it?
- What evidence contradicts it?
- What is the current opportunity status?
- Does it require further investigation?

IMPORTANT:

An opportunity is NOT automatically a trade.

Opportunity:

Market condition that may deserve further analysis.

Trade Proposal:

A structured trade recommendation produced after further evaluation.

Trade Proposal is Task 07.

==================================================
2. SCOPE
==================================================

Build the Opportunities page.

Route:

/opportunities

The page should feel like:

"An AI-powered opportunity radar."

It should NOT feel like:

- a generic screener
- a crypto leaderboard
- a social trading page
- a trading execution screen
- a chatbot

==================================================
3. DESIGN LANGUAGE
==================================================

Reuse the existing:

Obsidian Intelligence design system.

Visual personality:

- precise
- calm
- technical
- intelligent
- trustworthy
- information dense

Visual balance:

80% professional trading terminal
20% futuristic AI intelligence system

Avoid:

- excessive neon
- crypto-bro design
- huge gradients
- gaming UI
- excessive glow
- decorative sci-fi
- excessive glassmorphism

Cyan:

AI / intelligence / active analysis.

Green:

Positive / long.

Red:

Negative / short.

Amber:

Risk / warning / uncertainty.

Do not use cyan as a profit indicator.

==================================================
4. PAGE HEADER
==================================================

Create:

Opportunities

Subtitle:

AI-detected market setups requiring attention.

Header controls:

- Market filter
- Direction filter
- Timeframe filter
- Strategy filter
- Confidence filter
- Status filter

Example:

[ All Markets ] [ All Directions ] [ All Timeframes ]
[ All Strategies ] [ Confidence ] [ Status ]

Keep filters compact.

==================================================
5. OPPORTUNITY SUMMARY
==================================================

At the top, show compact summary metrics:

Active Opportunities
6

High Confidence
2

Under Investigation
3

New Today
4

Average Confidence
71%

Do not overuse large cards.

These should look like trading-terminal metrics.

==================================================
6. OPPORTUNITY RADAR
==================================================

Create a primary visual section:

"Opportunity Radar"

This should be the main visual identity of the page.

Possible implementation:

A compact radar/grid visualization showing:

BTC/USDT
ETH/USDT

and opportunity strength.

However, do NOT create a decorative visualization without useful information.

Each opportunity should communicate:

- symbol
- direction
- confidence
- timeframe
- setup
- status

Example:

BTC/USDT
LONG
78%
1H
Breakout Continuation

ETH/USDT
LONG
71%
4H
Trend Continuation

BTC/USDT
SHORT
54%
15M
Mean Reversion

The visualization can be a structured grid/list if a radar visualization would reduce usability.

Prioritize information over decoration.

==================================================
7. OPPORTUNITY TABLE
==================================================

Create a professional opportunity table.

Columns:

Asset
Direction
Setup
Timeframe
Confidence
Market Regime
Risk State
Detected
Status

Example:

BTC/USDT
LONG
Breakout Continuation
1H
78%
Trending
Normal
2m ago
Investigating

ETH/USDT
LONG
Trend Continuation
4H
71%
Trending
Normal
8m ago
Monitoring

BTC/USDT
SHORT
Mean Reversion
15M
54%
Range
Elevated
12m ago
Weak

Use:

- PositionSide
- ConfidenceIndicator
- RiskBadge
- StatusIndicator

from the existing design system whenever possible.

Rows should be clickable.

==================================================
8. OPPORTUNITY DETAIL
==================================================

When an opportunity is selected, show a detail panel.

Use a right-side drawer or dedicated detail section.

Do not navigate to Trade Proposal.

Opportunity detail should include:

--------------------------------
BTC/USDT
Potential Long
78% Confidence
--------------------------------

Setup:

Breakout Continuation

Timeframe:

1H

Market Regime:

Trending

Detected:

12:42:18

Status:

Investigating

--------------------------------
SUPPORTING EVIDENCE
--------------------------------

Technical:
- Price above 20 EMA
- Higher-high structure
- Momentum positive
- Volume above average

Market:
- BTC trend strength increasing
- ETH correlation elevated

--------------------------------
CONTRADICTING EVIDENCE
--------------------------------

- Volatility elevated
- Resistance zone nearby

--------------------------------
HERMES ASSESSMENT
--------------------------------

"Structure remains favorable, but Hermes is waiting for confirmation
before considering a trade setup."

--------------------------------

Confidence:
78%

Risk:
Moderate

==================================================
9. EVIDENCE VISUALIZATION
==================================================

Opportunity detection should be evidence-driven.

Create an Evidence section.

Group evidence into:

Technical
Market
Momentum
Volatility
Volume
Sentiment
Risk

Not every opportunity needs every category.

Each evidence item should contain:

- signal
- value
- interpretation
- positive / neutral / negative state

Example:

Technical

EMA Structure
Bullish
Positive

Volume
+18% vs average
Positive

Volatility
Elevated
Warning

RSI
61
Neutral

Do not expose hidden chain-of-thought.

Only show observable signals and concise interpretations.

==================================================
10. CONFIDENCE
==================================================

Create a reusable OpportunityConfidence component.

Confidence should be visually understandable.

Example:

78%

High Confidence

Use confidence bands:

0–49
Low

50–69
Moderate

70–84
High

85–100
Very High

Do not imply that confidence means probability of profit.

Label it clearly as:

"Model / system confidence"

or:

"Opportunity confidence"

==================================================
11. OPPORTUNITY STATUS
==================================================

Support these states:

New
Monitoring
Investigating
Confirmed
Weakening
Expired

For this frontend task, use mock data.

Example:

BTC/USDT
Investigating

ETH/USDT
Monitoring

BTC/USDT
Weakening

Expired opportunities should remain visible through filters/history,
but should not dominate the default view.

==================================================
12. HERMES CONNECTION
==================================================

Make the relationship between Opportunities and Hermes obvious.

Add a compact Hermes panel:

Hermes

Opportunity Monitoring

Scanning BTC and ETH for qualifying setups.

Last scan:
18 seconds ago

Markets scanned:
2

Potential setups:
6

Use the Hermes visual identity created in Task 05.

Do not create another Hermes design.

Reuse:

HermesCore
HermesStatus
HermesStateBadge

where appropriate.

==================================================
13. OPPORTUNITY LIFECYCLE
==================================================

Show the opportunity lifecycle visually:

Detected
↓
Monitoring
↓
Investigating
↓
Confirmed
↓
Trade Proposal

The final "Trade Proposal" step should be visually present but NOT implemented.

This establishes the architecture for Task 07.

An opportunity must NOT automatically become a trade.

==================================================
14. FILTERING
==================================================

Implement frontend filtering using mock data.

Filters:

Market:
- All
- BTC/USDT
- ETH/USDT

Direction:
- All
- Long
- Short

Timeframe:
- All
- 15M
- 1H
- 4H
- 1D

Confidence:
- All
- High
- Medium
- Low

Status:
- All
- New
- Monitoring
- Investigating
- Confirmed
- Weakening
- Expired

Strategy:

- All
- Breakout Continuation
- Trend Continuation
- Mean Reversion
- Momentum

Filtering should update the opportunity table.

==================================================
15. SORTING
==================================================

Allow sorting by:

- Confidence
- Detection time
- Risk
- Asset

Default:

Highest-confidence active opportunities first.

==================================================
16. OPPORTUNITY SEARCH
==================================================

Add search.

Search by:

- symbol
- strategy
- setup

Example:

Search opportunities...

Typing:

BTC

should show BTC-related opportunities.

==================================================
17. MARKET CONTEXT
==================================================

For the selected opportunity, provide compact market context:

Current Price
24h Change
Market Regime
Timeframe
Volume State
Volatility State

If appropriate, include a very small chart preview.

Reuse the TradingView Lightweight Charts infrastructure from Task 04.

Do NOT build another chart system.

If chart preview adds unnecessary complexity, use a compact market-context visualization instead.

==================================================
18. MOCK DATA
==================================================

Create centralized deterministic mock data.

Suggested:

opportunityMockData

Each opportunity should contain:

id
symbol
direction
setup
strategy
timeframe
confidence
marketRegime
riskState
detectedAt
status
supportingEvidence
contradictingEvidence
hermesAssessment
price
change24h
volumeState
volatilityState

Create at least:

6–10 realistic opportunities.

Example distribution:

BTC/USDT:
- Long / high confidence
- Long / moderate confidence
- Short / low confidence

ETH/USDT:
- Long / high confidence
- Long / moderate confidence
- Short / moderate confidence

Make the values internally consistent.

Do NOT use random data that changes on every render.

==================================================
19. INTERACTION
==================================================

Implement:

- filters
- search
- sorting
- selecting an opportunity
- opening detail drawer/panel
- closing detail panel
- market navigation
- Hermes navigation

Market navigation:

/markets

Hermes navigation:

/hermes

Do NOT implement:

- actual trade execution
- approval
- order placement

==================================================
20. TRADE PROPOSAL BOUNDARY
==================================================

IMPORTANT.

Do not turn the opportunity detail page into a trade proposal page.

The UI may show:

"Potential next step:
Trade Proposal"

But it must remain clearly separate.

Example:

Opportunity confirmed.

Next stage:
Hermes may generate a Trade Proposal.

[ View Proposal ]

If the button is included, it may be disabled or show:

"Proposal generation not implemented yet."

Task 07 will implement this.

==================================================
21. EMPTY STATES
==================================================

Create good empty states.

Example:

No opportunities found.

"Hermes currently has no setups matching your filters."

Actions:

Clear Filters

Another state:

No active opportunities.

"Hermes is monitoring the market for qualifying setups."

==================================================
22. LOADING / ERROR STATES
==================================================

Use existing shared:

LoadingState
ErrorState
EmptyState

Mock the states if necessary.

Do not implement fake network calls just to create loading.

==================================================
23. RESPONSIVE DESIGN
==================================================

Desktop-first.

Desktop:

------------------------------------------------
| Header / Filters                             |
------------------------------------------------
| Summary Metrics                              |
------------------------------------------------
| Opportunity Radar                           |
------------------------------------------------
| Opportunity Table                            |
------------------------------------------------
| Selected Opportunity Detail                  |
------------------------------------------------

For desktop, a selected opportunity may use:

Main content
+
right-side detail drawer

Tablet:

- reduce table columns
- use compact rows

Mobile:

- cards instead of wide table
- filters become horizontally scrollable or collapsible
- detail becomes full-screen/modal
- no horizontal overflow

==================================================
24. REUSABLE COMPONENTS
==================================================

Create only useful reusable components.

Suggested:

OpportunityCard
OpportunityTable
OpportunityRow
OpportunityDetail
OpportunityEvidence
OpportunityConfidence
OpportunityStatus
OpportunityFilters
OpportunityRadar
OpportunitySummary
OpportunitySearch
OpportunityLifecycle

Reuse existing components whenever possible.

==================================================
25. DATA ARCHITECTURE
==================================================

Keep mock data separate from UI.

Example:

mock/
  opportunities.ts

or follow the project's existing structure.

Components should consume typed opportunity objects.

Make it easy to replace mock data with future API data.

Do not couple UI components to hardcoded strings where avoidable.

==================================================
26. TECHNICAL CONSTRAINTS
==================================================

Reuse the existing project architecture.

Reuse:

- App Shell
- Design tokens
- typography
- shared cards
- buttons
- badges
- tables
- status indicators
- metrics
- Hermes components
- chart components

Do not introduce another UI framework.

Do not replace the existing design system.

Do not implement backend services.

Do not add external APIs.

==================================================
27. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- Binance
- CCXT
- Redis
- TimescaleDB
- WebSockets
- real market data
- real AI
- real Hermes backend
- real opportunity scanner
- real strategy engine
- real risk engine
- trade execution
- trade approval
- real portfolio
- Task 07 Trade Proposal system

Use deterministic frontend mock data only.

==================================================
28. ACCEPTANCE CRITERIA
==================================================

Task 06 is complete when:

1. /opportunities works.

2. Page clearly represents AI-detected trading opportunities.

3. Opportunity summary metrics work.

4. Opportunity radar/overview works.

5. Opportunity table works.

6. Opportunities can be selected.

7. Opportunity detail works.

8. Supporting evidence is visible.

9. Contradicting evidence is visible.

10. Hermes assessment is visible.

11. Confidence is clearly represented.

12. Opportunity status is visible.

13. Filters work.

14. Search works.

15. Sorting works.

16. Market navigation works.

17. Hermes navigation works.

18. Opportunity lifecycle is visible.

19. Trade Proposal remains a separate future stage.

20. Mock data is centralized and deterministic.

21. Existing design system is reused.

22. Responsive layout works.

23. No backend/API integration is introduced.

24. No existing Tasks 01–05 functionality is broken.

25. No TypeScript, lint, or build errors.

==================================================
29. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /opportunities.
- Test every filter.
- Test search.
- Test sorting.
- Select multiple opportunities.
- Open and close detail.
- Test navigation to /markets.
- Test navigation to /hermes.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify green/red/cyan semantic usage.
- Verify confidence is not represented as guaranteed profitability.
- Verify no hidden chain-of-thought is displayed.
- Verify no real trading behavior exists.
- Verify Tasks 01–05 remain functional.

STOP after completing Task 06.

Do NOT implement Task 07.