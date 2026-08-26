# Foundation 3: Portfolio and Execution Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core portfolio ledger, paper execution adapter, state machine, idempotency engine, and reconciliation safety controls.

**Architecture:** Database-enforced idempotency for all actions. Atomic database transactions for (Fill + Portfolio) updates. Paper adapter executing against F2 market data streams. Reconciliation background worker enforcing the `reconciliation_blocked` safety flag.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2.0 (asyncpg), PostgreSQL, TimescaleDB, pydantic.

## Global Constraints

- All prices, quantities, balances, and P&L must strictly use `Decimal` — `float` is a defect.
- Timestamps must be timezone-aware UTC.
- Fail closed: `UNKNOWN` states must block trading until explicitly resolved.
- Idempotency must be database-enforced, never check-then-act in Python.
- Redis is never authoritative for financial state; PostgreSQL is the absolute source of truth.
- Commit after every task: `feat(f3): task 3.X - description`

---

### Task 3.1: Idempotency Engine and Audit Logger skeleton

**Files:**
- Create: `packages/database/models/idempotency.py`
- Create: `packages/database/models/audit.py`
- Modify: `migrations/alembic/versions/..._create_f3_tables.py`
- Create: `packages/domain/idempotency.py`
- Create: `tests/unit/test_idempotency.py`

**Interfaces:**
- Produces: `IdempotencyKey` model, `AuditRecord` model, `IdempotencyService`

- [ ] **Step 1: Write tests for IdempotencyService**

```python
# tests/unit/test_idempotency.py
import pytest
from packages.domain.idempotency import IdempotencyService

def test_idempotency_key_generation():
    service = IdempotencyService()
    key = service.generate_key("proposal_123", "execute")
    assert len(key) > 10
```

- [ ] **Step 2: Create DB models and Service**

```python
# packages/database/models/idempotency.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, JSON
from packages.database.base import Base

class IdempotencyRecord(Base):
    __tablename__ = "idempotency_keys"
    idempotency_key: Mapped[str] = mapped_column(String, primary_key=True)
    action: Mapped[str] = mapped_column(String, nullable=False)
    response_payload: Mapped[dict] = mapped_column(JSON, nullable=True)

# packages/database/models/audit.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, JSON, DateTime, func
from packages.database.base import Base
from datetime import datetime

class AuditRecord(Base):
    __tablename__ = "audit_records"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    correlation_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String, nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 3: Create Idempotency Service**

```python
# packages/domain/idempotency.py
import hashlib
class IdempotencyService:
    def generate_key(self, source_id: str, action: str) -> str:
        raw = f"{source_id}:{action}"
        return hashlib.sha256(raw.encode()).hexdigest()
```

- [ ] **Step 4: Create Alembic Migration for F3**

```bash
uv run alembic revision -m "create f3 tables"
```
Update the generated migration file to include `idempotency_keys` and `audit_records`. Run `uv run alembic upgrade head`.

- [ ] **Step 5: Run tests and commit**

```bash
uv run pytest tests/unit/test_idempotency.py
git add .
git commit -m "feat(f3): task 3.1 - idempotency engine and audit models"
```

---

### Task 3.2: Execution State Machine & `UNKNOWN` Handling

**Files:**
- Create: `packages/domain/execution.py`
- Create: `packages/database/models/execution.py`
- Modify: F3 migration file.
- Create: `tests/unit/test_execution_state.py`

**Interfaces:**
- Produces: `ExecutionRequest` domain entity, `ExecutionRequest` DB model, state transition logic.

- [ ] **Step 1: Write execution state transitions**

```python
# packages/domain/execution.py
from enum import Enum
from packages.exchange.errors import UnknownStateError

class ExecutionState(str, Enum):
    PENDING = "PENDING"
    SUBMITTING = "SUBMITTING"
    SUBMITTED = "SUBMITTED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    UNKNOWN = "UNKNOWN"

