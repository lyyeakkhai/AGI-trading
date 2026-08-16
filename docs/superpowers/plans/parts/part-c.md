## Foundation 8: Hermes Main Trading Agent

**Goal:** Deploy the isolated Hermes runtime as the continuous Main Trading Agent that monitors markets, retrieves quantitative context, applies procedural trading skills, evaluates hypotheses, and submits structured trade proposals for deterministic risk validation.
**Depends on:** 0, 1, 2, 3, 4, 5, 6, 7
**Unlocks:** 12
**PRD sections:** 1, 2, 3, 10, 11, 12, 13, 15, 16, 24, 42, 43, 44, 70.2, 70.3, 71, 73, 77, 87, 89
**Release gate:** Gate 3 (Agent Intelligence)

### Deliverables
- Containerized Hermes trading profile runtime (`hermes-trader`) communicating over the private Docker network using `HERMES_SERVICE_TOKEN`.
- Continuous agent orchestrator loop responding to opportunity events published to Redis Streams.
- Context assembly engine integrating Trader Constitution, pgvector knowledge retrieval, procedural trading skills, and quantitative strategy performance records.
- Two-speed decision routing logic implementing fast-path quantitative evaluation and deciding when to escalate to deep research.
- Structured Trade Proposal generator producing standardized proposal payloads containing directional thesis, entry constraints, stop loss, take-profit targets, supporting evidence, contradicting evidence, and invalidation criteria.
- Proposal submission client calling `/api/v1/proposals` and receiving immutable `RiskDecision` records.
- Episodic experience memory recorder storing trade reflections and market observations into PostgreSQL with pgvector embeddings.
- Negative security boundary test suite verifying that Hermes cannot approve trades, modify risk limits, access database credentials, or read exchange API keys.
- AI evaluation harness measuring proposal completeness, tool-use correctness, and strategy rule compliance.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 8.1 | Configure isolated Hermes trading profile and container deployment | `agent/hermes-config/` profile files, Docker service `hermes-trader` in `docker-compose.yml`, and typed Hermes client settings in `packages/config/` | - | AC-8.1, AC-8.7 |
| 8.2 | Build event-driven opportunity wake-up worker | `services/hermes/orchestrator.py` consuming `opportunity.detected` events from Redis Streams with consumer group checkpointing | 8.1 | AC-8.2 |
| 8.3 | Implement context assembly and memory retrieval pipeline | `services/hermes/context.py` loading Trader Constitution, pgvector knowledge embeddings, and active working session state | 8.1 | AC-8.3 |
| 8.4 | Wire procedural trading skill loader and quantitative strategy memory queries | `services/hermes/skills.py` loading markdown procedural skills from `skills/trading/` and querying strategy win rates from PostgreSQL | 8.3 | AC-8.3, AC-8.4 |
| 8.5 | Implement fast-path analytical reasoning and hypothesis generator | `services/hermes/reasoning.py` performing multi-timeframe quantitative confirmation using indicators, regime classification, and volume analysis | 8.4 | AC-8.4, AC-8.5 |
| 8.6 | Build structured Trade Proposal generator with evidence and invalidation synthesis | `services/hermes/proposal_builder.py` creating complete `TradeProposal` payloads with supporting evidence, explicit contradicting points, and invalidation rules | 8.5 | AC-8.5, AC-8.6 |
| 8.7 | Implement proposal submission to API gateway and risk decision bridge | `services/hermes/proposal_client.py` submitting proposals to `/api/v1/proposals` via `HERMES_SERVICE_TOKEN` and parsing returned `RiskDecision` records | 8.6 | AC-8.6, AC-8.7 |
| 8.8 | Implement episodic experience recorder and post-trade reflection loop | `services/hermes/memory_recorder.py` storing trade observations and qualitative reflections into `agent_observations` via pgvector embeddings | 8.3 | AC-8.8 |
| 8.9 | Build negative authorization and security boundary test suite | `tests/safety/test_hermes_security_boundary.py` asserting Hermes cannot approve proposals, alter risk limits, or access exchange credentials | 8.1, 8.7 | AC-8.7, AC-8.9 |
| 8.10 | Build AI evaluation and rule compliance test harness | `tests/unit/test_hermes_evaluation.py` scoring proposal completeness, hallucination rates, and compliance with Constitution principles | 8.6 | AC-8.10 |

