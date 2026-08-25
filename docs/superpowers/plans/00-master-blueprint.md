# AI Trading Intelligence Platform — Master Blueprint

**Date:** 2026-08-16
**Status:** Complete task-level blueprint, ready for sequencing
**PRD:** [prd.md](../../product/prd.md) v1.2 (approved, 96 sections)
**Scope:** MVP 1, Foundations 0 through 12
**Totals:** 13 foundations, 133 tasks, 158 acceptance criteria

This is the single entry point for the whole project. It answers three questions: what must be built, in what order, and what still needs planning before each piece can be built.

Task detail lives in three companion files. This document holds the sequencing, the critical path, the gate map, and the cross-foundation contracts that no single file could see on its own.

| Detail file | Foundations | Tasks |
|---|---|---|
| [parts/part-a.md](parts/part-a.md) | 0, 1, 2, 3 | 44 |
| [parts/part-b.md](parts/part-b.md) | 4, 5, 6, 7 | 40 |
| [parts/part-c.md](parts/part-c.md) | 8, 9, 10, 11, 12 | 49 |

---

## 1. Document layers

The project uses four layers. Two are complete; two are the remaining planning work.

```
Layer 1  PRD                 WHAT and WHY              DONE      v1.2, 96 sections
Layer 2  Master blueprint    all tasks, all order      DONE      this file + 3 parts
Layer 3  Design spec         HOW, per foundation       1 of 13   F0 approved
Layer 4  Detail plan         code-level TDD steps      0 of 13   none written
```

Layer 3 answers "how is this foundation designed". Layer 4 answers "which file, which function, which test". A foundation is ready to build only when both exist for it.

### What exists today

| Document | Layer | State |
|---|---|---|
| `docs/product/prd.md` | 1 | Approved v1.2 |
| `docs/product/goal-architecture.md` | 1 | Approved |
| `docs/scope/scope.md` | 1 | Stale, see section 7 |
| `docs/superpowers/plans/parts/part-a,b,c.md` | 2 | Complete, verified |
| `docs/specs/0001-foundation-0-.../` | 3 | Approved, F0 only |
| `docs/superpowers/specs/2026-08-13-market-data-storage-design.md` | 3 | Pre-PRD, superseded by F2 spec, see section 7 |

---

## 2. Foundation summary

| F | Title | Depends on | Unlocks | Tasks | ACs | Gate |
|---|---|---|---|---|---|---|
| 0 | Repository, Tooling, Configuration, Docker, CI | none | all | 12 | 18 | Gate 0 |
| 1 | PostgreSQL, TimescaleDB, pgvector, Redis, Domain Models | 0 | 2,3,4,5,6,7 | 10 | 12 | none |
| 2 | Market Data Pipeline | 0,1 | 3,5,9,11 | 9 | 11 | none |
| 3 | Portfolio Accounting, Paper Execution, Reconciliation | 0,1,2 | 4,11,12 | 13 | 17 | Gate 1 |
| 4 | Risk Engine | 0,1,3 | 8,12 | 9 | 13 | Gate 1 |
| 5 | Quantitative Analytics, Opportunity Detection | 0,1,2 | 6,8 | 10 | 12 | none |
| 6 | Strategy Registry, Backtesting | 0,1,2,5 | 8 | 10 | 12 | Gate 2 |
| 7 | Hermes Tool APIs, Knowledge, Memory, Skills | 0,1,2,3,4,5,6 | 8,10 | 11 | 14 | none |
| 8 | Hermes Main Trading Agent | 0..7 | 12 | 10 | 10 | Gate 3 |
| 9 | Social and News Intelligence | 0,1,2 | enriches 11,12 | 8 | 8 | none |
| 10 | TradingAgents Deep Research Escalation | 0,1,7,8 | enriches 11,12 | 9 | 9 | none |
| 11 | Dashboard | 0..8 | 12 | 12 | 12 | Gate 4 |
| 12 | Tiny Live Binance Execution | 0..8, 11 | final | 10 | 10 | Gate 5, 6 |