class ExecutionStateMachine:
    VALID_TRANSITIONS = {
        ExecutionState.PENDING: {ExecutionState.SUBMITTING, ExecutionState.REJECTED, ExecutionState.CANCELLED},
        ExecutionState.SUBMITTING: {ExecutionState.SUBMITTED, ExecutionState.REJECTED, ExecutionState.UNKNOWN},
        ExecutionState.SUBMITTED: {ExecutionState.PARTIALLY_FILLED, ExecutionState.FILLED, ExecutionState.CANCELLED},
        ExecutionState.PARTIALLY_FILLED: {ExecutionState.FILLED, ExecutionState.CANCELLED},
        ExecutionState.UNKNOWN: {ExecutionState.SUBMITTED, ExecutionState.REJECTED, ExecutionState.FILLED},
    }

    def transition(self, current: ExecutionState, next_state: ExecutionState) -> bool:
        if next_state not in self.VALID_TRANSITIONS.get(current, set()):
            raise ValueError(f"Invalid transition {current} -> {next_state}")
        return True
```

- [ ] **Step 2: Create DB Model**

```python
# packages/database/models/execution.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Numeric
from packages.database.base import Base

class ExecutionRequestDB(Base):
    __tablename__ = "execution_requests"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    side: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[str] = mapped_column(String, nullable=False)
    state: Mapped[str] = mapped_column(String, nullable=False)
    client_order_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    trading_mode: Mapped[str] = mapped_column(String, nullable=False)
```

- [ ] **Step 3: Update Migration & Run tests**

Update the previous F3 migration or create a new one. Run tests on state machine. Commit.

```bash
git add .
git commit -m "feat(f3): task 3.2 - execution state machine and models"
```

---

### Task 3.3: Paper Execution Adapter

**Files:**
- Create: `services/execution/paper.py`
- Create: `tests/unit/test_paper_adapter.py`

**Interfaces:**
- Consumes: F2 `ExchangeAdapter` (for market data)
- Produces: `PaperExecutionAdapter` which simulates execution.

- [ ] **Step 1: Write Paper Adapter**

```python
# services/execution/paper.py
from decimal import Decimal
from packages.exchange.base import ExchangeAdapter

class PaperExecutionAdapter:
    def __init__(self, market_data_adapter: ExchangeAdapter):
        self._md = market_data_adapter
        self.SLIPPAGE = Decimal("0.0005") # 0.05%
        self.FEE_RATE = Decimal("0.001")  # 0.1%

    async def execute_market_order(self, symbol: str, side: str, quantity: Decimal) -> dict:
        ticker = await self._md.get_ticker(symbol)
        base_price = ticker.ask if side.lower() == "buy" else ticker.bid
        
        # Apply slippage
        if side.lower() == "buy":
            fill_price = base_price * (Decimal("1") + self.SLIPPAGE)
        else:
            fill_price = base_price * (Decimal("1") - self.SLIPPAGE)
            
        fee = fill_price * quantity * self.FEE_RATE
        
        import uuid
        return {
            "exchange_trade_id": str(uuid.uuid4()),
            "price": fill_price,
            "quantity": quantity,
            "fee": fee
        }
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(f3): task 3.3 - paper execution adapter with fixed slippage"
```

---

### Task 3.4 & 3.5: Fills Ledger and Atomic Portfolio Derivation

**Files:**
- Create: `packages/database/models/portfolio.py`
- Create: `services/portfolio/engine.py`
- Create: `tests/unit/test_portfolio_engine.py`

**Interfaces:**
- Produces: `fills`, `portfolio_accounts`, `portfolio_positions` DB models. `PortfolioEngine.process_fill()` method.

- [ ] **Step 1: Create DB Models**

```python
# packages/database/models/portfolio.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Numeric, UniqueConstraint
from packages.database.base import Base

class FillDB(Base):
    __tablename__ = "fills"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    exchange_trade_id: Mapped[str] = mapped_column(String, nullable=False)
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    trading_mode: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[str] = mapped_column(String, nullable=False)
    side: Mapped[str] = mapped_column(String, nullable=False)
    __table_args__ = (UniqueConstraint('exchange_trade_id', 'symbol', 'trading_mode', name='uix_fill_trade_id'),)

class PortfolioAccount(Base):
    __tablename__ = "portfolio_accounts"
    trading_mode: Mapped[str] = mapped_column(String, primary_key=True)
    cash_balance: Mapped[str] = mapped_column(String, nullable=False, default="0")