### Acceptance criteria
- **AC-8.1**: Hermes runs in a dedicated container (`hermes-trader`) with an isolated profile, communicating over the internal Docker network with `HERMES_SERVICE_TOKEN`, and holds zero exchange credentials or database admin privileges in its environment.
- **AC-8.2**: When an `opportunity.detected` event is published to Redis Streams, the orchestrator wakes the agent, processes the payload within 5 seconds, and maintains its stream consumer group offset.
- **AC-8.3**: Context assembly injects the immutable Trader Constitution on every run, retrieves relevant trading principles from pgvector using semantic search, and queries historical strategy performance without memorizing raw statistical tables.
- **AC-8.4**: Hermes successfully parses and executes procedural trading skills from `skills/trading/`, verifying setup conditions, regime compatibility, and mandatory entry/exit parameters.
- **AC-8.5**: Fast-path reasoning evaluates multi-timeframe indicators (15m, 1h, 4h) and generates directional hypotheses without blocking on external specialist services.
- **AC-8.6**: Every generated trade proposal conforms to the `TradeProposal` schema, specifying symbol, direction, entry constraints, stop loss, take-profit targets, decimal position risk percentage, supporting indicators, explicit contradicting evidence, and an unambiguous invalidation condition.
- **AC-8.7**: Proposals submitted to `/api/v1/proposals` carry `correlation_id` and service authentication; the API records the proposal and returns an immutable `RiskDecision` (APPROVED, REJECTED, or MODIFIED) with attributable rule codes.
- **AC-8.8**: Post-trade evaluations and market reflections are stored into episodic memory via pgvector embeddings without modifying approved strategy rules or risk configurations.
- **AC-8.9**: Safety tests verify that requests from Hermes attempting to call owner approval endpoints (`/api/v1/proposals/{id}/approve`), update risk parameters, or execute orders directly are rejected with HTTP 403 Forbidden.
- **AC-8.10**: The AI evaluation suite proves that 100% of generated test proposals contain non-empty contradicting evidence sections, valid invalidation criteria, and zero hallucinated market prices.

### Explicitly out of scope
- Multi-agent competition and Agent Arena (deferred post-MVP).
- TradingAgents multi-agent committee service implementation (belongs to Foundation 10).
- Social and news intelligence stream ingestion (belongs to Foundation 9).
- Web dashboard interface for proposal inspection and manual approvals (belongs to Foundation 11).
- Live Binance order placement (belongs to Foundation 12).

---

## Foundation 9: Social + News Intelligence

**Goal:** Ingest and normalize real-time X social conversations and cryptocurrency news events into structured metrics and correlation data to provide contextual market evidence for trading decisions.
**Depends on:** 0, 1, 2
**Unlocks:** nothing structurally; enriches 11 and 12
**PRD sections:** 38, 39, 40, 41, 61, 71.1, 77, 83, 84
**Release gate:** none

### Deliverables
- Social Intelligence Worker (`services/intelligence/social_worker.py`) connecting to X API filtered streaming endpoints with rate limiting, exponential backoff, and disconnection recovery.
- Social metrics normalization engine computing mention counts, mention velocity, unique authors, sentiment score, and spam probability for BTC and ETH.
- News Ingestion Worker (`services/intelligence/news_worker.py`) consuming structured cryptocurrency news feeds and categorizing events (regulatory, exchange, ETF, macroeconomic, protocol, security).
- Intelligence domain models and TimescaleDB hypertables (`social_metrics` with explicit `window` column, `news_events`, `event_correlations`).
- Event correlation engine (`services/intelligence/correlator.py`) linking social velocity surges and major news releases with price and volume anomalies.
- Internal intelligence REST endpoints (`/api/v1/intelligence/*`) and Hermes agent tools (`research.get_news`, `research.get_social_trends`, `research.search_market_events`).
- Safety guardrails ensuring social and news signals operate strictly as contextual evidence and never trigger autonomous orders.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 9.1 | Define intelligence domain models and TimescaleDB hypertables | `packages/domain/intelligence.py` and Alembic migration creating `social_metrics` (with explicit `window` column), `news_events`, and `event_correlations` hypertables | - | AC-9.1 |
| 9.2 | Build X API client and streaming ingestion worker | `services/intelligence/x_client.py` and `services/intelligence/social_worker.py` ingesting filtered post streams with backoff and reconnection logic | 9.1 | AC-9.2, AC-9.6 |
| 9.3 | Implement social metrics normalization and aggregation engine | `services/intelligence/social_metrics.py` computing rolling 1m, 15m, and 1h mention velocity, unique-author ratio, sentiment delta, and spam filtering | 9.2 | AC-9.3 |
| 9.4 | Build crypto news ingestion worker and event categorizer | `services/intelligence/news_worker.py` polling and normalizing news feeds into structured `NewsEvent` records with importance ratings | 9.1 | AC-9.4 |
| 9.5 | Build market and event correlation engine | `services/intelligence/correlator.py` correlating social velocity spikes (>100%) and high-impact news with 15m price/volume anomalies | 9.3, 9.4 | AC-9.5 |
| 9.6 | Implement intelligence REST API endpoints in API gateway | `apps/api/routers/intelligence.py` providing `/api/v1/intelligence/social`, `/news`, and `/correlations` with owner and service authentication | 9.1, 9.5 | AC-9.6 |
| 9.7 | Implement Hermes intelligence tool integrations | `packages/hermes_tools/intelligence.py` exposing `research.get_news`, `research.get_social_trends`, and `research.search_market_events` | 9.6 | AC-9.6, AC-9.7 |
| 9.8 | Build safety and constraint test suite for intelligence layer | `tests/safety/test_intelligence_safety.py` verifying social and news signals cannot independently generate proposals, risk decisions, or orders | 9.6, 9.7 | AC-9.8 |

