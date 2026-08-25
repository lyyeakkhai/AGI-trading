from packages.config.settings import RedisSettings
from packages.events.client import RedisClient
from packages.events.streams import StreamNames


def test_paper_and_live_keys_differ() -> None:
    settings = RedisSettings()
    paper = RedisClient(settings, app_env="development", trading_mode="paper")
    live = RedisClient(settings, app_env="production", trading_mode="live")

    assert paper._key("foo") != live._key("foo")
    assert paper._key("foo") == "development:paper:foo"
    assert live._key("foo") == "production:live:foo"


def test_stream_names_constants() -> None:
    assert StreamNames.MARKET_CANDLES == "stream:market:candles"
    assert StreamNames.MARKET_TRADES == "stream:market:trades"
    assert StreamNames.MARKET_TICKERS == "stream:market:tickers"
    assert StreamNames.MARKET_ORDERBOOK == "stream:market:orderbook"
    assert StreamNames.OPPORTUNITIES == "stream:market:opportunities"


def test_redis_namespace_isolation_across_environments() -> None:
    settings = RedisSettings()
    dev_paper = RedisClient(settings, app_env="development", trading_mode="paper")
    prod_paper = RedisClient(settings, app_env="production", trading_mode="paper")
    prod_live = RedisClient(settings, app_env="production", trading_mode="live")

    key_name = StreamNames.OPPORTUNITIES
    assert dev_paper._key(key_name) == "development:paper:stream:market:opportunities"
    assert prod_paper._key(key_name) == "production:paper:stream:market:opportunities"
    assert prod_live._key(key_name) == "production:live:stream:market:opportunities"
    assert len({dev_paper._key(key_name), prod_paper._key(key_name), prod_live._key(key_name)}) == 3
