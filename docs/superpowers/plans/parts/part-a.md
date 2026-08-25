## Foundation 0: Repository, Tooling, Configuration, Docker, CI

*Note: Reuses the approved spec's 12 tasks and AC-1 to AC-18 numbering from docs/specs/0001-foundation-0-repository-tooling-configuration/index.md.*

**Goal:** Build the minimal safe repository skeleton, dependency layers, typed configuration with fast-failing startup validation, Docker Compose infrastructure, initial extensions migration, and CI pipeline that all later foundations build inside.
**Depends on:** nothing
**Unlocks:** Foundation 1, Foundation 2, Foundation 3, Foundation 4, Foundation 5, Foundation 6, Foundation 7, Foundation 8, Foundation 9, Foundation 10, Foundation 11, Foundation 12
**PRD sections:** 8, 55, 59, 66, 67, 68, 70, 71, 75, 76, 82, 85, 86, 89, 94, 95
**Release gate:** Gate 0 (Foundation)

### Deliverables
- Repository skeleton matching PRD section 82 (`apps/api`, `apps/web`, `packages/`, `services/`, `infrastructure/`, `migrations/alembic/`, `tests/`) with placeholder README files.
- `pyproject.toml` with locked `uv.lock` defining core, quant, and dev dependency groups.
- `pnpm` workspace with minimal `apps/web` Next.js skeleton validating strict TypeScript and frontend linting.
- `packages/config/` containing typed Pydantic settings for all PRD section 66.2 categories, safe committed defaults, and startup cross-field validation.
- `packages/logging/` providing structured JSON logging, UTC timestamps, correlation context propagation, and logger-level secret redaction filter.
- Committed `.env.example`, `.pre-commit-config.yaml` with Ruff and secret scanning, and hardened `.gitignore`.
- `docker-compose.yml` and `docker-compose.override.yml.example` running PostgreSQL (TimescaleDB and pgvector), Redis, and a minimal Caddy reverse proxy on a private Docker network with service-scoped secret passing.
- Initialized Alembic configuration with initial migration creating `timescaledb` and `vector` extensions, plus model drift check tooling.
- FastAPI application in `apps/api` exposing `/health/live`, `/health/ready`, and `/health/trading` (honest not-ready reporting).
- `Makefile` wrapping lint, format, typecheck (`mypy` strict on financial modules), test, and bootstrap commands.
- Safety test suite asserting environment and mode isolation, committed defaults, and configuration rejection.
- GitHub Actions CI workflow executing all quality checks and verifying bootstrap from a clean checkout.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 0.1 | Repository skeleton, dependency groups, and workspace setup | Directory structure per PRD section 82, `pyproject.toml` with core/quant/dev groups, `uv.lock`, `pnpm` workspace with minimal `apps/web`, placeholder `README.md` files, and hardened `.gitignore` | - | AC-2, AC-3 |
| 0.2 | Typed configuration package with safe defaults | `packages/config/` with typed Pydantic settings for all PRD section 66.2 categories, immutable runtime settings, and safe defaults | 0.1 | AC-4, AC-5 |
| 0.3 | Cross-field startup configuration validation | Cross-field validation enforcing all PRD section 66.4 rules, failing fast at boot with field-level error messages | 0.2 | AC-6 |
| 0.4 | Structured JSON logging with logger-level redaction filter | `packages/logging/` with JSON formatter, UTC timestamps, correlation context plumbing, startup settings log, and logger-level secret redaction filter | 0.1 | AC-7, AC-9 |
| 0.5 | Environment examples, pre-commit hooks, and secret scanning | Committed `.env.example` with PRD section 71.1 placeholders, `.pre-commit-config.yaml` with Ruff and secret scanning | 0.1 | AC-8 |
| 0.6 | Docker Compose infrastructure for PostgreSQL, Redis, and minimal Caddy reverse proxy | `docker-compose.yml`, `docker-compose.override.yml.example`, TimescaleDB and pgvector verification, minimal Caddy reverse proxy as sole published port, private Docker network isolation, and service-scoped secret passing | 0.1, 0.5 | AC-10, AC-11, AC-12 |
| 0.7 | Alembic migration setup with extensions migration and drift check | `migrations/alembic/` initialized, initial migration creating `timescaledb` and `vector` extensions, and model-versus-migration drift detection command | 0.6 | AC-16 |
| 0.8 | FastAPI application with health, readiness, and trading health endpoints | `apps/api` FastAPI app exposing distinct `/health/live`, `/health/ready`, and `/health/trading` (honest not-ready state) with DB and Redis connectivity | 0.2, 0.4, 0.6, 0.7 | AC-17 |
| 0.9 | Task runner commands and strict static analysis tooling | `Makefile` with targets (`make lint`, `make typecheck`, `make test`, `make check`), `ruff` config, `mypy` strict mode on financial modules, and frontend type/lint checks | 0.1, 0.8 | AC-13, AC-14 |
| 0.10 | Safety test suite, configuration validation tests, and redaction tests | `tests/safety/` and `tests/unit/` testing environment isolation, committed safe defaults, database name separation, configuration rejection, and secret redaction | 0.3, 0.4, 0.8, 0.9 | AC-18 |
| 0.11 | GitHub Actions CI workflow with migration and bootstrap checks | `.github/workflows/ci.yml` running lint, typecheck, tests, migration idempotency, safety tests, frontend build, and clean bootstrap verification | 0.9, 0.10 | AC-15 |
| 0.12 | Clean clone bootstrap verification | Documented bootstrap sequence verified from empty state without manual intervention or live credentials | 0.11 | AC-1 |