### Acceptance criteria
- **AC-9.1**: Database schema defines TimescaleDB hypertables for `social_metrics` (with explicit `window` column instead of encoding the window in the table name) and indexed tables for `news_events` and `event_correlations`, partitioned by timestamp with foreign key references to assets.
- **AC-9.2**: The social worker connects to X streaming endpoints using `X_API_TOKEN`, filters for BTC and ETH keywords/cashtags, and handles network disconnects with exponential backoff without crashing.
- **AC-9.3**: Social metrics normalization aggregates raw posts into fixed time windows, computing mention velocity percentage change, unique author count, normalized sentiment (-1.0 to +1.0), and spam classification score.
- **AC-9.4**: The news ingestion worker normalizes incoming news items into `NewsEvent` records containing headline, summary, affected assets, category code, importance level (LOW, MEDIUM, HIGH, CRITICAL), and timestamp.
- **AC-9.5**: The correlation engine flags compound events when social mention velocity exceeds 100% alongside concurrent volume increases (>30%) and price breakouts, publishing `intelligence.correlated_event` messages to Redis.
- **AC-9.6**: REST API endpoints under `/api/v1/intelligence/` return paginated, queryable social metrics, recent news events, and correlation alerts, accessible by both the frontend (owner session) and Hermes (`HERMES_SERVICE_TOKEN`).
- **AC-9.7**: Hermes successfully queries `research.get_social_trends` and `research.get_news` via tool calls, receiving structured JSON responses for inclusion in proposal supporting evidence.
- **AC-9.8**: Automated safety tests prove that extreme social sentiment spikes or breaking news alerts cannot trigger trade proposals or order submissions without underlying quantitative opportunity detection and risk validation.

### Explicitly out of scope
- Autonomous trade execution triggered directly by social or news spikes (strictly prohibited by PRD section 39).
- Social sentiment chart UI components (belongs to Foundation 11).
- Multi-agent debate between bull and bear sentiment analysts (belongs to Foundation 10).

---

## Foundation 10: TradingAgents Deep Research Escalation

**Goal:** Implement the TradingAgents specialist research service as an on-demand, isolated multi-agent escalation committee accessible through a controlled tool API for high-uncertainty or high-value trade opportunities.
**Depends on:** 0, 1, 7, 8
**Unlocks:** nothing structurally; enriches 11 and 12
**PRD sections:** 10.1, 13, 14, 15, 16, 62, 63, 70.2, 70.3, 71.1, 73
**Release gate:** none

