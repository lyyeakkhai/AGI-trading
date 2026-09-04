/**
 * Centralized Mock Data Architecture for Opportunity Detection in AGI Trading
 * Provides deterministic, structured opportunity records, lifecycle states, and evidence.
 */

import { PositionSideType } from "@/components/trading/PositionSide";
import { RiskLevel } from "@/components/trading/RiskBadge";

export type OpportunityStatus =
  | "New"
  | "Monitoring"
  | "Investigating"
  | "Confirmed"
  | "Weakening"
  | "Expired";

export type OpportunityStrategy =
  | "Breakout Continuation"
  | "Trend Continuation"
  | "Mean Reversion"
  | "Momentum"
  | "Volatility Compression"
  | "Liquidity Sweep";

export interface OpportunityEvidence {
  category: "Technical" | "Market" | "Volume" | "Volatility" | "Risk";
  signal: string;
  value: string;
  polarity: "positive" | "neutral" | "negative";
  interpretation: string;
}

export interface OpportunityItem {
  id: string;
  symbol: string;
  name: string;
  direction: PositionSideType;
  setup: string;
  strategy: OpportunityStrategy;
  timeframe: "15M" | "1H" | "4H" | "1D";
  confidence: number;
  marketRegime: string;
  riskState: RiskLevel;
  detectedAt: string;
  detectedTimestamp: number;
  status: OpportunityStatus;
  price: number;
  change24h: number;
  volumeState: string;
  volatilityState: string;
  riskReward: string;
  targetPriceEst: number;
  stopLossEst: number;
  supportingEvidence: OpportunityEvidence[];
  contradictingEvidence: OpportunityEvidence[];
  hermesAssessment: string;
  lifecycleStage:
    | "detected"
    | "monitoring"
    | "investigating"
    | "confirmed"
    | "proposal_pending";
}

export interface OpportunitySummaryMetrics {
  activeOpportunities: number;
  highConfidenceCount: number;
  underInvestigationCount: number;
  newTodayCount: number;
  averageConfidence: number;
}

export interface HermesOpportunityScannerState {
  lastScan: string;
  marketsScanned: number;
  potentialSetups: number;
  status: "MONITORING" | "SCANNING" | "EVALUATING";
  activeAlgorithm: string;
}

export const mockOpportunitySummary: OpportunitySummaryMetrics = {
  activeOpportunities: 6,
  highConfidenceCount: 3,
  underInvestigationCount: 3,
  newTodayCount: 5,
  averageConfidence: 71,
};

export const mockHermesScannerState: HermesOpportunityScannerState = {
  lastScan: "18 sec ago",
  marketsScanned: 3,
  potentialSetups: 8,
  status: "MONITORING",
  activeAlgorithm: "Multi-Horizon Volatility & CVD Scanner v2.8",
};