### Acceptance criteria
- **AC-1**: A clean clone reaches a running local system through the documented sequence only: `cp .env.example .env`, `uv sync`, `pnpm install`, `docker compose up -d`, `uv run alembic upgrade head`. No undocumented manual step is required.
- **AC-2**: `uv sync` succeeds on a machine with no TA-Lib system library present, and no live exchange credentials anywhere.
- **AC-3**: The repository contains the agreed directory skeleton, and each directory a later foundation will fill is present with a short `README.md` stating what belongs there and which foundation fills it.
- **AC-4**: Configuration loads through typed settings objects. A missing or wrong typed value fails at startup with a message naming the offending field.
- **AC-5**: Committed defaults are `APP_ENV=development`, `TRADING_MODE=paper`, `LIVE_TRADING_ENABLED=false`, `spot_only=true`, `leverage_enabled=false`, symbol allowlist `BTC/USDT` and `ETH/USDT`, `require_owner_approval=true`, `approval_ttl_seconds=300`, `approval_ttl_max_seconds=900`.
- **AC-6**: Every cross field rule in PRD section 66.4 is enforced at startup and rejects rather than warns. `TRADING_MODE=live` with `APP_ENV=development` is refused. `LIVE_TRADING_ENABLED=true` with `TRADING_MODE=paper` is refused. `TRADING_MODE=live` with missing live exchange credentials is refused. `leverage_enabled=true` or `spot_only=false` with `TRADING_MODE=live` is refused. A symbol outside the allowlist is refused. Paper and live sharing a database name or Redis prefix is refused. `approval_ttl_seconds` at or below zero, or above `approval_ttl_max_seconds`, is refused. `market_data_max_age_seconds` at or below zero is refused. `require_owner_approval=false` with `TRADING_MODE=live` is refused.
- **AC-7**: Resolved non secret configuration is logged once at startup. `APP_ENV`, `TRADING_MODE`, and `LIVE_TRADING_ENABLED` appear on every log line.
- **AC-8**: `.env.example` is committed with every variable named in PRD section 71.1 and placeholder values only. `.env` is git ignored. A pre commit secret scan runs and blocks a commit containing a credential shaped string or a `.env` file.
- **AC-9**: A logging redaction filter is applied at the logger, not per call site. A log call attempting to emit a known secret field emits a redaction marker instead of the value, proven by test.
- **AC-10**: `docker compose up -d` starts PostgreSQL with both the `timescaledb` and `vector` extensions available, and Redis. No manual extension installation step is required.
- **AC-11**: Only the reverse proxy publishes a host port. PostgreSQL and Redis are reachable on the private Docker network and are not published on the public interface. Local development may bind them to `127.0.0.1` through the override file.
- **AC-12**: Compose passes each secret only to the services listed in PRD section 71.1. No single shared environment file is handed to every container.
- **AC-13**: `make lint`, `make typecheck`, `make test`, and `make check` exist and run clean on the delivered skeleton.
- **AC-14**: Type checking runs in strict mode for the directories PRD section 85.1 lists as critical financial modules, and a `float` in a monetary or quantity signature is reported.
- **AC-15**: CI runs lint, type check, unit tests, migration validation from empty to head plus a re-run proving no-op, the safety tests, the frontend build, and the bootstrap verification. CI holds no live credentials and runs with `APP_ENV=development` and `TRADING_MODE=paper`.
- **AC-16**: Alembic is initialised and runs from empty to head against the Compose database. A second run is a no-op. A model versus migration drift check exists and fails when a model changes without a migration.
- **AC-17**: The three health endpoints exist and are distinct: `/health/live`, `/health/ready`, `/health/trading`. In Foundation 0, `/health/live` reports process liveness, `/health/ready` reports database and Redis reachability plus schema at expected head, and `/health/trading` reports not ready with a machine readable reason list, because the checks it depends on are not built yet.
- **AC-18**: Safety tests exist and pass, asserting each of these independently: `APP_ENV=development` with `TRADING_MODE=live` fails to start; `LIVE_TRADING_ENABLED=false` is the committed default; the paper and live configuration cannot resolve to the same database name or Redis prefix; `/health/trading` never reports ready while its preconditions are unbuilt.

