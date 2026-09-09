# Trading V1 Implementation Tasks

## Phase 1: Architectural Refactor

### TRADING-001
**Title:** Scaffold Feature-Based Folder Structure
**Goal:** Create the baseline `features/` directory architecture and infrastructure folders.
**Why:** To resolve the scattered codebase problem and enforce clean boundaries before building new functionality.
**Files affected:** 
- `src/features/` (new)
- `src/components/layout/` (new)
- `src/components/ui/` (new)
- `src/lib/utils/` (new)
**Dependencies:** None
**Implementation details:** Create the folder trees for `features/trading`, `features/markets`, `features/execution`, `features/risk`, `features/positions`, `features/hermes`. Create `api/`, `components/`, `hooks/`, `schemas/`, `types/` subfolders within each.
**Acceptance criteria:** Folders exist and follow the architecture spec.
**Testing requirements:** None (structural only).
**Risk:** Low.

### TRADING-002
**Title:** Migrate Reusable UI Components
**Goal:** Move generic components out of domain folders and into `components/ui/`.
**Why:** To establish a clean global UI library and prevent domain components from acting as generic ones.
**Files affected:** `src/components/*`
**Dependencies:** TRADING-001
**Implementation details:** Identify components like `Button`, `Modal`, `Toast` and move them to `src/components/ui/`. Update all imports across the `app/` directory.
**Acceptance criteria:** All routes compile. No generic components exist inside `components/trading/`, etc.
**Testing requirements:** Run TypeScript compiler and verify app boots without import errors.
**Risk:** Medium (import path breakage).

### TRADING-003
**Title:** Migrate Trading & Market Components to Features
**Goal:** Move existing trading logic into `features/trading` and `features/markets`.
**Why:** To colocate the domain logic and prepare for the V1 trading workspace.
**Files affected:** 
- `src/components/trading/*` -> `src/features/trading/components/`
- `src/lib/marketApi.ts` -> `src/features/markets/api/marketApi.ts`
- `src/hooks/useChartDrawings.ts` -> `src/features/trading/hooks/useChartDrawings.ts`
**Dependencies:** TRADING-002
**Implementation details:** Relocate files, update imports, and create `index.ts` barrel files for the features to export their public API.
**Acceptance criteria:** Original `/markets` and `/trade-proposals` pages still function but import from `features/`.
**Testing requirements:** Verify UI functionality remains identical.
**Risk:** Medium.

## Phase 2: Navigation & Shell

### TRADING-004
**Title:** Implement Top Navigation Shell
**Goal:** Replace the left sidebar with a compact top navigation bar.
**Why:** To maximize horizontal screen space for the TradingView chart and order panels.
**Files affected:**
- `src/components/shell/Sidebar.tsx` (DELETE)
- `src/components/shell/AppShell.tsx` -> `src/components/layout/AppShell.tsx`
- `src/components/layout/TopNav.tsx` (NEW)
**Dependencies:** TRADING-003
**Implementation details:** Build the `TopNav` component with the dropdown structure specified in `NAVIGATION_SPEC.md`. Update `RootLayout` to use it.
**Acceptance criteria:** Sidebar is gone. TopNav renders correctly and links to existing pages.
**Testing requirements:** Visual verification of layout on desktop and mobile.
**Risk:** Low.

## Phase 3: Trading V1 Workspace

### TRADING-005
**Title:** Create Unified Trading Workspace Scaffold
**Goal:** Build the `/trade` page layout.
**Why:** To provide a single pane of glass for human traders to execute and manage positions.
**Files affected:** 
- `src/app/trade/page.tsx` (NEW)
- `src/features/trading/components/TradingWorkspace.tsx` (NEW)
**Dependencies:** TRADING-004
**Implementation details:** Implement the CSS Grid layout defined in `TRADING_UI_SPEC.md` (Header, Chart, Trade Panel, Bottom Tabs). Connect existing chart components to the center pane.
**Acceptance criteria:** `/trade` resolves and displays the layout scaffolding with the chart.
**Testing requirements:** Verify responsive grid behavior.
**Risk:** Low.

### TRADING-006
**Title:** Implement Unified Order Entry Panel
**Goal:** Build the V1 Order Panel supporting Spot and USDⓈ-M Futures.
**Why:** Humans need an interface to create `TradingPlan` objects with leverage and reduce-only flags.
**Files affected:**
- `src/features/trading/components/OrderPanel.tsx` (NEW)
- `src/features/trading/schemas/tradingPlan.schema.ts` (NEW)
**Dependencies:** TRADING-005
**Implementation details:** Build the form. Implement Zod schema matching the backend `TradingPlanModel` (including `market`, `leverage`, `stop_loss_price`, `take_profit_prices`). Add dynamic Risk Preview calculating the dollar risk amount.
**Acceptance criteria:** Form validates correctly. Switching between Spot/Futures toggles Leverage inputs.
**Testing requirements:** Unit test the Zod schema. UI interaction tests for the form state.
**Risk:** High (financial input validation).

### TRADING-007
**Title:** Connect Order Panel to Trading API
**Goal:** Wire the Execute button to the backend.
**Why:** To actually place trades and validate risk.
**Files affected:**
- `src/features/trading/api/tradingApi.ts` (NEW)
- `src/features/trading/components/OrderPanel.tsx`
**Dependencies:** TRADING-006
**Implementation details:** Implement the fetch calls to `/api/v1/tools/plan/create` and `/api/v1/tools/risk/validate_plan`. Handle REJECTED states by showing a toast or inline error.
**Acceptance criteria:** Submitting a valid plan creates it on the backend. Submitting an oversized plan shows a risk rejection error.
**Testing requirements:** E2E mock testing of the API responses.
**Risk:** High.
