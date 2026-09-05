TASK 03 — OVERVIEW / AI TRADING COMMAND CENTER

You are implementing Task 03 of the AGI Trading frontend.

Task 01 — App Shell
Task 02 — Design System & Shared Components

have already been completed.

Your job is to implement ONLY the Overview page.

==================================================
OBJECTIVE
==================================================

Build the primary AGI Trading command center.

This is the first screen the owner sees after entering the application.

The Overview must NOT feel like a generic SaaS KPI dashboard.

It should feel like:

PROFESSIONAL TRADING TERMINAL
+
AI COMMAND CENTER
+
PORTFOLIO CONTROL CENTER

The user should immediately understand:

1. What is happening?
2. How is the portfolio performing?
3. What is the market doing?
4. What is Hermes doing?
5. Are there opportunities?
6. What positions are active?
7. Is there any risk or system problem?

==================================================
SOURCE OF TRUTH
==================================================

Use:

- Master Prompt
- PRD
- Scope
- DESIGN.md
- Visual reference
- Existing Task 01 App Shell
- Existing Task 02 Design System

Do not introduce a new visual language.

Do not invent major functionality outside the source material.

==================================================
PAGE STRUCTURE
==================================================

The page should have a clear information hierarchy.

Recommended structure:

HEADER
↓
PORTFOLIO / SYSTEM SUMMARY
↓
MAIN INTELLIGENCE AREA
↓
OPPORTUNITIES + POSITIONS
↓
RISK + ACTIVITY

Conceptually:

┌──────────────────────────────────────────────────────────┐
│ Overview                         PAPER · HERMES · ONLINE │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Portfolio        Available       Exposure       Risk     │
│ $XX,XXX          $XX,XXX         XX%            LOW      │
│ +X.XX%           ...             ...            ...      │
│                                                          │
├──────────────────────────────────────────┬───────────────┤
│                                          │               │
│       Portfolio / Market Overview        │    HERMES     │
│                                          │               │
│       Main visualization                 │   Intelligence │
│                                          │               │
├──────────────────────────────────────────┴───────────────┤
│                                                          │
│ Opportunities                    Active Positions        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Risk Status                       Recent Activity        │
│                                                          │
└──────────────────────────────────────────────────────────┘

This is a conceptual layout.

Adapt the exact proportions to the existing App Shell and screen size.

==================================================
1. PAGE HEADER
==================================================

Create:

Overview

Secondary context can show:

AI Trading Command Center

or a similarly concise description.

Do not make the header oversized.

The page should prioritize data.

==================================================
2. PORTFOLIO SUMMARY
==================================================

Create a compact portfolio summary section.

Recommended metrics:

- Total Equity
- Available Balance
- Unrealized P&L
- Realized P&L
- Exposure
- Drawdown

Use the shared Metric components created in Task 02.

Example:

TOTAL EQUITY
$24,842.18

TODAY
+$482.31
+1.98%

EXPOSURE
34.2%

DRAWDOWN
2.4%

Do not assume these numbers are real.

Use clearly labeled mock data.

The purpose is to establish the UI.

==================================================
3. PERFORMANCE VISUALIZATION
==================================================

Create the primary visualization area.

For this task:

Use a suitable mock visualization.

Do NOT integrate the real TradingView Lightweight Charts yet unless the existing implementation already supports it cleanly.

The actual financial chart implementation belongs to Task 04 — Markets.

The Overview visualization can be:

- portfolio equity curve
- P&L trend
- simplified market context

Prioritize the visual hierarchy rather than advanced chart functionality.

If using a temporary chart library, keep the implementation easy to replace.

Do not create a custom financial chart engine.

==================================================
4. MARKET CONTEXT
==================================================

Show concise market context.

Initial assets:

BTC/USDT
ETH/USDT

Example:

BTC/USDT
$112,482
+2.41%

ETH/USDT
$4,321
+1.18%

Include:

- current price
- 24h change
- basic market state

Use mock data.

Clearly separate financial semantic colors from the cyan AI accent.

==================================================
5. HERMES INTELLIGENCE PANEL
==================================================

This is a major feature of the Overview.

Create a compact Hermes Intelligence panel.

This is NOT the complete Hermes page.

The dedicated Hermes page comes later.

The Overview panel should show what Hermes is currently doing.

Example:

HERMES
● MONITORING

Current Focus
BTC/USDT

Market Regime
Trending

Latest Intelligence

BTC momentum remains positive across
the current monitoring window.

Confidence
82%

Risk State
LOW

Latest Activity
Technical analysis completed
2 min ago

The content must be operational and concise.

Do not create a generic chatbot interface.

Do not create a large chat input.

Hermes should feel like an intelligence system operating in the background.

==================================================
6. HERMES CHARACTER
==================================================

Use the Hermes visual language established by the Master Prompt and Design System.

The Overview should contain a subtle visual representation of Hermes.

Possible representation:

- intelligence core
- abstract AI node
- minimal digital entity
- cyan signal/orb
- technical geometric form

Do NOT make it:

- cartoonish
- anime-like
- humanoid robot
- gaming mascot
- giant decorative character

The character should support states.

For example:

MONITORING
ANALYZING
RESEARCHING
PROPOSAL READY

The visual state should be subtle.

Do not consume most of the dashboard with the character.

==================================================
7. OPPORTUNITIES
==================================================

Create an Opportunities section.

Show a concise list/table of detected opportunities.

Example:

BTC/USDT
LONG
82%
R:R 2.8
Momentum Breakout

ETH/USDT
LONG
74%
R:R 2.1
Trend Continuation

Each opportunity should communicate:

