## Foundation 4: Risk Engine

**Goal:** Build the deterministic risk engine that enforces position sizing, portfolio exposure limits, loss limits, and staleness protection at proposal creation, approval, and execution boundaries.
**Depends on:** 0, 1, 3
**Unlocks:** 8, 12
**PRD sections:** 8, 25, 26, 34, 66, 68, 69, 73, 74, 75, 83, 84, 85, 89, 90, 92, 95
**Release gate:** Gate 1 (Infrastructure)

### Deliverables
- `packages/risk/` containing the deterministic risk engine, rule evaluation hierarchy, position sizing calculator, and precision rounding utilities using fixed-precision Decimal.
- `services/risk/` providing the versioned risk configuration service, multi-point evaluation pipeline, and state snapshotting.
- Immutable `RiskDecision` records with machine-readable rule failure codes, evaluated rule limits, and `MODIFIED` decision handling.
- Three non-skippable evaluation checkpoints: proposal creation, owner approval time, and immediately pre-submit.
- Fail-closed safety mechanisms integrating market data staleness, loss limits, exchange health, and kill switch state.
- Owner-only REST API endpoints in `apps/api` for risk configuration management and decision inspection with strict session authentication.
- Isolated unit test suite and property-based tests verifying 100% rule-code branch coverage without external network, database, or agent dependencies.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 4.1 | Pure deterministic risk rule evaluation engine in `packages/risk/` | Deterministic risk rule evaluation core computing capital per trade, portfolio exposure, asset exposure limits, max concurrent positions, and daily/weekly loss limits | - | AC-4.1, AC-4.2, AC-4.3 |
| 4.2 | Position sizing, precision rounding, and reward-to-risk calculators using Decimal | Fixed-precision Decimal calculators for position sizing, exchange symbol filter precision rounding, and reward-to-risk ratio verification | 4.1 | AC-4.3, AC-4.4 |
| 4.3 | Versioned risk configuration repository and migration service in `services/risk/` | PostgreSQL repository for versioned risk configurations (`risk_rules`, `risk_config_versions`) with structural enforcement of `spot_only: true` and `leverage_enabled: false` | - | AC-4.5, AC-4.6 |
| 4.4 | Risk decision generator with rule codes, snapshot references, and `MODIFIED` state handling | `RiskDecision` generator producing immutable records citing specific rule failure codes, evaluated rule limits, and size reductions producing `MODIFIED` decisions | 4.1, 4.2, 4.3 | AC-4.2, AC-4.7 |
| 4.5 | Three-point evaluation pipeline in `services/risk/` | Evaluation orchestrator executing validation at proposal creation, owner approval, and immediately pre-submit, failing closed on any violation | 4.4 | AC-4.8 |
| 4.6 | Market data staleness, exchange health, and kill switch validation checks | Safety validators enforcing `market_data_max_age_seconds` freshness, exchange connectivity status, and active kill switch blocking | 4.5 | AC-4.9, AC-4.10 |
| 4.7 | Risk service integration with append-only financial audit log and correlation context | Audit logging integration recording all evaluations and rule decisions to PostgreSQL `audit_log` with `correlation_id` and `risk_config_version` | 4.4, 4.5 | AC-4.11 |
| 4.8 | Owner-only risk configuration management and query REST endpoints in `apps/api` | REST endpoints (`/api/v1/risk/config`, `/api/v1/risk/decisions`) requiring owner-session authentication and rejecting service tokens | 4.3, 4.4 | AC-4.6, AC-4.12 |
| 4.9 | Comprehensive isolated unit test suite and property-based test suite for risk rules | Test suite proving 100% rule-code coverage, Decimal precision, sizing limits, and fail-closed behavior with zero external dependencies | 4.1, 4.2, 4.4, 4.5, 4.6 | AC-4.1, AC-4.2, AC-4.3, AC-4.9, AC-4.13 |

