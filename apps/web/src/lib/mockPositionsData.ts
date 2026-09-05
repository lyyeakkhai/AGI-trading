/**
 * Centralized Deterministic Mock Data for Task 08: Positions & Portfolio
 * AGI Trading Terminal (Obsidian Intelligence)
 */

export type PositionSideType = "LONG" | "SHORT";
export type PositionStatusType = "OPEN" | "PARTIALLY_CLOSED" | "CLOSING" | "CLOSED";
export type RiskStateType = "NORMAL" | "ELEVATED" | "HIGH";

export interface PositionAlert {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
  timestamp: string;
}

export interface PositionThesis {
  setup: string;
  rationale: string;
  expectedBehavior: string;
  invalidation: string;
}

export interface PositionHermesAssessment {
  status: string;
  summary: string;
  lastReview: string;
  bias: "FAVORABLE" | "NEUTRAL" | "CAUTION";
}

export interface PositionItem {
  id: string;
  opportunityId: string;
  proposalId: string;
  symbol: string;
  side: PositionSideType;
  quantity: number;
  quantityUnit: string;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionValue: number;
  margin: number;
  leverage: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  riskPercent: number;
  exposurePercent: number;
  riskState: RiskStateType;
  riskWarningReason?: string;
  strategy: string;
  strategyVersion: string;
  openedAt: string;
  openedTimestamp: number;
  closedAt?: string;
  closedTimestamp?: number;
  exitPrice?: number;
  duration?: string;
  status: PositionStatusType;
  distanceToStopPercent: number;
  distanceToTargetPercent: number;
  riskReward: string;
  thesis: PositionThesis;
  hermesAssessment: PositionHermesAssessment;
  alerts: PositionAlert[];
  lifecycleStage:
    | "opportunity"
    | "investigation"
    | "proposal"
    | "risk"
    | "approval"
    | "execution"
    | "position_open"
    | "closed";
}

export interface PortfolioSummaryMetrics {
  portfolioValue: number;
  availableCapital: number;
  investedCapital: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  realizedPnlPercent: number;
  totalExposure: number;
  todayPnl: number;
  todayPnlPercent: number;
}

export interface PortfolioHealthMetrics {
  status: "NORMAL" | "ELEVATED" | "WARNING";
  exposure: { value: number; limit: number; status: "NORMAL" | "WARNING" };
  dailyPnl: { value: number; limit: number; status: "NORMAL" | "WARNING" };
  drawdown: { value: number; limit: number; status: "NORMAL" | "WARNING" };
  openPositionsCount: number;
  riskUtilization: number;
}

export interface AssetAllocationItem {
  asset: string;
  symbol: string;
  investedValue: number;
  percentageOfInvested: number;
  percentageOfPortfolio: number;
  color: string;
}

export interface PositionFilterState {
  tab: "open" | "closed" | "all";
  search: string;
  asset: string;
  direction: string;
  strategy: string;
  riskState: string;
  sortBy:
    | "default"
    | "pnl-desc"
    | "pnl-asc"
    | "pnl-pct-desc"
    | "exposure-desc"
    | "newest"
    | "risk-desc"
    | "asset";
}

export const defaultPositionFilters: PositionFilterState = {
  tab: "open",
  search: "",
  asset: "All",
  direction: "All",
  strategy: "All",
  riskState: "All",
  sortBy: "default",
};

export const mockPortfolioSummary: PortfolioSummaryMetrics = {
  portfolioValue: 10842.36,
  availableCapital: 7214.80,
  investedCapital: 3627.56,
  unrealizedPnl: 184.32,
  unrealizedPnlPercent: 1.70,
  realizedPnl: 421.77,
  realizedPnlPercent: 3.89,
  totalExposure: 33.5,
  todayPnl: 72.14,
  todayPnlPercent: 0.67,
};

export const mockPortfolioHealth: PortfolioHealthMetrics = {
  status: "NORMAL",
  exposure: { value: 33.5, limit: 50.0, status: "NORMAL" },
  dailyPnl: { value: 0.67, limit: -3.0, status: "NORMAL" },
  drawdown: { value: 1.4, limit: 6.0, status: "NORMAL" },
  openPositionsCount: 4,
  riskUtilization: 42,
};

export const mockAssetAllocations: AssetAllocationItem[] = [
  {
    asset: "Bitcoin",
    symbol: "BTC",
    investedValue: 2374.47,
    percentageOfInvested: 65.4,
    percentageOfPortfolio: 21.9,
    color: "#00E5FF", // Cyan Intelligence
  },
  {
    asset: "Ethereum",
    symbol: "ETH",
    investedValue: 1253.09,
    percentageOfInvested: 34.6,
    percentageOfPortfolio: 11.6,
    color: "#3B82F6", // Blue
  },
];

