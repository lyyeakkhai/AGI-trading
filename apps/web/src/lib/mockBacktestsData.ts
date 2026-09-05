export interface BacktestEquityPoint {
  time: string;
  value: number;
}

export interface BacktestDrawdownPoint {
  time: string;
  value: number;
}

export interface BacktestTrade {
  id: string;
  date: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  rMultiple: number;
  duration: string;
  exitReason: "Target" | "Stop" | "Trailing Stop" | "Time Limit" | "Signal Invalidation";
}

export interface RegimeResult {
  regime: string;
  returnPct: number;
  profitFactor: number;
  tradeCount: number;
  winRate: number;
}

export interface TimeframeResult {
  timeframe: string;
  returnPct: number;
  profitFactor: number;
  tested: boolean;
}

export interface AssetResult {
  asset: string;
  returnPct: number;
  profitFactor: number;
  trades: number;
}

export interface OOSResult {
  trainingPeriod: string;
  testingPeriod: string;
  trainingReturn: number;
  oosReturn: number;
  oosProfitFactor: number;
  oosMaxDrawdown: number;
  status: "PASS" | "FAIL" | "INCONCLUSIVE";
}

export interface WalkForwardWindow {
  id: string;
  name: string;
  status: "PASS" | "FAIL";
  returnPct: number;
  pf: number;
}

export interface ValidationAssessment {
  historicalBacktest: "PASS" | "FAIL";
  outOfSample: "PASS" | "FAIL";
  walkForward: "PASS" | "FAIL";
  costsIncluded: "PASS" | "FAIL";
  dataCoverage: "PASS" | "FAIL";
  summary: string;
  readiness: "READY FOR PAPER TRADING" | "REQUIRES REFINEMENT" | "REJECTED";
}

export interface HermesBacktestReview {
  status: "Reviewing" | "Validated" | "Flagged";
  assessment: string;
  recommendation: string;
}

export type BacktestStatus = "draft" | "queued" | "running" | "completed" | "failed" | "cancelled";

export interface BacktestRecord {
  id: string;
  strategyId: string;
  strategyName: string;
  strategyVersion: string;
  market: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalEquity: number;
  grossPnl: number;
  netPnl: number;
  netReturn: number;
  maxDrawdown: number;
  averageDrawdown: number;
  longestDrawdown: string;
  winRate: number;
  profitFactor: number;
  expectancy: number; // R
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  averageWinner: number; // R
  averageLoser: number; // R
  largestWinner: number; // R
  largestLoser: number; // R
  averageHoldingTime: string;
  fees: number;
  slippage: number;
  executionModel: string;
  status: BacktestStatus;
  createdAt: string;
  equityCurve: BacktestEquityPoint[];
  drawdownCurve: BacktestDrawdownPoint[];
  trades: BacktestTrade[];
  regimePerformance: RegimeResult[];
  timeframePerformance: TimeframeResult[];
  assetPerformance: AssetResult[];
  oosResults: OOSResult;
  walkForwardResults: {
    windows: WalkForwardWindow[];
    overall: "PASS" | "FAIL";
  };
  validationAssessment: ValidationAssessment;
  hermesReview: HermesBacktestReview;
}

