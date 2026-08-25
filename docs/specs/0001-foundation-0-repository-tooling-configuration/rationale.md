# Rationale: Foundation 0

Decision record for [index.md](index.md). This file holds the reasoning, the options weighed, and the traceability back to the PRD. A build never needs to load it.

---

## Context

The repository is genuinely empty of application code. A file count found 71 Python and TypeScript files, and every one of them sits inside `.agents/skills/` tooling rather than the product. There is no `pyproject.toml`, no `package.json`, no Docker Compose file, and no CI configuration. Root `AGENTS.md` does not exist yet either.

PRD v1.2 is approved and it constrains this foundation heavily. It names the runtime, the package managers, the database and its two required extensions, the configuration library, the linter, the type checker, the test runner, and the container tooling. It also states that Foundation 0 is a prerequisite for all other foundations, and it defines a Gate 0 that Foundation 0 must satisfy. So the technology question is largely settled before this spec begins. What is genuinely open is the shape: what belongs in Foundation 0, what must be refused until later, and how the safety rails are enforced rather than merely documented.

Three forces shape the answer.

The first is financial. This platform will eventually place real orders. PRD section 8 requires that a single configuration mistake can never be enough to enable live trading, and PRD section 66 requires that defaults always prefer safety. Those properties have to be built into the configuration layer at the point it is created. Retrofitting them means auditing every setting under time pressure later, which is exactly when the audit will be rushed.

The second is that later foundations will largely be built by coding agents working from these documents. An agent reading a spec has no tribal memory to fall back on. Anything left unstated becomes an invention, and inventions diverge. A directory that exists with a note saying what belongs there is worth more than a convention nobody wrote down.

The third is cost of change. Tooling choices are cheap now and expensive later. Choosing a type checker before any annotations exist costs nothing; changing it once thousands of annotations exist is a project of its own. The same holds for the dependency layering, because moving a package from the base install to an optional group after every service imports it is a refactor.

The consequence of not deciding is compounding. Every later foundation reads configuration, connects to a database, runs migrations, and runs in CI. A fault in any of those is inherited by everything built on top, and the fault is discovered at the worst moment, which is when someone is trying to debug a trade.

---

## Options considered

### Option 1: minimal safe skeleton, tooling and safety rails only

Build the repository shape, the dependency layers, typed configuration with startup validation, Compose for PostgreSQL and Redis, one application exposing only health endpoints, Alembic with an extensions only migration, the quality gate commands, and CI. Every directory a later foundation fills gets a short note and nothing else.

**Pros**

- Satisfies Gate 0 exactly, without drifting into work the PRD assigns elsewhere.
- The safety rails land with the configuration layer, which is the only honest place for them.
- Small enough to verify completely, so Foundation 1 starts on ground that has actually been checked.
- Every choice stays cheap to revise, because no product code depends on it yet.

**Cons**

- Delivers nothing a person can look at and use. Its value is entirely deferred.
- Ships a `/health/trading` endpoint that always reports not ready, which reads oddly until Foundation 3 fills in its checks.

### Option 2: scaffold every service directory with runnable stubs

Create `services/market-data`, `services/risk`, `services/execution` and the rest, each with a real entry point, a health check, and a Compose service, so the full topology is visible from day one.

**Pros**

- The eventual architecture is legible immediately.
- Later foundations begin by filling a known file rather than deciding where code goes.

**Cons**

- It fixes interfaces before the code that must satisfy them exists, which is how a wrong abstraction gets locked in early.
- An empty execution service is an attractive nuisance. A stub on the live path is the one kind of placeholder this project should never carry, because a stub that looks finished invites someone to wire it up.
- Compose grows a set of containers that do nothing, so operational noise arrives before any operational value.
- It contradicts the instruction to keep Foundation 0 minimal, and it borrows scope from Foundations 2 through 5.

### Option 3: bare minimum, defer configuration validation and CI

