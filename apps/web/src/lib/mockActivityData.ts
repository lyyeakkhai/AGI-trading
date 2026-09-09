export type ActivityEventType =
  | "MARKET"
  | "HERMES"
  | "OPPORTUNITY"
  | "STRATEGY"
  | "BACKTEST"
  | "TRADE_PROPOSAL"
  | "RISK"
  | "APPROVAL"
  | "EXECUTION"
  | "POSITION"
  | "PORTFOLIO"
  | "SYSTEM"
  | "SECURITY"
  | "ERROR";

export type ActivityEventSource =
  | "Hermes"
  | "Market Data"
  | "Risk Engine"
  | "Strategy Engine"
  | "Backtest Engine"
  | "Execution Service"
  | "Portfolio"
  | "Owner"
  | "System";

export type ActivityEventStatus =
  | "SUCCESS"
  | "WARNING"
  | "FAILED"
  | "REJECTED"
  | "INFO"
  | "CANCELLED";

export interface ActivityEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  dateGroup: "Today" | "Yesterday" | "Earlier";
  type: ActivityEventType;
  source: ActivityEventSource;
  objectType: string;
  objectId: string;
  summary: string;
  status: ActivityEventStatus;
  environment: "PAPER" | "LIVE" | "DEV";
  correlationId?: string;
  details: {
    beforeState?: string;
    afterState?: string;
    metrics?: Record<string, string | number>;
    reason?: string;
    description: string;
  };
  relatedLinks?: {
    type: "opportunity" | "proposal" | "position" | "strategy" | "backtest";
    id: string;
    url: string;
  }[];
}

export interface TradingFlowStep {
  stage: string;
  timestamp: string;
  status: ActivityEventStatus;
  objectId: string;
  summary: string;
}

export interface TradingFlowTrace {
  flowId: string;
  symbol: string;
  side: "LONG" | "SHORT";
  strategy: string;
  currentStage: string;
  overallStatus: "COMPLETED" | "ACTIVE" | "REJECTED";
  steps: TradingFlowStep[];
}

