from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.portfolio import PortfolioEntryModel, PositionModel
from packages.database.models.system import (
    ReconciliationDivergenceModel,
    ReconciliationRunModel,
    SystemConfigModel,
)
from packages.domain.enums import DivergenceType


class ReconciliationEngine:
    """Detects discrepancies between DB portfolio ledger and exchange truth.
    
    Enforces the fail-closed reconciliation_blocked flag when critical divergences occur.
    """

    SYSTEM_CONFIG_KEY = "reconciliation_blocked"

    async def is_blocked(self, session: AsyncSession) -> bool:
        """Check if trading is currently halted due to reconciliation block."""
        stmt = select(SystemConfigModel).where(
            SystemConfigModel.key == self.SYSTEM_CONFIG_KEY
        )
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()
        if record is None:
            return False
        return bool(record.value.get("blocked", False))

    async def set_blocked_status(
        self,
        session: AsyncSession,
        blocked: bool,
        reason: str = "",
        actor: str = "system",
    ) -> None:
        """Update reconciliation blocked status flag."""
        now = datetime.now(timezone.utc)
        stmt = select(SystemConfigModel).where(
            SystemConfigModel.key == self.SYSTEM_CONFIG_KEY
        )
        result = await session.execute(stmt)
        record = result.scalar_one_or_none()

        value = {
            "blocked": blocked,
            "reason": reason,
            "updated_by": actor,
            "updated_at": now.isoformat(),
        }

        if record is None:
            record = SystemConfigModel(
                key=self.SYSTEM_CONFIG_KEY,
                value=value,
                updated_at=now,
            )
            session.add(record)
        else:
            record.value = value
            record.updated_at = now

        await session.flush()

    async def unblock(
        self,
        session: AsyncSession,
        actor: str,
        reason: str,
    ) -> None:
        """Owner/operator manual unblock of the trading halt."""
        await self.set_blocked_status(
            session=session,
            blocked=False,
            reason=reason,
            actor=actor,
        )

    async def run_reconciliation(
        self,
        session: AsyncSession,
        account_id: uuid.UUID,
        trading_mode: str,
        exchange_balances: dict[str, Decimal] | None = None,
        exchange_positions: dict[str, Decimal] | None = None,
        trigger: str = "manual",
    ) -> ReconciliationRunModel:
        """Perform reconciliation check comparing DB against exchange state snapshot."""
        now = datetime.now(timezone.utc)
        run = ReconciliationRunModel(
            id=uuid.uuid4(),
            trigger=trigger,
            trading_mode=trading_mode,
            started_at=now,
            completed_at=None,
            divergence_count=0,
            is_blocked=False,
        )
        session.add(run)
        await session.flush()

        divergences: list[ReconciliationDivergenceModel] = []

        # 1. Reconcile cash/asset balances if exchange balances provided
        if exchange_balances is not None:
            entry_stmt = select(PortfolioEntryModel).where(
                PortfolioEntryModel.account_id == account_id,
                PortfolioEntryModel.trading_mode == trading_mode,
            )
            db_entries = {e.asset: e.balance for e in (await session.execute(entry_stmt)).scalars().all()}

            # Check DB entries vs exchange
            for asset, db_bal in db_entries.items():
                exch_bal = exchange_balances.get(asset, Decimal("0"))
                diff = abs(db_bal - exch_bal)
                if diff > Decimal("0.00000001"):
                    div = ReconciliationDivergenceModel(
                        id=uuid.uuid4(),
                        run_id=run.id,
                        divergence_type=DivergenceType.UNEXPECTED_BALANCE.value,
                        description=f"Balance mismatch for {asset}: DB={db_bal}, Exchange={exch_bal}, diff={diff}",
                        trading_mode=trading_mode,
                        detected_at=now,
                    )
                    divergences.append(div)

        # 2. Reconcile positions if exchange positions provided
        if exchange_positions is not None:
            pos_stmt = select(PositionModel).where(
                PositionModel.account_id == account_id,
                PositionModel.trading_mode == trading_mode,
            )
            db_positions = {p.symbol: p.quantity for p in (await session.execute(pos_stmt)).scalars().all()}

            for symbol, db_qty in db_positions.items():
                exch_qty = exchange_positions.get(symbol, Decimal("0"))
                diff = abs(db_qty - exch_qty)
                if diff > Decimal("0.00000001"):
                    div_type = DivergenceType.CRITICAL.value if diff > Decimal("0.01") else DivergenceType.RESOLVABLE.value
                    div = ReconciliationDivergenceModel(
                        id=uuid.uuid4(),
                        run_id=run.id,
                        divergence_type=div_type,
                        description=f"Position mismatch for {symbol}: DB={db_qty}, Exchange={exch_qty}, diff={diff}",
                        trading_mode=trading_mode,
                        detected_at=now,
                    )
                    divergences.append(div)

        # Record all divergences
        for d in divergences:
            session.add(d)

        run.divergence_count = len(divergences)
        has_critical = any(
            d.divergence_type in (DivergenceType.CRITICAL.value, DivergenceType.UNEXPECTED_BALANCE.value)
            for d in divergences
        )

        if has_critical:
            run.is_blocked = True
            await self.set_blocked_status(
                session=session,
                blocked=True,
                reason=f"Run {run.id} found {len(divergences)} divergences (critical detected)",
                actor="reconciliation_engine",
            )

        run.completed_at = datetime.now(timezone.utc)
        await session.flush()
        return run
