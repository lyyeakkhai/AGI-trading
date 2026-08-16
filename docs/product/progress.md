# Project Progress Tracker

**Last updated:** 2026-08-16
**Project:** AI Trading Intelligence Platform, MVP 1
**PRD:** [prd.md](prd.md) v1.2 (approved)
**Blueprint:** [00-master-blueprint.md](../superpowers/plans/00-master-blueprint.md)

This is the single place to see where things stand. Update it as work completes.

---

## Status snapshot

| Track | Done | Left | Total | Progress |
|---|---|---|---|---|
| Product docs (PRD, architecture, blueprint) | 3 | 0 | 3 | 100% |
| Cross-boundary findings resolved | 11 | 0 | 11 | 100% |
| Design specs (one per foundation) | 1 | 12 | 13 | 8% |
| Detail plans (one per foundation) | 0 | 13 | 13 | 0% |
| **Implementation tasks** | **0** | **133** | **133** | **0%** |
| Release gates passed | 0 | 7 | 7 | 0% |

**Current phase:** Planning. No application code exists yet.

---

## Start here

The single next action:

> **Write the Foundation 0 detail plan.** Cross-boundary findings are resolved. The detail plan is the only document blocking implementation.

Recommended order for the next few moves:

1. [x] Resolve the 11 cross-boundary findings (cheap now, defects later)
2. [ ] Write the Foundation 0 detail plan
3. [ ] Reconcile `docs/scope/scope.md` to Foundations 0 to 12
4. [ ] Build Foundation 0
5. [ ] Verify Foundation 0 against Gate 0

---

## Phase 1: Planning

### Done

- [x] PRD v1.2 approved, 96 sections
- [x] Goal architecture approved
- [x] Master blueprint, 13 foundations mapped with critical path and gate map
- [x] Roadmap task detail, 133 tasks across 3 part files
- [x] Foundation 0 design spec approved (`docs/specs/0001-foundation-0-repository-tooling-configuration/`)
- [x] Owner decisions recorded (TimescaleDB image, mypy, deferred Prometheus, Caddy, minimal apps/web)
- [x] Old pre-PRD Slice 1 plan deleted, dangling references fixed

### Design specs remaining (12)

Write each one just before building its foundation, not all upfront.

- [ ] 0002 Foundation 1, database and domain models (resolves findings C7, C8, C9)
- [ ] 0003 Foundation 2, market data pipeline (supersedes the pre-PRD spec)
- [ ] 0004 Foundation 3, portfolio, paper execution, reconciliation (owns C3, C4, C5)
- [ ] 0005 Foundation 4, risk engine
- [ ] 0006 Foundation 5, analytics and opportunity detection (owns C6)
- [ ] 0007 Foundation 6, strategy registry and backtesting
- [ ] 0008 Foundation 7, Hermes tool APIs, knowledge, memory, skills (owns C1)
- [ ] 0009 Foundation 8, Hermes main agent
- [ ] 0010 Foundation 9, social and news intelligence
- [ ] 0011 Foundation 10, TradingAgents escalation
- [ ] 0012 Foundation 11, dashboard and owner authentication (owns C2)
- [ ] 0013 Foundation 12, tiny live execution

### Detail plans remaining (13)

Code-level plans with real test bodies. One per foundation, written just before building.

- [ ] F0 detail plan  ← **next document to write**
- [ ] F1 detail plan
- [ ] F2 detail plan
- [ ] F3 detail plan
- [ ] F4 detail plan
- [ ] F5 detail plan
- [ ] F6 detail plan
- [ ] F7 detail plan
- [ ] F8 detail plan
- [ ] F9 detail plan
- [ ] F10 detail plan
- [ ] F11 detail plan
- [ ] F12 detail plan

---

## Blockers to resolve

### Cross-boundary findings (11)

Naming and ownership collisions found by tracing handoffs between the three roadmap parts. None are structural. Full detail in blueprint section 5.1.

