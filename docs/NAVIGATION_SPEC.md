# Navigation Specification

## Migration Strategy
The frontend currently uses a legacy left-sidebar navigation (`Sidebar.tsx`) which severely limits horizontal space for charting. This will be completely removed and replaced with a top navigation bar.

## Target Structure
**AGI TRADING (Logo/Home)**

1. **Overview**
2. **Markets**
3. **Trade** (Dropdown)
   - Trading Workspace
   - Spot
   - Futures
   - Orders
   - Positions
4. **Intelligence** (Dropdown)
   - Hermes
   - Opportunities
   - Strategies
   - Research
5. **Portfolio** (Dropdown)
   - Overview
   - Risk
   - Analytics
   - History
6. **System** (Dropdown)
   - Execution
   - Activity
   - Settings

## Implementation
- Create `components/layout/TopNav.tsx`.
- Refactor `app/layout.tsx` to use `TopNav` instead of `Sidebar`.
- Ensure responsive state (hamburger menu) for mobile viewports.