Verified mechanically: foundation numbering is complete 0 to 12, no foundation depends on a later one, and every one of the 158 acceptance criteria is referenced by at least one task with no orphans and no references to undefined criteria.

---

## 3. Critical path

Not everything is sequential. This is the longest dependency chain, and it determines the earliest possible finish:

```
0 → 1 → 2 → 3 → 4 → 7 → 8 → 11 → 12
```

Nine foundations on the critical path. Slipping any one of them slips the project.

Off the critical path, and therefore parallelisable once their dependencies land:

```
5   after 2      can run alongside 3 and 4
6   after 5      can run alongside 7
9   after 2      can run anytime before 11
10  after 8      optional, can be skipped for MVP without blocking 12
```

### Parallel work waves

If you have capacity to run more than one thread, this is the shape:

| Wave | Can run together | Blocked until |
|---|---|---|
| 1 | F0 alone | nothing |
| 2 | F1 alone | F0 |
| 3 | F2 alone | F1 |
| 4 | F3, F5, F9 | F2 |
| 5 | F4, F6 | F3 (for F4), F5 (for F6) |
| 6 | F7 | F4, F6 |
| 7 | F8 | F7 |
| 8 | F10, F11 | F8 |
| 9 | F12 | F11 |

F9 is the most flexible: it only needs F2, so it can fill any gap. F10 is the only genuinely optional foundation.

---

## 4. Release gate map

The PRD defines seven gates. This is which foundation satisfies each.

| Gate | Name | Satisfied by | Meaning |
|---|---|---|---|
| 0 | Foundation | F0 | Repo bootstraps, config rejects unsafe combinations, migrations run, CI green, defaults are paper |
| 1 | Infrastructure | F3 + F4 | Market data reliable, portfolio accounting correct, idempotency proven, reconciliation detects divergence, risk engine tested, audit reconstructable |
| 2 | Quantitative Research | F6 | Backtests reproducible, costs modelled, look-ahead prevented |
| 3 | Agent Intelligence | F8 | Hermes uses tools reliably, proposals structured, agent cannot bypass controls, holds no credentials |
| 4 | Paper Trading | F11 | Full system runs continuously, proposals recorded, simulated orders processed, performance measured |
| 5 | Tiny Live Trading | F12 | Live key verified trade-only, rotation rehearsed, backup restore tested, alerting verified, kill switch survives restart |
| 6 | MVP Validation | post-F12 | Evidence of positive expected value under real conditions |

Gate 1 spans two foundations because portfolio correctness (F3) and risk correctness (F4) are both prerequisites for trusting any number the system reports.

---

## 5. Cross-foundation contracts and findings

This is the check no individual part-writer could perform, because none of them saw the others' output. I read all three and traced the handoffs. Eleven items need resolution before the affected foundations are built. None are structural, all are naming or ownership.

### 5.1 Must fix before the affected foundation starts

