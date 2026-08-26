from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.portfolio import (
    FillModel,
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
    TradeModel,
)


class PortfolioEngine:
    """Core portfolio ledger and state derivation engine.
    
    All updates are atomic within the provided database session transaction.
    """

    async def get_or_create_account(
        self,
        session: AsyncSession,
        trading_mode: str,
        name: str = "Default Trading Account",
    ) -> PortfolioAccountModel:
        """Fetch or create a portfolio account for the given trading mode."""
        stmt = select(PortfolioAccountModel).where(
            PortfolioAccountModel.trading_mode == trading_mode
        )
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()

        if account is None:
            account = PortfolioAccountModel(
                id=uuid.uuid4(),
                name=name,
                trading_mode=trading_mode,
                created_at=datetime.now(timezone.utc),
            )
            session.add(account)
            await session.flush()

        return account

    async def get_entry(
        self,
        session: AsyncSession,
        account_id: uuid.UUID,
        asset: str,
        trading_mode: str,
    ) -> PortfolioEntryModel:
        """Fetch or initialize a portfolio asset balance entry."""
        stmt = select(PortfolioEntryModel).where(
            PortfolioEntryModel.account_id == account_id,
            PortfolioEntryModel.asset == asset,
            PortfolioEntryModel.trading_mode == trading_mode,
        )
        result = await session.execute(stmt)
        entry = result.scalar_one_or_none()

        if entry is None:
            entry = PortfolioEntryModel(
                id=uuid.uuid4(),
                account_id=account_id,
                asset=asset,
                balance=Decimal("0"),
                trading_mode=trading_mode,
                updated_at=datetime.now(timezone.utc),
            )
            session.add(entry)
            await session.flush()

        return entry

    async def deposit(
        self,
        session: AsyncSession,
        account_id: uuid.UUID,
        asset: str,
        amount: Decimal,
        trading_mode: str,
    ) -> PortfolioEntryModel:
        """Credit funds to a portfolio account."""
        if amount <= Decimal("0"):
            raise ValueError(f"Deposit amount must be positive, got {amount}")

        entry = await self.get_entry(session, account_id, asset, trading_mode)
        entry.balance += amount
        entry.updated_at = datetime.now(timezone.utc)
        return entry

    async def get_position(
        self,
        session: AsyncSession,
        account_id: uuid.UUID,
        symbol: str,
        trading_mode: str,
    ) -> PositionModel:
        """Fetch or initialize a symbol position for an account."""
        stmt = select(PositionModel).where(
            PositionModel.account_id == account_id,
            PositionModel.symbol == symbol,
            PositionModel.trading_mode == trading_mode,
        )
        result = await session.execute(stmt)
        position = result.scalar_one_or_none()

        if position is None:
            position = PositionModel(
                id=uuid.uuid4(),
                account_id=account_id,
                symbol=symbol,
                quantity=Decimal("0"),
                average_entry_price=Decimal("0"),
                realized_pnl=Decimal("0"),
                trading_mode=trading_mode,
                updated_at=datetime.now(timezone.utc),
            )
            session.add(position)
            await session.flush()

        return position

    async def process_fill(
        self,
        session: AsyncSession,
        fill_data: dict[str, Any] | FillModel,
        account_id: uuid.UUID | None = None,
    ) -> FillModel:
        """Atomically process an execution fill: record ledger, update balances and position."""
        if isinstance(fill_data, FillModel):
            fill = fill_data
        else:
            trade_id = str(fill_data["exchange_trade_id"])
            sym = str(fill_data["symbol"])
            mode = str(fill_data.get("trading_mode", "paper"))

            # Idempotency check: return existing fill if already processed
            stmt = select(FillModel).where(
                FillModel.exchange_trade_id == trade_id,
                FillModel.symbol == sym,
                FillModel.trading_mode == mode,
            )
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if existing is not None:
                return existing

            fill = FillModel(
                id=fill_data.get("id", uuid.uuid4()),
                order_id=fill_data.get("order_id", uuid.uuid4()),
                exchange_trade_id=trade_id,
                symbol=sym,
                side=str(fill_data["side"]).lower(),
                quantity=Decimal(str(fill_data["quantity"])),
                price=Decimal(str(fill_data["price"])),
                fee=Decimal(str(fill_data.get("fee", "0"))),
                fee_asset=str(fill_data.get("fee_asset", "USDT")),
                trading_mode=mode,
                correlation_id=fill_data.get("correlation_id", uuid.uuid4()),
                executed_at=fill_data.get("executed_at", datetime.now(timezone.utc)),
            )
            session.add(fill)

        now = datetime.now(timezone.utc)
        trading_mode = fill.trading_mode
        symbol = fill.symbol
        side = fill.side.lower()
        fill_qty = fill.quantity
        fill_price = fill.price
        fee = fill.fee

        # Determine quote and base assets from symbol (e.g. "BTC/USDT")
        if "/" in symbol:
            base_asset, quote_asset = symbol.split("/", 1)
        else:
            base_asset, quote_asset = symbol, "USDT"

        # Resolve portfolio account
        if account_id is None:
            account = await self.get_or_create_account(session, trading_mode)
            account_id = account.id

        # 1. Update Cash (Quote Asset) Balance
        quote_entry = await self.get_entry(session, account_id, quote_asset, trading_mode)
        if side == "buy":
            total_cash_outflow = (fill_price * fill_qty)
            if fill.fee_asset == quote_asset:
                total_cash_outflow += fee
            quote_entry.balance -= total_cash_outflow
        elif side == "sell":
            total_cash_inflow = (fill_price * fill_qty)
            if fill.fee_asset == quote_asset:
                total_cash_inflow -= fee
            quote_entry.balance += total_cash_inflow
        quote_entry.updated_at = now

        # 2. Update Position
        position = await self.get_position(session, account_id, symbol, trading_mode)
        curr_qty = position.quantity
        curr_avg_price = position.average_entry_price

        if side == "buy":
            new_qty = curr_qty + fill_qty
            if new_qty > Decimal("0"):
                new_avg_price = ((curr_qty * curr_avg_price) + (fill_qty * fill_price)) / new_qty
            else:
                new_avg_price = Decimal("0")
            position.quantity = new_qty
            position.average_entry_price = new_avg_price
        elif side == "sell":
            # Realized P&L on closed quantity
            pnl_gross = (fill_price - curr_avg_price) * fill_qty
            pnl_net = pnl_gross - fee
            position.realized_pnl += pnl_net
            new_qty = curr_qty - fill_qty
            position.quantity = new_qty
            if new_qty == Decimal("0"):
                position.average_entry_price = Decimal("0")
        position.updated_at = now

        # 3. Record/Update Trade
        trade = TradeModel(
            id=uuid.uuid4(),
            account_id=account_id,
            symbol=symbol,
            side=side,
            quantity=fill_qty,
            entry_price=fill_price if side == "buy" else curr_avg_price,
            exit_price=fill_price if side == "sell" else None,
            realized_pnl=(pnl_net if side == "sell" else None),
            trading_mode=trading_mode,
            correlation_id=fill.correlation_id,
            opened_at=fill.executed_at,
            closed_at=(fill.executed_at if side == "sell" else None),
        )
        session.add(trade)

        await session.flush()
        return fill
