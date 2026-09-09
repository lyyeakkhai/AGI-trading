# Backend Domain Tasks

**Objective**: Update the core trading domain models and database schemas to support Futures trading (USDⓈ-M), including leverage and reduce-only functionality.

## Task 1: Update TradingPlanModel (Database)
- **File**: `packages/database/models/trading_plan.py`
- **Goal**: Add `leverage` (Integer) and `reduce_only` (Boolean, default False) to the `TradingPlanModel` SQLAlchemy schema.
- **Implementation**: 
  - Define `leverage = Column(Integer, nullable=True)`.
  - Define `reduce_only = Column(Boolean, default=False, nullable=False)`.

## Task 2: Update Domain Models (Pydantic)
- **File**: `packages/trading/domain.py` (or similar domain file)
- **Goal**: Update `TradingPlan`, `TradingPlanCreate`, and `Order` Pydantic models to accept `leverage` and `reduce_only`.
- **Implementation**:
  - Add `leverage: Optional[int] = None`
  - Add `reduce_only: bool = False`
  - Ensure validation logic allows leverage only if `market == "FUTURES"`.

## Task 3: Database Migration Script
- **File**: `packages/database/alembic/versions/` (new migration file)
- **Goal**: Generate and apply the Alembic migration for the new columns.
- **Implementation**: 
  - Run `alembic revision --autogenerate -m "Add leverage and reduce_only to trading plan"`.
  - Verify the migration script and test `alembic upgrade head`.
