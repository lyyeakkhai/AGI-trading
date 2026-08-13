# Market Data + Storage — Design Spec (Slice 1)

**Status:** Approved  
**Date:** August 13, 2026  
**Slice:** 1 of ~10 (Market Data + Storage)  
**PRD Reference:** [prd.md](../../product/prd.md) — Sections 25–27, 45–52, 58, 70, 77  
**Approach:** CCXT Pro WebSocket Worker + Redis Streams + TimescaleDB  

---

## 1. Purpose

Build the foundational data layer that every future slice depends on: ingest live BTC/USDT and ETH/USDT market data from Binance, distribute events via Redis Streams, and persist to TimescaleDB for analytics and backtesting.

This slice answers: *Can the platform reliably receive, distribute, and store market data with no gaps?*

---

## 2. Scope

### In scope

- CCXT Pro WebSocket subscriptions (ticker, OHLCV, trades, order book) for BTC/USDT and ETH/USDT
- Pydantic domain models for all market data types
- Redis Streams as the event distribution layer
- TimescaleDB hypertables for candles, trades, and ticker snapshots
- Persistence worker with batched upserts and deduplication
- Historical candle backfill via CCXT REST on worker startup
- Health monitoring with per-stream-type staleness thresholds
- Structured JSON logging
- Automatic WebSocket reconnection
- Docker Compose for local development (TimescaleDB, Redis)
- Alembic migration for initial schema
- Unit and integration tests including an end-to-end pipeline test

### Out of scope

- Analytics / indicators (Slice 2)
- Portfolio accounting (Slice 2)
- Risk engine (Slice 3)
- Backtesting (Slice 4)
- API endpoints beyond `/health` (Slice 3+)
- Authenticated Binance calls
- Raw order-book persistence (live state in Redis only; deferred to later)
- Dashboard UI
- VPS deployment (local development only)

---

## 3. Architecture

```text
Binance
   │
   │  WebSocket (public, unauthenticated)
   ▼
┌────────────────────────────────────────────────┐
│           Market Data Worker (async)            │
│                                                 │
│  CCXT Pro Exchange Adapter                      │
│    watchTickerForSymbols()                       │
│    watchOHLCVForSymbols()                        │
│    watchTradesForSymbols()                       │
│    watchOrderBookForSymbols()                    │
│                                                 │
│  Normalizer → Pydantic domain models            │
│  Publisher  → Redis Streams (XADD)              │
│  Health     → per-stream staleness tracking      │
│  Backfill   → CCXT REST fetchOHLCV (on startup) │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
            Redis Streams
          (consumer groups)
                   │
        ┌──────────┼──────────┐
        ▼                     ▼
  Persistence            (Future:
    Worker              Analytics,
        │              Opportunity
        ▼              Detector)
   TimescaleDB
```

### Data flow

1. CCXT Pro receives WebSocket events from Binance
2. Worker normalizes raw dicts into validated Pydantic models
3. Serialized models published to Redis Streams via `XADD`
4. Persistence worker consumes from its consumer group, batches events, writes to TimescaleDB
5. On successful write, `XACK` acknowledges messages
6. On startup, backfill manager queries TimescaleDB for the latest candle per symbol/timeframe, fetches missing candles via REST, and writes directly to TimescaleDB

---

## 4. Domain Models

All domain models are pure Pydantic `BaseModel` subclasses with no I/O dependencies.

### Enums

```python
class Timeframe(str, Enum):
    M15 = "15m"
    H1 = "1h"
    H4 = "4h"

class Side(str, Enum):
    BUY = "buy"
    SELL = "sell"
```

### Value Objects