export const mockOpportunities: OpportunityItem[] = [
  {
    id: "opp-btc-01",
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    direction: "LONG",
    setup: "Breakout Continuation",
    strategy: "Breakout Continuation",
    timeframe: "1H",
    confidence: 78,
    marketRegime: "Trending Expansion",
    riskState: "LOW",
    detectedAt: "2m ago",
    detectedTimestamp: Date.now() - 120000,
    status: "Investigating",
    price: 112482.32,
    change24h: 2.41,
    volumeState: "+18.4% above mean",
    volatilityState: "Elevated (24h ATR 2.4%)",
    riskReward: "2.8 R:R",
    targetPriceEst: 115200,
    stopLossEst: 111400,
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Price vs 20 EMA",
        value: "Above ($111,850)",
        polarity: "positive",
        interpretation: "Bullish trend structure confirmed across 1H and 4H.",
      },
      {
        category: "Technical",
        signal: "Higher-High Progression",
        value: "Confirmed",
        polarity: "positive",
        interpretation: "Consecutive higher lows established above $110,240 support.",
      },
      {
        category: "Volume",
        signal: "CVD Spot vs Perp",
        value: "+840 BTC Delta",
        polarity: "positive",
        interpretation: "Spot aggressive absorption driving upward pressure.",
      },
      {
        category: "Market",
        signal: "Funding Rate",
        value: "+0.0104% (Neutral)",
        polarity: "positive",
        interpretation: "Funding remains balanced; no extreme long crowding.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Volatility",
        signal: "Overhead Resistance Cluster",
        value: "$113,500 Orderbook Wall",
        polarity: "negative",
        interpretation: "Substantial ask liquidity stationed at $113,500.",
      },
      {
        category: "Risk",
        signal: "Intraday Spread Expansion",
        value: "+12% ATR",
        polarity: "neutral",
        interpretation: "Elevated volatility requires wider stop buffer.",
      },
    ],
    hermesAssessment:
      "BTC structure remains structurally bullish. However, elevated intraday volatility and bid-ask spread expansion near $113,500 reduce immediate entry purity. Hermes is observing for a secondary volume absorption confirmation before advancing to a formal trade proposal.",
    lifecycleStage: "investigating",
  },
  {
    id: "opp-eth-01",
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    direction: "LONG",
    setup: "Trend Continuation",
    strategy: "Trend Continuation",
    timeframe: "4H",
    confidence: 71,
    marketRegime: "Trending Consolidation",
    riskState: "LOW",
    detectedAt: "8m ago",
    detectedTimestamp: Date.now() - 480000,
    status: "Monitoring",
    price: 4321.2,
    change24h: 1.18,
    volumeState: "Moderate (+4.2%)",
    volatilityState: "Low (Compressing)",
    riskReward: "2.4 R:R",
    targetPriceEst: 4490,
    stopLossEst: 4250,
    supportingEvidence: [
      {
        category: "Technical",
        signal: "EMA 50 / 200 Golden Alignment",
        value: "Bullish Spread",
        polarity: "positive",
        interpretation: "Medium-term moving averages in disciplined expansion.",
      },
      {
        category: "Technical",
        signal: "RSI 14",
        value: "52.8 (Neutral)",
        polarity: "positive",
        interpretation: "Ample room for expansion before overbought boundary.",
      },
      {
        category: "Market",
        signal: "Open Interest",
        value: "Flat ($1.12B)",
        polarity: "neutral",
        interpretation: "Consolidation occurring without aggressive leverage buildup.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Market",
        signal: "ETH/BTC Ratio",
        value: "Lagging Benchmark",
        polarity: "negative",
        interpretation: "Relative strength slightly suppressed vs BTC beta.",
      },
    ],
    hermesAssessment:
      "ETH 4H trend remains positive and disciplined. Volume is moderate, and price is holding above the $4,280 consolidation shelf. Monitoring for a decisive break of $4,350.",
    lifecycleStage: "monitoring",
  },
  {
    id: "opp-sol-01",
    symbol: "SOL/USDT",
    name: "Solana Perpetual",
    direction: "LONG",
    setup: "Momentum Breakout",
    strategy: "Momentum",
    timeframe: "1H",
    confidence: 86,
    marketRegime: "Aggressive Momentum",
    riskState: "MEDIUM",
    detectedAt: "14m ago",
    detectedTimestamp: Date.now() - 840000,
    status: "Confirmed",
    price: 248.6,
    change24h: 4.85,
    volumeState: "Very High (+42.1%)",
    volatilityState: "High (ATR 4.2%)",
    riskReward: "3.2 R:R",
    targetPriceEst: 268.0,
    stopLossEst: 241.5,
    supportingEvidence: [
      {
        category: "Volume",
        signal: "Breakout Volume Surge",
        value: "1.64M SOL / 24h",
        polarity: "positive",
        interpretation: "Clear volume expansion breaking historical range high at $242.",
      },
      {
        category: "Technical",
        signal: "MACD Histogram",
        value: "+8.6 Strong Expansion",
        polarity: "positive",
        interpretation: "Accelerating upward velocity across 15M and 1H candles.",
      },
      {
        category: "Market",
        signal: "Orderbook Bid Replenishment",
        value: "3:1 Bid/Ask Ratio",
        polarity: "positive",
        interpretation: "Strong passive limit order support stepping up behind price.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Volatility",
        signal: "RSI 14 Near Overbought",
        value: "71.4",
        polarity: "negative",
        interpretation: "Short-term pullback or consolidation likely before expansion.",
      },
    ],
    hermesAssessment:
      "High conviction momentum breakout confirmed above $242 resistance. Setup meets all alpha criteria with 86% confidence. Awaiting deterministic risk engine exposure sizing before trade proposal generation.",
    lifecycleStage: "confirmed",
  },
  {
    id: "opp-eth-02",
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    direction: "SHORT",
    setup: "Range Resistance Rejection",
    strategy: "Mean Reversion",
    timeframe: "1H",
    confidence: 76,
    marketRegime: "Range Resistance Distribution",
    riskState: "MEDIUM",
    detectedAt: "22m ago",
    detectedTimestamp: Date.now() - 1320000,
    status: "Investigating",
    price: 4321.2,
    change24h: 1.18,
    volumeState: "Declining on Up-Moves",
    volatilityState: "Moderate",
    riskReward: "2.6 R:R",
    targetPriceEst: 4220,
    stopLossEst: 4390,
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Upper Wick Exhaustion",
        value: "$4,380 Rejection",
        polarity: "positive",
        interpretation: "Multiple failed attempts to establish acceptance above range high.",
      },
      {
        category: "Volume",
        signal: "Spot Taker Sell Skew",
        value: "-14,200 ETH Delta",
        polarity: "positive",
        interpretation: "Significant sell market orders hitting bids near $4,380.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Market",
        signal: "BTC Beta Sympathy",
        value: "BTC Continuing Higher",
        polarity: "negative",
        interpretation: "Broad market tailwinds may lift ETH despite local resistance.",
      },
    ],
    hermesAssessment:
      "ETH intraday distribution pattern detected beneath $4,390 resistance. Short thesis has 76% confidence but is vulnerable if BTC pushes through $113,500.",
    lifecycleStage: "investigating",
  },
  {
    id: "opp-btc-02",
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    direction: "SHORT",
    setup: "Mean Reversion Pullback",
    strategy: "Mean Reversion",
    timeframe: "15M",
    confidence: 54,
    marketRegime: "Extended Overbought",
    riskState: "HIGH",
    detectedAt: "35m ago",
    detectedTimestamp: Date.now() - 2100000,
    status: "Weakening",
    price: 112482.32,
    change24h: 2.41,
    volumeState: "Absorbed by Bids",
    volatilityState: "High",
    riskReward: "1.6 R:R",
    targetPriceEst: 111200,
    stopLossEst: 112950,
    supportingEvidence: [
      {
        category: "Technical",
        signal: "15M Bearish Divergence",
        value: "RSI Lower High",
        polarity: "positive",
        interpretation: "Local momentum waning on 15m timeframe.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Market",
        signal: "1H Trend Dominance",
        value: "Strong Bullish",
        polarity: "negative",
        interpretation: "Higher timeframe flow easily overwhelms 15m exhaustion.",
      },
      {
        category: "Volume",
        signal: "Persistent Spot Buys",
        value: "Aggressive absorption",
        polarity: "negative",
        interpretation: "Sellers failing to create downward price follow-through.",
      },
    ],
    hermesAssessment:
      "Setup weakening rapidly. 15m bearish divergence is being absorbed by higher-timeframe spot buying. Hermes will downgrade or expire this setup if $112,800 is breached.",
    lifecycleStage: "monitoring",
  },
  {
    id: "opp-btc-03",
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    direction: "LONG",
    setup: "Volatility Compression Pop",
    strategy: "Volatility Compression",
    timeframe: "4H",
    confidence: 68,
    marketRegime: "Squeeze Expansion",
    riskState: "LOW",
    detectedAt: "48m ago",
    detectedTimestamp: Date.now() - 2880000,
    status: "New",
    price: 112482.32,
    change24h: 2.41,
    volumeState: "Building from Base",
    volatilityState: "Compressing ATR",
    riskReward: "2.5 R:R",
    targetPriceEst: 116400,
    stopLossEst: 110100,
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Bollinger Band Squeeze",
        value: "Bandwidth at 30-day low",
        polarity: "positive",
        interpretation: "Compression cycles typically precede sustained multi-day trends.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Market",
        signal: "Directional Bias Unconfirmed",
        value: "Awaiting candle close",
        polarity: "neutral",
        interpretation: "Requires 4H bar close above $112,600 to confirm breakout direction.",
      },
    ],
    hermesAssessment:
      "New compression setup identified. Squeeze metric reached historical percentile (top 5% tightness). Monitoring breakout vector.",
    lifecycleStage: "detected",
  },
  {
    id: "opp-eth-03",
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    direction: "LONG",
    setup: "Support Liquidity Sweep",
    strategy: "Liquidity Sweep",
    timeframe: "1D",
    confidence: 82,
    marketRegime: "Major Trend Support",
    riskState: "LOW",
    detectedAt: "1h 12m ago",
    detectedTimestamp: Date.now() - 4320000,
    status: "Confirmed",
    price: 4321.2,
    change24h: 1.18,
    volumeState: "High on Reversal Wick",
    volatilityState: "Normal",
    riskReward: "3.5 R:R",
    targetPriceEst: 4680,
    stopLossEst: 4180,
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Daily 200 EMA Defense",
        value: "Bullish Hammer Candle",
        polarity: "positive",
        interpretation: "Institutional long-term moving average successfully defended.",
      },
      {
        category: "Market",
        signal: "Liquidation Cascade Absorption",
        value: "$42M Longs Liquidated",
        polarity: "positive",
        interpretation: "Weak hands flushed; open interest reset allows organic upside.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Risk",
        signal: "Daily Timeframe Latency",
        value: "Requires multi-day holding",
        polarity: "neutral",
        interpretation: "Position sizing must accommodate larger stop distance.",
      },
    ],
    hermesAssessment:
      "High probability macro structural support defense. Confirmed by clean rejection wick and liquidity absorption. Candidate for proposal queue.",
    lifecycleStage: "confirmed",
  },
  {
    id: "opp-btc-04",
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    direction: "SHORT",
    setup: "Orderbook Imbalance Short",
    strategy: "Mean Reversion",
    timeframe: "15M",
    confidence: 39,
    marketRegime: "Trending Upward",
    riskState: "HIGH",
    detectedAt: "3h ago",
    detectedTimestamp: Date.now() - 10800000,
    status: "Expired",
    price: 112482.32,
    change24h: 2.41,
    volumeState: "Overwhelmed",
    volatilityState: "High",
    riskReward: "1.2 R:R",
    targetPriceEst: 111000,
    stopLossEst: 112900,
    supportingEvidence: [
      {
        category: "Technical",
        signal: "Local Resistance",
        value: "Invalidated",
        polarity: "negative",
        interpretation: "Setup stopped out by upward volume continuation.",
      },
    ],
    contradictingEvidence: [
      {
        category: "Technical",
        signal: "Stop Loss Invalidation Hit",
        value: "Breached at $112,500",
        polarity: "negative",
        interpretation: "Invalidation rule triggered; setup terminated.",
      },
    ],
    hermesAssessment:
      "Setup expired due to invalidation. Spot buyers cleared all local overhead ask walls, invalidating short thesis. Preserved in history for model learning.",
    lifecycleStage: "detected",
  },
];
