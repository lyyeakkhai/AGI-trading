from decimal import Decimal
from typing import Optional
from enum import Enum

class OrderType(str, Enum):
    MAKER = "MAKER"
    TAKER = "TAKER"

class FeeModel:
    def __init__(self, maker_fee: Decimal = Decimal("0.001"), taker_fee: Decimal = Decimal("0.001")):
        self.maker_fee = maker_fee
        self.taker_fee = taker_fee

    def calculate_fee(self, notional: Decimal, order_type: OrderType = OrderType.TAKER) -> Decimal:
        if order_type == OrderType.MAKER:
            return notional * self.maker_fee
        return notional * self.taker_fee

class SlippageModel:
    def __init__(self, slippage_bps: int = 5):
        # 1 bps = 0.0001
        self.slippage_rate = Decimal(str(slippage_bps)) / Decimal("10000")

    def apply_slippage(self, price: Decimal, is_buy: bool) -> Decimal:
        slippage_amount = price * self.slippage_rate
        if is_buy:
            return price + slippage_amount
        return price - slippage_amount

class ExchangeFilter:
    def __init__(
        self,
        min_notional: Decimal = Decimal("10.0"),
        price_tick_size: Decimal = Decimal("0.01"),
        qty_step_size: Decimal = Decimal("0.00001")
    ):
        self.min_notional = min_notional
        self.price_tick_size = price_tick_size
        self.qty_step_size = qty_step_size

    def validate_order(self, price: Decimal, quantity: Decimal) -> bool:
        if price * quantity < self.min_notional:
            return False
        return True

    def adjust_price(self, price: Decimal) -> Decimal:
        return (price / self.price_tick_size).quantize(Decimal("1")) * self.price_tick_size
        
    def adjust_quantity(self, quantity: Decimal) -> Decimal:
        return (quantity / self.qty_step_size).quantize(Decimal("1")) * self.qty_step_size
