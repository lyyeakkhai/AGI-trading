# Scope: AI Trading Intelligence Platform

A private, single-user AI trading system that ingests market data, detects opportunities, and allows an isolated Hermes agent to propose trades for human approval.

**Build approach:** Tracer Bullet (Vertical slices; each feature built end to end through every layer).
**Workflow:** Beta (After `/develop`, `/check verify` then `/test`. No fresh model review by default). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | in-progress |
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | Market data storage schema | Foundation | in-progress |
| 4 | Market Data & Storage (Slice 1) | Slice 1 | planned |
| 5 | Portfolio & Analytics (Slice 2) | Slice 2 | planned |
| 6 | Risk & Execution Engine (Slice 3) | Slice 3 | planned |
| 7 | Strategy Registry & Backtesting (Slice 4) | Slice 4 | planned |
| 8 | Opportunity Detection Engine (Slice 5) | Slice 5 | planned |
| 9 | Hermes Trading Tools API (Slice 6) | Slice 6 | planned |
| 10 | Main Trading Agent (Slice 7) | Slice 7 | planned |
| 11 | Paper Trading E2E Loop (Slice 8) | Slice 8 | planned |
| 12 | Dashboard & UI Foundation (Slice 9) | Slice 9 | planned |
| 13 | Tiny Live Trading (Slice 10) | Slice 10 | planned |

## Foundations

### 1. Stack & architecture · in-progress
Decide the stack and scaffold a runnable project so every later slice builds on real structure.
**Done when:** the stack is recorded in a spec and the empty scaffold boots locally and passes build.
- [x] Decide the stack (spec): `/architect stack & architecture`
- [ ] Scaffold from the decision: `/develop stack & architecture`
- [ ] Smoke-check it runs: `/test`
spec docs/product/goal-architecture.md

### 2. Coding standards & tooling
Capture conventions, then install lint, format, and pre-commit enforcement from the real scaffolded project.
**Done when:** root `AGENTS.md` reflects the real stack, and lint/format/pre-commit run clean.
- [ ] Capture conventions + tooling choices: `/audit`
- [ ] Install the tooling: `/develop tooling`
- [ ] Check it runs clean: `/test`

### 3. Market data storage schema · in-progress
Core entities every feature builds on: market candles, trades, ticker snapshots in TimescaleDB.
**Done when:** tables, constraints, and TimescaleDB hypertables are created and support Slice 1 ingestion.
- [x] Design it (spec): `/architect market data schema`
- [ ] Build it: `/develop market data schema`
- [ ] Verify it: `/check verify market data schema`
- [ ] Test it: `/test market data schema`
spec docs/superpowers/specs/2026-08-13-market-data-storage-design.md

## Slice 1: Market Data & Storage

### 4. Market Data & Storage (Slice 1)
Wire Binance WebSocket through CCXT Pro into Redis Streams and persist to TimescaleDB.
**Done when:** live market candles and trades flow continuously into the database.
- [x] Design it (spec): `/architect market data and storage`
- [ ] Build it: `/develop market data and storage`
- [ ] Verify it: `/check verify market data and storage`
- [ ] Test it: `/test market data and storage`
spec docs/superpowers/specs/2026-08-13-market-data-storage-design.md

## Slice 2: Portfolio & Analytics

### 5. Portfolio & Analytics (Slice 2) · needs a decision
Calculate technical indicators and portfolio state deterministically from the raw data streams.
**Done when:** regime and indicator snapshots are calculated continuously and saved.
- [ ] Design it (spec): `/architect portfolio and analytics`

## Slice 3: Risk & Execution Engine

### 6. Risk & Execution Engine (Slice 3) · needs a decision
Deterministic safety boundaries and the mechanism to translate internal orders to exchange execution.
**Done when:** trades that violate risk limits are rejected, and valid trades are executed via Paper Broker.
- [ ] Design it (spec): `/architect risk and execution engine`

## Slice 4: Backtesting

### 7. Strategy Registry & Backtesting (Slice 4) · needs a decision
Manage strategy lifecycle and test logic against historical data.
**Done when:** a strategy can be registered and backtested with correct metrics produced.
- [ ] Design it (spec): `/architect strategy registry and backtesting`

## Slice 5: Opportunity Detection

### 8. Opportunity Detection Engine (Slice 5) · needs a decision
Scanner that reads indicators and triggers events when trading conditions are met.
**Done when:** candidate event messages are published to Redis when setups occur.
- [ ] Design it (spec): `/architect opportunity detection engine`

## Slice 6: Agent Tools

### 9. Hermes Trading Tools API (Slice 6) · needs a decision
The controlled API surface the LLM agent uses to read markets, check risk, and propose trades.
**Done when:** tools are authenticated and return structured data to the agent.
- [ ] Design it (spec): `/architect hermes trading tools api`

## Slice 7: Main Agent

### 10. Main Trading Agent (Slice 7) · needs a decision
The continuously operating Hermes-based trader with episodic memory and trading skills.
**Done when:** agent can receive events, load context, and output structured trade proposals.
- [ ] Design it (spec): `/architect main trading agent`

## Slice 8: Paper Trading Loop

### 11. Paper Trading E2E Loop (Slice 8) · needs a decision
Complete flow from opportunity to paper trade execution and journal logging.
**Done when:** the system runs continuously on paper, logging trades and P&L automatically.
- [ ] Design it (spec): `/architect paper trading e2e loop`

## Slice 9: Dashboard

### 12. Dashboard & UI Foundation (Slice 9) · needs a decision
Next.js interface for the owner to monitor the system, approve trades, and view analytics.
**Done when:** owner can view live charts, agent proposals, and approve/reject trades.
- [ ] Design it (spec): `/architect dashboard and ui foundation`

## Slice 10: Live Trading

### 13. Tiny Live Trading (Slice 10) · needs a decision · GA
Real money execution with Binance keys, strict audit logs, and VPS deployment.
**Done when:** owner-approved live trades execute successfully on Binance with full audit trails.
- [ ] Design it (spec): `/architect tiny live trading`

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