### Explicitly out of scope
- Domain models, business tables, and hypertables (belongs to Foundation 1)
- Exchange adapter, CCXT integration, and Binance market data streaming (belongs to Foundation 2)
- Market data ingestion workers, Redis stream definitions, and consumer groups (belongs to Foundation 2)
- Portfolio accounting, paper execution, reconciliation, and idempotency tables (belongs to Foundation 3)
- Risk Engine implementation and rule evaluation (belongs to Foundation 4)
- Quantitative analytics and opportunity detection (belongs to Foundation 5)
- Strategy registry and vectorbt backtesting (belongs to Foundation 6)
- Hermes tools, agent runtime, and trading skills (belongs to Foundation 7 and Foundation 8)
- Social and news intelligence pipelines (belongs to Foundation 9)
- TradingAgents specialist research escalation (belongs to Foundation 10)
- Dashboard UI pages, components, and owner authentication (belongs to Foundation 11)
- Live Binance trading execution and key handling (belongs to Foundation 12)
- Prometheus and Grafana monitoring containers (owned by Foundation 11; required before Gate 5)
- Root AGENTS.md documentation (owned by /audit)

---

## Foundation 1: PostgreSQL, TimescaleDB, pgvector, Redis, Domain Models

**Goal:** Establish the core domain models, asynchronous database engine, relational tables, TimescaleDB hypertables, pgvector embedding storage, and Redis event infrastructure for all trading and financial state.
**Depends on:** 0
**Unlocks:** 2, 3, 4, 5, 6, 7
**PRD sections:** 20, 26, 27, 28, 29, 30, 31, 33, 34, 43, 55, 56, 68, 69, 83, 85, 92, 95
**Release gate:** none

