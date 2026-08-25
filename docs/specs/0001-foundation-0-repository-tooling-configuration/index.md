# 0001. Foundation 0: repository, tooling, configuration, Docker, CI

**Date**: 2026-08-16
**Status**: Proposed

## Summary

Foundation 0 builds the empty, safe skeleton every later foundation grows inside. It creates the repository layout, installs the Python and Node tooling, adds typed configuration that refuses unsafe settings at startup, brings up PostgreSQL and Redis in Docker, and wires a CI pipeline that runs lint, type checks, tests, and migrations.

It deliberately builds no trading behaviour. No market data, no portfolio, no risk engine, no orders. The one thing it does prove is that the safety rails work: the system starts in paper mode with live trading switched off, and it will not boot at all if the configuration says something dangerous.

The reason to do this first is that every later foundation reads configuration, connects to a database, and runs in CI. If those are wrong, every foundation after it inherits the fault. The PRD calls Foundation 0 a prerequisite for all other foundations.

Full reasoning, options weighed, and the recommendation split lives in [rationale.md](rationale.md).

## Requirements

**User stories**

- As the owner, I want a single documented command sequence to bring the project up on a new machine, so starting work does not begin with a debugging session.
- As the owner, I want the committed defaults to be paper mode with live trading disabled, so a fresh clone or a forgotten setting cannot risk real money.
- As the owner, I want the system to refuse to start on a contradictory or unsafe configuration, so a mistake surfaces at boot rather than during a trade.
- As a developer or coding agent, I want lint, type checks, and tests runnable by one command each, locally and in CI, so correctness is cheap to confirm.
- As a developer or coding agent, I want a place for every later foundation to put its code that is already agreed, so structure is not reinvented per slice.

**Acceptance criteria**

Grouped for readability. Each is independently checkable.

Repository and bootstrap

- **AC-1**: A clean clone reaches a running local system through the documented sequence only: `cp .env.example .env`, `uv sync`, `pnpm install`, `docker compose up -d`, `uv run alembic upgrade head`. No undocumented manual step is required.
- **AC-2**: `uv sync` succeeds on a machine with no TA-Lib system library present, and no live exchange credentials anywhere.
- **AC-3**: The repository contains the agreed directory skeleton, and each directory a later foundation will fill is present with a short `README.md` stating what belongs there and which foundation fills it.

Configuration and environment safety

- **AC-4**: Configuration loads through typed settings objects. A missing or wrong typed value fails at startup with a message naming the offending field.
- **AC-5**: Committed defaults are `APP_ENV=development`, `TRADING_MODE=paper`, `LIVE_TRADING_ENABLED=false`, `spot_only=true`, `leverage_enabled=false`, symbol allowlist `BTC/USDT` and `ETH/USDT`, `require_owner_approval=true`, `approval_ttl_seconds=300`, `approval_ttl_max_seconds=900`.
- **AC-6**: Every cross field rule in PRD section 66.4 is enforced at startup and rejects rather than warns. `TRADING_MODE=live` with `APP_ENV=development` is refused. `LIVE_TRADING_ENABLED=true` with `TRADING_MODE=paper` is refused. `TRADING_MODE=live` with missing live exchange credentials is refused. `leverage_enabled=true` or `spot_only=false` with `TRADING_MODE=live` is refused. A symbol outside the allowlist is refused. Paper and live sharing a database name or Redis prefix is refused. `approval_ttl_seconds` at or below zero, or above `approval_ttl_max_seconds`, is refused. `market_data_max_age_seconds` at or below zero is refused. `require_owner_approval=false` with `TRADING_MODE=live` is refused.
- **AC-7**: Resolved non secret configuration is logged once at startup. `APP_ENV`, `TRADING_MODE`, and `LIVE_TRADING_ENABLED` appear on every log line.

Secrets