### Acceptance criteria
- **AC-4.1**: Risk rule evaluation is pure deterministic logic using fixed-precision `Decimal`; identical inputs always produce identical decisions without external network or LLM calls.
- **AC-4.2**: Every risk evaluation produces an immutable `RiskDecision` record with decision status (`APPROVED`, `REJECTED`, `MODIFIED`), specific machine-readable rule failure codes, and evaluated rule limits.
- **AC-4.3**: Sizing and rounding rules enforce exchange symbol filters (minimum notional, step size, price precision) and ensure position risk never exceeds `max_risk_per_trade_percent`.
- **AC-4.4**: Reward-to-risk validator rejects proposals where the expected return relative to stop distance is below `min_reward_risk_ratio`.
- **AC-4.5**: `spot_only: true` and `leverage_enabled: false` are structurally enforced and cannot be overridden by dynamic configuration.
- **AC-4.6**: Risk configuration is versioned in PostgreSQL; owner modifications create new immutable `risk_config_versions` records, and Hermes service tokens are rejected if attempting to write risk rules.
- **AC-4.7**: A `MODIFIED` decision reduces quantity to fit within exposure limits and flags the proposal as requiring fresh owner approval before execution.
- **AC-4.8**: Risk validation executes at three non-skippable points (proposal creation, owner approval, and immediately pre-submit); failure at any point halts the trade.
- **AC-4.9**: Pre-submit evaluation checks market data age against `market_data_max_age_seconds`, daily/weekly loss limits, current portfolio drawdown, and active kill switch state, failing closed on any breach.
- **AC-4.10**: If the Risk Engine or risk configuration is unavailable or corrupted, all order submission paths fail closed and refuse order placement.
- **AC-4.11**: Every risk evaluation is recorded in the append-only `audit_log` table with its `correlation_id`, `risk_config_version`, and rule evaluation snapshot.
- **AC-4.12**: REST endpoints `/api/v1/risk/config` and `/api/v1/risk/decisions` allow owner configuration updates and read-only queries with strict owner-session authentication.
- **AC-4.13**: Unit tests achieve 100% rule-code branch coverage in isolation without database, exchange, or agent dependencies.

### Explicitly out of scope
- Technical indicator math and regime classification (belongs to Foundation 5)
- Opportunity detection scanning (belongs to Foundation 5)
- Strategy registry and backtesting execution (belongs to Foundation 6)
- Hermes proposal generation logic (belongs to Foundation 7 and Foundation 8)
- Owner approval UI modal and TOTP authentication (belongs to Foundation 11)
- Live Binance order placement (belongs to Foundation 12)

---

## Foundation 5: Quantitative Analytics / Opportunity Detection

**Goal:** Build the deterministic quantitative analytics library, market regime classifier, technical indicator pipelines, and continuous opportunity detection engine publishing candidate setups to Redis Streams.
**Depends on:** 0, 1, 2
**Unlocks:** 6, 8
**PRD sections:** 16, 20, 21, 22, 23, 31, 32, 57, 59, 66, 68, 83, 84, 85, 90, 92, 95
**Release gate:** none