### Deliverables
- `packages/domain/` containing typed value objects, fixed-precision financial Decimals, and domain entities representing all PRD section 83 objects.
- `packages/database/` providing an asynchronous SQLAlchemy 2.0 engine, `asyncpg` connection pooling, session lifecycle management, and transaction unit-of-work helpers.
- SQLAlchemy ORM models for all relational tables, TimescaleDB hypertables, and pgvector knowledge embedding tables.
- Alembic migration suite creating all relational tables, hypertables with time chunking, pgvector tables with vector indexes, and database-level unique constraints.
- `packages/events/` providing Redis client managers, stream publishing/consuming abstractions, consumer group management, and environment/trading-mode key prefix isolation.
- Unit and integration test suite validating schema migrations, database constraints, Decimal precision, vector queries, and Redis namespace isolation.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 1.1 | Financial value objects, monetary Decimal types, and domain enums | `packages/domain/` value objects (Price, Quantity, Notional, Fee, Balance, PnL) using fixed-precision `Decimal`, and domain enums (TradingMode, AppEnv, OrderSide, OrderType, ExecutionStatus, RiskDecisionType, MarketRegime, ApprovalStatus) | - | AC-1.1, AC-1.2 |
| 1.2 | Domain entities for market data, quantitative analytics, and knowledge embeddings | `packages/domain/` entity classes for Asset, Market, Candle, MarketEvent, IndicatorSnapshot, MarketRegime, Opportunity, TradingSkill, and KnowledgeEmbedding with vector attributes | 1.1 | AC-1.2, AC-1.3 |
| 1.3 | Domain entities for trade proposals, risk decisions, approvals, execution, portfolio, and audit | `packages/domain/` entity classes for TradeProposal, RiskDecision, OwnerApproval, ExecutionRequest, IdempotencyKey, Order, Execution, Fill, Position, PortfolioAccount, PortfolioEntry, Trade, ReconciliationRun, ReconciliationDivergence, RiskConfigVersion, and AuditRecord | 1.1 | AC-1.1, AC-1.4, AC-1.5 |
| 1.4 | Async database engine, connection pool management, and transaction unit-of-work | `packages/database/` engine configuration, `asyncpg` connection pooling, session factory, statement timeouts, and transactional context managers | - | AC-1.6 |
| 1.5 | SQLAlchemy relational models for trading intent, portfolio accounting, risk, and append-only audit log | SQLAlchemy models for portfolio_accounts, portfolio_entries, idempotency_keys, orders, executions, fills, positions, trades, trade_proposals, risk_decisions, owner_approvals, execution_requests, strategies, strategy_versions, backtests, skills, risk_rules, risk_config_versions, system_config, audit_log, reconciliation_runs, reconciliation_divergences, agent_observations, and agent_decisions | 1.3, 1.4 | AC-1.4, AC-1.5, AC-1.7 |
| 1.6 | SQLAlchemy TimescaleDB hypertable models for candles, trades, indicators, signals, and portfolio snapshots | Hypertable model definitions for market_candles, market_trades, indicator_snapshots, market_events, social_metrics, signal_events, and portfolio_snapshots | 1.2, 1.4 | AC-1.8 |
| 1.7 | SQLAlchemy pgvector model `trading_knowledge_embeddings` for knowledge embeddings and similarity search | Vector embedding model `trading_knowledge_embeddings` with pgvector column, metadata JSONB, and cosine/L2 distance search helpers | 1.2, 1.4 | AC-1.9 |
| 1.8 | Alembic migration suite for relational tables, hypertables, pgvector tables, and schema constraints | Alembic revisions creating relational tables, hypertables with time chunking, pgvector tables with vector indexes, and database-level unique constraints | 1.5, 1.6, 1.7 | AC-1.7, AC-1.8, AC-1.9, AC-1.10 |
| 1.9 | Redis client, stream abstraction with consumer groups, and namespacing isolation | `packages/events/` Redis client wrapper with key prefixing derived from `APP_ENV` and `TRADING_MODE`, plus Redis Streams publishing and consumer group handling | - | AC-1.11, AC-1.12 |
| 1.10 | Database and domain integration test suite | Tests verifying Decimal enforcement, Alembic migration idempotency, model drift detection, unique constraints, hypertable chunking, vector nearest neighbor search, and Redis namespace isolation | 1.8, 1.9 | AC-1.1, AC-1.7, AC-1.8, AC-1.9, AC-1.10, AC-1.11, AC-1.12 |

### Acceptance criteria
- **AC-1.1**: Every monetary, price, quantity, fee, balance, and P&L domain attribute uses `Decimal` with fixed precision; any attempt to instantiate a financial domain model with binary `float` raises a validation error.
- **AC-1.2**: Domain models and enums represent all PRD Section 83 entities, with explicit `trading_mode` tagging on every financial object and correlation identifiers on every proposal, decision, approval, execution, and fill entity.
- **AC-1.3**: Knowledge base domain models support vector embedding representations with configurable dimensions and metadata filtering.
- **AC-1.4**: `idempotency_keys` table enforces a database-level unique constraint on `(key, trading_mode)`, preventing duplicate command records.
- **AC-1.5**: `fills` table enforces a database-level unique constraint on `(exchange_trade_id, symbol, trading_mode)`, preventing duplicate fill application.
- **AC-1.6**: `packages/database/` provides asynchronous connection pooling via `asyncpg` with configurable statement timeouts, pool sizing, and transaction context managers.
- **AC-1.7**: Alembic migrations create all relational tables with strict `Numeric` column types and foreign key relationships; running migrations from empty to head and re-running produces a clean no-op without schema drift.
- **AC-1.8**: TimescaleDB hypertables (`market_candles`, `market_trades`, `indicator_snapshots`, `market_events`, `social_metrics`, `signal_events`, `portfolio_snapshots`) are created with time partitioning via Alembic migrations.
- **AC-1.9**: pgvector table for knowledge embeddings is created with an approximate nearest neighbor vector index (HNSW or IVFFlat), and similarity query returns expected nearest neighbors.
- **AC-1.10**: `audit_log` table is created with append-only design principles, carrying actor, timestamp, trading mode, correlation IDs, and payload, with no update or delete triggers.
- **AC-1.11**: Redis client enforces key prefix isolation derived from `APP_ENV` and `TRADING_MODE`, preventing key collisions between paper and live environments.
- **AC-1.12**: Redis Streams client provides typed wrappers for publishing events and consuming via consumer groups with ACK, auto-claim, and backoff.

