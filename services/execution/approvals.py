from __future__ import annotations

from datetime import datetime, timedelta, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models.relational import OwnerApprovalModel
from packages.domain.enums import ApprovalStatus


class ApprovalError(Exception):
    """Base exception for approval-related errors."""


class ApprovalNotFoundError(ApprovalError):
    """Approval record not found."""


class ApprovalInvalidError(ApprovalError):
    """Approval status or parameters are invalid."""


class ApprovalAlreadyConsumedError(ApprovalError):
    """Approval has already been consumed by an execution."""


class ApprovalExpiredError(ApprovalError):
    """Approval has passed its validity TTL."""


class OwnerApprovalService:
    """Validates TTL, ownership, and single-use consumption of owner trade approvals."""

    async def get_approval(
        self, session: AsyncSession, approval_id: uuid.UUID
    ) -> OwnerApprovalModel | None:
        stmt = select(OwnerApprovalModel).where(OwnerApprovalModel.id == approval_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_approval(
        self,
        session: AsyncSession,
        proposal_id: uuid.UUID,
        trading_mode: str,
        ttl_seconds: int = 300,
        correlation_id: uuid.UUID | None = None,
        status: str = ApprovalStatus.APPROVED.value,
    ) -> OwnerApprovalModel:
        now = datetime.now(timezone.utc)
        approval = OwnerApprovalModel(
            id=uuid.uuid4(),
            proposal_id=proposal_id,
            status=status,
            trading_mode=trading_mode,
            correlation_id=correlation_id or uuid.uuid4(),
            created_at=now,
            expires_at=now + timedelta(seconds=ttl_seconds),
            consumed_at=None,
        )
        session.add(approval)
        await session.flush()
        return approval

    async def validate_and_consume(
        self,
        session: AsyncSession,
        approval_id: uuid.UUID,
        proposal_id: uuid.UUID | None = None,
    ) -> OwnerApprovalModel:
        """Atomically validate TTL, status, and single-use constraint, marking as consumed."""
        approval = await self.get_approval(session, approval_id)
        if approval is None:
            raise ApprovalNotFoundError(f"Approval {approval_id} not found")

        if proposal_id is not None and approval.proposal_id != proposal_id:
            raise ApprovalInvalidError(
                f"Approval {approval_id} belongs to proposal {approval.proposal_id}, expected {proposal_id}"
            )

        if approval.consumed_at is not None or approval.status.lower() == ApprovalStatus.CONSUMED.value:
            raise ApprovalAlreadyConsumedError(f"Approval {approval_id} has already been consumed")

        if approval.status.lower() != ApprovalStatus.APPROVED.value:
            raise ApprovalInvalidError(
                f"Approval {approval_id} has status '{approval.status}', expected '{ApprovalStatus.APPROVED.value}'"
            )

        now = datetime.now(timezone.utc)
        # Ensure UTC timezone comparability
        expires_at = approval.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if now > expires_at:
            approval.status = ApprovalStatus.EXPIRED.value
            await session.flush()
            raise ApprovalExpiredError(
                f"Approval {approval_id} expired at {expires_at.isoformat()}"
            )

        approval.status = ApprovalStatus.CONSUMED.value
        approval.consumed_at = now
        await session.flush()
        return approval
