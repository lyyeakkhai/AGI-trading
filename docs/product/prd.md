# AI Trading Intelligence Platform
## Product Requirements Document — MVP 1

**Status:** Approved Product Direction / Pre-Implementation  
**Version:** 1.0  
**Date:** August 11, 2026  
**Product Type:** Private, single-user AI trading platform  
**Initial Market:** Cryptocurrency  
**Initial Exchange:** Binance  
**Initial Assets:** BTC and ETH  
**Initial Trading Mode:** Spot  
**Primary Agent Runtime:** Hermes Agent  
**Primary Objective:** Prove that one AI-assisted trading agent can consistently produce positive risk-adjusted trading performance after realistic fees and slippage.

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

Authentication exists purely to protect the private dashboard.

---

# 8. MVP Scope

## 8.1 Objective 1 — Main Trading Agent

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

# 9. Hermes Agent Integration

Hermes Agent will provide the primary agent runtime.

Hermes already supports persistent memory, reusable skills, profiles/isolated instances, model-provider flexibility, custom tools, MCP integrations, scheduling, and agent-managed skills. citeturn445293search0turn445293search1turn445293search3

## 9.1 Architecture Decision

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

# 10. Hermes Deployment Model

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

Hermes supports separate profiles with isolated configuration, sessions, skills, and memory, making this separation consistent with the runtime's existing model. citeturn445293search1

---

# 11. Agent Security Boundary

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

# 12. Agent Tools

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
```

Live execution should remain behind the approval/risk boundary rather than being exposed as an unrestricted agent capability.

---

# 13. Trading Skill System

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

# 14. Trading Book Conversion

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

The process should be:

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

# 15. Strategy Registry

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

# 16. Quantitative Analytics Engine

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

# 17. Technical Indicator Library

TA-Lib should be considered the primary standard indicator library where suitable rather than implementing common indicators manually.

Custom proprietary indicators may be implemented separately when required.

---

# 18. Opportunity Detection Engine

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

# 19. Signal Confidence

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

# 20. Trade Proposal

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

# 21. Owner Approval

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

---

# 22. Risk Engine

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

---

# 23. Execution Engine

The Execution Engine translates approved platform orders into exchange orders.

Initial exchange:

**Binance Spot**

Binance exposes official Spot REST APIs for exchange interaction. citeturn324371search9

Recommended architecture:

```text
Owner Approval
      ↓
Risk Engine
      ↓
Execution Service
      ↓
CCXT
      ↓
Binance
```

---

# 24. CCXT Integration

CCXT will act as the primary exchange abstraction library.

CCXT provides a unified API across a large number of cryptocurrency exchanges and supports common public/private exchange operations. Its WebSocket extension, CCXT Pro, provides streaming interfaces. citeturn324371search2turn324371search8turn324371search11

Benefits for this architecture:

- reduced exchange-specific code;
- standardized order interface;
- standardized symbol representation;
- future ability to add additional exchanges;
- easier test/mock layers.

For latency-sensitive Binance-specific features, the platform may call Binance native APIs directly.

---

# 25. Market Data Service

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

# 26. Real-Time Market Architecture

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

# 27. Historical Market Data Storage

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
orders
positions
executions
agent_decisions
skills
risk_rules
system_config
```

---

# 28. Backtesting Engine

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

# 29. Freqtrade Role

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

---

# 30. Paper Trading

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
               Execution Interface
                    /       \
                   /         \
           Paper Broker    Binance
```

---

# 31. Social Intelligence

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

# 32. Social Metrics

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

# 33. News Intelligence

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

# 34. Event Correlation

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

# 35. Main Agent Learning Loop

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

# 36. Agent Memory

Agent learning must use several distinct forms of memory.

## 36.1 Current working context

Includes:

- open opportunities;
- open positions;
- active strategy;
- recent market changes;
- current research.

## 36.2 Episodic trading history

Examples:

```text
BTC breakout setup failed after volume collapsed.

