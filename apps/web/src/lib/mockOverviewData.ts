/**
 * Centralized Typed Mock Data Structure for AGI Trading Overview Command Center
 * Clean separation of concerns; easily swappable with real API endpoints.
 */

import { HermesStateType } from "@/components/ai/AIStatusIndicator";
import { RiskLevel } from "@/components/trading/RiskBadge";
import { PositionSideType } from "@/components/trading/PositionSide";

export interface PortfolioMetrics {
  totalEquity: number;
  equityChange24h: number;
  equityChangePct24h: number;
  availableBalance: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL30d: number;
  realizedPnLPct30d: number;
  exposurePct: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  winRatePct: number;
  dailyLossLimitUsedPct: number;
  dailyLossLimitMaxPct: number;
}

export interface EquityDataPoint {
  time: string;
  value: number;
}

export interface MarketAssetContext {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  high24h: number;
  low24h: number;
  regime: string;
}

export interface HermesOverviewState {
  state: HermesStateType;
  focusAsset: string;
  marketRegime: string;
  latestObservation: string;
  confidenceScore: number;
  riskState: RiskLevel;
  latestActivity: string;
  lastActiveTimestamp: string;
  activeModel: string;
}

export interface OverviewOpportunity {
  id: string;
  symbol: string;
  side: PositionSideType;
  confidence: number;
  strategy: string;
  riskReward: string;
  status: "PROPOSAL READY" | "AWAITING APPROVAL" | "ANALYZING" | "VALIDATING";
  timeDetected: string;
}

export interface OverviewPosition {
  id: string;
  symbol: string;
  side: PositionSideType;
  entryPrice: number;
  markPrice: number;
  size: string;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  riskLevel: RiskLevel;
  duration: string;
}

export interface RiskStatusSummary {
  overallRisk: RiskLevel;
  currentExposurePct: number;
  maxExposureCapPct: number;
  dailyLossCurrentPct: number;
  dailyLossCapPct: number;
  maxDrawdownCurrentPct: number;
  maxDrawdownCapPct: number;
  riskEngineState: "NORMAL" | "WARNING" | "ELEVATED" | "TRIPPED";
  interlockStatus: "ARMED" | "STANDBY" | "ENGAGED";
  marginHealthScore: number;
}

export interface RecentActivityEvent {
  id: string;
  timestamp: string;
  type: "AI" | "RISK" | "ORDER" | "SYSTEM";
  title: string;
  description: string;
  status?: "OK" | "PENDING" | "NOTICE";
}

export const mockPortfolioMetrics: PortfolioMetrics = {
  totalEquity: 24842.18,
  equityChange24h: 482.31,
  equityChangePct24h: 1.98,
  availableBalance: 16342.5,
  unrealizedPnL: 1284.22,
  unrealizedPnLPct: 5.16,
  realizedPnL30d: 3557.96,
  realizedPnLPct30d: 14.32,
  exposurePct: 34.2,
  maxDrawdownPct: 2.4,
  sharpeRatio: 2.41,
  winRatePct: 68.4,
  dailyLossLimitUsedPct: 0.8,
  dailyLossLimitMaxPct: 3.0,
};

export const mockEquityHistories: Record<string, EquityDataPoint[]> = {
  "1D": [
    { time: "00:00", value: 24350 },
    { time: "04:00", value: 24420 },
    { time: "08:00", value: 24390 },
    { time: "12:00", value: 24610 },
    { time: "16:00", value: 24580 },
    { time: "20:00", value: 24790 },
    { time: "24:00", value: 24842 },
  ],
  "1W": [
    { time: "Mon", value: 23800 },
    { time: "Tue", value: 23950 },
    { time: "Wed", value: 24200 },
    { time: "Thu", value: 24110 },
    { time: "Fri", value: 24450 },
    { time: "Sat", value: 24620 },
    { time: "Sun", value: 24842 },
  ],
  "1M": [
    { time: "Week 1", value: 21280 },
    { time: "Week 2", value: 22450 },
    { time: "Week 3", value: 23100 },
    { time: "Week 4", value: 24842 },
  ],
  "3M": [
    { time: "Month 1", value: 18900 },
    { time: "Month 2", value: 21400 },
    { time: "Month 3", value: 24842 },
  ],
  ALL: [
    { time: "Q1", value: 15000 },
    { time: "Q2", value: 18200 },
    { time: "Q3", value: 21500 },
    { time: "Q4", value: 24842 },
  ],
};

