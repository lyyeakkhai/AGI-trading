TASK 01 — AGI TRADING APP SHELL

You are implementing Task 01 of the AGI Trading frontend.

Read the Master Prompt, PRD, Scope, DESIGN.md, and provided visual reference before making changes.

IMPORTANT:
Implement ONLY the App Shell in this task.

Do NOT implement:
- Overview dashboard
- Markets
- Charts
- Hermes dashboard
- Opportunities
- Trade proposals
- Positions
- Strategies
- Backtests
- Risk
- Analytics
- Activity
- Settings functionality
- Live trading functionality

Those will be separate tasks.

==================================================
OBJECTIVE
==================================================

Build the production-quality application shell for AGI Trading.

The shell is the permanent environment in which all future pages will live.

The result should already feel like a professional AI-native trading terminal even before individual pages are implemented.

Visual direction:

DARK QUANTUM / CYAN INTELLIGENCE

Use the provided reference image as the visual north star.

Do not copy it literally.

==================================================
LAYOUT
==================================================

Create a desktop-first application shell with three major regions:

1. LEFT SIDEBAR
2. GLOBAL TOP HEADER
3. MAIN CONTENT WORKSPACE

Future pages will render inside the main workspace.

Recommended structure:

┌───────────────────────────────────────────────────────────┐
│ GLOBAL HEADER                                             │
├──────────────┬────────────────────────────────────────────┤
│              │                                            │
│   SIDEBAR    │           MAIN WORKSPACE                   │
│              │                                            │
│              │                                            │
│              │                                            │
│              │                                            │
└──────────────┴────────────────────────────────────────────┘

Do NOT create a permanent right Hermes panel yet.

That will be designed in the Hermes task.

==================================================
SIDEBAR
==================================================

Create a professional compact navigation sidebar.

Sections:

WORKSPACE

- Overview
- Markets
- Agent
- Opportunities
- Positions
- Strategies
- Backtests
- Risk
- Analytics

SYSTEM

- Activity
- Settings

Each item needs:

- icon
- label
- active state
- hover state
- disabled/future state where appropriate

Use a consistent icon library already present in the project.

If none exists, use a clean professional icon library rather than drawing custom SVG icons unnecessarily.

The sidebar should support:

- normal expanded state
- compact/collapsed state if appropriate for the existing application architecture

Do not over-engineer sidebar behavior.

==================================================
BRAND AREA
==================================================

At the top of the sidebar establish the AGI Trading identity.

Example:

AGI
TRADING

or another clean treatment consistent with the provided reference.

The brand should feel technical and premium.

Avoid:

- giant logos
- crypto imagery
- decorative gradients
- excessive glow

A subtle cyan accent is acceptable.

==================================================
GLOBAL HEADER
==================================================

Create the global application header.

It should contain:

LEFT:
- current page/title area

RIGHT:
- trading environment indicator
- Hermes/system status
- system connectivity/status
- user/operator area if appropriate

The environment must be highly visible.

For now use:

PAPER

Example:

● PAPER

This should communicate that the current application is operating in paper mode.

Also establish the visual pattern for:

● LIVE

but do not implement live trading.

LIVE must visually feel more serious and controlled than PAPER.

==================================================
HERMES STATUS
==================================================

Create only the global Hermes status indicator.

Example:

HERMES
● MONITORING

or:

◆ HERMES
MONITORING

This is NOT the Hermes page.

It is only a global system-status component that future tasks can reuse.

Create the component so future states can be supported:

- Monitoring
- Analyzing
- Researching
- Proposal Ready
- Awaiting Approval
- Executing
- Completed

Cyan represents AI/intelligence activity.

==================================================
SYSTEM STATUS
==================================================

Create a reusable system-status indicator.

Example:

● SYSTEM ONLINE

or:

SYSTEM
ONLINE

This is currently mock UI.

Do not build backend connectivity logic in this task.

Make the component reusable for future real status data.

==================================================
DESIGN SYSTEM
==================================================

Use the provided DESIGN.md.

Core background:

#050709

Surfaces:

#080C10
#0B1116
#0F161C
#131C23

Borders:

#1B2A32
#263D46

Primary intelligence accent:

#00E5FF
#22DFFF
#63EBFF

Cyan means:

AI / intelligence / active / selected

It does NOT mean profit.

Financial colors are reserved for financial meaning.

Typography:

Inter

Use JetBrains Mono only where numerical/data styling is appropriate.

==================================================
SURFACES
==================================================

Avoid excessive cards.

The shell should primarily use:

- background layers
- thin borders
- subtle separators
- restrained elevation

Recommended radius:

6–8px

Avoid:

- giant rounded containers
- heavy shadows
- glassmorphism everywhere
- excessive gradients

==================================================
VISUAL DENSITY
==================================================

The shell should feel:

dense
precise
technical
calm

It should feel closer to an institutional trading terminal than a consumer SaaS dashboard.

Use whitespace deliberately.

Do not fill empty space with decorative elements.

==================================================
CYAN GLOW
==================================================

Use glow extremely selectively.

Good examples:

- active navigation
- Hermes activity
- focused controls
- important system state

Bad examples:

- every card
- every border
- entire background
- every button

The cyan glow should communicate intelligence/activity.

==================================================
RESPONSIVE BEHAVIOR
==================================================

Desktop is the primary target.

However, establish a sensible responsive foundation.

At smaller widths:

- sidebar can collapse
- navigation should remain accessible
- header should remain usable
- main workspace should not overflow horizontally

Do not spend significant time designing mobile-specific pages yet.

==================================================
ACCESSIBILITY
==================================================

Implement proper:

- semantic navigation
- buttons
- links
- keyboard focus states
- readable contrast
- aria labels where necessary

Do not sacrifice usability for visual effects.

==================================================
COMPONENT ARCHITECTURE
==================================================

Create reusable shell components where appropriate.

Suggested structure:

AppShell
├── Sidebar
│   ├── Brand
│   ├── NavigationSection
│   └── NavigationItem
│
├── Header
│   ├── PageTitle
│   ├── EnvironmentIndicator
│   ├── HermesStatus
│   └── SystemStatus
│
└── MainWorkspace

Use the project's existing architecture if it already has an appropriate structure.

Do not create unnecessary abstraction layers.

==================================================
ROUTING
==================================================

Establish routes/placeholders for the planned application pages if the project architecture requires them.

Routes:

/overview
/markets
/agent
/opportunities
/positions
/strategies
/backtests
/risk
/analytics
/activity
/settings

These routes may render simple placeholder content for now.

Do NOT implement the actual page designs.

The purpose is only to prove the shell and navigation work.

==================================================
MOCK DATA
==================================================

Use minimal static mock data only for:

- PAPER environment
- Hermes status
- system status
- navigation

Do not create fake trading performance, positions, opportunities, or market data yet.

Those belong to later tasks.

==================================================
ENGINEERING RULES
==================================================

Before coding:

1. Inspect the existing repository.
2. Understand the existing frontend framework.
3. Identify the existing styling system.
4. Identify existing component libraries.
5. Reuse existing infrastructure when appropriate.
6. Do not rewrite unrelated code.

Do not introduce a new framework just for this task.

Do not replace existing architecture unless necessary.

==================================================
DO NOT DO
==================================================

Do NOT:

- build the dashboard
- build charts
- build TradingView integration
- build Binance integration
- build Hermes intelligence
- build AI reasoning UI
- build trading logic
- build risk logic
- build authentication
- build backend APIs
- build live trading
- create fake complex data
- add unnecessary animations

==================================================
QUALITY BAR
==================================================

When finished, the application should already visually communicate:

AGI TRADING
AI-NATIVE
PROFESSIONAL
TRADING
INTELLIGENCE
CONTROL

The shell should feel premium and production-ready.

It should NOT feel like a template dashboard.

==================================================
VERIFICATION
==================================================

After implementation:

1. Run the project.
2. Verify the application boots.
3. Verify all navigation items render.
4. Verify active navigation state.
5. Verify PAPER indicator.
6. Verify Hermes status.
7. Verify system status.
8. Verify responsive sidebar behavior.
9. Verify no horizontal overflow.
10. Verify console/build errors.
11. Verify existing functionality was not broken.

At the end, report:

- files created/changed
- components created
- routes created
- verification performed
- any remaining issues

STOP after Task 01.

Do not continue to Task 02 automatically.
