from typing import List, Dict, Any
from decimal import Decimal

from packages.domain.market import Candle
from packages.quant.metrics import calculate_performance_metrics

class BenchmarkEngine:
    def __init__(self, initial_capital: Decimal = Decimal("10000.0")):
        self.initial_capital = initial_capital

    def calculate_buy_and_hold(self, candles: List[Candle]) -> Dict[str, Any]:
        if not candles or len(candles) < 2:
            return {}

        sorted_candles = sorted(candles, key=lambda c: c.timestamp)
        first_candle = sorted_candles[0]
        last_candle = sorted_candles[-1]

        # Buy at open of the first candle
        entry_price = first_candle.open
        qty = self.initial_capital / entry_price

        # Track equity curve
        equity_curve = []
        for candle in sorted_candles:
            equity_curve.append(qty * candle.close)

        # Single trade PnL at the end
        final_value = qty * last_candle.close
        trade_pnl = final_value - self.initial_capital

        metrics = calculate_performance_metrics(
            equity_curve=equity_curve,
            trade_pnls=[trade_pnl]
        )

        return {
            "strategy": "Buy & Hold",
            "initial_capital": float(self.initial_capital),
            "final_capital": float(final_value),
            "metrics": metrics
        }
