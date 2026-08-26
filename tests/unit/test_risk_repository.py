from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from packages.database.models.relational import RiskConfigVersionModel
from packages.risk.models import RiskConfig
from services.risk.repository import RiskRepository


@pytest.fixture
def mock_session() -> AsyncMock:
    return AsyncMock()


async def test_get_latest_config_version_initializes_default(mock_session: AsyncMock) -> None:
    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_res

    repo = RiskRepository()
    record = await repo.get_latest_config_version(mock_session)

    assert record.version == 1
    assert record.created_by == "system_initialization"
    assert record.config["spot_only"] is True
    assert record.config["leverage_enabled"] is False
    mock_session.add.assert_called_once()
    mock_session.flush.assert_called_once()


async def test_get_latest_config_returns_parsed_model(mock_session: AsyncMock) -> None:
    rec = RiskConfigVersionModel(
        id=uuid.uuid4(),
        version=2,
        config={
            "spot_only": True,
            "leverage_enabled": False,
            "max_risk_per_trade_percent": "0.03",
            "max_drawdown_percent": "0.12",
            "max_concentration_percent": "0.25",
            "max_open_positions": 4,
            "min_reward_risk_ratio": "2.0",
            "market_data_max_age_seconds": 45,
            "min_notional": "15.0",
            "symbol_rules": {},
        },
        created_at=datetime.now(timezone.utc),
        created_by="owner",
    )
    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = rec
    mock_session.execute.return_value = mock_res

    repo = RiskRepository()
    ver, cfg = await repo.get_latest_config(mock_session)

    assert ver == 2
    assert cfg.max_risk_per_trade_percent == Decimal("0.03")
    assert cfg.min_reward_risk_ratio == Decimal("2.0")
    assert cfg.spot_only is True
    assert cfg.leverage_enabled is False


async def test_add_new_version_increments_version(mock_session: AsyncMock) -> None:
    mock_res = MagicMock()
    mock_res.scalar_one.return_value = 2  # Current max version is 2
    mock_session.execute.return_value = mock_res

    repo = RiskRepository()
    new_cfg = RiskConfig(
        max_risk_per_trade_percent=Decimal("0.015"),
        max_drawdown_percent=Decimal("0.08"),
    )
    record = await repo.add_new_version(mock_session, new_cfg, created_by="owner_alice")

    assert record.version == 3
    assert record.created_by == "owner_alice"
    mock_session.add.assert_called_once()
    mock_session.flush.assert_called_once()


async def test_add_new_version_structural_validation_fails_for_leverage(mock_session: AsyncMock) -> None:
    repo = RiskRepository()
    with pytest.raises(ValueError, match="leverage_enabled cannot be True"):
        await repo.add_new_version(
            mock_session,
            {"leverage_enabled": True, "spot_only": True},
            created_by="attacker",
        )

    with pytest.raises(ValueError, match="spot_only cannot be False"):
        await repo.add_new_version(
            mock_session,
            {"leverage_enabled": False, "spot_only": False},
            created_by="attacker",
        )
