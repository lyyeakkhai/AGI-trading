from services.market_data.health import FeedConfig, FeedHealthMonitor


def test_fresh_feed_is_ready():
    config = FeedConfig(
        symbols=["BTC/USDT"],
        timeframes=["1m", "15m"],
        ticker_stale_seconds=60,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")
    monitor.record_trade("BTC/USDT")
    monitor.record_candle("BTC/USDT", "1m")
    monitor.record_candle("BTC/USDT", "15m")
    monitor.check_all()
    assert monitor.is_ready is True


def test_stale_ticker_marks_not_ready():
    config = FeedConfig(
        symbols=["BTC/USDT"],
        timeframes=["1m"],
        ticker_stale_seconds=1,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")
    monitor.record_trade("BTC/USDT")
    monitor.record_candle("BTC/USDT", "1m")

    # Fast-forward time: last ticker was 2 seconds ago
    old_time = monitor._last_ticker["BTC/USDT"]
    monitor._last_ticker["BTC/USDT"] = old_time - 2.0
    monitor.check_all()
    assert monitor.is_ready is False


def test_recovery_after_stale():
    config = FeedConfig(
        symbols=["BTC/USDT"],
        timeframes=["1m"],
        ticker_stale_seconds=1,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")
    monitor.record_trade("BTC/USDT")
    monitor.record_candle("BTC/USDT", "1m")
    monitor._last_ticker["BTC/USDT"] -= 2.0  # force stale
    monitor.check_all()
    assert monitor.is_ready is False

    # Recover: new ticker arrives
    monitor.record_ticker("BTC/USDT")
    monitor.check_all()
    assert monitor.is_ready is True


def test_missing_symbol_marks_not_ready():
    config = FeedConfig(
        symbols=["BTC/USDT", "ETH/USDT"],
        timeframes=["1m"],
        ticker_stale_seconds=60,
        trade_stale_seconds=60,
    )
    monitor = FeedHealthMonitor(config)
    monitor.record_ticker("BTC/USDT")  # ETH/USDT never seen
    monitor.check_all()
    assert monitor.is_ready is False
