from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock
import pytest

from packages.exchange.models import Ticker
from services.execution.paper import PaperExecutionAdapter


@pytest.mark.asyncio
async def test_paper_market_buy_slippage_and_fee() -> None:
    mock_md = AsyncMock()
    mock_md.get_ticker.return_value = Ticker(
        symbol="BTC/USDT",
        bid=Decimal("50000.0"),
        ask=Decimal("50010.0"),
        last=Decimal("50005.0"),
        volume=Decimal("1000.0"),
        timestamp=datetime.now(timezone.utc),
    )

    adapter = PaperExecutionAdapter(mock_md, slippage=Decimal("0.001"), fee_rate=Decimal("0.001"))
    result = await adapter.execute_market_order(
        symbol="BTC/USDT",
        side="buy",
        quantity=Decimal("0.5"),
    )

    # Ask = 50010.0, Slippage = 0.1% -> 50010 * 1.001 = 50060.01
    expected_price = Decimal("50010.0") * Decimal("1.001")
    expected_fee = expected_price * Decimal("0.5") * Decimal("0.001")

    assert result["symbol"] == "BTC/USDT"
    assert result["side"] == "buy"
    assert result["price"] == expected_price
    assert result["quantity"] == Decimal("0.5")
    assert result["fee"] == expected_fee
    assert result["fee_asset"] == "USDT"
    assert result["exchange_trade_id"].startswith("paper_")
    assert isinstance(result["price"], Decimal)
    assert isinstance(result["fee"], Decimal)


@pytest.mark.asyncio
async def test_paper_market_sell_slippage_and_fee() -> None:
    mock_md = AsyncMock()
    mock_md.get_ticker.return_value = Ticker(
        symbol="ETH/USDT",
        bid=Decimal("3000.0"),
        ask=Decimal("3002.0"),
        last=Decimal("3001.0"),
        volume=Decimal("5000.0"),
        timestamp=datetime.now(timezone.utc),
    )

    adapter = PaperExecutionAdapter(mock_md, slippage=Decimal("0.0005"), fee_rate=Decimal("0.001"))
    result = await adapter.execute_market_order(
        symbol="ETH/USDT",
        side="sell",
        quantity=Decimal("2.0"),
    )

    # Bid = 3000.0, Slippage = 0.05% -> 3000.0 * 0.9995 = 2998.5
    expected_price = Decimal("3000.0") * Decimal("0.9995")
    expected_fee = expected_price * Decimal("2.0") * Decimal("0.001")

    assert result["symbol"] == "ETH/USDT"
    assert result["side"] == "sell"
    assert result["price"] == expected_price
    assert result["fee"] == expected_fee


@pytest.mark.asyncio
async def test_paper_invalid_side_raises() -> None:
    mock_md = AsyncMock()
    mock_md.get_ticker.return_value = Ticker(
        symbol="BTC/USDT",
        bid=Decimal("50000.0"),
        ask=Decimal("50010.0"),
        last=Decimal("50005.0"),
        volume=Decimal("1000.0"),
        timestamp=datetime.now(timezone.utc),
    )
    adapter = PaperExecutionAdapter(mock_md)
    with pytest.raises(ValueError, match="Invalid order side"):
        await adapter.execute_market_order("BTC/USDT", "invalid_side", Decimal("1.0"))


@pytest.mark.asyncio
async def test_paper_limit_order_execution() -> None:
    mock_md = AsyncMock()
    mock_md.get_ticker.return_value = Ticker(
        symbol="BTC/USDT",
        bid=Decimal("50000.0"),
        ask=Decimal("50010.0"),
        last=Decimal("50005.0"),
        volume=Decimal("1000.0"),
        timestamp=datetime.now(timezone.utc),
    )
    adapter = PaperExecutionAdapter(mock_md)

    # Buy limit with price >= ask -> fills
    fill = await adapter.execute_limit_order("BTC/USDT", "buy", Decimal("1.0"), Decimal("50020.0"))
    assert fill is not None
    assert fill["price"] == Decimal("50010.0")

    # Buy limit with price < ask -> resting (unfilled)
    resting = await adapter.execute_limit_order("BTC/USDT", "buy", Decimal("1.0"), Decimal("49990.0"))
    assert resting is None
