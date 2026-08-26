from typing import List, Dict, Any, Callable
from decimal import Decimal
import uuid

from packages.domain.market import Candle
from packages.domain.enums import OrderSide
from packages.quant.costs import FeeModel, SlippageModel, ExchangeFilter, OrderType

class EventDrivenBacktester:
    def __init__(
        self,
        strategy_func: Callable[[List[Candle]], Any],
        candles: List[Candle],
        initial_capital: Decimal = Decimal("10000.0"),
        fee_model: FeeModel = None,
        slippage_model: SlippageModel = None,
        exchange_filter: ExchangeFilter = None,
    ):
        self.strategy_func = strategy_func
        self.candles = sorted(candles, key=lambda c: c.timestamp)
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.position: Decimal = Decimal("0")
        
        self.fee_model = fee_model or FeeModel()
        self.slippage_model = slippage_model or SlippageModel()
        self.exchange_filter = exchange_filter or ExchangeFilter()

        self.equity_curve: List[Decimal] = []
        self.trade_pnls: List[Decimal] = []
        self.trades: List[Dict[str, Any]] = []

        # Keep track of pending orders generated at t, to be executed at t+1
        self.pending_orders: List[Dict[str, Any]] = []
        
        # Track entry price for pnl calculation
        self.entry_price: Decimal = Decimal("0")

    def run(self):
        # We need at least 2 candles to generate a signal and execute it
        if len(self.candles) < 2:
            return

        self.equity_curve = [self.capital] * len(self.candles)

        for t in range(len(self.candles)):
            current_candle = self.candles[t]

            # 1. Execute pending orders at the open price of t
            if self.pending_orders:
                execution_price = current_candle.open
                for order in self.pending_orders:
                    self._execute_order(order, execution_price, current_candle)
                self.pending_orders.clear()

            # 2. Update equity curve for current state
            current_equity = self.capital + (self.position * current_candle.close)
            self.equity_curve[t] = current_equity

            # 3. Generate signals using data up to t (inclusive)
            # We don't generate orders on the last candle because we can't execute them
            if t < len(self.candles) - 1:
                history = self.candles[:t+1]
                signals = self.strategy_func(history)
                
                # Assume signals return a list of dicts: {"side": OrderSide.BUY, "quantity": Decimal, ...}
                if signals:
                    self.pending_orders.extend(signals)

        # Force close position at the end if any
        if self.position > Decimal("0"):
            self._execute_order({"side": OrderSide.SELL, "quantity": self.position}, self.candles[-1].close, self.candles[-1])

    def _execute_order(self, order: Dict[str, Any], raw_price: Decimal, candle: Candle):
        side = order.get("side")
        qty = order.get("quantity", Decimal("0"))
        
        # Adjust quantity based on filter
        qty = self.exchange_filter.adjust_quantity(qty)
        
        if qty <= Decimal("0"):
            return

        is_buy = side == OrderSide.BUY

        # Apply slippage
        exec_price = self.slippage_model.apply_slippage(raw_price, is_buy)
        exec_price = self.exchange_filter.adjust_price(exec_price)

        # Apply min notional
        if not self.exchange_filter.validate_order(exec_price, qty):
            return

        notional = exec_price * qty
        fee = self.fee_model.calculate_fee(notional, OrderType.TAKER)

        if is_buy:
            total_cost = notional + fee
            if self.capital >= total_cost:
                self.capital -= total_cost
                
                # Average entry price update
                if self.position == Decimal("0"):
                    self.entry_price = exec_price
                else:
                    # simplistic weighted average
                    total_value = (self.position * self.entry_price) + notional
                    self.position += qty
                    self.entry_price = total_value / self.position
                
                if self.position == Decimal("0"):
                    self.position = qty
                    
                self.trades.append({
                    "side": side,
                    "price": exec_price,
                    "quantity": qty,
                    "fee": fee,
                    "timestamp": candle.timestamp
                })
        else:
            # Sell
            # allow partial close
            sell_qty = min(qty, self.position)
            if sell_qty > Decimal("0"):
                sell_notional = exec_price * sell_qty
                fee = self.fee_model.calculate_fee(sell_notional, OrderType.TAKER)
                self.capital += (sell_notional - fee)
                self.position -= sell_qty
                
                # Calculate PnL
                pnl = (exec_price - self.entry_price) * sell_qty - fee
                self.trade_pnls.append(pnl)
                
                if self.position == Decimal("0"):
                    self.entry_price = Decimal("0")
                
                self.trades.append({
                    "side": side,
                    "price": exec_price,
                    "quantity": sell_qty,
                    "fee": fee,
                    "pnl": pnl,
                    "timestamp": candle.timestamp
                })
