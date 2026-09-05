TASK 05 — HERMES & AI INTELLIGENCE

You are implementing Task 05 of an AI Trading Intelligence Platform called AGI Trading.

IMPORTANT:
Tasks 01–04 are already implemented:
- Task 01: App Shell
- Task 02: Design System + Shared Components
- Task 03: Overview
- Task 04: Markets + TradingView Lightweight Charts

Build ONLY Task 05.

Do not redesign or rewrite Tasks 01–04 unless required for integration.

==================================================
1. PRODUCT CONTEXT
==================================================

This is a private, single-user AI trading intelligence platform.

Hermes is the MAIN TRADING AGENT.

Hermes is not simply a chatbot.

Hermes continuously:
- monitors markets
- investigates opportunities
- analyzes market conditions
- consumes market/intelligence information
- evaluates trading opportunities
- produces structured trade proposals
- communicates operational status
- eventually interacts with deterministic risk controls and execution systems

For this frontend task, backend/AI integration does NOT exist yet.

Therefore:
- Use deterministic mock data.
- Do NOT connect to Binance.
- Do NOT implement real AI.
- Do NOT implement WebSockets.
- Do NOT implement CCXT.
- Do NOT implement Redis.
- Do NOT implement TimescaleDB.
- Do NOT implement real trading execution.
- Do NOT implement real risk validation.

The goal is to establish the frontend identity and interaction model of Hermes.

==================================================
2. DESIGN GOAL
==================================================

Hermes should feel like:

"An intelligent trading system that is actively operating."

NOT:

"A ChatGPT clone with a trading theme."

The UI should communicate:
- awareness
- continuous monitoring
- investigation
- intelligence
- evidence
- confidence
- operational state
- trading context

Use the existing design system:

Theme:
Obsidian Intelligence

Visual personality:
- precise
- calm
- intelligent
- technical
- trustworthy
- information-dense

Target visual balance:
80% professional trading terminal
20% futuristic AI command center

Avoid:
- crypto-bro aesthetics
- excessive neon
- gaming UI
- cartoon robots
- anime
- decorative sci-fi
- huge glowing effects
- excessive glassmorphism
- generic chatbot UI

==================================================
3. HERMES IDENTITY
==================================================

Create a strong visual identity for Hermes.

Hermes should have a subtle digital intelligence representation.

Possible visual:
- small intelligence core
- abstract orb
- geometric neural core
- animated circular signal
- minimal digital entity

Do NOT create:
- human face
- cartoon robot
- mascot
- anime character

The representation should feel like an advanced autonomous intelligence system.

Use cyan as Hermes' intelligence color.

Remember:
Cyan = AI / intelligence / active state.

Do NOT use cyan to represent profit.

Financial semantic colors remain:
- green = positive / long
- red = negative / short
- amber = warning / risk
- gray = neutral
- blue = information

==================================================
4. ROUTE
==================================================

Implement:

/hermes

The page should work inside the existing App Shell.

Use the existing sidebar/navigation from Task 01.

The Hermes navigation item should become active when visiting /hermes.

==================================================
5. PAGE STRUCTURE
==================================================

Design the Hermes page as an AI command center.

Suggested structure:

--------------------------------------------------
HEADER
--------------------------------------------------

Title:
Hermes

Subtitle:
Main Trading Agent

Right side:
- Environment badge: PAPER
- Hermes status
- Last activity timestamp

Example:

Hermes
Main Trading Agent

[ PAPER ]   [ ● Monitoring ]   Updated 12 sec ago

--------------------------------------------------
HERMES STATUS / HERO
--------------------------------------------------

Create a strong but compact Hermes identity section.

Include:

Hermes intelligence core

State:
MONITORING

Example text:

"Monitoring BTC and ETH market conditions."

Show:
- Current state
- Current focus
- Active timeframe
- Last activity
- Intelligence status

Example:

STATUS
Monitoring

FOCUS
BTC/USDT