// Generate realistic mock trades
const sampleTradesBT42: BacktestTrade[] = [
  { id: "TR-001", date: "2025-01-04 14:00", symbol: "BTC/USDT", side: "LONG", entryPrice: 42180, exitPrice: 43020, pnl: 84.0, rMultiple: 1.2, duration: "6h 15m", exitReason: "Target" },
  { id: "TR-002", date: "2025-01-06 09:30", symbol: "BTC/USDT", side: "LONG", entryPrice: 43210, exitPrice: 42780, pnl: -43.0, rMultiple: -0.6, duration: "3h 40m", exitReason: "Stop" },
  { id: "TR-003", date: "2025-01-11 18:00", symbol: "BTC/USDT", side: "LONG", entryPrice: 44100, exitPrice: 45850, pnl: 175.0, rMultiple: 2.1, duration: "14h 20m", exitReason: "Target" },
  { id: "TR-004", date: "2025-01-17 04:15", symbol: "BTC/USDT", side: "SHORT", entryPrice: 46200, exitPrice: 45400, pnl: 80.0, rMultiple: 1.1, duration: "5h 10m", exitReason: "Target" },
  { id: "TR-005", date: "2025-01-22 11:45", symbol: "BTC/USDT", side: "LONG", entryPrice: 45800, exitPrice: 45150, pnl: -65.0, rMultiple: -0.9, duration: "4h 05m", exitReason: "Stop" },
  { id: "TR-006", date: "2025-02-01 16:30", symbol: "BTC/USDT", side: "LONG", entryPrice: 47250, exitPrice: 49100, pnl: 185.0, rMultiple: 2.4, duration: "18h 30m", exitReason: "Target" },
  { id: "TR-007", date: "2025-02-08 08:20", symbol: "BTC/USDT", side: "SHORT", entryPrice: 48900, exitPrice: 48300, pnl: 60.0, rMultiple: 0.9, duration: "4h 45m", exitReason: "Trailing Stop" },
  { id: "TR-008", date: "2025-02-14 20:10", symbol: "BTC/USDT", side: "LONG", entryPrice: 51200, exitPrice: 50600, pnl: -60.0, rMultiple: -0.8, duration: "2h 50m", exitReason: "Stop" },
  { id: "TR-009", date: "2025-02-23 13:00", symbol: "BTC/USDT", side: "LONG", entryPrice: 52400, exitPrice: 54900, pnl: 250.0, rMultiple: 3.1, duration: "22h 10m", exitReason: "Target" },
  { id: "TR-010", date: "2025-03-05 10:00", symbol: "BTC/USDT", side: "SHORT", entryPrice: 56100, exitPrice: 55450, pnl: 65.0, rMultiple: 1.0, duration: "6h 00m", exitReason: "Target" },
  { id: "TR-011", date: "2025-03-12 17:15", symbol: "BTC/USDT", side: "LONG", entryPrice: 57800, exitPrice: 57200, pnl: -60.0, rMultiple: -0.8, duration: "3h 15m", exitReason: "Stop" },
  { id: "TR-012", date: "2025-03-24 07:45", symbol: "BTC/USDT", side: "LONG", entryPrice: 59300, exitPrice: 61800, pnl: 250.0, rMultiple: 3.0, duration: "16h 40m", exitReason: "Target" },
  { id: "TR-013", date: "2025-04-02 22:30", symbol: "BTC/USDT", side: "SHORT", entryPrice: 62400, exitPrice: 63100, pnl: -70.0, rMultiple: -0.9, duration: "5h 12m", exitReason: "Stop" },
  { id: "TR-014", date: "2025-04-15 15:00", symbol: "BTC/USDT", side: "LONG", entryPrice: 60500, exitPrice: 62100, pnl: 160.0, rMultiple: 1.8, duration: "8h 20m", exitReason: "Target" },
  { id: "TR-015", date: "2025-05-01 12:10", symbol: "BTC/USDT", side: "LONG", entryPrice: 61200, exitPrice: 62450, pnl: 125.0, rMultiple: 1.4, duration: "9h 35m", exitReason: "Target" },
  { id: "TR-016", date: "2025-05-18 06:40", symbol: "BTC/USDT", side: "SHORT", entryPrice: 64100, exitPrice: 63500, pnl: 60.0, rMultiple: 0.8, duration: "4h 15m", exitReason: "Trailing Stop" },
  { id: "TR-017", date: "2025-06-04 19:25", symbol: "BTC/USDT", side: "LONG", entryPrice: 65200, exitPrice: 64600, pnl: -60.0, rMultiple: -0.8, duration: "2h 45m", exitReason: "Stop" },
  { id: "TR-018", date: "2025-06-20 03:50", symbol: "BTC/USDT", side: "LONG", entryPrice: 64800, exitPrice: 67300, pnl: 250.0, rMultiple: 3.2, duration: "21h 00m", exitReason: "Target" },
  { id: "TR-019", date: "2025-07-10 11:15", symbol: "BTC/USDT", side: "SHORT", entryPrice: 66900, exitPrice: 66350, pnl: 55.0, rMultiple: 0.7, duration: "4h 30m", exitReason: "Target" },
  { id: "TR-020", date: "2025-08-01 14:40", symbol: "BTC/USDT", side: "LONG", entryPrice: 68100, exitPrice: 69800, pnl: 170.0, rMultiple: 2.0, duration: "12h 10m", exitReason: "Target" },
];

