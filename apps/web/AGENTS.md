<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AGI Trading Frontend Architecture Rules
**CRITICAL INSTRUCTION FOR ALL AGENTS WORKING ON THIS FRONTEND:**

We follow a strict **Feature-Based Architecture**. Do NOT dump all components into `src/components/`. 
Do NOT create arbitrary folder structures. Follow these rules exactly:

### 1. Feature Encapsulation
Every business domain must live entirely inside `src/features/[feature-name]/`.
Current features include: `trading`, `markets`, `execution`, `risk`, `positions`, `hermes`.

Inside a feature folder, you must use this exact subfolder structure (create them if needed, but do not invent new names):
- `components/` (React components specific to this feature)
- `hooks/` (Custom React hooks)
- `api/` (Data fetching, API wrappers)
- `schemas/` (Zod schemas for validation)
- `types/` (TypeScript interfaces)

**Barrel Exports:** Every feature MUST have an `index.ts` file in its subdirectories (e.g., `src/features/trading/components/index.ts`) that explicitly exports the public API.

### 2. Dependency Rules
- **Generic UI Components:** (`src/components/ui/`, `src/components/layout/`) are for generic, dumb components (buttons, headers, modals). They must NEVER import from `src/features/`.
- **Feature Imports:** Features can import from `src/components/` and `src/lib/`, but cross-feature imports should be minimized. Always import from a feature's barrel file (e.g., `import { OrderPanel } from "@/features/trading/components"`).
- **Pages (`src/app/`):** Next.js App Router pages are for composing features together. Do not write heavy business logic directly in the `page.tsx` files. Delegate logic to the feature's components and hooks.

### 3. Unified Domain (Human + AI)
The Trading UI (`/trade`) is shared between Humans and the Hermes AI Agent. Do not build separate "AI execution paths". The frontend UI forms (like the Order Panel) must generate a `TradingPlan` payload that matches the exact backend model expected by both the human endpoints and the AI tool endpoints.

Failure to follow this structure will break the frontend application architecture.
