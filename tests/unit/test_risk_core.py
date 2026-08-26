from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest

from packages.domain.enums import OrderSide, OrderType
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


@pytest.fixture
def base_config() -> RiskConfig:
    return RiskConfig(
        spot_only=True,
        leverage_enabled=False,
        max_risk_per_trade_percent=Decimal("0.02"),  # 2% max risk
        max_drawdown_percent=Decimal("0.01"),       # 1% max drawdown
        max_concentration_percent=Decimal("0.30"),  # 30% concentration
        max_open_positions=3,
        min_reward_risk_ratio=Decimal("1.5"),
        market_data_max_age_seconds=60,
        min_notional=Decimal("10.0"),
        symbol_rules={
            "BTC/USDT": SymbolRiskConfig(
                min_quantity=Decimal("0.001"),
                max_quantity=Decimal("100.0"),
                step_size=Decimal("0.001"),
                price_precision=2,
                min_notional=Decimal("10.0"),
            ),
            "ETH/USDT": SymbolRiskConfig(
                min_quantity=Decimal("0.01"),
                max_quantity=Decimal("100.0"),
                step_size=Decimal("0.01"),
                price_precision=2,
                min_notional=Decimal("10.0"),
            ),
        },
    )


@pytest.fixture
def base_state() -> RiskState:
    now = datetime.now(timezone.utc)
    return RiskState(
        cash_balance=Decimal("10000.00"),
        total_equity=Decimal("10000.00"),
        peak_equity=Decimal("10000.00"),
        current_drawdown_percent=Decimal("0.0"),
        open_positions={},
        market_price=Decimal("50000.00"),
        market_data_timestamp=now,
        kill_switch_active=False,
    )


def test_quantize_to_step() -> None:
    assert quantize_to_step(Decimal("0.12345"), Decimal("0.001")) == Decimal("0.123")
    assert quantize_to_step(Decimal("0.12399"), Decimal("0.01")) == Decimal("0.12")
    assert quantize_to_step(Decimal("5.0"), Decimal("0")) == Decimal("5.0")


def test_spot_only_and_leverage_rejection(base_config: RiskConfig, base_state: RiskState) -> None:
    # Test intent with leverage > 1.0
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("52000.00"),
        leverage=Decimal("2.0"),
    )
    res = evaluate_trade(base_state, base_config, intent)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_SPOT_ONLY in res.rule_codes
    assert RiskRuleCode.RULE_NO_LEVERAGE in res.rule_codes

    # Test config validator rejects spot_only=False
    with pytest.raises(ValueError, match="spot_only must be True"):
        RiskConfig(spot_only=False)

    with pytest.raises(ValueError, match="leverage_enabled must be False"):
        RiskConfig(leverage_enabled=True)


def test_kill_switch_rejection(base_config: RiskConfig, base_state: RiskState) -> None:
    state = base_state.model_copy(update={"kill_switch_active": True})
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("52000.00"),
    )
    res = evaluate_trade(state, base_config, intent)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_KILL_SWITCH_ACTIVE in res.rule_codes


def test_staleness_validator(base_config: RiskConfig, base_state: RiskState) -> None:
    now = datetime.now(timezone.utc)
    stale_time = now - timedelta(seconds=120)
    state = base_state.model_copy(update={"market_data_timestamp": stale_time})
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("52000.00"),
    )
    res = evaluate_trade(state, base_config, intent, now=now)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_STALE_MARKET_DATA in res.rule_codes

    # Missing timestamp
    state_no_time = base_state.model_copy(update={"market_data_timestamp": None})
    res_no_time = evaluate_trade(state_no_time, base_config, intent, now=now)
    assert res_no_time.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_STALE_MARKET_DATA in res_no_time.rule_codes


def test_drawdown_gate(base_config: RiskConfig, base_state: RiskState) -> None:
    # 15% drawdown on 10% max allowed
    state = base_state.model_copy(update={
        "peak_equity": Decimal("10000.00"),
        "total_equity": Decimal("8500.00"),
        "current_drawdown_percent": Decimal("0.15"),
    })
    buy_intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("52000.00"),
    )
    res = evaluate_trade(state, base_config, buy_intent)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_MAX_DRAWDOWN in res.rule_codes

    # Sell trade during drawdown is permitted (to de-risk)
    state_with_pos = state.model_copy(update={
        "open_positions": {
            "BTC/USDT": PositionSnapshot(
                symbol="BTC/USDT",
                quantity=Decimal("0.05"),
                average_entry_price=Decimal("50000.00"),
                current_price=Decimal("50000.00"),
            )
        }
    })
    sell_intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.SELL,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.05"),
        limit_price=Decimal("50000.00"),
    )
    sell_res = evaluate_trade(state_with_pos, base_config, sell_intent)
    assert sell_res.decision == RiskDecisionType.APPROVED


def test_reward_to_risk_ratio_rejection(base_config: RiskConfig, base_state: RiskState) -> None:
    # Stop loss 49,000 (risk = 1000), TP 51,000 (reward = 1000) -> R:R = 1.0 < 1.5 min required
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("51000.00"),
    )
    res = evaluate_trade(base_state, base_config, intent)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_MIN_REWARD_RISK_RATIO in res.rule_codes

    # Invalid stop price (above entry)
    invalid_intent = intent.model_copy(update={"stop_loss_price": Decimal("51000.00")})
    res_inv = evaluate_trade(base_state, base_config, invalid_intent)
    assert res_inv.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_MIN_REWARD_RISK_RATIO in res_inv.rule_codes