### Deliverables
- `packages/quant/` containing deterministic technical indicators (moving averages, RSI, MACD, ATR, RVOL), market structure analyzers, and regime classifiers.
- Graceful degradation wrapper allowing backend boot and basic analytics when optional TA-Lib C dependencies are omitted.
- Multi-timeframe regime classification engine categorizing market conditions into six discrete regimes.
- Rule-based, data-driven confidence scoring engine replacing arbitrary model-generated confidence numbers.
- `services/analytics/` real-time worker consuming candle streams, updating indicators, and persisting snapshots to TimescaleDB `indicator_snapshots`.
- Deterministic opportunity scanner evaluating market rules across BTC/ETH 15m, 1h, and 4h series and publishing candidate events to Redis Streams.
- REST API endpoints in `apps/api` for indicators, regimes, and opportunity event queries.
- Integration test suite validating mathematical correctness against benchmark vectors and testing scanner stream output.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 5.1 | Pure quantitative analytics primitives and technical indicator library in `packages/quant/` | Core indicator library computing moving averages (SMA, EMA), momentum (RSI, MACD, ROC), and volatility (ATR, rolling volatility, range expansion) | - | AC-5.1, AC-5.2 |
| 5.2 | Graceful degradation wrapper for TA-Lib and NumPy/Polars calculations | Layered import structure in `packages/quant/` falling back to pure Python/NumPy/Polars or explicit degradation state if TA-Lib C library is absent | 5.1 | AC-5.2, AC-5.3 |
| 5.3 | Market structure, swing level, support/resistance, and volume anomaly detection engine | Algorithms identifying swing highs/lows, support/resistance levels, breakouts, breakdowns, and relative volume anomalies (RVOL, spikes) | 5.1 | AC-5.1, AC-5.4 |
| 5.4 | Market regime classification engine across multiple timeframes (15m, 1h, 4h) | Regime classifier categorizing market state into `TRENDING_UP`, `TRENDING_DOWN`, `RANGING`, `HIGH_VOLATILITY`, `LOW_VOLATILITY`, or `UNCERTAIN` | 5.1, 5.3 | AC-5.5 |
| 5.5 | Data-driven confidence scoring engine using quantitative setup features | Algorithmic confidence scoring computing `LOW`, `MEDIUM`, or `HIGH` ratings from timeframe confluence, volume confirmation, and regime match | 5.3, 5.4 | AC-5.6 |
| 5.6 | Continuous real-time quantitative analytics worker consuming market streams in `services/analytics/` | Analytics service consuming Redis market streams, updating multi-timeframe rolling windows, and calculating live indicator states | 5.1, 5.4 | AC-5.7 |
| 5.7 | Deterministic opportunity detection scanner publishing candidates to Redis Streams | Continuous scanner evaluating technical setup rules and publishing structured `opportunity.detected` events to `stream:market:opportunities` | 5.3, 5.5, 5.6 | AC-5.8, AC-5.9 |
| 5.8 | Indicator snapshot persistence worker writing to TimescaleDB `indicator_snapshots` hypertable | Persistence worker batching indicator snapshots and writing time-series records to TimescaleDB | 5.6 | AC-5.7, AC-5.10 |
| 5.9 | REST API endpoints for indicators, regimes, and opportunity events in `apps/api` | REST endpoints (`/api/v1/analytics/indicators`, `/api/v1/analytics/regime`, `/api/v1/opportunities`) with query parameters and OpenAPI docs | 5.6, 5.7, 5.8 | AC-5.11 |
| 5.10 | Quantitative math verification and opportunity scanner integration test suite | Automated tests validating indicator formulas against statistical reference data and verifying candidate event publishing | 5.1, 5.4, 5.7, 5.8 | AC-5.1, AC-5.5, AC-5.8, AC-5.12 |

### Acceptance criteria
- **AC-5.1**: Technical indicator library calculates moving averages (SMA, EMA), momentum (RSI, MACD, ROC), volatility (ATR, rolling volatility, range expansion), and volume metrics (RVOL, volume spike) using deterministic algorithms with exact mathematical unit tests.
- **AC-5.2**: Indicator engine imports TA-Lib from the optional quant layer; if the system C library is absent, pure Python/NumPy/Polars fallback calculations or explicit degradation indicators are returned without preventing API boot.
- **AC-5.3**: Market structure engine identifies swing highs, swing lows, support/resistance zones, breakouts, and breakdowns across 15m, 1h, and 4h candle series.
- **AC-5.4**: Volume anomaly detector computes rolling volume percentiles and volume-price divergences.
- **AC-5.5**: Regime classifier assigns one of six deterministic regimes (`TRENDING_UP`, `TRENDING_DOWN`, `RANGING`, `HIGH_VOLATILITY`, `LOW_VOLATILITY`, `UNCERTAIN`) based on multi-timeframe trend and volatility metrics.
- **AC-5.6**: Signal confidence engine computes rule-based confidence levels (`LOW`, `MEDIUM`, `HIGH`) derived from timeframe alignment, indicator confluence, volume confirmation, and regime compatibility.
- **AC-5.7**: Analytics worker in `services/analytics/` consumes candle events from Redis Streams, updates indicator states in memory, and persists snapshots to TimescaleDB `indicator_snapshots` hypertable.
- **AC-5.8**: Opportunity detection engine continuously scans configured symbols (`BTC/USDT`, `ETH/USDT`) and timeframes (15m, 1h, 4h), filtering noise and identifying candidate trading setups without calling an LLM.
- **AC-5.9**: Detected opportunities are published as `opportunity.detected` events to Redis Streams (`stream:market:opportunities`) carrying `opportunity_id`, `correlation_id`, symbol, timeframe, regime, candidate rules, and quantitative snapshot.
- **AC-5.10**: TimescaleDB stores indicator and regime history for retrospective analysis and backtesting.
- **AC-5.11**: REST API endpoints `/api/v1/analytics/indicators`, `/api/v1/analytics/regime`, and `/api/v1/opportunities` return calculated analytics and active opportunities with query filters.
- **AC-5.12**: Automated test suite validates indicator accuracy against known statistical reference vectors and verifies scanner triggers on synthetic market scenarios.

