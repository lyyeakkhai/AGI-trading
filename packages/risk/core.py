from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_FLOOR
from typing import Any

from packages.domain.enums import OrderSide
from packages.risk.models import (
    PositionSnapshot,
    RiskConfig,
    RiskDecisionResult,
    RiskDecisionType,
    RiskRuleCode,
    RiskState,
    SymbolRiskConfig,
    TradeIntent,
)


def quantize_to_step(qty: Decimal, step_size: Decimal) -> Decimal:
    """Quantize quantity down to the nearest multiple of step_size."""
    if step_size <= Decimal("0"):
        return qty
    units = (qty / step_size).to_integral_value(rounding=ROUND_FLOOR)
    return units * step_size


def evaluate_trade(
    state: RiskState,
    config: RiskConfig,
    intent: TradeIntent,
    now: datetime | None = None,
) -> RiskDecisionResult:
    """Pure, deterministic risk evaluation of a proposed trade order.
    
    Guarantees:
    - Zero network, database, or Redis calls.
    - Pure Decimal arithmetic.
    - Fail-closed on missing data, stale feeds, or invalid states.
    - In-place sizing modification when safe parameters allow downscaling.
    """
    if now is None:
        now = datetime.now(timezone.utc)
    elif now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    # 1. Structural & Hard-Safety Checks
    if not config.spot_only or config.leverage_enabled or intent.leverage > Decimal("1.0"):
        return RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=[RiskRuleCode.RULE_SPOT_ONLY, RiskRuleCode.RULE_NO_LEVERAGE],
            risk_score=Decimal("1.0"),
            original_quantity=intent.quantity,
            approved_quantity=Decimal("0.0"),
            reason="Structural violation: non-spot or leverage trading is strictly disallowed",
        )

    if state.kill_switch_active:
        return RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=[RiskRuleCode.RULE_KILL_SWITCH_ACTIVE],
            risk_score=Decimal("1.0"),
            original_quantity=intent.quantity,
            approved_quantity=Decimal("0.0"),
            reason="Kill switch is active: all trade executions are blocked",
        )

    # Staleness check
    if state.market_data_timestamp is None:
        return RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=[RiskRuleCode.RULE_STALE_MARKET_DATA],
            risk_score=Decimal("1.0"),
            original_quantity=intent.quantity,
            approved_quantity=Decimal("0.0"),
            reason="Market data timestamp is missing: failing closed",
        )

    md_time = state.market_data_timestamp
    if md_time.tzinfo is None:
        md_time = md_time.replace(tzinfo=timezone.utc)

    age_seconds = (now - md_time).total_seconds()
    if age_seconds < 0 or age_seconds > config.market_data_max_age_seconds:
        return RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=[RiskRuleCode.RULE_STALE_MARKET_DATA],
            risk_score=Decimal("1.0"),
            original_quantity=intent.quantity,
            approved_quantity=Decimal("0.0"),
            limits_evaluated={"market_data_age_seconds": age_seconds, "max_age_seconds": config.market_data_max_age_seconds},
            reason=f"Market data is stale ({age_seconds:.1f}s > {config.market_data_max_age_seconds}s limit)",
        )

    # 2. Drawdown Gate
    peak = max(state.peak_equity, state.total_equity)
    if peak > Decimal("0"):
        calc_drawdown = max(Decimal("0"), (peak - state.total_equity) / peak)
    else:
        calc_drawdown = Decimal("0")

    drawdown = state.current_drawdown_percent if state.current_drawdown_percent is not None else calc_drawdown
    if drawdown > config.max_drawdown_percent:
        if intent.side == OrderSide.BUY:
            return RiskDecisionResult(
                decision=RiskDecisionType.REJECTED,
                rule_codes=[RiskRuleCode.RULE_MAX_DRAWDOWN],
                risk_score=Decimal("1.0"),
                original_quantity=intent.quantity,
                approved_quantity=Decimal("0.0"),
                limits_evaluated={"drawdown": drawdown, "max_drawdown": config.max_drawdown_percent},
                reason=f"Portfolio drawdown ({drawdown * 100:.2f}%) exceeds maximum limit ({config.max_drawdown_percent * 100:.2f}%)",
            )

    # 3. Symbol Precision & Execution Price Determination
    symbol_cfg = config.symbol_rules.get(intent.symbol, SymbolRiskConfig())
    price = intent.limit_price if (intent.limit_price is not None and intent.limit_price > Decimal("0")) else state.market_price
    if price <= Decimal("0"):
        return RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=[RiskRuleCode.RULE_STALE_MARKET_DATA],
            risk_score=Decimal("1.0"),
            original_quantity=intent.quantity,
            approved_quantity=Decimal("0.0"),
            reason="Invalid or zero market price: failing closed",
        )

    # 4. Reward-to-Risk Ratio Check
    if intent.stop_loss_price is not None and intent.take_profit_price is not None and intent.side == OrderSide.BUY:
        risk_dist = price - intent.stop_loss_price
        reward_dist = intent.take_profit_price - price
        if risk_dist <= Decimal("0") or reward_dist <= Decimal("0"):
            return RiskDecisionResult(
                decision=RiskDecisionType.REJECTED,
                rule_codes=[RiskRuleCode.RULE_MIN_REWARD_RISK_RATIO],
                risk_score=Decimal("1.0"),
                original_quantity=intent.quantity,
                approved_quantity=Decimal("0.0"),
                reason="Invalid stop loss or take profit prices for BUY order",
            )
        rr_ratio = reward_dist / risk_dist
        if rr_ratio < config.min_reward_risk_ratio:
            return RiskDecisionResult(
                decision=RiskDecisionType.REJECTED,
                rule_codes=[RiskRuleCode.RULE_MIN_REWARD_RISK_RATIO],
                risk_score=Decimal("1.0"),
                original_quantity=intent.quantity,
                approved_quantity=Decimal("0.0"),
                limits_evaluated={"reward_risk_ratio": rr_ratio, "min_required": config.min_reward_risk_ratio},
                reason=f"Reward-to-risk ratio ({rr_ratio:.2f}) is below required minimum ({config.min_reward_risk_ratio:.2f})",
            )

    # 5. Sell Validation (Spot Only)
    if intent.side == OrderSide.SELL:
        pos: PositionSnapshot | None = state.open_positions.get(intent.symbol)
        if pos is None or pos.quantity <= Decimal("0"):
            return RiskDecisionResult(
                decision=RiskDecisionType.REJECTED,
                rule_codes=[RiskRuleCode.RULE_SPOT_ONLY, RiskRuleCode.RULE_INSUFFICIENT_BALANCE],
                risk_score=Decimal("1.0"),
                original_quantity=intent.quantity,
                approved_quantity=Decimal("0.0"),
                reason=f"No existing spot position for {intent.symbol} to sell",
            )

        max_sellable = pos.quantity
        if intent.quantity > max_sellable:
            safe_qty = quantize_to_step(max_sellable, symbol_cfg.step_size)
            if safe_qty < symbol_cfg.min_quantity or (safe_qty * price) < max(config.min_notional, symbol_cfg.min_notional):
                return RiskDecisionResult(
                    decision=RiskDecisionType.REJECTED,
                    rule_codes=[RiskRuleCode.RULE_MIN_NOTIONAL],
                    risk_score=Decimal("1.0"),
                    original_quantity=intent.quantity,
                    approved_quantity=Decimal("0.0"),
                    reason="Sellable position is below minimum notional or quantity",
                )
            return RiskDecisionResult(
                decision=RiskDecisionType.MODIFIED,
                rule_codes=[RiskRuleCode.RULE_MODIFIED_SIZE],
                risk_score=Decimal("0.5"),
                original_quantity=intent.quantity,
                approved_quantity=safe_qty,
                limits_evaluated={"available_position": pos.quantity, "modified_to": safe_qty},
                reason=f"Requested sell quantity {intent.quantity} exceeded available position {pos.quantity}; resized to {safe_qty}",
            )

        safe_qty = quantize_to_step(intent.quantity, symbol_cfg.step_size)
        if safe_qty < symbol_cfg.min_quantity or (safe_qty * price) < max(config.min_notional, symbol_cfg.min_notional):
            return RiskDecisionResult(
                decision=RiskDecisionType.REJECTED,
                rule_codes=[RiskRuleCode.RULE_MIN_NOTIONAL],
                risk_score=Decimal("1.0"),
                original_quantity=intent.quantity,
                approved_quantity=Decimal("0.0"),
                reason="Sell order is below minimum notional or lot size",
            )

        if safe_qty < intent.quantity:
            return RiskDecisionResult(
                decision=RiskDecisionType.MODIFIED,
                rule_codes=[RiskRuleCode.RULE_MODIFIED_SIZE],
                risk_score=Decimal("0.2"),
                original_quantity=intent.quantity,
                approved_quantity=safe_qty,
                limits_evaluated={"step_size": symbol_cfg.step_size},
                reason="Sell quantity adjusted to match symbol step size",
            )

        return RiskDecisionResult(
            decision=RiskDecisionType.APPROVED,
            rule_codes=[RiskRuleCode.RULE_APPROVED],
            risk_score=Decimal("0.0"),
            original_quantity=intent.quantity,
            approved_quantity=safe_qty,
            reason="Sell order approved",
        )

    # 6. Buy Validation & Multi-Constraint Sizing
    # Max open positions check
    if intent.symbol not in state.open_positions and len(state.open_positions) >= config.max_open_positions:
        return RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=[RiskRuleCode.RULE_MAX_OPEN_POSITIONS],
            risk_score=Decimal("1.0"),
            original_quantity=intent.quantity,
            approved_quantity=Decimal("0.0"),
            limits_evaluated={"open_positions": len(state.open_positions), "max_allowed": config.max_open_positions},
            reason=f"Max open positions reached ({len(state.open_positions)}/{config.max_open_positions})",
        )

    # Constraint A: Max Risk per Trade
    max_risk_amount = state.total_equity * config.max_risk_per_trade_percent
    if intent.stop_loss_price is not None and intent.stop_loss_price < price:
        stop_distance = price - intent.stop_loss_price
        max_qty_by_risk = max_risk_amount / stop_distance
    else:
        # Fallback if no stop loss: entire trade value treated as risk exposure
        stop_distance = price
        max_qty_by_risk = max_risk_amount / price

    # Constraint B: Available Cash Balance
    max_qty_by_cash = max(Decimal("0"), state.cash_balance / price)

    # Constraint C: Max Portfolio Concentration per Asset
    current_pos_val = state.open_positions[intent.symbol].quantity * price if intent.symbol in state.open_positions else Decimal("0")
    max_allowed_val = state.total_equity * config.max_concentration_percent
    remaining_conc_val = max(Decimal("0"), max_allowed_val - current_pos_val)
    max_qty_by_conc = remaining_conc_val / price

    # Constraint D: Symbol Max Quantity
    max_qty_by_symbol = symbol_cfg.max_quantity

    permissible_qty = min(
        intent.quantity,
        max_qty_by_risk,
        max_qty_by_cash,
        max_qty_by_conc,
        max_qty_by_symbol,
    )

    quantized_qty = quantize_to_step(permissible_qty, symbol_cfg.step_size)
    min_notional_req = max(config.min_notional, symbol_cfg.min_notional)

    # Minimum checks
    if quantized_qty < symbol_cfg.min_quantity or (quantized_qty * price) < min_notional_req:
        rejection_codes: list[RiskRuleCode] = []
        reasons: list[str] = []

        if max_qty_by_risk < symbol_cfg.min_quantity or (max_qty_by_risk * price) < min_notional_req:
            rejection_codes.append(RiskRuleCode.RULE_MAX_RISK_PER_TRADE)
            reasons.append(f"risk budget ({max_risk_amount:.2f}) insufficient for min trade size")

        if max_qty_by_cash < symbol_cfg.min_quantity or (max_qty_by_cash * price) < min_notional_req:
            rejection_codes.append(RiskRuleCode.RULE_INSUFFICIENT_BALANCE)
            reasons.append(f"cash balance ({state.cash_balance:.2f}) insufficient for min trade size")

        if max_qty_by_conc < symbol_cfg.min_quantity or (max_qty_by_conc * price) < min_notional_req:
            rejection_codes.append(RiskRuleCode.RULE_MAX_CONCENTRATION)
            reasons.append(f"concentration limit ({config.max_concentration_percent * 100:.1f}%) reached for {intent.symbol}")

        if not rejection_codes:
            rejection_codes.append(RiskRuleCode.RULE_MIN_NOTIONAL)
            reasons.append(f"order notional ({intent.quantity * price:.2f}) below min notional {min_notional_req:.2f}")

        return RiskDecisionResult(
            decision=RiskDecisionType.REJECTED,
            rule_codes=rejection_codes,
            risk_score=Decimal("1.0"),
            original_quantity=intent.quantity,
            approved_quantity=Decimal("0.0"),
            limits_evaluated={
                "max_qty_by_risk": max_qty_by_risk,
                "max_qty_by_cash": max_qty_by_cash,
                "max_qty_by_concentration": max_qty_by_conc,
                "min_notional": min_notional_req,
            },
            reason="; ".join(reasons),
        )

    limits: dict[str, Any] = {
        "max_risk_amount": max_risk_amount,
        "max_qty_by_risk": max_qty_by_risk,
        "max_qty_by_cash": max_qty_by_cash,
        "max_qty_by_concentration": max_qty_by_conc,
        "step_size": symbol_cfg.step_size,
    }

    # If quantity was downscaled
    if quantized_qty < intent.quantity:
        # Calculate risk score (proportion of max allowed risk used)
        trade_risk = quantized_qty * stop_distance
        risk_score = min(Decimal("1.0"), trade_risk / max_risk_amount) if max_risk_amount > Decimal("0") else Decimal("0.5")
        
        return RiskDecisionResult(
            decision=RiskDecisionType.MODIFIED,
            rule_codes=[RiskRuleCode.RULE_MODIFIED_SIZE],
            risk_score=risk_score,
            original_quantity=intent.quantity,
            approved_quantity=quantized_qty,
            limits_evaluated=limits,
            reason=f"Requested quantity {intent.quantity} scaled down to safe quantity {quantized_qty}",
        )

    # Approved full size
    trade_risk = quantized_qty * stop_distance
    risk_score = min(Decimal("1.0"), trade_risk / max_risk_amount) if max_risk_amount > Decimal("0") else Decimal("0.0")

    return RiskDecisionResult(
        decision=RiskDecisionType.APPROVED,
        rule_codes=[RiskRuleCode.RULE_APPROVED],
        risk_score=risk_score,
        original_quantity=intent.quantity,
        approved_quantity=quantized_qty,
        limits_evaluated=limits,
        reason="Trade proposal satisfies all risk rules",
    )