- **AC-8**: `.env.example` is committed with every variable named in PRD section 71.1 and placeholder values only. `.env` is git ignored. A pre commit secret scan runs and blocks a commit containing a credential shaped string or a `.env` file.
- **AC-9**: A logging redaction filter is applied at the logger, not per call site. A log call attempting to emit a known secret field emits a redaction marker instead of the value, proven by test.

Docker and networking

- **AC-10**: `docker compose up -d` starts PostgreSQL with both the `timescaledb` and `vector` extensions available, and Redis. No manual extension installation step is required.
- **AC-11**: Only the reverse proxy publishes a host port. PostgreSQL and Redis are reachable on the private Docker network and are not published on the public interface. Local development may bind them to `127.0.0.1` through the override file.
- **AC-12**: Compose passes each secret only to the services listed in PRD section 71.1. No single shared environment file is handed to every container.

Quality gates

- **AC-13**: `make lint`, `make typecheck`, `make test`, and `make check` exist and run clean on the delivered skeleton.
- **AC-14**: Type checking runs in strict mode for the directories PRD section 85.1 lists as critical financial modules, and a `float` in a monetary or quantity signature is reported.
- **AC-15**: CI runs lint, type check, unit tests, migration validation from empty to head plus a re-run proving no-op, the safety tests, the frontend build, and the bootstrap verification. CI holds no live credentials and runs with `APP_ENV=development` and `TRADING_MODE=paper`.

Migrations and health

- **AC-16**: Alembic is initialised and runs from empty to head against the Compose database. A second run is a no-op. A model versus migration drift check exists and fails when a model changes without a migration.
- **AC-17**: The three health endpoints exist and are distinct: `/health/live`, `/health/ready`, `/health/trading`. In Foundation 0, `/health/live` reports process liveness, `/health/ready` reports database and Redis reachability plus schema at expected head, and `/health/trading` reports not ready with a machine readable reason list, because the checks it depends on are not built yet.

Safety tests

- **AC-18**: Safety tests exist and pass, asserting each of these independently: `APP_ENV=development` with `TRADING_MODE=live` fails to start; `LIVE_TRADING_ENABLED=false` is the committed default; the paper and live configuration cannot resolve to the same database name or Redis prefix; `/health/trading` never reports ready while its preconditions are unbuilt.

## Decision

**Chosen option**: Option 1: minimal safe skeleton, tooling and safety rails only, no service scaffolding.

Build the repository shape, dependency layers, typed configuration with startup validation, Docker Compose for PostgreSQL and Redis, one FastAPI application exposing only the three health endpoints, Alembic with an extensions only initial migration, the quality gate commands, and CI. Every directory a later foundation fills gets a placeholder `README.md` and nothing else.

**Implementation skills**: none. No installed community skill governs Python or FastAPI project bootstrap in this repository. The workflow skills (`architect`, `develop`, `check`, `test`, `audit`, `sync`) are not community skills.

## Rationale

See [rationale.md](rationale.md).

## Proposed stack

Foundation 0 selects no new product technology. Every row below is already fixed by the approved PRD, so this table records what Foundation 0 installs and configures, not a fresh choice. The Reason column states why the PRD's choice is what Foundation 0 wires in.

