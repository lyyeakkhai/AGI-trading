/**
 * Centralized Deterministic Mock Data Architecture for Trade Proposals
 * AGI Trading System Source of Truth for Proposals & Risk Decision Matrix
 */

import { PositionSideType } from "@/components/trading/PositionSide";

export type ProposalStatus =
  | "Awaiting Approval"
  | "Risk Approved"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Expired"
  | "Executed"
  | "Draft";

export type ProposalRiskDecision = "APPROVED" | "REJECTED" | "UNDER_REVIEW";

export interface ProposalRiskCheck {
  id: string;
  name: string;
  value: string;
  limit: string;
  passed: boolean;
}

export interface ProposalEvidenceItem {
  category: "Technical" | "Market" | "Momentum" | "Volume" | "Volatility" | "Risk";
  signal: string;
  value: string;
  interpretation: string;
  polarity: "positive" | "neutral" | "negative";
}

export interface TradeProposalItem {
  id: string;
  symbol: string;
  name: string;
  direction: PositionSideType;
  strategy: string;
  strategyVersion: string;
  timeframe: "15M" | "1H" | "4H" | "1D";
  entry: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: string;
  capitalAllocation: string;
  riskPercent: number;
  riskReward: string;
  confidence: number;
  status: ProposalStatus;
  createdAt: string;
  createdTimestamp: number;
  expiresAt: string;
  isExpired: boolean;
  hermesAssessment: string;
  supportingEvidence: ProposalEvidenceItem[];
  contradictingEvidence: ProposalEvidenceItem[];
  strategySpec: {
    entryCondition: string;
    invalidation: string;
    targetLogic: string;
    executionMode: string;
  };
  riskDecision: ProposalRiskDecision;
  riskChecks: ProposalRiskCheck[];
  riskRejectionReason?: string;
  lifecycleStage:
    | "opportunity"
    | "investigation"
    | "proposal"
    | "risk_validation"
    | "owner_approval"
    | "execution";
  ownerApprovalStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvalTimestamp?: string;
  rejectionReason?: string;
}

export interface ProposalSummaryMetrics {
  pendingApprovalCount: number;
  riskApprovedCount: number;
  underReviewCount: number;
  rejectedCount: number;
  averageConfidence: number;
}

export const mockProposalSummary: ProposalSummaryMetrics = {
  pendingApprovalCount: 2,
  riskApprovedCount: 3,
  underReviewCount: 1,
  rejectedCount: 1,
  averageConfidence: 76,
};

