# Real-time UI Tasks

**Objective**: Connect the newly built UI components to real-time WebSockets and render trading plans on the chart.

## Task 1: Positions and Open Orders Data Feeds
- **File**: `apps/web/src/features/positions/hooks/usePositions.ts` & `PositionsTable.tsx`
- **Goal**: Listen to the backend WebSocket stream for live portfolio updates.
- **Implementation**:
  - Implement a WebSocket context/hook that subscribes to `/ws/v1/portfolio`.
  - Pass the live positions array to the `PositionsTable` and `OpenOrdersTable`.

## Task 2: Chart Overlay Integration
- **File**: `apps/web/src/features/trading/components/ChartOverlay.tsx`
- **Goal**: When a `TradingPlan` is active (either created by the user or Hermes), draw its Entry, Stop Loss, and Take Profit lines on the TradingView chart.
- **Implementation**:
  - Consume the active `TradingPlan` context.
  - Use lightweight-charts `IPriceLine` API to draw the horizontal levels.
  - Color code them (Entry = Blue, SL = Red, TP = Green).
