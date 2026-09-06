export type RiskState = "HEALTHY" | "WARNING" | "CRITICAL" | "LOCKED";
export type CheckStatus = "PASS" | "WARNING" | "FAIL";
export type DecisionStatus = "APPROVED" | "REJECTED" | "WARNING";

export interface RiskOverviewData {
  portfolioEquity: number;
  totalExposure: number;
  exposurePercent: number;
  portfolioRisk: number; // %
  availableRisk: number; // %
  maxPortfolioRisk: number; // %
  dailyLoss: number; // $
  dailyLossPercent: number; // %
  dailyLossLimit: number; // $
  dailyLossLimitPercent: number; // %
  dailyLossUtilization: number; // %
  openPositionsCount: number;
  maxOpenPositions: number;
  status: RiskState;
}

export interface AssetExposureItem {
  symbol: string;
  exposureAmount: number;
  exposurePercent: number; // % of total exposure
  portfolioPercent: number; // % of total equity
  maxAllowedPercent: number;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
}

export interface ExposureOverviewData {
  longExposure: number;
  longPercent: number;
  shortExposure: number;
  shortPercent: number;
  assets: AssetExposureItem[];
  combinedCorrelatedPercent: number;
  maxCombinedCorrelatedPercent: number;
  correlationStatus: RiskState;
}

export interface PositionRiskItem {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  stopPrice: number;
  positionSize: string;
  riskAmount: number;
  portfolioRiskPercent: number;
  distanceToStopPercent: number;
  unrealizedPnl: number;
  status: "HEALTHY" | "WARNING" | "BREACH";
}

export interface RiskLimitConfig {
  maxRiskPerTrade: number; // %
  maxPortfolioRisk: number; // %
  maxDailyLoss: number; // %
  maxOpenPositions: number;
  maxAssetExposure: number; // %
  maxCorrelatedExposure: number; // %
  minRiskReward: number; // R
  liveTradingEnabled: boolean;
}

export interface RiskCheckItem {
  id: string;
  name: string;
  current: string;
  limit: string;
  status: CheckStatus;
  description: string;
}

export interface RiskDecisionItem {
  id: string;
  proposalId: string;
  symbol: string;
  side: "LONG" | "SHORT";
  requestedRiskPercent: number;
  riskReward: number;
  decision: DecisionStatus;
  reason: string;
  suggestedAction?: string;
  timestamp: string;
  strategyId?: string;
  strategyName?: string;
  backtestId?: string;
  riskBeforePercent: number;
  riskAfterPercent: number;
  maxLimitPercent: number;
  checks: {
    perTradeRisk: CheckStatus;
    portfolioRisk: CheckStatus;
    dailyLoss: CheckStatus;
    assetExposure: CheckStatus;
    openPositions: CheckStatus;
    riskReward: CheckStatus;
  };
}

export interface RiskEventItem {
  id: string;
  time: string;
  title: string;
  description: string;
  type: "info" | "warning" | "error" | "success";
}

export interface SafetyStatusData {
  tradingLock: "OFF" | "ON";
  liveTrading: "OFF" | "ON";
  paperTrading: "ON" | "OFF";
  emergencyStop: "INACTIVE" | "TRIGGERED";
}

export const mockRiskOverview: RiskOverviewData = {
  portfolioEquity: 12480,
  totalExposure: 4820,
  exposurePercent: 38.6,
  portfolioRisk: 1.8,
  availableRisk: 3.2,
  maxPortfolioRisk: 5.0,
  dailyLoss: 84,
  dailyLossPercent: 0.7,
  dailyLossLimit: 300,
  dailyLossLimitPercent: 3.0,
  dailyLossUtilization: 28,
  openPositionsCount: 3,
  maxOpenPositions: 5,
  status: "HEALTHY",
};

export const mockExposureOverview: ExposureOverviewData = {
  longExposure: 4820,
  longPercent: 100,
  shortExposure: 0,
  shortPercent: 0,
  assets: [
    {
      symbol: "BTC/USDT",
      exposureAmount: 3200,
      exposurePercent: 66.4,
      portfolioPercent: 25.6,
      maxAllowedPercent: 40.0,
      status: "HEALTHY",
    },
    {
      symbol: "ETH/USDT",
      exposureAmount: 1620,
      exposurePercent: 33.6,
      portfolioPercent: 13.0,
      maxAllowedPercent: 40.0,
      status: "HEALTHY",
    },
  ],
  combinedCorrelatedPercent: 38.6,
  maxCombinedCorrelatedPercent: 60.0,
  correlationStatus: "HEALTHY",
};