### Explicitly out of scope
- Strategy definition, backtesting engine, and vectorbt simulation (belongs to Foundation 6)
- Hermes agent trade proposal generation (belongs to Foundation 7 and Foundation 8)
- Social media and news sentiment metrics (belongs to Foundation 9)
- TradingAgents deep research escalation (belongs to Foundation 10)
- Realtime chart frontend components (belongs to Foundation 11)

---

## Foundation 6: Strategy Registry / Backtesting

**Goal:** Build the versioned strategy registry, backtesting engine with realistic fees and slippage modeling, look-ahead prevention, and quantitative performance analytics.
**Depends on:** 0, 1, 2, 5
**Unlocks:** 8
**PRD sections:** 6, 18, 19, 34, 35, 36, 57, 59, 60, 83, 84, 85, 88, 89, 92, 95
**Release gate:** Gate 2 (Quantitative Research)

### Deliverables
- Strategy specification schema and lifecycle state machine managing versioned strategy records in PostgreSQL.
- Backtesting simulation engine enforcing strict time alignment and look-ahead bias prevention.
- Transaction cost model applying Binance spot fee schedules (maker/taker) and configurable slippage basis points.
- Exchange filter simulation enforcing symbol price precision, step size, and minimum notional constraints on historical orders.
- Comprehensive performance metrics calculator generating equity curves, drawdown series, Sharpe/Sortino ratios, and regime breakdowns.
- `services/backtesting/` service integrating vectorbt research acceleration within the optional quant dependency layer.
- Benchmark comparison tool measuring strategy performance against BTC and ETH Buy & Hold baselines.
- REST API endpoints in `apps/api` for strategy registration, version management, and asynchronous backtest job submission.
- Backtesting test suite verifying mathematical accuracy, fee deductions, and look-ahead leak prevention.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 6.1 | Strategy specification schema, parameter validation, and lifecycle state machine | `packages/domain/` strategy schemas, parameter validation rules, and lifecycle state transitions (`DRAFT`, `BACKTESTING`, `VALIDATED`, `PAPER_TRADING`, `LIVE_LIMITED`, `APPROVED`, `REJECTED`) | - | AC-6.1, AC-6.2 |
| 6.2 | Strategy registry service with database persistence and version tracking in `services/backtesting/` | PostgreSQL repository for `strategies`, `strategy_versions`, and `backtests`, enforcing version immutability and approval gates | 6.1 | AC-6.1, AC-6.3 |
| 6.3 | Core backtesting simulation engine with look-ahead prevention and bar execution timing | Event-driven and vectorized backtesting loop enforcing candle close signal generation at `t` and execution at or after candle open `t+1` | 6.1 | AC-6.4, AC-6.5 |
| 6.4 | Realistic transaction cost model applying Binance fee schedules and configurable slippage | Fee and slippage calculation engine deducting maker/taker fees and basis-point slippage on simulated fills, tracking gross versus net metrics | 6.3 | AC-6.5, AC-6.6 |
| 6.5 | Performance analytics and risk-adjusted metrics calculator | Metrics engine calculating total/net return, max drawdown, win/loss rates, profit factor, expectancy, Sharpe ratio, Sortino ratio, and regime breakdown | 6.3, 6.4 | AC-6.7 |
| 6.6 | vectorbt accelerated backtest runner in optional quant dependency layer | High-speed backtest runner using vectorbt in `services/backtesting/` with graceful fallback when quant dependencies are not installed | 6.3, 6.5 | AC-6.4, AC-6.8 |
| 6.7 | Backtest execution worker with async job queuing and result persistence | Asynchronous task worker executing backtest runs, tracking job progress, and storing trade logs and equity curves in PostgreSQL | 6.2, 6.6 | AC-6.8, AC-6.9 |
| 6.8 | Benchmark comparison engine evaluating strategies against BTC/ETH Buy and Hold baselines | Comparative performance module generating benchmark equity curves and relative risk-adjusted metrics | 6.5, 6.7 | AC-6.10 |
| 6.9 | Strategy registry and backtest execution REST API endpoints in `apps/api` | REST endpoints (`/api/v1/strategies`, `/api/v1/strategies/{id}/versions`, `/api/v1/backtests`) with input validation and result serialization | 6.2, 6.7, 6.8 | AC-6.11 |
| 6.10 | Backtesting validation test suite with synthetic data, look-ahead leak detection, and Gate 2 verification | Test suite proving zero look-ahead bias, fee deduction accuracy, reproducible metrics, and Release Gate 2 compliance | 6.3, 6.4, 6.5, 6.8, 6.9 | AC-6.4, AC-6.5, AC-6.6, AC-6.7, AC-6.12 |

