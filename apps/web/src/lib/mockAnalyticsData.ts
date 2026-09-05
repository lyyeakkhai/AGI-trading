export interface AnalyticsSummary {
  netPnl: number;
  netReturn: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  expectancy: number; // R
  sharpeStyle: number;
  sortinoStyle: number;
  calmarStyle: number;
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  averageWinner: number;
  averageLoser: number;
  largestWinner: number;
  largestLoser: number;
  averageHoldingTime: string;
  fees: number;
  slippage: number;
  grossPnl: number;
  costImpact: number;
}

export interface EquityBenchmarkPoint {
  time: string;
  equity: number;
  btcHold: number;
  ethHold: number;
}

export interface DrawdownAnalysisData {
  currentDrawdown: number;
  maxDrawdown: number;
  averageDrawdown: number;
  longestDrawdown: string;
  recoveryTime: string;
  curve: Array<{ time: string; value: number }>;
}

export interface PeriodReturn {
  period: string;
  returnPct: number;
  pnl: number;
  trades: number;
  winRate: number;
}

export interface DistributionBucket {
  range: string;
  count: number;
  type: "win" | "loss";
}

export interface StrategyAnalyticsItem {
  id: string;
  name: string;
  version: string;
  trades: number;
  netPnl: number;
  returnPct: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  expectancy: number;
  status: "Active" | "Validation" | "Archived";
}

export interface AssetAnalyticsItem {
  asset: string;
  trades: number;
  netPnl: number;
  returnPct: number;
  profitFactor: number;
  winRate: number;
}

export interface TimeframeAnalyticsItem {
  timeframe: string;
  trades: number;
  returnPct: number;
  profitFactor: number;
}

export interface RegimeAnalyticsItem {
  regime: string;
  returnPct: number;
  profitFactor: number;
  tradeCount: number;
  winRate: number;
}

export interface DirectionalAnalytics {
  long: {
    trades: number;
    winRate: number;
    netPnl: number;
    profitFactor: number;
  };
  short: {
    trades: number;
    winRate: number;
    netPnl: number;
    profitFactor: number;
  };
}

export interface ConsistencyMetrics {
  profitableDaysRatio: string;
  profitableWeeksRatio: string;
  profitableMonthsRatio: string;
  winningStreak: number;
  losingStreak: number;
  averageMonthlyReturn: number;
}

export interface ConfidenceCalibrationItem {
  range: string;
  winRate: number;
  trades: number;
}

export interface HermesFunnelStage {
  stage: string;
  count: number;
  conversionPct: number;
}

export interface HermesPerformanceReview {
  assessment: string;
  topStrategy: string;
  bestRegime: string;
  weakestRegime: string;
}

export const mockAnalyticsSummary: AnalyticsSummary = {
  netPnl: 2480,
  netReturn: 24.8,
  maxDrawdown: -8.4,
  winRate: 64.1,
  profitFactor: 1.84,
  expectancy: 0.42,
  sharpeStyle: 1.72,
  sortinoStyle: 2.31,
  calmarStyle: 2.95,
  tradeCount: 184,
  winningTrades: 118,
  losingTrades: 66,
  averageWinner: 1.38,
  averageLoser: -0.91,
  largestWinner: 3.8,
  largestLoser: -2.1,
  averageHoldingTime: "7h 24m",
  fees: 184,
  slippage: 92,
  grossPnl: 2756,
  costImpact: -276,
};

export const mockEquityBenchmark: EquityBenchmarkPoint[] = [
  { time: "Jun 01", equity: 10000, btcHold: 10000, ethHold: 10000 },
  { time: "Jun 15", equity: 10320, btcHold: 10180, ethHold: 10090 },
  { time: "Jul 01", equity: 10640, btcHold: 10420, ethHold: 10210 },
  { time: "Jul 15", equity: 10980, btcHold: 10680, ethHold: 10350 },
  { time: "Aug 01", equity: 11420, btcHold: 11100, ethHold: 10740 },
  { time: "Aug 15", equity: 11890, btcHold: 11350, ethHold: 10920 },
  { time: "Aug 25", equity: 12150, btcHold: 11620, ethHold: 11080 },
  { time: "Sep 01", equity: 12480, btcHold: 11810, ethHold: 11170 },
];

export const mockDrawdownAnalysis: DrawdownAnalysisData = {
  currentDrawdown: -1.2,
  maxDrawdown: -8.4,
  averageDrawdown: -2.7,
  longestDrawdown: "34 days",
  recoveryTime: "19 days",
  curve: [
    { time: "Jun 01", value: 0 },
    { time: "Jun 15", value: -0.8 },
    { time: "Jul 01", value: 0 },
    { time: "Jul 15", value: -1.4 },
    { time: "Aug 01", value: -8.4 },
    { time: "Aug 15", value: -3.2 },
    { time: "Aug 25", value: -0.5 },
    { time: "Sep 01", value: -1.2 },
  ],
};

export const mockMonthlyReturns: PeriodReturn[] = [
  { period: "Jan 2026", returnPct: 4.2, pnl: 420, trades: 24, winRate: 66.7 },
  { period: "Feb 2026", returnPct: 2.1, pnl: 215, trades: 19, winRate: 58.0 },
  { period: "Mar 2026", returnPct: -1.8, pnl: -185, trades: 22, winRate: 50.0 },
  { period: "Apr 2026", returnPct: 6.4, pnl: 660, trades: 28, winRate: 71.4 },
  { period: "May 2026", returnPct: 3.2, pnl: 340, trades: 20, winRate: 65.0 },
  { period: "Jun 2026", returnPct: 5.7, pnl: 610, trades: 26, winRate: 69.2 },
  { period: "Jul 2026", returnPct: 2.4, pnl: 265, trades: 21, winRate: 61.9 },
  { period: "Aug 2026", returnPct: 2.8, pnl: 310, trades: 24, winRate: 62.5 },
];