export const mockMarketContexts: MarketAssetContext[] = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    price: 112482.5,
    change24h: 2.41,
    volume24h: "$1.84B",
    high24h: 113420.0,
    low24h: 109850.0,
    regime: "Trending Expansion (Bullish)",
  },
  {
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    price: 4321.2,
    change24h: 1.18,
    volume24h: "$842M",
    high24h: 4385.0,
    low24h: 4240.0,
    regime: "Consolidation Range",
  },
  {
    symbol: "SOL/USDT",
    name: "Solana Perpetual",
    price: 248.6,
    change24h: 4.85,
    volume24h: "$420M",
    high24h: 254.0,
    low24h: 236.5,
    regime: "Momentum Breakout",
  },
];

export const mockHermesOverview: HermesOverviewState = {
  state: "MONITORING",
  focusAsset: "BTC/USDT Perp & Spot Spread",
  marketRegime: "Trending Expansion (Bullish Bias)",
  latestObservation:
    "BTC momentum remains positive across 4H/1D windows. Spot CVD shows sustained institutional absorption into overhead resistance at $113,200 with minimal leverage liquidation risk.",
  confidenceScore: 84,
  riskState: "LOW",
  latestActivity: "Evaluated multi-exchange liquidity depth imbalance",
  lastActiveTimestamp: "2 min ago",
  activeModel: "Hermes Core v3.2",
};

export const mockOpportunities: OverviewOpportunity[] = [
  {
    id: "opp-btc-01",
    symbol: "BTC/USDT",
    side: "LONG",
    confidence: 84,
    strategy: "Momentum Breakout v2",
    riskReward: "2.8",
    status: "PROPOSAL READY",
    timeDetected: "12:39 UTC",
  },
  {
    id: "opp-eth-02",
    symbol: "ETH/USDT",
    side: "LONG",
    confidence: 76,
    strategy: "Trend Continuation",
    riskReward: "2.2",
    status: "AWAITING APPROVAL",
    timeDetected: "12:15 UTC",
  },
  {
    id: "opp-sol-03",
    symbol: "SOL/USDT",
    side: "SHORT",
    confidence: 68,
    strategy: "Mean Reversion Exhaustion",
    riskReward: "1.9",
    status: "ANALYZING",
    timeDetected: "11:58 UTC",
  },
];

export const mockPositions: OverviewPosition[] = [
  {
    id: "pos-01",
    symbol: "BTC/USDT",
    side: "LONG",
    entryPrice: 110240.0,
    markPrice: 112482.5,
    size: "0.65 BTC",
    unrealizedPnL: 1457.62,
    unrealizedPnLPct: 2.03,
    riskLevel: "LOW",
    duration: "18h 42m",
  },
  {
    id: "pos-02",
    symbol: "ETH/USDT",
    side: "SHORT",
    entryPrice: 4380.0,
    markPrice: 4321.2,
    size: "4.20 ETH",
    unrealizedPnL: 246.96,
    unrealizedPnLPct: 1.34,
    riskLevel: "MEDIUM",
    duration: "4h 15m",
  },
];

export const mockRiskSummary: RiskStatusSummary = {
  overallRisk: "LOW",
  currentExposurePct: 34.2,
  maxExposureCapPct: 50.0,
  dailyLossCurrentPct: 0.8,
  dailyLossCapPct: 3.0,
  maxDrawdownCurrentPct: 2.4,
  maxDrawdownCapPct: 5.0,
  riskEngineState: "NORMAL",
  interlockStatus: "ARMED",
  marginHealthScore: 94,
};

export const mockRecentActivities: RecentActivityEvent[] = [
  {
    id: "act-1",
    timestamp: "12:42:08",
    type: "AI",
    title: "Hermes completed 4H multi-timeframe BTC analysis",
    description: "Evaluated 14 technical and orderbook features; confidence set to 84%.",
    status: "OK",
  },
  {
    id: "act-2",
    timestamp: "12:39:24",
    type: "AI",
    title: "Trade Proposal Formulated — LONG BTC/USDT",
    description: "Proposed R:R 2.8, Target $116,500, Stop $111,200. Queued for owner approval.",
    status: "NOTICE",
  },
  {
    id: "act-3",
    timestamp: "12:31:10",
    type: "RISK",
    title: "Pre-trade risk verification passed",
    description: "Deterministic check confirmed 0.95% risk budget within 3.0% daily constraint.",
    status: "OK",
  },
  {
    id: "act-4",
    timestamp: "12:20:00",
    type: "SYSTEM",
    title: "Market feeds & depth books synchronized",
    description: "WebSocket latencies: Binance Spot (14ms), Futures (18ms). Feed nominal.",
    status: "OK",
  },
  {
    id: "act-5",
    timestamp: "11:45:12",
    type: "ORDER",
    title: "Position stop-loss adjusted on ETH/USDT",
    description: "Trailing stop advanced to breakeven +0.5% at $4,358.00.",
    status: "OK",
  },
];