### Acceptance criteria
- **AC-6.1**: Strategy Registry maintains versioned strategy records with lifecycle states (`DRAFT`, `BACKTESTING`, `VALIDATED`, `PAPER_TRADING`, `LIVE_LIMITED`, `APPROVED`, `REJECTED`), parameters, allowed regimes, and risk settings.
- **AC-6.2**: Strategy versions are immutable; updating parameters creates a new version record (such as `breakout-v2`) with independent performance tracking.
- **AC-6.3**: Strategy registry persists records to PostgreSQL and prevents unapproved strategies from being selected for live execution.
- **AC-6.4**: Backtesting engine enforces strict time alignment to prevent look-ahead bias; signals generated at candle close `t` are executed at or after candle open `t+1`.
- **AC-6.5**: Backtest simulation models Binance fee schedules (maker/taker fees) and configurable slippage assumptions, recording gross versus net returns.
- **AC-6.6**: Exchange symbol filters (minimum notional, step size, price precision) are applied to backtest order simulation.
- **AC-6.7**: Performance metrics engine computes total return, net return, maximum drawdown, win/loss rate, profit factor, expectancy, Sharpe ratio, Sortino ratio, average trade duration, and performance breakdown by market regime.
- **AC-6.8**: vectorbt backtest runner executes parameter grid searches and historical backtests using the optional quant layer, degrading gracefully if quant dependencies are omitted.
- **AC-6.9**: Backtest jobs execute asynchronously, persisting inputs, equity curves, trade logs, and metrics to PostgreSQL.
- **AC-6.10**: Benchmark engine generates comparative baseline equity curves (BTC Buy & Hold, ETH Buy & Hold) across the same backtest time window.
- **AC-6.11**: REST API endpoints `/api/v1/strategies`, `/api/v1/strategies/{id}/versions`, and `/api/v1/backtests` support strategy management and backtest runs with schema validation.
- **AC-6.12**: Release Gate 2 criteria pass: backtests are fully reproducible, transaction costs are accurately deducted, and look-ahead detection tests verify zero future data leakage.

### Explicitly out of scope
- Hermes agent proposal synthesis and skill execution (belongs to Foundation 7 and Foundation 8)
- Realtime paper trading execution loop (belongs to Foundation 3 and Foundation 8)
- Automated strategy code generation via LLM (belongs to Foundation 8 or future scope)
- Backtest charting and strategy visualizer UI components (belongs to Foundation 11)
- Live execution integration (belongs to Foundation 12)

---

## Foundation 7: Hermes Tool APIs, Trading Knowledge, Memory, Skills