```python
class Ticker(BaseModel):
    symbol: str              # "BTC/USDT"
    bid: Decimal
    ask: Decimal
    last: Decimal
    volume_24h: Decimal
    change_24h_pct: Decimal
    timestamp: datetime      # UTC

class Candle(BaseModel):
    symbol: str
    timeframe: Timeframe
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    timestamp: datetime      # candle open time, UTC
    is_closed: bool          # True when candle is finalized

class MarketTrade(BaseModel):
    symbol: str
    price: Decimal
    amount: Decimal
    side: Side
    timestamp: datetime
    exchange_trade_id: str

class OrderBookLevel(BaseModel):
    price: Decimal
    amount: Decimal

class OrderBook(BaseModel):
    symbol: str
    bids: list[OrderBookLevel]
    asks: list[OrderBookLevel]
    timestamp: datetime
```

---

## 5. Database Schema

### TimescaleDB Hypertables

#### `market_candles`

| Column | Type | Notes |
|---|---|---|
| `symbol` | `VARCHAR(20)` | e.g. "BTC/USDT" |
| `timeframe` | `VARCHAR(5)` | e.g. "1h" |
| `timestamp` | `TIMESTAMPTZ` | candle open time |
| `open` | `NUMERIC(20,8)` | |
| `high` | `NUMERIC(20,8)` | |
| `low` | `NUMERIC(20,8)` | |
| `close` | `NUMERIC(20,8)` | |
| `volume` | `NUMERIC(20,8)` | |
| `is_closed` | `BOOLEAN` | false while forming |

- **Primary key:** `(symbol, timeframe, timestamp)`
- **Hypertable chunk interval:** 1 day
- **Compression:** enabled on chunks older than 7 days
- **Upsert:** `ON CONFLICT (symbol, timeframe, timestamp) DO UPDATE SET ... WHERE NOT market_candles.is_closed`

#### `market_trades`

| Column | Type | Notes |
|---|---|---|
| `symbol` | `VARCHAR(20)` | |
| `timestamp` | `TIMESTAMPTZ` | |
| `price` | `NUMERIC(20,8)` | |
| `amount` | `NUMERIC(20,8)` | |
| `side` | `VARCHAR(4)` | "buy" or "sell" |
| `exchange_trade_id` | `VARCHAR(64)` | Binance trade ID |

- **Hypertable chunk interval:** 1 day
- **Deduplication:** `ON CONFLICT (symbol, exchange_trade_id) DO NOTHING`
- **Index:** `(symbol, timestamp)`
- **Compression:** enabled on chunks older than 7 days

#### `market_ticker_snapshots`

| Column | Type | Notes |
|---|---|---|
| `symbol` | `VARCHAR(20)` | |
| `timestamp` | `TIMESTAMPTZ` | |
| `bid` | `NUMERIC(20,8)` | |
| `ask` | `NUMERIC(20,8)` | |
| `last` | `NUMERIC(20,8)` | |
| `volume_24h` | `NUMERIC(20,8)` | |
| `change_24h_pct` | `NUMERIC(10,4)` | |

- **Hypertable chunk interval:** 1 week
- **Compression:** enabled on chunks older than 7 days
- **Index:** `(symbol, timestamp)`

### Regular Tables

#### `assets`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | |
| `symbol` | `VARCHAR(20) UNIQUE` | "BTC/USDT" |
| `base` | `VARCHAR(10)` | "BTC" |
| `quote` | `VARCHAR(10)` | "USDT" |
| `is_active` | `BOOLEAN` | |
| `created_at` | `TIMESTAMPTZ` | |

---

## 6. Redis Streams

### Stream Names (centralized constants)

```python
class StreamNames:
    TICKER = "market:ticker:{symbol}"
    CANDLE = "market:candle:{symbol}:{timeframe}"
    TRADE  = "market:trade:{symbol}"
    ORDERBOOK = "market:orderbook:{symbol}"  # live state only, not persisted
```

### Consumer Groups

| Group | Consumer | Streams |
|---|---|---|
| `persistence` | `persistence-worker-1` | ticker, candle, trade |
| (future) `analytics` | — | candle, trade, ticker |
| (future) `opportunity` | — | candle, ticker |

