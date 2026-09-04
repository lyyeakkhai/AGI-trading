TASK 15 — GLOBAL RESPONSIVE POLISH & UX REFINEMENT

You are implementing Task 15 of the AGI Trading platform.

Tasks 01–14 are already implemented.

Build ONLY Task 15.

This is a GLOBAL POLISH task.

Do not add a new major product feature.

Do not change the product architecture.

==================================================
1. OBJECTIVE
==================================================

Transform the existing application from:

"feature-complete"

into:

"cohesive, polished, production-quality interface."

Focus on:

- visual consistency
- responsive behavior
- spacing
- typography
- navigation
- interaction states
- loading states
- empty states
- error states
- accessibility
- tables
- charts
- modals
- forms
- mobile experience
- performance perception

==================================================
2. DESIGN SYSTEM
==================================================

Audit the entire application against:

OBSIDIAN INTELLIGENCE

Ensure every page uses the same:

- background
- surface hierarchy
- border treatment
- typography
- spacing
- radius
- buttons
- badges
- inputs
- tables
- cards
- tabs
- modal styles
- status indicators

Remove one-off styles where possible.

Do not introduce a second design language.

==================================================
3. GLOBAL APP SHELL
==================================================

Polish:

Sidebar
Header
Breadcrumbs
Page containers
Navigation
Mobile navigation

Ensure navigation feels consistent across:

/overview
/markets
/hermes
/opportunities
/trade-proposals
/positions
/strategies
/backtests
/risk
/analytics
/activity
/settings

Current page should always have a clear active state.

==================================================
4. RESPONSIVE BREAKPOINTS
==================================================

Verify the entire application at:

Desktop:
1440px+

Laptop:
1280px

Tablet:
1024px

Small tablet:
768px

Mobile:
390px

Small mobile:
320px

No page should:

- overflow horizontally
- clip content
- produce broken tables
- hide critical actions
- create unusable forms

==================================================
5. MOBILE NAVIGATION
==================================================

Desktop:

Persistent sidebar.

Mobile:

Use a compact navigation pattern.

Recommended:

Top header
+
menu/drawer

Navigation categories:

Overview
Markets
Hermes
Opportunities
Trading
Portfolio
Strategies
Backtests
Risk
Analytics
Activity
Settings

Do not create a second unrelated navigation system.

==================================================
6. PAGE CONTAINER
==================================================

Standardize:

maximum content width

horizontal padding

vertical spacing

section spacing

Example:

Page:

max-width:
1440px

Desktop padding:
32px

Tablet:
24px

Mobile:
16px

Use existing project tokens where available.

==================================================
7. TYPOGRAPHY
==================================================

Audit:

H1
H2
H3
body
secondary text
labels
metadata
numbers

Important numbers should have strong hierarchy.

Avoid:

- excessive giant numbers
- inconsistent font sizes
- random font weights

Trading numbers should use consistent numeric formatting.

==================================================
8. SPACING
==================================================

Create consistent spacing rhythm.

Use existing spacing tokens.

Standardize:

Card padding
Section gaps
Table row height
Input spacing
Button spacing
Modal padding

Avoid arbitrary values repeated throughout the application.

==================================================
9. CARDS
==================================================

Standardize card behavior.

Cards should use:

- consistent border
- consistent radius
- consistent surface
- consistent padding

Avoid excessive card nesting.

Important content should not be buried inside multiple cards.

==================================================
10. TABLES
==================================================

Audit all tables:

Markets
Trade Proposals
Positions
Strategies
Backtests
Risk
Analytics
Activity

Requirements:

- readable headers
- consistent row height
- hover state
- selected state
- empty state
- loading state
- mobile behavior

On mobile:

Use horizontal scrolling ONLY inside the table container.

Never allow page-level horizontal overflow.

==================================================
11. CHARTS
==================================================

Audit:

TradingView
Equity Curve
Drawdown
Analytics charts
Performance charts

Ensure:

- consistent height
- responsive sizing
- readable labels
- proper empty state
- loading state
- tooltip consistency

Do not add another chart library.

==================================================
12. BUTTONS
==================================================

Standardize:

Primary
Secondary
Ghost
Danger
Success

States:

Default
Hover
Active
Disabled
Loading

Buttons should never change size unexpectedly between states.

==================================================
13. FORMS
==================================================

Audit all forms.

Inputs need:

Label
Value
Description where necessary
Focus state
Error state
Disabled state

Ensure:

- keyboard accessibility
- visible focus
- clear validation
- consistent spacing

