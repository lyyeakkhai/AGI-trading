from __future__ import annotations

import uuid
from datetime import UTC, datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.dependencies import verify_hermes_token
from packages.database.engine import get_db_session
from packages.database.models.trading_plan import TradingPlanModel
from packages.domain.enums import OrderSide, OrderType
from packages.logging import get_logger
from packages.risk.core import evaluate_trade, quantize_to_step
from packages.risk.models import (
    PositionSnapshot,
    RiskConfig,
    RiskDecisionType,
    RiskRuleCode,
    RiskState,
    SymbolRiskConfig,
    TradeIntent,
)

logger = get_logger("plan_risk_tools")
router = APIRouter(prefix="/api/v1/tools", tags=["plan-risk-tools"])


# ── Pydantic Request Models ──────────────────────────────────────────────────

class CreatePlanRequest(BaseModel):
    symbol: str
    direction: str = Field(..., description="LONG or SHORT")
    market: str = "spot"
    entry_price: float | None = None
    stop_loss_price: float | None = None
    take_profit_prices: list[dict[str, Any]] | list[float] = Field(default_factory=list)
    risk_percent: float | None = 0.01
    thesis: str = ""
    invalidation: str = ""
    evidence: list[str] = Field(default_factory=list)
    status: str = "DRAFT"


class UpdatePlanRequest(BaseModel):
    symbol: str | None = None
    direction: str | None = None
    market: str | None = None
    entry_price: float | None = None
    stop_loss_price: float | None = None
    take_profit_prices: list[dict[str, Any]] | list[float] | None = None
    risk_percent: float | None = None
    thesis: str | None = None
    invalidation: str | None = None
    evidence: list[str] | None = None
    status: str | None = None


class ValidatePlanRequest(BaseModel):
    plan_id: str | None = None
    symbol: str | None = None
    direction: str | None = None
    entry_price: float | None = None
    stop_loss_price: float | None = None
    take_profit_prices: list[dict[str, Any]] | list[float] | None = None
    risk_percent: float | None = None
    thesis: str | None = None
    invalidation: str | None = None


class CancelPlanRequest(BaseModel):
    reason: str | None = "Cancelled by user or agent"


class CalculatePositionSizeRequest(BaseModel):
    total_equity: float
    risk_percent: float = 0.02
    entry_price: float
    stop_loss_price: float
    symbol: str = "BTC/USDT"
    cash_balance: float | None = None
    max_risk_amount: float | None = None


class CalculateExposureRequest(BaseModel):
    total_equity: float
    cash_balance: float
    positions: list[dict[str, Any]] = Field(default_factory=list)


class RiskValidatePlanRequest(BaseModel):
    plan_id: str | None = None
    symbol: str = "BTC/USDT"
    direction: str = "LONG"
    quantity: float | None = None
    entry_price: float = 50000.0
    stop_loss_price: float | None = None
    take_profit_price: float | None = None
    risk_percent: float | None = None
    total_equity: float = 10000.0
    cash_balance: float = 10000.0
    peak_equity: float | None = None
    current_drawdown_percent: float | None = None
    open_positions: dict[str, Any] = Field(default_factory=dict)
    kill_switch_active: bool = False
    leverage: float = 1.0


class CheckPortfolioRiskRequest(BaseModel):
    total_equity: float = 10000.0
    cash_balance: float = 10000.0
    peak_equity: float | None = None
    current_drawdown_percent: float | None = None
    open_positions: dict[str, Any] | list[dict[str, Any]] = Field(default_factory=dict)
    kill_switch_active: bool = False


# ── Helper Serializer ────────────────────────────────────────────────────────

def _serialize_plan(plan: TradingPlanModel) -> dict[str, Any]:
    return {
        "id": str(plan.id),
        "symbol": plan.symbol,
        "market": plan.market,
        "direction": plan.direction,
        "entry_price": float(plan.entry_price) if plan.entry_price is not None else None,
        "stop_loss_price": float(plan.stop_loss_price) if plan.stop_loss_price is not None else None,
        "take_profit_prices": plan.take_profit_prices,
        "risk_percent": float(plan.risk_percent) if plan.risk_percent is not None else None,
        "thesis": plan.thesis,
        "invalidation": plan.invalidation,
        "evidence": plan.evidence,
        "status": plan.status,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
        "updated_at": plan.updated_at.isoformat() if plan.updated_at else None,
    }