**Goal:** Build the authenticated tool API surface for Hermes, the pgvector trading knowledge base, the file-based trading skill system, the trader constitution, and the strict service authorization boundary.
**Depends on:** 0, 1, 2, 3, 4, 5, 6
**Unlocks:** 8, 10
**PRD sections:** 10, 12, 13, 17, 18, 34, 43, 44, 70, 71, 80, 83, 84, 85, 89, 90, 92, 95
**Release gate:** none

### Deliverables
- Service authentication middleware in `apps/api` enforcing distinct bearer token scopes for `HERMES_SERVICE_TOKEN` and `TRADINGAGENTS_SERVICE_TOKEN`.
- Negative authorization controls guaranteeing service tokens cannot approve trades, modify risk rules, trigger the kill switch, submit orders, or access credentials.
- Hermes tool API endpoints covering market data queries, quantitative analytics, portfolio queries, strategy inspections, and proposal management.
- Structured proposal creation endpoint validating proposal schemas, deriving idempotency keys, and triggering proposal-time risk evaluation.
- `skills/trading/` repository containing structured skills (risk management, trend following, breakout, mean reversion, market structure) with `SKILL.md` instructions and `rules.yaml` rules.
- Permanent Trader Constitution file establishing immutable core trading principles.
- PostgreSQL + pgvector trading knowledge base ingestion pipeline and semantic similarity retrieval tool endpoint.
- Qualitative agent observation and post-trade reflection storage endpoints in PostgreSQL.
- `packages/hermes_tools/` client library and OpenAPI tool definition generator for Hermes integration.
- Restricted read-only research endpoint acting as the gateway for TradingAgents escalation.
- Architecture verification suite proving the financial core operates with 100% correctness when Hermes is stopped or absent.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 7.1 | Service token authentication and role-based authority middleware in `apps/api` | Authentication middleware validating `HERMES_SERVICE_TOKEN` and `TRADINGAGENTS_SERVICE_TOKEN`, enforcing endpoint authorization matrix and rejecting service tokens on owner routes | - | AC-7.1, AC-7.2, AC-7.3 |
| 7.2 | Market and analytics tool API endpoints with service token authorization | Tool endpoints (`market.get_price`, `market.get_candles`, `market.get_orderbook`, `market.get_recent_trades`, `analytics.get_indicators`, `analytics.get_market_regime`) with Decimal formatting and correlation headers | 7.1 | AC-7.4 |
| 7.3 | Portfolio and strategy query tool API endpoints for Hermes | Tool endpoints (`portfolio.get_balance`, `portfolio.get_positions`, `portfolio.get_performance`, `strategy.list`, `strategy.get`, `strategy.performance`) querying authoritative PostgreSQL state | 7.1 | AC-7.5 |
| 7.4 | Trade proposal management API endpoints in `apps/api` | Endpoints (`proposal.create`, `proposal.update`, `proposal.cancel`) validating proposal payloads, calculating idempotency keys, executing proposal-time risk checks, and blocking auto-execution | 7.1 | AC-7.6, AC-7.7 |
| 7.5 | Trader Constitution and procedural trading skill repository structure in `skills/trading/` | File-based skill directories (`risk-management`, `trend-following`, `breakout`, `mean-reversion`, `market-structure`) with `SKILL.md` and `rules.yaml`, plus Trader Constitution document | - | AC-7.8 |
| 7.6 | Trading knowledge base vector ingestion and semantic retrieval service using pgvector | Ingestion pipeline chunking trading literature, storing vector embeddings in PostgreSQL `trading_knowledge_embeddings`, and exposing `knowledge.search` semantic retrieval tool | - | AC-7.9 |
| 7.7 | Agent observation and qualitative trade memory persistence endpoints in `apps/api` | Endpoints (`memory.store_trade_observation`, `memory.search_trade_history`) persisting qualitative reflections to PostgreSQL `agent_observations` | 7.1 | AC-7.10 |
| 7.8 | Hermes tool client package and OpenAPI schema generator in `packages/hermes_tools/` | Client SDK and OpenAPI tool schema exporter mapping platform endpoints to Hermes tool definitions | 7.2, 7.3, 7.4, 7.6, 7.7 | AC-7.11 |
| 7.9 | TradingAgents restricted read-only gateway API endpoints | Restricted tool endpoint `research.deep_analyze` allowing read-only market and analytics context retrieval with `TRADINGAGENTS_SERVICE_TOKEN` | 7.1, 7.2 | AC-7.3, AC-7.12 |
| 7.10 | Financial core isolation verification proving full platform operation with Hermes absent | Automated tests verifying market data ingestion, quantitative analytics, portfolio accounting, risk monitoring, and reconciliation run uninterrupted with Hermes stopped | 7.2, 7.3, 7.4 | AC-7.13 |
| 7.11 | Comprehensive negative and positive authorization test suite for service tokens | Security test suite asserting HTTP 403 on forbidden routes (trade approval, risk mutation, kill switch, order submit, credential access) and verifying valid tool calls | 7.1, 7.2, 7.3, 7.4, 7.9 | AC-7.1, AC-7.2, AC-7.3, AC-7.6, AC-7.14 |

