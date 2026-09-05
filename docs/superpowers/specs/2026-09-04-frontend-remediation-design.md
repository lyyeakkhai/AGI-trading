# Design Specification: Frontend Remediation & 100% Completion (Tasks 01, 06, 11, 12, 13, 15)

**Date**: 2026-09-04  
**Author**: Antigravity Platform Engineering  
**Scope**: Remediate all gaps identified in the code audit for Tasks 01, 06, 11, 12, 13, and 15 to bring all frontend workspaces to 100% compliance with `docs/superpowers/tasks/` and `DESIGN.md`.

---

## 1. Architecture & Design Decisions

### 1.1 Design System Alignment (`DESIGN.md`)
- **Theme**: Dark Quantum / Obsidian `#050709` background, `#080C10` secondary background, `#0F161C` surfaces, `#1B2A32` borders.
- **Accents**: Electric Cyan `#00E5FF` exclusively for AI intelligence/telemetry, Neon Green `#00E676` for profit/success, Bright Red `#FF3B30` for loss/error, Amber `#F59E0B` for warning.
- **Motion**: Functional only with `@media (prefers-reduced-motion: reduce)` fallbacks.
- **Typography**: Geist Sans for UI text, Geist Mono for tabular data, numbers, timestamps, and status chips.

---

## 2. Component Specifications

### 2.1 Task 01: App Shell (`Header.tsx`)
- **File**: `apps/web/src/components/shell/Header.tsx`
- **Current State**: Uses inline hardcoded `<span>` elements for Hermes status, Paper mode, and System connectivity.
- **Target Design**:
  - Replace Hermes inline chip with `<AIStatusIndicator status="MONITORING" size="sm" showLabel />`.
  - Replace Paper mode chip with `<EnvironmentBadge mode="PAPER" size="sm" />`.
  - Replace Online chip with `<StatusIndicator status="online" size="sm" label="ONLINE" />`.
  - Mount `<Breadcrumbs />` component on the left side of Header next to route title.

### 2.2 Task 06: Opportunities (`OpportunityFilters.tsx`, `OpportunitiesWorkspace.tsx`, `OpportunityDetailDrawer.tsx`)
- **Files**:
  - `apps/web/src/components/opportunities/OpportunityFilters.tsx`
  - `apps/web/src/components/opportunities/OpportunitiesWorkspace.tsx`
  - `apps/web/src/components/opportunities/OpportunityDetailDrawer.tsx`
- **Target Design**:
  - **Strategy Filter**: Add Strategy `<Select>` to filter bar options: `ALL`, `momentum-expansion`, `volatility-breakout`, `mean-reversion-spread`.
  - **Filter Pipeline**: Wire `filters.strategy` in `OpportunitiesWorkspace.tsx` filtering logic.
  - **Volatility State**: In `OpportunityDetailDrawer.tsx`, render `opportunity.marketContext.volatilityState` with appropriate color-coded badge (`HIGH`, `EXPANDING`, `COMPRESSED`).

### 2.3 Task 11: Risk Management (`PositionRiskTable.tsx`, `RiskDecisionsTable.tsx`)
- **Files**:
  - `apps/web/src/components/risk/PositionRiskTable.tsx`
  - `apps/web/src/components/risk/RiskDecisionsTable.tsx`
- **Target Design**:
  - **Position Size**: Add `SIZE` column to `PositionRiskTable.tsx` showing position nominal value and asset quantity (e.g., `$12,450.00 (0.21 BTC)`).
  - **Timeframe Filter**: Add filter dropdown to `RiskDecisionsTable.tsx` with options: `ALL`, `1H`, `24H`, `7D`.

### 2.4 Task 12: Performance Analytics (`AnalyticsFilters.tsx`, `TradePerformance.tsx`, `page.tsx`)
- **Files**:
  - `apps/web/src/components/analytics/AnalyticsFilters.tsx` [NEW]
  - `apps/web/src/components/analytics/TradePerformance.tsx` [NEW]
  - `apps/web/src/app/analytics/page.tsx`
  - `apps/web/src/components/analytics/ReturnsByPeriodTable.tsx`
  - `apps/web/src/components/analytics/StrategyComparisonModal.tsx`
- **Target Design**:
  - **`AnalyticsFilters.tsx`**: Dropdown filters for Strategy, Asset, Timeframe, Regime, Direction.
  - **`TradePerformance.tsx`**: Renders 6 trade attribution metrics: Average Winner, Average Loser, Largest Winner, Largest Loser, Win/Loss Ratio, and Average Holding Time.
  - **Reactive Filtering**: Filter equity curves and stats dynamically based on selected date range and filter state.
  - **Returns Period Toggle**: Support toggling between Monthly and Weekly returns.
  - **Strategy Comparison**: Support dynamic strategy checkbox selection and add Sharpe/Sortino comparison rows.

### 2.5 Task 13: Activity Trail (`ActivityTableView.tsx`, `mockActivityData.ts`, `page.tsx`)
- **Files**:
  - `apps/web/src/components/activity/ActivityTableView.tsx`
  - `apps/web/src/components/activity/ActivityFilterBar.tsx`
  - `apps/web/src/app/activity/page.tsx`
  - `apps/web/src/lib/mockActivityData.ts`
- **Target Design**:
  - **Table Sorting**: Allow clicking on column headers (`Timestamp`, `Type`, `Source`, `Status`) to sort ASC/DESC.
  - **Environment Column**: Add `ENV` column displaying `<EnvironmentBadge size="sm" mode={event.environment} />`.
  - **Export Action**: Provide CSV and JSON export buttons in the header that download filtered event data.
  - **30 Mock Events**: Expand `mockActivityData.ts` to 30 events including `SECURITY`, `PORTFOLIO`, `FAILED`, and `CANCELLED`.

### 2.6 Task 15: Global Polish & UX (`Breadcrumbs.tsx`, `globals.css`)
- **Files**:
  - `apps/web/src/components/shell/Breadcrumbs.tsx` [NEW]
  - `apps/web/src/app/globals.css`
- **Target Design**:
  - **Breadcrumbs**: Compute breadcrumb trail from pathname with clickable links.
  - **Motion Accessibility**: Add `@media (prefers-reduced-motion: reduce)` in `globals.css` ensuring animations gracefully stop or simplify.

---

## 3. Verification Plan
- Typecheck with `npm run build` or `pnpm build` in `apps/web`.
- Verify every route loads without runtime errors.
- Confirm all 6 tasks meet 100% of criteria.
