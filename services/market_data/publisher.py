"""Thin wrapper around RedisStreamPublisher for market data events."""
from __future__ import annotations

from decimal import Decimal
import json
from typing import Any

from packages.events.streams import RedisStreamPublisher, StreamNames
from packages.exchange.models import MarketTrade, OHLCVCandle, OrderBook, Ticker


def _decimal_to_str(obj: object) -> object:
    """JSON-safe serialization: Decimal → str to preserve precision."""
    if isinstance(obj, Decimal):
        return str(obj)
    return obj


class MarketDataPublisher:
    def __init__(self, publisher: RedisStreamPublisher) -> None:
        self._pub = publisher

    async def publish_ticker(self, ticker: Ticker) -> None:
        await self._pub.publish(
            StreamNames.MARKET_TICKERS,
            {
                "symbol": ticker.symbol,
                "bid": str(ticker.bid),
                "ask": str(ticker.ask),
                "last": str(ticker.last),
                "volume": str(ticker.volume),
                "timestamp": ticker.timestamp.isoformat(),
            },
        )

    async def publish_candle(self, candle: OHLCVCandle) -> None:
        await self._pub.publish(
            StreamNames.MARKET_CANDLES,
            {
                "symbol": candle.symbol,
                "timeframe": candle.timeframe,
                "timestamp": candle.timestamp.isoformat(),
                "open": str(candle.open),
                "high": str(candle.high),
                "low": str(candle.low),
                "close": str(candle.close),
                "volume": str(candle.volume),
                "is_closed": "1" if candle.is_closed else "0",
            },
        )

    async def publish_trade(self, trade: MarketTrade) -> None:
        await self._pub.publish(
            StreamNames.MARKET_TRADES,
            {
                "symbol": trade.symbol,
                "timestamp": trade.timestamp.isoformat(),
                "price": str(trade.price),
                "amount": str(trade.amount),
                "side": trade.side,
                "exchange_trade_id": trade.exchange_trade_id,
            },
        )

    async def publish_orderbook(self, book: OrderBook) -> None:
        await self._pub.publish(
            StreamNames.MARKET_ORDERBOOK,
            {
                "symbol": book.symbol,
                "timestamp": book.timestamp.isoformat(),
                "bids": json.dumps([[str(p), str(q)] for p, q in book.bids[:10]]),
                "asks": json.dumps([[str(p), str(q)] for p, q in book.asks[:10]]),
            },
        )