export const mockActivitySummary = {
  eventsToday: 42,
  tradingEvents: 18,
  riskDecisions: 11,
  hermesEvents: 27,
  warnings: 2,
  errors: 0,
};

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: "EVT-009182",
    timestamp: "2026-09-04T09:42:18Z",
    timeFormatted: "09:42:18",
    dateGroup: "Today",
    type: "RISK",
    source: "Risk Engine",
    objectType: "Trade Proposal",
    objectId: "PROP-042",
    summary: "Risk validation passed (0.8% requested vs 3.2% headroom).",
    status: "SUCCESS",
    environment: "PAPER",
    correlationId: "FLOW-0042",
    details: {
      beforeState: "Portfolio Risk: 1.8%",
      afterState: "Portfolio Risk: 2.6%",
      metrics: {
        "Requested Risk": "0.8%",
        "Max Allowed": "5.0%",
        "Decision": "APPROVED",
        "Hurdle R:R": "2.4R",
      },
      description: "Deterministic risk check verified that adding candidate trade to active positions does not breach the 5.0% aggregate limit.",
    },
    relatedLinks: [
      { type: "proposal", id: "PROP-042", url: "/trade-proposals" },
      { type: "strategy", id: "STRAT-001", url: "/strategies" },
    ],
  },
  {
    id: "EVT-009181",
    timestamp: "2026-09-04T09:41:52Z",
    timeFormatted: "09:41:52",
    dateGroup: "Today",
    type: "HERMES",
    source: "Hermes",
    objectType: "Opportunity",
    objectId: "OPP-118",
    summary: "Opportunity investigation completed. Proposal candidate identified.",
    status: "SUCCESS",
    environment: "PAPER",
    correlationId: "FLOW-0042",
    details: {
      metrics: {
        "Confidence": "84%",
        "Timeframe": "1H",
        "Regime": "Trending Bullish",
      },
      description: "Hermes completed multi-indicator evidence synthesis confirming structural breakout above $112,400 consolidation.",
    },
    relatedLinks: [
      { type: "opportunity", id: "OPP-118", url: "/opportunities" },
    ],
  },
  {
    id: "EVT-009180",
    timestamp: "2026-09-04T09:40:21Z",
    timeFormatted: "09:40:21",
    dateGroup: "Today",
    type: "TRADE_PROPOSAL",
    source: "Hermes",
    objectType: "Trade Proposal",
    objectId: "PROP-042",
    summary: "Proposal created: BTC/USDT LONG (Risk 0.8%, R:R 2.4R).",
    status: "INFO",
    environment: "PAPER",
    correlationId: "FLOW-0042",
    details: {
      metrics: {
        "Entry": "$114,120",
        "Stop": "$112,800",
        "Target": "$117,200",
      },
      description: "Structured trade proposal formulated based on Breakout Continuation v1.3 strategy template.",
    },
    relatedLinks: [
      { type: "proposal", id: "PROP-042", url: "/trade-proposals" },
    ],
  },
  {
    id: "EVT-009179",
    timestamp: "2026-09-04T09:39:03Z",
    timeFormatted: "09:39:03",
    dateGroup: "Today",
    type: "MARKET",
    source: "Market Data",
    objectType: "Market State",
    objectId: "BTC/USDT",
    summary: "Market regime transition: Ranging Consolidation → Trending Bullish.",
    status: "INFO",
    environment: "PAPER",
    details: {
      beforeState: "RANGING (ADX 18.4)",
      afterState: "TRENDING (ADX 28.2)",
      description: "Volume expansion confirmed trend breakout across 1H and 4H candles.",
    },
  },
  {
    id: "EVT-009178",
    timestamp: "2026-09-04T09:37:44Z",
    timeFormatted: "09:37:44",
    dateGroup: "Today",
    type: "STRATEGY",
    source: "Strategy Engine",
    objectType: "Strategy",
    objectId: "STRAT-001",
    summary: "Strategy Breakout Continuation v1.3 selected for active evaluation.",
    status: "INFO",
    environment: "PAPER",
    details: {
      description: "Strategy model matched incoming market regime conditions.",
    },
    relatedLinks: [
      { type: "strategy", id: "STRAT-001", url: "/strategies" },
    ],
  },
  {
    id: "EVT-009177",
    timestamp: "2026-09-04T09:35:10Z",
    timeFormatted: "09:35:10",
    dateGroup: "Today",
    type: "APPROVAL",
    source: "Owner",
    objectType: "Trade Proposal",
    objectId: "PROP-042",
    summary: "Owner approved trade proposal PROP-042 for paper execution.",
    status: "SUCCESS",
    environment: "PAPER",
    correlationId: "FLOW-0042",
    details: {
      description: "Owner confirmed risk parameters and authorized order submission to paper matching engine.",
    },
    relatedLinks: [
      { type: "proposal", id: "PROP-042", url: "/trade-proposals" },
    ],
  },
  {
    id: "EVT-009176",
    timestamp: "2026-09-04T09:35:12Z",
    timeFormatted: "09:35:12",
    dateGroup: "Today",
    type: "EXECUTION",
    source: "Execution Service",
    objectType: "Order",
    objectId: "ORD-0842",
    summary: "Paper limit order submitted and filled: 0.042 BTC @ $114,120.",
    status: "SUCCESS",
    environment: "PAPER",
    correlationId: "FLOW-0042",
    details: {
      metrics: {
        "Notional": "$4,793.04",
        "Fee Paid": "$4.79 (0.10%)",
        "Slippage": "$1.20 (0.025%)",
      },
      description: "Order filled instantly within mock paper orderbook matching simulator.",
    },
  },
  {
    id: "EVT-009175",
    timestamp: "2026-09-04T09:35:15Z",
    timeFormatted: "09:35:15",
    dateGroup: "Today",
    type: "POSITION",
    source: "Portfolio",
    objectType: "Position",
    objectId: "POS-003",
    summary: "Position opened: BTC/USDT LONG (Stop $112,800, Target $117,200).",
    status: "SUCCESS",
    environment: "PAPER",
    correlationId: "FLOW-0042",
    details: {
      metrics: {
        "Risk Amount": "$27.50",
        "Portfolio Risk": "0.22%",
      },
      description: "Active position registered in portfolio tracker. Stop-loss orders initialized.",
    },
    relatedLinks: [
      { type: "position", id: "POS-003", url: "/positions" },
    ],
  },
  {
    id: "EVT-009174",
    timestamp: "2026-09-04T08:15:00Z",
    timeFormatted: "08:15:00",
    dateGroup: "Today",
    type: "SYSTEM",
    source: "System",
    objectType: "Session",
    objectId: "SES-2026-09-04",
    summary: "System session initialized in PAPER mode. Health check nominal.",
    status: "SUCCESS",
    environment: "PAPER",
    details: {
      description: "Internal tick feeds, risk caches, and strategy state engines synchronized.",
    },
  },
  {
    id: "EVT-009173",
    timestamp: "2026-09-04T07:45:20Z",
    timeFormatted: "07:45:20",
    dateGroup: "Today",
    type: "OPPORTUNITY",
    source: "Hermes",
    objectType: "Opportunity",
    objectId: "OPP-118",
    summary: "Opportunity detected on BTC/USDT: 1H Volume Consolidation breakout.",
    status: "INFO",
    environment: "PAPER",
    correlationId: "FLOW-0042",
    details: {
      description: "Autonomous scanner identified high volume accumulation near key resistance.",
    },
    relatedLinks: [
      { type: "opportunity", id: "OPP-118", url: "/opportunities" },
    ],
  },
  // YESTERDAY Events
  {
    id: "EVT-009172",
    timestamp: "2026-09-03T18:21:40Z",
    timeFormatted: "18:21:40",
    dateGroup: "Yesterday",
    type: "BACKTEST",
    source: "Backtest Engine",
    objectType: "Backtest",
    objectId: "BT-0042",
    summary: "Historical Backtest BT-0042 completed: Net return +24.8%, PF 1.84.",
    status: "SUCCESS",
    environment: "PAPER",
    details: {
      metrics: {
        "Trades": 184,
        "Win Rate": "64.1%",
        "Max DD": "-8.4%",
        "Gate": "READY FOR PAPER TRADING",
      },
      description: "Multi-year simulation across 2025-2026 verified out-of-sample edge stability.",
    },
    relatedLinks: [
      { type: "backtest", id: "BT-0042", url: "/backtests" },
      { type: "strategy", id: "STRAT-001", url: "/strategies" },
    ],
  },
  {
    id: "EVT-009171",
    timestamp: "2026-09-03T17:53:12Z",
    timeFormatted: "17:53:12",
    dateGroup: "Yesterday",
    type: "STRATEGY",
    source: "Owner",
    objectType: "Strategy Version",
    objectId: "STRAT-001",
    summary: "Strategy version v1.3 tagged and frozen in registry audit log.",
    status: "SUCCESS",
    environment: "PAPER",
    details: {
      description: "Added ADX filter > 25 to suppress chop false-breakouts.",
    },
    relatedLinks: [
      { type: "strategy", id: "STRAT-001", url: "/strategies" },
    ],
  },
  {
    id: "EVT-009170",
    timestamp: "2026-09-03T14:15:00Z",
    timeFormatted: "14:15:00",
    dateGroup: "Yesterday",
    type: "RISK",
    source: "Risk Engine",
    objectType: "Trade Proposal",
    objectId: "PROP-041",
    summary: "Risk validation REJECTED: Requested risk (1.4%) exceeds 1.0% trade ceiling.",
    status: "REJECTED",
    environment: "PAPER",
    correlationId: "FLOW-0041",
    details: {
      reason: "Per-trade risk threshold violation.",
      description: "Hermes proposed oversized position. Risk engine deterministic gate blocked submission.",
    },
    relatedLinks: [
      { type: "proposal", id: "PROP-041", url: "/trade-proposals" },
    ],
  },
  {
    id: "EVT-009169",
    timestamp: "2026-09-03T10:20:30Z",
    timeFormatted: "10:20:30",
    dateGroup: "Yesterday",
    type: "RISK",
    source: "Risk Engine",
    objectType: "Trade Proposal",
    objectId: "PROP-040",
    summary: "Risk validation REJECTED: Risk/reward (1.2R) is below minimum 1.5R institutional floor.",
    status: "REJECTED",
    environment: "PAPER",
    details: {
      reason: "Minimum hurdle rate failure.",
      description: "Proposal target invalidation distance too tight relative to noise envelope.",
    },
    relatedLinks: [
      { type: "proposal", id: "PROP-040", url: "/trade-proposals" },
    ],
  },
  {
    id: "EVT-009168",
    timestamp: "2026-09-03T09:14:02Z",
    timeFormatted: "09:14:02",
    dateGroup: "Yesterday",
    type: "SECURITY",
    source: "System",
    objectType: "Security",
    objectId: "SEC-AUTH",
    summary: "Paper environment session authenticated. Live keys locked.",
    status: "INFO",
    environment: "PAPER",
    details: {
      description: "Operator access granted with read-write simulator privileges.",
    },
  },
  {
    id: "EVT-009167",
    timestamp: "2026-09-03T04:22:15Z",
    timeFormatted: "04:22:15",
    dateGroup: "Yesterday",
    type: "ERROR",
    source: "Market Data",
    objectType: "Connection",
    objectId: "WS-STREAM",
    summary: "Market data websocket reconnection: Stream restored after 1.8s timeout.",
    status: "WARNING",
    environment: "PAPER",
    details: {
      description: "Transient heartbeat delay detected. Automatic reconnection protocol succeeded.",
    },
  },
  {
    id: "EVT-009166",
    timestamp: "2026-09-02T22:15:00Z",
    timeFormatted: "22:15:00",
    dateGroup: "Earlier",
    type: "PORTFOLIO",
    source: "Portfolio",
    objectType: "Portfolio",
    objectId: "PORT-REBAL",
    summary: "Portfolio rebalance check completed: Beta neutral exposure maintained.",
    status: "SUCCESS",
    environment: "PAPER",
    details: {
      description: "Calculated sector betas against BTC/ETH. Target weight variance within 0.5% threshold.",
    },
  },
  {
    id: "EVT-009165",
    timestamp: "2026-09-02T20:44:10Z",
    timeFormatted: "20:44:10",
    dateGroup: "Earlier",
    type: "EXECUTION",
    source: "Execution Service",
    objectType: "Order",
    objectId: "ORD-0839",
    summary: "Paper order ORD-0839 simulation failed: Orderbook liquidity exhausted above slippage limit (0.05%).",
    status: "FAILED",
    environment: "PAPER",
    details: {
      reason: "Max slippage exceeded.",
      description: "Simulated market fill requested 0.5 BTC but depth was insufficient without crossing spread.",
    },
  },
  {
    id: "EVT-009164",
    timestamp: "2026-09-02T19:30:00Z",
    timeFormatted: "19:30:00",
    dateGroup: "Earlier",
    type: "SECURITY",
    source: "System",
    objectType: "Security",
    objectId: "SEC-2FA",
    summary: "Security check: 2FA biometric challenge passed for administrative audit review.",
    status: "SUCCESS",
    environment: "LIVE",
    details: {
      description: "Hardware token authorization verified. Read-only compliance audit logged.",
    },
  },
  {
    id: "EVT-009163",
    timestamp: "2026-09-02T18:12:45Z",
    timeFormatted: "18:12:45",
    dateGroup: "Earlier",
    type: "EXECUTION",
    source: "Execution Service",
    objectType: "Order",
    objectId: "ORD-0838",
    summary: "Stale limit order ORD-0838 cancelled: TTL expired after 300s without execution.",
    status: "CANCELLED",
    environment: "PAPER",
    details: {
      description: "Order remained unfilled outside of tolerance envelope. Capital unlocked.",
    },
  },
  {
    id: "EVT-009162",
    timestamp: "2026-09-02T16:50:20Z",
    timeFormatted: "16:50:20",
    dateGroup: "Earlier",
    type: "RISK",
    source: "Risk Engine",
    objectType: "Drawdown Guard",
    objectId: "RSK-DD-GUARD",
    summary: "Portfolio daily drawdown exceeded 1.5% soft threshold; sizing multiplier reduced to 0.75x.",
    status: "WARNING",
    environment: "PAPER",
    details: {
      reason: "Intraday drawdown warning.",
      description: "Risk governor throttled maximum trade sizing until end of session.",
    },
  },
  {
    id: "EVT-009161",
    timestamp: "2026-09-02T15:10:00Z",
    timeFormatted: "15:10:00",
    dateGroup: "Earlier",
    type: "OPPORTUNITY",
    source: "Hermes",
    objectType: "Opportunity",
    objectId: "OPP-112",
    summary: "Opportunity OPP-112 state transitioned: MONITORING -> EXPIRED due to momentum decay.",
    status: "INFO",
    environment: "PAPER",
    details: {
      description: "Asset consolidated below breakout trigger level for >4 hours.",
    },
  },
  {
    id: "EVT-009160",
    timestamp: "2026-09-02T14:02:18Z",
    timeFormatted: "14:02:18",
    dateGroup: "Earlier",
    type: "TRADE_PROPOSAL",
    source: "Owner",
    objectType: "Trade Proposal",
    objectId: "PROP-039",
    summary: "Owner rejected proposal PROP-039: Market spread too wide prior to economic data release.",
    status: "REJECTED",
    environment: "PAPER",
    details: {
      reason: "Discretionary macro caution.",
      description: "Operator manually bypassed Hermes candidate ahead of volatility catalyst.",
    },
  },
  {
    id: "EVT-009159",
    timestamp: "2026-09-02T12:35:40Z",
    timeFormatted: "12:35:40",
    dateGroup: "Earlier",
    type: "STRATEGY",
    source: "Strategy Engine",
    objectType: "Strategy",
    objectId: "STRAT-002",
    summary: "Strategy STRAT-002 parameter tune validated: ATR lookback window adjusted from 14 to 12.",
    status: "SUCCESS",
    environment: "PAPER",
    details: {
      description: "Updated lookback profile verified against last 180 days of historical data.",
    },
  },
  {
    id: "EVT-009158",
    timestamp: "2026-09-02T11:20:15Z",
    timeFormatted: "11:20:15",
    dateGroup: "Earlier",
    type: "SECURITY",
    source: "System",
    objectType: "Security",
    objectId: "SEC-IP",
    summary: "IP whitelist verification: API access verified against authorized static CIDR range.",
    status: "INFO",
    environment: "LIVE",
    details: {
      description: "Inbound request source verified against Cloudflare edge certificate.",
    },
  },
  {
    id: "EVT-009157",
    timestamp: "2026-09-02T10:05:00Z",
    timeFormatted: "10:05:00",
    dateGroup: "Earlier",
    type: "PORTFOLIO",
    source: "Portfolio",
    objectType: "Ledger",
    objectId: "PORT-RECON",
    summary: "Daily P&L reconciliation completed: Paper account equity matched ledger at $24,842.18.",
    status: "SUCCESS",
    environment: "PAPER",
    details: {
      description: "Discrepancy count: 0. Unrealized and realized gains correctly balanced.",
    },
  },
  {
    id: "EVT-009156",
    timestamp: "2026-09-02T08:45:10Z",
    timeFormatted: "08:45:10",
    dateGroup: "Earlier",
    type: "EXECUTION",
    source: "Execution Service",
    objectType: "Order",
    objectId: "ORD-0837",
    summary: "Order ORD-0837 cancelled by operator: Pre-trade cancel command executed.",
    status: "CANCELLED",
    environment: "PAPER",
    details: {
      description: "Manual order kill executed in <5ms.",
    },
  },
  {
    id: "EVT-009155",
    timestamp: "2026-09-02T07:15:30Z",
    timeFormatted: "07:15:30",
    dateGroup: "Earlier",
    type: "MARKET",
    source: "Market Data",
    objectType: "Telemetry",
    objectId: "MKT-FUNDING",
    summary: "Binance public funding rate snapshot synchronized: BTC 0.0100%, ETH 0.0085%.",
    status: "SUCCESS",
    environment: "LIVE",
    details: {
      description: "Perpetual futures 8h funding payment calculated for portfolio margin.",
    },
  },
  {
    id: "EVT-009154",
    timestamp: "2026-09-02T05:30:22Z",
    timeFormatted: "05:30:22",
    dateGroup: "Earlier",
    type: "BACKTEST",
    source: "Backtest Engine",
    objectType: "Backtest",
    objectId: "BT-WF-NIGHTLY",
    summary: "Nightly walk-forward validation completed for STRAT-001 (Sharpe 2.41, Calmar 1.95).",
    status: "SUCCESS",
    environment: "PAPER",
    details: {
      description: "Out-of-sample window 6 passed all 5 mathematical validation gates.",
    },
  },
  {
    id: "EVT-009153",
    timestamp: "2026-09-02T03:00:00Z",
    timeFormatted: "03:00:00",
    dateGroup: "Earlier",
    type: "SYSTEM",
    source: "System",
    objectType: "Maintenance",
    objectId: "SYS-CRON",
    summary: "System maintenance window closed. All internal state engines synchronized.",
    status: "INFO",
    environment: "PAPER",
    details: {
      description: "Cache compacted, index rebuilt, database latency normal (<2ms).",
    },
  },
];