### Explicitly out of scope
- Exchange adapter and Binance market data ingestion (belongs to Foundation 2)
- Redis stream message ingestion workers and gap filling (belongs to Foundation 2)
- Portfolio accounting calculation logic and paper broker simulation (belongs to Foundation 3)
- Exchange reconciliation workers and divergence resolvers (belongs to Foundation 3)
- Risk Engine rule execution and limit checks (belongs to Foundation 4)
- Technical indicator math and regime classification (belongs to Foundation 5)
- Strategy registry services and backtesting execution (belongs to Foundation 6)
- Hermes agent integration and skill execution (belongs to Foundation 7 and Foundation 8)
- Dashboard frontend components and owner authentication (belongs to Foundation 11)
- Live exchange execution (belongs to Foundation 12)

---

## Foundation 2: Market Data Pipeline

**Goal:** Build the real-time and historical market data pipeline ingesting BTC and ETH spot data from Binance via CCXT Pro and REST, publishing to Redis Streams, persisting to TimescaleDB, and detecting feed staleness.
**Depends on:** 0, 1
**Unlocks:** 3, 5, 9, 11
**PRD sections:** 28, 31, 32, 33, 34, 56, 58, 66, 68, 73, 75, 82, 85, 92, 95
**Release gate:** none

### Deliverables
- `packages/exchange/` containing the abstract `ExchangeAdapter` contract and CCXT/CCXT Pro Binance adapter implementation with normalized data models and error handling.
- `services/market-data/` containing the real-time WebSocket ingestion worker, Redis Streams publisher, and gap detection/backfill service.
- TimescaleDB market data persistence worker consuming from Redis Streams with batch upsert into `market_candles` and `market_trades`.
- Feed health and staleness monitor tracking message timestamps against `market_data_max_age_seconds` and updating readiness state.
- `apps/api` market data REST routes for historical candles, tickers, order books, trades, and symbol metadata.
- End-to-end integration and failure recovery test suite validating WebSocket reconnects, gap backfilling, persistence, and staleness detection.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 2.1 | `ExchangeAdapter` abstract base interface and standardized market data response models | `packages/exchange/` abstract interface defining market data methods, canonical symbol normalization (`BTC/USDT`, `ETH/USDT`), Decimal parsing, and error classification hierarchy | - | AC-2.1, AC-2.2 |
| 2.2 | Binance CCXT REST adapter implementing market data, symbol info, rate limiting, and server time | `BinanceExchangeAdapter` REST implementation in `packages/exchange/` supporting historical candles, order book, recent trades, symbol precision/filter queries, and rate-limit tracking | 2.1 | AC-2.1, AC-2.3, AC-2.4 |
| 2.3 | Binance CCXT Pro WebSocket streaming client for candles, trades, and ticker data | Async WebSocket client in `packages/exchange/` streaming 1m/15m/1h/4h candles, trade prints, and order book top-of-book with automatic backoff reconnection | 2.1, 2.2 | AC-2.1, AC-2.5 |
| 2.4 | Market data ingestion worker publishing normalized streams to Redis | `services/market-data/` ingestion worker publishing normalized ticker, trade, and candle events to Redis Streams (`stream:market:candles`, `stream:market:trades`, `stream:market:tickers`) | 2.3 | AC-2.5, AC-2.6 |
| 2.5 | Historical candle backfill and gap detection service across configured timeframes | Automated gap detector on WebSocket reconnect triggering REST historical backfills to guarantee unbroken candle series in database | 2.2, 2.4 | AC-2.7 |
| 2.6 | TimescaleDB persistence worker consuming market data streams with batch upsert | Persistence worker in `services/market-data/` consuming Redis Streams via consumer group and executing batch upserts into `market_candles` and `market_trades` hypertables | 2.4, 2.5 | AC-2.8 |
| 2.7 | Market data staleness detector and feed health monitor | Health monitor tracking latest tick/candle age per symbol and timeframe, setting staleness flags when exceeding `market_data_max_age_seconds` | 2.4 | AC-2.9 |
| 2.8 | Market data REST API routes and OpenAPI schemas in `apps/api` | REST endpoints (`/api/v1/markets/candles`, `/api/v1/markets/ticker`, `/api/v1/markets/trades`, `/api/v1/markets/symbols`) with query filtering and pagination | 2.6, 2.7 | AC-2.10 |
| 2.9 | End-to-end integration and failure recovery test suite for market data pipeline | Integration tests testing WebSocket disconnects, exponential backoff, gap backfilling, persistence batching, and staleness threshold triggers | 2.4, 2.5, 2.6, 2.7, 2.8 | AC-2.5, AC-2.7, AC-2.9, AC-2.11 |

