"""Gap detection and backfill integration test.

Requires: running TimescaleDB.
Mark: @pytest.mark.integration
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.exchange.models import OHLCVCandle
from services.market_data.backfill import BackfillService

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_backfill_fills_gap_without_duplication(db_session: AsyncSession) -> None:
    base = datetime(2024, 6, 1, 10, 0, tzinfo=timezone.utc)

    # Seed DB with one candle — leaving a gap
    await db_session.execute(
        text("""
            INSERT INTO market_candles
                (symbol, timeframe, timestamp, open, high, low, close, volume, is_closed, trading_mode)
            VALUES
                ('BTC/USDT', '1m', :ts, 42000, 42100, 41900, 42050, 10, true, 'paper')
        """),
        {"ts": base},
    )
    await db_session.commit()

    # Mock adapter returns 3 candles (2 new + 1 duplicate)
    mock_candles = [
        OHLCVCandle(
            symbol="BTC/USDT",
            timeframe="1m",
            timestamp=base + timedelta(minutes=i),
            open=Decimal("42000"),
            high=Decimal("42100"),
            low=Decimal("41900"),
            close=Decimal("42050"),
            volume=Decimal("10"),
            is_closed=True,
        )
        for i in range(3)
    ]
    mock_adapter = MagicMock()
    mock_adapter.get_candles = AsyncMock(return_value=mock_candles)

    service = BackfillService(mock_adapter, lambda: db_session, trading_mode="paper")
    await service.run_backfill(["BTC/USDT"], ["1m"])

    # Should have 3 rows (1 original + 2 new), no duplicates
    result = await db_session.execute(
        text("SELECT COUNT(*) FROM market_candles WHERE symbol = 'BTC/USDT' AND timeframe = '1m'")
    )
    count = result.scalar()
    assert count == 3