// Generate equity curve points for BT-0042 (Jan 2025 - Aug 2026)
const sampleEquityBT42: BacktestEquityPoint[] = [
  { time: "2025-01-01", value: 10000 },
  { time: "2025-01-15", value: 10216 },
  { time: "2025-02-01", value: 10390 },
  { time: "2025-02-15", value: 10580 },
  { time: "2025-03-01", value: 10510 },
  { time: "2025-03-15", value: 10790 },
  { time: "2025-04-01", value: 11040 },
  { time: "2025-04-15", value: 10970 },
  { time: "2025-05-01", value: 11210 },
  { time: "2025-05-15", value: 11380 },
  { time: "2025-06-01", value: 11310 },
  { time: "2025-06-15", value: 11620 },
  { time: "2025-07-01", value: 11540 },
  { time: "2025-07-15", value: 11780 },
  { time: "2025-08-01", value: 11950 },
  { time: "2025-08-15", value: 11820 },
  { time: "2025-09-01", value: 12050 },
  { time: "2025-09-15", value: 12190 },
  { time: "2025-10-01", value: 12010 },
  { time: "2025-10-15", value: 12280 },
  { time: "2025-11-01", value: 12450 },
  { time: "2025-11-15", value: 12380 },
  { time: "2025-12-01", value: 12590 },
  { time: "2025-12-15", value: 12710 },
  { time: "2026-01-01", value: 12620 },
  { time: "2026-01-15", value: 12840 },
  { time: "2026-02-01", value: 12750 },
  { time: "2026-02-15", value: 12980 },
  { time: "2026-03-01", value: 12890 },
  { time: "2026-03-15", value: 12050 }, // temporary drawdown
  { time: "2026-04-01", value: 12240 },
  { time: "2026-04-15", value: 12410 },
  { time: "2026-05-01", value: 12560 },
  { time: "2026-05-15", value: 12390 },
  { time: "2026-06-01", value: 12610 },
  { time: "2026-06-15", value: 12780 },
  { time: "2026-07-01", value: 12650 },
  { time: "2026-07-15", value: 12890 },
  { time: "2026-08-01", value: 12420 },
  { time: "2026-08-15", value: 12450 },
  { time: "2026-08-31", value: 12480 },
];

const sampleDrawdownBT42: BacktestDrawdownPoint[] = [
  { time: "2025-01-01", value: 0 },
  { time: "2025-01-15", value: 0 },
  { time: "2025-02-01", value: 0 },
  { time: "2025-02-15", value: 0 },
  { time: "2025-03-01", value: -0.66 },
  { time: "2025-03-15", value: 0 },
  { time: "2025-04-01", value: 0 },
  { time: "2025-04-15", value: -0.63 },
  { time: "2025-05-01", value: 0 },
  { time: "2025-05-15", value: 0 },
  { time: "2025-06-01", value: -0.62 },
  { time: "2025-06-15", value: 0 },
  { time: "2025-07-01", value: -0.69 },
  { time: "2025-07-15", value: 0 },
  { time: "2025-08-01", value: 0 },
  { time: "2025-08-15", value: -1.09 },
  { time: "2025-09-01", value: 0 },
  { time: "2025-09-15", value: 0 },
  { time: "2025-10-01", value: -1.48 },
  { time: "2025-10-15", value: 0 },
  { time: "2025-11-01", value: 0 },
  { time: "2025-11-15", value: -0.56 },
  { time: "2025-12-01", value: 0 },
  { time: "2025-12-15", value: 0 },
  { time: "2026-01-01", value: -0.71 },
  { time: "2026-01-15", value: 0 },
  { time: "2026-02-01", value: -0.70 },
  { time: "2026-02-15", value: 0 },
  { time: "2026-03-01", value: -0.69 },
  { time: "2026-03-15", value: -7.16 },
  { time: "2026-04-01", value: -5.70 },
  { time: "2026-04-15", value: -4.39 },
  { time: "2026-05-01", value: -3.24 },
  { time: "2026-05-15", value: -4.55 },
  { time: "2026-06-01", value: -2.85 },
  { time: "2026-06-15", value: -1.54 },
  { time: "2026-07-01", value: -2.54 },
  { time: "2026-07-15", value: -0.69 },
  { time: "2026-08-01", value: -4.31 },
  { time: "2026-08-15", value: -4.08 },
  { time: "2026-08-31", value: -3.85 },
];