ETH trend entry succeeded during high-volume trending regime.
```

## 36.3 Quantitative strategy memory

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

Hermes should query this data using a tool rather than attempting to memorize large statistical datasets.

---

# 37. Self-Improvement Rules

The Main Agent may:

- record observations;
- form hypotheses;
- propose strategy changes;
- create research notes;
- create candidate skills;
- refine trading procedures;
- request backtests;
- compare strategy versions.

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

# 38. Analytics Dashboard

The dashboard is the owner's trading command center.

Technology:

**Next.js + TypeScript**

Recommended charting:

**TradingView Lightweight Charts** or equivalent lightweight financial-chart component.

---

# 39. Dashboard — Overview

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

# 40. Dashboard — Market View

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

# 41. Dashboard — Agent View

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

# 42. Dashboard — Trade Proposal View

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

# 43. Dashboard — Strategy Analytics

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

# 44. Dashboard — Trade Journal

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

# 45. Core System Architecture

```text
                           ┌──────────────────┐
                           │     Next.js      │
                           │    Dashboard     │
                           └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │   FastAPI API    │
                           │     Gateway      │
                           └────────┬─────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       │                            │                            │
       ▼                            ▼                            ▼
 Market Data                 Trading Core                 Intelligence
   Service                     Service                      Service
       │                            │                            │
       │                     ┌──────┼──────┐                X / News
       │                     │      │      │
       │                   Risk  Strategy Portfolio
       │                     │      │      │
       ▼                     └──────┼──────┘
 Redis Streams                      │
       │                            │
       ├─────────────┐              │
       ▼             ▼              ▼
 Analytics       TimescaleDB    Execution Engine
 Worker                             │
                                   ▼
                                  CCXT
                                   │
                                   ▼
                                Binance

                         ┌──────────────────────┐
                         │    Hermes Trader     │
                         │                      │
                         │ Memory               │
                         │ Skills               │
                         │ Reasoning            │
                         │ 24/7 operation       │
                         └──────────┬───────────┘
                                    │
                             Controlled Tools
                                    │
                                    ▼
                               FastAPI APIs
```

Selected infrastructure components or implementation patterns may be adapted from HKUDS/AI-Trader when they fit the service boundaries defined in this architecture. Reused code must remain behind our own interfaces so the platform architecture does not become coupled to AI-Trader.

---

# 46. Backend Technology Stack

## Language

**Python**

Recommended runtime:

**Python 3.12+**

Reason:

Trading, data science, AI, quantitative research, and most required libraries have strong Python ecosystems.

## Open-Source Reuse Strategy

Explain the responsibility of each external project:

- **Hermes Agent** — primary autonomous agent runtime, memory, skills, tool use, and long-running agent behavior.
- **HKUDS/AI-Trader** — trading infrastructure reference/donor codebase.
- **Freqtrade** — secondary trading/backtesting reference and strategy validation tool.
- **vectorbt** — primary quantitative research and fast backtesting engine.
- **CCXT** — exchange abstraction and Binance integration layer.
- **TA-Lib** — standard technical indicator calculations.

Important architectural rule:

We reuse commodity infrastructure where useful, but our proprietary system remains responsible for opportunity detection, trading intelligence, strategy evaluation, trading skills, risk controls, performance analytics, agent learning, portfolio state, and owner-controlled execution.

---

# 47. API Framework

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

# 48. Database Layer

Recommended:

```text
PostgreSQL
TimescaleDB
SQLAlchemy
Alembic
asyncpg
```

Responsibilities:

### PostgreSQL

Business and trading state.

### TimescaleDB

High-volume time-series data.

### SQLAlchemy

Application persistence layer.

### Alembic

Schema migrations.

### asyncpg

Asynchronous PostgreSQL access.

---

# 49. Event / Cache Layer

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

# 50. Quantitative Stack

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

# 51. Exchange Stack

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

Implement:

```text
get_balance()
get_market()
place_order()
cancel_order()
get_order()
get_positions()
get_fills()
```

The rest of the application should not depend directly on Binance-specific code.

---

# 52. Backtest Architecture

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

# 53. Social Stack

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

# 54. AI Model Layer

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

# 55. Model Usage Policy

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

# 56. Frontend Stack

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

# 57. Realtime Dashboard

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

# 58. Infrastructure

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
postgres-timescale
redis
hermes-trader
prometheus
grafana
```

Avoid Kubernetes for MVP.

---

# 59. Observability

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
- AI cost.

---

# 60. Financial Audit Log

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
- risk alert.

Never overwrite historical decisions.

Corrections should generate new records.

---

# 61. Secrets

Secrets should be managed independently from Hermes.

Examples:

```text
BINANCE_API_KEY
BINANCE_SECRET_KEY
DATABASE_URL
REDIS_URL
X_API_TOKEN
LLM_GATEWAY_KEY
```

Hermes receives access to controlled trading tools rather than direct secrets.

---

# 62. Binance API Security

For MVP:

- enable trading permissions only;
- disable withdrawal permission;
- restrict API access by IP where supported;
- separate development/paper credentials from live credentials;
- never expose exchange secrets to frontend;
- never store exchange secrets in trading skills;
- never store secrets in agent memory.

