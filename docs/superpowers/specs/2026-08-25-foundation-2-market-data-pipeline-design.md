# Foundation 2: Market Data Pipeline — Design Spec

**Date:** 2026-08-25
**Status:** Proposed
**Foundation:** F2 of 13
**Depends on:** F0 (repo, config, Docker, CI), F1 (domain models, DB schema, Redis events)
**Unlocks:** F3, F5, F9, F11
**PRD sections:** 28, 31, 32, 33, 34, 56, 58, 66, 68, 73, 75, 82, 85, 92, 95
**Blueprint tasks:** 2.1 – 2.9 (part-a.md)
**Release gate:** none (Gate 1 requires F3 + F4)

---

## 1. Purpose

Foundation 2 builds the real-time and historical market data pipeline. It is the first foundation that touches an external system (Binance). Everything downstream — analytics (F5), opportunity detection (F5), backtesting (F6), Hermes context (F7/F8), the dashboard (F11) — reads from what F2 writes.

The question F2 answers: *Can the platform reliably receive, normalize, distribute, and store market data from Binance with no permanent gaps?*

---

## 2. Scope

### In scope

- `ExchangeAdapter` abstract interface in `packages/exchange/` (market data + symbol info capabilities only; order/account capabilities defined here, `NotImplementedError` stubs only, implemented in F12)
- `BinanceCCXTAdapter` implementing market data via CCXT REST and CCXT Pro WebSocket
- `services/market-data/` ingestion worker publishing normalized events to Redis Streams
- TimescaleDB persistence worker consuming Redis Streams, batch-upsert into `market_candles` and `market_trades`
- Historical candle backfill and gap detection on startup and reconnect
- Feed staleness monitor updating `/health/trading` readiness state
- Market data REST API routes in `apps/api` (`/api/v1/markets/*`)
- End-to-end integration and failure recovery test suite

### Out of scope

- Order placement, cancellation, balance queries (F12)
- Portfolio accounting and position tracking (F3)
- Paper execution adapter (F3)
- Risk engine controls (F4)
- Technical indicators and regime detection (F5)
- Opportunity scanner (F5)
- Social and news intelligence feeds (F9)
- Authenticated Binance calls of any kind (F12 only)

### Config-driven symbols

Symbols loaded from `TradingSettings.symbols` (packages/config). Default `["BTC/USDT", "ETH/USDT"]`. Adding a symbol = `.env` change + restart, no code change.

---

## 3. Architecture

```
Binance
   │  WebSocket (public, unauthenticated) — CCXT Pro
   ▼
┌──────────────────────────────────────────────────────┐
│              Market Data Ingestion Worker             │
│  (services/market-data/worker.py)                    │
│                                                      │
│  BinanceCCXTAdapter (packages/exchange/)             │
│    watchTickers()   → Ticker events                  │
│    watchOHLCV()     → Candle events                  │
│    watchTrades()    → Trade events                   │
│    watchOrderBook() → OrderBook events (live only)   │
│                                                      │
│  Normalizer → F1 Pydantic domain models              │
│  Publisher  → RedisStreamPublisher (packages/events) │
│  Health     → per-stream staleness tracker           │
│  Backfill   → REST gap recovery on startup/reconnect │
│  Supervisor → asyncio task monitor + restart         │
└──────────────────────┬───────────────────────────────┘
                       │  Redis Streams (stream:market:*)
                       ▼
              ┌────────┴──────────┐
              ▼                   ▼
   Persistence Worker       (Future: analytics,
   (services/market-data/    opportunity detector
    persistence.py)          own consumer groups)
              │
              ▼
        TimescaleDB
   (market_candles, market_trades)
              │
              ▼
    apps/api /api/v1/markets/*
```

---

## 4. Components

### 4.1 ExchangeAdapter Interface (`packages/exchange/base.py`)

The platform's stable contract. All other components depend on this interface, never on CCXT types or Binance response shapes.

**Market data capabilities (F2 implements):**
```python
async def get_ticker(symbol: str) -> Ticker
async def get_candles(symbol: str, timeframe: str, since: datetime, limit: int) -> list[Candle]
async def get_order_book(symbol: str, depth: int) -> OrderBook
async def get_recent_trades(symbol: str, since: datetime, limit: int) -> list[MarketTrade]
async def get_symbol_info(symbol: str) -> SymbolInfo
async def get_server_time() -> datetime
async def health() -> AdapterHealth
async def get_rate_limit_state() -> RateLimitState
```

