<!-- /autoplan restore point: /Users/lyyeakkhai/.gstack/projects/AGI-trading/development-autoplan-restore-20260901-022433.md -->
# AI Trading Intelligence Platform
## Product Requirements Document — MVP 1

**Status:** Approved Product Direction / Pre-Implementation  
**Version:** 1.2  
**Date:** August 16, 2026  
**Product Type:** Private, single-user AI trading platform  
**Initial Market:** Cryptocurrency  
**Initial Exchange:** Binance  
**Initial Assets:** BTC and ETH  
**Initial Trading Mode:** Spot  
**Runtime Environments:** Development / Paper / Live  
**Default Trading Mode:** Paper (live execution disabled by default)  
**Primary Agent Runtime:** Hermes Agent  
**Primary Objective:** Prove that one AI-assisted trading agent can consistently produce positive risk-adjusted trading performance after realistic fees and slippage.

**Version 1.2 scope of change:** This revision does not alter the approved product direction, technology selection, or MVP boundaries. It closes implementation-readiness gaps in environment separation, authentication, secrets, financial idempotency, exchange reconciliation, data ownership, configuration, tooling, startup safety, and deployment safety so the document can be decomposed into implementation foundations. See the Implementation Readiness / Foundation Requirements and Implementation Dependency Order sections.

---

# 1. Executive Summary

The AI Trading Intelligence Platform is a private trading system designed for a single owner.

The platform combines:

- real-time cryptocurrency market data;
- quantitative analytics;
- technical analysis;
- social-media and news intelligence;
- reusable trading-strategy skills;
- strategy backtesting;
- paper trading;
- portfolio analytics;
- deterministic risk controls;
- Binance execution;
- persistent AI-agent memory;
- and one continuously operating Main Trading Agent.

The product is **not initially a fully autonomous trading bot**.

The Main Agent operates continuously, identifies potential opportunities, investigates them using available tools and trading skills, evaluates risk, produces structured trade proposals, and presents those opportunities to the owner.

For MVP 1, live trades require owner approval.

The platform is designed around one primary hypothesis:

> Can a persistent AI trading agent, supported by quantitative tools and structured trading knowledge, produce repeatable positive risk-adjusted performance in live market conditions?

The project will not expand into multi-agent competition, Arena agents, autonomous capital allocation, or unrestricted trading until that hypothesis is supported by evidence.

---

# 2. Product Vision

Build a private AI-powered trading operating system capable of continuously observing markets, researching opportunities, applying structured trading knowledge, testing hypotheses, learning from outcomes, and assisting the owner in making higher-quality trading decisions.

Long term, the platform should become infrastructure on top of which many independent trading agents can be created.

MVP 1 intentionally contains only one Main Agent.

The long-term model is:

```text
                     Shared Trading Platform
                              │
             ┌────────────────┼────────────────┐
             │                │                │
        Market Data        Research       Trading Tools
             │                │                │
             └────────────────┼────────────────┘
                              │
                         Main Agent
                              │
                       Proven profitable?
                              │
                              ▼
                  Future independent agents
```

The platform therefore owns the reusable trading capabilities.

Agents consume those capabilities.

---

# 3. Product Goal

## 3.1 Primary Goal

Create one continuously operating Main Trading Agent that can:

1. monitor cryptocurrency markets;
2. identify candidate trading opportunities;
3. analyze those opportunities quantitatively;
4. gather contextual market intelligence;
5. apply approved trading skills;
6. compare the setup with historical evidence;
7. calculate risk;
8. produce a structured trade proposal;
9. request owner approval;
10. execute approved trades safely;
11. monitor the resulting position;
12. evaluate the outcome;
13. store what happened;
14. improve future analysis using accumulated evidence.

---

# 4. Core Product Hypothesis

The product hypothesis is not:

> “Can an LLM predict Bitcoin?”

The hypothesis is:

> “Can an AI agent orchestrating market data, quantitative analysis, trading strategies, research tools, historical evidence, risk controls, and persistent memory produce useful and eventually profitable trading decisions?”

The AI model is therefore one component of the system.

It is not the entire trading strategy.

---

# 5. MVP Success Definition

MVP 1 is successful only if the system demonstrates credible evidence of trading edge.

A positive account balance alone is insufficient.

The system must measure performance using multiple metrics.

Required metrics include:

- net return;
- realized P&L;
- unrealized P&L;
- maximum drawdown;
- win rate;
- loss rate;
- average winner;
- average loser;
- reward/risk ratio;
- profit factor;
- expectancy;
- Sharpe-style risk-adjusted performance;
- Sortino-style downside-adjusted performance;
- number of trades;
- average holding duration;
- fees;
- estimated slippage;
- performance by asset;
- performance by timeframe;
- performance by strategy;
- performance by market regime;
- confidence calibration.

---

# 6. Strategy Validation Stages

A strategy must pass progressively stronger validation stages.

```text
Trading Idea
     ↓
Formal Strategy
     ↓
Historical Backtest
     ↓
Out-of-Sample Test
     ↓
Walk-Forward Validation
     ↓
Paper Trading
     ↓
Tiny Live Capital
     ↓
Performance Evaluation
     ↓
Approved Strategy
```

Backtest profitability alone must never qualify a strategy for meaningful live capital.

Freqtrade explicitly distinguishes historical backtesting from real-time dry-run/forward testing and warns that backtest results may differ substantially from live behavior. citeturn324371search6turn324371search1

---

# 7. Target User

## MVP 1

One private owner/operator.

There is:

- no registration;
- no public SaaS;
- no multi-tenancy;
- no billing;
- no customer onboarding;
- no public strategy marketplace;
- no third-party portfolio management.

Authentication exists purely to protect the private dashboard and the internal service APIs. It is deliberately not a SaaS identity system.

Because the platform is single-user, the authentication model is intentionally minimal but must still separate four distinct credential domains: owner (human) authentication, service (machine-to-machine) authentication, exchange authentication, and infrastructure credentials. See Section 70 — Authentication Architecture.

---

# 8. Runtime Environments and Trading Modes

The platform must never depend on operator discipline to avoid trading real capital by accident. Environment separation is therefore a first-class architectural requirement, not a deployment convenience.

Two independent concepts must not be conflated:

```text
APP_ENV       →  where the code is running   (development / staging-like / production)
TRADING_MODE  →  what the money is           (paper / live)
```

An environment can be production while the trading mode is still paper. That combination is expected to be the normal steady state for most of MVP 1.

## 8.1 Environment Model

The system recognizes three runtime environments.

```text
DEVELOPMENT
PAPER
LIVE
```

### DEVELOPMENT

Used for:

- local development;
- automated tests;
- CI;
- mocked or recorded external services where appropriate;
- disposable test databases;
- simulated execution only.

Rules:

- development must never be able to execute a live trade;
- live exchange credentials must not be present in a development environment;
- the exchange adapter must resolve to a paper or sandbox implementation;
- destructive schema operations are permitted only here and in CI.

### PAPER

Paper is a full production-shaped deployment with simulated money.

Uses:

- real market data;
- real ingestion and storage pipelines;
- real analytics;
- real opportunity detection;
- real Hermes reasoning;
- real trading skills and strategy logic;
- real Risk Engine;
- real owner approval workflow;
- simulated portfolio;
- simulated execution.

Paper mode must exercise as much of the production architecture as possible. Its purpose is to make the eventual switch to live execution a change of one adapter, not a change of pipeline. Any component that only works in paper mode is a defect.

### LIVE

Uses:

- real market data;
- real portfolio state reconciled against Binance;
- real Risk Engine;
- real Binance spot execution;
- explicit owner approval per trade (MVP 1).

Live remains spot-only, no leverage, restricted to the configured symbol allowlist.

## 8.2 Environment Configuration

Environment is selected through explicit configuration, never inferred from hostname, branch, or presence of credentials.

```text
APP_ENV                 development | production
TRADING_MODE            paper | live
LIVE_TRADING_ENABLED    true | false
```

Committed defaults must be the safe values:

```text
APP_ENV=development
TRADING_MODE=paper
LIVE_TRADING_ENABLED=false
```

Additional rules:

- `TRADING_MODE=live` must be rejected at startup when `APP_ENV=development`;
- `LIVE_TRADING_ENABLED=true` must be rejected when `TRADING_MODE=paper`;
- the active environment and trading mode must be visible in the dashboard header, in structured logs, and on every trade proposal record;
- switching trading mode requires a service restart, so the transition is deliberate and auditable. Live trading must not be toggleable from a single dashboard control at runtime.

## 8.3 Live Execution Preconditions

A single configuration mistake must never be sufficient to place real orders. Live execution requires multiple independent conditions to hold simultaneously, evaluated at the Execution Service boundary immediately before every order submission — not once at startup.

```text
APP_ENV=production
AND TRADING_MODE=live
AND LIVE_TRADING_ENABLED=true
AND valid live exchange configuration present and permission-verified
AND exchange withdrawal permission absent
AND symbol present in the configured allowlist
AND market data fresh within the configured staleness threshold
AND Risk Engine healthy and risk decision APPROVED
AND portfolio state reconciled with the exchange
AND kill switch inactive
AND owner approval present, unexpired, and matching this proposal
AND idempotency key unused
```

If any condition is unknown or unverifiable, it is treated as failed. The system fails closed.

## 8.4 Environment Isolation

Each environment must have its own isolated resources:

```text
                 DEVELOPMENT        PAPER              LIVE
database         local/ephemeral    paper database     live database
redis            local              paper namespace    live namespace
exchange creds   none / sandbox     read-only or none  live trade-only key
hermes profile   hermes-dev         hermes-trader-paper hermes-trader
portfolio        simulated          simulated          real
```

Paper and live must not share a database schema instance or a Redis keyspace. Cross-contamination of portfolio state between simulated and real money is a financial correctness failure, not a cosmetic one.

Where a single VPS hosts both paper and live, isolation is achieved through separate database names, separate Redis logical databases or key prefixes, separate container sets, and separate secret files.

---

# 9. MVP Scope

## 9.1 Objective 1 — Main Trading Agent

Build one persistent Main Trading Agent.

The Main Agent must operate continuously and function as the owner's primary trading intelligence assistant.

### Main Agent responsibilities

The agent must be able to:

- observe current market conditions;
- inspect BTC and ETH;
- inspect multiple configured timeframes;
- inspect technical indicators;
- inspect market structure;
- detect unusual price or volume behavior;
- inspect external market intelligence;
- load relevant trading skills;
- formulate trading hypotheses;
- request quantitative analysis;
- request historical strategy evaluation;
- examine portfolio exposure;
- create structured trade proposals;
- monitor approved positions;
- evaluate completed trades;
- store useful observations;
- retrieve prior observations;
- update procedural trading knowledge when explicitly permitted.

The agent should be capable of deciding:

> No valid trading opportunity currently exists.

No-trade decisions are considered valid outputs.

---

# 10. Hermes Agent Integration

Hermes is the **primary persistent trading agent and orchestrator** for this platform.

Hermes Agent will provide the primary agent runtime. Hermes already supports persistent memory, reusable skills, profiles/isolated instances, model-provider flexibility, custom tools, MCP integrations, scheduling, and agent-managed skills. citeturn445293search0turn445293search1turn445293search3

## 10.1 Hermes Orchestrator Responsibilities

Hermes runs continuously and is responsible for:

- monitoring markets for candidate opportunities;
- using the shared trading platform tools;
- retrieving quantitative analytics from the platform;
- loading relevant trading skills;
- retrieving knowledge and memory (constitution, knowledge base, experience);
- checking historical strategy performance;
- deciding whether an opportunity can be handled directly with available context;
- deciding whether deeper specialist analysis is necessary and escalating to TradingAgents when warranted;
- synthesizing all evidence into a final trade recommendation;
- sending the recommendation to the trading platform as a structured proposal for deterministic risk validation.

## 10.2 What Hermes Does Not Own

Hermes must NOT directly own or control:

- Binance credentials or API secrets;
- portfolio accounting state;
- deterministic risk calculation;
- market-data ingestion pipelines;
- live order execution.

These remain exclusively controlled by the shared trading platform, which exposes them to Hermes through controlled tool APIs.

## 10.3 Architecture Decision

The project will **not fork or heavily modify Hermes during MVP 1**.

Instead:

```text
Hermes
    ↓
Custom Trading Tools
    ↓
Trading Platform API
```

Hermes remains an independently upgradeable dependency.

---

# 11. Hermes Deployment Model

The owner's existing general-purpose Hermes installation must remain isolated from the trading agent.

Recommended deployment:

```text
VPS
│
├── hermes-work
│   ├── existing personal agent
│   ├── work memory
│   ├── work skills
│   └── NO financial credentials
│
└── hermes-trader
    ├── isolated profile/runtime
    ├── trading memory
    ├── trading skills
    ├── trading tools
    └── NO direct Binance secret
```

Hermes supports separate profiles with isolated configuration, sessions, skills, and memory, making this separation consistent with the runtime's existing model. citeturn445293search1

## 11.1 One-VPS Multi-Service Deployment

MVP does not require multiple physical servers.

All major services run on one VPS using isolated Docker containers communicating over a private Docker network:

```text
VPS

├── trading-platform
│   ├── FastAPI (API Gateway)
│   ├── market-data worker
│   ├── analytics worker
│   ├── intelligence worker
│   ├── backtesting service
│   ├── portfolio service
│   ├── risk engine
│   └── Binance execution service
│
├── hermes-trader
│   └── isolated Hermes runtime
│
├── tradingagents-service
│   └── TradingAgents specialist research engine
│
├── postgres-timescale
│
├── redis
│
└── monitoring
    ├── Prometheus
    └── Grafana
```

Services communicate over a private Docker network.

Later, any component may move to a separate VPS without changing public service contracts.

## 11.2 Infrastructure Capacity

Intended MVP server baseline:

```text
6 vCPU
12 GB RAM
200 GB SSD
300 Mbps network
```

This is sufficient for MVP because:

- no local LLM inference is performed;
- LLM calls go through the owner's external LLM gateway/router;
- Hermes runs only the agent runtime, not model weights;
- TradingAgents runs agent orchestration, not model inference;
- BTC and ETH are the initial market scope.

Treat this as comfortable MVP headroom, not a hard minimum.

---

# 12. Agent Security Boundary

The Main Agent must never directly control critical financial infrastructure.

Hermes must NOT directly receive:

- Binance withdrawal credentials;
- unrestricted exchange credentials;
- database administrator credentials;
- infrastructure root credentials;
- risk-limit modification permission;
- unrestricted wallet-transfer functionality.

The agent should instead call controlled APIs.

Example:

```text
Hermes Agent

trade.propose(...)
      ↓

Trading Backend
      ↓

Risk Engine
      ↓

Owner Approval
      ↓

Execution Service
      ↓

Binance
```

The agent's request is therefore not equivalent to an exchange order.

---

# 13. Agent Tools

Hermes should receive explicit trading tools.

Examples:

```text
market.get_price
market.get_candles
market.get_orderbook
market.get_recent_trades

analytics.get_indicators
analytics.get_market_regime
analytics.get_support_resistance
analytics.get_volume_analysis
analytics.get_volatility

research.get_news
research.get_social_trends
research.search_market_events

strategy.list
strategy.get
strategy.backtest
strategy.compare
strategy.performance

portfolio.get_balance
portfolio.get_positions
portfolio.get_performance
portfolio.get_trade_history

proposal.create
proposal.update
proposal.cancel

position.monitor

memory.store_trade_observation
memory.search_trade_history

research.deep_analyze
```

The `research.deep_analyze(...)` tool is the controlled gateway through which Hermes may invoke the TradingAgents specialist research service (see Section 14 — TradingAgents Specialist Research Service).

Live execution should remain behind the approval/risk boundary rather than being exposed as an unrestricted agent capability.

---

# 14. TradingAgents Specialist Research Service

Reference: https://github.com/TauricResearch/TradingAgents

TradingAgents is an **optional multi-agent specialist research engine**. It is not the main agent runtime and is not the trading platform. It acts as an on-demand research committee that Hermes may escalate to when deeper specialist analysis is warranted.

## 14.1 Specialist Team

The TradingAgents service may internally coordinate specialist agents including:

- Technical Analyst;
- Sentiment Analyst;
- News Analyst;
- Fundamental Analyst (where relevant);
- Bull Researcher;
- Bear Researcher;
- Trader synthesis;
- Risk and Portfolio analysis roles.

## 14.2 Integration Architecture

TradingAgents must be exposed to Hermes through a controlled internal tool/API. Hermes must not directly execute arbitrary shell commands against the TradingAgents repository.

The TradingAgents service may internally use its Python package, CLI, or LangGraph runtime. Its implementation details are encapsulated behind the service boundary.

```text
Hermes
   ↓
research.deep_analyze(symbol, timeframe, context)
   ↓
TradingAgents Service
   ↓
specialist multi-agent analysis
   ↓
structured result
   ↓
Hermes
```

## 14.3 What TradingAgents Must Not Replace

TradingAgents must not replace any of the following platform components:

- Market Data Worker;
- Redis Streams;
- TimescaleDB;
- Portfolio Accounting;
- Risk Engine;
- Backtesting;
- Opportunity Scanner;
- Binance Execution.

These remain exclusively owned by the trading platform.

---

# 15. Agent Decision Routing and Escalation Policy

Hermes decides whether to handle an opportunity directly or escalate to TradingAgents.

