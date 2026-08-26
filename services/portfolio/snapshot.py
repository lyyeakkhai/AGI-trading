from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.hypertables import PortfolioSnapshotModel
from packages.database.models.portfolio import PortfolioEntryModel, PositionModel


class PortfolioSnapshotService:
    """Computes and records point-in-time portfolio mark-to-market snapshots into TimescaleDB."""

    async def create_snapshot(
        self,
        session: AsyncSession,
        account_id: uuid.UUID,
        trading_mode: str,
        market_prices: dict[str, Decimal],
        quote_asset: str = "USDT",
    ) -> PortfolioSnapshotModel:
        """Calculate total equity, exposure, unrealized P&L, and persist snapshot."""
        now = datetime.now(timezone.utc)

        # 1. Fetch cash balance
        entry_stmt = select(PortfolioEntryModel).where(
            PortfolioEntryModel.account_id == account_id,
            PortfolioEntryModel.asset == quote_asset,
            PortfolioEntryModel.trading_mode == trading_mode,
        )
        entry = (await session.execute(entry_stmt)).scalar_one_or_none()
        cash_balance = entry.balance if entry is not None else Decimal("0")

        # 2. Fetch all open positions
        pos_stmt = select(PositionModel).where(
            PositionModel.account_id == account_id,
            PositionModel.trading_mode == trading_mode,
        )
        positions = list((await session.execute(pos_stmt)).scalars().all())

        # 3. Calculate metrics
        exposure = Decimal("0")
        unrealized_pnl = Decimal("0")

        for pos in positions:
            if pos.quantity == Decimal("0"):
                continue
            # If current market price is not provided, fall back to average entry price
            current_price = market_prices.get(pos.symbol, pos.average_entry_price)
            pos_val = pos.quantity * current_price
            exposure += pos_val
            pos_unrealized = (current_price - pos.average_entry_price) * pos.quantity
            unrealized_pnl += pos_unrealized

        total_equity = cash_balance + exposure

        snapshot = PortfolioSnapshotModel(
            account_id=account_id,
            timestamp=now,
            total_equity=total_equity,
            cash_balance=cash_balance,
            unrealized_pnl=unrealized_pnl,
            exposure=exposure,
            trading_mode=trading_mode,
        )
        session.add(snapshot)
        await session.flush()
        return snapshot

    async def get_latest_snapshot(
        self,
        session: AsyncSession,
        account_id: uuid.UUID,
    ) -> PortfolioSnapshotModel | None:
        """Fetch most recent portfolio snapshot."""
        stmt = (
            select(PortfolioSnapshotModel)
            .where(PortfolioSnapshotModel.account_id == account_id)
            .order_by(PortfolioSnapshotModel.timestamp.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_snapshots(
        self,
        session: AsyncSession,
        account_id: uuid.UUID,
        since: datetime | None = None,
        limit: int = 100,
    ) -> list[PortfolioSnapshotModel]:
        """Fetch historical snapshots for account."""
        stmt = select(PortfolioSnapshotModel).where(
            PortfolioSnapshotModel.account_id == account_id
        )
        if since is not None:
            stmt = stmt.where(PortfolioSnapshotModel.timestamp >= since)
        stmt = stmt.order_by(PortfolioSnapshotModel.timestamp.desc()).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())