- [x] **C1** `hermes-tools` vs `hermes_tools`. Use underscore, hyphens break Python imports. Affects F7, F9, F10
- [x] **C2** Prometheus/Grafana ownership. F0 says "Foundation 12", F11 actually delivers them. F11 owns them. Affects F0, F11, F12
- [x] **C3** Idempotency engine built in both F3 and F12. F3 owns it, F12 wires it in. Affects F3, F12
- [x] **C4** Execution state machine built in both F3 and F12. F3 owns it. Affects F3, F12
- [x] **C5** Reconciliation worker built in both F3 and F12. One worker, two adapters. Affects F3, F12
- [x] **C6** Opportunity naming. Pin stream `stream:market:opportunities` and event `opportunity.detected`. Affects F5, F8
- [x] **C7** `social_metrics` vs `social_metrics_1m`. Use `social_metrics` with a `window` column. Affects F1, F9
- [x] **C8** `agent_observations` used by F7 and F8 but missing from F1 schema. Add it plus `agent_decisions`. Affects F1, F7, F8
- [x] **C9** Knowledge table unnamed in F1. Pin `trading_knowledge_embeddings`. Affects F1, F7
- [x] **C10** F0 AC-11 requires a reverse proxy but F0 deliverables omit Caddy. AC-11 unsatisfiable as written. Affects F0
- [x] **C11** F9 and F10 claim to unlock F11 and F12, but neither depends on them. They enrich, not block. Affects F9, F10, F11, F12

C10 is a defect in the approved F0 spec. Fix before building F0.

### Documentation debts (2)

- [ ] `docs/scope/scope.md` still uses the old Slice 1 to 10 model, which does not map onto Foundations 0 to 12 (old Slice 3 bundles Risk and Execution, the PRD splits them into F3 and F4)
- [ ] `docs/superpowers/specs/2026-08-13-market-data-storage-design.md` assumes a `src/trading/` layout that the PRD replaced, and holds uncommitted edits. Do not build from it as written

### Housekeeping

- [ ] `docs/specs/` and `docs/superpowers/plans/` are untracked. Nothing committed yet

---

## Phase 2: Implementation

133 tasks. Task detail is in the part files; this is the checklist.

Critical path is `0 → 1 → 2 → 3 → 4 → 7 → 8 → 11 → 12`. Nine of thirteen foundations are sequential.

### Foundation 0: Repository, Tooling, Configuration, Docker, CI
`0 / 12 tasks` · depends on nothing · **Gate 0** · [spec approved](../specs/0001-foundation-0-repository-tooling-configuration/index.md)

- [ ] 0.1 Repository skeleton, dependency groups, workspace setup
- [ ] 0.2 Typed configuration package with safe defaults
- [ ] 0.3 Cross-field startup configuration validation
- [ ] 0.4 Structured JSON logging with logger-level redaction filter
- [ ] 0.5 Environment examples, pre-commit hooks, secret scanning
- [ ] 0.6 Docker Compose for PostgreSQL and Redis (add Caddy, see C10)
- [ ] 0.7 Alembic setup, extensions migration, drift check
- [ ] 0.8 FastAPI app with three health endpoints
- [ ] 0.9 Task runner commands and strict static analysis
- [ ] 0.10 Safety tests, config validation tests, redaction tests
- [ ] 0.11 GitHub Actions CI with migration and bootstrap checks
- [ ] 0.12 Clean clone bootstrap verification

### Foundation 1: PostgreSQL, TimescaleDB, pgvector, Redis, Domain Models
`0 / 10 tasks` · depends on F0 · no gate

- [ ] 1.1 Financial value objects, Decimal types, domain enums
- [ ] 1.2 Domain entities for market data, analytics, knowledge embeddings
- [ ] 1.3 Domain entities for proposals, risk, approvals, execution, portfolio, audit
- [ ] 1.4 Async database engine, pooling, transaction unit-of-work
- [ ] 1.5 SQLAlchemy relational models (add `agent_observations`, see C8)
- [ ] 1.6 TimescaleDB hypertable models (name `social_metrics`, see C7)
- [ ] 1.7 pgvector model for knowledge embeddings (name it, see C9)
- [ ] 1.8 Alembic migration suite
- [ ] 1.9 Redis client, streams, consumer groups, namespace isolation
- [ ] 1.10 Database and domain integration test suite

### Foundation 2: Market Data Pipeline
`0 / 9 tasks` · depends on F0, F1 · no gate

- [ ] 2.1 `ExchangeAdapter` interface and normalized response models
- [ ] 2.2 Binance CCXT REST adapter
- [ ] 2.3 Binance CCXT Pro WebSocket streaming client
- [ ] 2.4 Ingestion worker publishing to Redis Streams
- [ ] 2.5 Historical backfill and gap detection
- [ ] 2.6 TimescaleDB persistence worker with batch upsert
- [ ] 2.7 Staleness detector and feed health monitor
- [ ] 2.8 Market data REST API routes
- [ ] 2.9 End-to-end integration and failure recovery tests

### Foundation 3: Portfolio Accounting, Paper Execution, Reconciliation
`0 / 13 tasks` · depends on F0, F1, F2 · **Gate 1**

