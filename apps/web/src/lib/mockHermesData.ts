/**
 * Centralized Deterministic Mock Data Architecture for Hermes AI Intelligence
 * AGI Trading System Source of Truth for Hermes Agent
 */

import { HermesStateType } from "@/components/ai/AIStatusIndicator";
import { PositionSideType } from "@/components/trading/PositionSide";
import { RiskLevel } from "@/components/trading/RiskBadge";

export type HermesVisualState =
  | "monitoring"
  | "analyzing"
  | "researching"
  | "opportunity"
  | "proposal"
  | "approval"
  | "executing"
  | "completed";

export interface StateDefinition {
  state: HermesVisualState;
  title: string;
  badgeLabel: string;
  description: string;
  animationType: string;
  accentColor: string;
}

export interface InvestigationDetail {
  symbol: string;
  structure: "Bullish" | "Bearish" | "Neutral" | "Compression";
  momentum: "Low" | "Moderate" | "Strong" | "Divergent";
  volatility: "Low" | "Moderate" | "Elevated" | "Extreme";
  volume: string;
  regime: string;
  timeframe: string;
  confidence: number;
  assessment: string;
  keyLevels: {
    support: number;
    resistance: number;
    pivot: number;
  };
}

export interface EvidenceItem {
  category: "Technical" | "Market & Liquidity" | "Risk Engine";
  signal: string;
  value: string;
  polarity: "positive" | "neutral" | "negative";
  weight: "High" | "Medium" | "Low";
}

export interface MarketFocusItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  attentionLevel: "High Attention" | "Normal Attention" | "Active Observation";
  attentionReason: string;
}

export interface ToolActivityItem {
  id: string;
  tool: string;
  description: string;
  status: "Completed" | "Running" | "Waiting" | "Interlocked";
  latency: string;
  lastExecuted: string;
}

export interface SpecialistAgent {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Monitoring" | "Ready";
  specialization: string;
  activeTask: string;
}

export interface MemoryContextData {
  recentContext: string;
  previousSetup: string;
  historicalWinRate: number;
  lastReviewed: string;
  learnedAnchors: string[];
}

export interface IntelligenceTimelineEvent {
  id: string;
  timestamp: string;
  category: "DATA" | "TECH" | "VOL" | "SCAN" | "HERMES";
  title: string;
  description: string;
  symbol?: string;
  status?: "OK" | "ALERT" | "NOTICE";
}

export interface OpportunityPreviewItem {
  symbol: string;
  side: PositionSideType;
  setup: string;
  confidence: number;
  status: "Monitoring" | "Awaiting Validation" | "Ready";
  riskReward: string;
  timeHorizon: string;
}

