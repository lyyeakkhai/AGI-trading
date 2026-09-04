TASK 13 — ACTIVITY & AUDIT

You are implementing Task 13 of the AGI Trading platform.

Tasks 01–12 are already implemented:

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
12 Analytics

Build ONLY Task 13.

Do not redesign or rewrite previous tasks unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

AGI Trading is a private, single-user AI-assisted trading platform.

The system contains:

Hermes
→ Opportunities
→ Investigations
→ Trade Proposals
→ Risk Validation
→ Owner Approval
→ Execution
→ Positions
→ Analytics

The Activity & Audit workspace provides a chronological,
system-level record of what happened.

The goal is:

"Show me exactly what the system did, when it happened,
what component produced the event, and what the resulting state was."

This is NOT a chat history.

This is NOT Hermes chain-of-thought.

This is NOT a generic notification center.

It is an operational activity and audit interface.

==================================================
2. ROUTE
==================================================

Create:

/activity

Optional:

/activity/:id

The primary experience should remain under:

/activity

==================================================
3. CORE QUESTIONS
==================================================

The Activity page must answer:

- What happened?
- When did it happen?
- Which component caused it?
- What object was affected?
- What was the previous state?
- What is the resulting state?
- Was the action successful?
- Was owner approval required?
- Was a risk check involved?
- Was the action paper or live?
- Can I navigate to the related object?

==================================================
4. DESIGN DIRECTION
==================================================

Use:

OBSIDIAN INTELLIGENCE

The page should feel like:

Trading system control log
+
Operational audit trail

Personality:

- precise
- technical
- calm
- trustworthy
- dense
- inspectable

Avoid:

- social media timeline
- generic notification UI
- excessive animations
- decorative activity cards
- noisy colors

Semantic colors:

Green = success
Red = failure/rejection
Amber = warning
Cyan = AI/system
Gray = neutral

==================================================
5. PAGE HEADER
==================================================

Header:

Activity & Audit

Subtitle:

System events, trading decisions, risk checks, and operational history.

Controls:

[ PAPER ]

[ Date Range ]

[ Filters ]

Example:

Activity & Audit
System events, trading decisions, risk checks, and operational history.

System Status:
Operational

==================================================
6. ACTIVITY SUMMARY
==================================================

Create compact metrics:

Events Today
42

Trading Events
18

Risk Decisions
11

Hermes Events
27

Warnings
2

Errors
0

These are deterministic mock values.

==================================================
7. ACTIVITY TIMELINE
==================================================

Create the main activity timeline.

Example:

09:42:18

RISK VALIDATION

PROP-042

Risk validation passed.

Portfolio risk:
1.8% → 2.6%

Result:
APPROVED

--------------------------------------------------

09:41:52

HERMES

OPP-118

Opportunity investigation completed.

Result:
Proposal candidate identified.

--------------------------------------------------

09:40:21

TRADE PROPOSAL

PROP-042

BTC/USDT LONG

Proposal created.

Risk:
0.8%

R:R:
2.4R

--------------------------------------------------

09:39:03

MARKET DATA

BTC/USDT

Market regime updated.

Previous:
RANGING

Current:
TRENDING

--------------------------------------------------

09:37:44

STRATEGY

STRAT-001

Strategy version v1.3 selected.

Each event should show:

Timestamp
Event type
Source
Object
Summary
Status

==================================================
8. EVENT TYPES
==================================================

Support:

MARKET

HERMES

OPPORTUNITY

STRATEGY

BACKTEST

TRADE_PROPOSAL

RISK

APPROVAL

EXECUTION

POSITION

PORTFOLIO

SYSTEM

SECURITY

ERROR

==================================================
9. EVENT SOURCES
==================================================

Possible sources:

Hermes

Market Data

Risk Engine

Strategy Engine

Backtest Engine

Execution Service

Portfolio

Owner

System

For frontend mock data, these are labels only.

==================================================
10. EVENT DETAIL
==================================================

