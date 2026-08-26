from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from packages.domain.enums import OrderSide, OrderType


class RiskDecisionType(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    MODIFIED = "modified"


class RiskRuleCode(str, Enum):
    # Structural Safety Rules
    RULE_SPOT_ONLY = "RULE_SPOT_ONLY"
    RULE_NO_LEVERAGE = "RULE_NO_LEVERAGE"
    RULE_KILL_SWITCH_ACTIVE = "RULE_KILL_SWITCH_ACTIVE"
    RULE_STALE_MARKET_DATA = "RULE_STALE_MARKET_DATA"
    
    # Portfolio Level Rules
    RULE_MAX_DRAWDOWN = "RULE_MAX_DRAWDOWN"
    RULE_MAX_OPEN_POSITIONS = "RULE_MAX_OPEN_POSITIONS"
    RULE_MAX_CONCENTRATION = "RULE_MAX_CONCENTRATION"
    RULE_INSUFFICIENT_BALANCE = "RULE_INSUFFICIENT_BALANCE"
    
    # Trade Level Rules
    RULE_MAX_RISK_PER_TRADE = "RULE_MAX_RISK_PER_TRADE"
    RULE_MIN_REWARD_RISK_RATIO = "RULE_MIN_REWARD_RISK_RATIO"
    RULE_MIN_NOTIONAL = "RULE_MIN_NOTIONAL"
    RULE_MIN_QUANTITY = "RULE_MIN_QUANTITY"
    RULE_MAX_QUANTITY = "RULE_MAX_QUANTITY"
    RULE_INVALID_SIDE_OR_TYPE = "RULE_INVALID_SIDE_OR_TYPE"
    
    # Modification and Informational Codes
    RULE_MODIFIED_SIZE = "RULE_MODIFIED_SIZE"
    RULE_APPROVED = "RULE_APPROVED"
    RULE_ENGINE_ERROR = "RULE_ENGINE_ERROR"


class SymbolRiskConfig(BaseModel):
    """Per-symbol precision and size constraints."""

    model_config = ConfigDict(frozen=True)

    min_quantity: Decimal = Field(default=Decimal("0.0001"))
    max_quantity: Decimal = Field(default=Decimal("100.0"))
    step_size: Decimal = Field(default=Decimal("0.0001"))
    price_precision: int = Field(default=2)
    min_notional: Decimal = Field(default=Decimal("10.0"))


class RiskConfig(BaseModel):
    """Immutable risk configuration settings."""

    model_config = ConfigDict(frozen=True)

    spot_only: bool = Field(default=True)
    leverage_enabled: bool = Field(default=False)
    max_risk_per_trade_percent: Decimal = Field(
        default=Decimal("0.02"),
        description="Max fraction of total equity at risk on a single trade (e.g. 0.02 = 2%)"
    )
    max_drawdown_percent: Decimal = Field(
        default=Decimal("0.10"),
        description="Max portfolio drawdown before halting all new buys (e.g. 0.10 = 10%)"
    )
    max_concentration_percent: Decimal = Field(
        default=Decimal("0.30"),
        description="Max fraction of total equity allocated to any single asset"
    )
    max_open_positions: int = Field(default=5)
    min_reward_risk_ratio: Decimal = Field(
        default=Decimal("1.5"),
        description="Minimum ratio of potential reward to risk"
    )
    market_data_max_age_seconds: int = Field(default=60)
    min_notional: Decimal = Field(default=Decimal("10.0"))
    symbol_rules: dict[str, SymbolRiskConfig] = Field(default_factory=dict)

    @field_validator("spot_only")
    @classmethod
    def enforce_spot_only(cls, v: bool) -> bool:
        if not v:
            raise ValueError("spot_only must be True. Non-spot trading is structurally disallowed.")
        return True

    @field_validator("leverage_enabled")
    @classmethod
    def enforce_no_leverage(cls, v: bool) -> bool:
        if v:
            raise ValueError("leverage_enabled must be False. Leverage is structurally disallowed.")
        return False


class PositionSnapshot(BaseModel):
    """Snapshot of an open asset position."""

    model_config = ConfigDict(frozen=True)

    symbol: str
    quantity: Decimal
    average_entry_price: Decimal
    current_price: Decimal


class RiskState(BaseModel):
    """Snapshot of portfolio and market state passed to pure risk engine."""

    model_config = ConfigDict(frozen=True)

    cash_balance: Decimal
    total_equity: Decimal
    peak_equity: Decimal
    current_drawdown_percent: Decimal | None = None
    open_positions: dict[str, PositionSnapshot] = Field(default_factory=dict)
    market_price: Decimal
    market_data_timestamp: datetime | None = None
    kill_switch_active: bool = False


class TradeIntent(BaseModel):
    """Proposed trade order parameters to evaluate."""

    model_config = ConfigDict(frozen=True)

    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Decimal
    limit_price: Decimal | None = None
    stop_loss_price: Decimal | None = None
    take_profit_price: Decimal | None = None
    leverage: Decimal = Field(default=Decimal("1.0"))


class RiskDecisionResult(BaseModel):
    """Pure outcome returned by the deterministic risk evaluation core."""

    model_config = ConfigDict(frozen=True)

    decision: RiskDecisionType
    rule_codes: list[RiskRuleCode]
    risk_score: Decimal
    original_quantity: Decimal
    approved_quantity: Decimal
    limits_evaluated: dict[str, Any] = Field(default_factory=dict)
    reason: str
