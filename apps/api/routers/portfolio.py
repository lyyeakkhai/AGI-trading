from __future__ import annotations

from decimal import Decimal
from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import get_settings
from packages.database import get_engine, get_session_factory
from packages.database.models.hypertables import PortfolioSnapshotModel
from packages.database.models.portfolio import (
    PortfolioAccountModel,
    PortfolioEntryModel,
    PositionModel,
)
from services.portfolio.engine import PortfolioEngine

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])
portfolio_engine = PortfolioEngine()


async def get_db_session() -> Any:
    settings = get_settings()
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    async with session_factory() as session:
        yield session


class DepositRequest(BaseModel):
    asset: str
    amount: Decimal
    trading_mode: str = "paper"
    account_id: uuid.UUID | None = None


@router.get("/accounts")
async def list_accounts(
    trading_mode: str = Query("paper", description="Trading mode filter"),
    session: AsyncSession = Depends(get_db_session),
) -> list[dict[str, Any]]:
    """List portfolio accounts and their asset balances."""
    stmt = select(PortfolioAccountModel).where(
        PortfolioAccountModel.trading_mode == trading_mode
    )
    accounts = list((await session.execute(stmt)).scalars().all())

    results: list[dict[str, Any]] = []
    for acc in accounts:
        entry_stmt = select(PortfolioEntryModel).where(
            PortfolioEntryModel.account_id == acc.id
        )
        entries = list((await session.execute(entry_stmt)).scalars().all())
        balances = {e.asset: str(e.balance) for e in entries}

        results.append({
            "id": str(acc.id),
            "name": acc.name,
            "trading_mode": acc.trading_mode,
            "balances": balances,
            "created_at": acc.created_at.isoformat(),
        })

    return results


@router.get("/positions")
async def list_positions(
    trading_mode: str = Query("paper", description="Trading mode filter"),
    account_id: uuid.UUID | None = Query(None, description="Account ID filter"),
    session: AsyncSession = Depends(get_db_session),
) -> list[dict[str, Any]]:
    """List open positions."""
    stmt = select(PositionModel).where(PositionModel.trading_mode == trading_mode)
    if account_id is not None:
        stmt = stmt.where(PositionModel.account_id == account_id)

    positions = list((await session.execute(stmt)).scalars().all())
    return [
        {
            "id": str(p.id),
            "account_id": str(p.account_id),
            "symbol": p.symbol,
            "quantity": str(p.quantity),
            "average_entry_price": str(p.average_entry_price),
            "realized_pnl": str(p.realized_pnl),
            "trading_mode": p.trading_mode,
            "updated_at": p.updated_at.isoformat(),
        }
        for p in positions
    ]


@router.get("/snapshots")
async def list_snapshots(
    trading_mode: str = Query("paper", description="Trading mode filter"),
    account_id: uuid.UUID | None = Query(None, description="Account ID filter"),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_db_session),
) -> list[dict[str, Any]]:
    """List portfolio snapshots."""
    stmt = select(PortfolioSnapshotModel).where(
        PortfolioSnapshotModel.trading_mode == trading_mode
    )
    if account_id is not None:
        stmt = stmt.where(PortfolioSnapshotModel.account_id == account_id)

    stmt = stmt.order_by(PortfolioSnapshotModel.timestamp.desc()).limit(limit)
    snapshots = list((await session.execute(stmt)).scalars().all())

    return [
        {
            "account_id": str(s.account_id),
            "timestamp": s.timestamp.isoformat(),
            "total_equity": str(s.total_equity),
            "cash_balance": str(s.cash_balance),
            "unrealized_pnl": str(s.unrealized_pnl),
            "exposure": str(s.exposure),
            "trading_mode": s.trading_mode,
        }
        for s in snapshots
    ]


@router.post("/deposit", status_code=status.HTTP_201_CREATED)
async def deposit_funds(
    req: DepositRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Deposit cash/assets into a portfolio account."""
    if req.amount <= Decimal("0"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive",
        )

    if req.account_id is None:
        account = await portfolio_engine.get_or_create_account(session, req.trading_mode)
        acc_id = account.id
    else:
        acc_id = req.account_id

    entry = await portfolio_engine.deposit(
        session=session,
        account_id=acc_id,
        asset=req.asset,
        amount=req.amount,
        trading_mode=req.trading_mode,
    )
    await session.commit()

    return {
        "account_id": str(acc_id),
        "asset": entry.asset,
        "balance": str(entry.balance),
        "trading_mode": entry.trading_mode,
    }