Get the repository, dependencies, and Compose working. Leave the cross field validation, the safety tests, and the pipeline for a later pass once there is something substantial to validate.

**Pros**

- Reaches a running database fastest.
- Less upfront work before Foundation 1 can begin.

**Cons**

- The validation is the point. Without it Foundation 0 is a directory layout with a database attached, and Gate 0 is not met.
- Safety guards added after the fact are audits rather than design, and they are written by someone who has since forgotten which combinations were dangerous.
- CI added late means every commit before it was unverified, and the first pipeline run surfaces a backlog of failures with no clear owner.

### Option 4: heavyweight monorepo tooling

Adopt a dedicated monorepo build system for task orchestration, caching, and dependency graphing across the Python and Node sides.

**Pros**

- Task caching and affected package detection pay off in a large repository with many packages.
- One command vocabulary across both language ecosystems.

**Cons**

- This is one backend, one frontend, and one owner. The orchestration solves coordination problems that do not exist here.
- It adds a configuration surface and a failure mode on top of `uv` and `pnpm`, which already handle their own ecosystems well.
- PRD section 92 names a `Makefile` as the task runner, so this would be substituting a heavier tool for a decided lighter one without cause.

---

## Rationale

Option 1 is chosen because the forces in Context point at containment rather than coverage.

The financial force decides the shape of the work. The PRD's safety properties, which are safe defaults, refusal to start on a contradictory configuration, and a trading readiness gate distinct from process health, are all properties of the configuration and startup path. They cannot be delegated to a later foundation without becoming a retrofit. So Foundation 0 has to own them completely, and it has to prove them with tests that fail loudly if someone later simplifies a guard clause. That is why the safety suite is an acceptance criterion rather than a follow up.

The coding agent force decides how much structure to lay down without laying down code. Placeholder directories with a note are the compromise: they answer the question an agent would otherwise answer by guessing, at close to zero cost and with no interface committed. Option 2 answers the same question but pays for it by fixing contracts early, and it puts a stub on the live execution path. Given that the whole PRD is organised around live execution being the last capability enabled, a stub there is the wrong risk to accept for the benefit of a legible topology.

The cost of change force decides against Option 3 and Option 4 from opposite directions. Option 3 defers exactly the decisions that are cheapest now and most expensive later, and it leaves Gate 0 unmet in the process. Option 4 spends complexity on a coordination problem that a single owner project does not have, and it overrides a settled PRD choice without a reason that survives contact with the actual repository size.

One deliberate piece of apparent awkwardness is worth defending. Building `/health/trading` in Foundation 0, knowing it will report not ready until Foundation 3, looks like shipping a broken endpoint. It is the opposite. PRD section 75 exists because service running and safe to trade get conflated, and the way they get conflated is that somebody infers one from the other when the second endpoint does not exist yet. Creating it early, with an honest negative answer and machine readable reasons, means no later foundation ever has to invent the distinction under pressure.

---

## PRD requirements versus implementation recommendations

This separation was requested explicitly. Everything in the first table is fixed by the approved PRD and is not mine to change. Everything in the second is a recommendation I am making where the PRD is silent or offers a choice, and each is yours to overturn cheaply.

### Fixed by the PRD

