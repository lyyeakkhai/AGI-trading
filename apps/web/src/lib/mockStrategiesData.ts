/**
 * Centralized Deterministic Mock Data for Task 09: Strategies & Strategy Registry
 * AGI Trading Terminal (Obsidian Intelligence)
 */

export type StrategyStatus = "ACTIVE" | "DRAFT" | "ARCHIVED" | "UNDER_VALIDATION";

export type ValidationStage =
  | "Trading Idea"
  | "Formal Strategy"
  | "Backtest"
  | "Out-of-Sample"
  | "Walk-Forward"
  | "Paper Trading"
  | "Tiny Live"
  | "Performance Evaluation"
  | "Approved";

export type GateStatus = "PASS" | "FAIL" | "IN_PROGRESS" | "NOT_STARTED";
export type StrategyType = "Trend" | "Breakout" | "Mean Reversion" | "Momentum" | "Volatility";

export interface ValidationGate {
  id: string;
  name: string;
  status: GateStatus;
  threshold: string;
  actual: string;
  date?: string;
}

export interface StrategyVersion {
  version: string;
  status: "Active" | "Archived" | "Draft";
  createdAt: string;
  changeSummary: string;
}

export interface StrategyPerformance {
  netReturnPercent: number;
  winRatePercent: number;
  profitFactor: number;
  expectancy: string;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  totalTrades: number;
  avgWinner: string;
  avgLoser: string;
  equityCurve: Array<{ step: number; equity: number }>;
}

export interface StrategyDefinition {
  marketUniverse: string[];
  timeframes: string[];
  description: string;
  entryConditions: string[];
  exitConditions: string[];
  invalidationConditions: string[];
  defaultRiskPercent: number;
  maxRiskPercent: number;
  typicalRR: string;
  maxConcurrentPositions: number;
  preferredRegime: string;
}

export interface StrategyUsage {
  activeOpportunitiesCount: number;
  pendingProposalsCount: number;
  openPositionsCount: number;
  closedPositionsCount: number;
  samplePositions: Array<{
    id: string;
    symbol: string;
    side: "LONG" | "SHORT";
    pnl: number;
    status: "OPEN" | "CLOSED";
  }>;
}

export interface HermesStrategyContext {
  activeMarkets: string[];
  timeframe: string;
  currentUsage: string;
  assessment: string;
}

export interface StrategyItem {
  id: string;
  name: string;
  version: string;
  status: StrategyStatus;
  type: StrategyType;
  primaryMarket: string;
  primaryTimeframe: string;
  validationStage: ValidationStage;
  paperApproved: boolean;
  liveApproved: boolean;
  updatedAt: string;
  updatedTimestamp: number;
  definition: StrategyDefinition;
  validationGates: ValidationGate[];
  performance: StrategyPerformance;
  usage: StrategyUsage;
  versions: StrategyVersion[];
  hermesContext: HermesStrategyContext;
  archiveReason?: string;
}

export interface StrategySummaryMetrics {
  activeStrategies: number;
  paperApproved: number;
  underValidation: number;
  backtested: number;
  liveApproved: number;
}

export interface StrategyFilterState {
  status: string;
  validationStage: string;
  market: string;
  timeframe: string;
  type: string;
  search: string;
  sortBy:
    | "default"
    | "stage"
    | "return-desc"
    | "winrate-desc"
    | "pf-desc"
    | "drawdown-asc"
    | "newest"
    | "name";
}

export const defaultStrategyFilters: StrategyFilterState = {
  status: "All",
  validationStage: "All",
  market: "All",
  timeframe: "All",
  type: "All",
  search: "",
  sortBy: "default",
};

export const mockStrategySummary: StrategySummaryMetrics = {
  activeStrategies: 4,
  paperApproved: 3,
  underValidation: 2,
  backtested: 5,
  liveApproved: 0,
};

export const VALIDATION_STAGES_LIST: ValidationStage[] = [
  "Trading Idea",
  "Formal Strategy",
  "Backtest",
  "Out-of-Sample",
  "Walk-Forward",
  "Paper Trading",
  "Tiny Live",
  "Performance Evaluation",
  "Approved",
];

