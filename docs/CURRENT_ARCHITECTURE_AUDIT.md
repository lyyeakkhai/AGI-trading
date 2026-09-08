# Current Architecture Audit

## 1. Directory Structure Overview
- `app/`: Next.js App Router. Contains 19+ top-level routes (e.g. `/markets`, `/execution`, `/positions`, `/hermes`, `/trade-proposals`). Highly fragmented.
- `components/`: Contains UI components grouped by module names matching the routes (e.g., `components/trading/`, `components/shell/`, `components/markets/`). Reusable UI elements are mixed with domain-specific ones.
- `hooks/`: Contains global hooks (`useChartDrawings.ts`).
- `lib/`: Contains API clients (`exchangeApi.ts`, `marketApi.ts`, `researchApi.ts`) and mock data for all modules.

## 2. Component Organization
Currently, business components are separated from their corresponding API logic and hooks. For instance, the `trading` components (`ChartContainer.tsx`, `MarketChart.tsx`) live in `components/trading/`, but any data fetching lives in `lib/`. 

## 3. Navigation
The navigation is driven by `components/shell/Sidebar.tsx` and mounted in `app/layout.tsx`. It occupies significant horizontal space, which is detrimental to a trading workspace.

## 4. Key Existing Code Identified
- **Trading/Charts**: `components/trading/ChartContainer.tsx`, `MarketChart.tsx`, `ChartOverlay.tsx`.
- **Trading Tools**: `components/trading/PnLDisplay.tsx`, `PositionSide.tsx`, `RiskBadge.tsx`.
- **Shell**: `components/shell/AppShell.tsx`, `Sidebar.tsx`, `Header.tsx`.
- **API**: `lib/exchangeApi.ts`, `lib/marketApi.ts`.
- **WebSockets / State**: Implied existence within components or `lib/`, but lack centralization in a `lib/websocket/` folder.

## 5. Architectural Problems
1. **Scattered Feature Code**: A developer working on the `trading` feature must jump between `app/[route]`, `components/trading/`, and `lib/`.
2. **Global Namespace Pollution**: The `components/` directory is cluttered with 19 domain-specific folders. It should only contain reusable global components (e.g., `components/ui/`, `components/layout/`).
3. **Missing Schema/Type Boundaries**: No explicit validation layer for the UI interacting with the API or Hermes.