### Stream Configuration

- **Max length:** `MAXLEN ~ 10000` per stream (approximate trimming)
- **Message format:** JSON-serialized Pydantic model

---

## 7. Market Data Worker

### Process Model

Single async Python process running concurrent asyncio tasks:

1. **Ticker task** — `watchTickersForSymbols(["BTC/USDT", "ETH/USDT"])`
2. **OHLCV task** — `watchOHLCVForSymbols(["BTC/USDT", "ETH/USDT"], timeframes=["15m", "1h", "4h"])`
3. **Trades task** — `watchTradesForSymbols(["BTC/USDT", "ETH/USDT"])`
4. **Order book task** — `watchOrderBookForSymbols(["BTC/USDT", "ETH/USDT"], limit=20)`
5. **Health monitor task** — checks last-received timestamps, exposes staleness
6. **Supervisor task** — monitors all tasks, restarts on failure, recreates exchange object if needed

### Candle `is_closed` Logic

CCXT Pro's `watchOHLCV` returns candles including the currently forming one. The worker determines closure:

- Compare the candle's open timestamp against the current time
- If `candle_open_time + timeframe_duration <= now`, mark `is_closed=True`
- Otherwise `is_closed=False`

### Backfill Manager

On startup:

1. Query TimescaleDB for the latest `is_closed=True` candle per `(symbol, timeframe)`
2. Calculate gap between that timestamp and now
3. Use CCXT REST `fetchOHLCV(symbol, timeframe, since=last_timestamp)` to fetch missing candles
4. Write directly to TimescaleDB (not through Redis Streams)
5. All backfilled candles are marked `is_closed=True`

### Health Monitoring

Staleness thresholds (configurable):

| Stream Type | Stale After |
|---|---|
| Ticker | 60 seconds |
| Trades | 60 seconds |
| Order book | 30 seconds |
| 15m candles | 5 minutes |
| 1h candles | 15 minutes |
| 4h candles | 60 minutes |

Health endpoint (`GET /health`) returns:

```json
{
  "status": "healthy",
  "streams": {
    "ticker:BTC/USDT": {"last_received": "...", "stale": false},
    "candle:BTC/USDT:1h": {"last_received": "...", "stale": false},
    ...
  }
}
```

The health endpoint runs as a separate module (thin FastAPI app) within the same container, not inside the ingestion loop.

---

## 8. Persistence Worker

### Process Model

Single async Python process consuming from Redis Streams.

### Batching Strategy

- Accumulate events for up to **1 second** or **100 events**, whichever comes first
- Execute a single batched `INSERT ... ON CONFLICT` per table per batch
- Use `executemany` via asyncpg for performance

### Upsert Rules

| Event Type | Conflict Key | On Conflict |
|---|---|---|
| Candle | `(symbol, timeframe, timestamp)` | `DO UPDATE ... WHERE NOT is_closed` |
| Trade | `(symbol, exchange_trade_id)` | `DO NOTHING` |
| Ticker snapshot | — | Always insert (append-only snapshots) |

### Acknowledgment

- `XACK` after successful DB commit
- On DB failure: log error, do not acknowledge, messages will be redelivered on next read
- Implement exponential backoff on persistent DB failures

---

## 9. Configuration

All configuration via environment variables with `pydantic-settings`, with YAML file fallback for complex structures.

```python
class MarketDataSettings(BaseSettings):
    exchange: str = "binance"
    symbols: list[str] = ["BTC/USDT", "ETH/USDT"]
    timeframes: list[str] = ["15m", "1h", "4h"]
    orderbook_depth: int = 20
    stream_maxlen: int = 10000

class StaleThresholds(BaseSettings):
    ticker_seconds: int = 60
    trades_seconds: int = 60
    orderbook_seconds: int = 30
    candle_15m_seconds: int = 300
    candle_1h_seconds: int = 900
    candle_4h_seconds: int = 3600

class PersistenceSettings(BaseSettings):
    batch_max_size: int = 100
    batch_max_wait_seconds: float = 1.0

class DatabaseSettings(BaseSettings):
    url: str = "postgresql+asyncpg://trading:trading_dev@localhost:5432/trading"

class RedisSettings(BaseSettings):
    url: str = "redis://localhost:6379"
```

