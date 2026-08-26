from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock

from packages.domain.idempotency import IdempotencyService
from packages.database.models.idempotency import IdempotencyKeyModel


def test_idempotency_key_generation() -> None:
    service = IdempotencyService()
    key1 = service.generate_key("proposal_123", "execute")
    key2 = service.generate_key("proposal_123", "execute")
    key3 = service.generate_key("proposal_124", "execute")

    assert len(key1) == 64
    assert key1 == key2
    assert key1 != key3


@pytest.mark.asyncio
async def test_idempotency_service_get_record() -> None:
    service = IdempotencyService()
    session = AsyncMock()
    mock_result = MagicMock()
    mock_record = IdempotencyKeyModel(key="k1", trading_mode="paper")
    mock_result.scalar_one_or_none.return_value = mock_record
    session.execute.return_value = mock_result

    record = await service.get_record(session, "k1", "paper")
    assert record == mock_record
    assert session.execute.called


@pytest.mark.asyncio
async def test_idempotency_service_record_key() -> None:
    service = IdempotencyService()
    session = MagicMock()

    record = await service.record_key(
        session=session,
        key="k1",
        trading_mode="paper",
        outcome={"status": "success"},
    )
    assert record.key == "k1"
    assert record.trading_mode == "paper"
    assert record.outcome == {"status": "success"}
    assert session.add.called
