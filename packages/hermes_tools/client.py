from datetime import datetime
from decimal import Decimal
from typing import Any

import httpx

from packages.hermes_tools.chart import ChartTools


class MarketTools:
    """Namespace for market data tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def get_candles(
        self,
        symbol: str,
        timeframe: str = "1h",
        limit: int = 100,
        start: str | datetime | None = None,
        end: str | datetime | None = None,
    ) -> dict[str, Any]:
        return self._client.get_candles(
            symbol=symbol, timeframe=timeframe, limit=limit, start=start, end=end
        )

    def get_ticker(self, symbol: str) -> dict[str, Any]:
        return self._client.get_ticker(symbol=symbol)

    def get_order_book(self, symbol: str, depth: int = 20) -> dict[str, Any]:
        return self._client.get_order_book(symbol=symbol, depth=depth)

    def get_trades(
        self,
        symbol: str,
        limit: int = 50,
        since: str | datetime | None = None,
    ) -> dict[str, Any]:
        return self._client.get_trades(symbol=symbol, limit=limit, since=since)

    def get_volume(self, symbol: str) -> dict[str, Any]:
        return self._client.get_volume(symbol=symbol)

    def get_funding_rate(self, symbol: str) -> dict[str, Any]:
        return self._client.get_funding_rate(symbol=symbol)


class AnalysisTools:
    """Namespace for deterministic quant analysis tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def detect_swings(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        window: int = 2,
    ) -> dict[str, Any]:
        return self._client.detect_swings(
            symbol=symbol, timeframe=timeframe, limit=limit, candles=candles, window=window
        )

    def detect_market_structure(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        window: int = 2,
    ) -> dict[str, Any]:
        return self._client.detect_market_structure(
            symbol=symbol, timeframe=timeframe, limit=limit, candles=candles, window=window
        )

    def detect_trend(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        fast_period: int = 20,
        slow_period: int = 50,
    ) -> dict[str, Any]:
        return self._client.detect_trend(
            symbol=symbol,
            timeframe=timeframe,
            limit=limit,
            candles=candles,
            fast_period=fast_period,
            slow_period=slow_period,
        )

    def detect_support_resistance(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        tolerance: float = 0.015,
    ) -> dict[str, Any]:
        return self._client.detect_support_resistance(
            symbol=symbol,
            timeframe=timeframe,
            limit=limit,
            candles=candles,
            tolerance=tolerance,
        )

    def calculate_indicator(
        self,
        indicator: str,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return self._client.calculate_indicator(
            indicator=indicator,
            symbol=symbol,
            timeframe=timeframe,
            limit=limit,
            candles=candles,
            params=params,
        )


class PlanTools:
    """Namespace for trading plan lifecycle tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def create(
        self,
        symbol: str,
        direction: str,
        market: str = "spot",
        entry_price: float | None = None,
        stop_loss_price: float | None = None,
        take_profit_prices: list[dict[str, Any]] | list[float] | None = None,
        risk_percent: float | None = 0.01,
        thesis: str = "",
        invalidation: str = "",
        evidence: list[str] | None = None,
        status: str = "DRAFT",
    ) -> dict[str, Any]:
        return self._client.create_plan(
            symbol=symbol,
            direction=direction,
            market=market,
            entry_price=entry_price,
            stop_loss_price=stop_loss_price,
            take_profit_prices=take_profit_prices or [],
            risk_percent=risk_percent,
            thesis=thesis,
            invalidation=invalidation,
            evidence=evidence or [],
            status=status,
        )

    def get(self, plan_id: str) -> dict[str, Any]:
        return self._client.get_plan(plan_id=plan_id)

    def update(self, plan_id: str, **kwargs: Any) -> dict[str, Any]:
        return self._client.update_plan(plan_id=plan_id, **kwargs)

    def validate(self, plan_id: str | None = None, **kwargs: Any) -> dict[str, Any]:
        return self._client.validate_plan(plan_id=plan_id, **kwargs)

    def cancel(self, plan_id: str, reason: str | None = None) -> dict[str, Any]:
        return self._client.cancel_plan(plan_id=plan_id, reason=reason)


class RiskTools:
    """Namespace for risk calculation and validation tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def calculate_position_size(
        self,
        total_equity: float,
        entry_price: float,
        stop_loss_price: float,
        risk_percent: float = 0.02,
        symbol: str = "BTC/USDT",
        cash_balance: float | None = None,
        max_risk_amount: float | None = None,
    ) -> dict[str, Any]:
        return self._client.calculate_position_size(
            total_equity=total_equity,
            entry_price=entry_price,
            stop_loss_price=stop_loss_price,
            risk_percent=risk_percent,
            symbol=symbol,
            cash_balance=cash_balance,
            max_risk_amount=max_risk_amount,
        )

    def calculate_exposure(
        self,
        total_equity: float,
        cash_balance: float,
        positions: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        return self._client.calculate_exposure(
            total_equity=total_equity,
            cash_balance=cash_balance,
            positions=positions or [],
        )

    def validate_plan(
        self,
        plan_id: str | None = None,
        symbol: str = "BTC/USDT",
        direction: str = "LONG",
        quantity: float | None = None,
        entry_price: float = 50000.0,
        stop_loss_price: float | None = None,
        take_profit_price: float | None = None,
        risk_percent: float | None = None,
        total_equity: float = 10000.0,
        cash_balance: float = 10000.0,
        peak_equity: float | None = None,
        current_drawdown_percent: float | None = None,
        open_positions: dict[str, Any] | list[dict[str, Any]] | None = None,
        kill_switch_active: bool = False,
        leverage: float = 1.0,
    ) -> dict[str, Any]:
        return self._client.validate_plan_risk(
            plan_id=plan_id,
            symbol=symbol,
            direction=direction,
            quantity=quantity,
            entry_price=entry_price,
            stop_loss_price=stop_loss_price,
            take_profit_price=take_profit_price,
            risk_percent=risk_percent,
            total_equity=total_equity,
            cash_balance=cash_balance,
            peak_equity=peak_equity,
            current_drawdown_percent=current_drawdown_percent,
            open_positions=open_positions or {},
            kill_switch_active=kill_switch_active,
            leverage=leverage,
        )

    def check_portfolio_risk(
        self,
        total_equity: float = 10000.0,
        cash_balance: float = 10000.0,
        peak_equity: float | None = None,
        current_drawdown_percent: float | None = None,
        open_positions: dict[str, Any] | list[dict[str, Any]] | None = None,
        kill_switch_active: bool = False,
    ) -> dict[str, Any]:
        return self._client.check_portfolio_risk(
            total_equity=total_equity,
            cash_balance=cash_balance,
            peak_equity=peak_equity,
            current_drawdown_percent=current_drawdown_percent,
            open_positions=open_positions or {},
            kill_switch_active=kill_switch_active,
        )


class ExecutionTools:
    """Namespace for execution tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def get_balance(
        self,
        trading_mode: str = "paper",
        asset: str | None = None,
    ) -> dict[str, Any]:
        return self._client.get_execution_balance(trading_mode=trading_mode, asset=asset)

    def get_positions(
        self,
        trading_mode: str = "paper",
        symbol: str | None = None,
    ) -> dict[str, Any]:
        return self._client.get_execution_positions(trading_mode=trading_mode, symbol=symbol)

    def get_open_orders(
        self,
        trading_mode: str = "paper",
        symbol: str | None = None,
    ) -> dict[str, Any]:
        return self._client.get_execution_open_orders(trading_mode=trading_mode, symbol=symbol)

    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str = "market",
        quantity: float | str | Decimal = 0.01,
        price: float | str | Decimal | None = None,
        limit_price: float | str | Decimal | None = None,
        trading_mode: str = "paper",
        client_order_id: str | None = None,
        correlation_id: str | None = None,
    ) -> dict[str, Any]:
        return self._client.place_execution_order(
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=price,
            limit_price=limit_price,
            trading_mode=trading_mode,
            client_order_id=client_order_id,
            correlation_id=correlation_id,
        )

    def cancel_order(
        self,
        order_id: str,
        trading_mode: str = "paper",
        symbol: str | None = None,
    ) -> dict[str, Any]:
        return self._client.cancel_execution_order(
            order_id=order_id,
            trading_mode=trading_mode,
            symbol=symbol,
        )

    def get_order(
        self,
        order_id: str,
        trading_mode: str = "paper",
    ) -> dict[str, Any]:
        return self._client.get_execution_order(order_id=order_id, trading_mode=trading_mode)


class PositionTools:
    """Namespace for position management tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def get(
        self,
        symbol: str,
        trading_mode: str = "paper",
    ) -> dict[str, Any]:
        return self._client.get_position(symbol=symbol, trading_mode=trading_mode)

    def monitor(
        self,
        trading_mode: str = "paper",
    ) -> dict[str, Any]:
        return self._client.monitor_positions(trading_mode=trading_mode)

    def close(
        self,
        symbol: str,
        trading_mode: str = "paper",
        order_type: str = "market",
        quantity: float | str | Decimal | None = None,
    ) -> dict[str, Any]:
        return self._client.close_position(
            symbol=symbol,
            trading_mode=trading_mode,
            order_type=order_type,
            quantity=quantity,
        )


class DecisionTools:
    """Namespace for audit decision tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def create_log(
        self,
        snapshot: dict[str, Any],
        drawings: list[dict[str, Any]] | None = None,
        plan_id: str | None = None,
        risk_result: dict[str, Any] | None = None,
        execution_result: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return self._client.create_decision_log(
            snapshot=snapshot,
            drawings=drawings,
            plan_id=plan_id,
            risk_result=risk_result,
            execution_result=execution_result,
        )

    def get_history(
        self,
        plan_id: str | None = None,
        limit: int = 20,
        since: str | datetime | None = None,
    ) -> dict[str, Any]:
        return self._client.get_decision_history(plan_id=plan_id, limit=limit, since=since)


class TradeTools:
    """Namespace for trade ledger history tools."""

    def __init__(self, client: "HermesToolsClient") -> None:
        self._client = client

    def get_history(
        self,
        symbol: str | None = None,
        trading_mode: str = "paper",
        limit: int = 50,
        since: str | datetime | None = None,
    ) -> dict[str, Any]:
        return self._client.get_trade_history(
            symbol=symbol,
            trading_mode=trading_mode,
            limit=limit,
            since=since,
        )


class HermesToolsClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {token}"}
        self.client = httpx.Client(base_url=self.base_url, headers=self.headers)
        self.market = MarketTools(self)
        self.chart = ChartTools(self)
        self.analysis = AnalysisTools(self)
        self.plan = PlanTools(self)
        self.risk = RiskTools(self)
        self.execution = ExecutionTools(self)
        self.position = PositionTools(self)
        self.decision = DecisionTools(self)
        self.trade = TradeTools(self)

    def close(self) -> None:
        self.client.close()


    def __enter__(self) -> "HermesToolsClient":
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.close()

    # ── Market Data Tools ───────────────────────────────────────────────

    def get_market_price(self, symbol: str) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/market/price", params={"symbol": symbol})
        resp.raise_for_status()
        return resp.json()

    def get_ticker(self, symbol: str) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/market/ticker", params={"symbol": symbol})
        resp.raise_for_status()
        return resp.json()

    def get_candles(
        self,
        symbol: str,
        timeframe: str = "1h",
        limit: int = 100,
        start: str | datetime | None = None,
        end: str | datetime | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {
            "symbol": symbol,
            "timeframe": timeframe,
            "limit": limit,
        }
        if start is not None:
            params["start"] = start.isoformat() if isinstance(start, datetime) else str(start)
        if end is not None:
            params["end"] = end.isoformat() if isinstance(end, datetime) else str(end)
        resp = self.client.get("/api/v1/tools/market/candles", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_market_candles(
        self,
        symbol: str,
        timeframe: str = "1h",
        limit: int = 100,
        start: str | datetime | None = None,
        end: str | datetime | None = None,
    ) -> dict[str, Any]:
        return self.get_candles(
            symbol=symbol, timeframe=timeframe, limit=limit, start=start, end=end
        )

    def get_order_book(self, symbol: str, depth: int = 20) -> dict[str, Any]:
        resp = self.client.get(
            "/api/v1/tools/market/order_book",
            params={"symbol": symbol, "depth": depth},
        )
        resp.raise_for_status()
        return resp.json()

    def get_trades(
        self,
        symbol: str,
        limit: int = 50,
        since: str | datetime | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"symbol": symbol, "limit": limit}
        if since is not None:
            params["since"] = since.isoformat() if isinstance(since, datetime) else str(since)
        resp = self.client.get("/api/v1/tools/market/trades", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_volume(self, symbol: str) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/market/volume", params={"symbol": symbol})
        resp.raise_for_status()
        return resp.json()

    def get_funding_rate(self, symbol: str) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/market/funding_rate", params={"symbol": symbol})
        resp.raise_for_status()
        return resp.json()

    def execute_tool(self, tool_name: str, **kwargs: Any) -> Any:
        """Dynamic tool dispatcher supporting dot-notation tool names."""
        mapping = {
            "market.get_candles": self.get_candles,
            "market.get_ticker": self.get_ticker,
            "market.get_order_book": self.get_order_book,
            "market.get_trades": self.get_trades,
            "market.get_volume": self.get_volume,
            "market.get_funding_rate": self.get_funding_rate,
            "market.price": self.get_market_price,
            "analytics.indicators": self.get_analytics_indicators,
            "portfolio.positions": self.get_portfolio_positions,
            "strategy.list": self.get_strategy_list,
            "proposal.create": self.create_trade_proposal,
            "knowledge.search": self.search_knowledge,
            "memory.store": self.store_memory,
            "memory.search": self.search_memory,
            # Chart drawing engine backend tools
            "chart.get_state": self.chart.get_state,
            "chart.get_visible_range": self.chart.get_visible_range,
            "chart.get_drawings": self.chart.get_drawings,
            "chart.draw_line": self.chart.draw_line,
            "chart.draw_zone": self.chart.draw_zone,
            "chart.draw_marker": self.chart.draw_marker,
            "chart.add_annotation": self.chart.add_annotation,
            "chart.update_drawing": self.chart.update_drawing,
            "chart.delete_drawing": self.chart.delete_drawing,
            "chart.clear_drawings": self.chart.clear_drawings,
        }
        optional_tools = {
            "analysis.detect_swings": "detect_swings",
            "analysis.detect_market_structure": "detect_market_structure",
            "analysis.detect_trend": "detect_trend",
            "analysis.detect_support_resistance": "detect_support_resistance",
            "analysis.calculate_indicator": "calculate_indicator",
            "plan.create": "create_plan",
            "plan.get": "get_plan",
            "plan.update": "update_plan",
            "plan.validate": "validate_plan",
            "plan.cancel": "cancel_plan",
            "risk.calculate_position_size": "calculate_position_size",
            "risk.calculate_exposure": "calculate_exposure",
            "risk.validate_plan": "validate_plan_risk",
            "risk.check_portfolio_risk": "check_portfolio_risk",
            "execution.get_balance": "get_execution_balance",
            "execution.get_positions": "get_execution_positions",
            "execution.get_open_orders": "get_execution_open_orders",
            "execution.place_order": "place_execution_order",
            "execution.cancel_order": "cancel_execution_order",
            "execution.get_order": "get_execution_order",
            "position.get": "get_position",
            "position.monitor": "monitor_positions",
            "position.close": "close_position",
            "decision.create_log": "create_decision_log",
            "decision.get_history": "get_decision_history",
            "trade.get_history": "get_trade_history",
        }
        for tool_key, attr_name in optional_tools.items():
            fn = getattr(self, attr_name, None)
            if fn is not None:
                mapping[tool_key] = fn
        if tool_name not in mapping:
            raise ValueError(f"Unsupported tool name: {tool_name}")
        return mapping[tool_name](**kwargs)

    def call_tool(self, tool_name: str, **kwargs: Any) -> Any:
        return self.execute_tool(tool_name, **kwargs)

    def get_analytics_indicators(self, symbol: str, timeframe: str = "1h") -> dict[str, Any]:
        resp = self.client.get(
            "/api/v1/tools/analytics/indicators", params={"symbol": symbol, "timeframe": timeframe}
        )
        resp.raise_for_status()
        return resp.json()

    def get_portfolio_positions(self) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/portfolio/positions")
        resp.raise_for_status()
        return resp.json()

    def get_strategy_list(self) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/strategy/list")
        resp.raise_for_status()
        return resp.json()

    def create_trade_proposal(self, intent: dict[str, Any]) -> dict[str, Any]:
        resp = self.client.post("/api/v1/tools/proposal/create", json=intent)
        resp.raise_for_status()
        return resp.json()

    def search_knowledge(self, query: str) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/knowledge/search", params={"query": query})
        resp.raise_for_status()
        return resp.json()

    def store_memory(self, observation: dict[str, Any]) -> dict[str, Any]:
        resp = self.client.post("/api/v1/tools/memory/store", json=observation)
        resp.raise_for_status()
        return resp.json()

    def search_memory(self, query: str) -> dict[str, Any]:
        resp = self.client.get("/api/v1/tools/memory/search", params={"query": query})
        resp.raise_for_status()
        return resp.json()

    # ── Research Experiment Tools ──────────────────────────────────────────

    def list_research_experiments(
        self,
        status: str | None = None,
        category: str | None = None,
        asset: str | None = None,
        limit: int = 20,
    ) -> dict:
        """List research experiments with optional filters."""
        params: dict = {"limit": limit}
        if status:
            params["status"] = status
        if category:
            params["category"] = category
        if asset:
            params["asset"] = asset
        resp = self.client.get("/api/v1/tools/research/experiments", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_research_experiment(self, experiment_id: str) -> dict:
        """Retrieve full experiment detail for interpretation."""
        resp = self.client.get(f"/api/v1/tools/research/experiments/{experiment_id}")
        resp.raise_for_status()
        return resp.json()

    def create_research_experiment(self, payload: dict) -> dict:
        """Create a new research experiment."""
        resp = self.client.post("/api/v1/tools/research/experiments", json=payload)
        resp.raise_for_status()
        return resp.json()

    def add_research_note(self, experiment_id: str, note: dict) -> dict:
        """Add a research note to an experiment."""
        resp = self.client.post(
            f"/api/v1/tools/research/experiments/{experiment_id}/notes", json=note
        )
        resp.raise_for_status()
        return resp.json()

    def get_research_conclusion(self, experiment_id: str) -> dict | None:
        """Get the conclusion of an experiment (None if not yet concluded)."""
        data = self.get_research_experiment(experiment_id)
        return data.get("conclusion")

    # ── Phase 5: Deterministic Analysis Engine Tools ─────────────────────────

    def detect_swings(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        window: int = 2,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "timeframe": timeframe,
            "limit": limit,
            "window": window,
        }
        if symbol:
            payload["symbol"] = symbol
        if candles:
            payload["candles"] = candles
        resp = self.client.post("/api/v1/tools/analysis/detect_swings", json=payload)
        resp.raise_for_status()
        return resp.json()

    def detect_market_structure(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        window: int = 2,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "timeframe": timeframe,
            "limit": limit,
            "window": window,
        }
        if symbol:
            payload["symbol"] = symbol
        if candles:
            payload["candles"] = candles
        resp = self.client.post("/api/v1/tools/analysis/detect_market_structure", json=payload)
        resp.raise_for_status()
        return resp.json()

    def detect_trend(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        fast_period: int = 20,
        slow_period: int = 50,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "timeframe": timeframe,
            "limit": limit,
            "fast_period": fast_period,
            "slow_period": slow_period,
        }
        if symbol:
            payload["symbol"] = symbol
        if candles:
            payload["candles"] = candles
        resp = self.client.post("/api/v1/tools/analysis/detect_trend", json=payload)
        resp.raise_for_status()
        return resp.json()

    def detect_support_resistance(
        self,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        tolerance: float = 0.015,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "timeframe": timeframe,
            "limit": limit,
            "tolerance": tolerance,
        }
        if symbol:
            payload["symbol"] = symbol
        if candles:
            payload["candles"] = candles
        resp = self.client.post("/api/v1/tools/analysis/detect_support_resistance", json=payload)
        resp.raise_for_status()
        return resp.json()

    def calculate_indicator(
        self,
        indicator: str,
        symbol: str | None = None,
        timeframe: str = "1h",
        limit: int = 100,
        candles: list[dict[str, Any]] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "indicator": indicator,
            "timeframe": timeframe,
            "limit": limit,
            "params": params or {},
        }
        if symbol:
            payload["symbol"] = symbol
        if candles:
            payload["candles"] = candles
        resp = self.client.post("/api/v1/tools/analysis/calculate_indicator", json=payload)
        resp.raise_for_status()
        return resp.json()

    # ── Phase 6: Trading Planner Tools ───────────────────────────────────────

    def create_plan(self, **kwargs: Any) -> dict[str, Any]:
        resp = self.client.post("/api/v1/tools/plan/create", json=kwargs)
        resp.raise_for_status()
        return resp.json()

    def get_plan(self, plan_id: str) -> dict[str, Any]:
        resp = self.client.get(f"/api/v1/tools/plan/{plan_id}")
        resp.raise_for_status()
        return resp.json()

    def update_plan(self, plan_id: str, **kwargs: Any) -> dict[str, Any]:
        resp = self.client.patch(f"/api/v1/tools/plan/{plan_id}", json=kwargs)
        resp.raise_for_status()
        return resp.json()

    def validate_plan(self, plan_id: str | None = None, **kwargs: Any) -> dict[str, Any]:
        url = f"/api/v1/tools/plan/{plan_id}/validate" if plan_id else "/api/v1/tools/plan/validate"
        resp = self.client.post(url, json=kwargs)
        resp.raise_for_status()
        return resp.json()

    def cancel_plan(self, plan_id: str, reason: str | None = None) -> dict[str, Any]:
        resp = self.client.post(f"/api/v1/tools/plan/{plan_id}/cancel", json={"reason": reason})
        resp.raise_for_status()
        return resp.json()

    # ── Phase 6: Risk API Tools ──────────────────────────────────────────────

    def calculate_position_size(self, **kwargs: Any) -> dict[str, Any]:
        resp = self.client.post("/api/v1/tools/risk/calculate_position_size", json=kwargs)
        resp.raise_for_status()
        return resp.json()

    def calculate_exposure(self, **kwargs: Any) -> dict[str, Any]:
        resp = self.client.post("/api/v1/tools/risk/calculate_exposure", json=kwargs)
        resp.raise_for_status()
        return resp.json()

    def validate_plan_risk(self, **kwargs: Any) -> dict[str, Any]:
        resp = self.client.post("/api/v1/tools/risk/validate_plan", json=kwargs)
        resp.raise_for_status()
        return resp.json()

    def check_portfolio_risk(self, **kwargs: Any) -> dict[str, Any]:
        resp = self.client.post("/api/v1/tools/risk/check_portfolio_risk", json=kwargs)
        resp.raise_for_status()
        return resp.json()

    # ── Phase 7: Execution Adapter Tools ─────────────────────────────────────

    def get_execution_balance(
        self,
        trading_mode: str = "paper",
        asset: str | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"trading_mode": trading_mode}
        if asset:
            params["asset"] = asset
        resp = self.client.get("/api/v1/tools/execution/balance", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_execution_positions(
        self,
        trading_mode: str = "paper",
        symbol: str | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"trading_mode": trading_mode}
        if symbol:
            params["symbol"] = symbol
        resp = self.client.get("/api/v1/tools/execution/positions", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_execution_open_orders(
        self,
        trading_mode: str = "paper",
        symbol: str | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"trading_mode": trading_mode}
        if symbol:
            params["symbol"] = symbol
        resp = self.client.get("/api/v1/tools/execution/orders/open", params=params)
        resp.raise_for_status()
        return resp.json()

    def place_execution_order(
        self,
        symbol: str,
        side: str,
        order_type: str = "market",
        quantity: float | str | Decimal = 0.01,
        price: float | str | Decimal | None = None,
        limit_price: float | str | Decimal | None = None,
        trading_mode: str = "paper",
        client_order_id: str | None = None,
        correlation_id: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "symbol": symbol,
            "side": side,
            "order_type": order_type,
            "quantity": str(quantity),
            "trading_mode": trading_mode,
        }
        eff_price = price if price is not None else limit_price
        if eff_price is not None:
            payload["limit_price"] = str(eff_price)
            payload["price"] = str(eff_price)
        if client_order_id:
            payload["client_order_id"] = client_order_id
        if correlation_id:
            payload["correlation_id"] = correlation_id
        resp = self.client.post("/api/v1/tools/execution/order", json=payload)
        resp.raise_for_status()
        return resp.json()

    def cancel_execution_order(
        self,
        order_id: str,
        trading_mode: str = "paper",
        symbol: str | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"trading_mode": trading_mode}
        if symbol:
            params["symbol"] = symbol
        resp = self.client.post(f"/api/v1/tools/execution/orders/{order_id}/cancel", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_execution_order(
        self,
        order_id: str,
        trading_mode: str = "paper",
    ) -> dict[str, Any]:
        resp = self.client.get(
            f"/api/v1/tools/execution/orders/{order_id}",
            params={"trading_mode": trading_mode},
        )
        resp.raise_for_status()
        return resp.json()

    # ── Phase 7: Position Manager Tools ──────────────────────────────────────

    def get_position(
        self,
        symbol: str,
        trading_mode: str = "paper",
    ) -> dict[str, Any]:
        resp = self.client.get(
            "/api/v1/tools/position",
            params={"symbol": symbol, "trading_mode": trading_mode},
        )
        resp.raise_for_status()
        return resp.json()

    def monitor_positions(
        self,
        trading_mode: str = "paper",
    ) -> dict[str, Any]:
        resp = self.client.get(
            "/api/v1/tools/position/monitor",
            params={"trading_mode": trading_mode},
        )
        resp.raise_for_status()
        return resp.json()

    def close_position(
        self,
        symbol: str,
        trading_mode: str = "paper",
        order_type: str = "market",
        quantity: float | str | Decimal | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "symbol": symbol,
            "trading_mode": trading_mode,
            "order_type": order_type,
        }
        if quantity is not None:
            payload["quantity"] = str(quantity)
        resp = self.client.post("/api/v1/tools/position/close", json=payload)
        resp.raise_for_status()
        return resp.json()

    # ── Phase 8: Audit & Memory Tools ────────────────────────────────────────

    def create_decision_log(
        self,
        snapshot: dict[str, Any],
        drawings: list[dict[str, Any]] | None = None,
        plan_id: str | None = None,
        risk_result: dict[str, Any] | None = None,
        execution_result: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "snapshot": snapshot,
            "drawings": drawings or [],
            "plan_id": plan_id,
            "risk_result": risk_result,
            "execution_result": execution_result,
        }
        resp = self.client.post("/api/v1/tools/decision/log", json=payload)
        resp.raise_for_status()
        return resp.json()

    def get_decision_history(
        self,
        plan_id: str | None = None,
        limit: int = 20,
        since: str | datetime | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"limit": limit}
        if plan_id:
            params["plan_id"] = plan_id
        if since:
            params["since"] = since.isoformat() if isinstance(since, datetime) else str(since)
        resp = self.client.get("/api/v1/tools/decision/history", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_trade_history(
        self,
        symbol: str | None = None,
        trading_mode: str = "paper",
        limit: int = 50,
        since: str | datetime | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"trading_mode": trading_mode, "limit": limit}
        if symbol:
            params["symbol"] = symbol
        if since:
            params["since"] = since.isoformat() if isinstance(since, datetime) else str(since)
        resp = self.client.get("/api/v1/tools/trade/history", params=params)
        resp.raise_for_status()
        return resp.json()