```text
Opportunity detected
        ↓
Hermes retrieves:
- market analytics
- relevant trading skills
- foundation knowledge
- strategy performance
- portfolio state
- experience memory
        ↓
Can Hermes make a sufficiently supported decision?
        │
   ┌────┴────┐
   │         │
  YES        NO / uncertain / complex / high-value
   │         │
   │         ↓
   │   Call TradingAgents (research.deep_analyze)
   │         ↓
   │   Specialist research
   │         ↓
   └─────────┤
             ↓
      Hermes final analysis
             ↓
      Trade Proposal
             ↓
      Risk Engine
             ↓
      Owner Approval
```

TradingAgents is an **escalation path**, not a service called for every opportunity.

Hermes should escalate when:

- uncertainty is high;
- evidence conflicts;
- the opportunity is strategically important;
- deeper research could materially improve the decision;
- the expected lifetime of the opportunity allows additional reasoning latency.

---

# 16. Latency and Cost Routing

TradingAgents must not sit in the critical execution path for every signal.

For short-lived opportunities, Hermes should rely on:

- deterministic analytics;
- trading skills;
- historical performance;
- current market data;
- its own reasoning.

The platform operates on a two-speed architecture:

```text
FAST PATH
Market Data
→ Opportunity Scanner
→ Quant Analytics
→ Hermes
→ Risk Engine
→ Proposal

DEEP PATH
Candidate Opportunity
→ Hermes
→ TradingAgents (research.deep_analyze)
→ Hermes final synthesis
→ Risk Engine
→ Proposal
```

The fast path handles routine signal evaluation.

The deep path is reserved for high-value, uncertain, or complex opportunities where specialist analysis can materially improve decision quality and the opportunity lifetime permits the additional latency.

---

# 17. Trading Skill System

Trading knowledge must be represented as reusable skills rather than permanently embedded inside one enormous system prompt.

Hermes skills are on-demand knowledge documents and can include supporting reference files. They are designed for procedural knowledge and can be loaded only when relevant. citeturn445293search3turn445293search6

Recommended structure:

```text
trading-skills/
│
├── risk-management/
│   ├── SKILL.md
│   ├── rules.yaml
│   └── examples/
│
├── trend-following/
│   ├── SKILL.md
│   ├── rules.yaml
│   ├── invalidation.md
│   └── examples/
│
├── breakout/
│   ├── SKILL.md
│   ├── rules.yaml
│   ├── invalidation.md
│   └── examples/
│
├── mean-reversion/
│
├── market-structure/
│
└── book-strategies/
```

---

# 18. Trading Book Conversion

The owner must be able to convert trading knowledge from books, notes, research, or personal strategies into agent-readable skills.

A strategy should ideally contain:

- strategy name;
- purpose;
- appropriate market;
- inappropriate market;
- required timeframe;
- market-regime assumptions;
- setup requirements;
- confirmation conditions;
- entry conditions;
- stop methodology;
- exit conditions;
- invalidation conditions;
- position-sizing rules;
- examples;
- failure cases;
- quantitative variables;
- testable assumptions.

Example:

```text
breakout-v1/

SKILL.md
rules.yaml
risk.yaml
examples/
references/
tests/
```

However, qualitative trading knowledge must not automatically become executable trading logic.

The formal knowledge-to-skill conversion pipeline is:

```text
Book / Research
      ↓
Knowledge Extraction
      ↓
Structured Knowledge
      ↓
Human Review
      ↓
Candidate Trading Skill
      ↓
Backtest
      ↓
Paper Validation
      ↓
Approved Skill
      ↓
Hermes may use it
```

Book-to-skill tooling may be introduced later to automate extraction, but skills controlling live capital still require human review and quantitative validation before approval.

The end-to-end flow is:

```text
Book / Human Knowledge
          ↓
      Trading Skill
          ↓
   Agent Interpretation
          ↓
     Formal Hypothesis
          ↓
 Quantitative Strategy
          ↓
       Backtest
          ↓
 Forward / Paper Test
```

---

# 19. Strategy Registry

The platform must maintain a centralized Strategy Registry.

Each strategy must contain:

```text
Strategy
├── ID
├── name
├── version
├── description
├── source
├── status
├── assets
├── timeframes
├── market regimes
├── rules
├── parameters
├── risk configuration
├── backtest history
├── paper trading history
├── live performance
└── approval status
```

Suggested lifecycle:

```text
DRAFT
 ↓
BACKTESTING
 ↓
VALIDATED
 ↓
PAPER_TRADING
 ↓
LIVE_LIMITED
 ↓
APPROVED
```

Possible failure state:

```text
REJECTED
```

Strategies must be versioned.

`breakout-v1` and `breakout-v2` must have separate performance records.

---

# 20. Quantitative Analytics Engine

The platform must provide deterministic quantitative analysis independently of the LLM.

The AI agent should consume these calculations rather than invent them.

Core analytics include:

### Price analytics

- OHLCV;
- percentage change;
- range;
- returns;
- log returns;
- rolling returns.

### Trend

- moving averages;
- EMA;
- SMA;
- trend direction;
- trend strength;
- higher highs;
- higher lows;
- lower highs;
- lower lows.

### Momentum

- RSI;
- MACD;
- rate of change;
- momentum measures.

### Volatility

- ATR;
- rolling volatility;
- range expansion;
- volatility percentile.

### Volume

- relative volume;
- volume spike;
- rolling volume;
- volume-price divergence.

### Market structure

- support;
- resistance;
- breakout;
- breakdown;
- consolidation;
- local swing highs/lows.

### Regime classification

Initial regimes:

```text
TRENDING_UP
TRENDING_DOWN
RANGING
HIGH_VOLATILITY
LOW_VOLATILITY
UNCERTAIN
```

---

# 21. Technical Indicator Library

TA-Lib should be considered the primary standard indicator library where suitable rather than implementing common indicators manually.

Custom proprietary indicators may be implemented separately when required.

---

# 22. Opportunity Detection Engine

The Main Agent should not continuously consume expensive LLM tokens to examine every market tick.

Instead, a deterministic Opportunity Detection Engine continuously analyzes market conditions.

Example:

```text
Market Feed
    ↓
Quant Engine
    ↓
Opportunity Scanner

BTC:
Volume anomaly       ✓
Breakout             ✓
Trend confirmation   ✓

ETH:
Momentum             ✓
Breakout             ✗
Volume confirmation  ✗
```

Only meaningful candidates should trigger deeper agent analysis.

Architecture:

```text
Market
   ↓
Quantitative Scanner
   ↓
Candidate Event
   ↓
Main Agent
   ↓
Deep Investigation
```

This separates inexpensive machine computation from expensive model reasoning.

---

# 23. Signal Confidence

The AI model must NOT simply invent statements such as:

> Confidence: 82%

Confidence should become data-driven.

Potential inputs include:

- historical success of strategy;
- number of comparable historical setups;
- market-regime performance;
- current condition match;
- volatility;
- liquidity;
- trend agreement;
- timeframe agreement;
- sentiment confirmation;
- strategy disagreement;
- recent strategy performance.

The system may initially label confidence as:

```text
LOW
MEDIUM
HIGH
```

until sufficient historical samples exist.

Later, probability calibration may produce numeric estimates.

---

# 24. Trade Proposal

Every actionable opportunity must produce a structured Trade Proposal.

Example:

```text
BTC/USDT

Direction:
LONG

Strategy:
Breakout v2

Timeframe:
1H

Market regime:
TRENDING_UP

Confidence:
HIGH

Entry:
$XX,XXX

Stop:
$XX,XXX

Target 1:
$XX,XXX

Target 2:
$XX,XXX

Risk:
0.5% portfolio

Expected R:R:
1:2.7
```

The proposal must also contain:

### Supporting evidence

- indicator confirmation;
- market structure;
- volume behavior;
- higher-timeframe context;
- relevant social/news intelligence.

### Contradicting evidence

The agent must explicitly identify evidence against the trade.

### Invalidation

The proposal must explain what market event invalidates the thesis.

### Historical evidence

Where sufficient data exists:

- comparable setup count;
- historical win rate;
- historical expectancy;
- drawdown;
- strategy performance in matching regime.

### Agent recommendation

Allowed recommendations:

```text
ENTER
WAIT
WATCH
AVOID
EXIT
REDUCE
```

---

# 25. Owner Approval

MVP 1 is human-controlled.

For live capital:

```text
Agent Proposal
      ↓
Risk Validation
      ↓
Owner
 ┌────┼─────┐
 │    │     │
Approve Reject Watch
```

No live position should be opened without explicit owner authorization during MVP 1.

## 25.1 Approval Binding

An approval is not a general permission to trade. It authorizes exactly one execution of exactly one validated proposal.

Every owner approval record must bind to:

```text
proposal_id
risk_decision_id
symbol
direction
order type
quantity / notional
entry constraint (limit price or market with slippage bound)
stop level
target levels
trading mode at approval time
approved_at
expires_at
approval_ttl_seconds (the TTL in force when the approval was issued)
approved_by (owner identity)
```

Rules:

- an approval is invalid if the underlying proposal changed after approval. Any material change requires a new proposal, a new risk decision, and a new approval;
- an approval expires. An expired approval must be re-confirmed rather than silently executed;
- an approval issued while `TRADING_MODE=paper` must never authorize a live order;
- an approval consumed by a successful execution must be marked consumed and must not authorize a second order. This is enforced through the idempotency mechanism in Section 29 — Financial Command Idempotency;
- approval is an owner-authenticated action and must be recorded in the financial audit log with the correlation identifiers defined in Section 68 — Observability.

The Risk Engine re-validates immediately before execution. Owner approval does not bypass risk validation; approval and risk approval are separate independent gates and both must hold at submission time.

## 25.2 Approval Expiry (TTL)

The approval TTL is configuration, not a hardcoded constant.

```text
execution.approval_ttl_seconds     default: 300 (MVP 1)
```

The correct value is a risk-tolerance judgement rather than an engineering constant: it trades the owner's convenience against how far the market may drift between approval and submission. The MVP default of 300 seconds is a deliberately conservative starting point, expected to be tuned once real approval-to-execution latency has been observed in paper mode.

Rules:

- the TTL is owner-configurable through the typed configuration described in Section 66 — Configuration Foundation, and requires a restart like every other trading-relevant setting;
- the TTL in force is captured on the approval record as `approval_ttl_seconds`. Changing configuration later must never retroactively extend or shorten an approval that has already been issued;
- expiry is evaluated against `expires_at` at submission time, immediately before the order is sent, using the same evaluation point as every other live precondition (Section 8 — Runtime Environments and Trading Modes);
- a configured value of zero or negative is invalid and must be rejected at startup;
- an upper bound must also be enforced at startup. An approval TTL long enough for the market to move materially defeats the purpose of binding an approval to a validated proposal;
- expiry is enforced identically in paper and live mode, so the behavior being tested in paper is the behavior that runs in live;
- an expired approval is not an error condition. It is a normal outcome that requires the owner to re-confirm against a fresh proposal and a fresh risk decision.

---

# 26. Risk Engine

Risk controls must exist outside the AI agent.

The agent cannot override them.

Required configurable controls include:

- maximum capital per trade;
- maximum portfolio exposure;
- maximum exposure per asset;
- maximum concurrent positions;
- maximum daily loss;
- maximum weekly loss;
- maximum portfolio drawdown;
- minimum reward/risk requirement;
- permitted symbols;
- permitted market type;
- spot-only enforcement;
- leverage disabled for MVP;
- trade-frequency limits;
- stale-market-data protection;
- exchange-health validation;
- API failure protection;
- duplicate-order protection;
- order-size validation;
- kill switch.

Risk decisions should be deterministic.

## 26.1 Determinism Requirements

The Risk Engine is pure decision logic. Given the same inputs it must always produce the same decision.

Rules:

- no LLM call may participate in a risk decision;
- no network call to an external service may participate in a risk decision path other than reading already-persisted platform state;
- all monetary and quantity arithmetic uses fixed-precision decimal types, never binary floating point;
- rounding rules are explicit and match exchange symbol precision filters;
- the engine takes market data, portfolio state, risk configuration, and the proposal as inputs, and returns a `RiskDecision`;
- the engine must be fully unit-testable without a database, an exchange, or an agent present.

## 26.2 Risk Decision Record

Every evaluation produces a persisted, immutable `RiskDecision`:

```text
risk_decision_id
proposal_id
decision            APPROVED | REJECTED | MODIFIED
reasons[]           machine-readable rule codes
evaluated_rules[]   rule id, limit, observed value, pass/fail
approved_quantity
approved_notional
risk_amount
risk_percent_of_equity
portfolio_state_snapshot_ref
market_data_snapshot_ref
market_data_age_ms
risk_config_version
trading_mode
created_at
```

A `MODIFIED` decision means the engine reduced size to fit within limits. A modified decision produces a new proposal revision requiring fresh owner approval; it must not be executed against the original approval.

Rejections must cite specific rule codes. "Rejected" without an attributable rule is a defect.

## 26.3 Evaluation Points

Risk validation runs at three independent points:

```text
1. Proposal creation      → is this proposal admissible at all?
2. Owner approval         → are limits still satisfied at approval time?
3. Immediately pre-submit → are limits still satisfied right now?
```

The third evaluation is mandatory and non-skippable. Between approval and submission the market can move, another position can open, a daily loss limit can be breached, or market data can go stale. Passing at approval time does not authorize submission.

## 26.4 Risk Configuration Ownership

Risk configuration is owner-controlled state, versioned in PostgreSQL.

- Hermes may read risk configuration and read risk decisions;
- Hermes must never write risk configuration. There is no agent tool that mutates a risk limit;
- every risk configuration change is versioned, and each `RiskDecision` records the `risk_config_version` used;
- loosening a limit is an owner-authenticated action recorded in the financial audit log;
- `spot_only: true` and `leverage_enabled: false` are enforced structurally for MVP 1 and are not owner-loosenable through configuration.

## 26.5 Risk Engine Availability

The Risk Engine is required infrastructure for trading. If it is unavailable, unhealthy, or operating on a risk configuration it cannot validate, no new order may be submitted in any mode. It must not degrade to "allow" under failure.

---

# 27. Execution Engine

The Execution Engine translates approved platform orders into exchange orders.

Initial exchange:

**Binance Spot**

Binance exposes official Spot REST APIs for exchange interaction. citeturn324371search9

Recommended architecture:

```text
Owner Approval
      ↓
Risk Engine (pre-submit re-validation)
      ↓
Execution Service
      ↓
Idempotency Check
      ↓
ExecutionAdapter
      ↓
CCXT
      ↓
Binance
```

The Execution Service is the only component in the platform permitted to hold live exchange credentials. No other service, worker, agent, or frontend may read them. See Section 72 — Binance Credential Separation.

## 27.1 Execution Adapter Abstraction

Paper and live trading must not be two separate pipelines. They are the same pipeline terminating in a different adapter.

```text
ExecutionAdapter
      │
      ├── PaperExecutionAdapter
      │
      └── BinanceExecutionAdapter
```

The application flow before execution is identical in both modes:

```text
Opportunity
→ Hermes
→ Proposal
→ Risk Decision
→ Owner Approval
→ Execution Request
→ Idempotency Check
→ ExecutionAdapter
```

Only the final adapter implementation changes. This is what makes paper trading meaningful evidence: it exercises the real production decision pipeline, not a parallel simplified one.

Both adapters consume the same validated `ExecutionRequest` and return the same normalized result shape. The adapter is selected once at startup from `TRADING_MODE`, never per request, so a per-request bug cannot route a paper trade to the live exchange.

### ExecutionAdapter contract

```text
submit(execution_request) -> ExecutionResult
cancel(execution_request_id) -> CancelResult
get_order_status(client_order_id) -> OrderStatus
get_fills(client_order_id) -> Fill[]
health() -> AdapterHealth
```

### PaperExecutionAdapter

Simulates execution against real market data. It must model, not ignore, the costs that determine whether an edge is real:

- fill logic against current order book or trade prints;
- configurable slippage assumption;
- exchange fee schedule;
- partial fills;
- order rejection on insufficient simulated balance;
- exchange symbol precision and minimum notional filters;
- realistic latency between submission and fill.

The paper adapter must apply the same symbol filters and precision rounding as the live adapter. A paper order that would be rejected by Binance must be rejected in paper mode, otherwise paper results overstate the strategy.

Paper portfolio state is authoritative for paper mode and is stored separately from live portfolio state.

### BinanceExecutionAdapter

Submits real spot orders through CCXT, with Binance-native calls where a required capability is unavailable or materially degraded through CCXT.

Requirements:

- enforces the full live execution precondition set (Section 8 — Runtime Environments and Trading Modes) before every submission;
- always supplies a platform-generated `client_order_id` derived from the idempotency key;
- treats timeouts and ambiguous responses as unknown-state, never as failure (Section 29 — Financial Command Idempotency);
- records the raw exchange request and response in the financial audit log with secrets redacted.

## 27.2 Execution State Machine

Every execution request follows an explicit state machine. Ambiguity is a distinct state, not an error.

```text
PENDING
   ↓
SUBMITTING ──────────────► UNKNOWN ──► (reconciliation resolves)
   ↓                                        │
SUBMITTED                                   ▼
   ↓                            SUBMITTED | FAILED
PARTIALLY_FILLED
   ↓
FILLED | CANCELLED | REJECTED | EXPIRED
```