---

# 63. Failure Handling

## Market feed disconnect

System must:

1. mark market data stale;
2. disable new actionable proposals;
3. reconnect;
4. resynchronize state.

## Binance unavailable

System must:

- reject new execution requests;
- preserve proposal;
- alert owner.

## LLM unavailable

System must:

- continue collecting market data;
- continue deterministic analytics;
- pause deep agent reasoning;
- recover when model service returns.

## Hermes unavailable

System must:

- continue market ingestion;
- continue analytics;
- continue portfolio tracking;
- prevent agent proposals;
- alert owner.

## Redis unavailable

Critical services must fail safely rather than trade from stale events.

## Database unavailable

No new live trade should execute unless required state can be safely verified.

---

# 64. Kill Switch

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

---

# 65. MVP Functional Flow

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

15. Approved order reaches Execution Engine.

16. Execution Engine submits Binance order.

17. Position is monitored.

18. Trade closes.

19. Performance is calculated.

20. Agent receives outcome.

21. Observation and quantitative results are stored.

22. Future decisions can use this history.
```

---

# 66. MVP Features

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

# 67. Explicitly Out of Scope — MVP 1

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

# 68. Future Architecture Compatibility

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

# 69. Future Agent Arena

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

# 70. Recommended Repository Structure

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
├── research/
│   └── open-source/
│       └── ai-trader-notes/
│
├── tests/
│
└── docs/
```

External reference projects should normally remain outside the production source tree. We do not vendor the full HKUDS/AI-Trader repository into the product by default.

The `research/open-source/ai-trader-notes/` directory is reserved for:

- architecture notes;
- reusable-component analysis;
- integration decisions;
- migration notes.

Do not copy the full upstream repository into this directory unless a specific component is intentionally adopted.

---

# 71. Core Domain Objects

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
Order
Execution
Position
Portfolio
Trade
AgentDecision
AgentObservation
SocialEvent
NewsEvent
```

---

# 72. Core API Domains

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
```

Hermes-facing tool endpoints should use service authentication separate from dashboard authentication.

---

# 73. Testing Strategy

## Unit tests

Required for:

- indicators;
- position sizing;
- risk calculations;
- P&L calculations;
- strategy conditions;
- order conversion;
- confidence calculations.

## Integration tests

Required for:

- Binance adapter;
- CCXT adapter;
- PostgreSQL;
- Redis;
- Hermes tool APIs;
- X ingestion.

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
- extreme price movement.

---

# 74. AI Evaluation

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

# 75. Performance Evaluation

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

# 76. MVP Release Gates

## Gate 1 — Infrastructure

Pass when:

- market data reliable;
- Binance test connectivity reliable;
- portfolio accounting correct;
- risk engine tested;
- database/event infrastructure stable.

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
- agent does not bypass controls.

## Gate 4 — Paper Trading

Pass when:

- complete system runs continuously;
- signals generated;
- proposals recorded;
- simulated orders processed;
- performance measured.

## Gate 5 — Tiny Live Trading

Pass only after satisfactory paper results.

Use small capital.

All live trades require owner approval.

## Gate 6 — MVP Validation

MVP considered validated only when sufficient evidence suggests the trading system has positive expected value under real conditions.

---

# 77. Development Priorities

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

---

# 78. Open-Source Reuse Policy

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

# 79. Technology Decision Summary

| Area | Technology |
|---|---|
| Agent Runtime | Hermes Agent |
| Agent Integration | Hermes tools / skills / controlled APIs |
| LLM Access | Existing LLM Gateway |
| Backend | Python + FastAPI |
| API Validation | Pydantic |
| HTTP Client | HTTPX |
| Database | PostgreSQL |
| Time-Series | TimescaleDB |
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

---

# 80. Product Principles

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

# 81. Final MVP Definition

MVP 1 is:

> A private AI-powered cryptocurrency trading intelligence platform with one persistent Hermes-based Main Trading Agent that runs continuously, monitors BTC and ETH spot markets, detects opportunities using deterministic quantitative analytics, investigates those opportunities using technical analysis, social/news intelligence and reusable trading skills, validates strategies through historical and paper testing, produces evidence-backed trade proposals, operates behind deterministic risk controls, requires owner approval for live execution, executes through Binance, tracks every result, and uses accumulated trading evidence to improve future decision quality.

MVP 1 is **not** a multi-agent platform.

MVP 1 exists to answer one question:

> **Can we make one agent consistently useful—and ultimately profitable—before we build the factory that creates many of them?**