---

## 10. Project Structure

```text
ai-trading/
├── pyproject.toml                       # uv, Python 3.12+
├── docker-compose.yml                   # postgres+timescale, redis (pinned versions)
├── alembic.ini
│
├── migrations/
│   └── versions/
│       └── 001_market_data_tables.py
│
├── src/
│   └── trading/
│       ├── __init__.py
│       ├── config.py                    # pydantic-settings: all settings classes
│       │
│       ├── domain/
│       │   ├── __init__.py
│       │   ├── models.py                # Ticker, Candle, MarketTrade, OrderBook
│       │   └── enums.py                 # Timeframe, Side
│       │
│       ├── services/
│       │   └── market_data/
│       │       ├── __init__.py
│       │       ├── worker.py            # CCXT Pro subscription tasks + supervisor
│       │       ├── publisher.py         # Redis Stream XADD publisher
│       │       ├── backfill.py          # REST gap recovery on startup
│       │       └── health.py            # staleness tracking + FastAPI /health
│       │
│       ├── persistence/
│       │   ├── __init__.py
│       │   ├── worker.py               # Redis consumer → TimescaleDB writer
│       │   ├── database.py             # SQLAlchemy async engine + session factory
│       │   ├── models.py               # SQLAlchemy ORM table definitions
│       │   └── repositories.py         # batch upsert/insert methods
│       │
│       ├── infrastructure/
│       │   ├── __init__.py
│       │   ├── redis.py                # Redis connection + stream helpers
│       │   ├── exchange.py             # CCXT Pro adapter (connect, subscribe)
│       │   ├── logging.py              # structured JSON logging setup
│       │   └── streams.py             # StreamNames constants
│       │
│       └── __main__.py                 # optional CLI entry
│
├── scripts/
│   ├── run_market_worker.py
│   └── run_persistence_worker.py
│
├── tests/
│   ├── unit/
│   │   ├── test_domain_models.py
│   │   └── test_candle_upsert.py
│   └── integration/
│       ├── test_redis_streams.py
│       ├── test_timescaledb_persistence.py
│       └── test_market_pipeline_e2e.py
│
└── infrastructure/
    └── docker/
        └── init-timescaledb.sql
```

---

## 11. Docker Compose (Local Development)

```yaml
services:
  postgres:
    image: timescale/timescaledb:2.17.2-pg16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: trading
      POSTGRES_USER: trading
      POSTGRES_PASSWORD: trading_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./infrastructure/docker/init-timescaledb.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7.4-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

Workers run locally via `uv run python scripts/run_market_worker.py`. Containerized worker builds deferred to VPS deployment.

---

## 12. Structured Logging

All worker output uses JSON structured logging from the start.

Required fields on every log line:

| Field | Example |
|---|---|
| `service` | `"market-data-worker"` |
| `level` | `"info"` |
| `timestamp` | ISO 8601 UTC |
| `symbol` | `"BTC/USDT"` (when applicable) |
| `timeframe` | `"1h"` (when applicable) |
| `stream` | `"market:candle:BTC/USDT:1h"` (when applicable) |
| `event_id` | Redis stream message ID (when applicable) |
| `message` | human-readable description |

Use `structlog` for structured logging with JSON output.

---

## 13. Dependencies

```text
# Core
ccxt>=4.0              # includes ccxt.pro
pydantic>=2.0
pydantic-settings>=2.0
redis>=5.0             # async support
sqlalchemy>=2.0        # async ORM
asyncpg>=0.29          # async PostgreSQL driver
alembic>=1.13
httpx>=0.27
uvicorn>=0.30
fastapi>=0.115         # health endpoint only

