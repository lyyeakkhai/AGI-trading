# Verify: Foundation 0

Verification steps for [index.md](index.md). Each section names the acceptance criteria it proves.

The governing rule for this foundation: a guard is only verified when its failure case is exercised. A configuration that loads successfully proves nothing about the rules meant to reject bad configuration, so every rejection is asserted individually.

---

## 1. Bootstrap from a clean clone

Proves **AC-1**, **AC-2**.

Run from a fresh clone in a temporary directory, never from a warm working copy. A warm copy hides missing steps because the caches and generated files already exist.

```text
git clone <repo> /tmp/f0-check && cd /tmp/f0-check
cp .env.example .env
uv sync
pnpm install
docker compose up -d
uv run alembic upgrade head
```

Expected:

- every command exits zero, with no manual step not written in the README;
- `uv sync` succeeds with no TA-Lib system library installed, proving the quant layer is genuinely optional;
- no exchange credential is present anywhere, and nothing asks for one.

This sequence also runs as a CI job, so the documented path is machine checked rather than trusted.

## 2. Repository skeleton

Proves **AC-3**.

Confirm each directory in the layout exists, and that every directory a later foundation fills carries a `README.md` naming what belongs there and which foundation fills it. Confirm no service directory contains executable code, and in particular that nothing resembling an execution or order path exists.

## 3. Configuration typing and defaults

Proves **AC-4**, **AC-5**.

- Load the settings with the committed `.env.example` values and assert each default: `APP_ENV=development`, `TRADING_MODE=paper`, `LIVE_TRADING_ENABLED=false`, `spot_only=true`, `leverage_enabled=false`, allowlist exactly `BTC/USDT` and `ETH/USDT`, `require_owner_approval=true`, `approval_ttl_seconds=300`, `approval_ttl_max_seconds=900`.
- Supply a wrongly typed value and assert startup fails with the offending field named in the message.
- Assert settings are immutable after load, so nothing can mutate a trading relevant value at runtime.

## 4. Cross field rejection rules

Proves **AC-6**. One test per rule, each asserting refusal to start. A single combined test would let one working rule mask a broken one.

| Configuration under test | Expected |
|---|---|
| `TRADING_MODE=live` with `APP_ENV=development` | reject |
| `LIVE_TRADING_ENABLED=true` with `TRADING_MODE=paper` | reject |
| `TRADING_MODE=live` with live exchange credentials absent | reject |
| `TRADING_MODE=live` with `leverage_enabled=true` | reject |
| `TRADING_MODE=live` with `spot_only=false` | reject |
| a symbol outside the allowlist | reject |
| paper and live resolving to the same database name | reject |
| paper and live resolving to the same Redis prefix | reject |
| `approval_ttl_seconds` at or below zero | reject |
| `approval_ttl_seconds` above `approval_ttl_max_seconds` | reject |
| `market_data_max_age_seconds` at or below zero | reject |
| `require_owner_approval=false` with `TRADING_MODE=live` | reject |

Each rejection must be a refusal to start, not a warning, and the message must identify which rule fired.

## 5. Logging and redaction

Proves **AC-7**, **AC-9**.

- Assert the resolved non secret configuration is logged exactly once at startup.
- Assert every log line carries `APP_ENV`, `TRADING_MODE`, and `LIVE_TRADING_ENABLED`.
- Attempt to log each known secret field and assert the raw value is absent from the output and a redaction marker is present.
- Add a new log call that passes a secret without any local redaction handling, and assert it is still redacted. This is what proves redaction lives at the logger rather than at the call site.
- Assert logs are single line JSON with UTC timestamps.

## 6. Secret hygiene

Proves **AC-8**.

- Confirm `.env.example` names every variable from PRD section 71.1 and carries placeholder values only, with no real credential.
- Confirm `.env` is git ignored.
- Attempt to commit a file containing a credential shaped string and assert the pre commit hook blocks it.
- Attempt to commit a `.env` file and assert it is blocked.

## 7. Database, extensions, migrations

Proves **AC-10**, **AC-16**.

Query the running database rather than trusting the image tag:

```sql
SELECT extname FROM pg_extension WHERE extname IN ('timescaledb', 'vector');
```

Expected: both rows present. This is the check that settles open decision 1. If `vector` is missing from the bundled image, the custom Dockerfile is required.

Then:

- run `alembic upgrade head` against an empty database and assert success;
- run it a second time and assert it is a no-op;
- change a model without adding a migration and assert the drift check fails.

## 8. Networking boundaries

Proves **AC-11**, **AC-12**.

- With only the committed `docker-compose.yml`, assert the proxy is the sole service publishing a host port, and that PostgreSQL and Redis publish none.
- Assert the API reaches both over the private network.
- Inspect the resolved Compose environment per service and assert each secret reaches only the services PRD section 71.1 permits. In this foundation, assert no exchange variable is passed to any container.

## 9. Quality gates

Proves **AC-13**, **AC-14**.

- `make lint`, `make typecheck`, `make test`, `make check` each run clean on the delivered skeleton.
- Introduce a `float` in a monetary or quantity signature inside a path designated critical and assert the type checker reports it.
- Confirm strict mode applies to the directories PRD section 85.1 names as critical financial modules.

## 10. Health endpoints

Proves **AC-17**.

- `/health/live` reports alive once the process is up.
- `/health/ready` reports ready only when the database and Redis are reachable and the schema is at expected head. Stop Redis and assert it reports not ready.
- `/health/trading` reports **not ready**, with a machine readable list of unbuilt preconditions. Assert it cannot report ready in this foundation under any configuration.

## 11. Safety suite

Proves **AC-18**. These are the tests that must fail loudly if a future change simplifies a guard.

- `APP_ENV=development` with `TRADING_MODE=live` fails to start.
- `LIVE_TRADING_ENABLED=false` is the committed default.
- Paper and live cannot resolve to the same database name or Redis prefix.
- `/health/trading` never reports ready while its preconditions are unbuilt.

## 12. CI pipeline

Proves **AC-15**.

Confirm the workflow runs lint, type check, unit tests, migration validation from empty to head plus the re-run, the safety suite, the frontend build, and the bootstrap verification. Confirm it runs with `APP_ENV=development` and `TRADING_MODE=paper`, and holds no live credentials. Confirm a failing safety test blocks the run.

---

## Gate 0 mapping

Foundation 0 is complete when PRD section 89 Gate 0 is satisfied. Each Gate 0 clause maps to the checks above:

| Gate 0 clause | Verified by |
|---|---|
| repository bootstraps from a clean checkout | section 1 |
| typed configuration loads and rejects unsafe combinations | sections 3, 4 |
| migrations run empty to head, re-run is a no-op | section 7 |
| required PostgreSQL extensions present | section 7 |
| lint, typecheck, test run clean locally and in CI | sections 9, 12 |
| committed defaults are paper and live disabled | sections 3, 11 |
