from __future__ import annotations

from datetime import datetime, timedelta, timezone
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock

from packages.database.models.relational import OwnerApprovalModel
from services.execution.approvals import (
    ApprovalAlreadyConsumedError,
    ApprovalExpiredError,
    ApprovalInvalidError,
    ApprovalNotFoundError,
    OwnerApprovalService,
)


@pytest.mark.asyncio
async def test_validate_and_consume_success() -> None:
    service = OwnerApprovalService()
    session = AsyncMock()
    approval_id = uuid.uuid4()
    proposal_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    approval = OwnerApprovalModel(
        id=approval_id,
        proposal_id=proposal_id,
        status="approved",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        created_at=now - timedelta(seconds=10),
        expires_at=now + timedelta(seconds=300),
        consumed_at=None,
    )

    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = approval
    session.execute.return_value = mock_res

    consumed = await service.validate_and_consume(session, approval_id, proposal_id)
    assert consumed.status == "consumed"
    assert consumed.consumed_at is not None


@pytest.mark.asyncio
async def test_validate_and_consume_expired() -> None:
    service = OwnerApprovalService()
    session = AsyncMock()
    approval_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    approval = OwnerApprovalModel(
        id=approval_id,
        proposal_id=uuid.uuid4(),
        status="approved",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        created_at=now - timedelta(seconds=400),
        expires_at=now - timedelta(seconds=100),  # expired 100s ago
        consumed_at=None,
    )

    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = approval
    session.execute.return_value = mock_res

    with pytest.raises(ApprovalExpiredError, match="expired at"):
        await service.validate_and_consume(session, approval_id)

    assert approval.status == "expired"


@pytest.mark.asyncio
async def test_validate_and_consume_already_consumed() -> None:
    service = OwnerApprovalService()
    session = AsyncMock()
    approval_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    approval = OwnerApprovalModel(
        id=approval_id,
        proposal_id=uuid.uuid4(),
        status="consumed",
        trading_mode="paper",
        correlation_id=uuid.uuid4(),
        created_at=now - timedelta(seconds=50),
        expires_at=now + timedelta(seconds=250),
        consumed_at=now - timedelta(seconds=10),
    )

    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = approval
    session.execute.return_value = mock_res

    with pytest.raises(ApprovalAlreadyConsumedError, match="already been consumed"):
        await service.validate_and_consume(session, approval_id)


@pytest.mark.asyncio
async def test_validate_and_consume_not_found() -> None:
    service = OwnerApprovalService()
    session = AsyncMock()
    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = None
    session.execute.return_value = mock_res

    with pytest.raises(ApprovalNotFoundError, match="not found"):
        await service.validate_and_consume(session, uuid.uuid4())