class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"
    trading_mode: Mapped[str] = mapped_column(String, primary_key=True)
    symbol: Mapped[str] = mapped_column(String, primary_key=True)
    quantity: Mapped[str] = mapped_column(String, nullable=False, default="0")
    average_entry_price: Mapped[str] = mapped_column(String, nullable=False, default="0")
```

- [ ] **Step 2: Create Portfolio Engine**

```python
# services/portfolio/engine.py
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.models.portfolio import FillDB, PortfolioAccount, PortfolioPosition

class PortfolioEngine:
    async def process_fill(self, session: AsyncSession, fill_data: dict) -> None:
        # 1. Insert Fill (handle conflict)
        # 2. Update PortfolioAccount (deduct/add cash)
        # 3. Update PortfolioPosition (add/remove asset, calc avg entry)
        pass # Implementation required by agent
```

- [ ] **Step 3: Update migrations, run tests, commit**

```bash
uv run alembic revision --autogenerate -m "portfolio tables"
git add .
git commit -m "feat(f3): task 3.4 and 3.5 - fills ledger and portfolio models"
```

---

### Task 3.6: Owner Approval & TTL Validation

**Files:**
- Create: `services/execution/approvals.py`

**Interfaces:**
- Validates TTL and marks `OwnerApproval` as consumed.

- [ ] **Step 1: Build & Commit**

```bash
git add .
git commit -m "feat(f3): task 3.6 - owner approval binding and ttl validation"
```

---

### Task 3.7: Portfolio Snapshots to TimescaleDB

**Files:**
- Create: `packages/database/models/hypertables.py` (add `portfolio_snapshots` if missing)
- Create: `services/portfolio/snapshot.py`

- [ ] **Step 1: Build & Commit**

```bash
git add .
git commit -m "feat(f3): task 3.7 - portfolio snapshots to timescaledb"
```

---

### Task 3.8 & 3.9: Reconciliation Engine and Blocking Flag

**Files:**
- Create: `services/reconciliation/worker.py`
- Create: `packages/database/models/system.py` (for `reconciliation_blocked` flag)

- [ ] **Step 1: Reconciliation logic**

```python
# services/reconciliation/worker.py
class ReconciliationEngine:
    async def run_reconciliation(self) -> None:
        # Compare DB vs Exchange
        # If CRITICAL, update SystemState.reconciliation_blocked = True
        pass
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(f3): task 3.8 and 3.9 - reconciliation engine and blocking mechanism"
```

---

### Task 3.10: Financial Audit Logger Implementation

**Files:**
- Create: `services/audit/logger.py`

- [ ] **Step 1: Write Audit Logger**

```python
# services/audit/logger.py
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.models.audit import AuditRecord

async def log_financial_event(session: AsyncSession, correlation_id: str, event_type: str, payload: dict):
    record = AuditRecord(correlation_id=correlation_id, event_type=event_type, payload=payload)
    session.add(record)
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(f3): task 3.10 - financial audit logger"
```

---

### Task 3.11 & 3.12: REST APIs and Health Check

**Files:**
- Create: `apps/api/routers/portfolio.py`
- Create: `apps/api/routers/reconciliation.py`
- Modify: `apps/api/routers/health.py`
- Modify: `apps/api/main.py`

- [ ] **Step 1: Build Endpoints**
Implement GET `/api/v1/portfolio/accounts`, `/positions`, and POST `/api/v1/reconciliation/unblock`. Add checks to `/health/trading`.

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(f3): task 3.11 and 3.12 - REST APIs and health integration"
```

---

### Task 3.13: Comprehensive Safety Test Suite

**Files:**
- Create: `tests/integration/test_f3_safety.py`

- [ ] **Step 1: Write integration tests**
Prove idempotency, paper execution, atomic portfolio updates, and reconciliation blocking all work together.

- [ ] **Step 2: Run all tests, lint, format**

```bash
uv run pytest tests/ -v
uv run mypy packages services apps --strict
uv run ruff check packages services apps
```

- [ ] **Step 3: Commit and Push**

```bash
git add tests/
git commit -m "feat(f3): task 3.13 - comprehensive safety test suite"
git push origin development
```