`UNKNOWN` is entered whenever the platform cannot determine whether the exchange received the order — network timeout, connection reset, ambiguous error, or process crash between submit and response persist.

Rules for `UNKNOWN`:

- the request must never be blindly retried;
- resolution happens only through querying the exchange by `client_order_id` (Section 30 — Exchange Reconciliation);
- while any execution request for an account is `UNKNOWN`, new live submissions for that account are blocked;
- the state must be persisted before the network call is made, so a crash mid-call is still recoverable.

Persisting intent before acting is mandatory. The Execution Service writes the execution request and its idempotency key to PostgreSQL, commits, and only then contacts the exchange.

---

# 28. Exchange Adapter Contract and CCXT Integration

CCXT will act as the primary exchange abstraction library.

CCXT provides a unified API across a large number of cryptocurrency exchanges and supports common public/private exchange operations. Its WebSocket extension, CCXT Pro, provides streaming interfaces. citeturn324371search2turn324371search8turn324371search11

Benefits for this architecture:

- reduced exchange-specific code;
- standardized order interface;
- standardized symbol representation;
- future ability to add additional exchanges;
- easier test/mock layers.

However, CCXT is an implementation detail, not the platform's exchange interface. The platform defines its own `ExchangeAdapter` contract first, and CCXT is one way of satisfying it.

## 28.1 ExchangeAdapter Contract

The contract must be defined and stable before Binance-specific behavior is implemented. Every other component depends on this interface, never on CCXT types and never on Binance response shapes.

### Market data capabilities

```text
get_ticker(symbol)
get_candles(symbol, timeframe, since, limit)
get_order_book(symbol, depth)
get_recent_trades(symbol, since, limit)
get_symbol_info(symbol)          → precision, min notional, step size, status
get_server_time()
```

### Account and order state capabilities

```text
get_balance()
get_open_orders(symbol)
get_order(client_order_id)
get_order_by_exchange_id(exchange_order_id)
get_fills(symbol, since)
get_my_trades(symbol, since)
```

### Order lifecycle capabilities

```text
place_order(execution_request)    → must accept a platform client_order_id
cancel_order(client_order_id)
cancel_all_orders(symbol)
```

### Operational capabilities

```text
health()
get_rate_limit_state()
get_permissions()                 → must expose whether withdrawal is enabled
```

Contract rules:

- all quantities and prices cross the boundary as fixed-precision decimals, never floats;
- symbols use the platform's canonical form (`BTC/USDT`), normalized at the adapter boundary;
- timestamps are UTC milliseconds at the boundary and are converted to timezone-aware UTC internally;
- `place_order` must accept and forward a platform-generated `client_order_id`. An adapter that cannot do this is unusable for this platform, because idempotency and reconciliation both depend on it;
- exchange errors are normalized into platform error categories: `RETRYABLE`, `PERMANENT`, `RATE_LIMITED`, `INSUFFICIENT_FUNDS`, `INVALID_ORDER`, `AUTH_FAILED`, `UNKNOWN_STATE`;
- `UNKNOWN_STATE` must never be collapsed into a generic failure. It has distinct financial meaning (Section 27 — Execution Engine);
- the adapter never decides whether a trade is permitted. It is transport, not policy.

## 28.2 CCXT vs Binance-Native Usage

Default position: use CCXT and CCXT Pro.

```text
CCXT (REST)          account state, order placement, order/fill queries,
                     historical candle backfill, symbol metadata

CCXT Pro (WebSocket) live ticker, trade, candle, and order book streams

Binance native       only when a required capability is missing from CCXT,
                     when CCXT's normalization loses information the platform
                     needs, or when a measured latency problem is attributable
                     to the abstraction
```

Rules for Binance-native usage:

- it must sit behind the same `ExchangeAdapter` interface, never leak into calling code;
- each native call site must record why the abstraction was insufficient;
- native usage must not become the default path by drift. Adding a native call is a deliberate, documented decision.

An `ExchangeAdapter` test suite runs against the paper/sandbox implementation in CI and can be run against the live adapter in read-only mode. Both implementations must satisfy the same contract tests.

---

# 29. Financial Command Idempotency

Any financially relevant command may be retried by a client, a worker, a supervisor restart, or an operator. Retries must never produce duplicate orders.

This is the single most important correctness property in the platform. Network timeouts are normal, not exceptional, and a timeout does not mean the order was not placed.

## 29.1 Identifier Chain

Every financial action carries an explicit identity chain from detection to fill.

```text
Trade Proposal        proposal_id
      ↓
Risk Decision         risk_decision_id
      ↓
Owner Approval        approval_id
      ↓
Execution Request     execution_request_id
      ↓
Idempotency Check     idempotency_key
      ↓
Exchange Order        client_order_id  →  exchange_order_id
      ↓
Fill                  fill_id (exchange trade id)
      ↓
Position / Trade      position_id / trade_id
```

Each identifier is generated by the platform, is persisted before use, and is immutable once assigned. `exchange_order_id` and `fill_id` are the only identifiers assigned externally.

## 29.2 Idempotency Key Rules

- the `idempotency_key` is derived deterministically from the approved execution intent, so an honest retry of the same intent produces the same key;
- the key is unique-constrained in PostgreSQL. Uniqueness is enforced by the database, not by application logic, so two concurrent workers cannot both pass a check-then-act race;
- the `client_order_id` sent to Binance is derived from the idempotency key, so the exchange itself becomes a second line of defense and the order is queryable by platform identity even if the platform lost the response;
- a repeated execution request with the same idempotency key must return the original outcome and must not create an additional exchange order;
- keys are never reused across trading modes. Mode is part of the derivation.

```text
Execution request arrives
          ↓
Insert idempotency key (unique constraint)
          │
    ┌─────┴─────┐
    │           │
 inserted    conflict
    │           │
    ▼           ▼
 proceed    return existing outcome
 to submit  (never submit again)
```

## 29.3 Retry Discipline

```text
Timeout or ambiguous response
          ↓
State = UNKNOWN (already persisted)
          ↓
Do NOT resubmit
          ↓
Query exchange by client_order_id
          │
    ┌─────┴──────┐
    │            │
 order found  not found
    │            │
    ▼            ▼
 adopt        safe to resubmit
 exchange     with the SAME
 state        idempotency key
```

Blind retry of a financial command is prohibited. Recovery is always query-first.

## 29.4 Scope of Application

Idempotency and exactly-once effect apply to:

- proposal creation — a retried agent call must not create duplicate proposals for the same opportunity and thesis;
- risk decision recording;
- owner approval — a double-clicked approve button must produce one approval, not two;
- execution submission;
- cancellation — cancelling an already-cancelled order is a success, not an error;
- fill processing — the same exchange fill must never be applied twice to portfolio state. Fills are deduplicated on exchange trade id;
- position updates — position state is derived from the deduplicated fill ledger, so replaying events converges to the same position;
- portfolio accounting entries.

Fill processing deserves emphasis: applying one fill twice silently corrupts balance, position size, average entry price, and every downstream performance metric. Fill application must be idempotent at the database level.

---

# 30. Exchange Reconciliation

The platform database must never assume its state matches Binance. It reconciles and verifies.

Divergence is expected in normal operation: a fill arrives during a disconnect, a process crashes mid-submit, an order expires exchange-side, a manual trade happens in the Binance UI, or a WebSocket silently drops messages. The platform must detect divergence rather than trade on a stale internal picture.

## 30.1 Reconciliation Model

```text
Platform Portfolio State
          ↕
      Binance State
          ↓
Reconciliation Worker
          ↓
Compare:
- balances per asset (free / locked)
- open orders
- fills since last checkpoint
- completed and cancelled orders
- account holdings / positions
- execution requests in UNKNOWN state
          ↓
Classify divergence
          ↓
Mismatch detected
          ↓
Alert + safe response
```

Binance is authoritative for exchange-side facts. The platform is authoritative for intent, reasoning, and accounting derived from those facts. Reconciliation is how the two are kept consistent. See Section 34 — Sources of Truth.

## 30.2 When Reconciliation Runs

```text
startup                        mandatory, before trading readiness
periodically                   configurable interval during operation
after WebSocket reconnect      always
after execution uncertainty    any UNKNOWN state execution request
after exchange or API errors   after auth failures, rate-limit storms, 5xx
before enabling live trading   mandatory
on owner demand                manual dashboard action
```

## 30.3 Divergence Classification and Response

| Class | Example | Response |
|---|---|---|
| `INFORMATIONAL` | rounding dust below threshold | log only |
| `RESOLVABLE` | known fill not yet applied locally | apply fill idempotently, recompute position, log |
| `UNEXPECTED_ORDER` | open order on exchange with no platform record | block new live execution, alert owner |
| `UNEXPECTED_BALANCE` | balance differs beyond tolerance | block new live execution, alert owner |
| `UNKNOWN_EXECUTION` | UNKNOWN request resolves to a real exchange order | adopt exchange state, apply fills, then re-verify |
| `CRITICAL` | position exists on exchange that platform has no record of | block all new live execution, require owner acknowledgement |

Rules:

- reconciliation may correct platform accounting by appending records. It must never silently overwrite or delete historical records (Section 69 — Financial Audit Log);
- reconciliation never places or cancels orders to "fix" a mismatch. It reports and blocks. Automated corrective trading is out of scope for MVP 1;
- an unresolved `UNEXPECTED_*` or `CRITICAL` divergence sets a persistent `reconciliation_blocked` flag. While set, live execution is refused;
- clearing a `CRITICAL` divergence requires explicit owner acknowledgement, not merely a successful subsequent reconciliation run;
- reconciliation runs in paper mode too, comparing simulated portfolio state against the paper adapter's own ledger, so accounting bugs surface before real money is involved.

## 30.4 Reconciliation Record

Each run persists an auditable result:

```text
reconciliation_id
trigger              startup | periodic | reconnect | uncertainty | error | manual
started_at / completed_at
trading_mode
platform_snapshot_ref
exchange_snapshot_ref
divergences[]        class, asset/symbol, expected, observed, delta, resolution
outcome              CLEAN | RESOLVED | BLOCKED
blocking             true | false
```

---

# 31. Market Data Service

The Market Data Service is responsible for ingesting, normalizing, storing, and distributing market information.

Required data:

- ticker;
- OHLCV;
- trades;
- order book where needed;
- volume;
- bid/ask;
- spread.

Initial assets:

```text
BTC/USDT
ETH/USDT
```

Initial analysis timeframes:

```text
15m
1h
4h
```

A smaller timeframe may be stored when required to construct higher timeframes accurately.

---

# 32. Real-Time Market Architecture

Recommended:

```text
Binance WebSocket / CCXT Pro
            ↓
     Market Data Worker
            ↓
       Redis Streams
       ↙           ↘
Analytics       Persistence
 Worker          Worker
   ↓                ↓
Signals       TimescaleDB
```

Redis Streams are appropriate for ordered event streams requiring consumer groups, replay, and configurable retention. citeturn375759search4

Redis Pub/Sub may be used only for non-critical ephemeral UI broadcasts where message loss is acceptable; Redis documents Pub/Sub as at-most-once, while Streams provide persisted event processing. citeturn375759search5turn375759search6

---

# 33. Historical Market Data Storage

Recommended database:

**PostgreSQL + TimescaleDB**

Timescale hypertables extend PostgreSQL with automatic time-based partitioning for time-series workloads, making the combination suitable for candle, indicator, signal, and event history while retaining ordinary relational tables for business data. citeturn375759search0

Suggested hypertables:

```text
market_candles
market_trades
indicator_snapshots
market_events
social_metrics
signal_events
portfolio_snapshots
```

Regular PostgreSQL tables:

```text
strategies
strategy_versions
backtests
trade_proposals
risk_decisions
owner_approvals
execution_requests
idempotency_keys
orders
executions
fills
positions
trades
portfolio_accounts
portfolio_entries
reconciliation_runs
reconciliation_divergences
agent_decisions
skills
risk_rules
risk_config_versions
system_config
audit_log
```

Notes on the financial tables:

- `portfolio_accounts` is scoped by trading mode, so paper and live accounting never share rows;
- `idempotency_keys` carries the unique constraint that makes duplicate submission impossible (Section 29 — Financial Command Idempotency);
- `fills` is deduplicated on exchange trade id and is the ledger from which `positions` is derived;
- `audit_log` is append-only (Section 69 — Financial Audit Log).

---

# 34. Sources of Truth

Every piece of important state must have exactly one authoritative owner. Ambiguous ownership is how trading systems produce numbers nobody can explain.

## 34.1 Ownership Table

| State | Authoritative Owner | Notes |
|---|---|---|
| Proposals, risk decisions, approvals | PostgreSQL | platform intent and authorization |
| Execution requests, idempotency keys | PostgreSQL | submission identity and exactly-once effect |
| Orders, executions, fills ledger | PostgreSQL, verified against Binance | Binance is authoritative for exchange-side facts; PostgreSQL is the durable record |
| Positions, portfolio accounting, P&L | PostgreSQL | derived deterministically from the fills ledger |
| Strategies, versions, backtests | PostgreSQL | versioned research records |
| Risk rules and risk config versions | PostgreSQL | owner-controlled, agent-readable only |
| Audit log | PostgreSQL, append-only | never overwritten |
| Candles, trades, indicator snapshots | TimescaleDB hypertables (within PostgreSQL) | authoritative history |
| Market events, social metrics, signal events | TimescaleDB hypertables | authoritative history |
| Portfolio snapshots over time | TimescaleDB hypertables | derived time series, not the accounting source |
| Live tick / stream transport | Redis Streams | transport and replay buffer only |
| Latest price cache, regime cache, session cache | Redis | reconstructible cache, never authoritative |
| Worker coordination, locks, consumer offsets | Redis | operational coordination |
| Agent qualitative experience and lessons | Hermes memory | never authoritative for money |
| Trading knowledge base embeddings | PostgreSQL + pgvector | retrieval corpus |
| Accepted orders, exchange order status, exchange fills, exchange balances | Binance | authoritative for exchange-side reality |
| Runtime configuration and secrets | environment / secret files | never in the database, never in agent memory |

## 34.2 PostgreSQL — Authoritative Business State

PostgreSQL owns all application and business trading state: proposals, risk decisions, approvals, execution requests, orders, fills, positions, portfolio accounting, strategies, and audit records.

Rule: if a number is shown to the owner as money, it comes from PostgreSQL, computed deterministically from the fills ledger.

## 34.3 TimescaleDB — Authoritative Time Series

TimescaleDB is not a separate database. It is the PostgreSQL extension providing hypertables for high-volume time-series records: candles, market events, indicator snapshots, social metrics, signal events, and portfolio snapshots.

It is authoritative for historical market and analytics history. It is not the source of truth for current portfolio accounting.

## 34.4 Redis — Transport, Cache, Coordination

Redis carries market data events, opportunity events, caches, coordination state, and UI broadcasts.

Explicit constraint: **Redis must never become the permanent source of truth for financial state.**

- a full Redis data loss must be survivable with zero loss of financial correctness;
- anything in Redis must be reconstructible from PostgreSQL, TimescaleDB, or the exchange;
- portfolio balances, positions, orders, approvals, and risk decisions must never exist only in Redis;
- Redis Streams provide ordered delivery and replay for ingestion, not durable financial records.

## 34.5 Hermes Memory — Agent Knowledge Only

Hermes memory holds qualitative, episodic agent knowledge: observations, reflections, lessons, and research context.

Hermes memory must NOT be authoritative for:

- balances;
- positions;
- open or historical orders;
- realized or unrealized P&L;
- risk limits;
- strategy statistics.

When Hermes needs any of these, it calls a platform tool and uses the returned value. It must not answer from memory. A number remembered by an agent is a stale number, and stale financial numbers produce wrong proposals.

If Hermes memory and PostgreSQL disagree, PostgreSQL wins and the memory record is treated as an outdated observation.

## 34.6 Binance — Authoritative Exchange Reality

Binance is authoritative for:

- whether an order was accepted;
- exchange-side order status;
- exchange fills and their prices, quantities, fees, and timestamps;
- exchange balances.

The platform's own record of these facts is a durable mirror, kept honest by reconciliation.

## 34.7 How Reconciliation Connects Binance to Platform Accounting

```text
Binance (exchange reality)
        │
        │ authoritative for: accepted orders, order status,
        │ fills, balances
        ▼
Reconciliation Worker
        │
        │ fetches exchange state, compares to platform state,
        │ classifies divergence
        ▼
PostgreSQL fills ledger   ← fills applied idempotently, deduplicated
        │                    on exchange trade id
        ▼
Derived positions and portfolio accounting
        │
        ▼
Portfolio snapshots (TimescaleDB)
        │
        ▼
Dashboard, agent tools, risk inputs
```

Reconciliation only ever appends to the ledger. Divergence that cannot be explained by appending a known fill is escalated rather than absorbed, and blocks live execution until resolved (Section 30 — Exchange Reconciliation).

Paper mode uses the same structure, with the `PaperExecutionAdapter` ledger standing in for Binance, so the accounting path is identical.

---

# 35. Backtesting Engine

Backtesting is a core product feature, not an optional developer utility.

Recommended primary research engine:

**vectorbt**

VectorBT is designed for vectorized quantitative analysis and strategy testing using NumPy/pandas structures with compiled acceleration, making it suitable for rapidly evaluating many strategy variations. citeturn324371search3turn324371search10