export interface TradeProposalDraft {
  hasProposal: boolean;
  proposalId?: string;
  symbol?: string;
  side?: PositionSideType;
  entryPrice?: number;
  stopPrice?: number;
  targetPrice?: number;
  riskPct?: number;
  riskReward?: string;
  confidence?: number;
  supportingEvidence?: string[];
  contradictingEvidence?: string[];
  riskEngineDecision?: "PASS" | "REVIEW" | "REJECT";
  ownerApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

export interface CommandMessage {
  id: string;
  sender: "user" | "hermes";
  text: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export const hermesStateDefinitions: Record<HermesVisualState, StateDefinition> = {
  monitoring: {
    state: "monitoring",
    title: "Monitoring",
    badgeLabel: "MONITORING",
    description: "Continuous passive surveillance of multi-exchange orderbooks, CVD, and candlestick closes.",
    animationType: "pulse-slow",
    accentColor: "#00E5FF",
  },
  analyzing: {
    state: "analyzing",
    title: "Analyzing",
    badgeLabel: "ANALYZING",
    description: "Evaluating quantitative indicators, liquidity imbalances, and multi-timeframe moving averages.",
    animationType: "pulse-fast",
    accentColor: "#22DFFF",
  },
  researching: {
    state: "researching",
    title: "Researching",
    badgeLabel: "RESEARCHING",
    description: "Cross-referencing historical regime databases and statistical edge distributions.",
    animationType: "rotating-signal",
    accentColor: "#63EBFF",
  },
  opportunity: {
    state: "opportunity",
    title: "Opportunity Detected",
    badgeLabel: "OPPORTUNITY",
    description: "High-probability market edge identified meeting alpha criteria with >70% confidence.",
    animationType: "cyan-emphasis",
    accentColor: "#00E5FF",
  },
  proposal: {
    state: "proposal",
    title: "Proposal Ready",
    badgeLabel: "PROPOSAL READY",
    description: "Structured trade decision document generated with precise entry, stop, and take-profit targets.",
    animationType: "stable-highlight",
    accentColor: "#00E5FF",
  },
  approval: {
    state: "approval",
    title: "Awaiting Approval",
    badgeLabel: "AWAITING APPROVAL",
    description: "Proposal queued for explicit owner authorization; execution engine locked.",
    animationType: "attention-pulse",
    accentColor: "#F59E0B",
  },
  executing: {
    state: "executing",
    title: "Executing",
    badgeLabel: "EXECUTING",
    description: "Transmitting order parameters to deterministic exchange execution bridge.",
    animationType: "active-stream",
    accentColor: "#00E5FF",
  },
  completed: {
    state: "completed",
    title: "Completed",
    badgeLabel: "COMPLETED",
    description: "Execution validated on exchange and logged into immutable audit trail.",
    animationType: "calm-static",
    accentColor: "#00E676",
  },
};

export const mockHermesInvestigation: InvestigationDetail = {
  symbol: "BTC/USDT",
  structure: "Bullish",
  momentum: "Moderate",
  volatility: "Elevated",
  volume: "Above Average (+18.4%)",
  regime: "Trending Expansion",
  timeframe: "1H",
  confidence: 74,
  assessment:
    "BTC remains structurally bullish across 1H and 4H horizons. However, elevated intraday volatility and bid-ask spread expansion reduce setup purity. Hermes is monitoring for a secondary volume absorption confirmation before advancing to a trade proposal.",
  keyLevels: {
    support: 110240,
    resistance: 113500,
    pivot: 111850,
  },
};

export const mockEvidenceItems: EvidenceItem[] = [
  {
    category: "Technical",
    signal: "Price vs 20 EMA",
    value: "Above ($111,850)",
    polarity: "positive",
    weight: "High",
  },
  {
    category: "Technical",
    signal: "Market Structure",
    value: "Higher High / Higher Low",
    polarity: "positive",
    weight: "High",
  },
  {
    category: "Technical",
    signal: "RSI (14)",
    value: "61.4 (Expansion room)",
    polarity: "neutral",
    weight: "Medium",
  },
  {
    category: "Technical",
    signal: "Volume vs 20-period avg",
    value: "+18.4% above mean",
    polarity: "positive",
    weight: "Medium",
  },
  {
    category: "Market & Liquidity",
    signal: "BTC Market Dominance",
    value: "56.4% (Stable)",
    polarity: "neutral",
    weight: "Medium",
  },
  {
    category: "Market & Liquidity",
    signal: "ETH/BTC Correlation",
    value: "0.82 (High co-movement)",
    polarity: "neutral",
    weight: "Low",
  },
  {
    category: "Market & Liquidity",
    signal: "CVD Spot vs Perp",
    value: "Net spot buyer absorption",
    polarity: "positive",
    weight: "High",
  },
  {
    category: "Risk Engine",
    signal: "Daily Portfolio Drawdown",
    value: "0.8% (Limit: 3.0%)",
    polarity: "positive",
    weight: "High",
  },
  {
    category: "Risk Engine",
    signal: "Implied Volatility (24h)",
    value: "Elevated (48.2%)",
    polarity: "negative",
    weight: "High",
  },
  {
    category: "Risk Engine",
    signal: "Capital Exposure Cap",
    value: "34.2% (Limit: 50.0%)",
    polarity: "positive",
    weight: "High",
  },
];

export const mockMarketFocusItems: MarketFocusItem[] = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    price: 112482.32,
    change24h: 2.41,
    attentionLevel: "High Attention",
    attentionReason: "Testing $113,500 resistance cluster with positive CVD delta",
  },
  {
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    price: 4321.2,
    change24h: 1.18,
    attentionLevel: "Normal Attention",
    attentionReason: "Consolidating beneath 4H resistance with flat open interest",
  },
  {
    symbol: "SOL/USDT",
    name: "Solana Perpetual",
    price: 248.6,
    change24h: 4.85,
    attentionLevel: "Active Observation",
    attentionReason: "Momentum continuation scan active; observing for pullback",
  },
];

