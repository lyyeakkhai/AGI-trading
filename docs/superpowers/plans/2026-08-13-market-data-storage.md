# Market Data + Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundational data layer — ingest live BTC/USDT and ETH/USDT market data from Binance via CCXT Pro, distribute events through Redis Streams, and persist to TimescaleDB.

**Architecture:** A Market Data Worker subscribes to Binance WebSocket feeds via CCXT Pro, normalizes data into Pydantic domain models, and publishes to Redis Streams. A separate Persistence Worker consumes from Redis Streams via consumer groups and writes batched upserts to TimescaleDB hypertables. A health endpoint tracks per-stream staleness.

**Tech Stack:** Python 3.12+, uv, CCXT Pro, Pydantic v2, pydantic-settings, Redis (redis-py async), PostgreSQL + TimescaleDB, SQLAlchemy 2.0 (async), asyncpg, Alembic, FastAPI (health only), structlog, pytest + pytest-asyncio

**Design Spec:** [2026-08-13-market-data-storage-design.md](../specs/2026-08-13-market-data-storage-design.md)

## Global Constraints

- Python 3.12+ required
- uv for dependency management
- All domain models are pure Pydantic BaseModel — no I/O imports
- All financial values use `Decimal` — never `float`
- All timestamps are UTC `datetime` with timezone info
- Structured JSON logging via structlog on every module
- Docker image versions pinned — no `:latest` tags
- Redis Streams (not Pub/Sub) for event distribution
- Order book is live-state only — not persisted to TimescaleDB
- No authenticated Binance calls in this slice

---

## File Structure

| File | Responsibility |
|---|---|
| `pyproject.toml` | Project metadata, dependencies, uv config |
| `docker-compose.yml` | Local dev: TimescaleDB + Redis (pinned versions) |
| `alembic.ini` | Alembic migration config |
| `infrastructure/docker/init-timescaledb.sql` | TimescaleDB extension + hypertable setup |
| `migrations/env.py` | Alembic environment |
| `migrations/versions/001_market_data_tables.py` | Initial schema migration |
| `src/trading/__init__.py` | Package root |
| `src/trading/domain/__init__.py` | Domain package |
| `src/trading/domain/enums.py` | `Timeframe`, `Side` enums |
| `src/trading/domain/models.py` | `Ticker`, `Candle`, `MarketTrade`, `OrderBook`, `OrderBookLevel` |
| `src/trading/config.py` | All settings classes (pydantic-settings) |
| `src/trading/infrastructure/__init__.py` | Infrastructure package |
| `src/trading/infrastructure/streams.py` | `StreamNames` constants |
| `src/trading/infrastructure/logging.py` | structlog JSON logging setup |
| `src/trading/infrastructure/redis.py` | Redis connection factory + stream publish/consume helpers |
| `src/trading/infrastructure/exchange.py` | CCXT Pro adapter (connect, subscribe, reconnect) |
| `src/trading/persistence/__init__.py` | Persistence package |
| `src/trading/persistence/database.py` | SQLAlchemy async engine + session factory |
| `src/trading/persistence/models.py` | SQLAlchemy ORM table definitions |
| `src/trading/persistence/repositories.py` | Batch upsert/insert methods |
| `src/trading/persistence/worker.py` | Redis consumer → TimescaleDB writer |
| `src/trading/services/__init__.py` | Services package |
| `src/trading/services/market_data/__init__.py` | Market data service package |
| `src/trading/services/market_data/publisher.py` | Redis Stream XADD publisher |
| `src/trading/services/market_data/health.py` | Staleness tracker + FastAPI /health |
| `src/trading/services/market_data/backfill.py` | REST candle gap recovery |
| `src/trading/services/market_data/worker.py` | CCXT Pro subscription tasks + supervisor |
| `scripts/run_market_worker.py` | Market data worker entry point |
| `scripts/run_persistence_worker.py` | Persistence worker entry point |
| `tests/conftest.py` | Shared pytest fixtures |
| `tests/unit/test_domain_models.py` | Domain model validation tests |
| `tests/unit/test_candle_upsert.py` | Upsert logic tests |
| `tests/integration/conftest.py` | Integration test fixtures (DB, Redis) |
| `tests/integration/test_redis_streams.py` | Redis stream publish/consume tests |
| `tests/integration/test_timescaledb_persistence.py` | DB persistence tests |
| `tests/integration/test_market_pipeline_e2e.py` | Full pipeline E2E test |

---

### Task 1: Project Scaffolding + Infrastructure

**Files:**
- Create: `pyproject.toml`
- Create: `docker-compose.yml`
- Create: `infrastructure/docker/init-timescaledb.sql`
- Create: `src/trading/__init__.py`
- Create: `src/trading/domain/__init__.py`
- Create: `src/trading/infrastructure/__init__.py`
- Create: `src/trading/persistence/__init__.py`
- Create: `src/trading/services/__init__.py`
- Create: `src/trading/services/market_data/__init__.py`
- Create: `alembic.ini`
- Create: `migrations/env.py`
- Create: `migrations/script.py.mako`
- Create: `migrations/versions/.gitkeep`
- Create: `tests/__init__.py`
- Create: `tests/unit/__init__.py`
- Create: `tests/integration/__init__.py`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: runnable Python project with `uv sync`, Docker Compose stack, Alembic config

- [ ] **Step 1: Create `pyproject.toml`**

```toml
[project]
name = "ai-trading"
version = "0.1.0"
description = "AI Trading Intelligence Platform - Market Data Layer"
requires-python = ">=3.12"
dependencies = [
    "ccxt>=4.0",
    "pydantic>=2.0",
    "pydantic-settings>=2.0",
    "redis>=5.0",
    "sqlalchemy[asyncio]>=2.0",
    "asyncpg>=0.29",
    "alembic>=1.13",
    "httpx>=0.27",
    "uvicorn>=0.30",
    "fastapi>=0.115",
    "structlog>=24.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.24",
    "ruff>=0.5",
]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[tool.ruff]
target-version = "py312"
line-length = 100

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/trading"]
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: timescale/timescaledb:2.17.2-pg16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: trading
      POSTGRES_USER: trading
      POSTGRES_PASSWORD: trading_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./infrastructure/docker/init-timescaledb.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trading -d trading"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.4-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

- [ ] **Step 3: Create `infrastructure/docker/init-timescaledb.sql`**

```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- market_candles hypertable
CREATE TABLE IF NOT EXISTS market_candles (
    symbol       VARCHAR(20)    NOT NULL,
    timeframe    VARCHAR(5)     NOT NULL,
    timestamp    TIMESTAMPTZ    NOT NULL,
    open         NUMERIC(20,8)  NOT NULL,
    high         NUMERIC(20,8)  NOT NULL,
    low          NUMERIC(20,8)  NOT NULL,
    close        NUMERIC(20,8)  NOT NULL,
    volume       NUMERIC(20,8)  NOT NULL,
    is_closed    BOOLEAN        NOT NULL DEFAULT FALSE,
    PRIMARY KEY (symbol, timeframe, timestamp)
);

SELECT create_hypertable('market_candles', 'timestamp',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- market_trades hypertable
CREATE TABLE IF NOT EXISTS market_trades (
    symbol             VARCHAR(20)    NOT NULL,
    timestamp          TIMESTAMPTZ    NOT NULL,
    price              NUMERIC(20,8)  NOT NULL,
    amount             NUMERIC(20,8)  NOT NULL,
    side               VARCHAR(4)     NOT NULL,
    exchange_trade_id  VARCHAR(64)    NOT NULL,
    UNIQUE (symbol, exchange_trade_id)
);

SELECT create_hypertable('market_trades', 'timestamp',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

CREATE INDEX IF NOT EXISTS idx_market_trades_symbol_ts
    ON market_trades (symbol, timestamp DESC);

-- market_ticker_snapshots hypertable
CREATE TABLE IF NOT EXISTS market_ticker_snapshots (
    symbol          VARCHAR(20)    NOT NULL,
    timestamp       TIMESTAMPTZ    NOT NULL,
    bid             NUMERIC(20,8)  NOT NULL,
    ask             NUMERIC(20,8)  NOT NULL,
    last            NUMERIC(20,8)  NOT NULL,
    volume_24h      NUMERIC(20,8)  NOT NULL,
    change_24h_pct  NUMERIC(10,4)  NOT NULL
);

SELECT create_hypertable('market_ticker_snapshots', 'timestamp',
    chunk_time_interval => INTERVAL '1 week',
    if_not_exists => TRUE
);

CREATE INDEX IF NOT EXISTS idx_ticker_snapshots_symbol_ts
    ON market_ticker_snapshots (symbol, timestamp DESC);

-- assets reference table
CREATE TABLE IF NOT EXISTS assets (
    id          SERIAL PRIMARY KEY,
    symbol      VARCHAR(20) UNIQUE NOT NULL,
    base        VARCHAR(10) NOT NULL,
    quote       VARCHAR(10) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial assets
INSERT INTO assets (symbol, base, quote) VALUES
    ('BTC/USDT', 'BTC', 'USDT'),
    ('ETH/USDT', 'ETH', 'USDT')
ON CONFLICT (symbol) DO NOTHING;

-- Enable compression on older chunks
ALTER TABLE market_candles SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol, timeframe'
);

SELECT add_compression_policy('market_candles', INTERVAL '7 days', if_not_exists => TRUE);

ALTER TABLE market_trades SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol'
);

SELECT add_compression_policy('market_trades', INTERVAL '7 days', if_not_exists => TRUE);

ALTER TABLE market_ticker_snapshots SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol'
);