Required inputs:

- strategy version;
- asset;
- timeframe;
- historical range;
- starting capital;
- fees;
- slippage assumption;
- strategy parameters.

Required outputs:

- total return;
- net return;
- max drawdown;
- win rate;
- trades;
- average gain;
- average loss;
- profit factor;
- expectancy;
- risk-adjusted metrics;
- equity curve;
- monthly performance;
- regime breakdown.

---

# 36. Freqtrade Role

Freqtrade should initially be used as:

1. architecture/reference implementation;
2. validation tool;
3. optional secondary strategy runner;
4. secondary backtesting comparison layer.

Freqtrade supports historical backtesting, dry-run/forward testing, strategy comparison, and parameter optimization. citeturn324371search1turn324371search5turn324371search6

It should **not initially become the core product architecture**.

The platform's proprietary opportunity detection, agent intelligence, skills, memory, analytics, and risk controls remain independent.

## AI-Trader Role

HKUDS/AI-Trader is defined as an open-source reference and donor codebase, not as the core architecture of our product.

We may evaluate and selectively reuse or adapt the following from HKUDS/AI-Trader:

- broker/exchange abstraction patterns;
- paper trading implementation;
- market-data integration patterns;
- agent-facing trading APIs;
- OpenAPI/API contract patterns;
- database patterns;
- trading infrastructure utilities;
- useful FastAPI service patterns.

We must not inherit AI-Trader's broader product scope, including:

- community/social trading;
- copy trading;
- public trading ecosystem;
- competitions/challenges;
- multi-agent collaboration features;
- public multi-user platform behavior.

Our MVP remains a private, single-user platform with one Main Hermes Trading Agent.

## TradingAgents Role

TauricResearch/TradingAgents (`https://github.com/TauricResearch/TradingAgents`) is an optional specialist multi-agent research engine exposed to Hermes through the `research.deep_analyze` tool (see Section 14 — TradingAgents Specialist Research Service).

TradingAgents must not replace our:

- Market Data Worker;
- Redis Streams;
- TimescaleDB;
- Portfolio Accounting;
- Risk Engine;
- Backtesting Engine;
- Opportunity Scanner;
- Binance Execution.

These remain exclusively owned by our trading platform.

---

# 37. Paper Trading

The platform must support complete trading simulation.

Paper trading should simulate:

- balances;
- orders;
- positions;
- fills;
- fees;
- slippage;
- stop losses;
- take profits;
- realized P&L;
- unrealized P&L.

The same Trade Proposal and Risk Engine flow should be used for both paper and live modes.

Only the final execution adapter changes.

```text
               ExecutionAdapter
                    /       \
                   /         \
   PaperExecutionAdapter    BinanceExecutionAdapter
```

The adapter contract, fill simulation requirements, and mode selection rules are defined in Section 27 — Execution Engine. Paper trading is the `PaperExecutionAdapter` behind that same contract, not a separate simplified pipeline.

## 37.1 Paper Trading as Evidence

Paper results are the primary evidence used to decide whether live capital is justified. They are only trustworthy if the simulation is honest about costs and constraints.

Requirements:

- exchange fee schedule applied to every simulated fill;
- explicit configurable slippage assumption, recorded on each simulated fill so results can be re-evaluated under different assumptions;
- symbol precision, step size, and minimum notional filters enforced exactly as the live adapter enforces them;
- partial fills modelled;
- rejection on insufficient simulated balance;
- no fills at prices that did not occur in the observed market data;
- no look-ahead: a simulated fill may only use market data available at or after the submission timestamp.

Paper portfolio state lives in its own accounting scope (Section 34 — Sources of Truth) and is reconciled against the paper adapter's ledger on the same schedule live mode uses, so accounting defects surface before real money is at risk.

---

# 38. Social Intelligence

The platform must monitor real-time external conversations relevant to BTC and ETH.

Initial primary source:

**X API**

X provides filtered streaming that can deliver matching posts near real time using configurable rules. citeturn375759search1turn375759search9

The Social Intelligence Service should normalize raw social content into metrics rather than passing an uncontrolled feed directly to the agent.

Example:

```text
Asset: BTC

Mention velocity:
+180%

Unique authors:
+75%

Sentiment:
Positive

Engagement velocity:
+92%

Spam estimate:
Low

Price change:
+1.4%

Volume change:
+31%
```

---

# 39. Social Metrics

Potential signals:

- mention count;
- mention velocity;
- sentiment;
- sentiment delta;
- unique-author growth;
- engagement growth;
- influencer concentration;
- cashtag frequency;
- keyword frequency;
- unusual narrative emergence;
- spam/bot likelihood;
- correlation with price;
- correlation with volume.

A social signal alone must never automatically trigger a trade.

It acts as contextual evidence.

---

# 40. News Intelligence

The platform should ingest crypto-relevant news.

The service should normalize:

```text
event_id
timestamp
source
headline
assets
event_type
importance
sentiment
summary
source_url
```

Possible event categories:

- regulatory;
- exchange;
- ETF;
- institutional;
- macroeconomic;
- security incident;
- protocol;
- stablecoin;
- liquidity;
- geopolitical.

The agent can research important events when a candidate opportunity occurs.

---

# 41. Event Correlation

One important intelligence capability is correlation.

Example:

```text
BTC mention velocity +210%
             +
BTC volume +55%
             +
Resistance breakout
             +
1H trend confirmation
             ↓
High-priority opportunity candidate
```

The goal is not to merely display news.

The platform must connect external events with market behavior.

---

# 42. Main Agent Learning Loop

The Main Agent should operate using:

```text
Observe
   ↓
Detect opportunity
   ↓
Research
   ↓
Load relevant skills
   ↓
Form hypothesis
   ↓
Request quantitative validation
   ↓
Check strategy history
   ↓
Create proposal
   ↓
Owner decision
   ↓
Observe outcome
   ↓
Evaluate
   ↓
Store useful knowledge
   ↺
```

---

# 43. Agent Memory and Knowledge Architecture

Agent knowledge must be organized into four distinct layers. These are separate concerns and must not be conflated.

## 43.1 Trader Constitution (Foundation Principles)

Always available to Hermes as an always-loaded context.

Contains stable, enduring principles that define the agent's trading identity:

- preserve capital first;
- no trade is better than a bad trade;
- every trade needs a clear invalidation;
- probability is more important than certainty;
- avoid emotional or FOMO behavior;
- strategies depend on market regime;
- evidence is more important than opinions;
- risk limits are never overridden.

This acts as the long-term trading identity of the agent and changes only through deliberate owner decision.

## 43.2 Trading Knowledge Base

Structured knowledge loaded on demand via retrieval (RAG).

Contains:

- market fundamentals;
- trading theory;
- market psychology;
- market cycles;
- liquidity concepts;
- volatility concepts;
- macro concepts;
- book knowledge;
- historical examples;
- general trading principles.

Recommended storage: **PostgreSQL + pgvector**.

PostgreSQL already exists in the architecture. Adding the pgvector extension avoids introducing a separate vector database for MVP. A dedicated vector database may be considered if future scale requires it.

## 43.3 Trading Skills

Procedural, repeatable methods that Hermes can intentionally load and apply.

A trading skill should contain:

- setup conditions;
- required market data;
- appropriate market regime;
- entry rules;
- invalidation conditions;
- exit rules;
- risk rules;
- worked examples;
- known failure cases;
- when not to use the strategy.

Skills represent structured procedural knowledge, not arbitrary free text. See Section 17 (Trading Skill System) for the skill file structure.

## 43.4 Experience Memory

Generated from actual trading and research outcomes. Contains:

- successful decisions;
- failed trades;
- mistakes and their conditions;
- market observations;
- lessons;
- post-trade reflections;
- regime-specific patterns.

Experience memory is qualitative and episodic. It must not automatically modify approved strategy rules. Lessons from experience must pass through the learning loop (Section 44 — Self-Improvement Rules) before influencing procedural behavior.

## 43.5 Current Working Context

Active session state including:

- open opportunities;
- open positions;
- active strategy;
- recent market changes;
- current research.

## 43.6 Quantitative Strategy Memory

This belongs primarily in structured database records rather than free-form LLM memory.

Example:

```text
Strategy: breakout-v2
Asset: BTC
Timeframe: 1H

Trades: 61
Win rate: 59%
Profit factor: 1.48

Trending regime:
Win rate: 67%

Ranging regime:
Win rate: 32%
```

Hermes should query this data using a tool rather than attempting to memorize large statistical datasets. Structured performance data remains in PostgreSQL/TimescaleDB and is queried through platform tools.

---

# 44. Self-Improvement Rules

Hermes becoming smarter requires a controlled learning loop. One bad or successful trade must not automatically rewrite a strategy. This avoids overfitting to recent outcomes.

## 44.1 Controlled Learning Loop

```text
Trade / Decision
      ↓
Outcome
      ↓
Post-Trade Reflection
      ↓
Lesson / Hypothesis
      ↓
Backtest or quantitative validation
      ↓
Approved lesson
      ↓
Skill / knowledge update
```

Lessons from experience flow into qualitative experience memory immediately. Changes to approved procedural skills or strategy rules require quantitative validation first.

The following are kept separate:

- qualitative experience memory (immediate, episodic);
- quantitative strategy performance (structured records, PostgreSQL/TimescaleDB);
- approved procedural skill updates (require validation pipeline).

## 44.2 What the Agent May Do

The Main Agent may:

- record observations;
- form hypotheses;
- propose strategy changes;
- create research notes;
- create candidate skills;
- refine trading procedures;
- request backtests;
- compare strategy versions.

## 44.3 What the Agent May Not Do Autonomously

The Main Agent may NOT autonomously:

- increase its capital;
- disable risk limits;
- enable leverage;
- change exchange credentials;
- enable withdrawals;
- promote an untested strategy directly to live trading;
- overwrite historical performance;
- bypass owner approval.

---

# 45. Analytics Dashboard

The dashboard is the owner's trading command center.

Technology:

**Next.js + TypeScript**

Recommended charting:

**TradingView Lightweight Charts** or equivalent lightweight financial-chart component.

---

# 46. Dashboard — Overview

Home dashboard should display:

### Portfolio

- account equity;
- available balance;
- invested capital;
- realized P&L;
- unrealized P&L;
- daily return;
- weekly return;
- total return.

### Risk

- current exposure;
- daily drawdown;
- max drawdown;
- active risk;
- available risk budget.

### Main Agent

- status;
- last activity;
- current task;
- current opportunities;
- recent recommendations.

### Market

- BTC price;
- ETH price;
- 24h movement;
- volume;
- market regime.

---

# 47. Dashboard — Market View

Each market page should contain:

- candlestick chart;
- selected timeframe;
- volume;
- indicator overlays;
- support/resistance;
- detected signals;
- current regime;
- social trend;
- important news;
- relevant strategy matches.

---

# 48. Dashboard — Agent View

Show:

- agent status;
- uptime;
- current activity;
- recent observations;
- current candidate opportunities;
- completed analyses;
- trade proposals;
- approval history;
- rejected proposals;
- strategy usage;
- agent performance.

---

# 49. Dashboard — Trade Proposal View

Proposal screen:

```text
Trade Proposal

BTC/USDT
LONG

Entry
Stop
Targets

Risk
Reward/Risk

Strategy
Confidence

Why agent likes this trade
Why trade could fail
Historical evidence
Social evidence
News evidence
Market structure

[APPROVE]
[REJECT]
[WATCH]
```

---

# 50. Dashboard — Strategy Analytics

Required:

- strategies ranked by performance;
- strategy status;
- strategy version;
- historical return;
- paper return;
- live return;
- win rate;
- drawdown;
- profit factor;
- performance by market;
- performance by timeframe;
- performance by regime.

---

# 51. Dashboard — Trade Journal

Every trade should generate a journal entry.

Store:

- proposal;
- agent thesis;
- strategy;
- entry;
- stop;
- target;
- actual execution;
- market conditions;
- social conditions;
- outcome;
- P&L;
- duration;
- post-trade analysis;
- mistakes;
- useful observations.

---

# 52. Core System Architecture

```text
                           OUR TRADING PLATFORM

       Market Data / Analytics / Backtesting / Portfolio
            Risk / Social-News / Binance Execution
                            │
                            │ (Next.js Dashboard → FastAPI Gateway)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  Market Data         Trading Core         Intelligence
    Service              Service              Service
        │                   │                   │
        │            ┌──────┼──────┐         X / News
        │            │      │      │
        │           Risk Strategy Portfolio
        │            │      │      │
        ▼            └──────┼──────┘
  Redis Streams             │
        │                   │
        ├──────────┐         │
        ▼          ▼         ▼
  Analytics    TimescaleDB  Execution Service
  Worker            ▲           │
                    │           ▼
                    │    Idempotency Check
                    │           │
                    │           ▼
                    │     ExecutionAdapter
                    │      ╱          ╲
                    │  Paper        Binance
                    │  Adapter      Adapter
                    │  (simulated)      │
                    │                   ▼
                    │                  CCXT
                    │                   │
                    │                   ▼
                    │                Binance
                    │                   │
                    │                   │ balances / orders / fills
                    │                   ▼
                    └──────── Reconciliation Worker
```

The Execution Service is the sole holder of live exchange credentials. The Reconciliation Worker continuously compares platform state against exchange state and can block live execution. Paper and live differ only in which `ExecutionAdapter` terminates the pipeline.

```text
                    HERMES MAIN TRADER
                     persistent 24/7
                          │
                          │ optional escalation
                          ▼
                TRADINGAGENTS SERVICE
              specialist research committee
                          │
                          ▼
                  structured analysis
                          │
                          ▼
                      HERMES
                          │
                  final recommendation
                          │
                          ▼
                  OUR RISK ENGINE
                          │
                          ▼
                       OWNER
                  Approve / Reject
                          │
                          ▼
                  RISK RE-VALIDATION
                  + LIVE PRECONDITIONS
                  + IDEMPOTENCY CHECK
                          │
                          ▼
                       BINANCE
```

Hermes communicates with the trading platform exclusively through controlled tool APIs (FastAPI). Hermes may optionally escalate to the TradingAgents service via the `research.deep_analyze` tool. The Risk Engine and execution layer remain outside Hermes' direct control at all times.

Selected infrastructure components or implementation patterns may be adapted from HKUDS/AI-Trader when they fit the service boundaries defined in this architecture. Reused code must remain behind our own interfaces so the platform architecture does not become coupled to AI-Trader.

---

# 53. Backend Technology Stack

## Language

**Python**

Recommended runtime:

**Python 3.12+**

Reason:

Trading, data science, AI, quantitative research, and most required libraries have strong Python ecosystems.

## Open-Source Reuse Strategy

Explain the responsibility of each external project:

- **Hermes Agent** — primary persistent agent runtime and orchestrator; memory, skills, tool use, and 24/7 agent behavior.
- **TradingAgents** (TauricResearch) — optional specialist multi-agent research engine; called by Hermes via `research.deep_analyze` for deep analysis escalation.
- **HKUDS/AI-Trader** — trading infrastructure reference/donor codebase.
- **Freqtrade** — secondary trading/backtesting reference and strategy validation tool.
- **vectorbt** — primary quantitative research and fast backtesting engine.
- **CCXT / CCXT Pro** — exchange abstraction and real-time Binance market access.
- **TA-Lib** — standard technical indicator calculations.

Important architectural rule:

We reuse commodity infrastructure where useful, but our proprietary system remains responsible for opportunity detection, trading intelligence, strategy evaluation, trading skills, risk controls, performance analytics, agent learning, portfolio state, and owner-controlled execution.

---

# 54. API Framework

**FastAPI**

Responsibilities:

- dashboard API;
- Hermes tool APIs;
- strategy API;
- portfolio API;
- risk API;
- analytics API;
- backtesting API;
- trade proposal API;
- execution API;
- WebSocket API to frontend.

Recommended associated packages:

```text
fastapi
uvicorn
pydantic
pydantic-settings
httpx
```

---

# 55. Database Layer

Recommended:

```text
PostgreSQL
TimescaleDB
pgvector
SQLAlchemy
Alembic
asyncpg
```

Responsibilities:

### PostgreSQL

Business and trading state.

### TimescaleDB

High-volume time-series data.

### pgvector

Embedding storage and similarity search for the trading knowledge base.

### SQLAlchemy

Application persistence layer.

### Alembic

Schema migrations.

### asyncpg

Asynchronous PostgreSQL access.

## 55.1 Schema Ownership and Migrations

Migrations are required from the first commit that introduces a table. There is no phase of the project where the schema is managed by hand.

```text
SQLAlchemy Models
       ↓
Alembic
       ↓
PostgreSQL
```

Rules:

- SQLAlchemy models are the single source of schema definition;
- every schema change ships as an Alembic revision, reviewed with the code that needs it;
- manually applied production DDL is prohibited. A schema that drifts from migrations cannot be reproduced, and an unreproducible financial database cannot be trusted;
- migrations must be forward-only in production. Rollback is achieved by a new forward migration, because a down-migration that drops a column destroys financial history;
- destructive operations (drop table, drop column, type narrowing) on financial tables require explicit owner approval and a data-preservation plan;
- hypertable creation, compression policies, and retention policies are expressed in migrations, not applied ad hoc;
- a migration must never be edited after it has been applied to the live database.

## 55.2 Required PostgreSQL Extensions

