# Foundation 4: Risk Engine — Design Spec

**Date:** 2026-08-26
**Status:** Proposed
**Foundation:** F4 of 13
**Depends on:** F0, F1, F3
**Unlocks:** F8, F12
**Blueprint tasks:** 4.1 – 4.9

---

## 1. Purpose

Foundation 4 introduces the definitive safety boundary for all trading activity. It evaluates every proposed and approved action against a strict set of rules (position sizing, max drawdown, staleness, kill switches) and guarantees that no order violating these parameters can reach the execution engine.

---

## 2. Scope

### In scope
- **Pure Risk Core:** Deterministic, stateless rule evaluators using `Decimal`.
- **Versioned Configuration:** PostgreSQL repository for immutable risk settings.
- **Three-Point Pipeline:** Evaluation at proposal creation, owner approval, and pre-submission.
- **Decision Engine:** `APPROVED`, `REJECTED`, and `MODIFIED` state logic.
- **Safety Validators:** Market data staleness, exchange connectivity, and kill switch checks.
- **Audit Integration:** Recording rule execution snapshots to the audit log.

### Out of scope
- Technical indicator math and regime classification (F5).
- Live execution (F12).

---

## 3. Architecture & Components

### 3.1 Pure Deterministic Risk Core
Located in `packages/risk/`, the core engine is a suite of pure Python functions. It takes in a state snapshot (current cash, current positions, target symbol, requested action, and risk configuration) and returns a `RiskDecision`. It makes zero network, database, or LLM calls. This guarantees 100% testability.

### 3.2 Versioned Risk Configuration
Risk parameters (e.g., `spot_only`, `max_risk_per_trade_percent`, `market_data_max_age_seconds`) are stored in a `risk_config_versions` table. Any update by the owner creates a new immutable version. The `spot_only: true` and `leverage_enabled: false` settings are structurally enforced in code and cannot be overridden by the database.

### 3.3 Three-Point Orchestrator
The `services/risk/` orchestrator wraps the pure core. It gathers state from the database and F2 streams and executes the rules at three non-skippable points:
1. **Proposal Creation:** Prevents agents from suggesting wildly invalid sizes.
2. **Owner Approval:** Ensures the market hasn't shifted dangerously since the proposal was created.
3. **Pre-submit:** A microsecond-level check right before F3/F12 sends the network request.

### 3.4 Decision Handling & In-Place Modification
Evaluations result in an immutable `RiskDecision`. 
- If `APPROVED`, the workflow continues.
- If `REJECTED`, the trade is aborted and rule failure codes are logged.
- If `MODIFIED` (e.g., quantity reduced to fit max risk limits), the original proposal is overwritten in-place with the new safe quantity, and flagged as requiring fresh approval if it was already approved.

### 3.5 Fail-Closed Safety Checks
The pre-submit evaluation validates system health:
- Is the F2 market data older than `market_data_max_age_seconds`?
- Is the Kill Switch active?
If any check fails, or if the database is unreachable, the system fails closed and blocks execution.

---

## 4. Acceptance Criteria

- **AC-4.1**: Risk rule evaluation is pure deterministic logic using fixed-precision `Decimal`.
- **AC-4.2**: Produces immutable `RiskDecision` records with failure codes and evaluated limits.
- **AC-4.3**: Sizing rules enforce exchange minimums and `max_risk_per_trade_percent`.
- **AC-4.4**: Rejects proposals where expected return relative to stop distance < `min_reward_risk_ratio`.
- **AC-4.5**: `spot_only` and no leverage are structurally enforced.
- **AC-4.6**: Configuration is versioned; agent service tokens cannot modify rules.
- **AC-4.7**: A `MODIFIED` decision reduces quantity in-place and mandates fresh approval.
- **AC-4.8**: Validation executes at proposal, approval, and pre-submit; failure halts the trade.
- **AC-4.9**: Checks market data staleness, portfolio drawdown, and active kill switch.
- **AC-4.10**: Engine failure or unavailability results in fail-closed rejection of orders.
- **AC-4.11**: All evaluations append to `audit_log` with `correlation_id` and config version.
- **AC-4.12**: REST endpoints `/api/v1/risk/config` exposed for owner configuration.
- **AC-4.13**: Isolated unit tests achieve 100% branch coverage on the pure risk core.
