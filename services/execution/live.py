from __future__ import annotations

import os
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import ccxt.async_support as ccxt


class LiveExecutionAdapter:
    """Live execution adapter for Binance using ccxt."""

    def __init__(self) -> None:
        api_key = os.getenv("BINANCE_API_KEY")
        api_secret = os.getenv("BINANCE_SECRET_KEY")
        
        self.exchange = ccxt.binance({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
        })
        use_testnet = os.getenv("BINANCE_USE_TESTNET", "true").lower() == "true"
        self.exchange.set_sandbox_mode(use_testnet)

    async def execute_market_order(
        self,
        symbol: str,
        side: str,
        quantity: Decimal,
    ) -> dict[str, Any]:
        """Execute a live market order on Binance."""
        if quantity <= Decimal("0"):
            raise ValueError(f"Quantity must be positive, got {quantity}")

        side_lower = side.lower()
        order = await self.exchange.create_order(
            symbol=symbol,
            type='market',
            side=side_lower,
            amount=float(quantity)
        )

        # Simplified parsing of ccxt response
        fee = Decimal(str(order.get('fee', {}).get('cost', 0)))
        fee_asset = order.get('fee', {}).get('currency', 'USDT')

        return {
            "exchange_trade_id": order.get('id'),
            "symbol": symbol,
            "side": side_lower,
            "price": Decimal(str(order.get('price', order.get('average', 0)))),
            "quantity": quantity,
            "fee": fee,
            "fee_asset": fee_asset,
            "executed_at": datetime.now(UTC),
        }

    async def execute_limit_order(
        self,
        symbol: str,
        side: str,
        quantity: Decimal,
        limit_price: Decimal,
    ) -> dict[str, Any] | None:
        """Execute a live limit order on Binance."""
        if quantity <= Decimal("0"):
            raise ValueError(f"Quantity must be positive, got {quantity}")
        if limit_price <= Decimal("0"):
            raise ValueError(f"Limit price must be positive, got {limit_price}")

        side_lower = side.lower()
        order = await self.exchange.create_order(
            symbol=symbol,
            type='limit',
            side=side_lower,
            amount=float(quantity),
            price=float(limit_price)
        )

        # Check if filled
        if order.get('status') == 'closed':
            fee = Decimal(str(order.get('fee', {}).get('cost', 0)))
            fee_asset = order.get('fee', {}).get('currency', 'USDT')
            return {
                "exchange_trade_id": order.get('id'),
                "symbol": symbol,
                "side": side_lower,
                "price": Decimal(str(order.get('average', limit_price))),
                "quantity": quantity,
                "fee": fee,
                "fee_asset": fee_asset,
                "executed_at": datetime.now(UTC),
            }
        return None

    async def get_portfolio(self) -> dict[str, Any]:
        """Fetch current portfolio balance."""
        balance = await self.exchange.fetch_balance()
        return balance.get('total', {})

    async def get_positions(self) -> list[dict[str, Any]]:
        """Fetch open positions (for futures/margin) or non-zero spot balances."""
        balance = await self.exchange.fetch_balance()
        positions = []
        for asset, amount in balance.get('total', {}).items():
            if amount > 0:
                positions.append({"symbol": asset, "amount": amount})
        return positions
        
    async def cancel_all_orders(self) -> None:
        """Cancel all open orders across all markets."""
        try:
            orders = await self.exchange.fetch_open_orders()
            for order in orders:
                await self.exchange.cancel_order(order['id'], order['symbol'])
        except Exception:
            # Re-raise to ensure Kill Switch aborts/logs properly if cancellation fails
            raise
        
    async def close(self) -> None:
        await self.exchange.close()