SELECT add_compression_policy('market_ticker_snapshots', INTERVAL '7 days', if_not_exists => TRUE);
```

- [ ] **Step 4: Create package `__init__.py` files and Alembic config**

Create all `__init__.py` files as empty files:
- `src/trading/__init__.py`
- `src/trading/domain/__init__.py`
- `src/trading/infrastructure/__init__.py`
- `src/trading/persistence/__init__.py`
- `src/trading/services/__init__.py`
- `src/trading/services/market_data/__init__.py`
- `tests/__init__.py`
- `tests/unit/__init__.py`
- `tests/integration/__init__.py`

Create `alembic.ini`:

```ini
[alembic]
script_location = migrations
sqlalchemy.url = postgresql+asyncpg://trading:trading_dev@localhost:5432/trading

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

Create `migrations/env.py`:

```python
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=None, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

Create `migrations/script.py.mako` (Alembic default template):

```mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

- [ ] **Step 5: Install dependencies and verify**

```bash
uv sync
uv sync --extra dev
```

Run: `uv run python -c "import trading; print('package OK')"`
Expected: `package OK`

- [ ] **Step 6: Start Docker Compose and verify**

```bash
docker compose up -d
```

Wait for healthchecks, then verify:

```bash
docker compose exec postgres psql -U trading -d trading -c "\dt"
```

Expected: tables `market_candles`, `market_trades`, `market_ticker_snapshots`, `assets` listed.

```bash
docker compose exec postgres psql -U trading -d trading -c "SELECT * FROM assets;"
```

Expected: BTC/USDT and ETH/USDT rows.

```bash
docker compose exec redis redis-cli ping
```

Expected: `PONG`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: project scaffolding — pyproject.toml, docker-compose, TimescaleDB schema, Alembic config"
```

---

### Task 2: Domain Models + Enums

**Files:**
- Create: `src/trading/domain/enums.py`
- Create: `src/trading/domain/models.py`
- Create: `tests/unit/test_domain_models.py`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `Timeframe` enum with values `M15 = "15m"`, `H1 = "1h"`, `H4 = "4h"` and method `duration_seconds() -> int`
  - `Side` enum with values `BUY = "buy"`, `SELL = "sell"`
  - `Ticker(symbol: str, bid: Decimal, ask: Decimal, last: Decimal, volume_24h: Decimal, change_24h_pct: Decimal, timestamp: datetime)` — Pydantic model
  - `Candle(symbol: str, timeframe: Timeframe, open: Decimal, high: Decimal, low: Decimal, close: Decimal, volume: Decimal, timestamp: datetime, is_closed: bool)` — Pydantic model
  - `MarketTrade(symbol: str, price: Decimal, amount: Decimal, side: Side, timestamp: datetime, exchange_trade_id: str)` — Pydantic model
  - `OrderBookLevel(price: Decimal, amount: Decimal)` — Pydantic model
  - `OrderBook(symbol: str, bids: list[OrderBookLevel], asks: list[OrderBookLevel], timestamp: datetime)` — Pydantic model

- [ ] **Step 1: Write failing tests for enums**

```python
# tests/unit/test_domain_models.py
from datetime import datetime, timezone
from decimal import Decimal

import pytest

from trading.domain.enums import Side, Timeframe


class TestTimeframe:
    def test_values(self):
        assert Timeframe.M15 == "15m"
        assert Timeframe.H1 == "1h"
        assert Timeframe.H4 == "4h"

    def test_duration_seconds(self):
        assert Timeframe.M15.duration_seconds() == 900
        assert Timeframe.H1.duration_seconds() == 3600
        assert Timeframe.H4.duration_seconds() == 14400


class TestSide:
    def test_values(self):
        assert Side.BUY == "buy"
        assert Side.SELL == "sell"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/unit/test_domain_models.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'trading.domain.enums'`

- [ ] **Step 3: Implement enums**

```python
# src/trading/domain/enums.py
from enum import Enum


class Timeframe(str, Enum):
    """Supported candlestick timeframes."""

    M15 = "15m"
    H1 = "1h"
    H4 = "4h"

    def duration_seconds(self) -> int:
        """Return the duration of this timeframe in seconds."""
        mapping = {
            Timeframe.M15: 900,
            Timeframe.H1: 3600,
            Timeframe.H4: 14400,
        }
        return mapping[self]


class Side(str, Enum):
    """Trade side."""

    BUY = "buy"
    SELL = "sell"
```

- [ ] **Step 4: Run enum tests to verify they pass**

```bash
uv run pytest tests/unit/test_domain_models.py::TestTimeframe -v
uv run pytest tests/unit/test_domain_models.py::TestSide -v
```

Expected: all PASS

- [ ] **Step 5: Add failing tests for domain models**

Append to `tests/unit/test_domain_models.py`:

```python
from trading.domain.models import Candle, MarketTrade, OrderBook, OrderBookLevel, Ticker