export const mockStrategies: StrategyItem[] = [
  {
    id: "STRAT-001",
    name: "Breakout Continuation",
    version: "v1.3",
    status: "ACTIVE",
    type: "Trend",
    primaryMarket: "BTC/USDT",
    primaryTimeframe: "1H",
    validationStage: "Paper Trading",
    paperApproved: true,
    liveApproved: false,
    updatedAt: "Today, 10:31 UTC",
    updatedTimestamp: 1725445860000,
    definition: {
      marketUniverse: ["BTC/USDT", "ETH/USDT"],
      timeframes: ["1H", "4H"],
      description:
        "Captures high-conviction structural breakouts above confirmed horizontal resistance levels with expanding spot CVD and volume confirmation.",
      entryConditions: [
        "1H candle close above established 24-hour resistance cluster",
        "Volume exceeds 1.5x of the 20-period moving average",
        "RSI momentum print above 55 without bearish divergence",
      ],
      exitConditions: [
        "Take profit limit order filled at pre-calculated 2.5R target",
        "Stop loss triggered at breakout origin swing low",
        "Trailing stop engages once position exceeds +1.0R gain",
      ],
      invalidationConditions: [
        "15m close back inside pre-breakout structure shelf",
        "Negative CVD delta absorption indicating fakeout",
        "Deterministic portfolio drawdown cap breach",
      ],
      defaultRiskPercent: 0.50,
      maxRiskPercent: 1.00,
      typicalRR: "2.57R",
      maxConcurrentPositions: 2,
      preferredRegime: "Trending / Impulsive Expansion",
    },
    validationGates: [
      {
        id: "GATE-01",
        name: "Historical Backtest (3-Year)",
        status: "PASS",
        threshold: "Sharpe > 1.20, Win Rate > 55%",
        actual: "Sharpe 1.48, Win Rate 64%",
        date: "Aug 12, 2026",
      },
      {
        id: "GATE-02",
        name: "Out-of-Sample Validation",
        status: "PASS",
        threshold: "Profit Factor > 1.40",
        actual: "Profit Factor 1.72",
        date: "Aug 18, 2026",
      },
      {
        id: "GATE-03",
        name: "Walk-Forward Window Analysis",
        status: "PASS",
        threshold: "WFE Ratio > 60%",
        actual: "WFE Ratio 78.4%",
        date: "Aug 24, 2026",
      },
      {
        id: "GATE-04",
        name: "Simulated Paper Trading (30-Day)",
        status: "PASS",
        threshold: "Slippage < 0.08%, Drawdown < 8%",
        actual: "Slippage 0.02%, Max DD 4.2%",
        date: "In Progress (Day 22)",
      },
      {
        id: "GATE-05",
        name: "Tiny Live Capital Pilot",
        status: "NOT_STARTED",
        threshold: "0.10% Capital Allocation Guard",
        actual: "Locked Pending Paper Completion",
      },
      {
        id: "GATE-06",
        name: "Final Performance Evaluation",
        status: "NOT_STARTED",
        threshold: "Owner Signing + Formal Certification",
        actual: "Pending Stage 7",
      },
    ],
    performance: {
      netReturnPercent: 18.4,
      winRatePercent: 64,
      profitFactor: 1.72,
      expectancy: "+0.42R",
      maxDrawdownPercent: 6.8,
      sharpeRatio: 1.48,
      sortinoRatio: 2.11,
      totalTrades: 86,
      avgWinner: "+1.42R",
      avgLoser: "-0.93R",
      equityCurve: [
        { step: 1, equity: 10000 },
        { step: 10, equity: 10240 },
        { step: 20, equity: 10480 },
        { step: 30, equity: 10390 },
        { step: 40, equity: 10750 },
        { step: 50, equity: 11100 },
        { step: 60, equity: 10980 },
        { step: 70, equity: 11450 },
        { step: 80, equity: 11620 },
        { step: 86, equity: 11840 },
      ],
    },
    usage: {
      activeOpportunitiesCount: 3,
      pendingProposalsCount: 2,
      openPositionsCount: 1,
      closedPositionsCount: 12,
      samplePositions: [
        { id: "POS-0081", symbol: "BTC/USDT", side: "LONG", pnl: 22.47, status: "OPEN" },
        { id: "POS-0077", symbol: "BTC/USDT", side: "LONG", pnl: -38.10, status: "CLOSED" },
      ],
    },
    versions: [
      {
        version: "v1.3",
        status: "Active",
        createdAt: "Sep 01, 2026",
        changeSummary: "Adjusted breakout confirmation threshold to require 15m volume filter.",
      },
      {
        version: "v1.2",
        status: "Archived",
        createdAt: "Aug 20, 2026",
        changeSummary: "Tightened stop loss anchor from 20-EMA to structural swing low.",
      },
      {
        version: "v1.1",
        status: "Archived",
        createdAt: "Aug 05, 2026",
        changeSummary: "Initial formal parameter definition and backtesting harness.",
      },
    ],
    hermesContext: {
      activeMarkets: ["BTC/USDT"],
      timeframe: "1H",
      currentUsage: "Actively monitoring 3 opportunities on BTC and ETH orderbooks.",
      assessment:
        "This strategy currently meets its paper-trading validation criteria and remains under active performance observation.",
    },
  },
  {
    id: "STRAT-002",
    name: "Trend Continuation",
    version: "v2.1",
    status: "ACTIVE",
    type: "Trend",
    primaryMarket: "ETH/USDT",
    primaryTimeframe: "4H",
    validationStage: "Walk-Forward",
    paperApproved: true,
    liveApproved: false,
    updatedAt: "Today, 07:15 UTC",
    updatedTimestamp: 1725434100000,
    definition: {
      marketUniverse: ["ETH/USDT", "BTC/USDT"],
      timeframes: ["4H", "1D"],
      description:
        "Follows medium-term macro trends by entering on shallow pullbacks into EMA21/EMA50 confluence ribbons.",
      entryConditions: [
        "Price tests EMA21 after maintaining higher-high structure on 4H",
        "Stochastic RSI crosses upwards from below 30",
        "Funding rate remains within neutral bands (-0.01% to +0.01%)",
      ],
      exitConditions: [
        "Take profit staggered at previous swing high and 2.0R expansion",
        "Stop loss placed below 50-EMA swing pivot",
      ],
      invalidationConditions: [
        "4H candle close below 50-EMA",
        "Macro regime change detected by Hermes risk telemetry",
      ],
      defaultRiskPercent: 0.40,
      maxRiskPercent: 0.80,
      typicalRR: "2.38R",
      maxConcurrentPositions: 2,
      preferredRegime: "Steady Bullish / Bearish Drift",
    },
    validationGates: [
      {
        id: "GATE-01",
        name: "Historical Backtest",
        status: "PASS",
        threshold: "Sharpe > 1.10",
        actual: "Sharpe 1.34",
        date: "Aug 15, 2026",
      },
      {
        id: "GATE-02",
        name: "Out-of-Sample",
        status: "PASS",
        threshold: "Profit Factor > 1.30",
        actual: "Profit Factor 1.54",
        date: "Aug 22, 2026",
      },
      {
        id: "GATE-03",
        name: "Walk-Forward Analysis",
        status: "IN_PROGRESS",
        threshold: "Consistency Score > 70%",
        actual: "Testing Window 4 of 6",
      },
      {
        id: "GATE-04",
        name: "Paper Trading",
        status: "IN_PROGRESS",
        threshold: "30 Paper Trades minimum",
        actual: "18 Trades Executed",
      },
      {
        id: "GATE-05",
        name: "Tiny Live",
        status: "NOT_STARTED",
        threshold: "Gate 3 & 4 Completion",
        actual: "Queued",
      },
      {
        id: "GATE-06",
        name: "Final Evaluation",
        status: "NOT_STARTED",
        threshold: "Sign-off",
        actual: "Pending",
      },
    ],
    performance: {
      netReturnPercent: 14.2,
      winRatePercent: 61,
      profitFactor: 1.54,
      expectancy: "+0.35R",
      maxDrawdownPercent: 5.4,
      sharpeRatio: 1.34,
      sortinoRatio: 1.82,
      totalTrades: 64,
      avgWinner: "+1.31R",
      avgLoser: "-0.85R",
      equityCurve: [
        { step: 1, equity: 10000 },
        { step: 15, equity: 10320 },
        { step: 30, equity: 10680 },
        { step: 45, equity: 11040 },
        { step: 64, equity: 11420 },
      ],
    },
    usage: {
      activeOpportunitiesCount: 2,
      pendingProposalsCount: 1,
      openPositionsCount: 1,
      closedPositionsCount: 8,
      samplePositions: [
        { id: "POS-0082", symbol: "ETH/USDT", side: "LONG", pnl: 25.62, status: "OPEN" },
        { id: "POS-0075", symbol: "ETH/USDT", side: "LONG", pnl: 67.20, status: "CLOSED" },
      ],
    },
    versions: [
      {
        version: "v2.1",
        status: "Active",
        createdAt: "Aug 25, 2026",
        changeSummary: "Switched secondary indicator from MACD to Stochastic RSI for faster signal resolution.",
      },
      {
        version: "v2.0",
        status: "Archived",
        createdAt: "Jul 10, 2026",
        changeSummary: "Added funding rate constraint to avoid crowded liquidation zones.",
      },
    ],
    hermesContext: {
      activeMarkets: ["ETH/USDT"],
      timeframe: "4H",
      currentUsage: "Position POS-0082 currently active and approaching take-profit zone.",
      assessment:
        "Strategy exhibits solid execution fidelity during trending regimes; monitoring closely for exhaustion signals.",
    },
  },
  {
    id: "STRAT-003",
    name: "Mean Reversion",
    version: "v1.1",
    status: "ACTIVE",
    type: "Mean Reversion",
    primaryMarket: "BTC/USDT",
    primaryTimeframe: "15M",
    validationStage: "Backtest",
    paperApproved: false,
    liveApproved: false,
    updatedAt: "Today, 11:42 UTC",
    updatedTimestamp: 1725450120000,
    definition: {
      marketUniverse: ["BTC/USDT", "ETH/USDT"],
      timeframes: ["15M"],
      description:
        "Fades temporary extreme price deviations outside 2.5 standard deviation Bollinger Bands during compressed volatility regimes.",
      entryConditions: [
        "Price touches or pierces 2.5-SD Bollinger Band envelope",
        "RSI prints extreme reading (<25 for Long, >75 for Short)",
        "ADX indicates non-trending state (ADX < 20)",
      ],
      exitConditions: [
        "Price returns to VWAP or 20-SMA midline",
        "Fixed stop loss at 1.2x average true range (ATR)",
      ],
      invalidationConditions: [
        "ADX rapidly surges above 25 indicating sudden breakout surge",
        "Volume prints 3x standard baseline during entry bar",
      ],
      defaultRiskPercent: 0.25,
      maxRiskPercent: 0.50,
      typicalRR: "2.60R",
      maxConcurrentPositions: 1,
      preferredRegime: "Ranging / Consolidating Chop",
    },
    validationGates: [
      {
        id: "GATE-01",
        name: "Historical Backtest",
        status: "PASS",
        threshold: "Win Rate > 55%",
        actual: "Win Rate 57%",
        date: "Aug 29, 2026",
      },
      {
        id: "GATE-02",
        name: "Out-of-Sample",
        status: "IN_PROGRESS",
        threshold: "Max DD < 10%",
        actual: "Simulating on 2025 data",
      },
      {
        id: "GATE-03",
        name: "Walk-Forward",
        status: "NOT_STARTED",
        threshold: "Robustness check",
        actual: "Pending Gate 2",
      },
      {
        id: "GATE-04",
        name: "Paper Trading",
        status: "NOT_STARTED",
        threshold: "Paper approval",
        actual: "Locked",
      },
      {
        id: "GATE-05",
        name: "Tiny Live",
        status: "NOT_STARTED",
        threshold: "Live pilot",
        actual: "Locked",
      },
      {
        id: "GATE-06",
        name: "Final Evaluation",
        status: "NOT_STARTED",
        threshold: "Certification",
        actual: "Locked",
      },
    ],
    performance: {
      netReturnPercent: 8.9,
      winRatePercent: 57,
      profitFactor: 1.31,
      expectancy: "+0.22R",
      maxDrawdownPercent: 7.2,
      sharpeRatio: 1.15,
      sortinoRatio: 1.45,
      totalTrades: 112,
      avgWinner: "+1.10R",
      avgLoser: "-0.84R",
      equityCurve: [
        { step: 1, equity: 10000 },
        { step: 25, equity: 10180 },
        { step: 50, equity: 10420 },
        { step: 75, equity: 10650 },
        { step: 112, equity: 10890 },
      ],
    },
    usage: {
      activeOpportunitiesCount: 1,
      pendingProposalsCount: 0,
      openPositionsCount: 1,
      closedPositionsCount: 5,
      samplePositions: [
        { id: "POS-0083", symbol: "BTC/USDT", side: "SHORT", pnl: 3.87, status: "OPEN" },
        { id: "POS-0078", symbol: "ETH/USDT", side: "LONG", pnl: 94.30, status: "CLOSED" },
      ],
    },
    versions: [
      {
        version: "v1.1",
        status: "Active",
        createdAt: "Aug 28, 2026",
        changeSummary: "Widened Bollinger Band filter from 2.0-SD to 2.5-SD to filter premature entries.",
      },
      {
        version: "v1.0",
        status: "Archived",
        createdAt: "Aug 02, 2026",
        changeSummary: "Initial prototype implementation.",
      },
    ],
    hermesContext: {
      activeMarkets: ["BTC/USDT"],
      timeframe: "15M",
      currentUsage: "Position POS-0083 entered as localized short hedge.",
      assessment:
        "Undergoing quantitative backtest refinement. Performs reliably in low-volatility Asian sessions.",
    },
  },
  {
    id: "STRAT-004",
    name: "Momentum Expansion",
    version: "v0.9",
    status: "DRAFT",
    type: "Momentum",
    primaryMarket: "Multi-Asset",
    primaryTimeframe: "1H",
    validationStage: "Trading Idea",
    paperApproved: false,
    liveApproved: false,
    updatedAt: "Today, 09:10 UTC",
    updatedTimestamp: 1725441000000,
    definition: {
      marketUniverse: ["BTC/USDT", "ETH/USDT"],
      timeframes: ["1H"],
      description:
        "Detects explosive volatility expansion following multi-day compression phases using ATR expansion and open interest spikes.",
      entryConditions: [
        "Keltner Channels expand completely outside Bollinger Bands (Squeeze Fire)",
        "Open interest increases by more than 5% in a single 1H bar",
        "Delta skew favors aggressive market orders",
      ],
      exitConditions: [
        "Take profit at 3.0R runner level",
        "Trailing stop engages once 1.5R target is achieved",
      ],
      invalidationConditions: [
        "Immediate mean reversion piercing median price band",
        "Volume dries up immediately after signal bar",
      ],
      defaultRiskPercent: 0.35,
      maxRiskPercent: 0.70,
      typicalRR: "2.14R",
      maxConcurrentPositions: 1,
      preferredRegime: "Early Stage Breakout Squeeze",
    },
    validationGates: [
      {
        id: "GATE-01",
        name: "Historical Backtest",
        status: "NOT_STARTED",
        threshold: "Pending formal parameter coding",
        actual: "Unvalidated Idea",
      },
      {
        id: "GATE-02",
        name: "Out-of-Sample",
        status: "NOT_STARTED",
        threshold: "Gate 1 required",
        actual: "Locked",
      },
      {
        id: "GATE-03",
        name: "Walk-Forward",
        status: "NOT_STARTED",
        threshold: "Gate 2 required",
        actual: "Locked",
      },
      {
        id: "GATE-04",
        name: "Paper Trading",
        status: "NOT_STARTED",
        threshold: "Gate 3 required",
        actual: "Locked",
      },
      {
        id: "GATE-05",
        name: "Tiny Live",
        status: "NOT_STARTED",
        threshold: "Pilot approval",
        actual: "Locked",
      },
      {
        id: "GATE-06",
        name: "Final Evaluation",
        status: "NOT_STARTED",
        threshold: "Certification",
        actual: "Locked",
      },
    ],
    performance: {
      netReturnPercent: 0,
      winRatePercent: 0,
      profitFactor: 0,
      expectancy: "—",
      maxDrawdownPercent: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      totalTrades: 0,
      avgWinner: "—",
      avgLoser: "—",
      equityCurve: [{ step: 1, equity: 10000 }],
    },
    usage: {
      activeOpportunitiesCount: 1,
      pendingProposalsCount: 0,
      openPositionsCount: 1,
      closedPositionsCount: 1,
      samplePositions: [
        { id: "POS-0084", symbol: "ETH/USDT", side: "LONG", pnl: -7.25, status: "OPEN" },
      ],
    },
    versions: [
      {
        version: "v0.9",
        status: "Draft",
        createdAt: "Sep 03, 2026",
        changeSummary: "Initial theoretical formulation by Hermes quantitative research team.",
      },
    ],
    hermesContext: {
      activeMarkets: ["BTC/USDT", "ETH/USDT"],
      timeframe: "1H",
      currentUsage: "Prototype testing under simulated paper surveillance.",
      assessment:
        "Experimental concept undergoing algorithmic definition. Formal backtest scheduled in Task 10.",
    },
  },
  {
    id: "STRAT-005",
    name: "Volatility Reversal",
    version: "v1.0",
    status: "UNDER_VALIDATION",
    type: "Volatility",
    primaryMarket: "ETH/USDT",
    primaryTimeframe: "1H",
    validationStage: "Out-of-Sample",
    paperApproved: false,
    liveApproved: false,
    updatedAt: "Sep 03, 14:00 UTC",
    updatedTimestamp: 1725372000000,
    definition: {
      marketUniverse: ["ETH/USDT"],
      timeframes: ["1H"],
      description:
        "Capitalizes on overextended liquidation cascades where cascade exhaustion leads to sharp V-shaped reversals.",
      entryConditions: [
        "Estimated liquidation volume reaches top 95th percentile",
        "Aggressive orderbook absorption with long wicks formed on 15m/1H",
        "RSI divergence on hourly timeframe",
      ],
      exitConditions: [
        "Immediate limit target at pre-cascade equilibrium level",
        "Trailing stop moves to break-even after +1.5% impulse",
      ],
      invalidationConditions: [
        "New swing low break invalidating absorption wick",
        "Orderbook bid depth collapses post-entry",
      ],
      defaultRiskPercent: 0.50,
      maxRiskPercent: 1.00,
      typicalRR: "3.14R",
      maxConcurrentPositions: 1,
      preferredRegime: "Capitulation Liquidation Cascade",
    },
    validationGates: [
      {
        id: "GATE-01",
        name: "Historical Backtest",
        status: "PASS",
        threshold: "Profit Factor > 1.40",
        actual: "Profit Factor 1.68",
        date: "Aug 20, 2026",
      },
      {
        id: "GATE-02",
        name: "Out-of-Sample Validation",
        status: "IN_PROGRESS",
        threshold: "Cross-validation 2025 Q4",
        actual: "In Progress (68% complete)",
      },
      {
        id: "GATE-03",
        name: "Walk-Forward",
        status: "NOT_STARTED",
        threshold: "Pending Gate 2",
        actual: "Queued",
      },
      {
        id: "GATE-04",
        name: "Paper Trading",
        status: "NOT_STARTED",
        threshold: "Pending Gate 3",
        actual: "Locked",
      },
      {
        id: "GATE-05",
        name: "Tiny Live",
        status: "NOT_STARTED",
        threshold: "Live pilot",
        actual: "Locked",
      },
      {
        id: "GATE-06",
        name: "Final Evaluation",
        status: "NOT_STARTED",
        threshold: "Sign-off",
        actual: "Locked",
      },
    ],
    performance: {
      netReturnPercent: 12.1,
      winRatePercent: 59,
      profitFactor: 1.48,
      expectancy: "+0.38R",
      maxDrawdownPercent: 6.2,
      sharpeRatio: 1.28,
      sortinoRatio: 1.64,
      totalTrades: 42,
      avgWinner: "+1.65R",
      avgLoser: "-0.95R",
      equityCurve: [
        { step: 1, equity: 10000 },
        { step: 10, equity: 10250 },
        { step: 20, equity: 10580 },
        { step: 30, equity: 10890 },
        { step: 42, equity: 11210 },
      ],
    },
    usage: {
      activeOpportunitiesCount: 0,
      pendingProposalsCount: 0,
      openPositionsCount: 0,
      closedPositionsCount: 2,
      samplePositions: [
        { id: "POS-0076", symbol: "BTC/USDT", side: "SHORT", pnl: 142.50, status: "CLOSED" },
      ],
    },
    versions: [
      {
        version: "v1.0",
        status: "Active",
        createdAt: "Aug 15, 2026",
        changeSummary: "First formalized release based on liquidation cascade study.",
      },
    ],
    hermesContext: {
      activeMarkets: ["ETH/USDT"],
      timeframe: "1H",
      currentUsage: "Awaiting high-impact volatility event to trigger radar scan.",
      assessment:
        "High risk-reward potential; requires strict liquidation threshold filtering before paper approval.",
    },
  },
  {
    id: "STRAT-006",
    name: "BTC Range Reversion",
    version: "v1.0",
    status: "ARCHIVED",
    type: "Mean Reversion",
    primaryMarket: "BTC/USDT",
    primaryTimeframe: "1H",
    validationStage: "Backtest",
    paperApproved: false,
    liveApproved: false,
    updatedAt: "Aug 26, 2026",
    updatedTimestamp: 1724659200000,
    archiveReason: "Superseded by Mean Reversion v1.1 due to poor performance during trending regimes.",
    definition: {
      marketUniverse: ["BTC/USDT"],
      timeframes: ["1H"],
      description:
        "Legacy range reversion model designed for fixed horizontal channels. Retired due to excessive drawdowns during trend breakouts.",
      entryConditions: [
        "Price touches channel boundaries with static horizontal support/resistance",
      ],
      exitConditions: [
        "Channel midline target exit",
      ],
      invalidationConditions: [
        "Channel boundary breach",
      ],
      defaultRiskPercent: 0.50,
      maxRiskPercent: 1.00,
      typicalRR: "1.50R",
      maxConcurrentPositions: 1,
      preferredRegime: "Strict Horizontal Range",
    },
    validationGates: [
      {
        id: "GATE-01",
        name: "Historical Backtest",
        status: "FAIL",
        threshold: "Max DD < 10%",
        actual: "Max DD 14.8% (Failed)",
        date: "Aug 22, 2026",
      },
      {
        id: "GATE-02",
        name: "Out-of-Sample",
        status: "NOT_STARTED",
        threshold: "Gate 1 Failed",
        actual: "Halted",
      },
      {
        id: "GATE-03",
        name: "Walk-Forward",
        status: "NOT_STARTED",
        threshold: "Gate 1 Failed",
        actual: "Halted",
      },
      {
        id: "GATE-04",
        name: "Paper Trading",
        status: "NOT_STARTED",
        threshold: "Gate 1 Failed",
        actual: "Halted",
      },
      {
        id: "GATE-05",
        name: "Tiny Live",
        status: "NOT_STARTED",
        threshold: "Gate 1 Failed",
        actual: "Halted",
      },
      {
        id: "GATE-06",
        name: "Final Evaluation",
        status: "NOT_STARTED",
        threshold: "Gate 1 Failed",
        actual: "Halted",
      },
    ],
    performance: {
      netReturnPercent: -2.4,
      winRatePercent: 52,
      profitFactor: 0.94,
      expectancy: "-0.08R",
      maxDrawdownPercent: 14.8,
      sharpeRatio: 0.62,
      sortinoRatio: 0.74,
      totalTrades: 58,
      avgWinner: "+1.05R",
      avgLoser: "-1.12R",
      equityCurve: [
        { step: 1, equity: 10000 },
        { step: 20, equity: 10100 },
        { step: 40, equity: 9850 },
        { step: 58, equity: 9760 },
      ],
    },
    usage: {
      activeOpportunitiesCount: 0,
      pendingProposalsCount: 0,
      openPositionsCount: 0,
      closedPositionsCount: 4,
      samplePositions: [],
    },
    versions: [
      {
        version: "v1.0",
        status: "Archived",
        createdAt: "Jul 15, 2026",
        changeSummary: "Legacy model archived after backtest revealed vulnerability to trending expansion.",
      },
    ],
    hermesContext: {
      activeMarkets: ["BTC/USDT"],
      timeframe: "1H",
      currentUsage: "Inactive / Archived in registry audit vault.",
      assessment:
        "Archived strategy. Kept for historical reference and model replication benchmarks.",
    },
  },
];

export const mockStrategiesData = mockStrategies;
