from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

from packages.exchange.base import ExchangeAdapter


class PaperExecutionAdapter:
    """Simulated execution adapter for paper trading against real-time market data."""

    def __init__(
        self,
        market_data_adapter: ExchangeAdapter,
        slippage: Decimal = Decimal("0.0005"),  # 0.05%
        fee_rate: Decimal = Decimal("0.001"),   # 0.1%
    ) -> None:
        self._md = market_data_adapter
        self.SLIPPAGE = slippage
        self.FEE_RATE = fee_rate

    async def execute_market_order(
        self,
        symbol: str,
        side: str,
        quantity: Decimal,
    ) -> dict[str, Any]:
        """Execute a market order against current top-of-book with slippage and fee modeling."""
        if quantity <= Decimal("0"):
            raise ValueError(f"Quantity must be positive, got {quantity}")

        ticker = await self._md.get_ticker(symbol)
        side_lower = side.lower()

        if side_lower == "buy":
            base_price = ticker.ask
            fill_price = base_price * (Decimal("1") + self.SLIPPAGE)
        elif side_lower == "sell":
            base_price = ticker.bid
            fill_price = base_price * (Decimal("1") - self.SLIPPAGE)
        else:
            raise ValueError(f"Invalid order side: {side}")

        fee = fill_price * quantity * self.FEE_RATE
        fee_asset = symbol.split("/")[1] if "/" in symbol else "USDT"

        return {
            "exchange_trade_id": f"paper_{uuid.uuid4()}",
            "symbol": symbol,
            "side": side_lower,
            "price": fill_price,
            "quantity": quantity,
            "fee": fee,
            "fee_asset": fee_asset,
            "executed_at": datetime.now(timezone.utc),
        }

    async def execute_limit_order(
        self,
        symbol: str,
        side: str,
        quantity: Decimal,
        limit_price: Decimal,
    ) -> dict[str, Any] | None:
        """Execute a limit order if price crosses the current market spread."""
        if quantity <= Decimal("0"):
            raise ValueError(f"Quantity must be positive, got {quantity}")
        if limit_price <= Decimal("0"):
            raise ValueError(f"Limit price must be positive, got {limit_price}")

        ticker = await self._md.get_ticker(symbol)
        side_lower = side.lower()

        # Check for immediate fill
        if side_lower == "buy" and ticker.ask <= limit_price:
            fill_price = min(ticker.ask, limit_price)
        elif side_lower == "sell" and ticker.bid >= limit_price:
            fill_price = max(ticker.bid, limit_price)
        else:
            return None  # Unfilled resting order

        fee = fill_price * quantity * self.FEE_RATE
        fee_asset = symbol.split("/")[1] if "/" in symbol else "USDT"

        return {
            "exchange_trade_id": f"paper_{uuid.uuid4()}",
            "symbol": symbol,
            "side": side_lower,
            "price": fill_price,
            "quantity": quantity,
            "fee": fee,
            "fee_asset": fee_asset,
            "executed_at": datetime.now(timezone.utc),
        }