export const mockPositionRisks: PositionRiskItem[] = [
  {
    id: "POS-001",
    symbol: "BTC/USDT",
    side: "LONG",
    entryPrice: 112400,
    currentPrice: 114180,
    stopPrice: 110900,
    positionSize: "0.090 BTC ($10,276)",
    riskAmount: 135,
    portfolioRiskPercent: 1.08,
    distanceToStopPercent: 2.87,
    unrealizedPnl: 160.2,
    status: "HEALTHY",
  },
  {
    id: "POS-002",
    symbol: "ETH/USDT",
    side: "LONG",
    entryPrice: 3420,
    currentPrice: 3510,
    stopPrice: 3340,
    positionSize: "1.25 ETH ($4,387)",
    riskAmount: 62.5,
    portfolioRiskPercent: 0.50,
    distanceToStopPercent: 4.84,
    unrealizedPnl: 112.5,
    status: "HEALTHY",
  },
  {
    id: "POS-003",
    symbol: "BTC/USDT",
    side: "LONG",
    entryPrice: 113100,
    currentPrice: 114180,
    stopPrice: 112800,
    positionSize: "0.050 BTC ($5,709)",
    riskAmount: 27.5,
    portfolioRiskPercent: 0.22,
    distanceToStopPercent: 1.21,
    unrealizedPnl: 54.0,
    status: "HEALTHY",
  },
];

export const mockRiskLimits: RiskLimitConfig = {
  maxRiskPerTrade: 1.0,
  maxPortfolioRisk: 5.0,
  maxDailyLoss: 3.0,
  maxOpenPositions: 5,
  maxAssetExposure: 40.0,
  maxCorrelatedExposure: 60.0,
  minRiskReward: 1.5,
  liveTradingEnabled: false,
};

export const mockRiskChecks: RiskCheckItem[] = [
  {
    id: "CHK-01",
    name: "Per-Trade Risk Sizing",
    current: "0.8% (Largest: 1.08%)",
    limit: "1.0% max / trade",
    status: "PASS",
    description: "Evaluates capital at risk based on entry to stop distance.",
  },
  {
    id: "CHK-02",
    name: "Aggregate Portfolio Risk",
    current: "1.8%",
    limit: "5.0% max",
    status: "PASS",
    description: "Sum of risk amounts across all concurrent open positions.",
  },
  {
    id: "CHK-03",
    name: "Daily Loss Protection",
    current: "0.7% ($84 / $300)",
    limit: "3.0% max daily loss",
    status: "PASS",
    description: "Circuit breaker trigger locks new orders if breached.",
  },
  {
    id: "CHK-04",
    name: "Open Concurrent Positions",
    current: "3 positions",
    limit: "5 positions max",
    status: "PASS",
    description: "Cap on simultaneous active executions across all markets.",
  },
  {
    id: "CHK-05",
    name: "BTC Asset Concentration",
    current: "25.6%",
    limit: "40.0% max",
    status: "PASS",
    description: "Maximum capital allocation allowed in a single crypto asset.",
  },
  {
    id: "CHK-06",
    name: "Minimum Risk/Reward Filter",
    current: "2.1R average",
    limit: "1.5R minimum",
    status: "PASS",
    description: "Proposals with target-to-stop ratio below 1.5R are automatically rejected.",
  },
];