### Deliverables
- Containerized TradingAgents research service (`tradingagents-service`) running an isolated multi-agent orchestration runtime communicating over the private Docker network.
- Specialist agent committee implementation incorporating Technical Analyst, Sentiment Analyst, News Analyst, Fundamental Analyst, Bull Researcher, Bear Researcher, and Synthesis roles.
- Structured research API endpoint (`POST /internal/v1/deep-analyze`) protected by `TRADINGAGENTS_SERVICE_TOKEN`.
- Hermes integration tool `research.deep_analyze(symbol, timeframe, context)` with configurable timeout, retry, and cancellation handling.
- Escalation policy module in Hermes triggering deep analysis only when fast-path confidence is uncertain, market regime is mixed, or high-value setups allow additional reasoning latency.
- Non-blocking fast-path fallback mechanism ensuring that TradingAgents unavailability or timeouts never delay routine fast-path trading operations.
- Security isolation test suite verifying that TradingAgents has read-only access to market data and cannot access exchange keys, portfolio balances, or order submission endpoints.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 10.1 | Scaffold TradingAgents container and service runtime | `services/tradingagents/` directory, Docker service `tradingagents-service` in `docker-compose.yml`, and configuration models in `packages/config/` | - | AC-10.1, AC-10.8 |
| 10.2 | Implement specialist research analyst roles | `services/tradingagents/specialists/` implementing Technical, Sentiment, News, Fundamental, Bull Researcher, Bear Researcher, and Synthesizer agents | 10.1 | AC-10.2 |
| 10.3 | Define research request and response domain schemas | `packages/domain/research.py` defining `DeepResearchRequest`, `SpecialistReport`, `BullBearDebateResult`, and `SynthesizedResearchReport` | 10.1 | AC-10.3 |
| 10.4 | Build internal research REST endpoint with service token validation | `services/tradingagents/server.py` exposing `POST /internal/v1/deep-analyze` with `TRADINGAGENTS_SERVICE_TOKEN` authorization | 10.2, 10.3 | AC-10.4 |
| 10.5 | Implement Hermes `research.deep_analyze` tool client | `packages/hermes_tools/deep_research.py` implementing HTTP client with timeout (30s default), retry, and error normalization | 10.4 | AC-10.4, AC-10.5 |
| 10.6 | Implement Hermes escalation routing and decision policy | `services/hermes/escalation_policy.py` evaluating setup uncertainty, regime conflict, and timeframe lifetime to decide whether to escalate | 10.5 | AC-10.5, AC-10.6 |
| 10.7 | Integrate deep research findings into Trade Proposal generation | `services/hermes/proposal_builder.py` updated to incorporate Bull/Bear arguments and specialist consensus into proposal evidence fields | 10.3, 10.6 | AC-10.3, AC-10.7 |
| 10.8 | Implement fast-path fallback and graceful degradation tests | `tests/unit/test_tradingagents_fallback.py` asserting fast-path trades proceed unimpeded when TradingAgents is offline, slow, or returning errors | 10.5, 10.6 | AC-10.6, AC-10.8 |
| 10.9 | Build security boundary and permission isolation test suite | `tests/safety/test_tradingagents_security_boundary.py` asserting TradingAgents cannot read portfolio state, create proposals, or access exchange credentials | 10.1, 10.4 | AC-10.9 |

### Acceptance criteria
- **AC-10.1**: The TradingAgents service runs in an isolated container (`tradingagents-service`) on the internal Docker network, holding `TRADINGAGENTS_SERVICE_TOKEN` and LLM gateway access, with zero exchange credentials or write access to the platform database.
- **AC-10.2**: The specialist committee coordinates technical, sentiment, news, and fundamental analysis roles, producing structured Bull vs Bear debates and a synthesized research summary.
- **AC-10.3**: Research outputs follow the `SynthesizedResearchReport` schema, providing a consensus rating (BULLISH, BEARISH, NEUTRAL), confidence score (0.0 to 1.0), key arguments, risk factors, and invalidation triggers.
- **AC-10.4**: The internal endpoint `POST /internal/v1/deep-analyze` validates incoming service tokens, rejects unauthorized requests with HTTP 401/403, and accepts requests containing asset symbol, timeframe, and market context.
- **AC-10.5**: Hermes invokes `research.deep_analyze` via a controlled tool call, successfully passing context and receiving structured multi-agent research results.
- **AC-10.6**: Escalation policy routes only complex, conflicting, or high-uncertainty opportunities to TradingAgents, keeping standard high-confidence opportunities on the fast path.
- **AC-10.7**: When deep research is used, the resulting trade proposal embeds both the Bull and Bear arguments and specialist findings in its supporting and contradicting evidence sections.
- **AC-10.8**: If the TradingAgents service fails, times out (exceeding 30 seconds), or returns a 500 error, Hermes catches the failure, falls back to fast-path analytics or declines to propose, and the fast-path pipeline continues without blocking.
- **AC-10.9**: Safety tests confirm that TradingAgents tokens are rejected on all portfolio endpoints, proposal creation routes, risk configuration endpoints, and kill switch controls.

