# Task Prompt: Phase 1 Frontend Remediation (Tasks 01, 06, 11, 12, 13, 15)

## Overview
Implement the remaining features and gap remediation for the 6 frontend tasks to bring them from 78%–92% to 100% complete according to `DESIGN.md` and their original task prompts (`task1.md`, `task6.md`, `task11.md`, `task12.md`, `task13.md`, `task15.md`).

## Requirements

### 1. Task 01 (App Shell & Header)
- In `apps/web/src/components/shell/Header.tsx`:
  - Replace dummy spans with `<AIStatusIndicator status="MONITORING" size="sm" showLabel />`, `<EnvironmentBadge mode="PAPER" size="sm" />`, and `<StatusIndicator status="online" size="sm" label="ONLINE" />`.
  - Include `<Breadcrumbs />` component next to page title.

### 2. Task 06 (Opportunities)
- In `apps/web/src/components/opportunities/OpportunityFilters.tsx`:
  - Add Strategy filter dropdown (ALL, momentum-expansion, volatility-breakout, mean-reversion-spread).
- In `apps/web/src/components/opportunities/OpportunitiesWorkspace.tsx`:
  - Filter opportunities by `filters.strategy`.
- In `apps/web/src/components/opportunities/OpportunityDetailDrawer.tsx`:
  - Render `volatilityState` tile in market context section.

### 3. Task 11 (Risk Management)
- In `apps/web/src/components/risk/PositionRiskTable.tsx`:
  - Add `SIZE` column displaying formatted position value and quantity.
- In `apps/web/src/components/risk/RiskDecisionsTable.tsx`:
  - Add time filter dropdown (ALL, 1H, 24H, 7D).

### 4. Task 12 (Performance Analytics)
- Create `apps/web/src/components/analytics/AnalyticsFilters.tsx` with Strategy, Asset, Timeframe, Regime, Direction.
- Create `apps/web/src/components/analytics/TradePerformance.tsx` displaying average/largest win/loss, holding time, win/loss ratio.
- In `apps/web/src/app/analytics/page.tsx`:
  - Connect date range pills (`1W`, `1M`, `3M`, `1Y`, `ALL`) to filter analytics datasets reactively.
  - Render `AnalyticsFilters` and `TradePerformance`.
- In `apps/web/src/components/analytics/ReturnsByPeriodTable.tsx`:
  - Add Monthly / Weekly period switch.
- In `apps/web/src/components/analytics/StrategyComparisonModal.tsx`:
  - Add dynamic strategy multi-selection and Sharpe/Sortino comparison rows.

### 5. Task 13 (Activity & Audit Trail)
- In `apps/web/src/components/activity/ActivityTableView.tsx`:
  - Add column sort toggles on headers (`Timestamp`, `Type`, `Source`, `Status`).
  - Add `Environment` column.
- In `apps/web/src/components/activity/ActivityFilterBar.tsx`:
  - Add filter chips for `SECURITY`, `PORTFOLIO`, `FAILED`, `CANCELLED`.
- In `apps/web/src/app/activity/page.tsx`:
  - Add CSV and JSON export buttons.
- In `apps/web/src/lib/mockActivityData.ts`:
  - Expand mock event records to 30 items including diverse statuses and environments.

### 6. Task 15 (Global Polish & UX)
- Create `apps/web/src/components/shell/Breadcrumbs.tsx`.
- In `apps/web/src/app/globals.css`:
  - Add `@media (prefers-reduced-motion: reduce)` accessibility rules.

## Verification
- Run `npm run build` or `pnpm build` in `apps/web`.
- Confirm zero TypeScript errors and zero breaking changes across existing pages.