```text
timescaledb
vector
```

Extension creation belongs in the earliest migrations, and the container image must include both extensions. Startup health checks verify their presence before the service reports ready (Section 75 — Service Readiness and Trading Readiness).

## 55.3 Migration Expectations by Environment

```text
LOCAL DEVELOPMENT
  developer runs migrations explicitly after pulling changes
  destructive reset of the local database is permitted
  seed data is loaded through a separate documented command,
  never inside a migration

CI
  migrations run from empty to head on every pipeline run
  a second run must be a no-op, proving idempotency
  models are checked against migrations; an un-migrated model
  change fails the build

DEPLOYMENT
  migrations run as an explicit ordered step before new
  application containers accept traffic
  exactly one migration runner executes at a time
  the application refuses to start if the schema version is
  behind the code's expected head
  live trading stays disabled until the schema version matches
```

The model-versus-migration drift check in CI is what prevents a developer's local model edit from silently becoming a production schema surprise.

---

# 56. Event / Cache Layer

Recommended:

```text
Redis
redis-py
```

Use Redis for:

- market-data event streams;
- opportunity events;
- short-lived caches;
- distributed state;
- UI broadcasts;
- worker coordination.

Prefer Redis Streams where events must survive consumer restarts.

---

# 57. Quantitative Stack

Recommended:

```text
NumPy
Polars
pandas
TA-Lib
vectorbt
SciPy
statsmodels
```

Primary responsibilities:

### NumPy

Numeric computation.

### Polars

High-performance data processing.

### pandas

Compatibility with ecosystem libraries.

### TA-Lib

Common technical indicators.

### vectorbt

Rapid strategy/backtest research.

### SciPy / statsmodels

Statistical analysis where required.

---

# 58. Exchange Stack

Primary:

```text
ccxt
ccxt.pro
```

Fallback/specialized:

```text
Binance native REST
Binance native WebSocket
```

Abstraction:

```text
ExchangeAdapter
```

The full capability list, decimal and symbol normalization rules, error categories, and the CCXT-versus-Binance-native policy are defined in Section 28 — Exchange Adapter Contract and CCXT Integration. That section is the authoritative contract; this section records only the library selection.

The rest of the application must not depend directly on Binance-specific code or on CCXT types. Both are confined behind the adapter.

Note the distinction between the two adapter layers, which are separate concerns:

```text
ExchangeAdapter    → how we talk to an exchange (transport, normalization)
ExecutionAdapter   → whether an order is real or simulated (paper vs live)
```

`BinanceExecutionAdapter` uses an `ExchangeAdapter`. `PaperExecutionAdapter` uses an `ExchangeAdapter` for market data only, and never for order placement.

---

# 59. Python Dependency Strategy

The full quantitative and research stack must not be a prerequisite for basic backend development. TA-Lib requires a compiled C library, and vectorbt pulls a heavy scientific dependency tree. If they sit in the base install, every developer, every CI run, and every container build pays that cost, and a broken system-level build blocks work that has nothing to do with quantitative analysis.

Dependencies are therefore layered, using `uv` dependency groups / optional extras.

## 59.1 Core Application Layer

Always installed. Sufficient to run the API, the market data pipeline, portfolio accounting, the Risk Engine, and paper execution.

```text
fastapi
uvicorn
pydantic
pydantic-settings
httpx

sqlalchemy
alembic
asyncpg

redis
ccxt

numpy
polars
pandas
```

A developer must be able to run the API, the workers, the database, migrations, and the full test suite for the financial core with only this layer installed.

## 59.2 Quantitative / Research Layer

Installed when working on indicators, backtesting, or statistical research.

```text
TA-Lib
vectorbt
SciPy
statsmodels
```

Notes:

- TA-Lib depends on a system-level C library. Its installation path must be documented and provided in the container image, not left to each developer to discover;
- services that do not compute indicators must not import this layer;
- if TA-Lib is unavailable, the API and the market data pipeline must still start. Analytics degrades; the platform does not fail to boot.

## 59.3 External / Optional Systems

Integrated as separately deployed services, never as libraries inside the trading platform process.

```text
Hermes
TradingAgents
Freqtrade
```

These are reached over HTTP across a service boundary. The platform must not import their packages into the API process. This keeps their dependency trees, their upgrade cycles, and their failure modes isolated from the financial core.

## 59.4 Development Layer

```text
ruff
mypy or pyright
pytest
pytest-asyncio
pytest-cov
```

Never installed in production images.

## 59.5 Dependency Rules

- dependencies are locked. `uv.lock` is committed and CI installs from the lockfile, so a build is reproducible and an upstream release cannot silently change behavior;
- production images install only the layers a given service needs;
- adding a dependency to the core layer is a deliberate decision, because it becomes mandatory for everyone;
- exchange, database, and cryptographic dependencies are pinned to exact versions and reviewed before upgrade;
- the financial core must not acquire a dependency on any LLM SDK. Model access happens through the LLM Gateway over HTTP.

---

# 60. Backtest Architecture

```text
Strategy Registry
       ↓
Backtest Request
       ↓
Historical Data
       ↓
vectorbt
       ↓
Metrics Engine
       ↓
Backtest Result
       ↓
Strategy Registry
```

Freqtrade may independently validate selected strategies.

---

# 61. Social Stack

Initial integration:

```text
X API
```

Service responsibilities:

- maintain relevant streaming filters;
- ingest posts;
- normalize posts;
- classify asset relevance;
- calculate mention velocity;
- calculate sentiment;
- identify unusual activity;
- aggregate metrics;
- expose intelligence API.

---

# 62. AI Model Layer

Hermes is model-provider agnostic, so the trading platform should avoid hard-coding business logic to one LLM provider. citeturn445293search0

The Main Agent should access models through the owner's shared LLM Gateway when appropriate.

Architecture:

```text
Hermes Trader
      ↓
LLM Gateway
      ↓
Model Router
   ↙      ↓      ↘
Model A Model B Model C
```

This allows routing based on:

- reasoning quality;
- cost;
- latency;
- task type.

Routine tasks should not require the most expensive model.

---

# 63. Model Usage Policy

Possible task routing:

### Cheap model

- summarization;
- event classification;
- sentiment extraction;
- basic formatting.

### Strong reasoning model

- opportunity analysis;
- conflicting evidence;
- strategy review;
- post-trade reflection;
- complex research.

### Deterministic code

Must handle:

- indicators;
- statistics;
- P&L;
- position sizing;
- risk calculations;
- order validation;
- confidence calibration.

LLMs must not replace deterministic financial calculations.

---

# 64. Frontend Stack

Recommended:

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
TanStack Query
TradingView Lightweight Charts
```

Optional:

```text
Zustand
```

for lightweight client-side UI state.

Server state should remain managed through API/query infrastructure rather than duplicated heavily in frontend state.

---

# 65. Realtime Dashboard

Backend:

```text
FastAPI WebSocket
```

Frontend:

```text
WebSocket client
```

Realtime events:

```text
PRICE_UPDATED
SIGNAL_DETECTED
OPPORTUNITY_CREATED
PROPOSAL_CREATED
ORDER_SUBMITTED
ORDER_FILLED
POSITION_UPDATED
RISK_ALERT
AGENT_ACTIVITY
```

---

# 66. Configuration Foundation

All configuration is typed, validated at startup, and loaded through `pydantic-settings`. Untyped `os.environ` reads scattered through the codebase are prohibited: a mistyped or missing trading-safety variable must fail loudly at boot, not silently default to something dangerous at 3am.

## 66.1 Configuration Principles

- one typed settings object per concern, composed into a single application settings root;
- validation runs at startup. Invalid or contradictory configuration prevents the service from starting rather than being discovered mid-trade;
- defaults always prefer safety. The safe value is the one that trades no money;
- secrets are referenced through configuration but never logged, never serialized into API responses, and never included in error messages;
- the resolved non-secret configuration is logged once at startup so any incident can be reconstructed against the exact settings in force;
- configuration is immutable at runtime. Changing trading-relevant configuration requires a restart, which makes the change deliberate and auditable.

## 66.2 Configuration Categories

```text
Application      APP_ENV, service name, log level, timezone (UTC)
Database         connection URL, pool sizing, statement timeout
Redis            connection URL, stream names, consumer groups, key prefix
Exchange         exchange id, credential source, rate limits, sandbox flag
Trading          TRADING_MODE, symbol allowlist, timeframes
Risk             all risk limits, staleness thresholds, kill switch state source
Execution        LIVE_TRADING_ENABLED, slippage assumptions, approval TTL
Hermes           base URL, service token reference, timeouts
TradingAgents    base URL, service token reference, timeouts, escalation budget
LLM Gateway      base URL, key reference, model routing preferences, cost caps
Intelligence     X API credentials reference, news sources, poll intervals
Monitoring       metrics port, tracing sample rate, alert destinations
```

## 66.3 Safe Defaults

Committed defaults, which must be safe even if every override is forgotten:

```yaml
app:
  env: development

trading:
  mode: paper

markets:
  symbols:
    - BTC/USDT
    - ETH/USDT

  timeframes:
    - 15m
    - 1h
    - 4h

risk:
  spot_only: true
  leverage_enabled: false
  max_risk_per_trade_percent: 0.5
  market_data_max_age_seconds: 60

execution:
  live_enabled: false
  require_owner_approval: true
  approval_ttl_seconds: 300
  approval_ttl_max_seconds: 900

reconciliation:
  required_on_startup: true
  block_live_on_divergence: true
```

## 66.4 Cross-Field Validation

Certain combinations must be rejected at startup, not merely warned about:

```text
TRADING_MODE=live AND APP_ENV=development              → reject
LIVE_TRADING_ENABLED=true AND TRADING_MODE=paper       → reject
TRADING_MODE=live AND missing live exchange credentials → reject
TRADING_MODE=live AND leverage_enabled=true            → reject (out of MVP scope)
TRADING_MODE=live AND spot_only=false                  → reject (out of MVP scope)
symbol outside the allowlist                            → reject
paper and live sharing a database name or Redis prefix  → reject
approval_ttl_seconds <= 0                               → reject
approval_ttl_seconds > approval_ttl_max_seconds          → reject
market_data_max_age_seconds <= 0                        → reject
max_risk_per_trade_percent <= 0 or > risk cap            → reject
require_owner_approval=false AND TRADING_MODE=live       → reject (MVP 1 requires approval)
```

`approval_ttl_max_seconds` is an enforced upper bound on the configurable approval TTL (Section 25 — Owner Approval). It exists so that a mistyped or over-generous TTL cannot silently authorize an order against a stale market picture.

The `require_owner_approval=false` rejection is structural: MVP 1 does not permit autonomous live execution, so the configuration is not able to express it.

## 66.5 Configuration Visibility

The active `APP_ENV`, `TRADING_MODE`, `LIVE_TRADING_ENABLED`, symbol allowlist, and risk configuration version must be observable through the system API and displayed in the dashboard. The owner must never have to guess whether the running system is trading real money.

---

# 67. Infrastructure

Initial deployment can remain simple.

Recommended:

```text
VPS
Docker
Docker Compose
Nginx or Caddy
systemd
```

Services:

```text
frontend
api
market-worker
analytics-worker
intelligence-worker
reconciliation-worker
execution-service
postgres-timescale
redis
hermes-trader
tradingagents-service
prometheus
grafana
```

Avoid Kubernetes for MVP.

## 67.1 Container and Network Boundaries

- only the reverse proxy is exposed publicly. It terminates TLS and fronts the dashboard and the API;
- PostgreSQL, Redis, Prometheus, and Grafana are not published to the public interface. They are reachable only on the private Docker network;
- Hermes and TradingAgents reach the platform over the private network using service tokens (Section 70 — Authentication Architecture);
- the Execution Service is the only container that receives live exchange credentials in its environment. No other container, including the API gateway, mounts or inherits them;
- containers run as non-root with read-only root filesystems where practical.

## 67.2 Deployment Safety

- migrations run as an explicit ordered step before new containers accept traffic (Section 55 — Database Layer);
- deployment does not implicitly re-enable live trading. After any deploy or restart the system returns to the safe startup state defined in Section 76 — Safe Startup State;
- the previous image is retained so a rollback is possible without a rebuild;
- database backups run on a schedule, and restore must be tested before live capital is enabled. An untested backup is not a backup;
- deploying while an execution request is in `UNKNOWN` state is prohibited. Resolve execution ambiguity through reconciliation first, because restarting mid-ambiguity loses the recovery context.

---

# 68. Observability

Recommended:

```text
Prometheus
Grafana
structured JSON logs
```

Monitor:

- WebSocket connectivity;
- exchange latency;
- exchange errors;
- stale market data;
- agent uptime;
- agent tool failures;
- opportunity frequency;
- proposal frequency;
- execution latency;
- failed orders;
- API latency;
- database health;
- Redis health;
- model requests;
- token usage;
- AI cost;
- reconciliation outcome and divergence count;
- execution requests in `UNKNOWN` state;
- idempotency conflicts;
- trading readiness state;
- kill switch state.

Observability is a precondition for live trading, not a follow-up task. A trade whose lifecycle cannot be reconstructed from logs is a trade that cannot be audited or debugged.

## 68.1 Correlation Identifiers

Every log line, metric label where cardinality permits, and stored record carries the identifiers that let a complete trade lifecycle be reconstructed.

```text
correlation_id          spans one logical lifecycle end to end
opportunity_id
proposal_id
risk_decision_id
approval_id
execution_request_id
idempotency_key
client_order_id
exchange_order_id
fill_id
position_id
trade_id
```

The `correlation_id` is created when an opportunity is detected and propagates through every downstream step:

```text
Opportunity
   → Proposal
   → Risk Decision
   → Owner Approval
   → Execution Request
   → Exchange Order
   → Fill
   → Position
   → Trade
   → Post-trade evaluation
```

Propagation rules:

- the identifier crosses HTTP boundaries in a standard header, including calls from Hermes and TradingAgents;
- it crosses Redis Streams as a message field;
- background workers inherit it from the message they consume rather than generating a new one;
- one query on `correlation_id` must return the full ordered history of a trade across every service.

## 68.2 Structured Logging Requirements

- logs are JSON, one event per line, with a UTC timestamp;
- every log carries service name, `APP_ENV`, `TRADING_MODE`, and the correlation identifiers in scope;
- financial events log the decimal values that were actually used, never a rounded display value;
- **secrets are never logged.** API keys, secret keys, service tokens, session cookies, database URLs with embedded passwords, and LLM gateway keys must be redacted by a logging filter, not merely omitted by convention at each call site;
- raw exchange requests and responses are logged for audit with credentials and signatures stripped;
- prompts and model responses may be logged for agent evaluation, but must be screened so no credential can reach them.

## 68.3 Required Alerts

The owner must be alerted, through a channel checked outside the dashboard, on:

- reconciliation divergence classified `UNEXPECTED_*` or `CRITICAL`;
- any execution request remaining in `UNKNOWN` state beyond a short threshold;
- live execution blocked by a failed precondition;
- kill switch activation;
- exchange authentication failure;
- market data staleness beyond the risk threshold;
- daily or weekly loss limit breach;
- database or Redis unavailability;
- unexpected withdrawal permission detected on the live API key.

---

# 69. Financial Audit Log

Every financially relevant event must be immutable/auditable.

Log:

- signal;
- agent recommendation;
- strategy version;
- owner action;
- risk decision;
- requested order;
- submitted order;
- Binance response;
- fill;
- cancellation;
- position update;
- risk alert;
- reconciliation run and each divergence;
- configuration change affecting trading or risk;
- trading mode transition;
- kill switch activation and deactivation;
- live execution blocked by a failed precondition.

Never overwrite historical decisions.

Corrections should generate new records.

## 69.1 Append-Only Guarantees

The audit log is append-only in the strong sense, enforced structurally rather than by convention:

- the application database role has `INSERT` and `SELECT` on the audit table, and no `UPDATE` or `DELETE`;
- no Alembic migration may rewrite audit rows. Schema changes add nullable columns;
- every record carries its correlation identifiers (Section 68 — Observability), the actor, and the trading mode;
- the actor is explicit and unambiguous: `OWNER`, `HERMES`, `TRADINGAGENTS`, `RISK_ENGINE`, `EXECUTION_SERVICE`, `RECONCILIATION_WORKER`, or `SYSTEM`;
- a correction appends a reversing or superseding record that references the original `audit_id`. The original remains readable forever.

Rationale: the audit log is the only artifact that can answer "why did this trade happen" after the fact. If it can be edited, it cannot answer that question.

## 69.2 Reconstruction Requirement

Given a `correlation_id` or a `trade_id`, the platform must be able to reconstruct, without inference:

```text
what was detected, and from what market data
what the agent reasoned, and which skills and evidence it used
whether TradingAgents was consulted, and what it returned
what the Risk Engine decided, against which limits and config version
what the owner approved, and when
what was submitted to the exchange, and what came back
which fills were applied, at what prices and fees
how the position and P&L were derived
what the post-trade evaluation concluded
```

This reconstruction must be verified by test before live capital is enabled (Section 85 — Testing Strategy).

---

# 70. Authentication Architecture

The platform is private and single-user. The authentication model is deliberately minimal, but it must still separate four distinct credential domains, because collapsing them is how an agent or a browser ends up holding exchange authority.

```text
human authentication          owner → dashboard
service authentication        Hermes / TradingAgents → platform APIs
exchange authentication       Execution Service → Binance
infrastructure credentials    services → database, Redis, monitoring
```

These four domains use different credentials, are rotated independently, and grant non-overlapping authority. A credential from one domain must never be accepted in another.

## 70.1 Owner Authentication

Protects the dashboard, approvals, configuration, the kill switch, and all sensitive portfolio information.

**Decision: single-owner session authentication backed by a password credential plus a second factor (TOTP), issuing a signed, short-lived, HTTP-only session cookie.**

Rationale:

- there is exactly one human user and no registration, invitation, password-reset, or tenant-isolation requirement, so an external identity provider (OAuth/OIDC/Auth0/Clerk) adds a runtime dependency, a network failure mode, and configuration surface for capabilities the product does not need;
- the dashboard authorizes real money movement, so a single static password or a shared bearer token is insufficient. TOTP is the proportionate second factor: no SMS dependency, no third-party service, standard authenticator app;
- HTTP-only, `Secure`, `SameSite` session cookies avoid storing tokens in JavaScript-reachable storage, which removes the most common token-exfiltration path for a browser dashboard;
- sessions are server-verifiable and individually revocable, so losing a laptop is recoverable without rotating unrelated credentials.

Requirements:

- the owner password is stored only as a strong password hash (Argon2id or bcrypt). It is never stored reversibly and never logged;
- TOTP enrollment is mandatory before live trading is enabled;
- sessions are short-lived with idle expiry, and refresh requires an unexpired session;
- all dashboard and owner API traffic is HTTPS only, with TLS terminated at the reverse proxy;
- CSRF protection on all state-changing owner endpoints, since authentication is cookie-based;
- rate limiting and lockout on authentication attempts;
- the dashboard is additionally protected at the network edge where practical (IP allowlist on the reverse proxy). This is defence in depth, not the primary control;
- approval actions and kill switch activation require an active owner session. They must never be reachable through a service token.

`DASHBOARD_AUTH_SECRET` signs session cookies. Rotating it invalidates all sessions, which is the intended emergency behavior.

## 70.2 Service Authentication

Machine-to-machine calls use their own credentials, distinct per caller so that authority can be scoped and revoked independently.

```text
Hermes
    ↓ HERMES_SERVICE_TOKEN