export const mockGlobalPositionAlerts: PositionAlert[] = [
  {
    id: "ALT-01",
    type: "info",
    message: "BTC/USDT: Breakout structure holding above $67,500 support level.",
    timestamp: "12s ago",
  },
  {
    id: "ALT-02",
    type: "success",
    message: "ETH/USDT: Approaching take-profit target zone ($3,550). Trailing stop active.",
    timestamp: "2m ago",
  },
  {
    id: "ALT-03",
    type: "warning",
    message: "ETH/USDT Momentum: Position in slight drawdown. Invalidation price $3,380 is respected.",
    timestamp: "6m ago",
  },
];

export const mockOpenPositions: PositionItem[] = [
  {
    id: "POS-0081",
    opportunityId: "OPP-018",
    proposalId: "TP-0042",
    symbol: "BTC/USDT",
    side: "LONG",
    quantity: 0.035,
    quantityUnit: "BTC",
    entryPrice: 67200,
    currentPrice: 67842,
    stopLoss: 66500,
    takeProfit: 69000,
    positionValue: 2374.47,
    margin: 474.89,
    leverage: 5,
    unrealizedPnl: 22.47,
    unrealizedPnlPercent: 0.95,
    realizedPnl: 0,
    riskPercent: 0.50,
    exposurePercent: 21.8,
    riskState: "NORMAL",
    strategy: "Breakout Continuation",
    strategyVersion: "v2.4",
    openedAt: "Today, 10:31 UTC",
    openedTimestamp: 1725445860000,
    status: "OPEN",
    distanceToStopPercent: 1.98,
    distanceToTargetPercent: 1.71,
    riskReward: "2.57R",
    thesis: {
      setup: "Breakout Continuation",
      rationale:
        "Price confirmed a high-volume breakout above the 4H range resistance at $67,200 with open interest expansion.",
      expectedBehavior:
        "Measured impulsive move towards liquidity pool at $69,000 without breaking back below $66,500.",
      invalidation:
        "Sustained 15m candle close below the breakout origin at $66,500.",
    },
    hermesAssessment: {
      status: "Actively Monitoring",
      summary:
        "Position remains firmly aligned with original breakout thesis. Orderbook bid depth on Binance is supporting $67,500.",
      lastReview: "14 seconds ago",
      bias: "FAVORABLE",
    },
    alerts: [
      {
        id: "AL-81-1",
        type: "success",
        message: "Price expanded +0.95% past entry. Break-even stop trigger armed.",
        timestamp: "5m ago",
      },
      {
        id: "AL-81-2",
        type: "info",
        message: "Spot CVD divergence positive on Binance and Coinbase.",
        timestamp: "12m ago",
      },
    ],
    lifecycleStage: "position_open",
  },
  {
    id: "POS-0082",
    opportunityId: "OPP-019",
    proposalId: "TP-0043",
    symbol: "ETH/USDT",
    side: "LONG",
    quantity: 0.42,
    quantityUnit: "ETH",
    entryPrice: 3360,
    currentPrice: 3421,
    stopLoss: 3280,
    takeProfit: 3550,
    positionValue: 1436.82,
    margin: 287.36,
    leverage: 5,
    unrealizedPnl: 25.62,
    unrealizedPnlPercent: 1.83,
    realizedPnl: 0,
    riskPercent: 0.40,
    exposurePercent: 13.2,
    riskState: "NORMAL",
    strategy: "Trend Continuation",
    strategyVersion: "v1.8",
    openedAt: "Today, 07:15 UTC",
    openedTimestamp: 1725434100000,
    status: "OPEN",
    distanceToStopPercent: 4.12,
    distanceToTargetPercent: 3.77,
    riskReward: "2.38R",
    thesis: {
      setup: "Trend Continuation",
      rationale:
        "Higher low confirmation above EMA50 on the 1H chart with rising funding rate neutrality.",
      expectedBehavior:
        "Continuation towards local range high at $3,550 with systematic trailing stop steps.",
      invalidation:
        "Hourly close below structural swing low at $3,280.",
    },
    hermesAssessment: {
      status: "Approaching Target Zone",
      summary:
        "Momentum oscillators (RSI 64.2) indicate healthy trend velocity. Take-profit order pre-positioned at $3,550.",
      lastReview: "28 seconds ago",
      bias: "FAVORABLE",
    },
    alerts: [
      {
        id: "AL-82-1",
        type: "info",
        message: "Resistance zone $3,450 tested twice with aggressive absorption.",
        timestamp: "18m ago",
      },
    ],
    lifecycleStage: "position_open",
  },
  {
    id: "POS-0083",
    opportunityId: "OPP-022",
    proposalId: "TP-0046",
    symbol: "BTC/USDT",
    side: "SHORT",
    quantity: 0.015,
    quantityUnit: "BTC",
    entryPrice: 68100,
    currentPrice: 67842,
    stopLoss: 68600,
    takeProfit: 66800,
    positionValue: 1017.63,
    margin: 203.53,
    leverage: 5,
    unrealizedPnl: 3.87,
    unrealizedPnlPercent: 0.38,
    realizedPnl: 0,
    riskPercent: 0.25,
    exposurePercent: 9.4,
    riskState: "NORMAL",
    strategy: "Mean Reversion",
    strategyVersion: "v3.1",
    openedAt: "Today, 11:42 UTC",
    openedTimestamp: 1725450120000,
    status: "OPEN",
    distanceToStopPercent: 1.12,
    distanceToTargetPercent: 1.54,
    riskReward: "2.60R",
    thesis: {
      setup: "Mean Reversion",
      rationale:
        "Upper Bollinger band rejection on 15m timeframe accompanied by localized volume exhaustion.",
      expectedBehavior:
        "Pullback to VWAP midpoint at $67,200 / $66,800.",
      invalidation:
        "New high push printing above $68,600.",
    },
    hermesAssessment: {
      status: "Monitoring Pullback",
      summary:
        "Hedging delta profile across portfolio. Small positive carry with price drifting towards entry target.",
      lastReview: "45 seconds ago",
      bias: "NEUTRAL",
    },
    alerts: [],
    lifecycleStage: "position_open",
  },
  {
    id: "POS-0084",
    opportunityId: "OPP-025",
    proposalId: "TP-0049",
    symbol: "ETH/USDT",
    side: "LONG",
    quantity: 0.25,
    quantityUnit: "ETH",
    entryPrice: 3450,
    currentPrice: 3421,
    stopLoss: 3380,
    takeProfit: 3600,
    positionValue: 855.25,
    margin: 171.05,
    leverage: 5,
    unrealizedPnl: -7.25,
    unrealizedPnlPercent: -0.84,
    realizedPnl: 0,
    riskPercent: 0.35,
    exposurePercent: 7.9,
    riskState: "ELEVATED",
    riskWarningReason:
      "Position in minor drawdown (-0.84%). Stop distance narrowed to 1.20%. Monitoring support integrity.",
    strategy: "Momentum",
    strategyVersion: "v1.2",
    openedAt: "Today, 09:10 UTC",
    openedTimestamp: 1725441000000,
    status: "OPEN",
    distanceToStopPercent: 1.20,
    distanceToTargetPercent: 5.23,
    riskReward: "2.14R",
    thesis: {
      setup: "Momentum Breakout",
      rationale:
        "Intraday surge above previous session high $3,440. Anticipating rapid follow-through into $3,600.",
      expectedBehavior:
        "Immediate acceleration. If price stalls below $3,400, risk is escalated.",
      invalidation:
        "Loss of $3,380 support shelf.",
    },
    hermesAssessment: {
      status: "Elevated Vigilance",
      summary:
        "Momentum has temporarily decelerated following broader market consolidation. Support at $3,410 is holding. No rule breaches.",
      lastReview: "9 seconds ago",
      bias: "CAUTION",
    },
    alerts: [
      {
        id: "AL-84-1",
        type: "warning",
        message: "Price declined -0.84% below entry. Invalidation price $3,380 active.",
        timestamp: "8m ago",
      },
    ],
    lifecycleStage: "position_open",
  },
];