- [ ] 3.1 Financial command idempotency engine (owns it, see C3)
- [ ] 3.2 `ExecutionAdapter` abstraction and state machine (owns it, see C4)
- [ ] 3.3 `PaperExecutionAdapter` with fees, slippage, exchange filters
- [ ] 3.4 Immutable fill ledger with trade id deduplication
- [ ] 3.5 Deterministic position and balance derivation
- [ ] 3.6 Owner approval binding, consumption, TTL expiry
- [ ] 3.7 Portfolio snapshot generator
- [ ] 3.8 Multi-trigger reconciliation engine (owns it, see C5)
- [ ] 3.9 Reconciliation blocking flag and recovery state
- [ ] 3.10 Financial audit logger and lifecycle reconstruction
- [ ] 3.11 Portfolio and reconciliation REST API
- [ ] 3.12 `/health/trading` portfolio and reconciliation checks
- [ ] 3.13 Financial safety, idempotency race, divergence test suite

### Foundation 4: Risk Engine
`0 / 9 tasks` · depends on F0, F1, F3 · **Gate 1**

- [ ] 4.1 Pure deterministic risk rule evaluation engine
- [ ] 4.2 Position sizing, precision rounding, reward-to-risk calculators
- [ ] 4.3 Versioned risk configuration repository
- [ ] 4.4 Risk decision generator with rule codes and `MODIFIED` handling
- [ ] 4.5 Three-point evaluation pipeline
- [ ] 4.6 Staleness, exchange health, kill switch validation
- [ ] 4.7 Audit log integration with correlation context
- [ ] 4.8 Owner-only risk configuration REST endpoints
- [ ] 4.9 Isolated unit and property-based test suite

### Foundation 5: Quantitative Analytics, Opportunity Detection
`0 / 10 tasks` · depends on F0, F1, F2 · no gate · *off critical path*

- [ ] 5.1 Indicator library (moving averages, momentum, volatility)
- [ ] 5.2 Graceful degradation wrapper for TA-Lib
- [ ] 5.3 Market structure, swing levels, support/resistance, volume anomaly
- [ ] 5.4 Market regime classification across timeframes
- [ ] 5.5 Data-driven confidence scoring engine
- [ ] 5.6 Real-time analytics worker
- [ ] 5.7 Deterministic opportunity scanner (pin naming, see C6)
- [ ] 5.8 Indicator snapshot persistence worker
- [ ] 5.9 REST endpoints for indicators, regimes, opportunities
- [ ] 5.10 Math verification and scanner integration tests

### Foundation 6: Strategy Registry, Backtesting
`0 / 10 tasks` · depends on F0, F1, F2, F5 · **Gate 2** · *off critical path*

- [ ] 6.1 Strategy schema, validation, lifecycle state machine
- [ ] 6.2 Strategy registry service with version tracking
- [ ] 6.3 Backtesting engine with look-ahead prevention
- [ ] 6.4 Transaction cost model (fees and slippage)
- [ ] 6.5 Performance analytics and risk-adjusted metrics
- [ ] 6.6 vectorbt accelerated backtest runner
- [ ] 6.7 Backtest execution worker with async job queuing
- [ ] 6.8 Benchmark comparison against BTC/ETH buy and hold
- [ ] 6.9 Strategy and backtest REST API
- [ ] 6.10 Backtest validation and look-ahead leak tests

### Foundation 7: Hermes Tool APIs, Knowledge, Memory, Skills
`0 / 11 tasks` · depends on F0 to F6 · no gate

- [ ] 7.1 Service token authentication and authority middleware
- [ ] 7.2 Market and analytics tool endpoints
- [ ] 7.3 Portfolio and strategy query tool endpoints
- [ ] 7.4 Trade proposal management endpoints
- [ ] 7.5 Trader Constitution and procedural skill repository
- [ ] 7.6 Knowledge base vector ingestion and semantic retrieval
- [ ] 7.7 Agent observation and trade memory endpoints
- [ ] 7.8 Hermes tool client package (use `hermes_tools`, see C1)
- [ ] 7.9 TradingAgents restricted read-only gateway
- [ ] 7.10 Financial core isolation verification with Hermes absent
- [ ] 7.11 Negative and positive authorization test suite

### Foundation 8: Hermes Main Trading Agent
`0 / 10 tasks` · depends on F0 to F7 · **Gate 3**

