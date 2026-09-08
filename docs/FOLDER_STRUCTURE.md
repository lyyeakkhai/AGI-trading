# Target Feature-Based Folder Structure

The repository will be restructured into a strictly feature-oriented architecture.

```text
src/
├── app/                  # Next.js App Router (Pages only, no business logic)
├── components/           # Global reusable UI (Not domain-specific)
│   ├── ui/               # Base components (Button, Modal, Input)
│   ├── layout/           # AppShell, TopNav
│   └── charts/           # Generic chart wrappers
├── features/             # Business Domains
│   ├── analytics/
│   ├── execution/
│   ├── hermes/
│   ├── markets/
│   ├── orders/
│   ├── positions/
│   ├── risk/
│   ├── strategies/
│   └── trading/          # The core trading workspace
├── lib/                  # Infrastructure
│   ├── binance/
│   ├── utils/
│   └── websocket/
├── routes/               # Route definitions/constants
└── types/                # Global types
```

## Feature Folder Blueprint
Each feature (e.g., `features/trading`) will internally encapsulate its concerns:
- `/components`: UI components specific to the feature.
- `/hooks`: React hooks (e.g., `useTradingPlan`).
- `/api`: API communication functions.
- `/schemas`: Zod/validation schemas for data boundaries.
- `/types`: Feature-specific TypeScript interfaces.
- `/index.ts`: Public API export for the feature.