export const mockFlowTraces: Record<string, TradingFlowTrace> = {
  "FLOW-0042": {
    flowId: "FLOW-0042",
    symbol: "BTC/USDT",
    side: "LONG",
    strategy: "Breakout Continuation v1.3",
    currentStage: "Position Open",
    overallStatus: "COMPLETED",
    steps: [
      {
        stage: "Opportunity Detected",
        timestamp: "07:45:20",
        status: "INFO",
        objectId: "OPP-118",
        summary: "Volume expansion identified on 1H consolidation.",
      },
      {
        stage: "Deep Investigation",
        timestamp: "09:41:52",
        status: "SUCCESS",
        objectId: "OPP-118",
        summary: "Hermes confirmed multi-indicator breakout thesis (84% confidence).",
      },
      {
        stage: "Trade Proposal",
        timestamp: "09:40:21",
        status: "INFO",
        objectId: "PROP-042",
        summary: "Candidate created: Entry $114,120, Stop $112,800, Target $117,200.",
      },
      {
        stage: "Risk Validation",
        timestamp: "09:42:18",
        status: "SUCCESS",
        objectId: "PROP-042",
        summary: "Risk engine approved: 0.8% requested risk satisfies all limits.",
      },
      {
        stage: "Owner Approval",
        timestamp: "09:35:10",
        status: "SUCCESS",
        objectId: "PROP-042",
        summary: "Owner authorized order for paper execution.",
      },
      {
        stage: "Paper Execution",
        timestamp: "09:35:12",
        status: "SUCCESS",
        objectId: "ORD-0842",
        summary: "Limit order filled: 0.042 BTC @ $114,120.",
      },
      {
        stage: "Position Active",
        timestamp: "09:35:15",
        status: "SUCCESS",
        objectId: "POS-003",
        summary: "Live paper position registered with active trailing stop.",
      },
    ],
  },
  "FLOW-0041": {
    flowId: "FLOW-0041",
    symbol: "ETH/USDT",
    side: "LONG",
    strategy: "Trend Momentum Alpha v2.1",
    currentStage: "Risk Rejected",
    overallStatus: "REJECTED",
    steps: [
      {
        stage: "Opportunity Detected",
        timestamp: "Yesterday 13:50",
        status: "INFO",
        objectId: "OPP-115",
        summary: "ETH momentum spike above $3,500.",
      },
      {
        stage: "Investigation",
        timestamp: "Yesterday 14:05",
        status: "SUCCESS",
        objectId: "OPP-115",
        summary: "Hermes formulated trend continuation hypothesis.",
      },
      {
        stage: "Trade Proposal",
        timestamp: "Yesterday 14:10",
        status: "INFO",
        objectId: "PROP-041",
        summary: "Proposal created requesting 1.4% portfolio risk.",
      },
      {
        stage: "Risk Validation",
        timestamp: "Yesterday 14:15",
        status: "REJECTED",
        objectId: "PROP-041",
        summary: "Risk engine rejected proposal: 1.4% exceeds 1.0% trade ceiling.",
      },
    ],
  },
};