export const mockToolActivities: ToolActivityItem[] = [
  {
    id: "tool-1",
    tool: "Market Data Stream",
    description: "Binance Spot & Futures Level 2 orderbook ingestion",
    status: "Completed",
    latency: "12ms",
    lastExecuted: "Just now",
  },
  {
    id: "tool-2",
    tool: "Technical Analysis Engine",
    description: "EMA 20/50/200, MACD, RSI (14), ATR cross-evaluation",
    status: "Completed",
    latency: "34ms",
    lastExecuted: "3 sec ago",
  },
  {
    id: "tool-3",
    tool: "Volatility & Liquidity Scanner",
    description: "Evaluating 24h spread expansion and liquidation walls",
    status: "Completed",
    latency: "18ms",
    lastExecuted: "8 sec ago",
  },
  {
    id: "tool-4",
    tool: "Opportunity Scanner",
    description: "Statistical breakout pattern matching against historical regimes",
    status: "Running",
    latency: "Active",
    lastExecuted: "Continuous",
  },
  {
    id: "tool-5",
    tool: "Deterministic Risk Engine",
    description: "Pre-trade loss cap, max leverage, and VaR validation interlock",
    status: "Waiting",
    latency: "Standby",
    lastExecuted: "Awaiting proposal",
  },
  {
    id: "tool-6",
    tool: "Execution Bridge",
    description: "Hardware-isolated trade dispatch requiring explicit owner signing",
    status: "Interlocked",
    latency: "Locked",
    lastExecuted: "Arm state: READY",
  },
];

export const mockAgentTeam: SpecialistAgent[] = [
  {
    id: "agent-1",
    name: "Hermes Core",
    role: "Main Trading Intelligence",
    status: "Active",
    specialization: "Holistic market synthesis, hypothesis formulation, and proposal creation",
    activeTask: "Monitoring BTC/USDT 1H breakout structure",
  },
  {
    id: "agent-2",
    name: "Quant Analyst",
    role: "Quantitative & Technical Model",
    status: "Active",
    specialization: "Mean reversion math, moving average alignment, volatility modeling",
    activeTask: "Computing 14-period CVD delta divergence",
  },
  {
    id: "agent-3",
    name: "Market Intelligence",
    role: "Order Flow & Liquidity Specialist",
    status: "Monitoring",
    specialization: "Cross-exchange liquidation depth, funding rate shifts, open interest",
    activeTask: "Scanning derivative basis spread vs CME futures",
  },
  {
    id: "agent-4",
    name: "Risk Analyst",
    role: "Deterministic Safety Guardian",
    status: "Ready",
    specialization: "Drawdown caps, portfolio exposure constraints, owner approval gating",
    activeTask: "Standing by for proposal validation check",
  },
];

export const mockMemoryContext: MemoryContextData = {
  recentContext: "BTC bullish structure observed across 1H and 4H horizons.",
  previousSetup: "BTC breakout continuation (Entry $110,240, Target $114,800)",
  historicalWinRate: 74,
  lastReviewed: "Today, 12:31 UTC",
  learnedAnchors: [
    "Overhead resistance cluster established at $113,500.",
    "Support liquidity band confirmed between $110,000 - $110,240.",
    "High volatility intraday wicks occur frequently around 14:00 UTC London fix.",
  ],
};