**Account/order capabilities (interface stubs here, F12 implements):**
```python
async def get_balance() -> dict[str, Balance]
async def place_order(request: ExecutionRequest) -> Order
async def cancel_order(client_order_id: str) -> CancelResult
async def get_order(client_order_id: str) -> Order
async def get_fills(symbol: str, since: datetime) -> list[Fill]
async def get_permissions() -> AdapterPermissions
```

**Contract rules (PRD 28.1):**
- All prices and quantities cross the boundary as `Decimal`, never `float`
- Symbols in platform canonical form (`BTC/USDT`), normalized at adapter boundary
- Timestamps are timezone-aware UTC
- Exchange errors normalize to: `RETRYABLE`, `PERMANENT`, `RATE_LIMITED`, `INSUFFICIENT_FUNDS`, `INVALID_ORDER`, `AUTH_FAILED`, `UNKNOWN_STATE`
- `UNKNOWN_STATE` is never collapsed to a generic failure — it has distinct financial meaning

**Error hierarchy:**
```python
class ExchangeError(Exception): ...
class RetryableError(ExchangeError): ...
class RateLimitedError(ExchangeError): ...
class AuthFailedError(ExchangeError): ...
class PermanentError(ExchangeError): ...
class UnknownStateError(ExchangeError): ...  # never collapse this
```

**Response models** (defined in `packages/exchange/models.py`, separate from domain models to keep the adapter boundary clean):
```python
class SymbolInfo(BaseModel):
    symbol: str
    base: str
    quote: str
    price_precision: int
    quantity_precision: int
    min_notional: Decimal
    step_size: Decimal
    is_active: bool

class AdapterHealth(BaseModel):
    connected: bool
    latency_ms: float | None
    last_error: str | None

class RateLimitState(BaseModel):
    requests_used: int
    requests_limit: int
    weight_used: int
    weight_limit: int
    reset_at: datetime
```

### 4.2 BinanceCCXTAdapter (`packages/exchange/binance.py`)

Implements `ExchangeAdapter` using CCXT (REST) and CCXT Pro (WebSocket). **Public market data only** — no credentials required or accepted in F2.

CCXT is the default. Binance-native calls are only added when: (a) a capability is missing from CCXT, (b) normalization loses needed information, or (c) a measured latency problem is traced to the abstraction. Each native call site must have a comment explaining why.

**WebSocket streaming (CCXT Pro watch* methods):**
- `watchTickers(symbols)` — real-time bid/ask/last/volume
- `watchOHLCVForSymbols(symbols, timeframes)` — candle updates for `["1m", "15m", "1h", "4h"]`
- `watchTradesForSymbols(symbols)` — individual trade prints
- `watchOrderBookForSymbols(symbols, limit=20)` — order book top-of-book (Redis live state only, not persisted to DB)

**Rate limit tracking:** Rate limit state parsed from exchange response headers. `get_rate_limit_state()` returns current weight usage. The ingestion worker checks this before each REST call and backs off if within 20% of the limit.

### 4.3 Market Data Ingestion Worker (`services/market-data/worker.py`)

Single async Python process. Six concurrent asyncio tasks:

1. **Ticker task** — `watchTickers`
2. **OHLCV task** — `watchOHLCVForSymbols` for all configured timeframes
3. **Trades task** — `watchTradesForSymbols`
4. **Order book task** — `watchOrderBookForSymbols`
5. **Health monitor task** — checks `last_received_at` per stream type/symbol/timeframe
6. **Supervisor task** — monitors all tasks, restarts failed ones with exponential backoff

**Candle `is_closed` logic:**

CCXT Pro returns the currently forming candle alongside closed candles. Closure uses exchange timestamps only — local system clock is never used:

- Candle is `is_closed=True` when the next candle's open timestamp `>= current_candle_open + timeframe_duration`
- Forming candle upserted as `is_closed=False`
- Once `is_closed=True`, the upsert rule `WHERE NOT market_candles.is_closed` prevents overwriting

**Reconnection strategy:**
```
disconnect detected
    → wait: min(1s * 2^attempt, 60s)   exponential backoff
    → recreate CCXT Pro exchange object
    → re-subscribe all streams
    → trigger gap detection + backfill
    → resume publishing
    → log disconnect_duration_seconds as structured event
```

### 4.4 Redis Stream Names

Stream names from `packages/events/streams.py` (pinned in F1, blueprint contract C6):
```
stream:market:candles         Candle events
stream:market:trades          MarketTrade events
stream:market:tickers         Ticker events
stream:market:orderbook       OrderBook events (live only, not persisted)
stream:market:opportunities   (F5 writes here; F2 defines the name only)
```