export const mockBacktestsData: BacktestRecord[] = [
  {
    id: "BT-0042",
    strategyId: "STRAT-001",
    strategyName: "Breakout Continuation",
    strategyVersion: "v1.3",
    market: "BTC/USDT",
    timeframe: "1H",
    startDate: "2025-01-01",
    endDate: "2026-08-31",
    initialCapital: 10000,
    finalEquity: 12480,
    grossPnl: 2756,
    netPnl: 2480,
    netReturn: 24.8,
    maxDrawdown: -8.4,
    averageDrawdown: -2.7,
    longestDrawdown: "34 days",
    winRate: 64.1,
    profitFactor: 1.84,
    expectancy: 0.42,
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
    executionModel: "Simulated (Maker 0.02% / Taker 0.05% + 0.05% Slippage)",
    status: "completed",
    createdAt: "2026-09-02T14:20:00Z",
    equityCurve: sampleEquityBT42,
    drawdownCurve: sampleDrawdownBT42,
    trades: sampleTradesBT42,
    regimePerformance: [
      { regime: "Trending Bullish", returnPct: 18.2, profitFactor: 2.10, tradeCount: 72, winRate: 69.4 },
      { regime: "Ranging Consolidation", returnPct: 3.8, profitFactor: 1.22, tradeCount: 61, winRate: 57.4 },
      { regime: "High Volatility Expansion", returnPct: -1.7, profitFactor: 0.91, tradeCount: 31, winRate: 45.2 },
      { regime: "Low Volatility Drift", returnPct: 4.5, profitFactor: 1.44, tradeCount: 20, winRate: 65.0 },
    ],
    timeframePerformance: [
      { timeframe: "15M", returnPct: 4.2, profitFactor: 1.18, tested: true },
      { timeframe: "1H", returnPct: 14.7, profitFactor: 1.92, tested: true },
      { timeframe: "4H", returnPct: 5.9, profitFactor: 1.54, tested: true },
      { timeframe: "1D", returnPct: 0.0, profitFactor: 0.0, tested: false },
    ],
    assetPerformance: [
      { asset: "BTC/USDT", returnPct: 18.7, profitFactor: 1.94, trades: 120 },
      { asset: "ETH/USDT", returnPct: 6.1, profitFactor: 1.42, trades: 64 },
    ],
    oosResults: {
      trainingPeriod: "2025-01-01 → 2025-12-31",
      testingPeriod: "2026-01-01 → 2026-08-31",
      trainingReturn: 19.4,
      oosReturn: 11.2,
      oosProfitFactor: 1.63,
      oosMaxDrawdown: -7.2,
      status: "PASS",
    },
    walkForwardResults: {
      windows: [
        { id: "W1", name: "Window 01 (Q1 2025)", status: "PASS", returnPct: 5.8, pf: 1.72 },
        { id: "W2", name: "Window 02 (Q2 2025)", status: "PASS", returnPct: 6.4, pf: 1.89 },
        { id: "W3", name: "Window 03 (Q3 2025)", status: "PASS", returnPct: 4.1, pf: 1.48 },
        { id: "W4", name: "Window 04 (Q4 2025)", status: "PASS", returnPct: 7.2, pf: 2.05 },
        { id: "W5", name: "Window 05 (H1 2026)", status: "PASS", returnPct: 5.2, pf: 1.61 },
      ],
      overall: "PASS",
    },
    validationAssessment: {
      historicalBacktest: "PASS",
      outOfSample: "PASS",
      walkForward: "PASS",
      costsIncluded: "PASS",
      dataCoverage: "PASS",
      summary: "Results meet the current mock validation thresholds (PF > 1.5, Max DD < 15%, OOS Stability > 50%) and may proceed to paper trading evaluation.",
      readiness: "READY FOR PAPER TRADING",
    },
    hermesReview: {
      status: "Validated",
      assessment: "Historical performance remains positive after modeled fees and slippage ($276 total degradation). Regime breakdown shows stable alpha in trending phases, but slight vulnerability in high-volatility spikes.",
      recommendation: "Approved for Paper Trading gate with 1.0% maximum risk allocation per position.",
    },
  },
  {
    id: "BT-0041",
    strategyId: "STRAT-002",
    strategyName: "Trend Momentum Alpha",
    strategyVersion: "v2.1",
    market: "ETH/USDT",
    timeframe: "4H",
    startDate: "2025-01-01",
    endDate: "2026-08-31",
    initialCapital: 10000,
    finalEquity: 11720,
    grossPnl: 1980,
    netPnl: 1720,
    netReturn: 17.2,
    maxDrawdown: -7.1,
    averageDrawdown: -2.3,
    longestDrawdown: "28 days",
    winRate: 61.2,
    profitFactor: 1.59,
    expectancy: 0.31,
    tradeCount: 121,
    winningTrades: 74,
    losingTrades: 47,
    averageWinner: 1.25,
    averageLoser: -0.85,
    largestWinner: 3.4,
    largestLoser: -1.8,
    averageHoldingTime: "18h 40m",
    fees: 160,
    slippage: 100,
    executionModel: "Simulated (Taker 0.05% + 0.06% Slippage)",
    status: "completed",
    createdAt: "2026-09-01T11:00:00Z",
    equityCurve: [
      { time: "2025-01-01", value: 10000 },
      { time: "2025-03-01", value: 10320 },
      { time: "2025-06-01", value: 10840 },
      { time: "2025-09-01", value: 11150 },
      { time: "2025-12-01", value: 11420 },
      { time: "2026-03-01", value: 11210 },
      { time: "2026-06-01", value: 11590 },
      { time: "2026-08-31", value: 11720 },
    ],
    drawdownCurve: [
      { time: "2025-01-01", value: 0 },
      { time: "2025-03-01", value: 0 },
      { time: "2025-06-01", value: 0 },
      { time: "2025-09-01", value: -1.2 },
      { time: "2025-12-01", value: 0 },
      { time: "2026-03-01", value: -5.4 },
      { time: "2026-06-01", value: 0 },
      { time: "2026-08-31", value: -1.1 },
    ],
    trades: sampleTradesBT42.slice(0, 15).map((t, idx) => ({ ...t, id: `TR-ETH-${idx+1}`, symbol: "ETH/USDT", entryPrice: 2800 + idx * 40, exitPrice: 2880 + idx * 40 })),
    regimePerformance: [
      { regime: "Trending Bullish", returnPct: 14.5, profitFactor: 1.85, tradeCount: 65, winRate: 66.2 },
      { regime: "Ranging Consolidation", returnPct: 1.2, profitFactor: 1.05, tradeCount: 34, winRate: 52.9 },
      { regime: "High Volatility Expansion", returnPct: -2.1, profitFactor: 0.88, tradeCount: 14, winRate: 42.8 },
      { regime: "Low Volatility Drift", returnPct: 3.6, profitFactor: 1.35, tradeCount: 8, winRate: 62.5 },
    ],
    timeframePerformance: [
      { timeframe: "1H", returnPct: 6.2, profitFactor: 1.22, tested: true },
      { timeframe: "4H", returnPct: 17.2, profitFactor: 1.59, tested: true },
      { timeframe: "1D", returnPct: 8.4, profitFactor: 1.41, tested: true },
    ],
    assetPerformance: [
      { asset: "ETH/USDT", returnPct: 17.2, profitFactor: 1.59, trades: 121 },
    ],
    oosResults: {
      trainingPeriod: "2025-01-01 → 2025-12-31",
      testingPeriod: "2026-01-01 → 2026-08-31",
      trainingReturn: 12.8,
      oosReturn: 8.4,
      oosProfitFactor: 1.48,
      oosMaxDrawdown: -6.2,
      status: "PASS",
    },
    walkForwardResults: {
      windows: [
        { id: "W1", name: "Window 01", status: "PASS", returnPct: 4.2, pf: 1.52 },
        { id: "W2", name: "Window 02", status: "PASS", returnPct: 5.1, pf: 1.64 },
        { id: "W3", name: "Window 03", status: "PASS", returnPct: 3.8, pf: 1.45 },
      ],
      overall: "PASS",
    },
    validationAssessment: {
      historicalBacktest: "PASS",
      outOfSample: "PASS",
      walkForward: "PASS",
      costsIncluded: "PASS",
      dataCoverage: "PASS",
      summary: "Trend confirmation gates prevent chop losses; out-of-sample performance retention is 65.6%.",
      readiness: "READY FOR PAPER TRADING",
    },
    hermesReview: {
      status: "Validated",
      assessment: "Reliable trend continuation characteristics on 4H ETH/USDT. Drawdowns remain modest and recover within 4 weeks.",
      recommendation: "Approved for Paper Trading.",
    },
  },
  {
    id: "BT-0040",
    strategyId: "STRAT-005",
    strategyName: "Mean Reversion Bollinger",
    strategyVersion: "v1.1",
    market: "ETH/USDT",
    timeframe: "1H",
    startDate: "2025-01-01",
    endDate: "2026-08-31",
    initialCapital: 10000,
    finalEquity: 10680,
    grossPnl: 1140,
    netPnl: 680,
    netReturn: 6.8,
    maxDrawdown: -12.4,
    averageDrawdown: -4.8,
    longestDrawdown: "62 days",
    winRate: 54.2,
    profitFactor: 1.28,
    expectancy: 0.14,
    tradeCount: 210,
    winningTrades: 114,
    losingTrades: 96,
    averageWinner: 1.05,
    averageLoser: -0.92,
    largestWinner: 2.2,
    largestLoser: -2.8,
    averageHoldingTime: "4h 15m",
    fees: 310,
    slippage: 150,
    executionModel: "Simulated (Taker 0.05% + 0.05% Slippage)",
    status: "completed",
    createdAt: "2026-08-28T09:15:00Z",
    equityCurve: [
      { time: "2025-01-01", value: 10000 },
      { time: "2025-04-01", value: 10450 },
      { time: "2025-08-01", value: 10120 },
      { time: "2025-12-01", value: 10580 },
      { time: "2026-04-01", value: 9890 },
      { time: "2026-08-31", value: 10680 },
    ],
    drawdownCurve: [
      { time: "2025-01-01", value: 0 },
      { time: "2025-04-01", value: 0 },
      { time: "2025-08-01", value: -6.5 },
      { time: "2025-12-01", value: 0 },
      { time: "2026-04-01", value: -12.4 },
      { time: "2026-08-31", value: -3.2 },
    ],
    trades: sampleTradesBT42.slice(0, 12).map((t, idx) => ({ ...t, id: `TR-MR-${idx+1}`, pnl: (idx % 2 === 0 ? 45 : -40) })),
    regimePerformance: [
      { regime: "Trending Bullish", returnPct: -4.2, profitFactor: 0.81, tradeCount: 80, winRate: 45.0 },
      { regime: "Ranging Consolidation", returnPct: 12.8, profitFactor: 1.84, tradeCount: 95, winRate: 64.2 },
      { regime: "High Volatility Expansion", returnPct: -6.4, profitFactor: 0.65, tradeCount: 25, winRate: 36.0 },
      { regime: "Low Volatility Drift", returnPct: 4.6, profitFactor: 1.41, tradeCount: 10, winRate: 60.0 },
    ],
    timeframePerformance: [
      { timeframe: "15M", returnPct: 2.1, profitFactor: 1.08, tested: true },
      { timeframe: "1H", returnPct: 6.8, profitFactor: 1.28, tested: true },
    ],
    assetPerformance: [
      { asset: "ETH/USDT", returnPct: 6.8, profitFactor: 1.28, trades: 210 },
    ],
    oosResults: {
      trainingPeriod: "2025-01-01 → 2025-12-31",
      testingPeriod: "2026-01-01 → 2026-08-31",
      trainingReturn: 8.4,
      oosReturn: 1.2,
      oosProfitFactor: 1.09,
      oosMaxDrawdown: -12.4,
      status: "FAIL",
    },
    walkForwardResults: {
      windows: [
        { id: "W1", name: "Window 01", status: "PASS", returnPct: 3.1, pf: 1.35 },
        { id: "W2", name: "Window 02", status: "FAIL", returnPct: -1.8, pf: 0.89 },
        { id: "W3", name: "Window 03", status: "PASS", returnPct: 2.4, pf: 1.22 },
      ],
      overall: "FAIL",
    },
    validationAssessment: {
      historicalBacktest: "PASS",
      outOfSample: "FAIL",
      walkForward: "FAIL",
      costsIncluded: "PASS",
      dataCoverage: "PASS",
      summary: "Strategy suffers severe degradation during strong macro trends (-4.2% return in trending regimes). OOS profit factor decayed to 1.09.",
      readiness: "REQUIRES REFINEMENT",
    },
    hermesReview: {
      status: "Flagged",
      assessment: "Mean reversion fails during persistent expansion regimes. Stop loss sizing is insufficient to absorb momentum breakouts without regime filter gating.",
      recommendation: "Do not promote to paper trading. Add ADX or volatility regime filter to disable signals when ADX > 25.",
    },
  },
  {
    id: "BT-0039",
    strategyId: "STRAT-006",
    strategyName: "Liquidity Sweep Hunter",
    strategyVersion: "v0.4",
    market: "BTC/USDT",
    timeframe: "5M",
    startDate: "2025-06-01",
    endDate: "2026-08-31",
    initialCapital: 10000,
    finalEquity: 9120,
    grossPnl: -220,
    netPnl: -880,
    netReturn: -8.8,
    maxDrawdown: -16.8,
    averageDrawdown: -6.9,
    longestDrawdown: "84 days",
    winRate: 48.1,
    profitFactor: 0.84,
    expectancy: -0.18,
    tradeCount: 420,
    winningTrades: 202,
    losingTrades: 218,
    averageWinner: 0.88,
    averageLoser: -1.02,
    largestWinner: 2.1,
    largestLoser: -3.4,
    averageHoldingTime: "45m",
    fees: 440,
    slippage: 220,
    executionModel: "Simulated (Taker 0.05% + 0.05% Slippage)",
    status: "failed",
    createdAt: "2026-08-20T16:45:00Z",
    equityCurve: [
      { time: "2025-06-01", value: 10000 },
      { time: "2025-09-01", value: 9850 },
      { time: "2025-12-01", value: 9540 },
      { time: "2026-03-01", value: 9280 },
      { time: "2026-06-01", value: 8940 },
      { time: "2026-08-31", value: 9120 },
    ],
    drawdownCurve: [
      { time: "2025-06-01", value: 0 },
      { time: "2025-09-01", value: -2.5 },
      { time: "2025-12-01", value: -6.4 },
      { time: "2026-03-01", value: -10.2 },
      { time: "2026-06-01", value: -16.8 },
      { time: "2026-08-31", value: -14.2 },
    ],
    trades: sampleTradesBT42.slice(0, 10).map((t, idx) => ({ ...t, id: `TR-SWP-${idx+1}`, pnl: -40 - idx * 5, rMultiple: -0.8 })),
    regimePerformance: [
      { regime: "Trending Bullish", returnPct: -7.2, profitFactor: 0.74, tradeCount: 160, winRate: 42.1 },
      { regime: "Ranging Consolidation", returnPct: 2.1, profitFactor: 1.08, tradeCount: 180, winRate: 52.2 },
      { regime: "High Volatility Expansion", returnPct: -4.8, profitFactor: 0.62, tradeCount: 80, winRate: 38.4 },
    ],
    timeframePerformance: [
      { timeframe: "5M", returnPct: -8.8, profitFactor: 0.84, tested: true },
    ],
    assetPerformance: [
      { asset: "BTC/USDT", returnPct: -8.8, profitFactor: 0.84, trades: 420 },
    ],
    oosResults: {
      trainingPeriod: "2025-06-01 → 2025-12-31",
      testingPeriod: "2026-01-01 → 2026-08-31",
      trainingReturn: -2.4,
      oosReturn: -6.4,
      oosProfitFactor: 0.79,
      oosMaxDrawdown: -16.8,
      status: "FAIL",
    },
    walkForwardResults: {
      windows: [
        { id: "W1", name: "Window 01", status: "FAIL", returnPct: -1.2, pf: 0.88 },
        { id: "W2", name: "Window 02", status: "FAIL", returnPct: -3.4, pf: 0.72 },
      ],
      overall: "FAIL",
    },
    validationAssessment: {
      historicalBacktest: "FAIL",
      outOfSample: "FAIL",
      walkForward: "FAIL",
      costsIncluded: "FAIL",
      dataCoverage: "PASS",
      summary: "High turnover (420 trades on 5M) results in excessive fee drag ($660 combined fees & slippage), rendering net edge negative.",
      readiness: "REJECTED",
    },
    hermesReview: {
      status: "Flagged",
      assessment: "Validation rejected. Sub-15M microstructure strategies suffer critical friction degradation under retail fee structures.",
      recommendation: "Reject strategy or redesign for 1H+ timeframes with strict order-flow confirmation.",
    },
  },
  {
    id: "BT-0038",
    strategyId: "STRAT-003",
    strategyName: "High-Frequency Volatility Harvester",
    strategyVersion: "v0.9",
    market: "BTC/USDT",
    timeframe: "15M",
    startDate: "2026-01-01",
    endDate: "2026-08-31",
    initialCapital: 10000,
    finalEquity: 10420,
    grossPnl: 890,
    netPnl: 420,
    netReturn: 4.2,
    maxDrawdown: -5.1,
    averageDrawdown: -1.8,
    longestDrawdown: "14 days",
    winRate: 68.4,
    profitFactor: 1.42,
    expectancy: 0.22,
    tradeCount: 88,
    winningTrades: 60,
    losingTrades: 28,
    averageWinner: 0.92,
    averageLoser: -0.74,
    largestWinner: 2.1,
    largestLoser: -1.4,
    averageHoldingTime: "1h 45m",
    fees: 320,
    slippage: 150,
    executionModel: "Simulated (Taker 0.05% + 0.05% Slippage)",
    status: "running",
    createdAt: "2026-09-04T08:00:00Z",
    equityCurve: [
      { time: "2026-01-01", value: 10000 },
      { time: "2026-03-01", value: 10150 },
      { time: "2026-05-01", value: 10320 },
      { time: "2026-07-01", value: 10280 },
      { time: "2026-08-31", value: 10420 },
    ],
    drawdownCurve: [
      { time: "2026-01-01", value: 0 },
      { time: "2026-03-01", value: 0 },
      { time: "2026-05-01", value: 0 },
      { time: "2026-07-01", value: -2.1 },
      { time: "2026-08-31", value: 0 },
    ],
    trades: sampleTradesBT42.slice(0, 10).map((t, idx) => ({ ...t, id: `TR-HF-${idx+1}`, pnl: 40 })),
    regimePerformance: [
      { regime: "High Volatility Expansion", returnPct: 5.4, profitFactor: 1.62, tradeCount: 52, winRate: 71.1 },
      { regime: "Low Volatility Drift", returnPct: -1.2, profitFactor: 0.88, tradeCount: 36, winRate: 48.0 },
    ],
    timeframePerformance: [
      { timeframe: "15M", returnPct: 4.2, profitFactor: 1.42, tested: true },
    ],
    assetPerformance: [
      { asset: "BTC/USDT", returnPct: 4.2, profitFactor: 1.42, trades: 88 },
    ],
    oosResults: {
      trainingPeriod: "2026-01-01 → 2026-05-31",
      testingPeriod: "2026-06-01 → 2026-08-31",
      trainingReturn: 3.2,
      oosReturn: 1.0,
      oosProfitFactor: 1.34,
      oosMaxDrawdown: -5.1,
      status: "PASS",
    },
    walkForwardResults: {
      windows: [
        { id: "W1", name: "Window 01", status: "PASS", returnPct: 2.1, pf: 1.45 },
      ],
      overall: "PASS",
    },
    validationAssessment: {
      historicalBacktest: "PASS",
      outOfSample: "PASS",
      walkForward: "PASS",
      costsIncluded: "PASS",
      dataCoverage: "PASS",
      summary: "Backtest is currently executing simulation chunk 4 of 6 (66% processed). Interim metrics are consistent with hypothesis.",
      readiness: "REQUIRES REFINEMENT",
    },
    hermesReview: {
      status: "Reviewing",
      assessment: "Hermes is monitoring ongoing simulation. Volatility harvesting performs optimally in macro expansion phases.",
      recommendation: "Awaiting simulation completion before final validation evaluation.",
    },
  },
];