### Acceptance criteria
- **AC-2.1**: `ExchangeAdapter` interface is defined in `packages/exchange/` and implemented for Binance using CCXT/CCXT Pro with Decimal types and canonical symbols (`BTC/USDT`, `ETH/USDT`).
- **AC-2.2**: Exchange errors are normalized into platform categories (`RETRYABLE`, `RATE_LIMITED`, `AUTH_FAILED`, `PERMANENT`, `UNKNOWN_STATE`) with raw error context preserved in structured logs.
- **AC-2.3**: Symbol information query loads precision, minimum notional, step size, and trading status for `BTC/USDT` and `ETH/USDT`.
- **AC-2.4**: Rate limit state is tracked from exchange response headers and throttles requests before hitting 429 errors.
- **AC-2.5**: WebSocket streaming worker maintains real-time feeds for ticker, trades, and candles (1m, 15m, 1h, 4h) into Redis Streams with consumer group support.
- **AC-2.6**: WebSocket disconnections trigger automatic exponential backoff reconnection, logging the disconnect duration.
- **AC-2.7**: Reconnection automatically detects time gaps in candle series and executes REST backfill to ensure contiguous history in TimescaleDB.
- **AC-2.8**: TimescaleDB persistence worker batches stream events and inserts candles and trades into hypertables with idempotent upsert on `(timestamp, symbol, timeframe)`.
- **AC-2.9**: Market data staleness monitor marks feed as stale and updates `/health/trading` readiness when the latest candle or ticker age exceeds `market_data_max_age_seconds`.
- **AC-2.10**: REST API endpoints `/api/v1/markets/candles`, `/api/v1/markets/ticker`, `/api/v1/markets/trades`, and `/api/v1/markets/symbols` return historical and current data matching OpenAPI specifications.
- **AC-2.11**: CI integration tests verify WebSocket reconnect, stream recovery, gap fill, and persistence against mock or recorded exchange feeds without live exchange keys.

### Explicitly out of scope
- Order placement, order cancellation, and account queries on exchange adapter (belongs to Foundation 3 and Foundation 12)
- Portfolio accounting and position tracking (belongs to Foundation 3)
- Simulated paper execution adapter (belongs to Foundation 3)
- Exchange balance and order reconciliation (belongs to Foundation 3)
- Risk Engine controls and validation (belongs to Foundation 4)
- Quantitative technical indicators and market regime detection (belongs to Foundation 5)
- Opportunity scanner (belongs to Foundation 5)
- Social and news intelligence data feeds (belongs to Foundation 9)

---

## Foundation 3: Portfolio Accounting, Paper Execution, Reconciliation

**Goal:** Build deterministic portfolio accounting from the fills ledger, simulated paper execution with realistic exchange constraints, command idempotency, and the multi-trigger exchange reconciliation engine.
**Depends on:** 0, 1, 2
**Unlocks:** 4, 11, 12
**PRD sections:** 25, 27, 28, 29, 30, 34, 37, 55, 68, 69, 73, 75, 76, 83, 85, 89, 90, 94, 95
**Release gate:** Gate 1 (Infrastructure)