All stream keys are prefixed: `{app_env}:{trading_mode}:{stream_name}`.

### 4.5 Gap Detection and Backfill (`services/market-data/backfill.py`)

Runs on startup and after every WebSocket reconnect:

1. Query TimescaleDB for latest `is_closed=True` candle per `(symbol, timeframe)`
2. Calculate gap to `now - 2 * timeframe_duration` (buffer for currently forming candle)
3. If gap exists: REST `get_candles(symbol, timeframe, since=latest_ts, limit=1000)`
4. Write directly to TimescaleDB (bypasses Redis — backfill is not a live event)
5. All backfilled candles marked `is_closed=True`
6. Log `gap_seconds` and `rows_backfilled` as structured events

If gap exceeds `max_backfill_days` (configurable, default 30): truncate to that limit, log warning, continue.

### 4.6 TimescaleDB Persistence Worker (`services/market-data/persistence.py`)

Separate async Python process (not a thread). Consumer group: `persistence`, consumer name: `persistence-worker-1`.

**Batching:**
- Accumulate events up to **1 second** or **5000 events**, whichever comes first
- Single batched `INSERT ... ON CONFLICT` per table per flush via asyncpg `executemany`

**Upsert rules:**

| Event | Conflict key | On conflict |
|---|---|---|
| Candle | `(symbol, timeframe, timestamp, trading_mode)` | `DO UPDATE SET ... WHERE NOT is_closed` |
| Trade | `(exchange_trade_id, symbol, trading_mode)` | `DO NOTHING` |
| Ticker snapshot | — | Always insert (append-only) |

**Acknowledgement:**
- `XACK` after successful DB commit only
- DB failure: log, do not ack — message redelivered on next `XREADGROUP`
- Persistent DB failure: exponential backoff (1s base, 30s max)

### 4.7 Feed Staleness Monitor (`services/market-data/health.py`)

Tracks `last_received_at` per stream-type/symbol/timeframe tuple. Exposed as `FeedHealthState` shared in-process (asyncio-safe).

**Thresholds** (configurable via settings, defaults):

| Stream type | Stale after |
|---|---|
| Ticker | `market_data_max_age_seconds` (default 60s) |
| Trades | `market_data_max_age_seconds` (default 60s) |
| Order book | 30s |
| 1m candles | 2 min |
| 15m candles | 5 min |
| 1h candles | 15 min |
| 4h candles | 60 min |

When any configured feed goes stale: sets `market_data_ready=False`. Recovery: all feeds fresh for 2 consecutive checks → sets `market_data_ready=True`.

`/health/trading` in `apps/api` reads this flag and adds/removes reason `MARKET_DATA_NOT_READY`.

### 4.8 Market Data REST API (`apps/api/routers/markets.py`)

New router mounted at `/api/v1/markets`. Read-only. No authentication in F2 (F11 adds owner auth).

```
GET /api/v1/markets/symbols
GET /api/v1/markets/ticker?symbol=BTC/USDT
GET /api/v1/markets/candles?symbol=BTC/USDT&timeframe=1h&from=<iso>&to=<iso>&limit=500
GET /api/v1/markets/trades?symbol=BTC/USDT&since=<iso>&limit=100
GET /api/v1/markets/orderbook?symbol=BTC/USDT&depth=20
```

All responses use platform types. No CCXT types exposed. Pagination via `limit` + `cursor` on `timestamp`. OpenAPI schemas generated from Pydantic response models.

---

## 5. Data Flow (end-to-end)

```
1. CCXT Pro WebSocket receives raw event from Binance
2. Worker normalizes raw dict → validated Pydantic model (Decimal prices, UTC timestamps)
3. Publisher XADD to Redis Stream (key-prefixed by env + trading_mode)
4. Persistence worker XREADGROUP, accumulates in batch buffer
5. On flush: INSERT ... ON CONFLICT into TimescaleDB via asyncpg executemany
6. On success: XACK
7. Staleness monitor tracks timestamps at step 3
8. REST API queries TimescaleDB for historical data
```

Backfill path: step 1 (REST) → normalize → step 5 (direct to DB, skip Redis).

---

## 6. Directory Layout