- [ ] 8.1 Isolated Hermes trading profile and container
- [ ] 8.2 Event-driven opportunity wake-up worker
- [ ] 8.3 Context assembly and memory retrieval pipeline
- [ ] 8.4 Skill loader and quantitative strategy memory queries
- [ ] 8.5 Fast-path reasoning and hypothesis generator
- [ ] 8.6 Structured trade proposal generator with evidence
- [ ] 8.7 Proposal submission and risk decision bridge
- [ ] 8.8 Episodic experience recorder and post-trade reflection
- [ ] 8.9 Negative authorization and security boundary tests
- [ ] 8.10 AI evaluation and rule compliance harness

### Foundation 9: Social and News Intelligence
`0 / 8 tasks` · depends on F0, F1, F2 · no gate · *off critical path, most flexible*

- [ ] 9.1 Intelligence domain models and hypertables
- [ ] 9.2 X API client and streaming ingestion worker
- [ ] 9.3 Social metrics normalization and aggregation
- [ ] 9.4 News ingestion worker and event categorizer
- [ ] 9.5 Market and event correlation engine
- [ ] 9.6 Intelligence REST API endpoints
- [ ] 9.7 Hermes intelligence tool integrations
- [ ] 9.8 Safety tests proving signals cannot trigger trades alone

### Foundation 10: TradingAgents Deep Research Escalation
`0 / 9 tasks` · depends on F0, F1, F7, F8 · no gate · *optional, skippable for MVP*

- [ ] 10.1 TradingAgents container and service runtime
- [ ] 10.2 Specialist research analyst roles
- [ ] 10.3 Research request and response domain schemas
- [ ] 10.4 Internal research endpoint with service token validation
- [ ] 10.5 Hermes `research.deep_analyze` tool client
- [ ] 10.6 Escalation routing and decision policy
- [ ] 10.7 Integrate research findings into proposals
- [ ] 10.8 Fast-path fallback and graceful degradation tests
- [ ] 10.9 Security boundary and permission isolation tests

### Foundation 11: Dashboard
`0 / 12 tasks` · depends on F0 to F8 · **Gate 4**

- [ ] 11.1 Owner authentication, TOTP, session cookies, CSRF
- [ ] 11.2 WebSocket streaming hub and client subscription hook
- [ ] 11.3 Dashboard shell, navigation, Overview page
- [ ] 11.4 Market View with TradingView Lightweight Charts
- [ ] 11.5 Agent View and live reasoning activity stream
- [ ] 11.6 Trade Proposal View and owner approval workflow
- [ ] 11.7 Strategy Analytics and baseline comparison
- [ ] 11.8 Trade Journal and audit lifecycle viewer
- [ ] 11.9 System Health, Trading Readiness, Kill Switch page
- [ ] 11.10 Prometheus and Grafana containers (owns them, see C2)
- [ ] 11.11 Caddy reverse proxy configuration
- [ ] 11.12 End-to-end dashboard and paper trading loop tests

### Foundation 12: Tiny Live Binance Execution
`0 / 10 tasks` · depends on F0 to F8 and F11 · **Gate 5, Gate 6** · final foundation

- [ ] 12.1 Gate 5 pre-flight checklist and operational rehearsal
- [ ] 12.2 Execution Service with sole-custody credentials and permission verifier
- [ ] 12.3 `BinanceExecutionAdapter`
- [ ] 12.4 Pre-submission precondition evaluator (all 11 checks)
- [ ] 12.5 Wire idempotency engine into live adapter (F3 owns the engine, see C3)
- [ ] 12.6 Live `UNKNOWN` recovery worker (F3 owns the state machine, see C4)
- [ ] 12.7 Live reconciliation adapter (F3 owns the worker, see C5)
- [ ] 12.8 Harden Caddy for production, TLS, IP allowlist
- [ ] 12.9 Out-of-band emergency alerting dispatcher
- [ ] 12.10 Tiny live trading end-to-end verification

---

## Release gates

| Gate | Name | Satisfied by | Status |
|---|---|---|---|
| 0 | Foundation | F0 | [ ] not started |
| 1 | Infrastructure | F3 + F4 | [ ] not started |
| 2 | Quantitative Research | F6 | [ ] not started |
| 3 | Agent Intelligence | F8 | [ ] not started |
| 4 | Paper Trading | F11 | [ ] not started |
| 5 | Tiny Live Trading | F12 | [ ] not started |
| 6 | MVP Validation | post-F12 | [ ] not started |

Live execution is the last capability enabled. Do not enable real capital because components compile; the evidence required is sustained, reconciled, honestly costed paper performance.

---

## How to use this file

- Tick a task box when its deliverable exists and its tests pass
- Update the `0 / N tasks` line per foundation as you go
- Update the snapshot table at the top when a track changes
- Update **Last updated** when you edit this file
- A foundation is ready to build only when its design spec and detail plan both exist
