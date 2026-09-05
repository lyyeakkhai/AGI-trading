TASK 02 — AGI TRADING DESIGN SYSTEM & SHARED COMPONENTS

You are implementing Task 02 of the AGI Trading frontend.

Read the Master Prompt, PRD, Scope, DESIGN.md, and visual reference image before making changes.

Task 01 — App Shell has already been implemented.

IMPORTANT:
Do NOT implement any full product page in this task.

This task is ONLY about establishing the reusable Design System and shared UI components that all future pages will use.

==================================================
OBJECTIVE
==================================================

Build the reusable visual foundation for AGI Trading.

The design language is:

DARK QUANTUM / CYAN INTELLIGENCE

Working design-system name:

OBSIDIAN INTELLIGENCE

The goal is to make future pages feel like one coherent professional trading intelligence platform.

Do not create generic SaaS components.

The UI should feel:

- precise
- technical
- premium
- dense
- calm
- intelligent
- trustworthy

==================================================
SOURCE OF TRUTH
==================================================

Use:

1. Master Prompt
2. PRD
3. Scope
4. DESIGN.md
5. Visual reference image
6. Existing App Shell from Task 01

Do not introduce a conflicting visual language.

==================================================
COLOR TOKENS
==================================================

Implement centralized design tokens.

Background:

BG-950       #050709
BG-900       #080C10
BG-850       #0B1116

Surfaces:

SURFACE      #0F161C
SURFACE-2    #131C23

Borders:

BORDER       #1B2A32
BORDER-HI    #263D46

AI / Intelligence:

CYAN-500     #00E5FF
CYAN-400     #22DFFF
CYAN-300     #63EBFF
CYAN-DIM     #0A5965

Semantic colors:

POSITIVE / LONG
NEGATIVE / SHORT
WARNING / RISK
INFO
NEUTRAL

Keep semantic colors separate from the AI cyan system.

IMPORTANT:

Cyan = AI / active / intelligence.

Green/red = financial meaning.

==================================================
TYPOGRAPHY
==================================================

Primary:

Inter

Data / quantitative:

JetBrains Mono

Create typography tokens for:

- display
- page title
- section title
- body
- secondary text
- label
- caption
- metric
- numeric value

Financial values should be visually aligned and easy to scan.

==================================================
SPACING
==================================================

Create a consistent spacing scale.

Use a restrained spacing system suitable for a dense trading terminal.

Avoid excessive whitespace.

Avoid inconsistent arbitrary spacing.

==================================================
BORDERS & RADIUS
==================================================

Default radius:

6–8px

Create reusable radius tokens.

Borders should be subtle and technical.

Avoid large rounded SaaS-style cards.

==================================================
SHARED COMPONENTS
==================================================

Create only the reusable primitives needed by future pages.

At minimum:

1. Button
2. IconButton
3. Badge
4. StatusIndicator
5. EnvironmentBadge
6. Metric
7. Card / Surface
8. SectionHeader
9. Tabs
10. Table
11. TableRow
12. Input
13. Select
14. Dropdown
15. Tooltip
16. Divider
17. EmptyState
18. LoadingState
19. ErrorState
20. Modal / Dialog
21. Toast / Notification
22. ProgressIndicator

Do not over-engineer these components.

==================================================
TRADING COMPONENTS
==================================================

Create reusable trading-specific primitives.

1. PriceDisplay

Example:

BTC/USDT
$112,482.32

2. PnLDisplay

Example:

+$1,284.22
+4.82%

3. PositionSide

LONG
SHORT

4. RiskBadge

LOW
MEDIUM
HIGH
BLOCKED

5. ConfidenceIndicator

Example:

87%
HIGH

6. TradingMode

PAPER
LIVE

7. OrderStatus

PENDING
APPROVED
EXECUTING
FILLED
CANCELLED
REJECTED

These should be reusable by future pages.

==================================================
AI / HERMES COMPONENTS
==================================================

Create reusable AI state primitives.

HermesStatus:

MONITORING
ANALYZING
RESEARCHING
PROPOSAL READY
AWAITING APPROVAL
EXECUTING
COMPLETED

Create:

- AIStatusIndicator
- AIActivityBadge
- AIInsightLabel
- AIState