```
packages/exchange/
├── __init__.py
├── base.py           ExchangeAdapter ABC + error types
├── models.py         SymbolInfo, AdapterHealth, RateLimitState response models
└── binance.py        BinanceCCXTAdapter (CCXT REST + CCXT Pro)

services/market-data/
├── __init__.py
├── worker.py         Ingestion worker — asyncio tasks + supervisor
├── publisher.py      Thin wrapper around RedisStreamPublisher
├── backfill.py       Gap detection + REST historical fill
├── health.py         Staleness tracker + market_data_ready flag + FeedHealthState
└── persistence.py    Redis consumer → TimescaleDB writer

apps/api/routers/
└── markets.py        /api/v1/markets/* REST routes

tests/
├── unit/
│   ├── test_exchange_adapter.py     Normalizer, error hierarchy, Decimal enforcement
│   ├── test_candle_closure.py       is_closed timestamp logic for all timeframes
│   └── test_staleness_monitor.py    Threshold detection, flag transitions, recovery
└── integration/
    ├── test_market_pipeline_e2e.py  Event → Redis → persist → DB row
    ├── test_ws_reconnection.py      Disconnect + backoff + stream resume
    ├── test_gap_backfill.py         Gap detection, REST backfill, no duplication
    └── test_market_api.py           REST endpoints against seeded test DB
```

---

## 7. New Dependencies

Add to `pyproject.toml` (core group):
```
ccxt>=4.3    # includes ccxt.pro for WebSocket streaming
```

---

## 8. Error Handling

| Scenario | Behaviour |
|---|---|
| WebSocket disconnect | Exponential backoff, recreate exchange object, re-subscribe, trigger backfill |
| Binance 429 rate limit | Respect Retry-After header; throttle before hitting limit |
| DB connection lost (persistence) | Do not ack messages; backoff reconnect; resume |
| Redis connection lost (publisher) | Backoff reconnect; a gap in Redis is acceptable (not authoritative) |
| Backfill gap > max_backfill_days | Truncate to limit, log structured warning, continue |
| is_closed race on forming candle | Exchange timestamp math is authoritative; local clock never used |
| UNKNOWN_STATE exchange error | Always propagate as UnknownStateError; never collapse |

---

## 9. Acceptance Criteria

| AC | Description | Verified by |
|---|---|---|
| AC-2.1 | ExchangeAdapter in packages/exchange/, Binance impl via CCXT/CCXT Pro, Decimal types, canonical symbols | unit: test_exchange_adapter.py |
| AC-2.2 | Exchange errors normalized to platform categories; raw error in structured log | unit: test_exchange_adapter.py |
| AC-2.3 | get_symbol_info loads precision, min notional, step size, trading status | unit: test_exchange_adapter.py |
| AC-2.4 | Rate limit state tracked from response headers; throttles before 429 | unit: test_exchange_adapter.py |
| AC-2.5 | WebSocket worker maintains real-time feeds: ticker, trades, candles (1m/15m/1h/4h) via Redis Streams with consumer group | integration: test_market_pipeline_e2e.py |
| AC-2.6 | WebSocket disconnections trigger exponential backoff reconnect; logs disconnect_duration_seconds | integration: test_ws_reconnection.py |
| AC-2.7 | Reconnect triggers gap detection and REST backfill for contiguous candle history | integration: test_gap_backfill.py |
| AC-2.8 | Persistence worker batch-upserts with idempotent conflict rules; XACK after commit only | integration: test_market_pipeline_e2e.py |
| AC-2.9 | Staleness monitor marks feed stale, updates /health/trading when age > market_data_max_age_seconds | unit: test_staleness_monitor.py |
| AC-2.10 | REST endpoints /candles, /ticker, /trades, /symbols return data matching OpenAPI schema | integration: test_market_api.py |
| AC-2.11 | CI integration tests verify reconnect, stream recovery, gap fill, persistence — no live exchange keys | .github/workflows/ci.yml |

---

## 10. Safety Invariants

1. All prices and quantities in domain models use `Decimal`. `float` in a market data signature is a defect.
2. Redis is never authoritative for market data. A Redis gap is acceptable; a TimescaleDB gap requires backfill.
3. Paper and live streams use separate Redis key prefixes (enforced by packages/events from F1).
4. Persistence worker and ingestion worker are separate processes — one cannot block the other.
5. `UNKNOWN_STATE` errors are never collapsed.
6. The adapter holds no live exchange credentials in F2.

---

## 11. Open Items

- [ ] Verify CCXT Pro license terms for private self-hosted use before shipping F2.
- [ ] Confirm `timescaledb-ha:pg16-latest` includes pgvector (F0 follow-up — check during F2 Docker bring-up).
- [ ] Add `"1m"` to `TradingSettings.timeframes` default (currently `["15m", "1h", "4h"]`). Recommended: add it — F5 analytics will need 1m data and storage overhead is low. This is a one-line config change in F0's packages/config.