TIMEFRAME
1H

LAST ACTION
Market structure analysis

The status should visually change depending on mock state.

==================================================
6. HERMES STATE MACHINE
==================================================

Create reusable UI for Hermes operational states.

Supported states:

- Monitoring
- Analyzing
- Researching
- Opportunity Detected
- Proposal Ready
- Awaiting Approval
- Executing
- Completed

For this task, mock the current state as:

Monitoring

But build the component so other states can easily be used later.

Each state should have:
- label
- icon
- status indicator
- subtle animation when active
- supporting description

Do NOT make the animation distracting.

==================================================
7. INTELLIGENCE ACTIVITY TIMELINE
==================================================

Create an "Intelligence Activity" timeline.

This is NOT hidden chain-of-thought.

Do NOT expose private/internal reasoning.

Only display operational events and concise summaries.

Example events:

12:42:08
Market data updated
BTC/USDT 1H candle closed

12:42:10
Technical analysis
Market structure remains bullish

12:42:14
Volatility assessment
Volatility increased above recent average

12:42:18
Opportunity scan
No high-confidence setup detected

12:42:22
Hermes
Continuing BTC/ETH monitoring

Each event should have:
- timestamp
- event type
- concise description
- optional symbol
- status/icon

Use a vertical timeline.

Make it feel like Hermes is actively operating.

==================================================
8. CURRENT INVESTIGATION
==================================================

Create a "Current Investigation" panel.

Example:

Current Investigation

BTC/USDT

Market Structure
Bullish

Momentum
Moderate

Volatility
Elevated

Volume
Above average

Regime
Trending

Timeframe
1H

Confidence
72%

Then include:

Hermes assessment

"BTC remains structurally bullish, but elevated volatility reduces setup quality. Hermes is monitoring for confirmation before considering a trade."

Important:

This is a concise operational assessment.

Do NOT generate or display hidden chain-of-thought.

==================================================
9. EVIDENCE PANEL
==================================================

Create an "Evidence" section.

Hermes should communicate that its decisions are based on observable evidence.

Example categories:

Technical
- Price above 20 EMA
- Higher high structure
- RSI 61
- Volume +18% vs average

Market
- BTC dominance stable
- ETH correlation elevated

Risk
- Volatility elevated
- Current drawdown within limits

Each evidence item should include:
- category
- signal
- value/status
- positive/neutral/negative indicator

Use compact cards or rows.

==================================================
10. MARKET FOCUS
==================================================

Create a compact market focus panel.

Show:

BTC/USDT
$67,842
+1.82%

ETH/USDT
$3,421
+1.14%

For each:
- price
- 24h change
- Hermes attention level

Example:

BTC
High attention

ETH
Normal attention

Clicking a market should navigate to:

/markets

and select the corresponding symbol if the existing Markets implementation supports it.

If symbol selection is not yet exposed through routing, simply navigate to /markets.

==================================================
11. AI TOOL ACTIVITY
==================================================

Create a panel called:

"Tool Activity"

This represents tools Hermes is using.

Mock examples:

Market Data
Completed

Technical Analysis
Completed

Volatility Analysis
Completed

Opportunity Scanner
Running

Risk Engine
Waiting

This should visually communicate:

Hermes
↓
Tools
↓
Evidence
↓
Evaluation
↓
Trade Proposal

But do not implement backend logic.

Use mocked states.

==================================================
12. SPECIALIST AGENT TEAM
==================================================

The PRD describes Hermes as the main trading agent while the system can involve specialized analytical capabilities.

Create a compact "Agent Team" section.

Example:

Hermes
Main Trading Agent
● Active

Quant Analyst
Technical / quantitative analysis
● Active

Market Intelligence
News / social intelligence
● Monitoring

Risk Analyst
Risk validation
● Ready

Important:

These are UI representations only.

Do not implement actual multi-agent orchestration.

The purpose is to establish the future information architecture.