Cyan should communicate AI activity.

Do not create the complete Hermes page yet.

==================================================
DATA TABLE
==================================================

Create a professional dense table system.

It must support:

- column headers
- numeric alignment
- status cells
- positive/negative values
- hover state
- selected row
- compact density
- loading state
- empty state

Tables will later be used for:

- positions
- opportunities
- strategies
- activity
- analytics

==================================================
CARD / SURFACE SYSTEM
==================================================

Do not make every section a card.

Support at least:

Surface
Surface Elevated
Surface Interactive

Use:

- subtle border
- controlled radius
- minimal shadow

Avoid excessive visual containers.

==================================================
BUTTON SYSTEM
==================================================

Create variants such as:

Primary
Secondary
Ghost
Danger
Success

But keep the visual system restrained.

Primary actions can use cyan.

Do not make every button cyan.

Financial actions should retain semantic meaning.

==================================================
STATE SYSTEM
==================================================

Every important reusable component should support:

Default
Hover
Active
Focus
Disabled
Loading
Error

Where applicable:

Success
Warning
Danger

Accessibility is required.

==================================================
GLOW
==================================================

Use cyan glow only for meaningful intelligence/active states.

Examples:

- active Hermes
- active navigation
- focused AI component
- selected intelligence state

Do NOT add glow to every component.

==================================================
ICONS
==================================================

Use the existing icon library if the project already has one.

If not, introduce one consistent professional icon library.

Icons should be:

- minimal
- technical
- consistent
- visually restrained

Do not mix multiple icon styles.

==================================================
CHART CONTAINER
==================================================

Create a reusable ChartContainer primitive only.

Do NOT implement actual charts yet.

It should establish:

- title
- timeframe controls
- toolbar area
- chart area
- loading state
- empty state

The actual TradingView Lightweight Charts integration belongs to Task 04.

==================================================
RESPONSIVE
==================================================

Components should support the desktop-first application.

Ensure:

- readable density
- no accidental overflow
- usable controls
- proper focus states

Do not spend time building mobile-specific layouts yet.

==================================================
COMPONENT API
==================================================

Components should be reusable and composable.

Avoid hardcoding:

- BTC
- ETH
- specific prices
- fake portfolio values
- specific strategies

Use props/data structures instead.

==================================================
DESIGN TOKENS
==================================================

Centralize:

- colors
- typography
- spacing
- radius
- borders
- shadows
- transitions

Do not scatter visual values throughout components when a token is appropriate.

==================================================
MOTION
==================================================

Keep animation subtle.

Allowed:

- hover transitions
- state transitions
- loading indicators
- subtle AI activity

Avoid:

- excessive bouncing
- flashy transitions
- constant glowing animations
- distracting effects

==================================================
IMPORTANT PRODUCT RULE
==================================================

This is a trading intelligence product.

The design must prioritize information hierarchy and decision-making over decoration.

The visual hierarchy should generally be:

IMPORTANT DATA
↓
CONTEXT
↓
RISK
↓
ACTION
↓
SECONDARY INFORMATION

==================================================
DO NOT IMPLEMENT
==================================================

Do NOT build:

- Overview
- Markets
- TradingView
- Hermes dashboard
- Opportunities
- Trade Proposal
- Positions page
- Strategies
- Backtests
- Risk dashboard
- Analytics
- Activity page
- Settings page
- Binance API
- trading engine
- backend logic
- live trading

Only create reusable design-system and shared components.

==================================================
VERIFICATION
==================================================

After implementation:

1. Run the application.
2. Verify Task 01 App Shell still works.
3. Verify all shared components compile.
4. Verify typography.
5. Verify color tokens.
6. Verify dark theme.
7. Verify component states.
8. Verify keyboard focus.
9. Verify no horizontal overflow.
10. Verify no console/build errors.
11. Verify existing functionality was not broken.

Create a small internal component showcase/demo route only if useful for testing the components.

Do not turn it into a product page.

==================================================
FINAL REPORT
==================================================

Report:

- files created/changed
- design tokens created
- components created
- any dependencies added
- verification performed
- remaining issues

STOP after Task 02.

Do not continue to Task 03 automatically.