# Logging
structlog>=24.0

# Dev / Test
pytest>=8.0
pytest-asyncio>=0.24
```

---

## 14. Acceptance Criteria

The slice is complete when all of the following are true:

1. `docker compose up` starts PostgreSQL+TimescaleDB and Redis with pinned versions; hypertables and indexes exist after init
2. Market Data Worker starts and connects to Binance via CCXT Pro; subscribes to BTC/USDT and ETH/USDT for ticker, OHLCV (15m, 1h, 4h), trades, and order book
3. Redis Streams are populated with normalized events in `market:ticker:*`, `market:candle:*`, `market:trade:*`, `market:orderbook:*`
4. Persistence Worker starts, consumes from its Redis consumer group, writes candles, trades, and ticker snapshots to TimescaleDB
5. After a worker restart, candle backfill recovers any gap; `SELECT * FROM market_candles WHERE symbol='BTC/USDT' AND timeframe='1h' ORDER BY timestamp` shows no missing periods
6. Forming candles have `is_closed=false`; finalized candles have `is_closed=true`; upserts do not overwrite closed candles
7. `/health` returns per-stream freshness with correct per-type stale thresholds
8. All worker logs are JSON-structured with required fields
9. WebSocket disconnection triggers automatic reconnection; data resumes without manual intervention
10. `test_market_pipeline_e2e.py` passes: normalized event → Redis Stream → Persistence Worker → TimescaleDB row

---

## 15. Test Plan

| Test | Type | Verifies |
|---|---|---|
| `test_domain_models.py` | Unit | Pydantic validation, serialization, `is_closed` logic |
| `test_candle_upsert.py` | Unit | Upsert SQL logic: forming overwrites, closed candles are immutable |
| `test_redis_streams.py` | Integration | Publish → consume round-trip, consumer groups, XACK |
| `test_timescaledb_persistence.py` | Integration | Batch insert, deduplication, hypertable queries, compression |
| `test_market_pipeline_e2e.py` | Integration | Full pipeline: event → Redis → persistence → DB row |

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| CCXT Pro licensing cost | Monitor; Approach B (native Binance WS) is a fallback |
| Binance rate limits on public WS | Use multi-symbol methods to reduce connections |
| TimescaleDB storage growth from trades | Monitor disk; compression enabled; retention policy later |
| Redis memory from order-book streams | MAXLEN trimming; order book not persisted to DB |
| Forming candle semantics vary by exchange | Explicit `is_closed` logic based on timestamp math, not CCXT state |

---

## 17. Future Slice Dependencies

This slice provides the data foundation for:

- **Slice 2 (Analytics)** — consumes candle/trade/ticker streams via its own Redis consumer group
- **Slice 4 (Backtesting)** — queries historical candles from TimescaleDB
- **Slice 5 (Opportunity Detection)** — subscribes to candle/ticker streams
- **Slice 9 (Dashboard)** — queries TimescaleDB for charts, uses WebSocket for live price

---

## 18. Implementation Order

Within this slice, build in this order:

1. `pyproject.toml` + `docker-compose.yml` + project scaffolding
2. Domain models (`domain/models.py`, `domain/enums.py`)
3. Infrastructure (`redis.py`, `exchange.py`, `streams.py`, `logging.py`)
4. Configuration (`config.py`)
5. Alembic migration (`001_market_data_tables.py`)
6. Persistence layer (`database.py`, `models.py`, `repositories.py`)
7. Persistence worker (`persistence/worker.py`)
8. Redis publisher (`publisher.py`)
9. Market Data Worker (`worker.py`, `backfill.py`, `health.py`)
10. Entry point scripts
11. Unit tests
12. Integration tests + E2E pipeline test
