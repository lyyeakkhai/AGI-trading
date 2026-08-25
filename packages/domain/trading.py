from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from packages.domain.enums import (
    ApprovalStatus,
    DivergenceType,
    ExecutionStatus,
    OrderSide,
    OrderType,
    RiskDecisionType,
    TradingMode,
)
from packages.domain.value_objects import (
    Balance,
    Fee,
    PnL,
    Price,
    Quantity,
)


class TradeProposal(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Quantity
    limit_price: Price | None = None
    rationale: str
    strategy_id: UUID | None = None
    opportunity_id: UUID | None = None
    trading_mode: TradingMode
    correlation_id: UUID
    created_at: datetime
    expires_at: datetime


class RiskDecision(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    proposal_id: UUID
    decision: RiskDecisionType
    rule_codes: list[str]  # specific rule codes, not just approved/rejected
    risk_score: Decimal
    trading_mode: TradingMode
    correlation_id: UUID
    evaluated_at: datetime


class OwnerApproval(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    proposal_id: UUID
    status: ApprovalStatus
    trading_mode: TradingMode
    correlation_id: UUID
    created_at: datetime
    expires_at: datetime
    consumed_at: datetime | None = None


class ExecutionRequest(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    proposal_id: UUID
    approval_id: UUID
    idempotency_key: str
    client_order_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Quantity
    limit_price: Price | None = None
    status: ExecutionStatus
    trading_mode: TradingMode
    correlation_id: UUID
    created_at: datetime


class IdempotencyKey(BaseModel):
    key: str
    trading_mode: TradingMode
    outcome: dict[str, Any] | None = None
    created_at: datetime


class Order(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    execution_request_id: UUID
    exchange_order_id: str | None = None
    client_order_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Quantity
    filled_quantity: Quantity
    limit_price: Price | None = None
    status: ExecutionStatus
    trading_mode: TradingMode
    correlation_id: UUID
    created_at: datetime
    updated_at: datetime


class Fill(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    order_id: UUID
    exchange_trade_id: str
    symbol: str
    side: OrderSide
    quantity: Quantity
    price: Price
    fee: Fee
    fee_asset: str
    trading_mode: TradingMode
    correlation_id: UUID
    executed_at: datetime


class Position(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    account_id: UUID
    symbol: str
    quantity: Quantity
    average_entry_price: Price
    realized_pnl: PnL
    trading_mode: TradingMode
    updated_at: datetime


class PortfolioAccount(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    trading_mode: TradingMode
    created_at: datetime


class PortfolioEntry(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    account_id: UUID
    asset: str
    balance: Balance
    trading_mode: TradingMode
    updated_at: datetime


class Trade(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    account_id: UUID
    symbol: str
    side: OrderSide
    quantity: Quantity
    entry_price: Price
    exit_price: Price | None = None
    realized_pnl: PnL | None = None
    trading_mode: TradingMode
    correlation_id: UUID
    opened_at: datetime
    closed_at: datetime | None = None


class ReconciliationRun(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    trigger: str  # "startup", "periodic", "reconnect", "manual"
    trading_mode: TradingMode
    started_at: datetime
    completed_at: datetime | None = None
    divergence_count: int = 0
    is_blocked: bool = False


class ReconciliationDivergence(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    run_id: UUID
    divergence_type: DivergenceType
    description: str
    trading_mode: TradingMode
    detected_at: datetime
    resolved_at: datetime | None = None


class RiskConfigVersion(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    version: int
    config: dict[str, Any]
    created_at: datetime
    created_by: str


class AuditRecord(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    actor: str
    action: str
    entity_type: str
    entity_id: UUID
    trading_mode: TradingMode
    correlation_id: UUID | None = None
    payload: dict[str, Any]
    timestamp: datetime  # UTC