export const mockPnlDistribution: DistributionBucket[] = [
  { range: "<-2.0R", count: 8, type: "loss" },
  { range: "-2.0R to -1.0R", count: 24, type: "loss" },
  { range: "-1.0R to 0R", count: 34, type: "loss" },
  { range: "0R to +1.0R", count: 42, type: "win" },
  { range: "+1.0R to +2.0R", count: 48, type: "win" },
  { range: "+2.0R to +3.0R", count: 19, type: "win" },
  { range: ">+3.0R", count: 9, type: "win" },
];

export const mockStrategyPerformance: StrategyAnalyticsItem[] = [
  {
    id: "STRAT-001",
    name: "Breakout Continuation",
    version: "v1.3",
    trades: 84,
    netPnl: 1420,
    returnPct: 14.2,
    winRate: 66.0,
    profitFactor: 1.94,
    maxDrawdown: -6.2,
    expectancy: 0.48,
    status: "Active",
  },
  {
    id: "STRAT-002",
    name: "Trend Momentum Alpha",
    version: "v2.1",
    trades: 61,
    netPnl: 820,
    returnPct: 8.2,
    winRate: 62.0,
    profitFactor: 1.71,
    maxDrawdown: -5.1,
    expectancy: 0.37,
    status: "Active",
  },
  {
    id: "STRAT-005",
    name: "Mean Reversion Bollinger",
    version: "v1.1",
    trades: 39,
    netPnl: 240,
    returnPct: 2.4,
    winRate: 59.0,
    profitFactor: 1.21,
    maxDrawdown: -4.8,
    expectancy: 0.14,
    status: "Validation",
  },
];

export const mockAssetPerformance: AssetAnalyticsItem[] = [
  { asset: "BTC/USDT", trades: 112, netPnl: 1820, returnPct: 18.2, profitFactor: 1.91, winRate: 65.2 },
  { asset: "ETH/USDT", trades: 72, netPnl: 660, returnPct: 6.6, profitFactor: 1.52, winRate: 62.5 },
];

export const mockTimeframePerformance: TimeframeAnalyticsItem[] = [
  { timeframe: "15M", trades: 42, returnPct: 3.2, profitFactor: 1.21 },
  { timeframe: "1H", trades: 91, returnPct: 14.7, profitFactor: 1.92 },
  { timeframe: "4H", trades: 38, returnPct: 5.1, profitFactor: 1.55 },
  { timeframe: "1D", trades: 13, returnPct: 1.8, profitFactor: 1.31 },
];

export const mockRegimePerformance: RegimeAnalyticsItem[] = [
  { regime: "Trending Bullish", returnPct: 18.2, profitFactor: 2.10, tradeCount: 72, winRate: 69.4 },
  { regime: "Ranging Consolidation", returnPct: 3.8, profitFactor: 1.22, tradeCount: 61, winRate: 57.4 },
  { regime: "High Volatility Expansion", returnPct: -1.7, profitFactor: 0.91, tradeCount: 31, winRate: 45.2 },
  { regime: "Low Volatility Drift", returnPct: 4.5, profitFactor: 1.44, tradeCount: 20, winRate: 65.0 },
];

export const mockDirectionalPerformance: DirectionalAnalytics = {
  long: { trades: 122, winRate: 66.0, netPnl: 1940, profitFactor: 1.93 },
  short: { trades: 62, winRate: 60.0, netPnl: 540, profitFactor: 1.62 },
};

export const mockConsistencyMetrics: ConsistencyMetrics = {
  profitableDaysRatio: "61 / 90 days (67.7%)",
  profitableWeeksRatio: "12 / 13 weeks (92.3%)",
  profitableMonthsRatio: "7 / 8 months (87.5%)",
  winningStreak: 9,
  losingStreak: 4,
  averageMonthlyReturn: 3.1,
};

export const mockConfidenceCalibration: ConfidenceCalibrationItem[] = [
  { range: "50–60%", winRate: 54.0, trades: 31 },
  { range: "60–70%", winRate: 61.0, trades: 48 },
  { range: "70–80%", winRate: 72.0, trades: 67 },
  { range: "80–90%", winRate: 81.0, trades: 29 },
  { range: "90%+", winRate: 88.0, trades: 9 },
];

export const mockHermesFunnelStages: HermesFunnelStage[] = [
  { stage: "Detected Opportunities", count: 428, conversionPct: 100 },
  { stage: "Deep Investigations", count: 176, conversionPct: 41.1 },
  { stage: "Trade Proposals", count: 92, conversionPct: 21.5 },
  { stage: "Risk Approved", count: 71, conversionPct: 16.6 },
  { stage: "Owner Approved", count: 64, conversionPct: 15.0 },
  { stage: "Paper Executed", count: 64, conversionPct: 15.0 },
  { stage: "Profitable Exits", count: 41, conversionPct: 9.6 },
];

export const mockHermesPerformanceReview: HermesPerformanceReview = {
  assessment: "Systematic alpha generation is steady across the 90-day paper window. Strongest results persist on 1H BTC/USDT trending breakouts, while high-volatility sideways chop displays slight fee sensitivity.",
  topStrategy: "Breakout Continuation v1.3 (+14.2%, PF 1.94)",
  bestRegime: "Trending Bullish (+18.2%, PF 2.10)",
  weakestRegime: "High Volatility Expansion (-1.7%, PF 0.91)",
};