| Layer | Choice | Reason |
|---|---|---|
| Language, backend | Python 3.12+ | PRD section 92. Fixed. |
| Package manager, Python | `uv`, lockfile committed | PRD section 92. CI installs from `uv.lock` so a build is reproducible. |
| Dependency layering | core, quant, dev groups | PRD section 59. Keeps the TA-Lib C library out of the base install. |
| API framework | FastAPI with Uvicorn | PRD section 54. Foundation 0 exposes health endpoints only. |
| Configuration | `pydantic-settings`, typed, validated at startup | PRD section 66. Refuses unsafe combinations rather than warning. |
| Database | PostgreSQL with `timescaledb` and `vector` extensions | PRD sections 55.2 and 92. Extensions created in the first migration. |
| Migrations | Alembic, forward only in production | PRD section 55.1. Required from the first table. |
| Cache and streams | Redis | PRD section 56. Foundation 0 confirms reachability only. |
| Language, frontend | TypeScript, strict | PRD sections 64 and 86.2. |
| Package manager, Node | `pnpm` | PRD section 92. |
| Frontend framework | Next.js | PRD section 64. Foundation 0 installs the workspace, builds no dashboard. |
| Lint and format, Python | `ruff` | PRD section 86.1. One tool for both. |
| Type checking, Python | `mypy`, strict on financial modules | PRD sections 86.1 and 85.1. Recommendation between `mypy` and `pyright`, see rationale. |
| Testing, Python | `pytest`, `pytest-asyncio`, `pytest-cov` | PRD section 86.1. |
| Lint, format, types, frontend | `eslint`, `prettier`, `tsc --noEmit` | PRD section 86.2. |
| Pre commit | `pre-commit` with secret scanning | PRD section 86.3. |
| Containers | Docker and Docker Compose | PRD section 67. No Kubernetes. |
| Reverse proxy | Caddy | PRD sections 67 and 92 allow Caddy or Nginx. Recommendation, see rationale. |
| CI | GitHub Actions | Inferred from the `origin` remote on GitHub. Recommendation, see rationale. |
| Task runner | `Makefile` | PRD sections 82.1 and 92. Same commands locally and in CI. |
| Logging | structured JSON, UTC, redaction filter at the logger | PRD sections 68.2 and 71.2. |

## Scope

**In scope**

- Repository and workspace layout, with placeholder `README.md` per future directory.
- `pyproject.toml` with the three dependency groups, and a committed `uv.lock`.
- Node workspace via `pnpm`, with the `apps/web` package present and building.
- Typed configuration modules for every PRD section 66.2 category, with startup validation.
- `.env.example`, `.gitignore` hardening, pre commit hooks including secret scanning.
- `docker-compose.yml` and `docker-compose.override.yml.example` running PostgreSQL (TimescaleDB and pgvector), Redis, and a minimal Caddy reverse proxy on a private Docker network with service-scoped secret passing.
- Alembic initialised, with one migration that creates the two required extensions and nothing else.
- One FastAPI application exposing `/health/live`, `/health/ready`, `/health/trading` only.
- Structured JSON logging with the redaction filter and correlation identifier plumbing.
- `Makefile` targets, and a GitHub Actions workflow.
- The safety test suite for AC-18, and tests for configuration validation and redaction.

**Out of scope, and which foundation owns it**

- Domain models, business tables, hypertables: Foundation 1. Foundation 0 ships only the extensions migration.
- Exchange adapter, CCXT, any Binance call: Foundation 2 and later.
- Market data ingestion, Redis stream definitions, consumer groups: Foundation 2.
- Portfolio accounting, paper execution, reconciliation, idempotency tables: Foundation 3.
- Risk engine: Foundation 4.
- Owner authentication, TOTP, session cookies, approval endpoints: the dashboard and live path, Foundations 11 and 12. Foundation 0 reserves `DASHBOARD_AUTH_SECRET` in `.env.example` and implements no authentication.
- Service tokens for Hermes and TradingAgents: Foundation 7. Foundation 0 reserves the variables only.
- Prometheus and Grafana containers: owned by Foundation 11. Required before live trading (Gate 5).
- Dashboard pages and components: Foundation 11.
- Root `AGENTS.md`: owned by `/audit`, scope feature 2. This skill must not write it.
- Any live credential, any live code path.

**Explicit non goals**

- No trading logic of any kind, not even a stub that could later be mistaken for one.
- No `ExchangeAdapter` or `ExecutionAdapter` interface definition. Those belong with their first real implementation, and writing them now would fix a contract before the code that must satisfy it exists.
- No premature service directories beyond a placeholder note.

## Design detail

**Repository layout**

Matches PRD section 82, with the Foundation 0 files added. Directories marked `placeholder` contain only a `README.md` in this foundation.