export const mockTradeProposals: TradeProposalItem[] = [
  {
    id: "PROP-BTC-20260904-01",
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    direction: "LONG",
    strategy: "Breakout Continuation",
    strategyVersion: "v1.3",
    timeframe: "1H",
    entry: 112480.0,
    stopLoss: 111200.0,
    takeProfit: 115040.0,
    positionSize: "0.45 BTC",
    capitalAllocation: "$10,123 (20% margin)",
    riskPercent: 0.5,
    riskReward: "2.0R",
    confidence: 82,
    status: "Awaiting Approval",
    createdAt: "12:45:18 UTC",
    createdTimestamp: Date.now() - 180000,
    expiresAt: "13:45:18 UTC (in 28m)",
    isExpired: false,
    hermesAssessment:
      "Breakout continuation setup with improving spot buyer momentum and confirmation above recent resistance. Price holding firmly above the 20 EMA with positive cumulative volume delta.",
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Price Structure",
        value: "Higher Highs / Higher Lows",
        interpretation: "Sustained bullish expansion across 1H and 4H candles.",
        polarity: "positive",
      },
      {
        category: "Technical",
        signal: "EMA Alignment",
        value: "Price above 20 & 50 EMA",
        interpretation: "Short-term trend momentum aligns with primary direction.",
        polarity: "positive",
      },
      {
        category: "Volume",
        signal: "CVD Spot Absorption",
        value: "+840 BTC Delta",
        interpretation: "Aggressive taker buys absorbing passive sell walls.",
        polarity: "positive",
      },
      {
        category: "Momentum",
        signal: "RSI (14)",
        value: "61.4",
        interpretation: "Room for expansion before approaching overbought boundary.",
        polarity: "positive",
      },
    ],
    contradictingEvidence: [
      {
        category: "Volatility",
        signal: "ATR Spread",
        value: "Elevated (+12%)",
        interpretation: "Slight spread expansion requires conservative sizing.",
        polarity: "neutral",
      },
      {
        category: "Market",
        signal: "Resistance Zone Nearby",
        value: "$113,500 Ask Wall",
        interpretation: "Secondary profit scaling advised ahead of major wall.",
        polarity: "negative",
      },
    ],
    strategySpec: {
      entryCondition: "Break above confirmed resistance with volume confirmation.",
      invalidation: "Hourly candle close below local breakout structure at $111,200.",
      targetLogic: "2.0R fixed target at $115,040 with trailing stop activation at 1.2R.",
      executionMode: "Limit Post-Only with immediate cancellation if unfilled in 180s.",
    },
    riskDecision: "APPROVED",
    riskChecks: [
      { id: "rc-1", name: "Risk per trade", value: "0.50%", limit: "Max 1.00%", passed: true },
      { id: "rc-2", name: "Maximum position exposure", value: "12.5%", limit: "Max 25.0%", passed: true },
      { id: "rc-3", name: "Stop loss parameter present", value: "$111,200.00", limit: "Mandatory", passed: true },
      { id: "rc-4", name: "Risk/Reward ratio minimum", value: "2.0R", limit: "Min 1.5R", passed: true },
      { id: "rc-5", name: "Daily loss limit capacity", value: "2.2% available", limit: "Cap 3.0%", passed: true },
      { id: "rc-6", name: "Portfolio exposure cap", value: "34.2%", limit: "Max 50.0%", passed: true },
      { id: "rc-7", name: "Trading execution environment", value: "PAPER", limit: "Approved Mode", passed: true },
    ],
    lifecycleStage: "owner_approval",
    ownerApprovalStatus: "PENDING",
  },
  {
    id: "PROP-ETH-20260904-02",
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    direction: "LONG",
    strategy: "Trend Continuation",
    strategyVersion: "v2.1",
    timeframe: "4H",
    entry: 4320.0,
    stopLoss: 4240.0,
    takeProfit: 4480.0,
    positionSize: "2.80 ETH",
    capitalAllocation: "$6,048 (15% margin)",
    riskPercent: 0.5,
    riskReward: "2.0R",
    confidence: 76,
    status: "Awaiting Approval",
    createdAt: "12:35:10 UTC",
    createdTimestamp: Date.now() - 600000,
    expiresAt: "14:35:10 UTC (in 45m)",
    isExpired: false,
    hermesAssessment:
      "ETH 4H trend consolidation holding firmly above $4,280 support shelf. Moving average ribbon expanding with low volatility compression breaking upward.",
    supportingEvidence: [
      {
        category: "Technical",
        signal: "EMA 50/200 Spread",
        value: "Golden Expansion",
        interpretation: "Disciplined intermediate trend continuation.",
        polarity: "positive",
      },
      {
        category: "Volume",
        signal: "Volume vs 20-period",
        value: "+18% above average",
        interpretation: "Steady accumulation during consolidation phase.",
        polarity: "positive",
      },
      {
        category: "Market",
        signal: "Open Interest",
        value: "Healthy Reset",
        interpretation: "No speculative excess crowding funding rates.",
        polarity: "positive",
      },
    ],
    contradictingEvidence: [
      {
        category: "Market",
        signal: "ETH/BTC Ratio",
        value: "Lagging Benchmark",
        interpretation: "Relative strength slightly suppressed vs BTC beta.",
        polarity: "neutral",
      },
    ],
    strategySpec: {
      entryCondition: "4H candle close above consolidation trigger $4,320.",
      invalidation: "Breakdown below swing support low at $4,240.",
      targetLogic: "2.0R target at $4,480 with breakeven stop at $4,400.",
      executionMode: "Limit order at mark with TWAP slicing across 60s.",
    },
    riskDecision: "APPROVED",
    riskChecks: [
      { id: "rc-1", name: "Risk per trade", value: "0.50%", limit: "Max 1.00%", passed: true },
      { id: "rc-2", name: "Maximum position exposure", value: "8.4%", limit: "Max 25.0%", passed: true },
      { id: "rc-3", name: "Stop loss parameter present", value: "$4,240.00", limit: "Mandatory", passed: true },
      { id: "rc-4", name: "Risk/Reward ratio minimum", value: "2.0R", limit: "Min 1.5R", passed: true },
      { id: "rc-5", name: "Daily loss limit capacity", value: "2.2% available", limit: "Cap 3.0%", passed: true },
      { id: "rc-6", name: "Portfolio exposure cap", value: "34.2%", limit: "Max 50.0%", passed: true },
      { id: "rc-7", name: "Trading execution environment", value: "PAPER", limit: "Approved Mode", passed: true },
    ],
    lifecycleStage: "owner_approval",
    ownerApprovalStatus: "PENDING",
  },
  {
    id: "PROP-BTC-20260904-03",
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    direction: "SHORT",
    strategy: "Mean Reversion Pullback",
    strategyVersion: "v1.0",
    timeframe: "15M",
    entry: 112500.0,
    stopLoss: 113200.0,
    takeProfit: 111100.0,
    positionSize: "1.20 BTC",
    capitalAllocation: "$27,000 (Over limit)",
    riskPercent: 1.8,
    riskReward: "2.0R",
    confidence: 58,
    status: "Rejected",
    createdAt: "12:20:00 UTC",
    createdTimestamp: Date.now() - 1500000,
    expiresAt: "13:20:00 UTC",
    isExpired: false,
    hermesAssessment:
      "15m bearish divergence observed near local highs. Candidate for mean reversion fade into 1H 20 EMA.",
    supportingEvidence: [
      {
        category: "Momentum",
        signal: "15M RSI Divergence",
        value: "Lower High on Price High",
        interpretation: "Short-term momentum waning on sub-hourly timeframe.",
        polarity: "positive",
      },
    ],
    contradictingEvidence: [
      {
        category: "Technical",
        signal: "Higher-Timeframe Trend",
        value: "Strong Bullish 1H/4H",
        interpretation: "Counter-trend trades exhibit higher stop-out frequency.",
        polarity: "negative",
      },
    ],
    strategySpec: {
      entryCondition: "Loss of 15m VWAP trigger line.",
      invalidation: "Break of new local high at $113,200.",
      targetLogic: "Mean reversion to 1H EMA 20 at $111,100.",
      executionMode: "Market IOC.",
    },
    riskDecision: "REJECTED",
    riskRejectionReason:
      "Position exposure risk (1.80%) exceeds configured portfolio risk cap (1.00%). Stop distance too wide for requested size.",
    riskChecks: [
      { id: "rc-1", name: "Risk per trade", value: "1.80%", limit: "Max 1.00%", passed: false },
      { id: "rc-2", name: "Maximum position exposure", value: "28.5%", limit: "Max 25.0%", passed: false },
      { id: "rc-3", name: "Stop loss parameter present", value: "$113,200.00", limit: "Mandatory", passed: true },
      { id: "rc-4", name: "Risk/Reward ratio minimum", value: "2.0R", limit: "Min 1.5R", passed: true },
      { id: "rc-5", name: "Daily loss limit capacity", value: "2.2% available", limit: "Cap 3.0%", passed: true },
      { id: "rc-6", name: "Portfolio exposure cap", value: "48.2%", limit: "Max 50.0%", passed: true },
      { id: "rc-7", name: "Trading execution environment", value: "PAPER", limit: "Approved Mode", passed: true },
    ],
    lifecycleStage: "risk_validation",
    ownerApprovalStatus: "REJECTED",
    rejectionReason: "Automated rejection: Risk Engine constraints failed.",
  },
  {
    id: "PROP-ETH-20260904-04",
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    direction: "SHORT",
    strategy: "Range Resistance Rejection",
    strategyVersion: "v1.2",
    timeframe: "1H",
    entry: 4380.0,
    stopLoss: 4440.0,
    takeProfit: 4220.0,
    positionSize: "3.50 ETH",
    capitalAllocation: "$7,665 (18% margin)",
    riskPercent: 0.5,
    riskReward: "2.6R",
    confidence: 74,
    status: "Under Review",
    createdAt: "12:12:30 UTC",
    createdTimestamp: Date.now() - 2100000,
    expiresAt: "14:12:30 UTC",
    isExpired: false,
    hermesAssessment:
      "ETH intraday distribution pattern detected beneath $4,390 resistance. Spot taker selling persistent but waiting on correlation check.",
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Upper Wick Exhaustion",
        value: "Triple Rejection",
        interpretation: "Failed auction above key range high.",
        polarity: "positive",
      },
      {
        category: "Volume",
        signal: "Spot Taker Delta",
        value: "-14,200 ETH",
        interpretation: "Sell market orders pressing into bids.",
        polarity: "positive",
      },
    ],
    contradictingEvidence: [
      {
        category: "Market",
        signal: "BTC Tailwinds",
        value: "BTC Continuing Higher",
        interpretation: "Correlated surge may overrun local range resistance.",
        polarity: "negative",
      },
    ],
    strategySpec: {
      entryCondition: "Failure to hold $4,380 with tape breakdown.",
      invalidation: "Clean 1H close above $4,440.",
      targetLogic: "2.6R target into range value area low at $4,220.",
      executionMode: "Limit order at ask.",
    },
    riskDecision: "UNDER_REVIEW",
    riskChecks: [
      { id: "rc-1", name: "Risk per trade", value: "0.50%", limit: "Max 1.00%", passed: true },
      { id: "rc-2", name: "Maximum position exposure", value: "9.2%", limit: "Max 25.0%", passed: true },
      { id: "rc-3", name: "Stop loss parameter present", value: "$4,440.00", limit: "Mandatory", passed: true },
      { id: "rc-4", name: "Risk/Reward ratio minimum", value: "2.6R", limit: "Min 1.5R", passed: true },
      { id: "rc-5", name: "Daily loss limit capacity", value: "Pending VaR check", limit: "Cap 3.0%", passed: false },
      { id: "rc-6", name: "Portfolio exposure cap", value: "34.2%", limit: "Max 50.0%", passed: true },
      { id: "rc-7", name: "Trading execution environment", value: "PAPER", limit: "Approved Mode", passed: true },
    ],
    lifecycleStage: "proposal",
    ownerApprovalStatus: "PENDING",
  },
  {
    id: "PROP-BTC-20260904-05",
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    direction: "LONG",
    strategy: "Volatility Compression Pop",
    strategyVersion: "v1.1",
    timeframe: "4H",
    entry: 109800.0,
    stopLoss: 108500.0,
    takeProfit: 112400.0,
    positionSize: "0.50 BTC",
    capitalAllocation: "$10,980 (22% margin)",
    riskPercent: 0.5,
    riskReward: "2.0R",
    confidence: 68,
    status: "Expired",
    createdAt: "09:00:00 UTC",
    createdTimestamp: Date.now() - 14400000,
    expiresAt: "11:00:00 UTC (Expired)",
    isExpired: true,
    hermesAssessment:
      "Compression pop breakout thesis. Price breached entry trigger before owner authorization was granted. Setup expired as valid entry criteria expired.",
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Bollinger Squeeze",
        value: "Bandwidth Expansion",
        interpretation: "Compression breaking upward.",
        polarity: "positive",
      },
    ],
    contradictingEvidence: [
      {
        category: "Market",
        signal: "Stale Price Level",
        value: "Current price $112,482",
        interpretation: "Price ran past entry trigger ($109,800); chasing is prohibited.",
        polarity: "negative",
      },
    ],
    strategySpec: {
      entryCondition: "Break above $109,800 band.",
      invalidation: "Loss of $108,500.",
      targetLogic: "2.0R at $112,400.",
      executionMode: "Limit order.",
    },
    riskDecision: "APPROVED",
    riskChecks: [
      { id: "rc-1", name: "Risk per trade", value: "0.50%", limit: "Max 1.00%", passed: true },
      { id: "rc-2", name: "Maximum position exposure", value: "11.2%", limit: "Max 25.0%", passed: true },
      { id: "rc-3", name: "Stop loss parameter present", value: "$108,500.00", limit: "Mandatory", passed: true },
      { id: "rc-4", name: "Risk/Reward ratio minimum", value: "2.0R", limit: "Min 1.5R", passed: true },
      { id: "rc-5", name: "Daily loss limit capacity", value: "2.2% available", limit: "Cap 3.0%", passed: true },
      { id: "rc-6", name: "Portfolio exposure cap", value: "34.2%", limit: "Max 50.0%", passed: true },
      { id: "rc-7", name: "Trading execution environment", value: "PAPER", limit: "Approved Mode", passed: true },
    ],
    lifecycleStage: "proposal",
    ownerApprovalStatus: "REJECTED",
    rejectionReason: "Proposal expired before approval. Market conditions changed.",
  },
];