| # | Finding | Affects | Recommended resolution |
|---|---|---|---|
| C1 | Package name differs: `packages/hermes-tools/` (hyphen) in F7, `packages/hermes_tools/` (underscore) in F9 and F10 | F7, F9, F10 | Use `packages/hermes_tools/` (underscore). Python import paths cannot contain hyphens, so the underscore form is the only one that works as a package. |
| C2 | Prometheus and Grafana ownership contradicts: F0 defers them "to Foundation 12", F11 actually delivers them in task 11.10 | F0, F11, F12 | F11 owns them. Correct F0's out-of-scope note to say Foundation 11. They must exist before F12 per Gate 5, and F11 precedes F12, so this works. |
| C3 | Idempotency engine built twice: F3 task 3.1 and F12 task 12.5 both "implement" it | F3, F12 | F3 owns and builds it. Reword F12 task 12.5 to wire the existing engine into the live adapter and verify the unique constraint holds against a real exchange. Building it twice risks two divergent implementations of the one property that prevents duplicate orders. |
| C4 | Execution state machine built twice: F3 task 3.2 and F12 task 12.6 | F3, F12 | F3 owns the state machine. F12 adds only the live recovery worker that resolves `UNKNOWN` by querying Binance. |
| C5 | Reconciliation worker built twice: F3 task 3.8 (`services/reconciliation/`) and F12 task 12.7 (`services/reconciliation/worker.py`) | F3, F12 | F3 builds the engine against the paper adapter ledger. F12 adds the live Binance comparison behind the same interface. One worker, two adapters. |
| C6 | Opportunity event naming differs: F5 publishes to stream `stream:market:opportunities` (AC-5.9), F8 consumes `opportunity.detected` events (AC-8.2) | F5, F8 | Pin both now: stream name `stream:market:opportunities`, event type field `opportunity.detected`. They are different things and both parts are half-right. |
| C7 | Social metrics table naming differs: F1 creates `social_metrics` (task 1.6), F9 uses `social_metrics_1m` (task 9.1) | F1, F9 | Use `social_metrics` with an explicit `window` column. A table name encoding one fixed window forces a new table per window later. |
| C8 | `agent_observations` table is used by F7 task 7.7 and F8 task 8.8 but is not in F1's table list (task 1.5) | F1, F7, F8 | Add `agent_observations` and `agent_decisions` to F1 task 1.5. PRD section 83 lists both as core domain objects, so they belong with the rest of the schema. |
| C9 | Knowledge embedding table unnamed in F1 (task 1.7), called `trading_knowledge_embeddings` in F7 (task 7.6) | F1, F7 | Pin `trading_knowledge_embeddings` in F1. |
| C10 | F0 acceptance criterion AC-11 requires the reverse proxy to be the only published port, but F0's deliverables list does not include a Caddy service | F0 | Add a minimal Caddy service to F0's Compose deliverable. Without it AC-11 cannot be satisfied as written. Keep it minimal per the approved decision: no TLS automation, no hardening. |
| C11 | Dependency asymmetry: F9 and F10 both claim to unlock 11 and 12, but F11 and F12 do not list 9 or 10 as dependencies | F9, F10, F11, F12 | Correct: F9 and F10 are optional enrichment, not prerequisites. Change F9 and F10 to "Unlocks: nothing structurally; enriches 11 and 12". This keeps the graph honest about what actually blocks what. |

### 5.2 Interface contracts to honour across boundaries

These are the seams where one foundation hands something to a much later one. Worth pinning explicitly because a mismatch here surfaces as a late, expensive defect.

| Contract | Produced by | Consumed by |
|---|---|---|
| `ExchangeAdapter` interface | F2 | F3 (market data for paper fills), F12 (live orders) |
| `ExecutionAdapter` interface | F3 | F12 (`BinanceExecutionAdapter` must satisfy it unchanged) |
| Fills ledger, deduplicated on exchange trade id | F3 | F12, and every P&L number the dashboard shows |
| `RiskDecision` record with rule codes | F4 | F7 (proposal creation), F8 (agent reads outcome), F11 (display), F12 (pre-submit) |
| Idempotency key and `client_order_id` derivation | F3 | F12 |
| `correlation_id` propagation | F0 | every foundation, and F11's audit reconstruction view |
| Indicator and regime snapshots | F5 | F6 (backtest conditions), F8 (agent context) |
| Tool API authorisation matrix | F7 | F8 (Hermes), F10 (TradingAgents) |
| Trading readiness checklist | F0 skeleton, filled by F2, F3, F4, F12 | F11 system page |
| Kill switch persisted state | F3 or F4 | F11 control, F12 pre-submit check |

### 5.3 Safety invariants that must hold in every foundation

These are not tasks. They are properties that any task can violate and that must be re-checked whenever financial code changes.

