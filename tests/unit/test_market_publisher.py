"""Tests that publisher serializes Decimal values correctly."""
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
import pytest

from packages.exchange.models import MarketTrade, OHLCVCandle
from services.market_data.publisher import MarketDataPublisher


@pytest.fixture
def mock_redis_publisher() -> MagicMock:
    pub = MagicMock()
    pub.publish = AsyncMock()
    return pub


@pytest.fixture
def publisher(mock_redis_publisher: MagicMock) -> MarketDataPublisher:
    return MarketDataPublisher(mock_redis_publisher)


@pytest.mark.asyncio
async def test_publish_candle_serializes_decimals(
    publisher: MarketDataPublisher, mock_redis_publisher: MagicMock
) -> None:
    candle = OHLCVCandle(
        symbol="BTC/USDT",
        timeframe="1m",
        timestamp=datetime(2024, 1, 1, tzinfo=timezone.utc),
        open=Decimal("42000.50"),
        high=Decimal("42100.00"),
        low=Decimal("41900.00"),
        close=Decimal("42050.25"),
        volume=Decimal("10.12345"),
        is_closed=True,
    )
    await publisher.publish_candle(candle)
    mock_redis_publisher.publish.assert_called_once()
    data = mock_redis_publisher.publish.call_args[0][1]
    # Values must be strings, not Decimal or float
    assert isinstance(data["open"], str)
    assert data["open"] == "42000.50"
    assert data["is_closed"] == "1"


@pytest.mark.asyncio
async def test_publish_trade_includes_exchange_trade_id(
    publisher: MarketDataPublisher, mock_redis_publisher: MagicMock
) -> None:
    trade = MarketTrade(
        symbol="BTC/USDT",
        timestamp=datetime(2024, 1, 1, tzinfo=timezone.utc),
        price=Decimal("42000.00"),
        amount=Decimal("0.01"),
        side="buy",
        exchange_trade_id="12345678",
    )
    await publisher.publish_trade(trade)
    data = mock_redis_publisher.publish.call_args[0][1]
    assert data["exchange_trade_id"] == "12345678"
    assert data["price"] == "42000.00"