def _format_take_profits(tps: list[dict[str, Any]] | list[float] | None) -> list[dict[str, Any]]:
    if not tps:
        return []
    formatted: list[dict[str, Any]] = []
    for item in tps:
        if isinstance(item, (int, float, Decimal)):
            formatted.append({"price": float(item)})
        elif isinstance(item, dict) and "price" in item:
            formatted.append({"price": float(item["price"])})
        elif isinstance(item, dict):
            formatted.append(item)
    return formatted


# ── Trading Planner Endpoints (5 Tools) ───────────────────────────────────────

@router.post("/plan/create", dependencies=[Depends(verify_hermes_token)], status_code=status.HTTP_201_CREATED)
async def create_plan(
    req: CreatePlanRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Create a new Trading Plan and persist to TradingPlanModel."""
    formatted_tps = _format_take_profits(req.take_profit_prices)

    plan = TradingPlanModel(
        id=uuid.uuid4(),
        symbol=req.symbol,
        market=req.market,
        direction=req.direction.upper(),
        entry_price=Decimal(str(req.entry_price)) if req.entry_price is not None else None,
        stop_loss_price=Decimal(str(req.stop_loss_price)) if req.stop_loss_price is not None else None,
        take_profit_prices=formatted_tps,
        risk_percent=Decimal(str(req.risk_percent)) if req.risk_percent is not None else None,
        thesis=req.thesis,
        invalidation=req.invalidation,
        evidence=req.evidence,
        status=req.status.upper(),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    session.add(plan)
    await session.commit()
    await session.refresh(plan)

    return _serialize_plan(plan)


@router.get("/plan/{plan_id}", dependencies=[Depends(verify_hermes_token)])
async def get_plan(
    plan_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Retrieve an existing Trading Plan by ID."""
    try:
        plan_uuid = uuid.UUID(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan_id UUID") from exc

    stmt = select(TradingPlanModel).where(TradingPlanModel.id == plan_uuid)
    result = await session.execute(stmt)
    plan = result.scalar_one_or_none()

    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trading plan {plan_id} not found")

    return _serialize_plan(plan)


@router.patch("/plan/{plan_id}", dependencies=[Depends(verify_hermes_token)])
@router.put("/plan/{plan_id}", dependencies=[Depends(verify_hermes_token)])
async def update_plan(
    plan_id: str,
    req: UpdatePlanRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Update fields on an existing Trading Plan."""
    try:
        plan_uuid = uuid.UUID(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan_id UUID") from exc

    stmt = select(TradingPlanModel).where(TradingPlanModel.id == plan_uuid)
    result = await session.execute(stmt)
    plan = result.scalar_one_or_none()

    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trading plan {plan_id} not found")

    if req.symbol is not None:
        plan.symbol = req.symbol
    if req.direction is not None:
        plan.direction = req.direction.upper()
    if req.market is not None:
        plan.market = req.market
    if req.entry_price is not None:
        plan.entry_price = Decimal(str(req.entry_price))
    if req.stop_loss_price is not None:
        plan.stop_loss_price = Decimal(str(req.stop_loss_price))
    if req.take_profit_prices is not None:
        plan.take_profit_prices = _format_take_profits(req.take_profit_prices)
    if req.risk_percent is not None:
        plan.risk_percent = Decimal(str(req.risk_percent))
    if req.thesis is not None:
        plan.thesis = req.thesis
    if req.invalidation is not None:
        plan.invalidation = req.invalidation
    if req.evidence is not None:
        plan.evidence = req.evidence
    if req.status is not None:
        plan.status = req.status.upper()

    plan.updated_at = datetime.now(UTC)
    await session.commit()
    await session.refresh(plan)

    return _serialize_plan(plan)


@router.post("/plan/validate", dependencies=[Depends(verify_hermes_token)])
@router.post("/plan/{plan_id}/validate", dependencies=[Depends(verify_hermes_token)])
async def validate_plan(
    req: ValidatePlanRequest,
    plan_id: str | None = None,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Validate structure, consistency, and sanity of a Trading Plan."""
    target_id = plan_id or req.plan_id
    plan: TradingPlanModel | None = None

    if target_id:
        try:
            plan_uuid = uuid.UUID(target_id)
            stmt = select(TradingPlanModel).where(TradingPlanModel.id == plan_uuid)
            plan = (await session.execute(stmt)).scalar_one_or_none()
        except ValueError:
            pass

    symbol = req.symbol or (plan.symbol if plan else None)
    direction = (req.direction or (plan.direction if plan else "LONG")).upper()
    entry = req.entry_price if req.entry_price is not None else (float(plan.entry_price) if plan and plan.entry_price else None)
    sl = req.stop_loss_price if req.stop_loss_price is not None else (float(plan.stop_loss_price) if plan and plan.stop_loss_price else None)
    tps = req.take_profit_prices or (plan.take_profit_prices if plan else [])
    thesis = req.thesis or (plan.thesis if plan else "")
    invalidation = req.invalidation or (plan.invalidation if plan else "")
    risk_pct = req.risk_percent if req.risk_percent is not None else (float(plan.risk_percent) if plan and plan.risk_percent else 0.01)

    errors: list[str] = []

    if not symbol:
        errors.append("Symbol is required")
    if direction not in ("LONG", "SHORT"):
        errors.append(f"Invalid direction: {direction}. Must be LONG or SHORT")
    if entry is None or entry <= 0:
        errors.append("Entry price must be positive")
    if sl is None or sl <= 0:
        errors.append("Stop loss price must be positive")

    if entry is not None and sl is not None and entry > 0 and sl > 0:
        if direction == "LONG" and sl >= entry:
            errors.append(f"Stop loss ({sl}) must be strictly lower than entry ({entry}) for LONG")
        elif direction == "SHORT" and sl <= entry:
            errors.append(f"Stop loss ({sl}) must be strictly higher than entry ({entry}) for SHORT")

    formatted_tps = _format_take_profits(tps)
    for tp in formatted_tps:
        tp_val = tp.get("price")
        if tp_val is not None and entry is not None:
            if direction == "LONG" and tp_val <= entry:
                errors.append(f"Take profit ({tp_val}) must be strictly higher than entry ({entry}) for LONG")
            elif direction == "SHORT" and tp_val >= entry:
                errors.append(f"Take profit ({tp_val}) must be strictly lower than entry ({entry}) for SHORT")

    if risk_pct is not None and (risk_pct <= 0 or risk_pct > 0.05):
        errors.append(f"Risk percent ({risk_pct}) must be between 0 and 0.05 (max 5%)")

    is_valid = len(errors) == 0

    if plan:
        plan.status = "VALIDATED" if is_valid else "INVALID"
        plan.updated_at = datetime.now(UTC)
        await session.commit()

    return {
        "plan_id": target_id,
        "is_valid": is_valid,
        "status": "VALID" if is_valid else "INVALID",
        "errors": errors,
    }


@router.post("/plan/{plan_id}/cancel", dependencies=[Depends(verify_hermes_token)])
async def cancel_plan(
    plan_id: str,
    req: CancelPlanRequest | None = None,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Cancel an existing Trading Plan."""
    try:
        plan_uuid = uuid.UUID(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan_id UUID") from exc

    stmt = select(TradingPlanModel).where(TradingPlanModel.id == plan_uuid)
    result = await session.execute(stmt)
    plan = result.scalar_one_or_none()

    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trading plan {plan_id} not found")

    reason = req.reason if req else "Cancelled"
    plan.status = "CANCELLED"
    plan.updated_at = datetime.now(UTC)
    await session.commit()

    return {
        "plan_id": str(plan.id),
        "status": "CANCELLED",
        "cancelled": True,
        "reason": reason,
    }


# ── Risk API Endpoints (4 Tools) ─────────────────────────────────────────────

@router.post("/risk/calculate_position_size", dependencies=[Depends(verify_hermes_token)])
async def calculate_position_size(
    req: CalculatePositionSizeRequest,
) -> dict[str, Any]:
    """Calculate deterministic safe position sizing based on risk equity budget and stop loss."""
    if req.entry_price <= 0 or req.stop_loss_price <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prices must be positive")

    eq = Decimal(str(req.total_equity))
    r_pct = Decimal(str(req.risk_percent))
    entry = Decimal(str(req.entry_price))
    sl = Decimal(str(req.stop_loss_price))

    stop_dist = abs(entry - sl)
    if stop_dist <= Decimal("0"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stop loss cannot equal entry price")

    risk_budget = Decimal(str(req.max_risk_amount)) if req.max_risk_amount is not None else eq * r_pct
    raw_qty = risk_budget / stop_dist

    if req.cash_balance is not None:
        cash = Decimal(str(req.cash_balance))
        max_qty_cash = max(Decimal("0"), cash / entry)
        raw_qty = min(raw_qty, max_qty_cash)

    # Step size quantization
    config = RiskConfig()
    symbol_cfg = config.symbol_rules.get(req.symbol, SymbolRiskConfig())
    quantized_qty = quantize_to_step(raw_qty, symbol_cfg.step_size)
    notional = quantized_qty * entry
    actual_risk = quantized_qty * stop_dist

    return {
        "symbol": req.symbol,
        "position_size": float(quantized_qty),
        "position_value": float(notional),
        "risk_amount": float(actual_risk),
        "risk_percent": float(r_pct),
        "stop_distance": float(stop_dist),
        "entry_price": float(entry),
        "stop_loss_price": float(sl),
        "step_size": float(symbol_cfg.step_size),
    }


@router.post("/risk/calculate_exposure", dependencies=[Depends(verify_hermes_token)])
async def calculate_exposure(
    req: CalculateExposureRequest,
) -> dict[str, Any]:
    """Calculate portfolio exposure, asset concentrations, and headroom."""
    total_eq = Decimal(str(req.total_equity))
    cash = Decimal(str(req.cash_balance))

    if total_eq <= Decimal("0"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Total equity must be positive")

    total_pos_val = Decimal("0")
    concentrations: dict[str, float] = {}

    for pos in req.positions:
        sym = pos.get("symbol", "UNKNOWN")
        qty = Decimal(str(pos.get("quantity", 0.0)))
        px = Decimal(str(pos.get("current_price") or pos.get("price") or pos.get("average_entry_price") or 0.0))
        val = qty * px
        total_pos_val += val
        conc = val / total_eq
        concentrations[sym] = float(round(conc, 4))

    exposure_pct = total_pos_val / total_eq
    max_conc = max(concentrations.values()) if concentrations else 0.0
    config = RiskConfig()

    within_limits = bool(
        Decimal(str(max_conc)) <= config.max_concentration_percent
        and exposure_pct <= Decimal("1.0")
    )

    return {
        "total_equity": float(total_eq),
        "cash_balance": float(cash),
        "total_exposure": float(total_pos_val),
        "exposure_percent": float(round(exposure_pct, 4)),
        "asset_concentrations": concentrations,
        "max_concentration": max_conc,
        "max_concentration_limit": float(config.max_concentration_percent),
        "within_limits": within_limits,
    }


@router.post("/risk/validate_plan", dependencies=[Depends(verify_hermes_token)])
async def validate_plan_risk(
    req: RiskValidatePlanRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Subject a Trading Plan to the deterministic Risk Engine.

    Guarantees that oversized plans or risk rule violations return REJECTED status.
    """
    config = RiskConfig()
    symbol_cfg = config.symbol_rules.get(req.symbol, SymbolRiskConfig())

    entry_px = Decimal(str(req.entry_price))
    sl_px = Decimal(str(req.stop_loss_price)) if req.stop_loss_price is not None else None
    tp_px = Decimal(str(req.take_profit_price)) if req.take_profit_price is not None else None
    tot_eq = Decimal(str(req.total_equity))
    cash = Decimal(str(req.cash_balance))
    peak_eq = Decimal(str(req.peak_equity if req.peak_equity is not None else req.total_equity))
    dd = Decimal(str(req.current_drawdown_percent)) if req.current_drawdown_percent is not None else None

    # Calculate or resolve quantity
    if req.quantity is not None:
        qty = Decimal(str(req.quantity))
    elif req.risk_percent is not None and sl_px is not None and abs(entry_px - sl_px) > 0:
        risk_budget = tot_eq * Decimal(str(req.risk_percent))
        stop_dist = abs(entry_px - sl_px)
        qty = quantize_to_step(risk_budget / stop_dist, symbol_cfg.step_size)
    else:
        # Default minimal test quantity
        qty = symbol_cfg.min_quantity

    # Convert open positions to PositionSnapshots
    open_pos_snapshots: dict[str, PositionSnapshot] = {}
    if isinstance(req.open_positions, dict):
        for s, p in req.open_positions.items():
            if isinstance(p, dict):
                open_pos_snapshots[s] = PositionSnapshot(
                    symbol=s,
                    quantity=Decimal(str(p.get("quantity", 0.0))),
                    average_entry_price=Decimal(str(p.get("average_entry_price", entry_px))),
                    current_price=Decimal(str(p.get("current_price", entry_px))),
                )
    elif isinstance(req.open_positions, list):
        for p in req.open_positions:
            s = p.get("symbol", req.symbol)
            open_pos_snapshots[s] = PositionSnapshot(
                symbol=s,
                quantity=Decimal(str(p.get("quantity", 0.0))),
                average_entry_price=Decimal(str(p.get("average_entry_price", entry_px))),
                current_price=Decimal(str(p.get("current_price", entry_px))),
            )

    risk_state = RiskState(
        cash_balance=cash,
        total_equity=tot_eq,
        peak_equity=peak_eq,
        current_drawdown_percent=dd,
        open_positions=open_pos_snapshots,
        market_price=entry_px,
        market_data_timestamp=datetime.now(timezone.utc),
        kill_switch_active=req.kill_switch_active,
    )

    side = OrderSide.BUY if req.direction.upper() in ("LONG", "BUY") else OrderSide.SELL
    trade_intent = TradeIntent(
        symbol=req.symbol,
        side=side,
        order_type=OrderType.LIMIT,
        quantity=qty,
        limit_price=entry_px,
        stop_loss_price=sl_px,
        take_profit_price=tp_px,
        leverage=Decimal(str(req.leverage)),
    )

    # Pure deterministic risk evaluation
    decision_result = evaluate_trade(
        state=risk_state,
        config=config,
        intent=trade_intent,
        now=datetime.now(timezone.utc),
    )

    # If the proposal was downscaled due to exceeding risk/concentration limits,
    # it is an oversized plan and must be REJECTED per trading plan risk policy.
    if decision_result.decision == RiskDecisionType.MODIFIED:
        decision_val = "rejected"
        status_str = "REJECTED"
        is_approved = False
        rule_codes = [rc.value for rc in decision_result.rule_codes] + [RiskRuleCode.RULE_MAX_RISK_PER_TRADE.value]
        reason = (
            f"Plan rejected: proposed plan is oversized. Requested quantity {decision_result.original_quantity} "
            f"exceeds risk limits; safe maximum size is {decision_result.approved_quantity}."
        )
    elif decision_result.decision == RiskDecisionType.APPROVED:
        decision_val = "approved"
        status_str = "APPROVED"
        is_approved = True
        rule_codes = [rc.value for rc in decision_result.rule_codes]
        reason = decision_result.reason
    else:
        decision_val = "rejected"
        status_str = "REJECTED"
        is_approved = False
        rule_codes = [rc.value for rc in decision_result.rule_codes]
        reason = decision_result.reason

    # If linked to a persistent TradingPlanModel in DB, update status
    if req.plan_id:
        try:
            plan_uuid = uuid.UUID(req.plan_id)
            stmt = select(TradingPlanModel).where(TradingPlanModel.id == plan_uuid)
            plan = (await session.execute(stmt)).scalar_one_or_none()
            if plan:
                plan.status = status_str
                plan.updated_at = datetime.now(UTC)
                await session.commit()
        except Exception as e:
            logger.debug("risk_validate_plan_update_failed", error=str(e), plan_id=req.plan_id)

    return {
        "decision": decision_val,
        "status": status_str,
        "is_approved": is_approved,
        "rule_codes": rule_codes,
        "risk_score": float(decision_result.risk_score),
        "original_quantity": float(decision_result.original_quantity),
        "approved_quantity": float(decision_result.approved_quantity) if is_approved else 0.0,
        "reason": reason,
        "limits_evaluated": {k: float(v) if isinstance(v, Decimal) else v for k, v in decision_result.limits_evaluated.items()},
        "plan_id": req.plan_id,
    }



@router.post("/risk/check_portfolio_risk", dependencies=[Depends(verify_hermes_token)])
async def check_portfolio_risk(
    req: CheckPortfolioRiskRequest,
) -> dict[str, Any]:
    """Comprehensive health and risk gate check of the portfolio."""
    config = RiskConfig()
    total_eq = Decimal(str(req.total_equity))
    cash = Decimal(str(req.cash_balance))
    peak_eq = Decimal(str(req.peak_equity if req.peak_equity is not None else req.total_equity))

    violations: list[str] = []

    # 1. Kill Switch
    if req.kill_switch_active:
        violations.append(RiskRuleCode.RULE_KILL_SWITCH_ACTIVE.value)

    # 2. Drawdown
    peak = max(peak_eq, total_eq)
    calc_dd = max(Decimal("0"), (peak - total_eq) / peak) if peak > Decimal("0") else Decimal("0")
    current_dd = Decimal(str(req.current_drawdown_percent)) if req.current_drawdown_percent is not None else calc_dd

    if current_dd > config.max_drawdown_percent:
        violations.append(RiskRuleCode.RULE_MAX_DRAWDOWN.value)

    # 3. Position count
    pos_count = len(req.open_positions)
    if pos_count >= config.max_open_positions:
        violations.append(RiskRuleCode.RULE_MAX_OPEN_POSITIONS.value)

    # 4. Asset Concentration
    highest_asset = None
    highest_conc = Decimal("0")

    pos_items = req.open_positions.items() if isinstance(req.open_positions, dict) else [
        (p.get("symbol", "ASSET"), p) for p in req.open_positions
    ]

    for sym, p in pos_items:
        if isinstance(p, dict):
            qty = Decimal(str(p.get("quantity", 0.0)))
            px = Decimal(str(p.get("current_price") or p.get("average_entry_price") or 0.0))
            val = qty * px
            conc = val / total_eq if total_eq > Decimal("0") else Decimal("0")
            if conc > highest_conc:
                highest_conc = conc
                highest_asset = sym
            if conc > config.max_concentration_percent:
                if RiskRuleCode.RULE_MAX_CONCENTRATION.value not in violations:
                    violations.append(RiskRuleCode.RULE_MAX_CONCENTRATION.value)

    can_trade = len(violations) == 0
    if req.kill_switch_active or current_dd > config.max_drawdown_percent:
        portfolio_status = "CRITICAL"
    elif len(violations) > 0:
        portfolio_status = "WARNING"
    else:
        portfolio_status = "SAFE"

    return {
        "status": portfolio_status,
        "can_trade": can_trade,
        "kill_switch_active": req.kill_switch_active,
        "drawdown_percent": float(round(current_dd, 4)),
        "max_drawdown_percent": float(config.max_drawdown_percent),
        "open_positions_count": pos_count,
        "max_open_positions": config.max_open_positions,
        "highest_concentration_asset": highest_asset,
        "highest_concentration_percent": float(round(highest_conc, 4)),
        "max_concentration_percent": float(config.max_concentration_percent),
        "violations": violations,
    }