```text
ai-trader/
├── apps/
│   ├── web/                      Next.js workspace, builds, no dashboard pages
│   └── api/                      FastAPI app, health endpoints only
├── services/                     placeholder, Foundations 2 to 5
├── agent/                        placeholder, Foundation 7
├── skills/trading/               placeholder, Foundation 7
├── strategies/                   placeholder, Foundation 6
├── packages/
│   ├── config/                   typed settings, THIS foundation
│   ├── logging/                  JSON logging + redaction, THIS foundation
│   ├── domain/                   placeholder, Foundation 1
│   ├── exchange/                 placeholder, Foundation 2
│   ├── database/                 engine/session wiring, THIS foundation
│   └── events/                   placeholder, Foundation 2
├── migrations/alembic/           extensions migration only
├── infrastructure/
│   ├── docker/                   Dockerfiles, DB init
│   └── caddy/                    reverse proxy config
├── tests/
│   ├── unit/                     config validation, redaction
│   └── safety/                   AC-18 suite
├── docs/
├── pyproject.toml   uv.lock   package.json   pnpm-workspace.yaml
├── docker-compose.yml   docker-compose.override.yml.example
├── .env.example   Makefile   .pre-commit-config.yaml   .gitignore   README.md
```

**Configuration shape**

One typed settings class per PRD section 66.2 category, composed into a root settings object. Cross field validation runs after field validation, so an error names a field rather than a whole object. Configuration is read once at startup and treated as immutable; changing a trading relevant value requires a restart, per PRD section 66.1.

**Secret to service mapping**

Compose passes secrets per PRD section 71.1. In Foundation 0 the only services that exist are the API, the database, Redis, and the proxy, so only `DATABASE_URL`, `REDIS_URL`, and `DASHBOARD_AUTH_SECRET` are consumed. The rest are named in `.env.example` and left unset. Notably, no exchange variable is passed to any container in this foundation.

**Networking boundaries**

The proxy is the only service publishing a host port. The database and Redis attach to the private network with no published port in the committed file; the override example shows a `127.0.0.1` binding for local inspection. This matches PRD section 67.1 and means the committed configuration is the safe one.

**Health endpoint semantics**

The three endpoints are distinct from the start, per PRD section 75. `/health/trading` must be built now and must report not ready, listing unbuilt preconditions as machine readable reasons. Building it later invites the mistake PRD section 75 exists to prevent, which is inferring safe to trade from process health.

**Logging**

JSON, one event per line, UTC timestamps, carrying service name, `APP_ENV`, `TRADING_MODE`, and any correlation identifiers in scope. Redaction is a filter installed on the logger so a new call site cannot forget it.

## Build plan

Ordered as a Tracer Bullet, the project default recorded in `docs/scope/scope.md`. The thread is thin and vertical: configuration to database to API to CI, proving the whole path end to end before anything is thickened.

1. Repository skeleton, `pyproject.toml` with the three dependency groups, `uv.lock`, `pnpm` workspace, placeholder `README.md` files, `.gitignore` hardening. Satisfies **AC-2**, **AC-3**.
2. Typed configuration package with all PRD section 66.2 categories and safe defaults. Satisfies **AC-4**, **AC-5**.
3. Cross field startup validation for every PRD section 66.4 rule. Satisfies **AC-6**.
4. Structured JSON logging with the redaction filter and startup configuration log. Satisfies **AC-7**, **AC-9**.
5. `.env.example`, pre commit hooks, secret scanning. Satisfies **AC-8**.
6. Docker Compose for PostgreSQL with both extensions, Redis, and a minimal Caddy reverse proxy, with the networking boundary. Satisfies **AC-10**, **AC-11**, **AC-12**.
7. Alembic initialised, extensions migration, drift check. Satisfies **AC-16**.
8. FastAPI application with the three health endpoints and database plus Redis wiring. Satisfies **AC-17**.
9. `Makefile` targets, `ruff`, `mypy` strict on financial paths, `pytest`, frontend lint, format, and type check. Satisfies **AC-13**, **AC-14**.
10. Safety test suite, configuration validation tests, redaction test. Satisfies **AC-18**.
11. GitHub Actions workflow including migration validation and bootstrap verification. Satisfies **AC-15**.
12. Confirm the documented bootstrap sequence from a clean clone. Satisfies **AC-1**.