### Explicitly out of scope
- Autonomous order placement or proposal generation by TradingAgents (proposals are created exclusively by Hermes).
- Replacing platform market data ingestion, TimescaleDB, or Risk Engine with TradingAgents internals (forbidden by PRD section 14.3).
- Visualizing multi-agent conversation graphs in the dashboard (belongs to Foundation 11).

---

## Foundation 11: Dashboard

**Goal:** Deliver the Next.js single-owner trading command center with secure session authentication, real-time WebSocket telemetry, interactive financial charts, trade proposal approval workflows, audit journals, system readiness monitoring, and Prometheus/Grafana observability.
**Depends on:** 0, 1, 2, 3, 4, 5, 6, 7, 8
**Unlocks:** 12
**PRD sections:** 8.2, 25, 45, 46, 47, 48, 49, 50, 51, 64, 65, 66.5, 67, 68, 70.1, 74, 75, 84, 88, 89
**Release gate:** Gate 4 (Paper Trading / Dashboard)

### Deliverables
- Single-owner authentication module in `apps/api` with Argon2id password hashing, mandatory TOTP enrollment and verification, signed HTTP-only session cookies, CSRF protection, and login rate limiting.
- Production Next.js dashboard application in `apps/web` with TypeScript strict mode, responsive layout, dark-mode design, and zero frontend financial arithmetic.
- Real-time WebSocket streaming gateway in `apps/api` (`/ws/v1/stream`) and resilient client subscription manager in `apps/web`.
- Overview page (`/`) displaying account equity, available balance, daily/total return, active risk budget, market regimes, and live agent status.
- Market View page (`/markets/[symbol]`) featuring TradingView Lightweight Charts, multi-timeframe candle rendering, indicator overlays, and signal markers.
- Agent View page (`/agent`) showing Hermes operational state, current tasks, recent observations, and reasoning logs.
- Trade Proposal View page (`/proposals`) displaying full proposals, supporting/contradicting evidence, and interactive Approve / Reject / Watch controls with live TTL countdown.
- Strategy Analytics page (`/strategies`) ranking strategies by win rate, profit factor, and drawdown across regimes, comparing against BTC/ETH buy-and-hold baselines.
- Trade Journal and Audit Log Viewer (`/journal`) reconstructing complete trade lifecycles from `correlation_id`.
- System Health, Readiness, and Persistent Kill Switch control page (`/system`) displaying granular `/health/trading` checks and emergency halt controls.
- Prometheus and Grafana containers in `docker-compose.yml` with pre-configured metric scrapers, alert rules, and trading performance dashboards.
- Caddy reverse proxy configuration routing web traffic, API routes, WebSocket streams, and Grafana behind unified security headers.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 11.1 | Implement owner authentication, TOTP, and session cookie management in API | `apps/api/routers/auth.py` and `packages/auth/` implementing Argon2id hashing, TOTP setup/verification, signed HTTP-only cookies, CSRF tokens, and lockout rules | - | AC-11.1 |
| 11.2 | Implement real-time WebSocket streaming hub in API and client hook in web | `apps/api/routers/websocket.py` broadcasting Redis events and `apps/web/hooks/useRealtimeStream.ts` handling client reconnection and subscriptions | - | AC-11.2 |
| 11.3 | Build dashboard shell, navigation, and Overview page | `apps/web/app/layout.tsx` with environment banner (`APP_ENV`, `TRADING_MODE`, `LIVE_TRADING_ENABLED`), sidebar, and `apps/web/app/page.tsx` showing portfolio summary and risk meters | 11.1, 11.2 | AC-11.3 |
| 11.4 | Build Market View page with TradingView Lightweight Charts | `apps/web/app/markets/[symbol]/page.tsx` rendering multi-timeframe candlestick charts, volume bars, indicator overlays, and signal annotations | 11.2, 11.3 | AC-11.4 |
| 11.5 | Build Agent View page and live reasoning activity stream | `apps/web/app/agent/page.tsx` displaying Hermes status, uptime, recent observations, candidate opportunities, and live activity log | 11.2, 11.3 | AC-11.5 |
| 11.6 | Build Trade Proposal View and Owner Approval workflow component | `apps/web/app/proposals/page.tsx` rendering structured proposals, evidence cards, invalidation triggers, and Approve/Reject/Watch buttons with TTL countdown | 11.1, 11.2, 11.3 | AC-11.6 |
| 11.7 | Build Strategy Analytics and baseline comparison page | `apps/web/app/strategies/page.tsx` displaying strategy performance metrics broken down by regime and timeframe, benchmarked against BTC/ETH buy-and-hold | 11.3 | AC-11.7 |
| 11.8 | Build Trade Journal and audit lifecycle reconstruction viewer | `apps/web/app/journal/page.tsx` displaying historical trades with full audit trail reconstruction, P&L, execution slippage, and post-trade reflections | 11.3 | AC-11.8 |
| 11.9 | Build System Health, Trading Readiness, and Kill Switch control page | `apps/web/app/system/page.tsx` displaying checklist of `/health/trading` preconditions and instant fail-safe Kill Switch activation/deactivation buttons | 11.1, 11.3 | AC-11.9 |
| 11.10 | Integrate Prometheus and Grafana monitoring containers | `infrastructure/prometheus/` config, `infrastructure/grafana/` provisioned dashboards, and metric export endpoints in `apps/api` and workers | - | AC-11.10 |
| 11.11 | Configure Caddy reverse proxy for frontend, API, WebSockets, and metrics | `infrastructure/caddy/Caddyfile` proxying all services with security headers, TLS readiness, and WebSocket support | 11.1, 11.10 | AC-11.11 |
| 11.12 | Implement end-to-end dashboard integration and paper trading loop tests | `tests/integration/test_dashboard_e2e_loop.py` validating complete flow: proposal notification, owner approval, paper execution, WebSocket update, and journal entry | 11.6, 11.9, 11.11 | AC-11.12 |

