# Frontend Architecture

## Core Philosophy
The frontend follows a **Feature-Based Architecture**. Each business domain (e.g., Trading, Risk, Hermes) is encapsulated within `src/features/`, owning its own components, hooks, API calls, types, and schemas.

## Dependency Rules
- **UI Components** (`src/components/ui`): Have zero dependencies on `features/`.
- **Features** (`src/features/*`): Can depend on `components/`, `lib/`, and `types/`.
- **Cross-Feature Communication**: Should be minimized. If Feature A needs Feature B, they should communicate via exported interfaces in `index.ts`, or the shared state should be hoisted to a parent page. Avoid circular dependencies.
- **Pages** (`src/app/`): Compose features together. They do not contain business logic.

## Data Flow
```text
Human Trading UI (React)
       │
       │ (Feature API / Hooks)
       ▼
Feature Schemas (Validation)
       │
       │ (REST / WebSocket)
       ▼
Backend API (Trading Domain)
```