export const mockIntelligenceTimeline: IntelligenceTimelineEvent[] = [
  {
    id: "ev-1",
    timestamp: "12:42:08",
    category: "DATA",
    title: "Market data updated",
    description: "BTC/USDT 1H candle closed at $112,482. Volume confirmed at 14,842 BTC.",
    symbol: "BTC/USDT",
    status: "OK",
  },
  {
    id: "ev-2",
    timestamp: "12:42:10",
    category: "TECH",
    title: "Technical analysis completed",
    description: "Market structure remains bullish. Price holding above 20 EMA with positive slope.",
    symbol: "BTC/USDT",
    status: "OK",
  },
  {
    id: "ev-3",
    timestamp: "12:42:14",
    category: "VOL",
    title: "Volatility assessment",
    description: "Volatility increased +12% above recent 20-period baseline. Spread widened by $0.15.",
    symbol: "BTC/USDT",
    status: "NOTICE",
  },
  {
    id: "ev-4",
    timestamp: "12:42:18",
    category: "SCAN",
    title: "Opportunity scan completed",
    description: "Setup detected; confidence evaluated at 74%. Awaiting secondary confirmation.",
    symbol: "BTC/USDT",
    status: "OK",
  },
  {
    id: "ev-5",
    timestamp: "12:42:22",
    category: "HERMES",
    title: "Hermes status sync",
    description: "Continuing active surveillance across BTC and ETH orderbook spreads.",
    status: "OK",
  },
  {
    id: "ev-6",
    timestamp: "12:38:15",
    category: "DATA",
    title: "CVD imbalance detected",
    description: "Aggressive market buy orders absorbed without proportional price progression.",
    symbol: "BTC/USDT",
    status: "NOTICE",
  },
];

export const mockOpportunitiesPreview: OpportunityPreviewItem[] = [
  {
    symbol: "BTC/USDT",
    side: "LONG",
    setup: "Breakout Continuation v2",
    confidence: 78,
    status: "Monitoring",
    riskReward: "2.8 R:R",
    timeHorizon: "4H - 24H",
  },
  {
    symbol: "ETH/USDT",
    side: "SHORT",
    setup: "Range Resistance Exhaustion",
    confidence: 43,
    status: "Monitoring",
    riskReward: "2.1 R:R",
    timeHorizon: "2H - 12H",
  },
];

export const mockProposalPreview: TradeProposalDraft = {
  hasProposal: false, // Default: no proposal active (empty state per spec)
  proposalId: "PROP-BTC-20260904-01",
  symbol: "BTC/USDT",
  side: "LONG",
  entryPrice: 112800,
  stopPrice: 111200,
  targetPrice: 117280,
  riskPct: 0.95,
  riskReward: "2.8 R:R",
  confidence: 84,
  supportingEvidence: [
    "Spot CVD cumulative delta shows persistent absorption",
    "Price consolidated above 20 EMA for 6 consecutive 1H bars",
    "Daily loss limit budget has 2.2% capacity remaining",
  ],
  contradictingEvidence: [
    "Overhead liquidation density near $113,500 may cause short-term resistance",
  ],
  riskEngineDecision: "PASS",
  ownerApprovalStatus: "PENDING",
};

export const cannedCommandResponses: Record<string, string> = {
  "Why is BTC being monitored?":
    "BTC is currently in a Trending Expansion regime on 1H/4H timeframes. Hermes observed spot buyers absorbing liquidity above $111,850 with positive CVD delta, making it the highest priority asset for a potential breakout continuation setup.",
  "Show current opportunities":
    "Hermes is tracking 2 setups: 1) BTC/USDT Potential Long (Breakout Continuation v2, 78% confidence, 2.8 R:R); 2) ETH/USDT Potential Short (Range Resistance Exhaustion, 43% confidence, awaiting confirmation). Neither has reached proposal state yet.",
  "Explain current market regime":
    "The overall market is classified as 'Trending Expansion (Bullish Bias)'. Intraday volatility is moderately elevated (+12% vs 20-period ATR). Capital exposure is 34.2%, leaving 15.8% buffer under the deterministic risk cap.",
  "What is the active risk status?":
    "Deterministic Risk Engine status is NORMAL. Total capital exposure is 34.2% (Limit 50.0%). Daily loss utilized is 0.8% (Cap 3.0%). Trailing drawdown is 2.4% (Cap 5.0%). Execution bridge is interlocked pending owner sign-off.",
};