Trading Platform API   (agent tool endpoints)
```

```text
TradingAgents
    ↓ TRADINGAGENTS_SERVICE_TOKEN
internal APIs          (market data and analytics reads only)
```

Requirements:

- each service token is a distinct high-entropy secret, never shared between services and never equal to the owner credential;
- tokens are presented on internal HTTP calls and validated on every request;
- tokens are scoped. The platform authorizes per endpoint by caller identity, not merely "is authenticated";
- service tokens must never grant: owner approval, risk configuration changes, kill switch control, live order submission, credential access, or raw database access;
- Hermes' maximum authority is to read platform state and to create or update proposals. A proposal is a request, not an order;
- TradingAgents is more restricted than Hermes: read-only market data and analytics. It must not create proposals, read portfolio balances, or read any credential;
- service tokens are rejected on owner-only endpoints, and owner sessions are rejected on service-only endpoints. The two are not interchangeable;
- every authenticated call is logged with the caller identity for the audit trail.

## 70.3 Authority Matrix

| Capability | Owner | Hermes | TradingAgents | Frontend |
|---|---|---|---|---|
| Read market data / analytics | yes | yes | yes | yes |
| Read portfolio, positions, P&L | yes | yes | no | yes |
| Read strategy performance | yes | yes | no | yes |
| Read risk configuration | yes | yes | no | yes |
| Create / update trade proposal | yes | yes | no | no |
| Write risk configuration | yes | no | no | no |
| Approve a trade | yes | no | no | no |
| Submit a live order | no (approves only) | no | no | no |
| Activate kill switch | yes | no | no | no |
| Access exchange credentials | no | no | no | no |
| Access database directly | no | no | no | no |

Note that no principal in this table can submit a live order. Only the Execution Service does, and only when every precondition in Section 8 (Runtime Environments and Trading Modes) holds. The owner authorizes; the platform executes.

---

# 71. Secrets and Credential Model

Secrets are managed independently from Hermes and independently from the application database.

## 71.1 Required Secrets

```text
# Infrastructure
DATABASE_URL
REDIS_URL

# Exchange (Execution Service only)
BINANCE_API_KEY
BINANCE_SECRET_KEY

# Intelligence
X_API_TOKEN

# Model access
LLM_GATEWAY_URL
LLM_GATEWAY_KEY

# Service-to-service
HERMES_SERVICE_TOKEN
TRADINGAGENTS_SERVICE_TOKEN

# Owner authentication
DASHBOARD_AUTH_SECRET
```

Each secret is scoped to the services that genuinely require it. Compose must not distribute one shared environment file to every container.

| Secret | Consumers |
|---|---|
| `DATABASE_URL` | api, workers, execution-service, reconciliation-worker |
| `REDIS_URL` | api, workers, execution-service |
| `BINANCE_API_KEY` / `BINANCE_SECRET_KEY` | execution-service only |
| `X_API_TOKEN` | intelligence-worker only |
| `LLM_GATEWAY_URL` / `LLM_GATEWAY_KEY` | hermes-trader, tradingagents-service |
| `HERMES_SERVICE_TOKEN` | hermes-trader, api (for validation) |
| `TRADINGAGENTS_SERVICE_TOKEN` | tradingagents-service, api (for validation) |
| `DASHBOARD_AUTH_SECRET` | api only |

## 71.2 Handling Rules

- `.env.example` may be committed. It contains variable names and safe placeholder values only, never a real secret;
- `.env` must never be committed. It is git-ignored, and a pre-commit secret scan runs to catch mistakes;
- production secrets must never appear in source code;
- production secrets must never appear in prompts;
- production secrets must never enter Hermes memory;
- production secrets must never enter trading skills, skill reference files, or strategy definitions;
- production secrets must never reach the frontend. Any value in a `NEXT_PUBLIC_*` variable or in a server-rendered payload is public;
- production secrets must never be stored in the application database;
- logs must redact secrets through a logging filter, not through per-call-site discipline (Section 68 — Observability);
- error responses and stack traces must not echo connection strings or credentials;
- TradingAgents must not receive Binance credentials under any circumstance;
- Hermes must not receive Binance credentials under any circumstance.

## 71.3 Rotation Support

**Design position: rotation must be fully supported, but MVP 1 sets no fixed mandatory cadence.**

The engineering requirement is that every secret *can* be rotated quickly, safely, and without a code change. Rotation is therefore event-driven: it happens when there is a reason, not on a calendar. A mandated cadence on a private single-user platform adds operational ritual without reducing risk, and a rotation procedure performed reluctantly on a schedule is less reliable than one that is known to work on demand.

The owner may adopt a periodic cadence later. Nothing in the architecture should assume one exists.

### Rotation triggers

Rotation is required, promptly, on any of:

| Secret | Rotate when |
|---|---|
| `BINANCE_API_KEY` / `BINANCE_SECRET_KEY` | suspected exposure, developer machine compromise, VPS incident, key ever present in a non-live environment, or withdrawal permission unexpectedly observed |
| `HERMES_SERVICE_TOKEN` | Hermes host change, runtime compromise, or token observed outside its intended service |
| `TRADINGAGENTS_SERVICE_TOKEN` | service host change or suspected exposure |
| `DASHBOARD_AUTH_SECRET` | suspected session theft or the need to force-invalidate all sessions |
| Owner password / TOTP | device loss, suspected credential disclosure |
| `X_API_TOKEN`, `LLM_GATEWAY_KEY` | provider advice, suspected exposure |
| `DATABASE_URL`, `REDIS_URL` credentials | infrastructure change, suspected exposure |

Any secret that appears in a log, a prompt, agent memory, a commit, a screenshot, or an error message is treated as compromised and rotated, regardless of how briefly it was exposed.

### Rotation requirements

- rotation must be possible without a code change. Secrets are read from the environment or a mounted secret file;
- rotation must be possible without data loss and without a schema change;
- each secret must be rotatable independently. Rotating the exchange key must not require rotating service tokens;
- exchange key rotation must be verifiable: after rotation, the Execution Service re-checks credential validity and confirms withdrawal permission is still absent before trading readiness is granted (Section 72 — Binance Credential Separation);
- rotating `DASHBOARD_AUTH_SECRET` invalidates all owner sessions. This is the intended emergency behavior and must not be treated as a defect;
- a written rotation procedure must exist before live capital is enabled, and must have been rehearsed at least once in paper mode. An unrehearsed procedure will fail when it is needed most, which is precisely when it is needed most.

The rehearsal requirement is retained deliberately: dropping the fixed cadence is a decision about *when* to rotate, not about whether rotation is known to work.

---

# 72. Binance Credential Separation

Exchange credentials are separated by environment, and live credentials are the most tightly held secret in the system.

## 72.1 Credentials by Environment

```text
DEVELOPMENT
  no live credentials present
  Binance Spot Testnet credentials, or no credentials at all
  exchange adapter resolves to paper / sandbox
  public market data endpoints need no credentials

PAPER
  no live trading credentials
  optionally a read-only key for market data and symbol metadata
  order placement is simulated, so no trading permission is required

LIVE
  a dedicated live key used for nothing else
  trade permission only
  withdrawals disabled
  IP-restricted to the VPS where supported
```

Separate credentials per environment are mandatory. Reusing one key across paper and live removes the last barrier preventing a misconfigured paper deployment from placing real orders.

## 72.2 Live Credential Requirements

For the live Binance key:

- trading permission only;
- withdrawals disabled;
- IP restriction to the VPS address where supported;
- least privilege: no margin, no futures, no sub-account transfer, no universal transfer;
- separate from any credential used for manual trading or experimentation;
- never exposed to Hermes;
- never exposed to TradingAgents;
- never exposed to the frontend;
- never stored in the database, in agent memory, or in trading skills;
- never present in a development environment.

## 72.3 Sole Custody

**The Execution Service is the only component allowed to access live exchange credentials.**

Consequences:

- credentials are injected only into the execution-service container;
- the API gateway does not hold them. It forwards validated execution requests to the Execution Service over the private network;
- workers, the analytics service, the intelligence worker, and the backtesting service never hold them;
- if the Execution Service is the only holder, then compromising Hermes, the dashboard, or any worker cannot directly place an exchange order. That containment is the point.

## 72.4 Startup Permission Verification

Before trading readiness is granted in live mode, the Execution Service must verify with the exchange that:

```text
the credentials are valid
trading permission is present
withdrawal permission is ABSENT
the account is a spot account
the configured symbols are tradable and their filters are known
```

If withdrawal permission is unexpectedly enabled, the platform must refuse to enable live trading and must alert the owner. A key with withdrawal rights is treated as compromised in intent, regardless of how it came to be configured that way.

---

# 73. Failure Handling

The governing rule: **every failure path fails closed.** When the platform cannot verify that trading is safe, it does not trade. Unknown is treated as unsafe.

## Market feed disconnect

System must:

1. mark market data stale;
2. disable new actionable proposals;
3. reconnect;
4. resynchronize state;
5. run reconciliation after reconnect, because fills may have occurred during the gap;
6. backfill missed candles before analytics resume producing signals.

Market data older than the configured staleness threshold blocks live execution regardless of how healthy every other component looks.

## Binance unavailable

System must:

- reject new execution requests;
- preserve the proposal and approval records;
- treat in-flight submissions as `UNKNOWN` rather than failed;
- alert owner;
- resolve `UNKNOWN` requests by exchange query once connectivity returns, never by resubmission.

## LLM unavailable

System must:

- continue collecting market data;
- continue deterministic analytics;
- continue portfolio accounting and reconciliation;
- pause deep agent reasoning;
- recover when model service returns.

No financial state depends on the LLM. Existing positions and their risk controls remain fully managed.

## Hermes unavailable

System must:

- continue market ingestion;
- continue analytics;
- continue portfolio tracking;
- continue reconciliation and risk monitoring;
- prevent new agent proposals;
- alert owner.

Hermes is intelligence, not infrastructure. Its absence stops new ideas, not financial correctness.

## TradingAgents unavailable

System must:

- treat `research.deep_analyze` as a failed optional escalation;
- allow Hermes to proceed with fast-path evidence or decline to propose;
- never block the fast path waiting on the deep path.

## Redis unavailable

Critical services must fail safely rather than trade from stale events.

- block new live execution;
- mark market data stale, since the transport for fresh data is down;
- preserve all financial state, which lives in PostgreSQL and is unaffected;
- resume consumer groups from their last committed offsets on recovery, then reconcile.

## Database unavailable

No new live trade should execute unless required state can be safely verified.

- refuse all execution requests, because the idempotency key cannot be persisted and duplicate submission becomes possible;
- refuse proposal creation and approval;
- continue market data ingestion into Redis Streams where possible so the buffer can be drained on recovery;
- alert owner immediately.

## Risk Engine unavailable or unhealthy

- refuse all new orders in every mode;
- never degrade to permissive behavior.

## Reconciliation failure or unresolved divergence

- set `reconciliation_blocked`;
- refuse new live execution until resolved;
- require explicit owner acknowledgement for `CRITICAL` divergence.

## Process crash mid-execution

- the execution request was persisted before the network call, so it is recoverable;
- on restart, any request in `SUBMITTING` or `UNKNOWN` is resolved by exchange query before trading readiness is granted;
- live execution stays disabled until every ambiguous request is resolved.

## Clock skew

- the VPS runs NTP synchronization;
- Binance rejects requests with excessive timestamp drift, so skew must be monitored;
- skew beyond tolerance blocks live execution, because signed request timestamps and fill ordering both depend on a correct clock.

---

# 74. Kill Switch

The owner must have one global control:

```text
STOP ALL TRADING
```

It must:

- prevent all new orders;
- prevent new position creation;
- preserve market monitoring;
- preserve analytics;
- preserve data collection;
- optionally cancel open unfilled orders.

Closing existing positions should require an explicit separate command unless an emergency policy specifies otherwise.

## 74.1 Kill Switch Requirements

The kill switch is the owner's last line of defense and must work when the rest of the system is misbehaving.

- state is persisted in PostgreSQL, not held in memory or only in Redis, so it survives every restart. A kill switch that forgets itself on reboot is not a kill switch;
- it is checked by the Execution Service immediately before every order submission, not only when a proposal is created;
- it is fail-safe: if the switch state cannot be read, the system behaves as though it is active;
- activation requires an authenticated owner session and takes effect immediately for all subsequent submissions;
- deactivation is a separate, explicit owner action, and requires trading readiness to be re-verified before live execution resumes;
- activation and deactivation are recorded in the financial audit log with actor and timestamp;
- the switch is reachable through the dashboard and through a direct API endpoint, so a broken frontend build cannot prevent the owner from stopping trading.

Closing positions is deliberately separate. Panic-liquidating into a thin market can cause more loss than the situation being escaped, so position exit stays an explicit decision.

---

# 75. Service Readiness and Trading Readiness

The platform must distinguish two states that are routinely, and dangerously, conflated:

```text
service running       →  the process is up and answering requests
service safe to trade →  every financial precondition is verified
```

These are not equivalent. A perfectly healthy process with stale market data and unreconciled positions is running, and is not safe to trade.

## 75.1 Three Health Endpoints

```text
/health/live      process is alive                      (restart probe)
/health/ready     dependencies available, can serve API (traffic probe)
/health/trading   safe to place orders                  (financial gate)
```

`/health/trading` is a distinct, explicit financial gate. It must never be inferred from `/health/ready`.

## 75.2 Trading Readiness Checklist

Before live execution is permitted, all of the following must be verified:

```text
Database healthy
Database schema at expected migration head
Required extensions present (timescaledb, vector)
Redis healthy
Redis consumer groups positioned
Market feed connected
Market data fresh within the staleness threshold
No gaps in recent candle history for configured symbols
Risk Engine healthy and risk configuration loaded
Risk configuration version recorded
Portfolio state available and internally consistent
Exchange reachable
Exchange credentials valid
Exchange withdrawal permission absent
Symbol filters loaded for every configured symbol
Exchange reconciliation successful and not blocked
No execution request in SUBMITTING or UNKNOWN state
Clock synchronized within tolerance
Kill switch inactive
Live execution preconditions satisfied
```

Rules:

- each check reports individually, so a failure is immediately attributable rather than presented as a single opaque "not ready";
- readiness is re-evaluated continuously, not cached from startup. Conditions degrade during operation;
- readiness for paper mode uses the same checklist minus the live exchange credential checks. Paper must be held to the same accounting and data-freshness standards, otherwise its results are not evidence;
- the dashboard displays trading readiness prominently, with the specific failing checks listed.

---

# 76. Safe Startup State

After every deployment, restart, or crash recovery, the platform starts conservatively. It must never assume that conditions which were safe before the restart are still safe.

## 76.1 Startup Sequence

```text
Application Start
      ↓
Configuration Load and Validation
      ↓  (reject contradictory or unsafe configuration)
Infrastructure Health
      ↓  (database, Redis reachable)
Database State
      ↓  (schema at expected head, extensions present)
Recover In-Flight Financial State
      ↓  (resolve SUBMITTING / UNKNOWN execution requests)
Exchange Connectivity
      ↓  (reachability, credential and permission verification)
Market Data Synchronization
      ↓  (streams connected, gaps backfilled, freshness confirmed)