export const mockClosedPositions: PositionItem[] = [
  {
    id: "POS-0075",
    opportunityId: "OPP-012",
    proposalId: "TP-0036",
    symbol: "ETH/USDT",
    side: "LONG",
    quantity: 0.40,
    quantityUnit: "ETH",
    entryPrice: 3120,
    currentPrice: 3280,
    stopLoss: 3040,
    takeProfit: 3280,
    positionValue: 1312.00,
    margin: 262.40,
    leverage: 5,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    realizedPnl: 67.20,
    riskPercent: 0.45,
    exposurePercent: 12.1,
    riskState: "NORMAL",
    strategy: "Trend Continuation",
    strategyVersion: "v1.8",
    openedAt: "Sep 02, 14:10 UTC",
    openedTimestamp: 1725286200000,
    closedAt: "Sep 03, 04:32 UTC",
    closedTimestamp: 1725337920000,
    exitPrice: 3280,
    duration: "14h 22m",
    status: "CLOSED",
    distanceToStopPercent: 0,
    distanceToTargetPercent: 0,
    riskReward: "2.00R",
    thesis: {
      setup: "Trend Continuation",
      rationale: "Pullback into 4H bullish orderblock with rising RSI divergence.",
      expectedBehavior: "Impulse to $3,280 target.",
      invalidation: "Break below $3,040.",
    },
    hermesAssessment: {
      status: "Executed Target Fill",
      summary: "Take profit filled precisely at $3,280 with +5.13% return on position value.",
      lastReview: "Yesterday",
      bias: "FAVORABLE",
    },
    alerts: [],
    lifecycleStage: "closed",
  },
  {
    id: "POS-0076",
    opportunityId: "OPP-014",
    proposalId: "TP-0038",
    symbol: "BTC/USDT",
    side: "SHORT",
    quantity: 0.065,
    quantityUnit: "BTC",
    entryPrice: 69400,
    currentPrice: 67200,
    stopLoss: 70100,
    takeProfit: 67200,
    positionValue: 4368.00,
    margin: 873.60,
    leverage: 5,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    realizedPnl: 142.50,
    riskPercent: 0.60,
    exposurePercent: 39.5,
    riskState: "NORMAL",
    strategy: "Volatility Breakout",
    strategyVersion: "v2.1",
    openedAt: "Sep 01, 20:00 UTC",
    openedTimestamp: 1725220800000,
    closedAt: "Sep 03, 00:00 UTC",
    closedTimestamp: 1725321600000,
    exitPrice: 67200,
    duration: "1d 4h",
    status: "CLOSED",
    distanceToStopPercent: 0,
    distanceToTargetPercent: 0,
    riskReward: "3.14R",
    thesis: {
      setup: "Volatility Breakdown",
      rationale: "Liquidity grab above psychological $70k followed by aggressive rejection.",
      expectedBehavior: "Flush to range equilibrium at $67,200.",
      invalidation: "Acceptance above $70,100.",
    },
    hermesAssessment: {
      status: "Closed at Target",
      summary: "Clean downward impulse hit final limit order at $67,200.",
      lastReview: "Sep 03",
      bias: "FAVORABLE",
    },
    alerts: [],
    lifecycleStage: "closed",
  },
  {
    id: "POS-0077",
    opportunityId: "OPP-009",
    proposalId: "TP-0031",
    symbol: "BTC/USDT",
    side: "LONG",
    quantity: 0.040,
    quantityUnit: "BTC",
    entryPrice: 66400,
    currentPrice: 65450,
    stopLoss: 65450,
    takeProfit: 68500,
    positionValue: 2618.00,
    margin: 523.60,
    leverage: 5,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    realizedPnl: -38.10,
    riskPercent: 0.50,
    exposurePercent: 24.1,
    riskState: "NORMAL",
    strategy: "Breakout Continuation",
    strategyVersion: "v2.4",
    openedAt: "Aug 31, 08:30 UTC",
    openedTimestamp: 1725093000000,
    closedAt: "Aug 31, 14:45 UTC",
    closedTimestamp: 1725115500000,
    exitPrice: 65450,
    duration: "6h 15m",
    status: "CLOSED",
    distanceToStopPercent: 0,
    distanceToTargetPercent: 0,
    riskReward: "2.21R",
    thesis: {
      setup: "Breakout Continuation",
      rationale: "Attempted push past $66.4k resistance.",
      expectedBehavior: "Follow through to $68.5k.",
      invalidation: "Drop below $65,450.",
    },
    hermesAssessment: {
      status: "Stop Loss Executed",
      summary: "Deterministic stop loss triggered at $65,450. Capital protection rule enforced as designed.",
      lastReview: "Aug 31",
      bias: "NEUTRAL",
    },
    alerts: [],
    lifecycleStage: "closed",
  },
  {
    id: "POS-0078",
    opportunityId: "OPP-008",
    proposalId: "TP-0029",
    symbol: "ETH/USDT",
    side: "LONG",
    quantity: 0.60,
    quantityUnit: "ETH",
    entryPrice: 3210,
    currentPrice: 3370,
    stopLoss: 3120,
    takeProfit: 3370,
    positionValue: 2022.00,
    margin: 404.40,
    leverage: 5,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    realizedPnl: 94.30,
    riskPercent: 0.40,
    exposurePercent: 18.6,
    riskState: "NORMAL",
    strategy: "Mean Reversion",
    strategyVersion: "v3.1",
    openedAt: "Aug 29, 22:15 UTC",
    openedTimestamp: 1724969700000,
    closedAt: "Aug 30, 17:05 UTC",
    closedTimestamp: 1725037500000,
    exitPrice: 3370,
    duration: "18h 50m",
    status: "CLOSED",
    distanceToStopPercent: 0,
    distanceToTargetPercent: 0,
    riskReward: "1.78R",
    thesis: {
      setup: "Mean Reversion",
      rationale: "Oversold bounce from 4H support cluster.",
      expectedBehavior: "Reversion to mean at $3,370.",
      invalidation: "Sub-$3,120 print.",
    },
    hermesAssessment: {
      status: "Target Achieved",
      summary: "Smooth upward glide filled limit order at $3,370 with +4.98% gain.",
      lastReview: "Aug 30",
      bias: "FAVORABLE",
    },
    alerts: [],
    lifecycleStage: "closed",
  },
  {
    id: "POS-0079",
    opportunityId: "OPP-005",
    proposalId: "TP-0024",
    symbol: "BTC/USDT",
    side: "LONG",
    quantity: 0.070,
    quantityUnit: "BTC",
    entryPrice: 63800,
    currentPrice: 66800,
    stopLoss: 62500,
    takeProfit: 66800,
    positionValue: 4676.00,
    margin: 935.20,
    leverage: 5,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    realizedPnl: 210.00,
    riskPercent: 0.55,
    exposurePercent: 43.1,
    riskState: "NORMAL",
    strategy: "Momentum",
    strategyVersion: "v1.2",
    openedAt: "Aug 27, 03:00 UTC",
    openedTimestamp: 1724727600000,
    closedAt: "Aug 29, 04:00 UTC",
    closedTimestamp: 1724904000000,
    exitPrice: 66800,
    duration: "2d 1h",
    status: "CLOSED",
    distanceToStopPercent: 0,
    distanceToTargetPercent: 0,
    riskReward: "2.31R",
    thesis: {
      setup: "Multi-Day Trend Push",
      rationale: "Daily MACD histogram turn and ETF inflow acceleration.",
      expectedBehavior: "Push into $66.8k overhead liquidity.",
      invalidation: "Breakdown under $62.5k.",
    },
    hermesAssessment: {
      status: "Closed at Target",
      summary: "Full exit executed at $66,800. Largest realized profit of the week.",
      lastReview: "Aug 29",
      bias: "FAVORABLE",
    },
    alerts: [],
    lifecycleStage: "closed",
  },
  {
    id: "POS-0080",
    opportunityId: "OPP-003",
    proposalId: "TP-0019",
    symbol: "ETH/USDT",
    side: "SHORT",
    quantity: 0.55,
    quantityUnit: "ETH",
    entryPrice: 3410,
    currentPrice: 3508,
    stopLoss: 3508,
    takeProfit: 3250,
    positionValue: 1929.40,
    margin: 385.88,
    leverage: 5,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    realizedPnl: -54.13,
    riskPercent: 0.45,
    exposurePercent: 17.8,
    riskState: "NORMAL",
    strategy: "Trend Continuation",
    strategyVersion: "v1.8",
    openedAt: "Aug 25, 11:20 UTC",
    openedTimestamp: 1724584800000,
    closedAt: "Aug 25, 20:00 UTC",
    closedTimestamp: 1724616000000,
    exitPrice: 3508,
    duration: "8h 40m",
    status: "CLOSED",
    distanceToStopPercent: 0,
    distanceToTargetPercent: 0,
    riskReward: "1.63R",
    thesis: {
      setup: "Short Breakdown Retest",
      rationale: "Bearish engulfing on 1H at $3,410 resistance.",
      expectedBehavior: "Downside continuation to $3,250.",
      invalidation: "Push past $3,508.",
    },
    hermesAssessment: {
      status: "Stop Triggered",
      summary: "Squeeze swept stops at $3,508. Loss capped within deterministic risk tolerance.",
      lastReview: "Aug 25",
      bias: "NEUTRAL",
    },
    alerts: [],
    lifecycleStage: "closed",
  },
];

export const allMockPositions: PositionItem[] = [
  ...mockOpenPositions,
  ...mockClosedPositions,
];
