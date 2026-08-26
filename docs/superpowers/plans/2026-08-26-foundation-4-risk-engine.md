# Foundation 4: Risk Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the pure, deterministic risk evaluation core, the PostgreSQL versioned configuration, the three-point evaluation orchestrator, and the fail-closed safety checks.

**Tech Stack:** Python 3.12, SQLAlchemy, pydantic, Decimal.

## Global Constraints
- **Pure Core:** Files inside `packages/risk/` must NOT import database sessions, network clients, or Redis clients.
- **Fail Closed:** Any missing data, unparseable configuration, or unreachable database MUST result in a `REJECTED` state.
- **Decimals Only:** Use `Decimal` for all financial math.
- Commit after every task: `feat(f4): task 4.X - description`

---

### Task 4.1 & 4.2: Pure Deterministic Risk Core

**Files:**
- Create: `packages/risk/core.py`
- Create: `packages/risk/models.py`
- Create: `tests/unit/test_risk_core.py`

**Steps:**
- Define `RiskConfig`, `RiskState`, and `RiskDecision` (APPROVED, REJECTED, MODIFIED) models in `models.py`.
- Implement `evaluate_trade(state: RiskState, config: RiskConfig, requested_qty: Decimal)` in `core.py`.
- Implement max risk calculation, symbol precision rounding, and reward-to-risk ratio checks.
- Add property-based tests in `tests/unit/test_risk_core.py`.
- Commit: `feat(f4): task 4.1 and 4.2 - pure deterministic risk core`

---

### Task 4.3: Versioned Risk Configuration Repository

**Files:**
- Create: `packages/database/models/risk.py`
- Modify: migrations.
- Create: `services/risk/repository.py`

**Steps:**
- Create `risk_config_versions` table.
- Implement `RiskRepository.get_latest_config()` and `RiskRepository.add_new_version()`.
- Add structural validation inside the repository to ensure `spot_only=True` and `leverage_enabled=False`.
- Commit: `feat(f4): task 4.3 - versioned risk configuration repository`

---

### Task 4.4 & 4.5: Three-Point Evaluation Pipeline

**Files:**
- Create: `services/risk/orchestrator.py`

**Steps:**
- Implement `RiskOrchestrator.evaluate_proposal()`, `evaluate_approval()`, and `evaluate_pre_submit()`.
- In `evaluate_proposal()`, if the core returns `MODIFIED`, update the proposal's quantity in-place in the DB.
- Commit: `feat(f4): task 4.4 and 4.5 - three-point evaluation pipeline and decision generator`

---

### Task 4.6: Safety Validators (Staleness & Kill Switch)

**Files:**
- Modify: `services/risk/orchestrator.py`

**Steps:**
- Fetch the timestamp of the latest F2 market data.
- If `now - market_data.timestamp > config.market_data_max_age_seconds`, fail closed.
- Check the kill switch flag. If active, fail closed.
- Commit: `feat(f4): task 4.6 - market data staleness and kill switch validators`

---

### Task 4.7: Audit Log Integration

**Files:**
- Modify: `services/risk/orchestrator.py`
- Modify: `services/audit/logger.py` (from F3)

**Steps:**
- After every evaluation, persist the `RiskDecision` JSON payload to the F3 `audit_log` table, tagged with the incoming `correlation_id` and the `risk_config_version`.
- Commit: `feat(f4): task 4.7 - risk service integration with audit log`

---

### Task 4.8: REST APIs for Owner Management

**Files:**
- Create: `apps/api/routers/risk.py`
- Modify: `apps/api/main.py`

**Steps:**
- Implement `GET /api/v1/risk/config` and `POST /api/v1/risk/config`.
- Mount the router.
- Commit: `feat(f4): task 4.8 - risk configuration REST endpoints`

---

### Task 4.9: Comprehensive Unit Test Suite

**Files:**
- Create/Modify: `tests/unit/test_risk_orchestrator.py`

**Steps:**
- Write tests achieving 100% rule-code branch coverage.
- Prove that missing dependencies result in fail-closed rejections.
- Run `uv run pytest`, `uv run mypy`, and `uv run ruff`.
- Commit and Push: `feat(f4): task 4.9 - comprehensive test suite`