Selecting an event should open a detail panel or page.

Example:

Event

EVT-009182

Risk Validation

Timestamp:
2026-09-04 09:42:18

Source:
Risk Engine

Object:
PROP-042

Environment:
PAPER

Status:
SUCCESS

Summary:
Risk validation passed.

Details:

Portfolio Risk Before:
1.8%

Requested Risk:
0.8%

Portfolio Risk After:
2.6%

Maximum Allowed:
5.0%

Decision:
APPROVED

Related:

Strategy:
STRAT-001

Backtest:
BT-0042

Opportunity:
OPP-118

Trade Proposal:
PROP-042

Provide navigation links.

==================================================
11. EVENT METADATA
==================================================

Show structured metadata where useful:

Event ID

Timestamp

Environment

Source

Event Type

Object Type

Object ID

Status

Correlation ID

Example:

Event ID:
EVT-009182

Correlation ID:
FLOW-0042

Environment:
PAPER

This establishes future auditability.

==================================================
12. EVENT STATUS
==================================================

Support:

INFO

SUCCESS

WARNING

FAILED

REJECTED

CANCELLED

Use existing Badge/Status components.

==================================================
13. FILTERS
==================================================

Create filters:

Event Type

Source

Status

Environment

Date Range

Object Type

Example:

Event Type:
All

Source:
All

Status:
All

Environment:
PAPER

==================================================
14. ENVIRONMENT FILTER
==================================================

Support:

ALL

DEVELOPMENT

PAPER

LIVE

IMPORTANT:

For MVP mock data:

Most events should be PAPER.

Include only a small number of historical LIVE examples if useful.

Never imply that live trading is currently active.

If no live events:

"No live activity recorded."

==================================================
15. SEARCH
==================================================

Add:

Search activity...

Search by:

- event ID
- object ID
- symbol
- strategy
- proposal ID
- source
- summary

==================================================
16. DATE FILTER
==================================================

Support:

Today

7 Days

30 Days

All Time

Custom

Default:

Today

==================================================
17. EVENT GROUPING
==================================================

Allow grouping by:

Day

Event Type

Object

Default:

Day

Example:

TODAY

09:42 Risk validation passed
09:41 Hermes investigation completed
09:40 Trade proposal created

YESTERDAY

18:21 Backtest completed
17:53 Strategy version created

==================================================
18. CORRELATION / TRACE
==================================================

One of the most important features:

Allow related events to be traced together.

Example:

FLOW-0042

Opportunity Detected
↓
Investigation Started
↓
Evidence Updated
↓
Trade Proposal Created
↓
Risk Validation
↓
Owner Approval
↓
Paper Execution
↓
Position Opened

Provide:

[ View Flow ]

This should open a trace/timeline view.

IMPORTANT:

This is not a chain-of-thought viewer.

It shows operational state transitions only.

==================================================
19. TRADING FLOW TRACE
==================================================

Create a compact flow detail:

FLOW-0042

BTC/USDT LONG

Opportunity:
Detected

Investigation:
Completed

Proposal:
Created

Risk:
Approved

Owner:
Approved

Execution:
Paper Filled

Position:
OPEN

Each stage:

timestamp
status
related object

==================================================
20. HERMES ACTIVITY
==================================================

Hermes events may include:

Monitoring started

Market condition changed

Opportunity detected

Investigation started

Research completed

Proposal generated

Risk state observed

Position monitoring updated

Do NOT display:

- hidden reasoning
- chain-of-thought
- internal token-level reasoning
- private model deliberation

Only show concise operational summaries.

==================================================
21. SYSTEM ACTIVITY
==================================================

Include system events:

Application started

Market data connection established

Market data connection lost

Backtest completed

Database synchronization completed

Risk configuration loaded

Paper trading session started

Configuration changed

For mock UI only.

==================================================
22. SECURITY ACTIVITY
==================================================

Create:

Security Activity

Examples:

API credentials configuration changed

Trading mode changed

Paper trading enabled

Live trading disabled

Session authenticated

IMPORTANT:

Never display:

- API keys
- API secrets
- passwords
- access tokens
- private credentials

Use masked references only if necessary.

Example:

Credential:
Production Binance key
Status:
Configured

Never show the actual key.

==================================================
23. OWNER ACTIONS
==================================================

Show owner actions clearly.

Examples:

Owner approved PROP-042

Owner rejected PROP-039

Owner changed trading mode

Owner opened risk review

Owner cancelled proposal

Owner created strategy version

Use:

Source:
Owner

==================================================
24. EXECUTION EVENTS
==================================================

Create mock execution events.

Example:

EXECUTION

PROP-042

Paper order submitted.

Symbol:
BTC/USDT

Side:
LONG

Quantity:
0.042 BTC

Status:
FILLED

Execution Price:
$114,120

Mode:
PAPER

IMPORTANT:

Do not connect to Binance.

Do not execute real orders.

==================================================
25. POSITION EVENTS
==================================================

Examples:

Position opened

Stop updated

Target reached

Position partially closed

Position closed

P&L updated

Example:

POSITION

BTC/USDT

Position closed.

Entry:
$112,400

Exit:
$114,180

Net P&L:
+$74

Mode:
PAPER

==================================================
26. ERROR EVENTS
==================================================

Create error examples.

Example:

ERROR

Market Data

BTC/USDT stream disconnected.

Status:
FAILED

Recovery:
Connection restored after 4.2 seconds.

Keep errors useful and concise.

==================================================
27. AUDIT TABLE VIEW
==================================================

In addition to timeline, provide:

[ Timeline ] [ Table ]

Table columns:

Time
Type
Source
Object
Environment
Status
Summary

Example:

09:42
RISK
Risk Engine
PROP-042
PAPER
SUCCESS
Validation passed

09:41
HERMES
Hermes
OPP-118
PAPER
SUCCESS
Investigation completed

Allow switching between:

Timeline

and

Table

==================================================
28. TABLE SORTING
==================================================

Support sorting by:

Timestamp

Event Type

Source

Status

Object

Default:

Newest first.

==================================================
29. EVENT DETAIL NAVIGATION
==================================================

From an event:

Opportunity
→ /opportunities

Trade Proposal
→ /trade-proposals

Position
→ /positions

Strategy
→ /strategies

Backtest
→ /backtests

Risk
→ /risk

Hermes
→ /hermes

==================================================
30. REAL-TIME INDICATOR
==================================================

At the top of the activity page show:

Activity Stream

● Monitoring

For frontend only.

Do not implement real WebSocket activity.

You may simulate a subtle "new event" indicator locally.

Do NOT continuously generate random events.

==================================================
31. MOCK DATA
==================================================

Create centralized deterministic mock data.

Example:

activityEventsMock

Each event should contain:

id
timestamp
type
source
status
environment
objectType
objectId
symbol
summary
details
correlationId
relatedObjects

Create at least 30 events.

Include:

- Hermes
- opportunities
- proposals
- risk
- owner approval
- paper execution
- positions
- strategies
- backtests
- system
- errors
- security

Make timestamps deterministic.

==================================================
32. DATA RELATIONSHIPS
==================================================

Maintain traceability:

Strategy
→ Backtest
→ Opportunity
→ Investigation
→ Trade Proposal
→ Risk
→ Owner Approval
→ Execution
→ Position

Example:

strategyId:
STRAT-001

backtestId:
BT-0042

opportunityId:
OPP-118

proposalId:
PROP-042

positionId:
POS-017

correlationId:
FLOW-0042

==================================================
33. COMPONENTS
==================================================

Create reusable components where useful:

ActivityHeader
ActivitySummary
ActivityFilters
ActivityTimeline
ActivityEvent
ActivityEventDetail
ActivityTable
ActivityTrace
FlowTrace
EventTypeBadge
EventStatusBadge
EventMetadata
RelatedObjects
SecurityActivity
SystemActivity