## Verification strategy

Detailed steps live in [verify.md](verify.md). In outline:

- Bootstrap is verified from a genuinely clean clone in CI, not from the developer's warm working copy, because documented setup instructions that nobody executes do not work.
- Configuration safety is verified by asserting each rejection independently. A single test that passes a fully valid configuration would prove nothing about the guards.
- Extension availability is verified by querying the database for both extensions, not by trusting the image tag.
- Redaction is verified by attempting to log a secret and asserting the value is absent from the output.
- Migration idempotency is verified by running to head twice and asserting the second run changes nothing.

## Consequences

**Positive**

- Every later foundation starts against working configuration, database, migrations, and CI.
- The dangerous defaults problem is solved once, centrally, and enforced by tests that fail loudly if a guard is later simplified away.
- The bootstrap path is proven by machine, so onboarding a developer or a coding agent does not depend on tribal memory.

**Negative, and the tradeoffs accepted**

- Foundation 0 delivers no user visible or trading behaviour. It is pure groundwork, and its value is only visible later.
- The strict startup validation will occasionally block a developer who wanted a quick unusual local combination. That friction is intended, and it is the cost of refusing to let a mistake reach a trade.
- Building `/health/trading` before its checks exist means shipping an endpoint that always reports not ready, which looks odd until Foundation 3.
- Placeholder directories add mild clutter for a real gain, which is that later foundations do not each invent a layout.

**Neutral**

- Dependency groups mean a developer touching indicators must install the quant layer deliberately.
- Choosing `mypy` and Caddy and GitHub Actions can be revisited cheaply while no code depends on them, and expensively later.

## Follow-up

- [ ] `/audit` writes root `AGENTS.md` once the real scaffold exists, scope feature 2. Not this skill's artifact.
- [ ] Verify the `vector` extension inside the TimescaleDB image during implementation, and add a custom Dockerfile only if it is absent. Confirmed decision 1.
- [ ] Prometheus and Grafana are owned by Foundation 11 (task 11.10). Required before Gate 5. Confirmed decision 3.
- [ ] Harden the Caddy configuration for production, including TLS automation. Deliberately out of Foundation 0 per confirmed decision 4, required before Gate 5.
- [ ] Secret rotation procedure and its paper mode rehearsal, required before Gate 5, not now. PRD section 71.3.
- [ ] Backup and restore verification, required before Gate 5. PRD section 67.2.
- [ ] Reconcile the older Slice 1 plan's `src/trading/` layout with the PRD section 82 layout this spec adopts. See the note in the implementation plan.

## Decisions confirmed by the owner

All five open decisions were confirmed on 2026-08-16. They are settled and the implementation plan builds to them.

1. **PostgreSQL image**: use the TimescaleDB image first. Verify the `vector` extension during implementation by querying the running database, and create a custom image only if `vector` proves absent. Recorded because the TimescaleDB documentation confirms TimescaleDB, Toolkit, and PostGIS in `timescaledb-ha` but does not mention `pgvector`, so availability is treated as unverified until checked.
2. **Type checker**: `mypy`.
3. **Prometheus and Grafana**: deferred. Not in Foundation 0 Compose. Required before live trading, so they are confirmed before Gate 5.
4. **Reverse proxy**: Caddy, kept deliberately minimal. Foundation 0 spends no effort on production proxy configuration, TLS automation, or hardening; it proves only that the proxy is the single published entry point.
5. **Frontend workspace**: create the minimal `apps/web` workspace now to validate `pnpm`, TypeScript strict, and the frontend CI path. Build no dashboard features.

Also confirmed: `/health/trading` keeps the honest not ready state described in Design detail, and the optional cross model review of this spec was skipped.
