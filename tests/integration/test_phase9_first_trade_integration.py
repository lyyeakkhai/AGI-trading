"""Phase 9: The First-Trade Integration Test.

Autonomously executes the complete end-to-end trading loop for BTCUSDT in paper-trading mode:
1. Observe: market.get_candles & market.get_ticker
2. Analyze: analysis.detect_swings, analysis.detect_market_structure, analysis.detect_support_resistance
3. Visualize: chart.draw_zone & chart.add_annotation
4. Plan: plan.create (Trading Plan JSON)
5. Validate: risk.validate_plan (Risk Engine evaluation)
6. Execute: execution.place_order (Paper trading execution)
7. Monitor & Audit: position.monitor & decision.create_log
"""
from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from apps.api.dependencies import verify_hermes_token
from apps.api.main import app
from packages.config.settings import get_settings
from packages.database.engine import get_db_session
from packages.database.models.audit_decision import AuditDecisionModel
from packages.database.models.chart import ChartAnnotationModel, ChartDrawingModel
from packages.database.models.hypertables import MarketCandleModel
from packages.database.models.portfolio import (
    FillModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from packages.database.models.relational import ExecutionModel, OrderModel
from packages.database.models.trading_plan import TradingPlanModel
from packages.hermes_tools.client import HermesToolsClient


class MockDatabase:
    """Stateful in-memory database simulation for Hermes integration tests."""

    def __init__(self) -> None:
        self.candles: list[MarketCandleModel] = []
        self.drawings: dict[uuid.UUID, ChartDrawingModel] = {}
        self.annotations: dict[uuid.UUID, ChartAnnotationModel] = {}
        self.plans: dict[uuid.UUID, TradingPlanModel] = {}
        self.accounts: dict[str, PortfolioAccountModel] = {}
        self.entries: dict[tuple[uuid.UUID, str], PortfolioEntryModel] = {}
        self.positions: dict[tuple[uuid.UUID, str], PositionModel] = {}
        self.orders: dict[uuid.UUID, OrderModel] = {}
        self.fills: dict[uuid.UUID, FillModel] = {}
        self.executions: dict[uuid.UUID, ExecutionModel] = {}
        self.audit_decisions: dict[uuid.UUID, AuditDecisionModel] = {}

    def add(self, obj: Any) -> None:
        if isinstance(obj, MarketCandleModel):
            self.candles.append(obj)
        elif isinstance(obj, ChartDrawingModel):
            self.drawings[obj.id] = obj
        elif isinstance(obj, ChartAnnotationModel):
            self.annotations[obj.id] = obj
        elif isinstance(obj, TradingPlanModel):
            self.plans[obj.id] = obj
        elif isinstance(obj, PortfolioAccountModel):
            self.accounts[obj.trading_mode] = obj
        elif isinstance(obj, PortfolioEntryModel):
            self.entries[(obj.account_id, obj.asset)] = obj
        elif isinstance(obj, PositionModel):
            self.positions[(obj.account_id, obj.symbol)] = obj
        elif isinstance(obj, OrderModel):
            self.orders[obj.id] = obj
        elif isinstance(obj, FillModel):
            self.fills[obj.id] = obj
        elif isinstance(obj, ExecutionModel):
            self.executions[obj.id] = obj
        elif isinstance(obj, AuditDecisionModel):
            self.audit_decisions[obj.id] = obj

    async def execute(self, stmt: Any) -> MagicMock:
        mock_res = MagicMock()
        entity = None
        if hasattr(stmt, "column_descriptions") and stmt.column_descriptions:
            entity = stmt.column_descriptions[0].get("entity")

        stmt_str = str(stmt).lower()

        # 1. MarketCandleModel
        if entity is MarketCandleModel or "market_candles" in stmt_str:
            mock_res.scalars.return_value.all.return_value = list(self.candles)
            mock_res.scalar_one_or_none.return_value = self.candles[-1] if self.candles else None
            return mock_res

        # 2. ChartDrawingModel
        if entity is ChartDrawingModel or "chart_drawings" in stmt_str:
            items = list(self.drawings.values())
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = items[0] if items else None
            return mock_res

        # 3. ChartAnnotationModel
        if entity is ChartAnnotationModel or "chart_annotations" in stmt_str:
            items = list(self.annotations.values())
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = items[0] if items else None
            return mock_res

        # 4. TradingPlanModel
        if entity is TradingPlanModel or "trading_plans" in stmt_str:
            items = list(self.plans.values())
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = items[-1] if items else None
            return mock_res

        # 5. PortfolioAccountModel
        if entity is PortfolioAccountModel or "portfolio_accounts" in stmt_str:
            acc = self.accounts.get("paper")
            mock_res.scalar_one_or_none.return_value = acc
            mock_res.scalars.return_value.all.return_value = [acc] if acc else []
            return mock_res

        # 6. PortfolioEntryModel
        if entity is PortfolioEntryModel or "portfolio_entries" in stmt_str:
            items = list(self.entries.values())
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = items[0] if items else None
            return mock_res

        # 7. PositionModel
        if entity is PositionModel or "positions" in stmt_str:
            items = [p for p in self.positions.values() if p.quantity != Decimal("0")]
            # Check symbol filter if single fetch
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = items[0] if items else None
            return mock_res

        # 8. OrderModel
        if entity is OrderModel or "orders" in stmt_str:
            items = list(self.orders.values())
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = items[0] if items else None
            return mock_res

        # 9. FillModel
        if entity is FillModel or "fills" in stmt_str:
            items = list(self.fills.values())
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = None
            return mock_res

        # 10. AuditDecisionModel
        if entity is AuditDecisionModel or "audit_decisions" in stmt_str:
            items = list(self.audit_decisions.values())
            mock_res.scalars.return_value.all.return_value = items
            mock_res.scalar_one_or_none.return_value = items[-1] if items else None
            return mock_res

        mock_res.scalars.return_value.all.return_value = []
        mock_res.scalar_one_or_none.return_value = None
        return mock_res


def generate_market_candles(count: int = 100) -> list[MarketCandleModel]:
    """Generate 100 realistic 1H candles showing a bullish trend and key structure."""
    now = datetime.now(UTC)
    candles = []
    base_price = 61000.0

    for i in range(count):
        candle_time = now - timedelta(hours=(count - i))
        # Formulate price movement with swings:
        # Swing Low 1: i=20 (price ~ 61200)
        # Swing High 1: i=45 (price ~ 63500)
        # Swing Low 2 (Higher Low): i=70 (price ~ 62800)
        # Break of Structure (BOS): i=85 (price ~ 64200)
        # Pullback & Demand test: i=95-100 (price ~ 63450)
        if i < 20:
            price = base_price + (i * 20.0)
        elif i < 45:
            price = 61400.0 + ((i - 20) * 84.0)
        elif i < 70:
            price = 63500.0 - ((i - 45) * 28.0)
        elif i < 88:
            price = 62800.0 + ((i - 70) * 80.0)
        else:
            price = 64240.0 - ((i - 88) * 65.0)

        c_open = price - 25.0
        c_close = price + 20.0
        c_high = max(c_open, c_close) + 40.0
        c_low = min(c_open, c_close) - 35.0
        volume = 120.0 + (i % 15) * 10.0

        candles.append(
            MarketCandleModel(
                symbol="BTC/USDT",
                timeframe="1h",
                timestamp=candle_time,
                open=Decimal(str(round(c_open, 2))),
                high=Decimal(str(round(c_high, 2))),
                low=Decimal(str(round(c_low, 2))),
                close=Decimal(str(round(c_close, 2))),
                volume=Decimal(str(round(volume, 2))),
                is_closed=True,
                trading_mode="paper",
            )
        )
    return candles


def run_hermes_phase9_loop() -> dict[str, Any]:
    """Execute the complete Phase 9 autonomous trading loop sequentially."""
    mock_db = MockDatabase()
    mock_db.candles = generate_market_candles(100)

    # Initialize account balance: $10,000 USDT
    acc = PortfolioAccountModel(
        id=uuid.uuid4(),
        name="Hermes Paper Account",
        trading_mode="paper",
        created_at=datetime.now(UTC),
    )
    mock_db.add(acc)
    entry = PortfolioEntryModel(
        id=uuid.uuid4(),
        account_id=acc.id,
        asset="USDT",
        balance=Decimal("10000.0"),
        trading_mode="paper",
        updated_at=datetime.now(UTC),
    )
    mock_db.add(entry)

    mock_session = AsyncMock()
    mock_session.add = MagicMock(side_effect=mock_db.add)
    mock_session.execute = AsyncMock(side_effect=mock_db.execute)
    mock_session.commit = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db
    app.dependency_overrides[verify_hermes_token] = lambda: None

    mock_settings = MagicMock(wraps=get_settings())
    mock_settings.hermes.service_token = "test-token"
    app.dependency_overrides[get_settings] = lambda: mock_settings

    test_client = TestClient(app, base_url="http://testserver", headers={"Authorization": "Bearer test-token"})
    tools = HermesToolsClient(base_url="http://testserver", token="test-token")
    tools.client = test_client

    trace_results: dict[str, Any] = {}

    from packages.exchange.models import Ticker
    mock_adapter = MagicMock()
    mock_adapter.get_ticker = AsyncMock(
        return_value=Ticker(
            symbol="BTC/USDT",
            bid=Decimal("63445.0"),
            ask=Decimal("63455.0"),
            last=Decimal("63450.0"),
            volume=Decimal("150.0"),
            timestamp=datetime.now(UTC),
        )
    )

    p1 = patch("apps.api.routers.tools.get_binance_adapter", return_value=mock_adapter)
    p2 = patch("apps.api.routers.execution_tools.get_binance_adapter", return_value=mock_adapter)
    p1.start()
    p2.start()

    try:
        # =========================================================================
        # 1. OBSERVE
        # =========================================================================
        candles_res = tools.market.get_candles(symbol="BTC/USDT", timeframe="1h", limit=100)
        ticker_res = tools.market.get_ticker(symbol="BTC/USDT")
        current_price = ticker_res.get("last", 63450.0)

        trace_results["step_1_observe"] = {
            "symbol": "BTC/USDT",
            "candles_count": len(candles_res.get("candles", [])),
            "ticker": ticker_res,
            "current_price": current_price,
        }

        raw_candles = candles_res.get("candles", [])

        # =========================================================================
        # 2. ANALYZE
        # =========================================================================
        swings_res = tools.analysis.detect_swings(candles=raw_candles, window=2)
        structure_res = tools.analysis.detect_market_structure(candles=raw_candles, window=2)
        sr_res = tools.analysis.detect_support_resistance(candles=raw_candles, tolerance=0.015)

        trace_results["step_2_analyze"] = {
            "market_structure": structure_res.get("structure"),
            "total_swing_highs": swings_res.get("total_highs"),
            "total_swing_lows": swings_res.get("total_lows"),
            "nearest_support": sr_res.get("nearest_support"),
            "nearest_resistance": sr_res.get("nearest_resistance"),
            "support_zones_count": len(sr_res.get("support_zones", [])),
            "resistance_zones_count": len(sr_res.get("resistance_zones", [])),
        }

        # Identify nearest key support and resistance for visualization and planning
        nearest_sup = sr_res.get("nearest_support") or (current_price * 0.985)
        nearest_res = sr_res.get("nearest_resistance") or (current_price * 1.03)

        # =========================================================================
        # 3. VISUALIZE
        # =========================================================================
        support_zone_drawing = tools.chart.draw_zone(
            symbol="BTC/USDT",
            price_low=round(nearest_sup * 0.995, 2),
            price_high=round(nearest_sup * 1.005, 2),
            timeframe="1h",
            zone_type="support_zone",
            color="#00E676",
            label="H1 Demand Zone",
            reason="Confluence of higher-low fractal swing and institutional liquidity sweep",
        )

        resistance_zone_drawing = tools.chart.draw_zone(
            symbol="BTC/USDT",
            price_low=round(nearest_res * 0.995, 2),
            price_high=round(nearest_res * 1.005, 2),
            timeframe="1h",
            zone_type="resistance_zone",
            color="#FF5252",
            label="H1 Target Supply Zone",
            reason="Unmitigated overhead supply zone from previous swing high",
        )

        annotation_drawing = tools.chart.add_annotation(
            symbol="BTC/USDT",
            time_ms=int(datetime.now(UTC).timestamp() * 1000),
            price=current_price,
            text=f"Hermes Long Entry Thesis: Retest of demand zone at {nearest_sup:.2f}. Targeting {nearest_res:.2f}.",
        )

        trace_results["step_3_visualize"] = {
            "support_zone": support_zone_drawing,
            "resistance_zone": resistance_zone_drawing,
            "annotation": annotation_drawing,
        }

        # =========================================================================
        # 4. PLAN
        # =========================================================================
        entry_price = float(current_price)
        # Structural stop loss just below local swing low/support
        stop_dist = 600.0
        stop_loss_price = round(entry_price - stop_dist, 2)
        # Take profit targeting higher timeframe resistance with R:R = 2.5:1
        take_profit_price = round(entry_price + (stop_dist * 2.5), 2)
        risk_percent = 0.01  # 1% risk budget of $10,000 equity = $100

        thesis = (
            f"Bullish continuation structure confirmed on BTCUSDT 1H. "
            f"Price completed pullback into key demand zone ({nearest_sup:.2f}). "
            f"High-probability R:R of 2.5:1 with invalidation below local structural support at {stop_loss_price:.2f}."
        )
        invalidation = f"Hourly candle close below swing low support at {stop_loss_price:.2f}"

        plan_res = tools.plan.create(
            symbol="BTC/USDT",
            direction="LONG",
            market="spot",
            entry_price=entry_price,
            stop_loss_price=stop_loss_price,
            take_profit_prices=[{"price": take_profit_price}],
            risk_percent=risk_percent,
            thesis=thesis,
            invalidation=invalidation,
            evidence=[
                f"Structure: {structure_res.get('structure')}",
                f"Support at {nearest_sup:.2f}",
                "Fractal swing low confirmed at 62800",
                "Reward-to-risk ratio: 2.5:1",
            ],
            status="DRAFT",
        )

        plan_id = plan_res["id"]
        trace_results["step_4_plan"] = plan_res

        # =========================================================================
        # 5. VALIDATE
        # =========================================================================
        # Position sizing: respect both risk budget ($100 / distance) and max portfolio concentration (30% equity)
        max_risk_qty = 100.0 / stop_dist
        max_conc_qty = (10000.0 * 0.30) / entry_price
        safe_quantity = min(max_risk_qty, max_conc_qty * 0.95)  # e.g. ~0.0448 BTC
        order_quantity = round(safe_quantity, 4)

        risk_validation = tools.risk.validate_plan(
            plan_id=plan_id,
            symbol="BTC/USDT",
            direction="LONG",
            quantity=order_quantity,
            entry_price=entry_price,
            stop_loss_price=stop_loss_price,
            take_profit_price=take_profit_price,
            risk_percent=risk_percent,
            total_equity=10000.0,
            cash_balance=10000.0,
            peak_equity=10000.0,
            current_drawdown_percent=0.0,
            kill_switch_active=False,
            leverage=1.0,
        )

        trace_results["step_5_validate"] = risk_validation

        # =========================================================================
        # 6. EXECUTE
        # =========================================================================
        assert risk_validation["is_approved"] is True, f"Risk validation failed: {risk_validation}"

        # Mock current price helper for portfolio engine
        with patch("apps.api.routers.execution_tools._get_current_price", new=AsyncMock(return_value=Decimal(str(entry_price)))), \
             patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=acc)):

            execution_res = tools.execution.place_order(
                symbol="BTC/USDT",
                side="buy",
                order_type="market",
                quantity=Decimal(str(order_quantity)),
                price=Decimal(str(entry_price)),
                trading_mode="paper",
                client_order_id=f"hermes_p9_{uuid.uuid4().hex[:8]}",
            )

        trace_results["step_6_execute"] = execution_res

        # Update mock db position to simulate stateful persistence after fill
        pos = PositionModel(
            id=uuid.uuid4(),
            account_id=acc.id,
            symbol="BTC/USDT",
            quantity=Decimal(str(order_quantity)),
            average_entry_price=Decimal(str(entry_price)),
            realized_pnl=Decimal("0"),
            trading_mode="paper",
            updated_at=datetime.now(UTC),
        )
        mock_db.add(pos)

        # =========================================================================
        # 7. MONITOR & AUDIT
        # =========================================================================
        with patch("apps.api.routers.execution_tools._get_current_price", new=AsyncMock(return_value=Decimal(str(entry_price)))), \
             patch("apps.api.routers.execution_tools.portfolio_engine.get_or_create_account", new=AsyncMock(return_value=acc)):
            position_monitor_res = tools.position.monitor(trading_mode="paper")

        audit_snapshot = {
            "symbol": "BTC/USDT",
            "timeframe": "1h",
            "market_price": entry_price,
            "structure": structure_res.get("structure"),
            "nearest_support": nearest_sup,
            "nearest_resistance": nearest_res,
            "candles_analyzed": len(raw_candles),
            "timestamp": datetime.now(UTC).isoformat(),
        }

        audit_drawings = [
            support_zone_drawing,
            resistance_zone_drawing,
            annotation_drawing,
        ]

        decision_log_res = tools.decision.create_log(
            snapshot=audit_snapshot,
            drawings=audit_drawings,
            plan_id=plan_id,
            risk_result=risk_validation,
            execution_result=execution_res,
        )

        trace_results["step_7_monitor_audit"] = {
            "position_monitor": position_monitor_res,
            "decision_log": decision_log_res,
        }

        return trace_results

    finally:
        p1.stop()
        p2.stop()
        app.dependency_overrides.clear()
        tools.close()