Portfolio Reconciliation
      ↓  (platform state vs exchange state)
Risk Engine Validation
      ↓  (config loaded, self-test passed)
Trading Readiness
      ↓
Live execution available
```

Each stage must pass before the next is attempted. A failure at any stage leaves the platform running in a monitoring-only state: it continues ingesting data, computing analytics, and serving the dashboard, but it does not trade.

## 76.2 Startup Defaults

On every start, regardless of prior state:

- live execution is unavailable until trading readiness passes;
- the kill switch retains its persisted state. A restart never clears it. Clearing it requires a deliberate owner action;
- `reconciliation_blocked` retains its persisted state. A restart never clears a blocking divergence;
- no order is submitted during startup. Recovery is read-only: query, compare, record;
- no pending owner approval is auto-executed on startup. Approvals that expired while the service was down must be re-confirmed, because the market has moved and the owner's decision was made under different conditions.

That last rule matters: a restart must never cause a queue of stale approvals to fire into a market that has changed.

## 76.3 Recovery Order Rationale

In-flight financial state is resolved before market data synchronization and before trading readiness, because an unresolved `UNKNOWN` execution request means the platform may already hold a position it does not know about. Reconciling balances before resolving that ambiguity would compare against an incomplete picture and could classify a real position as an unexplained divergence.

---

# 77. MVP Functional Flow

```text
1. Market feed receives BTC/ETH data.

2. Data stored and distributed.

3. Analytics worker updates indicators/regime.

4. Opportunity detector detects candidate.

5. Candidate event wakes Main Agent.

6. Agent requests market context.

7. Agent loads relevant trading skill.

8. Agent requests social/news context.

9. Agent requests historical strategy performance.

10. Agent evaluates supporting and contradicting evidence.

11. Agent creates Trade Proposal.

12. Risk Engine validates proposed trade.

13. Owner receives proposal.

14. Owner:
       APPROVE
       REJECT
       WATCH

    Approval binds to this exact proposal and expires.

15. Approved request reaches Execution Service.

16. Risk Engine re-validates immediately before submission.

17. Live execution preconditions are evaluated.
    Any unmet or unverifiable condition stops here.

18. Idempotency key is persisted before any network call.

19. ExecutionAdapter submits the order.
       PAPER → PaperExecutionAdapter
       LIVE  → BinanceExecutionAdapter

20. Fills are applied idempotently to the ledger.

21. Position is derived from the fill ledger and monitored.

22. Reconciliation confirms platform state matches the exchange.

23. Trade closes.

24. Performance is calculated.

25. Agent receives outcome.

26. Observation and quantitative results are stored.

27. Future decisions can use this history.
```

Steps 1 through 14 and 20 through 27 are identical in paper and live mode. Only step 19 resolves to a different adapter. Steps 16 through 18 are the financial safety boundary, and none of them may be skipped.

---

# 78. MVP Features

## Must Have

### Main Agent

- isolated Hermes trading runtime;
- 24/7 operation;
- persistent trading context;
- trading skills;
- controlled tools;
- opportunity investigation;
- structured proposals.

### Market

- BTC;
- ETH;
- Binance;
- spot;
- 15m;
- 1h;
- 4h.

### Analytics

- OHLCV;
- volume;
- RSI;
- MACD;
- moving averages;
- ATR;
- trend;
- volatility;
- market structure;
- market regime.

### Intelligence

- X/social monitoring;
- news ingestion;
- social trend metrics;
- event correlation.

### Strategies

- strategy registry;
- trading skills;
- strategy versioning;
- backtesting;
- paper performance;
- live performance.

### Trading

- portfolio tracking;
- paper trading;
- Binance connectivity;
- owner-approved execution;
- stop/target support.

### Risk

- position limits;
- loss limits;
- asset allowlist;
- spot-only;
- no leverage;
- kill switch.

### Dashboard

- portfolio overview;
- market analytics;
- agent status;
- opportunities;
- trade proposals;
- strategy analytics;
- trade journal;
- risk status.

---

# 79. Explicitly Out of Scope — MVP 1

The following must NOT be built during MVP 1:

- multiple independent trading agents;
- Agent Arena;
- agent-vs-agent competition;
- agent capital competition;
- Agent Factory UI;
- specialist mini-agents;
- autonomous portfolio allocation between agents;
- unrestricted agent self-modification;
- fully autonomous live trading;
- futures;
- options;
- leverage;
- forex;
- equities;
- high-frequency trading;
- market making;
- cross-exchange arbitrage;
- withdrawals;
- public SaaS;
- multi-tenancy;
- subscription billing;
- strategy marketplace;
- mobile application;
- custom foundation model;
- custom generic agent framework.

---

# 80. Future Architecture Compatibility

Although future agents are out of scope, shared components must be designed independently of the Main Agent.

Future architecture:

```text
                      Shared Trading Core

          Market / Research / Quant / Backtest
             Risk / Portfolio / Execution
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   Main Agent        Mini Agent A      Mini Agent B
     Memory              Memory            Memory
     Skills              Skills            Skills
     Goal                Goal              Goal
```

Each agent should eventually require only:

```text
AgentProfile
├── ID
├── objective
├── model
├── instructions
├── memory
├── skills
├── permissions
├── schedule
└── capital/risk configuration
```

No dedicated complex Agent Manager is required for MVP.

Agents should eventually behave like independently deployable automations consuming the same shared tool platform.

---

# 81. Future Agent Arena

Not part of MVP.

Concept preserved for future development:

```text
5 independent agents
$5 experimental capital each
7-day evaluation
different strategies
independent memory
shared tools
controlled risk
```

Agents would be evaluated on risk-adjusted return rather than raw profit.

This feature will only be considered after the Main Agent demonstrates credible performance.

---

# 82. Recommended Repository Structure

```text
ai-trader/
│
├── apps/
│   ├── web/
│   │   └── Next.js dashboard
│   │
│   └── api/
│       └── FastAPI application
│
├── services/
│   ├── market-data/
│   ├── analytics/
│   ├── intelligence/
│   ├── backtesting/
│   ├── portfolio/
│   ├── risk/
│   └── execution/
│
├── agent/
│   ├── tools/
│   ├── prompts/
│   ├── context/
│   └── hermes-config/
│
├── skills/
│   └── trading/
│
├── strategies/
│
├── packages/
│   ├── domain/
│   ├── exchange/
│   ├── database/
│   └── events/
│
├── infrastructure/
│   ├── docker/
│   ├── prometheus/
│   └── grafana/
│
├── migrations/
│   └── alembic/
│
├── research/
│   └── open-source/
│       └── ai-trader-notes/
│
├── tests/
│
├── docs/
│
├── pyproject.toml
├── uv.lock
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── docker-compose.override.yml.example
├── .env.example
├── Makefile
├── .pre-commit-config.yaml
├── .gitignore
└── README.md
```

External reference projects should normally remain outside the production source tree. We do not vendor the full HKUDS/AI-Trader repository into the product by default.

The `research/open-source/ai-trader-notes/` directory is reserved for:

- architecture notes;
- reusable-component analysis;
- integration decisions;
- migration notes.

Do not copy the full upstream repository into this directory unless a specific component is intentionally adopted.

## 82.1 Repository Bootstrap

A new developer, or a coding agent, must be able to reach a running system without undocumented manual steps.

Required local tooling:

```text
Python 3.12+
uv
Node.js LTS
pnpm
Docker
Docker Compose
Git
```

Target bootstrap experience:

```text
cp .env.example .env
uv sync
pnpm install
docker compose up -d
uv run alembic upgrade head
```

Requirements:

- `uv sync` installs the core application layer plus the development layer from the committed `uv.lock`. It must not require a system TA-Lib build to succeed (Section 59 — Python Dependency Strategy);
- `docker compose up -d` starts PostgreSQL with TimescaleDB and pgvector, Redis, and the application services with safe defaults, meaning `TRADING_MODE=paper` and `LIVE_TRADING_ENABLED=false`;
- the database image must include both required extensions, so no manual extension installation step exists;
- a `Makefile` (or equivalent task runner) wraps the common commands so they are discoverable and identical in CI: `make bootstrap`, `make up`, `make migrate`, `make lint`, `make typecheck`, `make test`, `make check`;
- `docker-compose.override.yml.example` documents local-only conveniences without polluting the committed compose file;
- the bootstrap path is verified by a CI job that runs it from a clean checkout. Documented setup instructions that nobody executes are setup instructions that do not work.

Bootstrap must never require live exchange credentials. A developer with no Binance account must still be able to run the platform, its tests, and paper mode.

---

# 83. Core Domain Objects

Primary objects:

```text
Asset
Market
Candle
MarketEvent
IndicatorSnapshot
MarketRegime
Opportunity
Strategy
StrategyVersion
Backtest
TradingSkill
TradeProposal
RiskDecision
OwnerApproval
ExecutionRequest
IdempotencyKey
Order
Execution
Fill
Position
Portfolio
PortfolioAccount
Trade
ReconciliationRun
ReconciliationDivergence
RiskConfigVersion
AuditRecord
AgentDecision
AgentObservation
SocialEvent
NewsEvent
```

Every financial object carries its trading mode, so a paper record can never be mistaken for a live record. Every object in the proposal-to-fill chain carries the correlation identifiers defined in Section 68 — Observability.

---

# 84. Core API Domains

Recommended API organization:

```text
/api/v1/markets
/api/v1/analytics
/api/v1/opportunities
/api/v1/intelligence
/api/v1/strategies
/api/v1/backtests
/api/v1/portfolio
/api/v1/proposals
/api/v1/risk
/api/v1/orders
/api/v1/trades
/api/v1/agent
/api/v1/system
/api/v1/reconciliation
```

Hermes-facing tool endpoints should use service authentication separate from dashboard authentication.

## 84.1 Authentication Domain per Route Group

Each route group declares exactly one authentication domain. A route must never accept both an owner session and a service token.

| Route group | Auth domain | Notes |
|---|---|---|
| `/api/v1/markets`, `/analytics`, `/opportunities`, `/intelligence` | owner session or service token | read-only market and analytics data |
| `/api/v1/strategies`, `/backtests` | owner session; service token read-only | Hermes may read and request backtests, not approve strategies |
| `/api/v1/portfolio`, `/trades` | owner session; Hermes read-only | TradingAgents has no access |
| `/api/v1/proposals` | owner session; Hermes create/update | approval sub-routes are owner-only |
| `/api/v1/risk` | owner session for writes; read-only otherwise | no service token may write a limit |
| `/api/v1/orders` | owner session read-only | order submission is internal to the Execution Service, not a public route |
| `/api/v1/reconciliation` | owner session | trigger and inspect reconciliation |
| `/api/v1/agent` | owner session; Hermes for its own activity | |
| `/api/v1/system` | owner session | health, readiness, config visibility, kill switch |

Additional rules:

- approval endpoints (`POST /proposals/{id}/approve`, `reject`, `watch`) require an owner session and are unreachable with any service token;
- the kill switch endpoint requires an owner session;
- there is no public API route that submits an order to the exchange. Execution is triggered internally by the Execution Service after an approval, so no external caller can request an exchange order directly;
- all mutating endpoints accept an idempotency key where the operation is financially relevant (Section 29 — Financial Command Idempotency).

---

# 85. Testing Strategy

Financial modules are held to a higher standard than ordinary application code. A UI defect is an annoyance; a position-sizing or fill-application defect silently loses money and corrupts every downstream metric.

## 85.1 Critical Financial Modules

The following require the strongest coverage, property-based tests where applicable, and explicit review before live capital:

```text
risk
portfolio accounting
execution
P&L calculation
position sizing
order conversion and precision rounding
fill application and deduplication
idempotency
reconciliation
```

These modules must be testable without a live exchange, without an LLM, and without Hermes present. If a financial calculation cannot be tested in isolation, it is not structured correctly.

## Unit tests

Required for:

- indicators;
- position sizing;
- risk calculations;
- P&L calculations;
- strategy conditions;
- order conversion;
- confidence calculations;
- decimal precision and rounding against exchange symbol filters;
- idempotency key derivation;
- configuration cross-field validation.

Rules:

- monetary assertions use exact decimal comparison, never floating-point tolerance;
- risk rule tests assert the specific rule code returned, not merely that a rejection occurred.

## Integration tests

Required for:

- Binance adapter;
- CCXT adapter;
- ExchangeAdapter contract suite, run against both the paper and sandbox implementations;
- ExecutionAdapter contract suite, run against both paper and live adapter implementations in read-only or sandbox mode;
- PostgreSQL;
- Redis;
- Alembic migrations from empty to head, and re-run idempotency;
- model-versus-migration drift detection;
- Hermes tool APIs;
- X ingestion;
- authentication and authorization boundaries.

The authorization tests must assert the negative cases explicitly: a service token must be rejected on approval endpoints, on risk-write endpoints, and on the kill switch. Verifying that Hermes *cannot* approve its own trade is more important than verifying that the owner can.

## Simulation tests

Test complete lifecycle:

```text
Signal
→ Proposal
→ Risk
→ Approval
→ Paper Execution
→ Position
→ Exit
→ P&L
```

Also required:

- full audit reconstruction from a `correlation_id`, asserting every stage is recoverable (Section 69 — Financial Audit Log);
- multi-fill and partial-fill position accounting;
- reconciliation against a divergent simulated exchange state, asserting correct divergence classification and blocking behavior.

## Failure tests

Simulate:

- stale data;
- Binance timeout;
- duplicated request;
- Redis failure;
- database failure;
- Hermes failure;
- malformed model response;
- missing candle;
- extreme price movement;
- crash between submit and response persist, asserting recovery resolves the order by query and never resubmits;
- concurrent duplicate execution requests with the same idempotency key, asserting exactly one exchange order;
- double-clicked owner approval, asserting one approval;
- the same exchange fill delivered twice, asserting position state is unchanged by the duplicate;
- expired approval presented for execution, asserting refusal;
- clock skew beyond tolerance;
- exchange key unexpectedly reporting withdrawal permission, asserting live trading is refused.

## Safety tests

Environment and mode isolation must be proven by test, not assumed:

- `TRADING_MODE=paper` cannot reach the live adapter under any code path;
- `APP_ENV=development` with `TRADING_MODE=live` fails to start;
- `LIVE_TRADING_ENABLED=false` blocks submission even when every other precondition passes;
- each live execution precondition, negated individually, blocks submission;
- kill switch active blocks submission;
- `reconciliation_blocked` set blocks submission;
- kill switch and reconciliation-blocked state survive a restart;
- no pending approval executes automatically on startup.

Each of these is a test that must fail loudly if someone later "simplifies" a guard clause.

---

# 86. Development Quality Gates

Quality tooling is installed at the start of the project, not retrofitted. Retrofitting a type checker onto a financial codebase means auditing every money-handling function under time pressure.

## 86.1 Python Tooling

```text
ruff              lint + format (single tool, replaces flake8/black/isort)
mypy or pyright   static type checking
pytest            test runner
pytest-asyncio    async test support
pytest-cov        coverage measurement
```

Requirements:

- `ruff` runs as both linter and formatter, so formatting is never a review discussion;
- type checking runs in strict mode for the critical financial modules listed in Section 85 — Testing Strategy. Elsewhere, standard mode is acceptable initially, tightening over time;
- `Decimal` is required for monetary and quantity types. A type checker configuration or lint rule should make a `float` in a financial signature a visible defect;
- coverage is measured and reported. A coverage threshold is enforced on the critical financial modules specifically, rather than as a single project-wide number that averages away the parts that matter.

## 86.2 Frontend Tooling

```text
eslint            linting
prettier          formatting
tsc --noEmit      type checking
```

Requirements:

- TypeScript `strict` mode is enabled from the first commit;
- the frontend must not contain financial calculation logic. It displays values computed by the backend. Any arithmetic on money in the frontend is a defect, because it will eventually disagree with the ledger;
- accessibility linting is enabled for the dashboard.

## 86.3 Pre-Commit Hooks

```text
ruff lint + format
secret scanning
large file check
merge conflict marker check
.env commit prevention
```

Secret scanning at commit time is the cheapest possible place to catch a leaked exchange key.

## 86.4 Continuous Integration

CI must validate, on every change:

```text
lint                    (python + frontend)
typecheck               (python + frontend)
unit tests
integration tests       (against ephemeral PostgreSQL + Redis containers)
migration validation    (empty → head, re-run idempotency, model drift check)
safety tests            (environment and mode isolation)
frontend build
bootstrap verification  (clean checkout → running system)
```

Rules:

- CI runs with `APP_ENV=development` and `TRADING_MODE=paper`. Live credentials are never present in CI, and no CI job may hold them;
- a failing safety test blocks merge unconditionally. These tests encode the constraints that prevent unintended live trades;
- migrations must be validated in CI, since an un-migrated model change reaching deployment is a production incident;
- dependency installation uses the committed lockfile, so CI proves the lockfile is coherent.

---

# 87. AI Evaluation

Agent quality should be evaluated independently of trade profitability.

Metrics:

- percentage of proposals with complete evidence;
- hallucinated market facts;
- tool-use correctness;
- strategy-rule compliance;
- risk-rule compliance;
- contradicting-evidence identification;
- confidence calibration;
- unnecessary proposal frequency;
- missed opportunities;
- proposal-to-execution latency.

---

# 88. Performance Evaluation

The primary business/research question remains:

> Does this system produce an actual trading edge?

Therefore the dashboard must compare:

```text
Agent Strategy
vs
BTC Buy & Hold
vs
ETH Buy & Hold
vs
Simple Baseline Strategy
```

The system should outperform appropriate baselines on a risk-adjusted basis before claiming success.

---

# 89. MVP Release Gates

## Gate 0 — Foundation

Pass when:

- repository bootstraps from a clean checkout using the documented commands;
- typed configuration loads and rejects unsafe combinations at startup;
- migrations run empty to head, and re-running is a no-op;
- required PostgreSQL extensions present;
- lint, typecheck, and test commands run clean locally and in CI;
- committed defaults are `TRADING_MODE=paper` and `LIVE_TRADING_ENABLED=false`.

## Gate 1 — Infrastructure

Pass when:

- market data reliable;
- Binance test connectivity reliable;
- portfolio accounting correct;
- risk engine tested;
- database/event infrastructure stable;
- exchange reconciliation runs and correctly detects an injected divergence;
- idempotency proven: concurrent duplicate execution requests produce exactly one order;
- structured logs carry correlation identifiers end to end;
- a full trade lifecycle is reconstructible from the audit log;
- health, readiness, and trading-readiness endpoints behave correctly.

## Gate 2 — Quantitative Research

Pass when:

- strategies can be backtested;
- metrics reproducible;
- transaction costs modeled;
- obvious look-ahead errors prevented.

## Gate 3 — Agent Intelligence

Pass when:

- Hermes uses trading tools reliably;
- trading skills load correctly;
- proposals are structured;
- agent does not bypass controls;
- Hermes holds no exchange credentials, verified by inspection of its runtime environment;
- service token authorization boundaries verified, including that Hermes cannot approve a trade or modify a risk limit.

## Gate 4 — Paper Trading

Pass when:

- complete system runs continuously;
- signals generated;
- proposals recorded;
- simulated orders processed;
- performance measured;
- paper fills model fees, slippage, and exchange symbol filters;
- paper reconciliation runs clean over a sustained period;
- the system survives restarts, feed disconnects, and dependency failures without accounting corruption;
- secret rotation has been rehearsed;
- a database backup restore has been tested.

## Gate 5 — Tiny Live Trading

Pass only after satisfactory paper results.

Use small capital.

All live trades require owner approval.

Additional mandatory preconditions:

- live Binance key verified as trade-only, withdrawals disabled, IP-restricted;
- credentials present only in the Execution Service;
- owner authentication with TOTP enabled;
- all safety tests passing in CI;
- startup reconciliation clean, with no execution request in `UNKNOWN` state;
- kill switch verified working, and verified to survive a restart;
- alerting verified through a channel outside the dashboard;
- monitoring dashboards live before the first real order.

## Gate 6 — MVP Validation

MVP considered validated only when sufficient evidence suggests the trading system has positive expected value under real conditions.

---

# 90. Development Priorities

Engineering priority must follow:

```text
1. Correct market data
2. Correct portfolio accounting
3. Correct risk controls
4. Correct backtesting
5. Strategy quality
6. Opportunity detection
7. Main Agent
8. Intelligence sources
9. Dashboard polish
10. Future agents
```

Profitability cannot be rescued by UI polish.

## 90.1 Architecture Rule — The Financial Core Must Not Depend on Hermes

The financial core must remain fully usable without Hermes.

If Hermes is stopped, crashed, misconfigured, or removed entirely, the following must continue working correctly:

```text
Market ingestion
Market storage
Quantitative analytics
Portfolio accounting
Risk controls
Exchange reconciliation
Monitoring and alerting
```

Hermes adds intelligence. Hermes must not become infrastructure required to maintain correct financial state.

Consequences for implementation:

- no financial state transition may be triggered only by an agent call. Fills, positions, and P&L are derived by platform workers from exchange facts;
- reconciliation, risk monitoring, and portfolio accounting run as platform services, never as agent tasks;
- the platform must never wait on an LLM response to complete a financial operation;
- an existing position remains fully monitored and risk-managed with the agent absent.

The test of this rule is simple: stop the Hermes container and confirm nothing in the financial core degrades.

## 90.2 Safety Rule — Live Execution Is Enabled Last

Development order must progress through correctness before capital:

```text
Market correctness
        ↓
