"""Market data REST API integration tests.

Requires: running TimescaleDB.
Mark: @pytest.mark.integration
"""
from datetime import datetime, timezone
import httpx
import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_get_candles_returns_seeded_data(client: httpx.AsyncClient, db_session: AsyncSession) -> None:
    base = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    await db_session.execute(
        text("""
            INSERT INTO market_candles
                (symbol, timeframe, timestamp, open, high, low, close, volume, is_closed, trading_mode)
            VALUES ('BTC/USDT', '1h', :ts, 42000, 42100, 41900, 42050, 100, true, 'paper')
        """),
        {"ts": base},
    )
    await db_session.commit()

    resp = await client.get("/api/v1/markets/candles?symbol=BTC%2FUSDT&timeframe=1h")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["symbol"] == "BTC/USDT"
    assert data[0]["close"] == "42050"  # Decimal serialized as string


@pytest.mark.asyncio
async def test_get_symbols_lists_distinct_symbols(client: httpx.AsyncClient, db_session: AsyncSession) -> None:
    for symbol in ["BTC/USDT", "ETH/USDT"]:
        await db_session.execute(
            text("""
                INSERT INTO market_candles
                    (symbol, timeframe, timestamp, open, high, low, close, volume, is_closed, trading_mode)
                VALUES (:symbol, '1h', NOW(), 1000, 1100, 900, 1050, 10, true, 'paper')
            """),
            {"symbol": symbol},
        )
    await db_session.commit()

    resp = await client.get("/api/v1/markets/symbols")
    assert resp.status_code == 200
    symbols = [s["symbol"] for s in resp.json()]
    assert "BTC/USDT" in symbols
    assert "ETH/USDT" in symbols


@pytest.mark.asyncio
async def test_get_ticker_404_when_no_data(client: httpx.AsyncClient) -> None:
    resp = await client.get("/api/v1/markets/ticker?symbol=UNKNOWN%2FUSDT")
    assert resp.status_code == 404