def test_max_open_positions_rejection(base_config: RiskConfig, base_state: RiskState) -> None:
    # 3 positions already open (max allowed = 3)
    state = base_state.model_copy(update={
        "open_positions": {
            "ETH/USDT": PositionSnapshot(symbol="ETH/USDT", quantity=Decimal("1.0"), average_entry_price=Decimal("3000"), current_price=Decimal("3000")),
            "SOL/USDT": PositionSnapshot(symbol="SOL/USDT", quantity=Decimal("10.0"), average_entry_price=Decimal("150"), current_price=Decimal("150")),
            "BNB/USDT": PositionSnapshot(symbol="BNB/USDT", quantity=Decimal("5.0"), average_entry_price=Decimal("600"), current_price=Decimal("600")),
        }
    })
    # Attempt to open a 4th new symbol BTC
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.01"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("53000.00"),
    )
    res = evaluate_trade(state, base_config, intent)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_MAX_OPEN_POSITIONS in res.rule_codes


def test_modified_size_downscale_due_to_risk(base_config: RiskConfig, base_state: RiskState) -> None:
    # Total equity = $10,000. Max risk per trade = 2% = $200.
    # Entry = 50,000, Stop Loss = 48,000 (stop distance = $2,000/BTC).
    # Max allowed quantity by risk = $200 / $2,000 = 0.100 BTC.
    # Intent requests 0.500 BTC ($1,000 risk > $200 allowed).
    # Override config for this specific test
    base_config = base_config.model_copy(update={"max_concentration_percent": Decimal("1.0")})
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.500"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("48000.00"),
        take_profit_price=Decimal("55000.00"),
    )
    res = evaluate_trade(base_state, base_config, intent)
    assert res.decision == RiskDecisionType.MODIFIED
    assert res.approved_quantity == Decimal("0.100")
    assert RiskRuleCode.RULE_MODIFIED_SIZE in res.rule_codes


def test_concentration_limit_modification(base_config: RiskConfig, base_state: RiskState) -> None:
    # Total equity = $10,000. Max concentration = 30% = $3,000.
    # Current BTC position = $2,000 (0.04 BTC at 50,000).
    # Remaining concentration room = $1,000 / 50,000 = 0.020 BTC.
    # Intent requests 0.050 BTC.
    state = base_state.model_copy(update={
        "open_positions": {
            "BTC/USDT": PositionSnapshot(
                symbol="BTC/USDT",
                quantity=Decimal("0.040"),
                average_entry_price=Decimal("50000.00"),
                current_price=Decimal("50000.00"),
            )
        }
    })
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.050"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("53000.00"),
    )
    res = evaluate_trade(state, base_config, intent)
    assert res.decision == RiskDecisionType.MODIFIED
    assert res.approved_quantity == Decimal("0.020")


def test_spot_sell_oversize_downscaling(base_config: RiskConfig, base_state: RiskState) -> None:
    # Owns 0.050 BTC. Requests to sell 0.100 BTC.
    state = base_state.model_copy(update={
        "open_positions": {
            "BTC/USDT": PositionSnapshot(
                symbol="BTC/USDT",
                quantity=Decimal("0.050"),
                average_entry_price=Decimal("50000.00"),
                current_price=Decimal("50000.00"),
            )
        }
    })
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.SELL,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.100"),
        limit_price=Decimal("50000.00"),
    )
    res = evaluate_trade(state, base_config, intent)
    assert res.decision == RiskDecisionType.MODIFIED
    assert res.approved_quantity == Decimal("0.050")
    assert RiskRuleCode.RULE_MODIFIED_SIZE in res.rule_codes


def test_spot_sell_no_position_rejection(base_config: RiskConfig, base_state: RiskState) -> None:
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.SELL,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.100"),
        limit_price=Decimal("50000.00"),
    )
    res = evaluate_trade(base_state, base_config, intent)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_SPOT_ONLY in res.rule_codes
    assert RiskRuleCode.RULE_INSUFFICIENT_BALANCE in res.rule_codes


def test_min_notional_rejection(base_config: RiskConfig, base_state: RiskState) -> None:
    # Intent for $5 value with min_notional = $10
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.0001"),
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("53000.00"),
    )
    res = evaluate_trade(base_state, base_config, intent)
    assert res.decision == RiskDecisionType.REJECTED
    assert RiskRuleCode.RULE_MIN_NOTIONAL in res.rule_codes or RiskRuleCode.RULE_MIN_QUANTITY in res.rule_codes


def test_approved_happy_path(base_config: RiskConfig, base_state: RiskState) -> None:
    intent = TradeIntent(
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("0.020"),  # $1,000 notional, $20 risk (0.2% equity)
        limit_price=Decimal("50000.00"),
        stop_loss_price=Decimal("49000.00"),
        take_profit_price=Decimal("53000.00"),
    )
    res = evaluate_trade(base_state, base_config, intent)
    assert res.decision == RiskDecisionType.APPROVED
    assert res.approved_quantity == Decimal("0.020")
    assert RiskRuleCode.RULE_APPROVED in res.rule_codes