==================================================
14. LOADING STATES
==================================================

Create consistent loading patterns.

Use skeletons for:

- metrics
- tables
- charts
- cards

Avoid showing blank screens while content loads.

Do not use excessive animated loaders.

==================================================
15. EMPTY STATES
==================================================

Create reusable empty states.

Examples:

No Opportunities

"No opportunities match the current filters."

No Positions

"No open positions."

No Backtests

"No backtests available."

No Live Activity

"No live activity recorded."

No Live Performance

"No live performance data available."

Each empty state should provide an appropriate next action where useful.

==================================================
16. ERROR STATES
==================================================

Create consistent error UI.

Example:

Unable to load market data.

[ Retry ]

Use:

- clear explanation
- retry action
- non-alarming presentation

For critical system errors:

use appropriate danger styling.

==================================================
17. TOASTS
==================================================

Standardize notifications.

Examples:

Changes saved.

Risk configuration updated.

Proposal approved.

Backtest completed.

Connection unavailable.

Use:

success
warning
error
info

Do not stack excessive notifications.

==================================================
18. MODALS
==================================================

Audit all modals.

Standardize:

- width
- padding
- title
- description
- actions
- close behavior

Dangerous actions require clear confirmation.

Examples:

Reset Settings

Delete Mock Data

Reject Proposal

Do not create real destructive backend operations.

==================================================
19. STATUS SYSTEM
==================================================

Standardize statuses across the app.

Examples:

ACTIVE
INACTIVE
HEALTHY
WARNING
CRITICAL
APPROVED
REJECTED
PENDING
RUNNING
COMPLETED
FAILED
PAPER
LIVE

Use consistent badge treatment.

==================================================
20. COLOR SEMANTICS
==================================================

Use semantic meaning consistently.

GREEN:

positive
healthy
approved
profit

RED:

negative
failure
rejection
loss

AMBER:

warning
attention
approaching limit

CYAN:

Hermes
AI
intelligence
system information

GRAY:

neutral
inactive
metadata

Do not use colors decoratively.

==================================================
21. TRADING MODE
==================================================

The environment indicator must be consistent everywhere.

Display:

PAPER

or

LIVE

For current MVP:

PAPER

should be the dominant environment.

LIVE must remain clearly disabled until live trading is implemented.

==================================================
22. AI CHARACTER / EV
==================================================

Preserve the existing AGI character / EV visual language.

Do not make EV appear as:

- a cartoon assistant
- a chatbot mascot
- a generic robot

EV should feel like:

an intelligent system presence.

Use EV selectively in:

Hermes
Overview
Opportunities
AI insight panels

Do not put EV everywhere.

==================================================
23. HERMES UX
==================================================

Ensure Hermes is visually distinct from normal UI.

Hermes should communicate:

Observe
Investigate
Propose

Never:

Autonomously execute live trades.

Keep the existing architecture:

Hermes
→ Proposal
→ Risk
→ Owner
→ Execution

==================================================
24. DATA FORMATTING
==================================================

Standardize:

Currency:

$12,480.00

Percentage:

24.8%

Risk:

1.8%

Ratio:

2.4R

Large values:

$1.24M

Time:

7h 24m

Dates:

YYYY-MM-DD

Timestamps:

HH:mm:ss

Do not mix formatting styles between pages.

==================================================
25. NUMERIC ALIGNMENT
==================================================

Financial numbers should be right-aligned in tables.

Examples:

P&L
Price
Quantity
Risk
Percentage

Text remains left-aligned.

==================================================
26. ACCESSIBILITY
==================================================

Audit:

Keyboard navigation

Focus states

Button labels

ARIA labels

Contrast

Form labels

Modal focus

Table semantics

Interactive chart accessibility where practical

Do not rely on color alone.

Example:

PASS

should not be represented only by green.

==================================================
27. HOVER / INTERACTION
==================================================

Add subtle interaction states.

Use:

- hover
- active
- selected
- focus

Avoid:

- excessive glow
- large transforms
- distracting animations

The product should feel fast and professional.

==================================================
28. ANIMATION
==================================================

Use restrained motion.

Good:

- subtle page transitions
- skeleton shimmer
- modal transitions
- dropdown transitions
- small status changes

Avoid:

- constant pulsing
- excessive particle effects
- animated charts on every render
- distracting AI effects

Respect:

prefers-reduced-motion

==================================================
29. SEARCH
==================================================

Audit all search interfaces.

Ensure:

- consistent input style
- clear placeholder
- keyboard interaction
- clear button
- no layout jumping