==================================================
13. MEMORY / CONTEXT
==================================================

Create a small "Memory & Context" panel.

Example:

Recent Context

BTC bullish structure observed across
1H and 4H.

Previous related setup:
BTC breakout continuation

Historical confidence:
74%

Last reviewed:
Today, 12:31

This should communicate that Hermes has persistent context/memory.

Do NOT create a full memory database.

Mock only.

==================================================
14. OPPORTUNITY PREVIEW
==================================================

Create a compact "Opportunity Watch" section.

Example:

BTC/USDT

Potential Long

Setup:
Breakout continuation

Confidence:
78%

Status:
Monitoring

ETH/USDT

No active setup

Confidence:
43%

Status:
Monitoring

Include a button:

View Opportunities

Navigate to:

/opportunities

This is only a preview.

Do not implement actual opportunity detection.

==================================================
15. TRADE PROPOSAL PREVIEW
==================================================

Include a conditional panel showing what Hermes would produce when a proposal becomes ready.

Use mock state:

No active proposal

Then show a subtle empty state:

"Trade proposals appear here when Hermes identifies a validated opportunity."

Include:

Evidence → Strategy → Risk → Decision

Do not implement actual proposal approval yet.

That belongs to Task 07.

==================================================
16. HERMES COMMAND INPUT
==================================================

Add a small command/input area.

This should NOT behave like a normal ChatGPT conversation.

Design it as:

"Ask Hermes about the current market..."

Example commands:

"Why is BTC being monitored?"
"Show current opportunities"
"Explain current market regime"

The input can be visually functional but does not need a real AI response.

When submitted:
- add a mock response
OR
- show a mocked "Hermes is analyzing..." state.

Do NOT connect to an LLM.

Do NOT build a full chatbot system.

==================================================
17. HERMES CHARACTER / VISUAL CORE
==================================================

Create a reusable HermesCore component.

Possible API:

<HermesCore
  state="monitoring"
  size="large"
/>

Supported states:

monitoring
analyzing
researching
opportunity
proposal
approval
executing
completed

Visual behavior:

Monitoring:
slow subtle pulse

Analyzing:
slightly faster pulse

Researching:
small rotating signal

Opportunity:
stronger but controlled cyan emphasis

Proposal:
stable highlighted state

Approval:
attention state

Executing:
active signal

Completed:
calm completed state

Keep effects subtle and professional.

==================================================
18. REUSABLE COMPONENTS
==================================================

Create reusable Hermes-specific components where appropriate.

Suggested:

HermesCore
HermesStatus
HermesStateBadge
HermesActivityTimeline
HermesActivityItem
HermesInvestigation
HermesEvidence
HermesToolActivity
HermesAgentTeam
HermesMemory
HermesOpportunityPreview
HermesProposalPreview
HermesCommandInput

Do not create unnecessary abstractions.

Follow the existing project architecture and component conventions.

==================================================
19. MOCK DATA
==================================================

Create centralized deterministic mock data.

Example structure:

hermesMockData

Include:

currentState
currentFocus
currentTimeframe
lastActivity
activityTimeline
investigation
evidence
markets
tools
agents
memory
opportunities
proposal

Do NOT scatter mock data throughout components.

Make it easy to replace with API data later.

==================================================
20. INTERACTION
==================================================

Implement useful frontend interactions:

- Hermes state visualization
- Activity timeline
- Market focus navigation
- Opportunity navigation
- Command input interaction
- Tool status visualization
- Agent status visualization
- Responsive panels
- Hover states
- Tooltips where useful

No backend integration.

==================================================
21. RESPONSIVE DESIGN
==================================================

Desktop-first.

The main desktop layout should feel like a professional AI trading workstation.

Suggested:

Desktop:

------------------------------------------------
| Hermes Header                                |
------------------------------------------------
| Hermes Core | Current Investigation          |
------------------------------------------------
| Activity Timeline | Evidence                 |
------------------------------------------------
| Tool Activity | Agent Team | Memory          |
------------------------------------------------
| Opportunities | Proposal Preview             |
------------------------------------------------
| Hermes Command Input                         |
------------------------------------------------

Tablet:
- reduce columns
- preserve hierarchy

Mobile:
- single column
- preserve Hermes identity
- preserve current state
- stack intelligence panels
- avoid horizontal overflow

==================================================
22. VISUAL QUALITY
==================================================

Use:

- dark Obsidian background
- subtle borders
- compact cards
- high information density
- restrained cyan highlights
- monospace numbers where appropriate
- clear hierarchy
- subtle motion

Do not over-design.

Hermes should feel like software used by a serious quantitative trader.

Think:

Bloomberg Terminal
+
modern AI command center
+
professional trading dashboard

NOT:

AI chatbot
NOT:
crypto casino
NOT:
gaming dashboard

==================================================
23. IMPORTANT DESIGN PRINCIPLE
==================================================

Hermes should always communicate:

WHAT IS IT DOING?
WHAT IS IT WATCHING?
WHAT DID IT OBSERVE?
WHAT IS THE CURRENT MARKET CONTEXT?
WHAT IS THE CURRENT STATE?
IS THERE AN OPPORTUNITY?
IS THERE A PROPOSAL?
IS ACTION REQUIRED?

But it should NOT expose private chain-of-thought.

Use:
- concise observations
- evidence
- operational events
- structured assessments
- confidence
- state
- decisions/status

==================================================
24. TECHNICAL CONSTRAINTS
==================================================

Reuse:
- existing App Shell
- existing design tokens
- existing typography
- existing Button
- existing Card/Surface
- existing Badge
- existing StatusIndicator
- existing Metric
- existing EmptyState
- existing layout utilities
- existing chart infrastructure where appropriate

Do not introduce another UI framework.

Do not replace the existing design system.

Do not modify global styles unnecessarily.

Keep components maintainable.

Use TypeScript if the project already uses TypeScript.

Follow existing linting and formatting.

==================================================
25. DO NOT IMPLEMENT
==================================================

Explicitly do NOT implement:

- Binance API
- Binance WebSocket
- CCXT
- Redis
- TimescaleDB
- real LLM
- Hermes backend
- agent orchestration
- real news APIs
- real social APIs
- real risk engine
- real execution
- real trade approval
- real portfolio data
- authentication
- billing
- multi-tenancy

Everything should be frontend + deterministic mock data.

==================================================
26. ACCEPTANCE CRITERIA
==================================================

Task 05 is complete when:

1. /hermes works.

2. Hermes clearly feels like the main intelligence of the application.

3. Hermes has a strong visual identity.

4. Hermes operational states are represented.

5. Current state is visible.

6. Current market focus is visible.

7. Intelligence Activity timeline works.

8. Current Investigation panel works.

9. Evidence panel works.

10. Tool Activity works.

11. Agent Team works.

12. Memory/Context works.

13. Opportunity preview works.

14. Trade Proposal preview exists.

15. Hermes command input works with mock interaction.

16. HermesCore is reusable.

17. Mock data is centralized.

18. Existing design system is reused.

19. No backend/API integration is introduced.

20. No TypeScript/lint/build errors.

21. Desktop layout feels like a professional AI trading command center.

22. Mobile layout does not break.

==================================================
27. FINAL CHECK
==================================================

Before finishing:

- Run the application.
- Visit /hermes.
- Verify navigation.
- Verify all major panels.
- Test responsive layout.
- Test command input.
- Test market/opportunity navigation.
- Verify Hermes animations are subtle.
- Verify cyan is reserved for AI/intelligence states.
- Verify green/red remain financial semantic colors.
- Verify there is no fake real-time data claim.
- Verify no backend integration was added.
- Verify no existing Tasks 01–04 functionality was broken.

Do not implement Task 06 or later.

STOP after completing Task 05.