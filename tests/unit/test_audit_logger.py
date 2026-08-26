from __future__ import annotations

from datetime import datetime, timezone
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock

from packages.database.models.audit import AuditRecord
from services.audit.logger import get_audit_trail, log_financial_event


@pytest.mark.asyncio
async def test_log_financial_event() -> None:
    session = AsyncMock()
    session.add = MagicMock()

    entity_id = uuid.uuid4()
    cid = uuid.uuid4()
    payload = {"price": "50000.0", "quantity": "1.0", "side": "buy"}

    record = await log_financial_event(
        session=session,
        actor="execution_engine",
        action="fill_processed",
        entity_type="fill",
        entity_id=entity_id,
        trading_mode="paper",
        payload=payload,
        correlation_id=cid,
    )

    assert record.actor == "execution_engine"
    assert record.action == "fill_processed"
    assert record.entity_type == "fill"
    assert record.entity_id == entity_id
    assert record.trading_mode == "paper"
    assert record.payload == payload
    assert record.correlation_id == cid
    assert session.add.called
    assert session.flush.called


@pytest.mark.asyncio
async def test_get_audit_trail() -> None:
    session = AsyncMock()
    mock_res = MagicMock()
    entity_id = uuid.uuid4()

    mock_record = AuditRecord(
        id=uuid.uuid4(),
        actor="risk_engine",
        action="decision_approved",
        entity_type="proposal",
        entity_id=entity_id,
        trading_mode="paper",
        correlation_id=None,
        payload={"score": 0.1},
        timestamp=datetime.now(timezone.utc),
    )

    mock_res.scalars.return_value.all.return_value = [mock_record]
    session.execute.return_value = mock_res

    results = await get_audit_trail(session, entity_type="proposal", entity_id=entity_id)
    assert len(results) == 1
    assert results[0] == mock_record