### Acceptance criteria
- **AC-11.1**: The owner can log in using password credentials and standard TOTP authenticator code, receiving a signed, short-lived, HTTP-only, Secure, SameSite session cookie (`DASHBOARD_AUTH_SECRET`), with state-changing requests protected by CSRF tokens and rate-limiting after 5 failed attempts.
- **AC-11.2**: The WebSocket gateway (`/ws/v1/stream`) delivers low-latency broadcasts of `PRICE_UPDATED`, `SIGNAL_DETECTED`, `PROPOSAL_CREATED`, `ORDER_FILLED`, `RISK_ALERT`, and `AGENT_ACTIVITY` events, automatically reconnecting upon disconnection.
- **AC-11.3**: The header displays the active `APP_ENV`, `TRADING_MODE`, and `LIVE_TRADING_ENABLED` values prominently, and the Overview page renders portfolio equity, balance, P&L, risk drawdowns, and regime indicators calculated strictly by the backend.
- **AC-11.4**: The Market View renders responsive candlestick charts (15m, 1h, 4h) via TradingView Lightweight Charts, displaying volume profiles, support/resistance lines, indicator subplots (RSI, MACD, ATR), and detected signal markers.
- **AC-11.5**: The Agent View displays Hermes operational state, current task, recent observations, candidate opportunities, and completed analyses in real time.
- **AC-11.6**: The Trade Proposal screen shows full setup details, supporting/contradicting evidence, and active TTL countdown; clicking Approve issues `POST /api/v1/proposals/{id}/approve` with owner session authentication, binding to that specific proposal and disabling duplicate clicks.
- **AC-11.7**: Strategy Analytics renders performance tables (win rate, profit factor, max drawdown, Sharpe ratio) categorized by market regime, comparing agent returns against passive BTC and ETH buy-and-hold benchmarks.
- **AC-11.8**: The Trade Journal lists completed trades and allows selecting any trade to reconstruct its full audit history (signal -> proposal -> risk decision -> approval -> execution -> fills -> P&L -> reflection) via `correlation_id`.
- **AC-11.9**: The System page lists each item of the PRD section 75.2 Trading Readiness Checklist individually with pass/fail status, and provides an owner-authenticated Kill Switch control that persists state in PostgreSQL and immediately disables new orders.
- **AC-11.10**: Prometheus scrapes API and worker metrics, and Grafana displays provisioned dashboards for system health, latency, database pools, Redis lag, LLM token costs, and trading performance.
- **AC-11.11**: Caddy proxies incoming traffic on host ports 80/443, routing `/` to Next.js, `/api/*` and `/ws/*` to FastAPI, and `/grafana/*` to Grafana with strict transport security and CORS headers.
- **AC-11.12**: Integration tests prove that when an opportunity generates a proposal in paper mode, it appears on the dashboard in real time, the owner approves it, the paper execution adapter fills the order, and the updated position and journal entry reflect immediately on the UI.