export const mockRiskDecisions: RiskDecisionItem[] = [
  {
    id: "DEC-042",
    proposalId: "PROP-042",
    symbol: "BTC/USDT",
    side: "LONG",
    requestedRiskPercent: 0.8,
    riskReward: 2.4,
    decision: "APPROVED",
    reason: "All deterministic limits satisfied.",
    timestamp: "Today 09:42",
    strategyId: "STRAT-001",
    strategyName: "Breakout Continuation v1.3",
    backtestId: "BT-0042",
    riskBeforePercent: 1.8,
    riskAfterPercent: 2.6,
    maxLimitPercent: 5.0,
    checks: {
      perTradeRisk: "PASS",
      portfolioRisk: "PASS",
      dailyLoss: "PASS",
      assetExposure: "PASS",
      openPositions: "PASS",
      riskReward: "PASS",
    },
  },
  {
    id: "DEC-041",
    proposalId: "PROP-041",
    symbol: "ETH/USDT",
    side: "LONG",
    requestedRiskPercent: 1.4,
    riskReward: 1.8,
    decision: "REJECTED",
    reason: "Per-trade risk (1.4%) exceeds maximum configured threshold (1.0%).",
    suggestedAction: "Reduce position size or widen stop loss distance with proportional size trim.",
    timestamp: "Yesterday 14:15",
    strategyId: "STRAT-002",
    strategyName: "Trend Momentum Alpha v2.1",
    backtestId: "BT-0041",
    riskBeforePercent: 1.8,
    riskAfterPercent: 3.2,
    maxLimitPercent: 5.0,
    checks: {
      perTradeRisk: "FAIL",
      portfolioRisk: "PASS",
      dailyLoss: "PASS",
      assetExposure: "PASS",
      openPositions: "PASS",
      riskReward: "PASS",
    },
  },
  {
    id: "DEC-040",
    proposalId: "PROP-040",
    symbol: "BTC/USDT",
    side: "LONG",
    requestedRiskPercent: 0.7,
    riskReward: 1.2,
    decision: "REJECTED",
    reason: "Minimum Risk/Reward (1.2R) is below the required 1.5R institutional floor.",
    suggestedAction: "Wait for higher confirmation target or tighter structural invalidation.",
    timestamp: "Yesterday 10:20",
    strategyId: "STRAT-001",
    strategyName: "Breakout Continuation v1.3",
    riskBeforePercent: 1.8,
    riskAfterPercent: 2.5,
    maxLimitPercent: 5.0,
    checks: {
      perTradeRisk: "PASS",
      portfolioRisk: "PASS",
      dailyLoss: "PASS",
      assetExposure: "PASS",
      openPositions: "PASS",
      riskReward: "FAIL",
    },
  },
  {
    id: "DEC-039",
    proposalId: "PROP-039",
    symbol: "ETH/USDT",
    side: "SHORT",
    requestedRiskPercent: 0.9,
    riskReward: 2.2,
    decision: "APPROVED",
    reason: "All deterministic risk limits satisfied.",
    timestamp: "Sep 01 16:30",
    strategyId: "STRAT-005",
    strategyName: "Mean Reversion Bollinger v1.1",
    riskBeforePercent: 1.2,
    riskAfterPercent: 2.1,
    maxLimitPercent: 5.0,
    checks: {
      perTradeRisk: "PASS",
      portfolioRisk: "PASS",
      dailyLoss: "PASS",
      assetExposure: "PASS",
      openPositions: "PASS",
      riskReward: "PASS",
    },
  },
];

export const mockRiskEvents: RiskEventItem[] = [
  {
    id: "EV-01",
    time: "09:42",
    title: "PROP-042 risk validation passed",
    description: "Requested 0.8% risk evaluated against 3.2% headroom. Approved for owner review.",
    type: "success",
  },
  {
    id: "EV-02",
    time: "09:36",
    title: "Portfolio risk increased to 1.8%",
    description: "Stop modification on POS-003 locked in $27.50 of safety margin.",
    type: "info",
  },
  {
    id: "EV-03",
    time: "09:12",
    title: "Daily loss utilization reached 28%",
    description: "Realized closed friction and paper slippage equals -$84 against -$300 limit.",
    type: "info",
  },
  {
    id: "EV-04",
    time: "Yesterday 14:15",
    title: "PROP-041 rejected — per-trade risk exceeded",
    description: "Hermes proposal requested 1.4% risk allocation. Blocked by Deterministic Risk Engine.",
    type: "warning",
  },
];

export const mockSafetyStatus: SafetyStatusData = {
  tradingLock: "OFF",
  liveTrading: "OFF",
  paperTrading: "ON",
  emergencyStop: "INACTIVE",
};