### Deliverables
- Financial command idempotency engine enforcing pre-network persistence and database-level unique constraints.
- `ExecutionAdapter` interface and execution state machine managing `PENDING`, `SUBMITTING`, `SUBMITTED`, `PARTIALLY_FILLED`, `FILLED`, `CANCELLED`, `REJECTED`, `EXPIRED`, and `UNKNOWN` states.
- `PaperExecutionAdapter` simulating spot execution against real market data with Binance fee schedules, configurable slippage, and exchange symbol precision / step size / min notional filters.
- Double-entry ledger portfolio accounting engine deriving positions, balances, cost basis, realized P&L, and unrealized P&L from deduplicated exchange fills.
- Owner approval validation and consumption tracker enforcing proposal binding, trading mode match, and TTL expiration.
- Multi-trigger exchange reconciliation worker comparing balances, open orders, and fills, with divergence classification and automated blocking.
- Financial audit logging engine recording every state transition with correlation IDs, and lifecycle reconstruction utility.
- Portfolio and reconciliation REST API routes in `apps/api` and updated `/health/trading` readiness checks.
- Comprehensive safety, idempotency race condition, and divergence test suite.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 3.1 | Financial command idempotency engine with database-enforced unique constraints | Deterministic idempotency key derivation, pre-network insertion into `idempotency_keys`, conflict resolution returning original outcomes, and deterministic `client_order_id` generation | - | AC-3.1, AC-3.2 |
| 3.2 | `ExecutionAdapter` abstraction and execution request state machine with `UNKNOWN` state handling | `ExecutionAdapter` interface contract, execution request persistence, state machine transitions, and fail-safe `UNKNOWN` state handling blocking further orders until queried | 3.1 | AC-3.3, AC-3.4 |
| 3.3 | `PaperExecutionAdapter` with realistic fee calculation, slippage modeling, and exchange filter enforcement | Paper execution adapter simulating fills against current market data without look-ahead, applying fee schedules, configurable slippage, and Binance symbol filters | 3.2 | AC-3.5, AC-3.6 |
| 3.4 | Immutable fill ledger with exchange trade ID deduplication in `services/portfolio/` | Append-only `fills` ledger service enforcing database-level unique constraint on `(exchange_trade_id, symbol, trading_mode)` | - | AC-3.7 |
| 3.5 | Deterministic position and balance derivation engine using fixed-precision `Decimal` | Portfolio balance and position calculator deriving cash balances, open quantities, average entry prices, realized P&L, and mark-to-market unrealized P&L strictly in `Decimal` | 3.4 | AC-3.7, AC-3.8 |
| 3.6 | Owner approval binding, consumption tracking, and TTL expiration validation | Approval verification engine validating exact proposal attributes, trading mode matching, submission-time TTL evaluation against `expires_at`, and one-time consumption | 3.1 | AC-3.9 |
| 3.7 | Portfolio snapshot generator for TimescaleDB time-series history | Periodic and event-triggered portfolio snapshot worker writing equity, cash, exposure, and unrealized P&L to `portfolio_snapshots` hypertable | 3.5 | AC-3.10 |
| 3.8 | Multi-trigger exchange reconciliation engine with divergence classification | Reconciliation worker in `services/reconciliation/` running on startup, periodic intervals, reconnects, uncertainty, and manual trigger, comparing platform state with exchange/paper-adapter state | 3.4, 3.5 | AC-3.11, AC-3.12 |
| 3.9 | Reconciliation blocking flag and recovery state management | Persistent `reconciliation_blocked` flag handling, blocking live and paper executions on `UNEXPECTED_*` or `CRITICAL` divergence, with owner acknowledgement workflow | 3.8 | AC-3.12, AC-3.13 |
| 3.10 | Financial audit logger and end-to-end lifecycle reconstruction tool | Append-only audit logger capturing all proposals, decisions, approvals, orders, fills, and reconciliations with `correlation_id`, plus trade timeline reconstruction utility | 3.1, 3.2, 3.5, 3.8 | AC-3.14 |
| 3.11 | Portfolio and reconciliation REST API endpoints in `apps/api` | REST endpoints for `/api/v1/portfolio/accounts`, `/api/v1/portfolio/positions`, `/api/v1/portfolio/trades`, and `/api/v1/reconciliation/runs` with OpenAPI documentation | 3.5, 3.8 | AC-3.15 |
| 3.12 | Integration with `/health/trading` evaluating portfolio health and reconciliation status | `/health/trading` check implementation evaluating database schema, portfolio balance consistency, reconciliation status, and unblocked state | 3.8, 3.9, 3.11 | AC-3.16 |
| 3.13 | Comprehensive financial safety, idempotency race condition, and divergence test suite | Automated CI test suite proving idempotency race safety, duplicate fill deduplication, `UNKNOWN` state recovery, paper execution realism, divergence blocking, and audit reconstruction | 3.1, 3.2, 3.3, 3.4, 3.5, 3.8, 3.9, 3.10, 3.12 | AC-3.1, AC-3.2, AC-3.4, AC-3.7, AC-3.11, AC-3.17 |