### Explicitly out of scope
- Multi-user access control, user registration, or public internet exposure.
- Autonomous live order placement without owner approval (prohibited in MVP 1).
- Native mobile application development (Next.js responsive layout satisfies mobile browser use).
- Embedding exchange API keys in frontend code or JavaScript bundles.

---

## Foundation 12: Tiny Live Binance Execution

**Goal:** Enable safe, real-money spot execution on Binance for BTC/USDT and ETH/USDT with tiny capital, strictly enforcing pre-flight Gate 5 release criteria, sole-custody credential isolation in the Execution Service, pre-submission precondition validation, database-backed idempotency, and immediate exchange reconciliation.
**Depends on:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 11
**Unlocks:** nothing, this is the final foundation
**PRD sections:** 8.1, 8.2, 8.3, 8.4, 25, 26, 27, 28, 29, 30, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 85, 89
**Release gate:** Gate 5 (Tiny Live Trading) and Gate 6 (MVP Validation)

### Deliverables
- Gate 5 Pre-Flight release verification suite and operational rehearsal proving secret rotation, backup restore, out-of-band alerting, and clean audit reconstruction.
- Dedicated `execution-service` container configuration with sole-custody injection of `BINANCE_API_KEY` and `BINANCE_SECRET_KEY`, and startup permission verifier confirming trade-only access and absence of withdrawal permission.
- `BinanceExecutionAdapter` implementing the `ExecutionAdapter` interface for spot order placement, status queries, fill retrieval, and cancellation via CCXT with fixed Decimal precision.
- Pre-submission live execution precondition evaluator checking all 11 independent conditions (PRD section 8.3) immediately before every order dispatch.
- Database-backed financial command idempotency engine mapping platform intent to unique `client_order_id` values and enforcing PostgreSQL unique constraints.
- In-flight execution state machine and recovery worker for `SUBMITTING` and `UNKNOWN` states, resolving ambiguous orders by exchange query rather than blind resubmission.
- Live exchange reconciliation worker synchronizing balances, open orders, and fills between Binance and the platform ledger, enforcing persistent `reconciliation_blocked` locks on divergence.
- Production Caddy hardening with automated TLS certificates, strict security headers, and IP allowlisting.
- Out-of-band notification dispatcher delivering high-priority alerts for kill switch activation, critical reconciliation divergences, and precondition failures.
- End-to-end tiny live trading verification test suite proving the full owner-approved execution, risk re-validation, fill processing, and post-trade accounting loop.

### Tasks
| # | Task | Deliverable | Depends on | ACs |
|---|---|---|---|---|
| 12.1 | Execute Gate 5 pre-flight release checklist and operational rehearsal | `tests/safety/test_gate5_preflight.py` and runbook documenting secret rotation rehearsal, backup/restore test, and audit trail reconstruction verification | - | AC-12.1 |
| 12.2 | Configure Execution Service container with sole-custody credentials and permission verifier | `services/execution/` container wiring in `docker-compose.yml` and `services/execution/credential_verifier.py` validating trade permission and confirming withdrawal permission is absent | 12.1 | AC-12.2 |
| 12.3 | Implement `BinanceExecutionAdapter` satisfying `ExecutionAdapter` contract | `services/execution/adapters/binance.py` implementing `submit`, `cancel`, `get_order_status`, and `get_fills` using CCXT with Decimal arithmetic and normalized errors | 12.2 | AC-12.3 |
| 12.4 | Implement pre-submission live execution precondition evaluator | `services/execution/preconditions.py` evaluating all PRD section 8.3 independent checks immediately prior to every order submission (fail closed) | 12.2, 12.3 | AC-12.4 |
| 12.5 | Wire Foundation 3 idempotency engine into live adapter and verify unique constraint against real exchange | `services/execution/idempotency.py` integrating the F3-owned idempotency engine with the live `BinanceExecutionAdapter`, deriving `client_order_id`, and proving the database unique constraint holds under real exchange responses | 12.3 | AC-12.5 |
| 12.6 | Wire Foundation 3 execution state machine into live recovery worker resolving `UNKNOWN` by Binance query | `services/execution/recovery.py` using the F3-owned state machine for `PENDING`, `SUBMITTING`, `SUBMITTED`, and `UNKNOWN` states, adding live Binance query resolution for ambiguous orders | 12.3, 12.5 | AC-12.6 |
| 12.7 | Wire Foundation 3 reconciliation engine with live Binance comparison adapter | `services/reconciliation/worker.py` using the F3-owned reconciliation engine with a live Binance adapter comparing balances, orders, and fills, setting `reconciliation_blocked` on critical divergence | 12.3, 12.6 | AC-12.7 |
| 12.8 | Harden Caddy reverse proxy for production deployment | `infrastructure/caddy/Caddyfile` updated with automated Let's Encrypt TLS, rate limiting, and IP allowlist restrictions | - | AC-12.8 |
| 12.9 | Implement out-of-band emergency alerting dispatcher | `packages/alerting/dispatcher.py` sending alerts outside the dashboard for kill switch activation, key permission errors, or reconciliation blocks | - | AC-12.9 |
| 12.10 | Implement tiny live trading end-to-end verification test suite | `tests/safety/test_tiny_live_execution.py` validating owner-approved execution, risk check, Binance order submission, fill recording, and post-trade accounting | 12.4, 12.5, 12.7 | AC-12.10 |