Reuse existing components.

Do not over-abstract.

==================================================
34. RESPONSIVE DESIGN
==================================================

Desktop:

------------------------------------------------
| Activity & Audit              PAPER          |
------------------------------------------------
| Summary Metrics                              |
------------------------------------------------
| Filters / Search                             |
------------------------------------------------
| Timeline / Table                             |
------------------------------------------------
| Event Detail                                 |
------------------------------------------------

Tablet:

- stack filters
- simplify table
- detail panel becomes full-width

Mobile:

- timeline-first
- compact event cards
- collapsible metadata
- horizontal scrolling only for dense tables
- no page-level horizontal overflow

==================================================
35. DESIGN RULES
==================================================

This page should feel operational.

Use:

- timestamps
- status
- event types
- IDs
- relationships
- structured metadata

Avoid:

- huge cards
- marketing language
- excessive color
- decorative AI graphics
- chat bubbles

==================================================
36. IMPORTANT AUDIT RULE
==================================================

Activity is NOT the same as Hermes memory.

Activity records:

"What happened."

Hermes memory represents:

"What the agent knows/contextually remembers."

Do not merge these concepts.

==================================================
37. IMPORTANT PRIVACY/SECURITY RULE
==================================================

Never display:

- API secrets
- API keys
- passwords
- tokens
- private credentials

Even mock examples should use safe placeholders.

==================================================
38. TECHNICAL CONSTRAINTS
==================================================

Use the existing project stack.

Reuse:

- routing
- design tokens
- existing components
- typography
- tables
- badges
- modal/detail patterns

Do not add:

- backend
- database
- WebSocket
- Binance
- CCXT
- Redis
- TimescaleDB
- real audit infrastructure

==================================================
39. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- real event streaming
- real audit database
- real security logging
- real execution logging
- real Binance events
- real WebSockets
- real Hermes telemetry
- chain-of-thought logging
- credential logging
- Task 14 Settings
- live trading integration

==================================================
40. ACCEPTANCE CRITERIA
==================================================

Task 13 is complete when:

1. /activity works.

2. Activity summary works.

3. Timeline works.

4. Table view works.

5. Event detail works.

6. Event metadata works.

7. Event statuses work.

8. Event type filters work.

9. Source filters work.

10. Status filters work.

11. Environment filters work.

12. Date filters work.

13. Search works.

14. Sorting works.

15. Day grouping works.

16. Correlation IDs are visible.

17. Flow trace works.

18. Related objects are navigable.

19. Hermes operational events are visible.

20. System events are visible.

21. Security events are represented safely.

22. Owner actions are visible.

23. Paper execution events are visible.

24. Position events are visible.

25. Error events are visible.

26. No hidden chain-of-thought is displayed.

27. No credentials or secrets are displayed.

28. Mock data is centralized.

29. Mock data is deterministic.

30. No real event infrastructure exists.

31. No real trading can happen.

32. Responsive layout works.

33. No page-level horizontal overflow.

34. Existing Tasks 01–12 remain functional.

35. No TypeScript/lint/build errors.

==================================================
41. FINAL VERIFICATION
==================================================

Before finishing:

- Run the application.
- Visit /activity.
- Test timeline.
- Test table view.
- Select events.
- Open event details.
- Test filters.
- Test search.
- Test sorting.
- Test date range.
- Test environment filtering.
- Test correlation/flow trace.
- Navigate to related objects.
- Verify Hermes activity.
- Verify risk events.
- Verify owner actions.
- Verify paper execution events.
- Verify error events.
- Verify security events contain no secrets.
- Verify no chain-of-thought is exposed.
- Test mobile layout.
- Verify no horizontal overflow.
- Verify Tasks 01–12 remain functional.
- Verify no build/lint/type errors.

STOP after completing Task 13.

Do NOT implement Task 14.