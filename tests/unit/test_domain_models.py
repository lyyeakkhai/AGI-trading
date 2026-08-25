from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

import pytest

from packages.domain.agent import AgentDecision, AgentObservation
from packages.domain.enums import (
    ApprovalStatus,
    ExecutionStatus,
    OrderSide,
    OrderType,
    RiskDecisionType,
    Timeframe,
    TradingMode,
)
from packages.domain.market import (
    Asset,
    Candle,
    IndicatorSnapshot,
    KnowledgeEmbedding,
    MarketEvent,
    Opportunity,
    TradingSkill,
)
from packages.domain.trading import (
    AuditRecord,
    ExecutionRequest,
    Fill,
    IdempotencyKey,
    Order,
    OwnerApproval,
    PortfolioAccount,
    PortfolioEntry,
    Position,
    RiskDecision,
    Trade,
    TradeProposal,
)
from packages.domain.value_objects import (
    Balance,
    Fee,
    Notional,
    PnL,
    Price,
    Quantity,
)


def test_price_rejects_float() -> None:
    with pytest.raises(ValueError, match="float not allowed for Price; use Decimal"):
        Price(value=1.5)


def test_price_accepts_decimal() -> None:
    p = Price(value=Decimal("42000.50"))
    assert p.value == Decimal("42000.50")


def test_quantity_rejects_float() -> None:
    with pytest.raises(ValueError, match="float not allowed for Quantity; use Decimal"):
        Quantity(value=0.05)


def test_quantity_accepts_decimal() -> None:
    q = Quantity(value=Decimal("0.05"))
    assert q.value == Decimal("0.05")


def test_all_value_objects_reject_float() -> None:
    for vo_cls in (Notional, Fee, Balance, PnL):
        with pytest.raises(ValueError, match=f"float not allowed for {vo_cls.__name__}; use Decimal"):
            vo_cls(value=12.34)


def test_value_objects_accept_string_and_int() -> None:
    assert Price(value="100.50").value == Decimal("100.50")
    assert Quantity(value=10).value == Decimal("10")
    assert Fee(value="0.001").value == Decimal("0.001")


def test_fill_has_correlation_id_and_financial_types() -> None:
    cid = uuid4()
    fill = Fill(
        order_id=uuid4(),
        exchange_trade_id="t_12345",
        symbol="BTC/USDT",
        side=OrderSide.BUY,
        quantity=Quantity(value=Decimal("1.5")),
        price=Price(value=Decimal("45000.00")),
        fee=Fee(value=Decimal("0.0015")),
        fee_asset="BTC",
        trading_mode=TradingMode.PAPER,
        correlation_id=cid,
        executed_at=datetime.now(timezone.utc),
    )
    assert fill.correlation_id == cid
    assert fill.trading_mode == TradingMode.PAPER
    assert fill.quantity.value == Decimal("1.5")
    assert fill.price.value == Decimal("45000.00")


def test_trading_mode_on_financial_objects() -> None:
    cid = uuid4()
    now = datetime.now(timezone.utc)

    proposal = TradeProposal(
        symbol="ETH/USDT",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Quantity(value=Decimal("2.0")),
        limit_price=Price(value=Decimal("3000.00")),
        rationale="MA Crossover",
        trading_mode=TradingMode.LIVE,
        correlation_id=cid,
        created_at=now,
        expires_at=now,
    )
    assert proposal.trading_mode == TradingMode.LIVE
    assert proposal.correlation_id == cid

    pos = Position(
        account_id=uuid4(),
        symbol="ETH/USDT",
        quantity=Quantity(value=Decimal("2.0")),
        average_entry_price=Price(value=Decimal("3000.00")),
        realized_pnl=PnL(value=Decimal("0.0")),
        trading_mode=TradingMode.PAPER,
        updated_at=now,
    )
    assert pos.trading_mode == TradingMode.PAPER


def test_market_candle_model() -> None:
    now = datetime.now(timezone.utc)
    candle = Candle(
        symbol="BTC/USDT",
        timeframe=Timeframe.M15,
        open=Price(value=Decimal("50000.0")),
        high=Price(value=Decimal("50500.0")),
        low=Price(value=Decimal("49800.0")),
        close=Price(value=Decimal("50200.0")),
        volume=Quantity(value=Decimal("123.45")),
        timestamp=now,
        is_closed=True,
        trading_mode=TradingMode.PAPER,
    )
    assert candle.symbol == "BTC/USDT"
    assert candle.timeframe == Timeframe.M15
    assert candle.is_closed is True


def test_agent_observation_and_decision_models() -> None:
    cid = uuid4()
    now = datetime.now(timezone.utc)
    obs = AgentObservation(
        agent_id="analyst_1",
        observation_type="market_scan",
        content={"volatility": "high"},
        trading_mode=TradingMode.PAPER,
        correlation_id=cid,
        observed_at=now,
    )
    assert obs.agent_id == "analyst_1"
    assert obs.correlation_id == cid

    dec = AgentDecision(
        agent_id="analyst_1",
        observation_id=obs.id,
        decision_type="skip_trade",
        reasoning="volatility too high",
        outcome={"action": "none"},
        trading_mode=TradingMode.PAPER,
        correlation_id=cid,
        decided_at=now,
    )
    assert dec.observation_id == obs.id
    assert dec.decision_type == "skip_trade"