1. Money uses `Decimal`. A `float` in a monetary or quantity signature is a defect.
2. Fail closed. Unknown or unverifiable means unsafe, never "proceed".
3. Idempotency is enforced by a database unique constraint, never by application check-then-act.
4. Intent is persisted before any network call.
5. `UNKNOWN` execution state is resolved by exchange query, never by blind retry.
6. Fills are deduplicated on exchange trade id, so applying the same fill twice changes nothing.
7. Redis is never authoritative for financial state.
8. Hermes memory is never authoritative for money.
9. Only the Execution Service holds live exchange credentials.
10. The financial core stays correct with Hermes stopped.
11. Paper and live never share a database name or Redis prefix.
12. The audit log is append-only, and every trade is reconstructable from its `correlation_id`.

---

## 6. Remaining planning documents: 25

Layers 1 and 2 are done. What remains before implementation can proceed foundation by foundation.

### Layer 3, design specs: 12 remaining

F0's spec is approved. Each other foundation needs one before it can be built.

| Spec | Foundation | Notes |
|---|---|---|
| 0002 | F1 Database and domain models | Resolve C7, C8, C9 here |
| 0003 | F2 Market data pipeline | Supersedes the pre-PRD market data spec |
| 0004 | F3 Portfolio, paper execution, reconciliation | Heaviest financial spec, owns C3, C4, C5 |
| 0005 | F4 Risk engine | Determinism and the three evaluation points |
| 0006 | F5 Analytics and opportunity detection | Owns C6 |
| 0007 | F6 Strategy registry and backtesting | Look-ahead prevention is the hard part |
| 0008 | F7 Hermes tool APIs, knowledge, memory, skills | Authorisation matrix, owns C1 |
| 0009 | F8 Hermes main agent | |
| 0010 | F9 Social and news intelligence | Optional branch |
| 0011 | F10 TradingAgents escalation | Optional branch |
| 0012 | F11 Dashboard and owner authentication | Owns C2 |
| 0013 | F12 Tiny live execution | Highest risk, Gate 5 |

### Layer 4, detail plans: 13 remaining

One per foundation, including F0. These carry actual code, test bodies, and commit steps. Expect roughly 1,500 to 2,500 lines each, based on the earlier market data plan running 2,574 lines for a comparable scope.

### Recommended sequencing of the planning work

Do not write all 25 upfront. Write each foundation's design spec and detail plan immediately before building it.

The reason is concrete: F4's design depends on what F3 actually produced, not on what we predicted months earlier. A detail plan written now for F8 would be largely rewritten by the time F7 lands. Speculative detail is waste, and worse, it is waste that looks authoritative.

The exception is the design specs for the next one or two foundations, which are worth having in hand so you are never blocked waiting on planning.

---

## 7. Known debts to settle

Two items predate this blueprint and need your decision.

**`docs/scope/scope.md` contradicts the PRD.** It still describes 13 features on the old Slice 1 to 10 model, while the approved PRD uses Foundations 0 to 12. The two do not map one to one: the old Slice 3 bundles Risk and Execution, which the PRD deliberately splits into F3 and F4. That file is owned by the `/scope` skill, not by a plan, so reconciling it is a separate action.

**The pre-PRD market data design spec.** `docs/superpowers/specs/2026-08-13-market-data-storage-design.md` assumes a `src/trading/` layout, while the approved PRD section 82 uses `apps/api` plus `packages/`. It also currently holds uncommitted edits. Options are to supersede it with spec 0003 when F2 is designed, or to update it in place first. It should not be built from as written.

---

## 8. Immediate next actions

In order, with the reason each one is next:

1. **Resolve the eleven cross-boundary findings in section 5.1.** Cheap now, since no code exists. Each becomes a defect once the affected foundation is built.
2. **Write the Foundation 0 detail plan.** This is the only document blocking implementation from starting.
3. **Reconcile `scope.md`** to Foundations 0 to 12, so the tracking file and the PRD agree.
4. **Build Foundation 0**, then verify against Gate 0.
5. **Design and plan Foundation 1**, and continue foundation by foundation.

Nothing in this blueprint has been implemented. No application code exists.