- symbol
- side
- confidence
- strategy/setup
- R:R
- state

Use the reusable components from Task 02.

Do not implement opportunity detection logic.

Use mock data only.

==================================================
8. ACTIVE POSITIONS
==================================================

Create an Active Positions section.

Show:

- Symbol
- Side
- Entry
- Current
- P&L
- P&L %
- Risk

Example:

BTC/USDT
LONG
$110,240
$112,482
+$482
+2.03%

Use mock data.

Do not implement real trading logic.

Do not connect Binance.

==================================================
9. RISK STATUS
==================================================

Create a compact Risk Status area.

Show:

Overall Risk
LOW

Exposure
34.2%

Daily Loss
0.8%

Max Drawdown
2.4%

Risk Engine
NORMAL

The purpose is to make risk visible without overwhelming the page.

Risk is a first-class concept.

Do not make risk look decorative.

==================================================
10. RECENT ACTIVITY
==================================================

Create a compact activity feed.

Example:

12:42
Hermes completed BTC analysis

12:39
Opportunity detected — BTC/USDT

12:31
Risk evaluation completed

12:20
Market data synchronized

Each activity should have:

- timestamp
- event type
- short description
- status where appropriate

Do not build the full Activity/Audit page.

==================================================
11. VISUAL HIERARCHY
==================================================

The most visually important areas should be:

1. Portfolio state
2. Main visualization
3. Hermes intelligence
4. Opportunities
5. Positions
6. Risk
7. Activity

Do not give every section equal visual weight.

The page should have a clear focal point.

==================================================
12. DESIGN SYSTEM
==================================================

Use the existing Task 02 components and tokens.

Do not create a second design system.

Background:

#050709

Surfaces:

#080C10
#0B1116
#0F161C
#131C23

Borders:

#1B2A32
#263D46

AI:

#00E5FF
#22DFFF
#63EBFF
#0A5965

Typography:

Inter
JetBrains Mono for quantitative values.

==================================================
13. CARD USAGE
==================================================

Avoid turning every section into a floating card.

Use:

- surfaces
- borders
- sections
- separators
- controlled cards

The page should feel like one integrated terminal.

Not:

"15 cards floating on a black background."

==================================================
14. CYAN USAGE
==================================================

Cyan is for:

- Hermes
- AI activity
- selected states
- active controls
- intelligence indicators

Do not use cyan for:

- every number
- every button
- every border
- profit by default

Profit/loss must retain financial semantics.

==================================================
15. MOCK DATA
==================================================

Use a centralized mock data structure.

For example:

portfolio
markets
opportunities
positions
hermes
risk
activity

Do not hardcode values throughout JSX/components.

The structure should be easy to replace with real API data later.

Clearly indicate that the data is mock/demo data in the implementation if appropriate.

==================================================
16. INTERACTIONS
==================================================

Implement basic useful interactions:

- navigation to Markets
- navigation to Opportunities
- navigation to Positions
- navigation to Hermes
- clickable opportunity rows
- clickable position rows
- timeframe selector if used
- hover states
- appropriate loading/empty states

Do not implement backend functionality.

Do not implement trading execution.

==================================================
17. RESPONSIVE
==================================================

Desktop is the primary target.

At smaller widths:

- sections should stack intelligently
- Hermes panel should move below the main content
- tables should remain usable
- no horizontal overflow
- important metrics remain visible

Do not redesign the entire mobile application.

==================================================
18. ACCESSIBILITY
==================================================

Use:

- semantic headings
- accessible buttons
- keyboard navigation
- visible focus states
- sufficient contrast
- accessible status labels

Do not communicate critical information through color alone.

==================================================
19. ENGINEERING RULES
==================================================

Before changing code:

1. Inspect the existing project.
2. Inspect Task 01.
3. Inspect Task 02.
4. Reuse existing components.
5. Reuse existing tokens.
6. Follow existing architecture.
7. Avoid unnecessary dependencies.

Do not rewrite the App Shell.

Do not create duplicate components that already exist.

==================================================
DO NOT IMPLEMENT
==================================================

Do NOT implement:

- Binance API
- live trading
- order execution
- real market WebSockets
- real portfolio calculations
- risk engine
- real Hermes agent
- real AI reasoning
- TradingView integration
- backtesting
- strategy engine

Those belong to later tasks.

==================================================
QUALITY BAR
==================================================

The finished Overview should immediately communicate:

"Something intelligent is continuously monitoring my trading environment."

It should feel:

- premium
- serious
- technical
- calm
- information-dense
- AI-native

It must NOT feel like:

- a generic admin dashboard
- a crypto exchange clone
- a chatbot
- a marketing landing page

==================================================
VERIFICATION
==================================================

After implementation:

1. Run the application.
2. Verify Overview route works.
3. Verify App Shell remains unchanged and functional.
4. Verify all navigation still works.
5. Verify mock data renders correctly.
6. Verify portfolio metrics.
7. Verify market context.
8. Verify Hermes panel.
9. Verify opportunities.
10. Verify positions.
11. Verify risk.
12. Verify activity.
13. Verify responsive layout.
14. Verify no horizontal overflow.
15. Verify no console errors.
16. Verify no build errors.
17. Verify existing Task 01 and Task 02 functionality was not broken.

Take a final visual pass against the provided reference image and DESIGN.md.

Fix obvious spacing, hierarchy, alignment, and typography problems before finishing.

==================================================
FINAL REPORT
==================================================

Report:

- files created/changed
- components reused
- components created
- mock data structures created
- routes affected
- dependencies added, if any
- verification performed
- remaining issues

STOP after Task 03.

Do not continue to Task 04 automatically.