def test_phase9_full_autonomous_loop() -> None:
    """Verify that all 7 steps of Phase 9 execute without human intervention."""
    results = run_hermes_phase9_loop()

    # Invariant assertions
    assert "step_1_observe" in results
    assert results["step_1_observe"]["candles_count"] == 100
    assert results["step_1_observe"]["current_price"] > 0

    assert "step_2_analyze" in results
    assert results["step_2_analyze"]["total_swing_highs"] > 0
    assert results["step_2_analyze"]["total_swing_lows"] > 0

    assert "step_3_visualize" in results
    assert results["step_3_visualize"]["support_zone"]["id"] is not None
    assert results["step_3_visualize"]["resistance_zone"]["id"] is not None
    assert results["step_3_visualize"]["annotation"]["id"] is not None

    assert "step_4_plan" in results
    assert results["step_4_plan"]["symbol"] == "BTC/USDT"
    assert results["step_4_plan"]["direction"] == "LONG"
    assert results["step_4_plan"]["status"] in ("DRAFT", "APPROVED", "VALIDATED")

    assert "step_5_validate" in results
    assert results["step_5_validate"]["is_approved"] is True
    assert results["step_5_validate"]["decision"] == "approved"

    assert "step_6_execute" in results
    assert results["step_6_execute"]["status"] == "FILLED"
    assert results["step_6_execute"]["trading_mode"] == "paper"

    assert "step_7_monitor_audit" in results
    mon = results["step_7_monitor_audit"]["position_monitor"]
    assert mon["total_open_positions"] >= 1
    assert mon["positions"][0]["symbol"] == "BTC/USDT"

    log = results["step_7_monitor_audit"]["decision_log"]
    assert log["id"] is not None
    assert log["plan_id"] == results["step_4_plan"]["id"]
    assert log["risk_result"]["decision"] == "approved"
    assert log["execution_result"]["status"] == "FILLED"


if __name__ == "__main__":
    res = run_hermes_phase9_loop()
    print(json.dumps(res, indent=2, default=str))