| Item | PRD source |
|---|---|
| Python 3.12 or newer | section 92 |
| `uv`, with the lockfile committed and CI installing from it | sections 59.5 and 92 |
| Node LTS with `pnpm` | section 92 |
| Dependency layering into core, quant, and dev, keeping TA-Lib out of the base install | section 59 |
| FastAPI with Uvicorn, Pydantic, HTTPX | section 54 |
| `pydantic-settings`, typed, validated at startup, immutable at runtime | section 66.1 |
| PostgreSQL with the `timescaledb` and `vector` extensions | sections 55.2 and 92 |
| Alembic from the first table, forward only in production | section 55.1 |
| Redis | section 56 |
| Committed safe defaults, paper mode and live trading disabled | sections 66.3 and 94.7 |
| Every cross field rejection rule | section 66.4 |
| The named secrets, `.env.example` committed and `.env` ignored, scoped per service | sections 71.1 and 71.2 |
| Redaction at the logger rather than per call site | sections 68.2 and 71.2 |
| Structured JSON logs, UTC, carrying environment and trading mode | section 68.2 |
| Correlation identifier plumbing | section 68.1 |
| `ruff` for lint and format | section 86.1 |
| Strict typing on the critical financial modules, `Decimal` for money | sections 85.1 and 86.1 |
| `pytest` with `pytest-asyncio` and `pytest-cov` | section 86.1 |
| TypeScript strict, `eslint`, `prettier` | sections 86.2 and 64 |
| Pre commit hooks including secret scanning | section 86.3 |
| The CI job list, and no live credentials in CI | section 86.4 |
| Three distinct health endpoints | section 75.1 |
| Docker and Docker Compose, no Kubernetes | sections 67 and 79 |
| Only the proxy published, database and Redis private | section 67.1 |
| A `Makefile` or equivalent task runner | sections 82.1 and 92 |
| The repository layout | section 82 |
| Gate 0 contents | section 89 |
| Configurable approval TTL defaulting to 300 seconds | section 25.2 |

### My recommendations, open to your override

| Recommendation | Why | Alternative |
|---|---|---|
| `mypy` over `pyright` | Mature plugins for SQLAlchemy and Pydantic, which this codebase leans on heavily | `pyright`, faster and stricter by default |
| Caddy over Nginx | Automatic TLS suits one owner dashboard on a domain | Nginx, more widely understood |
| GitHub Actions | The `origin` remote is GitHub, so nothing extra is introduced | Any runner, at the cost of a second platform |
| Test the bundled Postgres image before writing a custom one | A custom image is real maintenance; avoid it if the bundled one already carries both extensions | Write the Dockerfile immediately for certainty |
| Defer Prometheus and Grafana | No metrics exist yet to scrape; required before Gate 5, not before Gate 0 | Add both to Compose now |
| Install the `apps/web` workspace now, build no pages | Proves the `pnpm` and frontend CI path early instead of discovering it broken at Foundation 11 | Omit Node from Foundation 0 entirely |
| Placeholder `README.md` per future directory | Stops later foundations inventing divergent layouts, commits no interface | Create directories as each foundation needs them |
| Build `/health/trading` now, reporting not ready | Prevents the conflation PRD section 75 exists to prevent | Add it at Foundation 3 with its first real check |
| One migration creating only the extensions | Proves the migration path without pre empting Foundation 1's models | Wait and let Foundation 1 create the first migration |

---

## References

**Project sources**

- `docs/product/prd.md` v1.2, the approved requirements, sections cited individually above.
- `docs/product/goal-architecture.md`, the approved layered architecture and slice ordering.
- `docs/scope/scope.md`, which records the Tracer Bullet build approach and the Beta workflow tier, and carries features 1 and 2 that this foundation serves.
- The `origin` remote, which establishes GitHub as the CI host.

**Practices and standards**

- Fail closed configuration validation, meaning refuse to start rather than warn and continue, for systems that move money.
- Safe by default committed configuration, so a fresh clone cannot reach a dangerous state.
- Reproducible builds from a committed lockfile.
- Separating liveness, readiness, and domain specific readiness, rather than inferring one from another.
- Redaction applied at the logging boundary rather than trusted to each call site.

**Links**

- Install self hosted TimescaleDB, including the Docker images: https://docs.timescale.com/self-hosted/latest/install/installation-docker/

One caveat on that link, since it feeds open decision 1. It confirms that `timescale/timescaledb-ha` bundles TimescaleDB, the Toolkit, and support for PostGIS and Patroni. It does not mention `pgvector`. I have therefore treated the availability of the `vector` extension in that image as unverified, and turned it into an explicit implementation check rather than an assumption.