class TestTicker:
    def test_creation(self):
        t = Ticker(
            symbol="BTC/USDT",
            bid=Decimal("67000.50"),
            ask=Decimal("67001.00"),
            last=Decimal("67000.75"),
            volume_24h=Decimal("12345.67"),
            change_24h_pct=Decimal("2.35"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
        )
        assert t.symbol == "BTC/USDT"
        assert t.bid == Decimal("67000.50")

    def test_serialization_roundtrip(self):
        t = Ticker(
            symbol="BTC/USDT",
            bid=Decimal("67000.50"),
            ask=Decimal("67001.00"),
            last=Decimal("67000.75"),
            volume_24h=Decimal("12345.67"),
            change_24h_pct=Decimal("2.35"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
        )
        data = t.model_dump(mode="json")
        restored = Ticker.model_validate(data)
        assert restored == t


class TestCandle:
    def test_creation(self):
        c = Candle(
            symbol="ETH/USDT",
            timeframe=Timeframe.H1,
            open=Decimal("3500.00"),
            high=Decimal("3550.00"),
            low=Decimal("3490.00"),
            close=Decimal("3540.00"),
            volume=Decimal("1000.00"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            is_closed=True,
        )
        assert c.timeframe == Timeframe.H1
        assert c.is_closed is True

    def test_forming_candle(self):
        c = Candle(
            symbol="BTC/USDT",
            timeframe=Timeframe.M15,
            open=Decimal("67000.00"),
            high=Decimal("67100.00"),
            low=Decimal("66900.00"),
            close=Decimal("67050.00"),
            volume=Decimal("500.00"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            is_closed=False,
        )
        assert c.is_closed is False

    def test_serialization_roundtrip(self):
        c = Candle(
            symbol="BTC/USDT",
            timeframe=Timeframe.H4,
            open=Decimal("67000.00"),
            high=Decimal("67500.00"),
            low=Decimal("66800.00"),
            close=Decimal("67200.00"),
            volume=Decimal("2000.00"),
            timestamp=datetime(2026, 8, 13, 8, 0, 0, tzinfo=timezone.utc),
            is_closed=True,
        )
        data = c.model_dump(mode="json")
        restored = Candle.model_validate(data)
        assert restored == c


class TestMarketTrade:
    def test_creation(self):
        t = MarketTrade(
            symbol="BTC/USDT",
            price=Decimal("67000.00"),
            amount=Decimal("0.5"),
            side=Side.BUY,
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            exchange_trade_id="123456789",
        )
        assert t.side == Side.BUY
        assert t.exchange_trade_id == "123456789"


class TestOrderBook:
    def test_creation(self):
        ob = OrderBook(
            symbol="BTC/USDT",
            bids=[
                OrderBookLevel(price=Decimal("67000.00"), amount=Decimal("1.5")),
                OrderBookLevel(price=Decimal("66999.00"), amount=Decimal("2.0")),
            ],
            asks=[
                OrderBookLevel(price=Decimal("67001.00"), amount=Decimal("1.0")),
                OrderBookLevel(price=Decimal("67002.00"), amount=Decimal("3.0")),
            ],
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
        )
        assert len(ob.bids) == 2
        assert len(ob.asks) == 2
        assert ob.bids[0].price > ob.bids[1].price
```

- [ ] **Step 6: Run tests to verify they fail**

```bash
uv run pytest tests/unit/test_domain_models.py -v
```

Expected: FAIL with `ImportError` on `trading.domain.models`

- [ ] **Step 7: Implement domain models**

```python
# src/trading/domain/models.py
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from trading.domain.enums import Side, Timeframe


class Ticker(BaseModel):
    """Real-time ticker snapshot for a trading pair."""

    symbol: str
    bid: Decimal
    ask: Decimal
    last: Decimal
    volume_24h: Decimal
    change_24h_pct: Decimal
    timestamp: datetime


class Candle(BaseModel):
    """OHLCV candlestick for a symbol and timeframe."""

    symbol: str
    timeframe: Timeframe
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    timestamp: datetime
    is_closed: bool


class MarketTrade(BaseModel):
    """A single executed trade on the exchange."""

    symbol: str
    price: Decimal
    amount: Decimal
    side: Side
    timestamp: datetime
    exchange_trade_id: str


class OrderBookLevel(BaseModel):
    """A single price level in the order book."""

    price: Decimal
    amount: Decimal


class OrderBook(BaseModel):
    """Current order book snapshot for a trading pair."""

    symbol: str
    bids: list[OrderBookLevel]
    asks: list[OrderBookLevel]
    timestamp: datetime
```

- [ ] **Step 8: Run all domain model tests to verify they pass**

```bash
uv run pytest tests/unit/test_domain_models.py -v
```

Expected: all PASS

- [ ] **Step 9: Commit**

```bash
git add src/trading/domain/ tests/unit/test_domain_models.py
git commit -m "feat: domain models — Ticker, Candle, MarketTrade, OrderBook with enums"
```

---

### Task 3: Configuration + Infrastructure Utilities

**Files:**
- Create: `src/trading/config.py`
- Create: `src/trading/infrastructure/streams.py`
- Create: `src/trading/infrastructure/logging.py`
- Create: `src/trading/infrastructure/redis.py`

**Interfaces:**
- Consumes: `Timeframe` from `trading.domain.enums`
- Produces:
  - `Settings` — root settings object with `.market_data`, `.stale_thresholds`, `.persistence`, `.database`, `.redis` attributes
  - `get_settings() -> Settings` — cached settings loader
  - `StreamNames.ticker(symbol: str) -> str`, `StreamNames.candle(symbol: str, timeframe: str) -> str`, `StreamNames.trade(symbol: str) -> str`, `StreamNames.orderbook(symbol: str) -> str`
  - `configure_logging(service: str) -> None` — sets up structlog JSON processor
  - `get_logger(**initial_context) -> structlog.BoundLogger`
  - `create_redis() -> redis.asyncio.Redis` — async Redis connection factory
  - `StreamPublisher` — class with `publish(stream: str, data: dict) -> str` (returns message ID)
  - `StreamConsumer` — class with `consume(streams, group, consumer, count, block_ms) -> list[tuple[str, str, dict]]` and `ack(stream, group, message_id) -> None`

- [ ] **Step 1: Implement `StreamNames` constants**

```python
# src/trading/infrastructure/streams.py


class StreamNames:
    """Centralized Redis stream name templates.

    All stream names in the system are derived from these templates.
    """

    _TICKER = "market:ticker:{symbol}"
    _CANDLE = "market:candle:{symbol}:{timeframe}"
    _TRADE = "market:trade:{symbol}"
    _ORDERBOOK = "market:orderbook:{symbol}"

    @staticmethod
    def ticker(symbol: str) -> str:
        return StreamNames._TICKER.format(symbol=symbol)

    @staticmethod
    def candle(symbol: str, timeframe: str) -> str:
        return StreamNames._CANDLE.format(symbol=symbol, timeframe=timeframe)

    @staticmethod
    def trade(symbol: str) -> str:
        return StreamNames._TRADE.format(symbol=symbol)

    @staticmethod
    def orderbook(symbol: str) -> str:
        return StreamNames._ORDERBOOK.format(symbol=symbol)
```

- [ ] **Step 2: Implement configuration**

```python
# src/trading/config.py
from functools import lru_cache

from pydantic_settings import BaseSettings


class MarketDataSettings(BaseSettings):
    """Market data worker configuration."""

    exchange: str = "binance"
    symbols: list[str] = ["BTC/USDT", "ETH/USDT"]
    timeframes: list[str] = ["15m", "1h", "4h"]
    orderbook_depth: int = 20
    stream_maxlen: int = 10000

    model_config = {"env_prefix": "MARKET_"}


class StaleThresholds(BaseSettings):
    """Per-stream-type staleness thresholds in seconds."""

    ticker_seconds: int = 60
    trades_seconds: int = 60
    orderbook_seconds: int = 30
    candle_15m_seconds: int = 300
    candle_1h_seconds: int = 900
    candle_4h_seconds: int = 3600

    model_config = {"env_prefix": "STALE_"}

    def for_candle_timeframe(self, timeframe: str) -> int:
        """Return the stale threshold for a specific candle timeframe."""
        mapping = {
            "15m": self.candle_15m_seconds,
            "1h": self.candle_1h_seconds,
            "4h": self.candle_4h_seconds,
        }
        return mapping.get(timeframe, self.candle_1h_seconds)


class PersistenceSettings(BaseSettings):
    """Persistence worker configuration."""

    batch_max_size: int = 100
    batch_max_wait_seconds: float = 1.0
    consumer_group: str = "persistence"
    consumer_name: str = "persistence-worker-1"

    model_config = {"env_prefix": "PERSIST_"}


class DatabaseSettings(BaseSettings):
    """PostgreSQL/TimescaleDB connection configuration."""

    url: str = "postgresql+asyncpg://trading:trading_dev@localhost:5432/trading"

    model_config = {"env_prefix": "DB_"}


class RedisSettings(BaseSettings):
    """Redis connection configuration."""

    url: str = "redis://localhost:6379"

    model_config = {"env_prefix": "REDIS_"}


class Settings(BaseSettings):
    """Root settings container."""

    market_data: MarketDataSettings = MarketDataSettings()
    stale_thresholds: StaleThresholds = StaleThresholds()
    persistence: PersistenceSettings = PersistenceSettings()
    database: DatabaseSettings = DatabaseSettings()
    redis: RedisSettings = RedisSettings()


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
```

- [ ] **Step 3: Implement structured logging**

```python
# src/trading/infrastructure/logging.py
import logging
import sys

import structlog


def configure_logging(service: str) -> None:
    """Configure structlog with JSON output for the given service name.

    Call once at process startup.
    """
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )
    # Bind service name to all future loggers in this process
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(service=service)


def get_logger(**initial_context: str) -> structlog.BoundLogger:
    """Return a structlog logger with optional initial context bindings."""
    return structlog.get_logger(**initial_context)
```

- [ ] **Step 4: Implement Redis connection and stream helpers**

```python
# src/trading/infrastructure/redis.py
from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from trading.config import get_settings
from trading.infrastructure.logging import get_logger

logger = get_logger()


async def create_redis() -> aioredis.Redis:
    """Create and return an async Redis connection."""
    settings = get_settings()
    return aioredis.from_url(settings.redis.url, decode_responses=True)


class StreamPublisher:
    """Publishes messages to Redis Streams."""

    def __init__(self, redis: aioredis.Redis, maxlen: int = 10000) -> None:
        self._redis = redis
        self._maxlen = maxlen

    async def publish(self, stream: str, data: dict[str, Any]) -> str:
        """Publish a message to a Redis Stream. Returns the message ID."""
        message_id: str = await self._redis.xadd(
            stream,
            {"data": json.dumps(data)},
            maxlen=self._maxlen,
            approximate=True,
        )
        logger.info("published_to_stream", stream=stream, message_id=message_id)
        return message_id


class StreamConsumer:
    """Consumes messages from Redis Streams using consumer groups."""

    def __init__(self, redis: aioredis.Redis) -> None:
        self._redis = redis

    async def ensure_group(self, stream: str, group: str) -> None:
        """Create a consumer group if it doesn't already exist."""
        try:
            await self._redis.xgroup_create(stream, group, id="0", mkstream=True)
        except aioredis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise

    async def consume(
        self,
        streams: list[str],
        group: str,
        consumer: str,
        count: int = 100,
        block_ms: int = 1000,
    ) -> list[tuple[str, str, dict[str, Any]]]:
        """Read messages from streams. Returns list of (stream, message_id, data)."""
        stream_dict = {s: ">" for s in streams}
        results: list[tuple[str, str, dict[str, Any]]] = []
        response = await self._redis.xreadgroup(
            group, consumer, stream_dict, count=count, block=block_ms
        )
        if response:
            for stream_name, messages in response:
                for message_id, fields in messages:
                    data = json.loads(fields["data"])
                    results.append((stream_name, message_id, data))
        return results

    async def ack(self, stream: str, group: str, message_id: str) -> None:
        """Acknowledge a message in a consumer group."""
        await self._redis.xack(stream, group, message_id)
```

- [ ] **Step 5: Run a quick import smoke test**

```bash
uv run python -c "
from trading.config import get_settings
from trading.infrastructure.streams import StreamNames
from trading.infrastructure.logging import configure_logging, get_logger

s = get_settings()
print('exchange:', s.market_data.exchange)
print('symbols:', s.market_data.symbols)
print('ticker stream:', StreamNames.ticker('BTC/USDT'))
print('candle stream:', StreamNames.candle('BTC/USDT', '1h'))
configure_logging('test')
log = get_logger()
log.info('smoke_test_passed')
"
```

Expected: prints config values, stream names, and a JSON log line

- [ ] **Step 6: Commit**

```bash
git add src/trading/config.py src/trading/infrastructure/
git commit -m "feat: configuration, stream names, structured logging, Redis helpers"
```

---

### Task 4: Persistence Layer (Database + Repositories)

**Files:**
- Create: `src/trading/persistence/database.py`
- Create: `src/trading/persistence/models.py`
- Create: `src/trading/persistence/repositories.py`
- Create: `tests/unit/test_candle_upsert.py`

**Interfaces:**
- Consumes: `Settings.database.url` from `trading.config`, domain models from `trading.domain.models`
- Produces:
  - `create_engine() -> AsyncEngine`
  - `create_session_factory(engine: AsyncEngine) -> async_sessionmaker`
  - `CandleRepository` with `upsert_batch(session: AsyncSession, candles: list[Candle]) -> int`
  - `TradeRepository` with `insert_batch(session: AsyncSession, trades: list[MarketTrade]) -> int`
  - `TickerRepository` with `insert_batch(session: AsyncSession, tickers: list[Ticker]) -> int`

- [ ] **Step 1: Write failing tests for repository upsert logic**

```python
# tests/unit/test_candle_upsert.py
"""Tests for candle upsert domain logic."""
from datetime import datetime, timezone
from decimal import Decimal

from trading.domain.enums import Timeframe
from trading.domain.models import Candle


class TestCandleUpsertLogic:
    """Verify domain-level candle upsert rules."""

    def test_forming_candle_can_be_created(self):
        c = Candle(
            symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("67100.00"),
            low=Decimal("66900.00"), close=Decimal("67050.00"),
            volume=Decimal("500.00"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            is_closed=False,
        )
        assert c.is_closed is False

    def test_closed_candle_is_final(self):
        c = Candle(
            symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("67100.00"),
            low=Decimal("66900.00"), close=Decimal("67050.00"),
            volume=Decimal("500.00"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            is_closed=True,
        )
        assert c.is_closed is True

    def test_candle_to_db_dict(self):
        c = Candle(
            symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("67100.00"),
            low=Decimal("66900.00"), close=Decimal("67050.00"),
            volume=Decimal("500.00"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            is_closed=True,
        )
        d = c.model_dump()
        assert d["symbol"] == "BTC/USDT"
        assert d["timeframe"] == Timeframe.H1
        assert d["is_closed"] is True
        assert isinstance(d["open"], Decimal)
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
uv run pytest tests/unit/test_candle_upsert.py -v
```

Expected: all PASS

- [ ] **Step 3: Implement database connection factory**

```python
# src/trading/persistence/database.py
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine

from trading.config import get_settings


def create_engine() -> AsyncEngine:
    """Create an async SQLAlchemy engine from settings."""
    settings = get_settings()
    return create_async_engine(
        settings.database.url,
        echo=False,
        pool_size=5,
        max_overflow=10,
    )


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker:
    """Create an async session factory bound to the given engine."""
    return async_sessionmaker(engine, expire_on_commit=False)
```

- [ ] **Step 4: Implement SQLAlchemy ORM table definitions**

```python
# src/trading/persistence/models.py
from sqlalchemy import Boolean, Index, Numeric, String, text
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class MarketCandleRow(Base):
    """SQLAlchemy model for the market_candles hypertable."""

    __tablename__ = "market_candles"

    symbol: Mapped[str] = mapped_column(String(20), primary_key=True)
    timeframe: Mapped[str] = mapped_column(String(5), primary_key=True)
    timestamp: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), primary_key=True)
    open: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    high: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    low: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    close: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    volume: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    is_closed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("FALSE"))


class MarketTradeRow(Base):
    """SQLAlchemy model for the market_trades hypertable."""

    __tablename__ = "market_trades"

    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    price: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    amount: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    side: Mapped[str] = mapped_column(String(4), nullable=False)
    exchange_trade_id: Mapped[str] = mapped_column(String(64), nullable=False)

    __table_args__ = (
        Index("idx_market_trades_symbol_ts", "symbol", "timestamp"),
        {"implicit_returning": False},
    )


class MarketTickerSnapshotRow(Base):
    """SQLAlchemy model for the market_ticker_snapshots hypertable."""

    __tablename__ = "market_ticker_snapshots"

    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    bid: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    ask: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    last: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    volume_24h: Mapped[str] = mapped_column(Numeric(20, 8), nullable=False)
    change_24h_pct: Mapped[str] = mapped_column(Numeric(10, 4), nullable=False)

    __table_args__ = (
        Index("idx_ticker_snapshots_symbol_ts", "symbol", "timestamp"),
        {"implicit_returning": False},
    )
```

- [ ] **Step 5: Implement repositories with batch upsert/insert**

```python
# src/trading/persistence/repositories.py
from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from trading.domain.models import Candle, MarketTrade, Ticker
from trading.infrastructure.logging import get_logger

logger = get_logger()


class CandleRepository:
    """Batch upsert candles into the market_candles hypertable."""

    UPSERT_SQL = text("""
        INSERT INTO market_candles
            (symbol, timeframe, timestamp, open, high, low, close, volume, is_closed)
        VALUES
            (:symbol, :timeframe, :timestamp, :open, :high, :low, :close, :volume, :is_closed)
        ON CONFLICT (symbol, timeframe, timestamp)
        DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume,
            is_closed = EXCLUDED.is_closed
        WHERE NOT market_candles.is_closed
    """)

    async def upsert_batch(self, session: AsyncSession, candles: list[Candle]) -> int:
        """Upsert a batch of candles. Returns the number of rows affected."""
        if not candles:
            return 0
        params = [
            {
                "symbol": c.symbol,
                "timeframe": c.timeframe.value if hasattr(c.timeframe, "value") else c.timeframe,
                "timestamp": c.timestamp,
                "open": c.open,
                "high": c.high,
                "low": c.low,
                "close": c.close,
                "volume": c.volume,
                "is_closed": c.is_closed,
            }
            for c in candles
        ]
        result = await session.execute(self.UPSERT_SQL, params)
        count = result.rowcount if result.rowcount and result.rowcount > 0 else len(candles)
        logger.info("upserted_candles", count=count)
        return count


class TradeRepository:
    """Batch insert trades into the market_trades hypertable."""

    INSERT_SQL = text("""
        INSERT INTO market_trades
            (symbol, timestamp, price, amount, side, exchange_trade_id)
        VALUES
            (:symbol, :timestamp, :price, :amount, :side, :exchange_trade_id)
        ON CONFLICT (symbol, exchange_trade_id) DO NOTHING
    """)

    async def insert_batch(self, session: AsyncSession, trades: list[MarketTrade]) -> int:
        """Insert a batch of trades, skipping duplicates. Returns count."""
        if not trades:
            return 0
        params = [
            {
                "symbol": t.symbol,
                "timestamp": t.timestamp,
                "price": t.price,
                "amount": t.amount,
                "side": t.side.value,
                "exchange_trade_id": t.exchange_trade_id,
            }
            for t in trades
        ]
        result = await session.execute(self.INSERT_SQL, params)
        count = result.rowcount if result.rowcount and result.rowcount > 0 else len(trades)
        logger.info("inserted_trades", count=count)
        return count


class TickerRepository:
    """Batch insert ticker snapshots into the market_ticker_snapshots hypertable."""

    INSERT_SQL = text("""
        INSERT INTO market_ticker_snapshots
            (symbol, timestamp, bid, ask, last, volume_24h, change_24h_pct)
        VALUES
            (:symbol, :timestamp, :bid, :ask, :last, :volume_24h, :change_24h_pct)
    """)

    async def insert_batch(self, session: AsyncSession, tickers: list[Ticker]) -> int:
        """Insert a batch of ticker snapshots. Returns count."""
        if not tickers:
            return 0
        params = [
            {
                "symbol": t.symbol,
                "timestamp": t.timestamp,
                "bid": t.bid,
                "ask": t.ask,
                "last": t.last,
                "volume_24h": t.volume_24h,
                "change_24h_pct": t.change_24h_pct,
            }
            for t in tickers
        ]
        result = await session.execute(self.INSERT_SQL, params)
        count = result.rowcount if result.rowcount and result.rowcount > 0 else len(tickers)
        logger.info("inserted_ticker_snapshots", count=count)
        return count
```

- [ ] **Step 6: Verify imports work**

```bash
uv run python -c "
from trading.persistence.database import create_engine, create_session_factory
from trading.persistence.repositories import CandleRepository, TradeRepository, TickerRepository
print('persistence layer imports OK')
"
```

Expected: `persistence layer imports OK`

- [ ] **Step 7: Commit**

```bash
git add src/trading/persistence/ tests/unit/test_candle_upsert.py
git commit -m "feat: persistence layer — database factory, ORM models, batch repositories"
```

---

### Task 5: Market Data Worker (Publisher + Exchange + Health + Backfill + Worker)

**Files:**
- Create: `src/trading/services/market_data/publisher.py`
- Create: `src/trading/infrastructure/exchange.py`
- Create: `src/trading/services/market_data/health.py`
- Create: `src/trading/services/market_data/backfill.py`
- Create: `src/trading/services/market_data/worker.py`
- Create: `scripts/run_market_worker.py`

**Interfaces:**
- Consumes: `StreamPublisher` from `trading.infrastructure.redis`, `StreamNames` from `trading.infrastructure.streams`, `Settings` from `trading.config`, domain models
- Produces:
  - `MarketPublisher` — with `publish_ticker(Ticker)`, `publish_candle(Candle)`, `publish_trade(MarketTrade)`, `publish_orderbook(OrderBook)`
  - `ExchangeAdapter` — with `connect()`, `close()`, `watch_tickers(symbols)`, `watch_ohlcv(symbol, timeframe)`, `watch_trades(symbols)`, `watch_orderbook(symbol, limit)`, `fetch_ohlcv(symbol, timeframe, since)`
  - `HealthTracker` — with `record(stream_key)`, `is_stale(stream_type, timeframe?)`, `get_health_report()`
  - `create_health_app() -> FastAPI`
  - `BackfillManager` — with `run()`
  - `MarketDataWorker` — with `run()`, `shutdown()`

- [ ] **Step 1: Implement `MarketPublisher`**

```python
# src/trading/services/market_data/publisher.py
from __future__ import annotations

from trading.domain.models import Candle, MarketTrade, OrderBook, Ticker
from trading.infrastructure.logging import get_logger
from trading.infrastructure.redis import StreamPublisher
from trading.infrastructure.streams import StreamNames

logger = get_logger()


class MarketPublisher:
    """Publishes normalized market events to Redis Streams."""

    def __init__(self, publisher: StreamPublisher) -> None:
        self._publisher = publisher

    async def publish_ticker(self, ticker: Ticker) -> str:
        stream = StreamNames.ticker(ticker.symbol)
        data = ticker.model_dump(mode="json")
        msg_id = await self._publisher.publish(stream, data)
        logger.debug("published_ticker", symbol=ticker.symbol, stream=stream)
        return msg_id

    async def publish_candle(self, candle: Candle) -> str:
        tf = candle.timeframe.value if hasattr(candle.timeframe, "value") else candle.timeframe
        stream = StreamNames.candle(candle.symbol, tf)
        data = candle.model_dump(mode="json")
        msg_id = await self._publisher.publish(stream, data)
        logger.debug(
            "published_candle",
            symbol=candle.symbol, timeframe=tf,
            is_closed=candle.is_closed, stream=stream,
        )
        return msg_id

    async def publish_trade(self, trade: MarketTrade) -> str:
        stream = StreamNames.trade(trade.symbol)
        data = trade.model_dump(mode="json")
        msg_id = await self._publisher.publish(stream, data)
        logger.debug("published_trade", symbol=trade.symbol, stream=stream)
        return msg_id

    async def publish_orderbook(self, orderbook: OrderBook) -> str:
        stream = StreamNames.orderbook(orderbook.symbol)
        data = orderbook.model_dump(mode="json")
        msg_id = await self._publisher.publish(stream, data)
        logger.debug("published_orderbook", symbol=orderbook.symbol, stream=stream)
        return msg_id
```

- [ ] **Step 2: Implement `ExchangeAdapter`**

```python
# src/trading/infrastructure/exchange.py
from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import ccxt.pro as ccxtpro

from trading.domain.enums import Side, Timeframe
from trading.domain.models import Candle, MarketTrade, OrderBook, OrderBookLevel, Ticker
from trading.infrastructure.logging import get_logger

logger = get_logger()


class ExchangeAdapter:
    """Wraps CCXT Pro exchange with normalized domain model output."""

    def __init__(self, exchange_id: str = "binance") -> None:
        self._exchange_id = exchange_id
        self._exchange: ccxtpro.Exchange | None = None

    async def connect(self) -> None:
        exchange_class = getattr(ccxtpro, self._exchange_id)
        self._exchange = exchange_class({"enableRateLimit": True})
        logger.info("exchange_connected", exchange=self._exchange_id)

    async def close(self) -> None:
        if self._exchange:
            await self._exchange.close()
            logger.info("exchange_closed", exchange=self._exchange_id)

    @property
    def exchange(self) -> ccxtpro.Exchange:
        if self._exchange is None:
            raise RuntimeError("Exchange not connected. Call connect() first.")
        return self._exchange

    async def watch_tickers(self, symbols: list[str]) -> dict[str, Ticker]:
        raw = await self.exchange.watch_tickers(symbols)
        result = {}
        for symbol, data in raw.items():
            if symbol in symbols:
                result[symbol] = self._normalize_ticker(data)
        return result

    async def watch_ohlcv(self, symbol: str, timeframe: str) -> list[Candle]:
        raw = await self.exchange.watch_ohlcv(symbol, timeframe)
        return [self._normalize_candle(symbol, timeframe, row) for row in raw]

    async def watch_trades(self, symbols: list[str]) -> list[MarketTrade]:
        raw = await self.exchange.watch_trades_for_symbols(symbols)
        return [self._normalize_trade(t) for t in raw]

    async def watch_orderbook(self, symbol: str, limit: int = 20) -> OrderBook:
        raw = await self.exchange.watch_order_book(symbol, limit)
        return self._normalize_orderbook(symbol, raw)

    async def fetch_ohlcv(
        self, symbol: str, timeframe: str, since: int | None = None, limit: int = 500
    ) -> list[Candle]:
        raw = await self.exchange.fetch_ohlcv(symbol, timeframe, since=since, limit=limit)
        return [self._normalize_candle(symbol, timeframe, row, is_closed=True) for row in raw]

    def _normalize_ticker(self, data: dict[str, Any]) -> Ticker:
        return Ticker(
            symbol=data["symbol"],
            bid=Decimal(str(data.get("bid", 0) or 0)),
            ask=Decimal(str(data.get("ask", 0) or 0)),
            last=Decimal(str(data.get("last", 0) or 0)),
            volume_24h=Decimal(str(data.get("baseVolume", 0) or 0)),
            change_24h_pct=Decimal(str(data.get("percentage", 0) or 0)),
            timestamp=datetime.fromtimestamp(
                (data.get("timestamp") or 0) / 1000, tz=timezone.utc
            ),
        )

    def _normalize_candle(
        self, symbol: str, timeframe: str, row: list,
        is_closed: bool | None = None,
    ) -> Candle:
        ts_ms = row[0]
        candle_open_time = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
        if is_closed is None:
            tf_enum = Timeframe(timeframe)
            duration = tf_enum.duration_seconds()
            candle_close_time_ms = ts_ms + (duration * 1000)
            now_ms = int(datetime.now(tz=timezone.utc).timestamp() * 1000)
            is_closed = candle_close_time_ms <= now_ms
        return Candle(
            symbol=symbol, timeframe=Timeframe(timeframe),
            open=Decimal(str(row[1])), high=Decimal(str(row[2])),
            low=Decimal(str(row[3])), close=Decimal(str(row[4])),
            volume=Decimal(str(row[5])), timestamp=candle_open_time,
            is_closed=is_closed,
        )

    def _normalize_trade(self, data: dict[str, Any]) -> MarketTrade:
        return MarketTrade(
            symbol=data["symbol"],
            price=Decimal(str(data["price"])),
            amount=Decimal(str(data["amount"])),
            side=Side(data["side"]),
            timestamp=datetime.fromtimestamp(
                (data.get("timestamp") or 0) / 1000, tz=timezone.utc
            ),
            exchange_trade_id=str(data["id"]),
        )

    def _normalize_orderbook(self, symbol: str, data: dict[str, Any]) -> OrderBook:
        return OrderBook(
            symbol=symbol,
            bids=[OrderBookLevel(price=Decimal(str(b[0])), amount=Decimal(str(b[1])))
                  for b in data.get("bids", [])],
            asks=[OrderBookLevel(price=Decimal(str(a[0])), amount=Decimal(str(a[1])))
                  for a in data.get("asks", [])],
            timestamp=datetime.fromtimestamp(
                (data.get("timestamp") or 0) / 1000, tz=timezone.utc
            ),
        )
```

- [ ] **Step 3: Implement `HealthTracker` and FastAPI health app**

```python
# src/trading/services/market_data/health.py
from __future__ import annotations

import time
from typing import Any

from fastapi import FastAPI

from trading.config import StaleThresholds, get_settings
from trading.infrastructure.logging import get_logger

logger = get_logger()


class HealthTracker:
    """Tracks last-received timestamps per stream for staleness detection."""

    def __init__(self, thresholds: StaleThresholds | None = None) -> None:
        self._thresholds = thresholds or get_settings().stale_thresholds
        self._last_received: dict[str, float] = {}

    def record(self, stream_key: str) -> None:
        self._last_received[stream_key] = time.time()

    def is_stale(self, stream_type: str, timeframe: str | None = None) -> bool:
        threshold = self._get_threshold(stream_type, timeframe)
        matching = [
            ts for key, ts in self._last_received.items()
            if key.startswith(f"{stream_type}:")
        ]
        if not matching:
            return True
        latest = max(matching)
        return (time.time() - latest) > threshold

    def get_health_report(self) -> dict[str, Any]:
        now = time.time()
        streams: dict[str, Any] = {}
        for key, last_ts in self._last_received.items():
            parts = key.split(":")
            stream_type = parts[0] if parts else "unknown"
            timeframe = parts[2] if len(parts) > 2 else None
            threshold = self._get_threshold(stream_type, timeframe)
            age = now - last_ts
            streams[key] = {
                "last_received_ago_seconds": round(age, 1),
                "stale": age > threshold,
                "threshold_seconds": threshold,
            }
        all_healthy = all(not s["stale"] for s in streams.values())
        return {"status": "healthy" if all_healthy else "degraded", "streams": streams}

    def _get_threshold(self, stream_type: str, timeframe: str | None = None) -> int:
        if stream_type == "ticker":
            return self._thresholds.ticker_seconds
        elif stream_type == "trade":
            return self._thresholds.trades_seconds
        elif stream_type == "orderbook":
            return self._thresholds.orderbook_seconds
        elif stream_type == "candle" and timeframe:
            return self._thresholds.for_candle_timeframe(timeframe)
        return self._thresholds.ticker_seconds


_health_tracker: HealthTracker | None = None


def set_health_tracker(tracker: HealthTracker) -> None:
    global _health_tracker
    _health_tracker = tracker


def create_health_app() -> FastAPI:
    app = FastAPI(title="Market Data Health", docs_url=None, redoc_url=None)

    @app.get("/health")
    async def health():
        if _health_tracker is None:
            return {"status": "starting", "streams": {}}
        return _health_tracker.get_health_report()

    return app
```

- [ ] **Step 4: Implement `BackfillManager`**

```python
# src/trading/services/market_data/backfill.py
from __future__ import annotations

from datetime import datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker

from trading.config import get_settings
from trading.infrastructure.exchange import ExchangeAdapter
from trading.infrastructure.logging import get_logger
from trading.persistence.repositories import CandleRepository

logger = get_logger()


class BackfillManager:
    """Recovers candle gaps on startup by fetching historical data via REST."""

    def __init__(self, session_factory: async_sessionmaker, exchange: ExchangeAdapter) -> None:
        self._session_factory = session_factory
        self._exchange = exchange
        self._candle_repo = CandleRepository()

    async def run(self) -> None:
        settings = get_settings()
        for symbol in settings.market_data.symbols:
            for timeframe in settings.market_data.timeframes:
                await self._backfill_pair(symbol, timeframe)

    async def _backfill_pair(self, symbol: str, timeframe: str) -> None:
        async with self._session_factory() as session:
            result = await session.execute(
                text("""
                    SELECT MAX(timestamp) FROM market_candles
                    WHERE symbol = :symbol AND timeframe = :timeframe AND is_closed = TRUE
                """),
                {"symbol": symbol, "timeframe": timeframe},
            )
            row = result.scalar()

        if row is None:
            logger.info("backfill_no_history", symbol=symbol, timeframe=timeframe)
            since = None
        else:
            last_ts: datetime = row
            since = int(last_ts.timestamp() * 1000)
            logger.info("backfill_from_timestamp", symbol=symbol, timeframe=timeframe,
                        since=last_ts.isoformat())

        candles = await self._exchange.fetch_ohlcv(symbol, timeframe, since=since)
        if not candles:
            logger.info("backfill_no_new_candles", symbol=symbol, timeframe=timeframe)
            return

        async with self._session_factory() as session:
            count = await self._candle_repo.upsert_batch(session, candles)
            await session.commit()

        logger.info("backfill_complete", symbol=symbol, timeframe=timeframe,
                     candles_written=count)
```

- [ ] **Step 5: Implement `MarketDataWorker`**

```python
# src/trading/services/market_data/worker.py
from __future__ import annotations

import asyncio

from trading.config import get_settings
from trading.infrastructure.exchange import ExchangeAdapter
from trading.infrastructure.logging import get_logger
from trading.infrastructure.redis import StreamPublisher, create_redis
from trading.persistence.database import create_engine, create_session_factory
from trading.services.market_data.backfill import BackfillManager
from trading.services.market_data.health import HealthTracker, set_health_tracker
from trading.services.market_data.publisher import MarketPublisher

logger = get_logger()


class MarketDataWorker:
    """Main market data worker — subscribes to Binance via CCXT Pro, publishes to Redis."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._exchange = ExchangeAdapter(self._settings.market_data.exchange)
        self._health = HealthTracker(self._settings.stale_thresholds)
        self._running = True

    async def run(self) -> None:
        set_health_tracker(self._health)
        await self._exchange.connect()
        redis = await create_redis()
        stream_pub = StreamPublisher(redis, maxlen=self._settings.market_data.stream_maxlen)
        publisher = MarketPublisher(stream_pub)

        engine = create_engine()
        session_factory = create_session_factory(engine)
        backfill = BackfillManager(session_factory, self._exchange)
        logger.info("starting_backfill")
        await backfill.run()
        logger.info("backfill_complete")
        await engine.dispose()

        symbols = self._settings.market_data.symbols
        timeframes = self._settings.market_data.timeframes
        depth = self._settings.market_data.orderbook_depth

        tasks = [
            asyncio.create_task(self._ticker_loop(publisher, symbols), name="ticker"),
            asyncio.create_task(self._trades_loop(publisher, symbols), name="trades"),
        ]
        for symbol in symbols:
            for tf in timeframes:
                tasks.append(asyncio.create_task(
                    self._ohlcv_loop(publisher, symbol, tf), name=f"ohlcv:{symbol}:{tf}"))
        for symbol in symbols:
            tasks.append(asyncio.create_task(
                self._orderbook_loop(publisher, symbol, depth), name=f"orderbook:{symbol}"))

        logger.info("subscription_tasks_started", task_count=len(tasks),
                     symbols=symbols, timeframes=timeframes)

        while self._running:
            done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
            for task in done:
                name = task.get_name()
                if task.exception():
                    logger.error("task_failed", task=name, error=str(task.exception()))
                    tasks.remove(task)
                    new = await self._restart_task(name, publisher, symbols, timeframes, depth)
                    if new:
                        tasks.append(new)
                else:
                    logger.warning("task_completed_unexpectedly", task=name)

    async def _restart_task(self, name, publisher, symbols, timeframes, depth):
        await asyncio.sleep(5)
        logger.info("restarting_task", task=name)
        if name == "ticker":
            return asyncio.create_task(self._ticker_loop(publisher, symbols), name="ticker")
        elif name == "trades":
            return asyncio.create_task(self._trades_loop(publisher, symbols), name="trades")
        elif name.startswith("ohlcv:"):
            _, symbol, tf = name.split(":")
            return asyncio.create_task(self._ohlcv_loop(publisher, symbol, tf), name=name)
        elif name.startswith("orderbook:"):
            _, symbol = name.split(":")
            return asyncio.create_task(self._orderbook_loop(publisher, symbol, depth), name=name)
        return None

    async def _ticker_loop(self, publisher, symbols):
        while self._running:
            tickers = await self._exchange.watch_tickers(symbols)
            for symbol, ticker in tickers.items():
                await publisher.publish_ticker(ticker)
                self._health.record(f"ticker:{symbol}")

    async def _ohlcv_loop(self, publisher, symbol, timeframe):
        while self._running:
            candles = await self._exchange.watch_ohlcv(symbol, timeframe)
            for candle in candles:
                await publisher.publish_candle(candle)
                self._health.record(f"candle:{symbol}:{timeframe}")

    async def _trades_loop(self, publisher, symbols):
        while self._running:
            trades = await self._exchange.watch_trades(symbols)
            for trade in trades:
                await publisher.publish_trade(trade)
                self._health.record(f"trade:{trade.symbol}")

    async def _orderbook_loop(self, publisher, symbol, limit):
        while self._running:
            orderbook = await self._exchange.watch_orderbook(symbol, limit)
            await publisher.publish_orderbook(orderbook)
            self._health.record(f"orderbook:{symbol}")

    async def shutdown(self) -> None:
        self._running = False
        await self._exchange.close()
        logger.info("market_data_worker_shutdown")
```

- [ ] **Step 6: Create entry point script**

```python
# scripts/run_market_worker.py
"""Entry point for the Market Data Worker."""
import asyncio
import signal
import threading

import uvicorn

from trading.infrastructure.logging import configure_logging
from trading.services.market_data.health import create_health_app
from trading.services.market_data.worker import MarketDataWorker


def main() -> None:
    configure_logging("market-data-worker")
    worker = MarketDataWorker()

    health_app = create_health_app()
    health_server = threading.Thread(
        target=uvicorn.run,
        args=(health_app,),
        kwargs={"host": "0.0.0.0", "port": 8081, "log_level": "warning"},
        daemon=True,
    )
    health_server.start()

    loop = asyncio.new_event_loop()

    def handle_signal():
        loop.create_task(worker.shutdown())

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, handle_signal)

    try:
        loop.run_until_complete(worker.run())
    finally:
        loop.close()


if __name__ == "__main__":
    main()
```

- [ ] **Step 7: Verify import chain**

```bash
uv run python -c "
from trading.services.market_data.worker import MarketDataWorker
from trading.services.market_data.publisher import MarketPublisher
from trading.services.market_data.health import create_health_app
from trading.services.market_data.backfill import BackfillManager
from trading.infrastructure.exchange import ExchangeAdapter
print('all market data imports OK')
"
```

Expected: `all market data imports OK`

- [ ] **Step 8: Commit**

```bash
git add src/trading/services/ src/trading/infrastructure/exchange.py scripts/run_market_worker.py
git commit -m "feat: market data worker — CCXT Pro subscriptions, publisher, health, backfill"
```

---

### Task 6: Persistence Worker

**Files:**
- Create: `src/trading/persistence/worker.py`
- Create: `scripts/run_persistence_worker.py`

**Interfaces:**
- Consumes: `StreamConsumer` from `trading.infrastructure.redis`, `CandleRepository`, `TradeRepository`, `TickerRepository` from `trading.persistence.repositories`, `StreamNames` from `trading.infrastructure.streams`, `Settings` from `trading.config`
- Produces:
  - `PersistenceWorker` with `run() -> None`, `shutdown() -> None`

- [ ] **Step 1: Implement `PersistenceWorker`**

```python
# src/trading/persistence/worker.py
from __future__ import annotations

import asyncio
import time
from typing import Any

from trading.config import get_settings
from trading.domain.models import Candle, MarketTrade, Ticker
from trading.infrastructure.logging import get_logger
from trading.infrastructure.redis import StreamConsumer, create_redis
from trading.infrastructure.streams import StreamNames
from trading.persistence.database import create_engine, create_session_factory
from trading.persistence.repositories import CandleRepository, TickerRepository, TradeRepository

logger = get_logger()


class PersistenceWorker:
    """Consumes market events from Redis Streams and writes them to TimescaleDB."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._candle_repo = CandleRepository()
        self._trade_repo = TradeRepository()
        self._ticker_repo = TickerRepository()
        self._running = True

    async def run(self) -> None:
        engine = create_engine()
        session_factory = create_session_factory(engine)
        redis = await create_redis()
        consumer = StreamConsumer(redis)

        symbols = self._settings.market_data.symbols
        timeframes = self._settings.market_data.timeframes
        group = self._settings.persistence.consumer_group
        consumer_name = self._settings.persistence.consumer_name

        streams: list[str] = []
        for symbol in symbols:
            streams.append(StreamNames.ticker(symbol))
            streams.append(StreamNames.trade(symbol))
            for tf in timeframes:
                streams.append(StreamNames.candle(symbol, tf))

        for stream in streams:
            await consumer.ensure_group(stream, group)

        logger.info("persistence_worker_started", streams=streams, group=group,
                     consumer=consumer_name)

        batch_candles: list[Candle] = []
        batch_trades: list[MarketTrade] = []
        batch_tickers: list[Ticker] = []
        pending_acks: list[tuple[str, str]] = []
        last_flush = time.time()

        while self._running:
            messages = await consumer.consume(
                streams=streams, group=group, consumer=consumer_name,
                count=self._settings.persistence.batch_max_size,
                block_ms=int(self._settings.persistence.batch_max_wait_seconds * 1000),
            )

            for stream_name, message_id, data in messages:
                self._classify_and_buffer(
                    stream_name, data, batch_candles, batch_trades, batch_tickers)
                pending_acks.append((stream_name, message_id))

            total = len(batch_candles) + len(batch_trades) + len(batch_tickers)
            elapsed = time.time() - last_flush

            if total >= self._settings.persistence.batch_max_size or (
                total > 0 and elapsed >= self._settings.persistence.batch_max_wait_seconds
            ):
                try:
                    async with session_factory() as session:
                        if batch_candles:
                            await self._candle_repo.upsert_batch(session, batch_candles)
                        if batch_trades:
                            await self._trade_repo.insert_batch(session, batch_trades)
                        if batch_tickers:
                            await self._ticker_repo.insert_batch(session, batch_tickers)
                        await session.commit()

                    for sn, mid in pending_acks:
                        await consumer.ack(sn, group, mid)

                    logger.info("batch_flushed", candles=len(batch_candles),
                                trades=len(batch_trades), tickers=len(batch_tickers))

                    batch_candles.clear()
                    batch_trades.clear()
                    batch_tickers.clear()
                    pending_acks.clear()
                    last_flush = time.time()

                except Exception:
                    logger.exception("batch_flush_failed")
                    await asyncio.sleep(5)

        await engine.dispose()
        await redis.close()

    def _classify_and_buffer(self, stream_name, data, candles, trades, tickers):
        try:
            if ":candle:" in stream_name:
                candles.append(Candle.model_validate(data))
            elif ":trade:" in stream_name:
                trades.append(MarketTrade.model_validate(data))
            elif ":ticker:" in stream_name:
                tickers.append(Ticker.model_validate(data))
        except Exception:
            logger.exception("message_parse_failed", stream=stream_name,
                             data=str(data)[:200])

    async def shutdown(self) -> None:
        self._running = False
        logger.info("persistence_worker_shutting_down")
```

- [ ] **Step 2: Create entry point script**

```python
# scripts/run_persistence_worker.py
"""Entry point for the Persistence Worker."""
import asyncio
import signal

from trading.infrastructure.logging import configure_logging
from trading.persistence.worker import PersistenceWorker


def main() -> None:
    configure_logging("persistence-worker")
    worker = PersistenceWorker()

    loop = asyncio.new_event_loop()

    def handle_signal():
        loop.create_task(worker.shutdown())

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, handle_signal)

    try:
        loop.run_until_complete(worker.run())
    finally:
        loop.close()


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Verify imports**

```bash
uv run python -c "
from trading.persistence.worker import PersistenceWorker
print('persistence worker imports OK')
"
```

Expected: `persistence worker imports OK`

- [ ] **Step 4: Commit**

```bash
git add src/trading/persistence/worker.py scripts/run_persistence_worker.py
git commit -m "feat: persistence worker — Redis consumer with batched TimescaleDB writes"
```

---

### Task 7: Integration Tests (Redis Streams + TimescaleDB)

**Files:**
- Create: `tests/conftest.py`
- Create: `tests/integration/conftest.py`
- Create: `tests/integration/test_redis_streams.py`
- Create: `tests/integration/test_timescaledb_persistence.py`

**Interfaces:**
- Consumes: `StreamPublisher`, `StreamConsumer` from `trading.infrastructure.redis`, repositories, domain models
- Produces: passing integration tests

> **Prerequisite:** Docker Compose must be running (`docker compose up -d`).

- [ ] **Step 1: Create shared test conftest**

```python
# tests/conftest.py
"""Shared pytest configuration."""
import pytest


def pytest_collection_modifyitems(config, items):
    for item in items:
        if "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
```

- [ ] **Step 2: Create integration test fixtures**

```python
# tests/integration/conftest.py
"""Fixtures for integration tests. Requires Docker Compose running."""
import pytest
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine


@pytest.fixture
async def redis_client():
    client = aioredis.from_url("redis://localhost:6379", decode_responses=True)
    yield client
    await client.flushdb()
    await client.close()


@pytest.fixture
async def db_engine():
    engine = create_async_engine(
        "postgresql+asyncpg://trading:trading_dev@localhost:5432/trading", echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture
async def db_session(db_engine: AsyncEngine):
    factory = async_sessionmaker(db_engine, expire_on_commit=False)
    async with factory() as session:
        yield session
        await session.rollback()
```

- [ ] **Step 3: Write Redis Streams integration tests**

```python
# tests/integration/test_redis_streams.py
"""Integration tests for Redis Stream publish/consume."""
import pytest

from trading.infrastructure.redis import StreamConsumer, StreamPublisher


@pytest.mark.integration
class TestRedisStreams:
    async def test_publish_and_consume_roundtrip(self, redis_client):
        stream = "test:roundtrip"
        group = "test-group"
        publisher = StreamPublisher(redis_client, maxlen=1000)
        consumer = StreamConsumer(redis_client)
        await consumer.ensure_group(stream, group)

        data = {"symbol": "BTC/USDT", "price": "67000.00", "side": "buy"}
        msg_id = await publisher.publish(stream, data)
        assert msg_id is not None

        messages = await consumer.consume([stream], group, "test-consumer-1", count=10, block_ms=1000)
        assert len(messages) == 1
        recv_stream, recv_id, recv_data = messages[0]
        assert recv_stream == stream
        assert recv_data["symbol"] == "BTC/USDT"

        await consumer.ack(stream, group, recv_id)

    async def test_consumer_group_independence(self, redis_client):
        stream = "test:groups"
        publisher = StreamPublisher(redis_client, maxlen=1000)
        consumer = StreamConsumer(redis_client)
        await consumer.ensure_group(stream, "group-a")
        await consumer.ensure_group(stream, "group-b")

        await publisher.publish(stream, {"value": "shared"})

        msgs_a = await consumer.consume([stream], "group-a", "consumer-a", count=10, block_ms=500)
        msgs_b = await consumer.consume([stream], "group-b", "consumer-b", count=10, block_ms=500)
        assert len(msgs_a) == 1
        assert len(msgs_b) == 1

    async def test_maxlen_trimming(self, redis_client):
        stream = "test:maxlen"
        publisher = StreamPublisher(redis_client, maxlen=10)
        for i in range(50):
            await publisher.publish(stream, {"i": str(i)})
        length = await redis_client.xlen(stream)
        assert length <= 20
```

- [ ] **Step 4: Run Redis tests**

```bash
uv run pytest tests/integration/test_redis_streams.py -v -m integration
```

Expected: all PASS

- [ ] **Step 5: Write TimescaleDB persistence integration tests**

```python
# tests/integration/test_timescaledb_persistence.py
"""Integration tests for TimescaleDB persistence."""
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from sqlalchemy import text

from trading.domain.enums import Side, Timeframe
from trading.domain.models import Candle, MarketTrade, Ticker
from trading.persistence.repositories import CandleRepository, TickerRepository, TradeRepository


@pytest.mark.integration
class TestCandlePersistence:
    async def test_insert_candle(self, db_session):
        repo = CandleRepository()
        candle = Candle(
            symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("67100.00"),
            low=Decimal("66900.00"), close=Decimal("67050.00"),
            volume=Decimal("500.00"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            is_closed=False,
        )
        await repo.upsert_batch(db_session, [candle])
        await db_session.commit()
        result = await db_session.execute(
            text("SELECT * FROM market_candles WHERE symbol = 'BTC/USDT' AND timeframe = '1h'"))
        assert len(result.fetchall()) >= 1

    async def test_forming_candle_can_be_updated(self, db_session):
        repo = CandleRepository()
        ts = datetime(2026, 8, 13, 14, 0, 0, tzinfo=timezone.utc)
        candle_v1 = Candle(symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("67100.00"),
            low=Decimal("66900.00"), close=Decimal("67050.00"),
            volume=Decimal("500.00"), timestamp=ts, is_closed=False)
        await repo.upsert_batch(db_session, [candle_v1])
        await db_session.commit()

        candle_v2 = Candle(symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("67200.00"),
            low=Decimal("66800.00"), close=Decimal("67150.00"),
            volume=Decimal("750.00"), timestamp=ts, is_closed=False)
        await repo.upsert_batch(db_session, [candle_v2])
        await db_session.commit()

        result = await db_session.execute(text("""
            SELECT high, volume FROM market_candles
            WHERE symbol = 'BTC/USDT' AND timeframe = '1h' AND timestamp = :ts
        """), {"ts": ts})
        row = result.fetchone()
        assert row is not None
        assert float(row[0]) == pytest.approx(67200.00)
        assert float(row[1]) == pytest.approx(750.00)

    async def test_closed_candle_not_overwritten(self, db_session):
        repo = CandleRepository()
        ts = datetime(2026, 8, 13, 15, 0, 0, tzinfo=timezone.utc)
        closed = Candle(symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("67100.00"),
            low=Decimal("66900.00"), close=Decimal("67050.00"),
            volume=Decimal("500.00"), timestamp=ts, is_closed=True)
        await repo.upsert_batch(db_session, [closed])
        await db_session.commit()

        attempt = Candle(symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("67000.00"), high=Decimal("99999.00"),
            low=Decimal("66800.00"), close=Decimal("67150.00"),
            volume=Decimal("999.00"), timestamp=ts, is_closed=False)
        await repo.upsert_batch(db_session, [attempt])
        await db_session.commit()

        result = await db_session.execute(text("""
            SELECT high, volume, is_closed FROM market_candles
            WHERE symbol = 'BTC/USDT' AND timeframe = '1h' AND timestamp = :ts
        """), {"ts": ts})
        row = result.fetchone()
        assert float(row[0]) == pytest.approx(67100.00)
        assert float(row[1]) == pytest.approx(500.00)
        assert row[2] is True


@pytest.mark.integration
class TestTradePersistence:
    async def test_insert_trade(self, db_session):
        repo = TradeRepository()
        trade = MarketTrade(symbol="BTC/USDT", price=Decimal("67000.00"),
            amount=Decimal("0.5"), side=Side.BUY,
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            exchange_trade_id="test-trade-001")
        await repo.insert_batch(db_session, [trade])
        await db_session.commit()
        result = await db_session.execute(
            text("SELECT * FROM market_trades WHERE exchange_trade_id = 'test-trade-001'"))
        assert len(result.fetchall()) == 1

    async def test_duplicate_trade_ignored(self, db_session):
        repo = TradeRepository()
        trade = MarketTrade(symbol="BTC/USDT", price=Decimal("67000.00"),
            amount=Decimal("0.5"), side=Side.BUY,
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc),
            exchange_trade_id="test-trade-dup")
        await repo.insert_batch(db_session, [trade])
        await db_session.commit()
        await repo.insert_batch(db_session, [trade])
        await db_session.commit()
        result = await db_session.execute(
            text("SELECT COUNT(*) FROM market_trades WHERE exchange_trade_id = 'test-trade-dup'"))
        assert result.scalar() == 1


@pytest.mark.integration
class TestTickerPersistence:
    async def test_insert_ticker_snapshot(self, db_session):
        repo = TickerRepository()
        ticker = Ticker(symbol="ETH/USDT", bid=Decimal("3500.00"), ask=Decimal("3501.00"),
            last=Decimal("3500.50"), volume_24h=Decimal("50000.00"),
            change_24h_pct=Decimal("1.50"),
            timestamp=datetime(2026, 8, 13, 12, 0, 0, tzinfo=timezone.utc))
        await repo.insert_batch(db_session, [ticker])
        await db_session.commit()
        result = await db_session.execute(
            text("SELECT * FROM market_ticker_snapshots WHERE symbol = 'ETH/USDT'"))
        assert len(result.fetchall()) >= 1
```

- [ ] **Step 6: Run TimescaleDB tests**

```bash
uv run pytest tests/integration/test_timescaledb_persistence.py -v -m integration
```

Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add tests/
git commit -m "test: integration tests for Redis Streams and TimescaleDB persistence"
```

---

### Task 8: End-to-End Pipeline Test + Smoke Test

**Files:**
- Create: `tests/integration/test_market_pipeline_e2e.py`

**Interfaces:**
- Consumes: everything from Tasks 2-6
- Produces: passing E2E test verifying the full pipeline

- [ ] **Step 1: Write E2E pipeline test**

```python
# tests/integration/test_market_pipeline_e2e.py
"""End-to-end: domain model → Redis Stream → consume → TimescaleDB row."""
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker

from trading.domain.enums import Side, Timeframe
from trading.domain.models import Candle, MarketTrade, Ticker
from trading.infrastructure.redis import StreamConsumer, StreamPublisher
from trading.infrastructure.streams import StreamNames
from trading.persistence.repositories import CandleRepository, TickerRepository, TradeRepository


@pytest.mark.integration
class TestMarketPipelineE2E:

    async def test_candle_pipeline(self, redis_client, db_engine: AsyncEngine):
        session_factory = async_sessionmaker(db_engine, expire_on_commit=False)
        publisher = StreamPublisher(redis_client, maxlen=1000)
        consumer = StreamConsumer(redis_client)
        repo = CandleRepository()

        stream = StreamNames.candle("BTC/USDT", "1h")
        group = "e2e-test-candle"
        await consumer.ensure_group(stream, group)

        candle = Candle(symbol="BTC/USDT", timeframe=Timeframe.H1,
            open=Decimal("68000.00"), high=Decimal("68500.00"),
            low=Decimal("67800.00"), close=Decimal("68200.00"),
            volume=Decimal("1234.56"),
            timestamp=datetime(2026, 8, 13, 16, 0, 0, tzinfo=timezone.utc),
            is_closed=True)
        await publisher.publish(stream, candle.model_dump(mode="json"))

        messages = await consumer.consume([stream], group, "e2e", count=10, block_ms=2000)
        assert len(messages) == 1
        _, msg_id, data = messages[0]
        parsed = Candle.model_validate(data)

        async with session_factory() as session:
            await repo.upsert_batch(session, [parsed])
            await session.commit()
        await consumer.ack(stream, group, msg_id)

        async with session_factory() as session:
            result = await session.execute(text("""
                SELECT close, is_closed FROM market_candles
                WHERE symbol = 'BTC/USDT' AND timeframe = '1h' AND timestamp = :ts
            """), {"ts": candle.timestamp})
            row = result.fetchone()
            assert row is not None
            assert float(row[0]) == pytest.approx(68200.00)
            assert row[1] is True

    async def test_trade_pipeline(self, redis_client, db_engine: AsyncEngine):
        session_factory = async_sessionmaker(db_engine, expire_on_commit=False)
        publisher = StreamPublisher(redis_client, maxlen=1000)
        consumer = StreamConsumer(redis_client)
        repo = TradeRepository()

        stream = StreamNames.trade("ETH/USDT")
        group = "e2e-test-trade"
        await consumer.ensure_group(stream, group)

        trade = MarketTrade(symbol="ETH/USDT", price=Decimal("3600.00"),
            amount=Decimal("2.5"), side=Side.SELL,
            timestamp=datetime(2026, 8, 13, 16, 30, 0, tzinfo=timezone.utc),
            exchange_trade_id="e2e-trade-001")
        await publisher.publish(stream, trade.model_dump(mode="json"))

        messages = await consumer.consume([stream], group, "e2e", count=10, block_ms=2000)
        assert len(messages) == 1
        _, msg_id, data = messages[0]
        parsed = MarketTrade.model_validate(data)

        async with session_factory() as session:
            await repo.insert_batch(session, [parsed])
            await session.commit()
        await consumer.ack(stream, group, msg_id)

        async with session_factory() as session:
            result = await session.execute(text(
                "SELECT price, side FROM market_trades WHERE exchange_trade_id = 'e2e-trade-001'"))
            row = result.fetchone()
            assert float(row[0]) == pytest.approx(3600.00)
            assert row[1] == "sell"

    async def test_ticker_pipeline(self, redis_client, db_engine: AsyncEngine):
        session_factory = async_sessionmaker(db_engine, expire_on_commit=False)
        publisher = StreamPublisher(redis_client, maxlen=1000)
        consumer = StreamConsumer(redis_client)
        repo = TickerRepository()

        stream = StreamNames.ticker("BTC/USDT")
        group = "e2e-test-ticker"
        await consumer.ensure_group(stream, group)

        ticker = Ticker(symbol="BTC/USDT", bid=Decimal("68100.00"),
            ask=Decimal("68101.50"), last=Decimal("68100.75"),
            volume_24h=Decimal("15000.00"), change_24h_pct=Decimal("3.21"),
            timestamp=datetime(2026, 8, 13, 16, 45, 0, tzinfo=timezone.utc))
        await publisher.publish(stream, ticker.model_dump(mode="json"))

        messages = await consumer.consume([stream], group, "e2e", count=10, block_ms=2000)
        assert len(messages) == 1
        _, msg_id, data = messages[0]
        parsed = Ticker.model_validate(data)

        async with session_factory() as session:
            await repo.insert_batch(session, [parsed])
            await session.commit()
        await consumer.ack(stream, group, msg_id)

        async with session_factory() as session:
            result = await session.execute(text("""
                SELECT last, change_24h_pct FROM market_ticker_snapshots
                WHERE symbol = 'BTC/USDT' ORDER BY timestamp DESC LIMIT 1
            """))
            row = result.fetchone()
            assert float(row[0]) == pytest.approx(68100.75)
            assert float(row[1]) == pytest.approx(3.21)
```

- [ ] **Step 2: Run the E2E test**

```bash
uv run pytest tests/integration/test_market_pipeline_e2e.py -v -m integration
```

Expected: all 3 tests PASS

- [ ] **Step 3: Run the full test suite**

```bash
uv run pytest tests/ -v
```

Expected: all unit and integration tests PASS

- [ ] **Step 4: Commit**

```bash
git add tests/integration/test_market_pipeline_e2e.py
git commit -m "test: end-to-end pipeline test — Redis → persistence → TimescaleDB verified"
```

- [ ] **Step 5: Manual smoke test — start workers against live Binance**

Start Docker Compose and both workers:

```bash
# Terminal 1
docker compose up -d

# Terminal 2
uv run python scripts/run_market_worker.py

# Terminal 3
uv run python scripts/run_persistence_worker.py
```

After ~30 seconds, verify:

```bash
# Check health
curl http://localhost:8081/health | python -m json.tool

# Check Redis streams
docker compose exec redis redis-cli XLEN market:ticker:BTC/USDT
docker compose exec redis redis-cli XLEN market:candle:BTC/USDT:1h

# Check TimescaleDB
docker compose exec postgres psql -U trading -d trading \
    -c "SELECT COUNT(*) FROM market_candles;"
docker compose exec postgres psql -U trading -d trading \
    -c "SELECT symbol, timeframe, timestamp, close, is_closed FROM market_candles ORDER BY timestamp DESC LIMIT 5;"
docker compose exec postgres psql -U trading -d trading \
    -c "SELECT COUNT(*) FROM market_trades;"
docker compose exec postgres psql -U trading -d trading \
    -c "SELECT COUNT(*) FROM market_ticker_snapshots;"
```

Expected: candle rows appearing, trade rows growing, ticker snapshots accumulating, health endpoint showing `"status": "healthy"`.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: Slice 1 complete — Market Data + Storage pipeline operational"
```
