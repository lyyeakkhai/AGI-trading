from packages.domain.types import Price, Quantity
import pytest
from decimal import Decimal
from datetime import datetime, timedelta

from packages.domain.market import Candle
from packages.domain.enums import Timeframe, TradingMode, OrderSide
from services.backtesting.engine import EventDrivenBacktester
from packages.quant.costs import FeeModel, SlippageModel, ExchangeFilter

def test_engine_look_ahead_prevention():
    candles = []
    base_time = datetime(2026, 1, 1)
    
    # Create 3 candles:
    # t=0: open 100, close 110
    # t=1: open 110, close 120
    # t=2: open 120, close 130
    for i in range(3):
        candles.append(Candle(
            symbol="BTC/USDT",
            timeframe=Timeframe.H1,
            open=Price(str(100 + i*10)),
            high=Price(str(110 + i*10)),
            low=Price(str(90 + i*10)),
            close=Price(str(110 + i*10)),
            volume=Quantity("1.0"),
            timestamp=base_time + timedelta(hours=i),
            is_closed=True,
            trading_mode=TradingMode.PAPER
        ))

    # Strategy that generates a BUY signal on the first candle (t=0)
    # The signal should execute at t=1 OPEN price (110)
    def my_strategy(history):
        if len(history) == 1:
            return [{"side": OrderSide.BUY, "quantity": Decimal("1.0")}]
        return []

    engine = EventDrivenBacktester(
        strategy_func=my_strategy,
        candles=candles,
        initial_capital=Decimal("1000.0"),
        fee_model=FeeModel(maker_fee=Decimal("0"), taker_fee=Decimal("0")),
        slippage_model=SlippageModel(slippage_bps=0),
        exchange_filter=ExchangeFilter(min_notional=Decimal("10"), price_tick_size=Decimal("0.01"), qty_step_size=Decimal("0.01"))
    )

    engine.run()
    
    # One buy trade should have occurred at t=1, plus one force close at t=2
    assert len(engine.trades) == 2
    assert engine.trades[0]["side"] == OrderSide.BUY
    assert engine.trades[0]["price"] == Decimal("110.0") # Executed at open of t=1
    
    # Check force close at the end (t=2 close price = 130)
    assert engine.trades[1]["side"] == OrderSide.SELL
    assert engine.trades[1]["price"] == Decimal("130.0")

def test_fee_and_slippage_math():
    fee_model = FeeModel(maker_fee=Decimal("0.001"), taker_fee=Decimal("0.001"))
    slippage_model = SlippageModel(slippage_bps=5)
    
    price = Decimal("100.0")
    qty = Decimal("1.0")
    
    # Buy slippage adds 5 bps (0.05% of 100 = 0.05)
    exec_price_buy = slippage_model.apply_slippage(price, is_buy=True)
    assert exec_price_buy == Decimal("100.05")
    
    # Sell slippage subtracts 5 bps
    exec_price_sell = slippage_model.apply_slippage(price, is_buy=False)
    assert exec_price_sell == Decimal("99.95")
    
    # Fee is 0.1% of notional
    fee = fee_model.calculate_fee(exec_price_buy * qty)
    assert fee == Decimal("100.05") * Decimal("0.001")