### Acceptance criteria
- **AC-7.1**: Service token authentication middleware verifies `HERMES_SERVICE_TOKEN` and `TRADINGAGENTS_SERVICE_TOKEN` on all agent-facing internal HTTP endpoints.
- **AC-7.2**: Hermes service token is strictly authorized to read market data, quantitative analytics, portfolio state, and strategy records, and to create/update/cancel proposals; attempts to approve a trade, modify risk rules, access the kill switch, submit an exchange order, or read exchange credentials return HTTP 403 Forbidden.
- **AC-7.3**: TradingAgents service token is strictly restricted to read-only market data and analytics; attempts to access portfolio balances, read strategies, create proposals, or access owner endpoints return HTTP 403 Forbidden.
- **AC-7.4**: Tool endpoints for `market.*` and `analytics.*` return structured JSON payloads with Decimal formatting and correlation headers.
- **AC-7.5**: Tool endpoints for `portfolio.*` and `strategy.*` return authoritative financial state queried from PostgreSQL, never relying on agent memory.
- **AC-7.6**: `proposal.create` endpoint validates proposal schema, derives deterministic idempotency key, executes proposal-time risk evaluation, and persists the record to PostgreSQL with `correlation_id`.
- **AC-7.7**: Proposals cannot be approved via agent tool endpoints; approval sub-routes require an active owner session cookie with CSRF token.
- **AC-7.8**: `skills/trading/` contains structured trading skills (`risk-management`, `trend-following`, `breakout`, `mean-reversion`, `market-structure`) with `SKILL.md` instructions and `rules.yaml` constraints, plus the Trader Constitution document.
- **AC-7.9**: pgvector knowledge base ingestion embeds trading literature and reference knowledge into PostgreSQL, providing similarity search via `knowledge.search` tool endpoint.
- **AC-7.10**: `memory.store_trade_observation` and `memory.search_trade_history` persist and retrieve qualitative post-trade reflections to PostgreSQL without affecting authoritative accounting ledgers.
- **AC-7.11**: `packages/hermes_tools/` provides typed client bindings and OpenAPI specifications matching Hermes custom tool definitions.
- **AC-7.12**: Read-only research endpoint `research.deep_analyze` exists as an internal gateway for specialist research escalation.
- **AC-7.13**: Stopping, crashing, or removing the Hermes agent runtime causes zero degradation to market ingestion, quantitative analytics, portfolio accounting, risk monitoring, or exchange reconciliation.
- **AC-7.14**: Automated security tests verify every negative authorization rule: service token on approval route, service token on risk-write route, service token on kill-switch route, TradingAgents token on portfolio route, and missing/invalid token rejection.

### Explicitly out of scope
- Continuous Hermes agent execution loop and prompt scheduling (belongs to Foundation 8)
- External social media and news feed ingestion workers (belongs to Foundation 9)
- TradingAgents multi-agent LangGraph service implementation (belongs to Foundation 10)
- Dashboard UI proposal review interface (belongs to Foundation 11)
- Live Binance API keys and execution (belongs to Foundation 12)