Data correctness
        ↓
Portfolio correctness
        ↓
Paper execution
        ↓
Risk correctness
        ↓
Backtesting correctness
        ↓
Agent intelligence
        ↓
Continuous paper trading
        ↓
Performance evaluation
        ↓
Tiny live trading
```

Do not enable real capital simply because individual components compile. Compilation is not evidence. Sustained, reconciled, honestly-costed paper performance is evidence.

Live execution is the final capability enabled in MVP 1, gated by Gate 5 in Section 89 (MVP Release Gates).

---

# 91. Open-Source Reuse Policy

Prefer proven open-source infrastructure over rebuilding commodity functionality.

Do not change our product architecture solely to match an upstream project.

Reused components must sit behind our own interfaces or adapters.

Review licenses before copying or modifying source code.

Record the upstream project, commit/version, and local modifications for copied code.

Avoid unnecessary forks.

Prefer upstream-compatible extensions where practical.

Do not inherit unused features or dependencies.

Security-review all reused trading and exchange code before enabling live capital.

Critical financial logic such as risk controls, portfolio accounting, and execution authorization must remain understandable and testable within our own system.

---

# 92. Technology Decision Summary

| Area | Technology |
|---|---|
| Agent Runtime | Hermes Agent |
| Agent Integration | Hermes tools / skills / controlled APIs |
| Specialist Research | TradingAgents (TauricResearch) — optional escalation |
| LLM Access | Existing LLM Gateway |
| Backend | Python + FastAPI |
| API Validation | Pydantic |
| HTTP Client | HTTPX |
| Database | PostgreSQL |
| Time-Series | TimescaleDB |
| Vector Search | pgvector (PostgreSQL extension) |
| ORM | SQLAlchemy |
| Migration | Alembic |
| PostgreSQL Driver | asyncpg |
| Event Stream | Redis Streams |
| Cache | Redis |
| Exchange Library | CCXT |
| Realtime Exchange | CCXT Pro / Binance WebSocket |
| Initial Exchange | Binance |
| Quant | NumPy / Polars / pandas |
| Indicators | TA-Lib |
| Backtesting | vectorbt |
| Secondary Validation | Freqtrade |
| Trading Infrastructure Reference / Donor | HKUDS/AI-Trader |
| Statistics | SciPy / statsmodels |
| Social | X API |
| Frontend | Next.js + TypeScript |
| UI | Tailwind + shadcn/ui |
| Server State | TanStack Query |
| Financial Charts | TradingView Lightweight Charts |
| Containers | Docker / Docker Compose |
| Reverse Proxy | Caddy or Nginx |
| Metrics | Prometheus |
| Monitoring | Grafana |
| Source Control | Git |
| Python Runtime | Python 3.12+ |
| Python Package Manager | uv (lockfile committed) |
| Node Runtime | Node.js LTS |
| Frontend Package Manager | pnpm |
| Configuration | pydantic-settings (typed, validated at startup) |
| Python Lint / Format | ruff |
| Python Type Checking | mypy or pyright (strict on financial modules) |
| Python Testing | pytest / pytest-asyncio / pytest-cov |
| Frontend Lint / Format | eslint / prettier |
| Frontend Type Checking | tsc (strict) |
| Pre-Commit | pre-commit (lint, format, secret scan) |
| CI | lint / typecheck / tests / migration validation / safety tests / build |
| Owner Authentication | Session cookie + password hash + TOTP |
| Password Hashing | Argon2id or bcrypt |
| Service Authentication | Per-service bearer tokens (scoped) |
| Secret Delivery | Environment / mounted secret files, scoped per service |
| Monetary Arithmetic | Decimal (fixed precision) — never float |
| Task Runner | Makefile or equivalent |

---

# 93. Product Principles

## Principle 1 — Make One Agent Work First

Do not build many agents until one agent demonstrates value.

## Principle 2 — AI Orchestrates; Code Calculates

LLMs reason.

Deterministic software calculates money, risk, statistics, and orders.

## Principle 3 — Never Trust Unvalidated Confidence

Probabilities require evidence.

## Principle 4 — No Trade Is a Valid Trade Decision

The agent should optimize decision quality, not trade frequency.

## Principle 5 — Risk Engine Has Final Authority

The AI cannot bypass it.

## Principle 6 — Strategies Must Be Testable

A trading idea must eventually become a measurable hypothesis.

## Principle 7 — Separate Research From Production

Experimental strategies do not automatically control live capital.

## Principle 8 — Preserve Every Decision

The platform must allow reconstruction of why every trade happened.

## Principle 9 — Build Shared Capabilities, Not Agent-Specific Hacks

Market data, analytics, research, strategies, risk, and execution belong to the platform.

## Principle 10 — Profit Is Evidence, Not a Feature

The purpose of the system is financial performance, but profitability must be demonstrated through disciplined testing rather than assumed from AI intelligence.

---

# 94. Implementation Readiness / Foundation Requirements

Everything in this section must exist before feature implementation begins. It is the checklist a coding agent or developer works through before writing the first application module.

No actual secret values appear in this document. Only the names, types, and required properties of credentials are recorded here.

## 94.1 Accounts

| Account | Purpose | Required before |
|---|---|---|
| Binance (verified) | spot market data and execution | Foundation 2 for data; Foundation 12 for live |
| Binance Spot Testnet | sandbox order testing | Foundation 3 |
| X Developer / API | social intelligence ingestion | Foundation 9 |
| LLM Gateway (existing) | model access for Hermes and TradingAgents | Foundation 7 |
| VPS provider | deployment target | Foundation 0 |
| Domain registrar | dashboard hostname and TLS | Foundation 11 |
| Source-control repository | code hosting and CI | Foundation 0 |
| News data source | news intelligence ingestion | Foundation 9 |
| Alert channel | out-of-band owner alerting | Foundation 3 |

A news source and an alert channel are called out because both are easy to defer and both are prerequisites for their foundations. Alerting in particular must exist before paper trading runs unattended.

## 94.2 Credentials

Required credential types. Values live only in `.env` files or mounted secret files, never in this document, never in the repository.

| Credential | Type | Scope | Notes |
|---|---|---|---|
| `DATABASE_URL` | connection string | api, workers, execution, reconciliation | per environment |
| `REDIS_URL` | connection string | api, workers, execution | per environment |
| `BINANCE_API_KEY` | API key | execution-service only | live: trade-only, no withdrawal, IP-restricted |
| `BINANCE_SECRET_KEY` | API secret | execution-service only | live key separate from testnet key |
| `X_API_TOKEN` | bearer token | intelligence-worker only | |
| `LLM_GATEWAY_URL` | URL | hermes-trader, tradingagents | |
| `LLM_GATEWAY_KEY` | API key | hermes-trader, tradingagents | never reaches the trading platform core |
| `HERMES_SERVICE_TOKEN` | bearer token | hermes-trader, api | scoped; cannot approve or write risk |
| `TRADINGAGENTS_SERVICE_TOKEN` | bearer token | tradingagents, api | read-only market/analytics |
| `DASHBOARD_AUTH_SECRET` | signing secret | api only | rotating invalidates all sessions |
| Owner password hash | Argon2id/bcrypt hash | api only | never stored reversibly |
| Owner TOTP secret | TOTP seed | api only | required before live trading |

Separate credential sets exist per environment. Live Binance credentials must not exist anywhere except the live Execution Service.

## 94.3 Local Tooling

```text
Git
Docker
Docker Compose
Python 3.12+
uv
Node.js LTS
pnpm
```

Optional but recommended: `make`, and a TOTP authenticator app for owner authentication.

## 94.4 Infrastructure

```text
PostgreSQL 16+
TimescaleDB extension
pgvector extension
Redis 7+
Reverse proxy (Caddy or Nginx) with TLS
Prometheus
Grafana
NTP time synchronization
Scheduled database backups with a tested restore
```

The database container image must include both extensions. Backups and a verified restore are required before Gate 5, not after.

## 94.5 External Systems

| System | Role | Boundary |
|---|---|---|
| Hermes | Main Trading Agent runtime | separate container; service token; no exchange credentials |
| TradingAgents | optional specialist research | separate container; read-only scope |
| LLM Gateway | model routing | external; reached over HTTP |
| Binance | market data and execution | reached only through `ExchangeAdapter` |
| X API | social data | reached only by intelligence-worker |

## 94.6 Development Tooling

```text
ruff
mypy or pyright
pytest / pytest-asyncio / pytest-cov
eslint / prettier / tsc
pre-commit with secret scanning
CI pipeline (lint, typecheck, tests, migrations, safety tests, build, bootstrap)
```

## 94.7 Safety Defaults

The committed configuration must express these values, so that a fresh clone or a forgotten override cannot trade real money:

```text
APP_ENV=development
TRADING_MODE=paper
LIVE_TRADING_ENABLED=false
withdrawals disabled
leverage disabled
spot only
BTC/USDT + ETH/USDT allowlist
owner approval required
reconciliation required on startup
kill switch state persisted
```

## 94.8 Readiness Checklist

Foundation work may begin when all of the following are true:

```text
[ ] Repository created, CI configured
[ ] Local tooling installed and verified
[ ] .env.example committed; .env git-ignored; secret scanning active
[ ] Docker Compose brings up PostgreSQL (with both extensions) and Redis
[ ] Typed configuration loads and rejects unsafe combinations
[ ] Alembic initialized; migrations run empty → head
[ ] Binance testnet credentials obtained and verified
[ ] LLM Gateway reachable
[ ] Alert channel configured and tested
[ ] Safety defaults confirmed in committed configuration
[ ] No live exchange credentials present anywhere in development
```

---

# 95. Implementation Dependency Order

This is a dependency map, not an implementation plan. It records what must exist before what, so that implementation foundations can be sequenced correctly. Detailed tasks are produced in the next phase.

```text
Foundation 0
Repository / Tooling / Configuration / Docker / CI

Foundation 1
PostgreSQL / TimescaleDB / pgvector / Redis / Domain Models

Foundation 2
Market Data Pipeline

Foundation 3
Portfolio Accounting / Paper Execution / Reconciliation

Foundation 4
Risk Engine

Foundation 5
Quantitative Analytics / Opportunity Detection

Foundation 6
Strategy Registry / Backtesting

Foundation 7
Hermes Tool APIs / Trading Knowledge / Memory / Skills

Foundation 8
Hermes Main Trading Agent

Foundation 9
Social + News Intelligence

Foundation 10
TradingAgents Deep Research Escalation

Foundation 11
Dashboard

Foundation 12
Tiny Live Binance Execution
```

## 95.1 Dependency Rationale

Notes on why the order is what it is:

- **Foundation 0 precedes everything.** Configuration and environment separation must exist before any code can read a credential or select a trading mode;
- **Foundation 3 includes reconciliation.** Portfolio accounting and reconciliation are built together, because accounting that has never been reconciled against an external ledger has never been verified. Idempotency and the execution state machine belong here too, since they are properties of the execution path rather than later additions;
- **Foundation 4 follows Foundation 3.** The Risk Engine needs real portfolio state to evaluate exposure limits against;
- **Foundation 7 precedes Foundation 8.** The tool APIs and their authorization boundaries must exist and be tested before an agent is pointed at them, so the agent is never the thing that discovers a missing authorization check;
- **Foundation 11 (Dashboard) precedes Foundation 12 (Live).** The owner cannot approve trades, observe readiness, or hit the kill switch without a working interface. Enabling live execution before the dashboard exists would mean operating real capital blind;
- **Foundation 12 is last.** Live execution adds no new pipeline, only a different `ExecutionAdapter` and the full precondition set. If earlier foundations are correct, this is a small, well-bounded change.

## 95.2 Ordering Constraints

```text
Foundation 0  →  prerequisite for all
Foundation 1  →  prerequisite for 2, 3, 4, 5, 6, 7
Foundation 2  →  prerequisite for 3, 5
Foundation 3  →  prerequisite for 4, 12
Foundation 4  →  prerequisite for 8, 12
Foundation 5  →  prerequisite for 6, 8
Foundation 6  →  prerequisite for 8
Foundation 7  →  prerequisite for 8, 10
Foundation 8  →  prerequisite for 12
Foundation 9  →  independent after 1, 2; enriches 8
Foundation 10 →  optional; requires 7
Foundation 11 →  requires 1, 2, 3; prerequisite for 12
Foundation 12 →  requires 3, 4, 8, 11 and all release gates
```

Foundations 9 and 10 are the only genuinely optional or deferrable branches. Everything else on the path to live execution is load-bearing.

---

# 96. Final MVP Definition

MVP 1 is:

> A private AI-powered cryptocurrency trading intelligence platform with one persistent Hermes-based Main Trading Agent that runs continuously, monitors BTC and ETH spot markets, detects opportunities using deterministic quantitative analytics, investigates those opportunities using technical analysis, social/news intelligence and reusable trading skills, validates strategies through historical and paper testing, produces evidence-backed trade proposals, operates behind deterministic risk controls, requires owner approval for live execution, executes through Binance, tracks every result, and uses accumulated trading evidence to improve future decision quality.

MVP 1 is **not** a multi-agent platform.

MVP 1 exists to answer one question:

> **Can we make one agent consistently useful—and ultimately profitable—before we build the factory that creates many of them?**