### Acceptance criteria
- **AC-12.1**: All Gate 5 release preconditions pass before live trading is enabled: secret rotation is rehearsed in paper mode, a database backup is restored and verified, out-of-band alerting is tested, and complete trade lifecycle reconstruction from `correlation_id` succeeds.
- **AC-12.2**: The Execution Service is the sole container receiving `BINANCE_API_KEY` and `BINANCE_SECRET_KEY`; at startup, it verifies credentials against Binance, confirms trade permission is active, asserts withdrawal permission is ABSENT, and aborts startup if withdrawal permission is present.
- **AC-12.3**: `BinanceExecutionAdapter` satisfies the `ExecutionAdapter` contract, translating `ExecutionRequest` into Binance spot orders, formatting amounts to symbol step sizes and minimum notionals using fixed `Decimal` math, and normalizing exchange errors.
- **AC-12.4**: Immediately before dispatching any order, the precondition evaluator verifies all 11 conditions: `APP_ENV=production`, `TRADING_MODE=live`, `LIVE_TRADING_ENABLED=true`, valid exchange credentials with zero withdrawal rights, symbol in allowlist, market data fresh (< staleness limit), Risk Engine approved, portfolio reconciled, kill switch inactive, valid unexpired owner approval, and unused idempotency key. Any unmet check aborts execution.
- **AC-12.5**: The idempotency engine persists `idempotency_key` with a PostgreSQL unique constraint before contacting Binance; retried submissions return the existing outcome, and `client_order_id` is sent to Binance to prevent exchange-side duplication.
- **AC-12.6**: If an order submission experiences a network timeout or ambiguous response, its state is marked `UNKNOWN` and persisted; the recovery worker queries Binance by `client_order_id` to adopt exchange state, never blindly resubmitting.
- **AC-12.7**: The reconciliation worker compares platform balances, open orders, and fills against Binance on startup, periodically, and after reconnects; any unexpected balance or order divergence sets `reconciliation_blocked=true`, which prevents new live submissions until cleared by the owner.
- **AC-12.8**: Caddy is hardened for production with automated TLS termination, strict security headers, and IP allowlist enforcement restricting access to authorized operator IPs.
- **AC-12.9**: Critical events (kill switch trigger, unexpected withdrawal permission, critical divergence, database disconnect) immediately dispatch alerts to an out-of-band channel outside the dashboard.
- **AC-12.10**: End-to-end verification proves that a tiny real spot order (within configured minimum notional limits for BTC/USDT or ETH/USDT) executes only after owner approval and risk re-validation, records raw exchange responses in the append-only audit log, updates portfolio balances accurately from fills, and successfully triggers post-trade agent reflection.

### Explicitly out of scope
- Autonomous live order execution without explicit owner approval (strictly prohibited in MVP 1).
- Margin, futures, options, or leverage trading (spot only).
- Tradable assets outside the initial BTC/USDT and ETH/USDT allowlist.
- Automated order submission to resolve reconciliation differences (reconciliation reports and blocks).
- Multi-exchange order routing or cross-exchange arbitrage.