==================================================
30. FILTERS
==================================================

Standardize filter UI.

Filters should work consistently across:

Opportunities
Trade Proposals
Positions
Risk
Analytics
Activity

Desktop:

inline filters

Mobile:

collapsible filter panel

==================================================
31. PAGE HEADERS
==================================================

Standardize every page header:

Title

Description

Environment

Primary actions

Secondary actions

Example:

Risk Management

Deterministic portfolio protection and trade validation.

[PAPER]

==================================================
32. MOBILE PRIORITY
==================================================

On mobile, prioritize:

1. Page title
2. Primary metric
3. Primary action
4. Critical status
5. Core content

Secondary information can move into:

- collapsible sections
- tabs
- detail drawers

Never hide critical risk information.

==================================================
33. PERFORMANCE
==================================================

Audit frontend performance.

Avoid:

- unnecessary re-renders
- expensive calculations during render
- duplicated mock data
- oversized components
- unnecessary dependencies

Use memoization only where it actually helps.

Do not add dependencies unless necessary.

==================================================
34. MOCK DATA CONSISTENCY
==================================================

Audit mock data across the entire app.

Ensure:

BTC price

portfolio value

positions

P&L

risk

analytics

trade proposals

are reasonably consistent.

Do not show obviously contradictory values.

Keep deterministic data.

==================================================
35. CROSS-PAGE NAVIGATION
==================================================

Audit every major navigation link.

Verify:

Opportunity
→ Trade Proposal

Trade Proposal
→ Risk

Risk
→ Position

Position
→ Analytics

Strategy
→ Backtest

Activity
→ Related object

Settings
→ Activity

Hermes
→ Opportunity / Proposal

No dead links.

==================================================
36. NOT FOUND
==================================================

Create a polished 404 page.

Example:

404

System route not found.

[ Return to Overview ]

Keep it within the Obsidian Intelligence design.

==================================================
37. GLOBAL SHORTCUTS
==================================================

If the application already supports keyboard shortcuts,
polish them.

Useful shortcuts may include:

/
Search

Esc
Close modal

G
Go to navigation

Do not implement a complex command palette unless the existing
architecture already supports it.

==================================================
38. COMPONENT CLEANUP
==================================================

Identify duplicated components.

If multiple pages implement nearly identical:

MetricCard
Badge
Table
Modal
Filter
EmptyState

consolidate them into shared components.

Do not over-engineer.

==================================================
39. TECHNICAL CONSTRAINTS
==================================================

Do NOT:

- add Binance integration
- add real trading
- add backend
- add database
- add WebSockets
- add authentication
- add real API credentials
- change the product architecture
- add a new chart library
- add a new major feature

This task is polish only.

==================================================
40. ACCEPTANCE CRITERIA
==================================================

Task 15 is complete when:

1. All pages use the same design language.

2. Navigation is consistent.

3. Sidebar is polished.

4. Mobile navigation works.

5. Desktop layouts work.

6. Tablet layouts work.

7. Mobile layouts work.

8. No page-level horizontal overflow exists.

9. Typography is consistent.

10. Spacing is consistent.

11. Cards are consistent.

12. Buttons are consistent.

13. Forms are consistent.

14. Tables are consistent.

15. Charts are responsive.

16. Loading states exist.

17. Empty states exist.

18. Error states exist.

19. Toasts are consistent.

20. Modals are consistent.

21. Status badges are consistent.

22. Color semantics are consistent.

23. Paper/Live state is consistent.

24. EV/Hermes visual language is consistent.

25. Financial number formatting is consistent.

26. Numeric table alignment is consistent.

27. Keyboard navigation works.

28. Focus states are visible.

29. Reduced-motion preference is respected.

30. Mock data is reasonably consistent across pages.

31. Cross-page navigation works.

32. 404 page works.

33. No unnecessary dependencies were added.

34. Existing Tasks 01–14 remain functional.

35. No TypeScript/lint/build errors.

==================================================
41. FINAL QA
==================================================

Test the application at:

1440px
1280px
1024px
768px
390px
320px

Visit every major route:

/overview
/markets
/hermes
/opportunities
/trade-proposals
/positions
/strategies
/backtests
/risk
/analytics
/activity
/settings

For every page verify:

- layout
- typography
- spacing
- navigation
- buttons
- tables
- charts
- filters
- loading
- empty state
- error state
- mobile behavior

Verify:

- no horizontal page overflow
- no broken routes
- no console errors
- no TypeScript errors
- no lint errors
- no build errors

STOP after Task 15.

Do NOT implement Task 16.