### Acceptance criteria
- **AC-3.1**: Deterministic idempotency key is persisted to PostgreSQL before any network call or simulation; concurrent duplicate execution requests with the same idempotency key result in exactly one order creation and return the original outcome.
- **AC-3.2**: `client_order_id` is derived deterministically from the idempotency key and passed to exchange adapters.
- **AC-3.3**: Execution state machine strictly enforces valid state transitions (`PENDING` -> `SUBMITTING` -> `SUBMITTED` -> `PARTIALLY_FILLED` -> `FILLED`, `CANCELLED`, `REJECTED`, `EXPIRED`).
- **AC-3.4**: Network timeouts and ambiguous responses transition execution state to `UNKNOWN`; `UNKNOWN` state blocks subsequent orders for that account until resolved by exchange query, never by blind retry.
- **AC-3.5**: `PaperExecutionAdapter` executes simulated spot trades against real market data without look-ahead, applying Binance fee schedules, configurable slippage, and exchange symbol precision, step size, and minimum notional filters.
- **AC-3.6**: Paper execution rejects orders that exceed available simulated balance or violate exchange minimum notional rules.
- **AC-3.7**: Fills are written to the `fills` ledger deduplicated by `(exchange_trade_id, symbol, trading_mode)`; delivering the same fill twice produces no change in account balance, position size, or average entry price.
- **AC-3.8**: Positions, cost basis, realized P&L, and unrealized P&L are derived deterministically from the fill ledger using `Decimal` arithmetic with zero floating-point math.
- **AC-3.9**: Owner approval binding verifies proposal attributes, ensures trading mode match, validates `approval_ttl_seconds` against `expires_at` at submission time, and marks approval consumed.
- **AC-3.10**: Portfolio snapshots are recorded to TimescaleDB on fills and periodic intervals, tracking total equity, cash, unrealized P&L, and asset exposures.
- **AC-3.11**: Reconciliation engine runs on startup, periodically, after reconnects, and on demand, comparing platform balances, open orders, and fills against exchange or paper-adapter state.
- **AC-3.12**: Reconciliation classifies divergences (`INFORMATIONAL`, `RESOLVABLE`, `UNEXPECTED_ORDER`, `UNEXPECTED_BALANCE`, `UNKNOWN_EXECUTION`, `CRITICAL`); `RESOLVABLE` fills are applied idempotently, while `UNEXPECTED_*` and `CRITICAL` set `reconciliation_blocked`.
- **AC-3.13**: While `reconciliation_blocked` is set, all new live and paper order submissions are refused; clearing `CRITICAL` requires explicit owner acknowledgement.
- **AC-3.14**: Financial audit log captures every proposal, risk decision, approval, execution request, order, fill, position update, and reconciliation divergence with `correlation_id`; full lifecycle reconstruction test reproduces the complete timeline from `correlation_id`.
- **AC-3.15**: REST APIs expose `/api/v1/portfolio/accounts`, `/api/v1/portfolio/positions`, `/api/v1/portfolio/trades`, and `/api/v1/reconciliation/runs` with OpenAPI documentation.
- **AC-3.16**: `/health/trading` includes checks for database schema, portfolio consistency, reconciliation status, and unblocked state.
- **AC-3.17**: Release Gate 1 criteria for portfolio accounting, idempotency, and reconciliation pass all automated tests in CI.

### Explicitly out of scope
- Risk Engine rule execution and limit checks (belongs to Foundation 4)
- Opportunity scanner and quantitative indicator engine (belongs to Foundation 5)
- Strategy registry and vectorbt backtesting (belongs to Foundation 6)
- Hermes agent tools, prompts, and memory (belongs to Foundation 7 and Foundation 8)
- Live Binance API keys and live execution adapter (belongs to Foundation 12)
- Dashboard UI components and TOTP owner authentication (belongs to Foundation 11)
