export type GateStatus = "PASS" | "WARNING" | "FAIL" | "BLOCKED";

export interface ReadinessGate {
  id: string;
  number: number;
  name: string;
  category: "ENVIRONMENT" | "CREDENTIALS" | "EXCHANGE" | "RISK" | "AUTHORITY";
  status: GateStatus;
  detail: string;
  required: boolean;
}

export interface LiveProductionLimits {
  riskPerTradePercent: number;
  maxPortfolioRiskPercent: number;
  maxDailyLossPercent: number;
  maxOpenPositions: number;
  maxAssetExposurePercent: number;
  minRiskRewardRatio: number;
}

export interface LiveAccountTelemetry {
  exchange: string;
  environment: "LIVE" | "TESTNET";
  accountType: string;
  status: "ACTIVE" | "INACTIVE" | "RESTRICTED";
  liveEquityUsd: number;
  availableCapitalUsd: number;
  currentExposureUsd: number;
  riskUtilizationPercent: number;
  permissions: {
    read: boolean;
    spotTrading: boolean;
    futuresTrading: boolean;
    withdrawals: boolean;
    ipRestricted: boolean;
  };
}

export const initialReadinessGates: ReadinessGate[] = [
  {
    id: "GATE-01",
    number: 1,
    name: "Production Environment Verified",
    category: "ENVIRONMENT",
    status: "PASS",
    detail: "TLS 1.3 enforced, secure session cookies with CSRF tokens active.",
    required: true,
  },
  {
    id: "GATE-02",
    number: 2,
    name: "Server-Side Credentials Present",
    category: "CREDENTIALS",
    status: "PASS",
    detail: "BINANCE_API_KEY and BINANCE_SECRET_KEY loaded in backend vault.",
    required: true,
  },
  {
    id: "GATE-03",
    number: 3,
    name: "API Key Permissions Validated",
    category: "CREDENTIALS",
    status: "PASS",
    detail: "Spot order placement permitted; margin borrowing privileges verified.",
    required: true,
  },
  {
    id: "GATE-04",
    number: 4,
    name: "Withdrawals Strictly Disabled",
    category: "CREDENTIALS",
    status: "PASS",
    detail: "Withdrawal capability is disabled at exchange key configuration.",
    required: true,
  },
  {
    id: "GATE-05",
    number: 5,
    name: "IP Whitelist Restrictions Active",
    category: "EXCHANGE",
    status: "PASS",
    detail: "API requests locked to static server gateway IPs.",
    required: true,
  },
  {
    id: "GATE-06",
    number: 6,
    name: "Exchange Connectivity & Latency",
    category: "EXCHANGE",
    status: "PASS",
    detail: "Round-trip ping: 68ms. 0 network timeouts over previous 500 ticks.",
    required: true,
  },
  {
    id: "GATE-07",
    number: 7,
    name: "Deterministic Risk Engine Constraints",
    category: "RISK",
    status: "PASS",
    detail: "0.50% max risk/trade, 5.0% max portfolio, 3.0% daily circuit breaker.",
    required: true,
  },
  {
    id: "GATE-08",
    number: 8,
    name: "Execution Engine State Operational",
    category: "RISK",
    status: "PASS",
    detail: "Idempotency locks verified; double-execution protection armed.",
    required: true,
  },
  {
    id: "GATE-09",
    number: 9,
    name: "Owner Dual-Signature Session",
    category: "AUTHORITY",
    status: "PASS",
    detail: "Interactive operator session authenticated with owner role.",
    required: true,
  },
  {
    id: "GATE-10",
    number: 10,
    name: "Trading Mode Configured to LIVE",
    category: "ENVIRONMENT",
    status: "WARNING",
    detail: "Active workspace is currently set to PAPER. Requires mode switch.",
    required: true,
  },
  {
    id: "GATE-11",
    number: 11,
    name: "Live Execution Feature Flag",
    category: "ENVIRONMENT",
    status: "WARNING",
    detail: "LIVE_TRADING_ENABLED feature flag is currently false in server config.",
    required: true,
  },
  {
    id: "GATE-12",
    number: 12,
    name: "Emergency Kill Switch Inactive",
    category: "RISK",
    status: "PASS",
    detail: "Kill switch state is UNLOCKED; no active emergency halts present.",
    required: true,
  },
];

export const initialLiveLimits: LiveProductionLimits = {
  riskPerTradePercent: 0.5,
  maxPortfolioRiskPercent: 5.0,
  maxDailyLossPercent: 3.0,
  maxOpenPositions: 5,
  maxAssetExposurePercent: 40.0,
  minRiskRewardRatio: 1.5,
};

export const initialLiveTelemetry: LiveAccountTelemetry = {
  exchange: "Binance",
  environment: "LIVE",
  accountType: "USD-M Futures & Spot",
  status: "RESTRICTED",
  liveEquityUsd: 25480.0,
  availableCapitalUsd: 21850.0,
  currentExposureUsd: 3630.0,
  riskUtilizationPercent: 24.5,
  permissions: {
    read: true,
    spotTrading: true,
    futuresTrading: false,
    withdrawals: false,
    ipRestricted: true,
  },
};
