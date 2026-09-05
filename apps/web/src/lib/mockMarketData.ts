/**
 * Mock Market & Candlestick Data Architecture for AGI Trading
 * Provides deterministic, realistic OHLCV datasets, AI markers, and position contexts.
 */

import { Time } from "lightweight-charts";
import { PositionSideType } from "@/components/trading/PositionSide";
import { RiskLevel } from "@/components/trading/RiskBadge";
import { HermesStateType } from "@/components/ai/AIStatusIndicator";

export interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AIMarketMarker {
  time: Time;
  position: "aboveBar" | "belowBar" | "inBar";
  color: string;
  shape: "circle" | "square" | "arrowUp" | "arrowDown";
  text: string;
  description?: string;
  confidence?: number;
}

export interface PositionContext {
  symbol: string;
  side: PositionSideType;
  entryPrice: number;
  markPrice: number;
  stopPrice: number;
  targetPrice: number;
  size: string;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  riskReward: string;
  liquidationPrice: number;
  riskLevel: RiskLevel;
}

export interface MarketDetail {
  symbol: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  quoteVolume24h: string;
  fundingRate: number;
  openInterest: string;
  regime: string;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  volatility: "LOW" | "MODERATE" | "HIGH";
  spread: string;
  orderBook: {
    bids: { price: number; size: number }[];
    asks: { price: number; size: number }[];
  };
  technicals: {
    rsi14: number;
    macd: string;
    ema20: number;
    ema50: number;
    ema200: number;
    support: number;
    resistance: number;
  };
  hermes: {
    state: HermesStateType;
    summary: string;
    reasoning: string;
    confidence: number;
    signalType: string;
    lastAudit: string;
  };
  position?: PositionContext;
  timeframes: Record<string, CandleData[]>;
  aiMarkers: Record<string, AIMarketMarker[]>;
}

// Deterministic Pseudo-Random Generator to ensure identical candles on every render
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate realistic OHLCV historical bars ending at targetPrice
function generateCandles(
  basePrice: number,
  targetPrice: number,
  numBars: number,
  intervalSeconds: number,
  volatility: number,
  volumeBase: number,
  seedOffset: number
): CandleData[] {
  const candles: CandleData[] = [];
  // Base timestamp anchored to a fixed recent point in time
  const endTimestamp = 1756944000; // Deterministic UNIX anchor
  const startTimestamp = endTimestamp - numBars * intervalSeconds;

  let currentPrice = basePrice;
  const priceStep = (targetPrice - basePrice) / numBars;

  for (let i = 0; i < numBars; i++) {
    const seed = seedOffset + i * 7;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    const r3 = seededRandom(seed + 2);
    const r4 = seededRandom(seed + 3);

    const open = currentPrice;
    // Walk price towards target + random variance
    const delta = priceStep + (r1 - 0.48) * (currentPrice * volatility);
    const close = i === numBars - 1 ? targetPrice : Math.max(1, open + delta);
    const high = Math.max(open, close) + r2 * (currentPrice * volatility * 0.8);
    const low = Math.min(open, close) - r3 * (currentPrice * volatility * 0.8);
    const volume = Math.round(volumeBase * (0.6 + r4 * 1.2));

    const time = (startTimestamp + i * intervalSeconds) as Time;

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

const intervalMap: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1D": 86400,
};

// Generate timeframes for an asset
function generateTimeframeData(
  startPrice: number,
  currentPrice: number,
  vol: number,
  volBase: number,
  seed: number
): Record<string, CandleData[]> {
  const result: Record<string, CandleData[]> = {};
  for (const [tf, sec] of Object.entries(intervalMap)) {
    const barsCount = tf === "1D" ? 60 : tf === "4h" ? 80 : 100;
    result[tf] = generateCandles(
      startPrice,
      currentPrice,
      barsCount,
      sec,
      vol,
      volBase,
      seed + sec
    );
  }
  return result;
}

// Pre-generate BTC, ETH, and SOL market data
const btcTimeframes = generateTimeframeData(107400, 112482.32, 0.006, 120, 101);
const ethTimeframes = generateTimeframeData(4150, 4321.2, 0.008, 1400, 202);
const solTimeframes = generateTimeframeData(234, 248.6, 0.012, 8500, 303);

// Create AI markers on 1h candles
function getBtcMarkers(candles: CandleData[]): AIMarketMarker[] {
  if (candles.length < 50) return [];
  return [
    {
      time: candles[candles.length - 42].time,
      position: "belowBar",
      color: "#00E5FF",
      shape: "circle",
      text: "◆ AI BREAKOUT",
      description: "Spot absorption breakout confirmed above $109,200",
      confidence: 89,
    },
    {
      time: candles[candles.length - 24].time,
      position: "aboveBar",
      color: "#22DFFF",
      shape: "square",
      text: "◆ CVD DIVERGENCE",
      description: "Aggressive short absorption at $110,800 support",
      confidence: 84,
    },
    {
      time: candles[candles.length - 6].time,
      position: "belowBar",
      color: "#00E5FF",
      shape: "arrowUp",
      text: "◆ VOL SURGE",
      description: "High volume continuation signal",
      confidence: 82,
    },
  ];
}

function getEthMarkers(candles: CandleData[]): AIMarketMarker[] {
  if (candles.length < 50) return [];
  return [
    {
      time: candles[candles.length - 35].time,
      position: "aboveBar",
      color: "#00E5FF",
      shape: "circle",
      text: "◆ EXHAUSTION",
      description: "Upper wick rejection at $4,380 resistance",
      confidence: 86,
    },
    {
      time: candles[candles.length - 12].time,
      position: "aboveBar",
      color: "#22DFFF",
      shape: "square",
      text: "◆ SHORT ENTRY",
      description: "Distribution confirmed by orderbook delta",
      confidence: 78,
    },
  ];
}

function getSolMarkers(candles: CandleData[]): AIMarketMarker[] {
  if (candles.length < 50) return [];
  return [
    {
      time: candles[candles.length - 18].time,
      position: "belowBar",
      color: "#00E5FF",
      shape: "arrowUp",
      text: "◆ MOMENTUM",
      description: "Volume breakout past $242 resistance",
      confidence: 85,
    },
  ];
}

export const mockMarketDetails: Record<string, MarketDetail> = {
  "BTC-USDT": {
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    baseAsset: "BTC",
    quoteAsset: "USDT",
    price: 112482.32,
    change24h: 2.41,
    high24h: 113450.0,
    low24h: 109820.0,
    volume24h: "14,842 BTC",
    quoteVolume24h: "$1.67B",
    fundingRate: 0.0104,
    openInterest: "$2.42B",
    regime: "Trending Expansion (Bullish)",
    trend: "BULLISH",
    volatility: "MODERATE",
    spread: "$0.50 (0.0004%)",
    orderBook: {
      bids: [
        { price: 112481.5, size: 2.45 },
        { price: 112480.0, size: 5.12 },
        { price: 112478.0, size: 8.94 },
        { price: 112475.0, size: 14.2 },
        { price: 112470.0, size: 22.8 },
      ],
      asks: [
        { price: 112482.5, size: 1.82 },
        { price: 112483.5, size: 4.35 },
        { price: 112485.0, size: 7.62 },
        { price: 112488.0, size: 12.1 },
        { price: 112492.0, size: 19.5 },
      ],
    },
    technicals: {
      rsi14: 64.2,
      macd: "Bullish Crossover (+142.5)",
      ema20: 111850.0,
      ema50: 110420.0,
      ema200: 106800.0,
      support: 110240.0,
      resistance: 113500.0,
    },
    hermes: {
      state: "MONITORING",
      summary: "BTC continuous upward expansion with positive spot buyer absorption.",
      reasoning:
        "Momentum remains elevated across 1H and 4H horizons. Orderbook liquidity skew indicates high bid replenishment at $111,800. Minimal liquidation risk detected.",
      confidence: 84,
      signalType: "Trend Continuation Long",
      lastAudit: "1 min ago",
    },
    position: {
      symbol: "BTC/USDT",
      side: "LONG",
      entryPrice: 110240.0,
      markPrice: 112482.32,
      stopPrice: 108900.0,
      targetPrice: 114800.0,
      size: "0.65 BTC",
      unrealizedPnL: 1457.51,
      unrealizedPnLPct: 2.03,
      riskReward: "2.8",
      liquidationPrice: 98400.0,
      riskLevel: "LOW",
    },
    timeframes: btcTimeframes,
    aiMarkers: {
      "1h": getBtcMarkers(btcTimeframes["1h"]),
      "15m": getBtcMarkers(btcTimeframes["15m"]),
      "4h": getBtcMarkers(btcTimeframes["4h"]),
      "1m": [],
      "5m": [],
      "1D": [],
    },
  },
  "ETH-USDT": {
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    baseAsset: "ETH",
    quoteAsset: "USDT",
    price: 4321.2,
    change24h: 1.18,
    high24h: 4390.0,
    low24h: 4245.0,
    volume24h: "182,400 ETH",
    quoteVolume24h: "$788M",
    fundingRate: 0.0082,
    openInterest: "$1.12B",
    regime: "Range Resistance Distribution",
    trend: "NEUTRAL",
    volatility: "LOW",
    spread: "$0.05 (0.0012%)",
    orderBook: {
      bids: [
        { price: 4321.1, size: 24.5 },
        { price: 4320.8, size: 52.0 },
        { price: 4320.0, size: 108.4 },
        { price: 4318.5, size: 210.0 },
      ],
      asks: [
        { price: 4321.3, size: 18.2 },
        { price: 4321.8, size: 45.1 },
        { price: 4322.5, size: 94.0 },
        { price: 4324.0, size: 180.5 },
      ],
    },
    technicals: {
      rsi14: 52.8,
      macd: "Neutral Consolidation (-12.4)",
      ema20: 4310.0,
      ema50: 4280.0,
      ema200: 4120.0,
      support: 4250.0,
      resistance: 4390.0,
    },
    hermes: {
      state: "ANALYZING",
      summary: "ETH consolidating beneath $4,390 resistance; short thesis remains active.",
      reasoning:
        "High spot taker selling detected on approach to $4,380. Open interest flat. Position trailing stop active at $4,380 entry level.",
      confidence: 76,
      signalType: "Mean Reversion Pullback",
      lastAudit: "3 min ago",
    },
    position: {
      symbol: "ETH/USDT",
      side: "SHORT",
      entryPrice: 4380.0,
      markPrice: 4321.2,
      stopPrice: 4440.0,
      targetPrice: 4220.0,
      size: "4.20 ETH",
      unrealizedPnL: 246.96,
      unrealizedPnLPct: 1.34,
      riskReward: "2.6",
      liquidationPrice: 4890.0,
      riskLevel: "MEDIUM",
    },
    timeframes: ethTimeframes,
    aiMarkers: {
      "1h": getEthMarkers(ethTimeframes["1h"]),
      "15m": getEthMarkers(ethTimeframes["15m"]),
      "4h": getEthMarkers(ethTimeframes["4h"]),
      "1m": [],
      "5m": [],
      "1D": [],
    },
  },
  "SOL-USDT": {
    symbol: "SOL/USDT",
    name: "Solana Perpetual",
    baseAsset: "SOL",
    quoteAsset: "USDT",
    price: 248.6,
    change24h: 4.85,
    high24h: 254.2,
    low24h: 236.4,
    volume24h: "1,640,000 SOL",
    quoteVolume24h: "$408M",
    fundingRate: 0.0142,
    openInterest: "$640M",
    regime: "Aggressive Momentum Breakout",
    trend: "BULLISH",
    volatility: "HIGH",
    spread: "$0.02 (0.008%)",
    orderBook: {
      bids: [
        { price: 248.58, size: 240 },
        { price: 248.5, size: 580 },
        { price: 248.3, size: 1200 },
      ],
      asks: [
        { price: 248.62, size: 180 },
        { price: 248.7, size: 450 },
        { price: 248.9, size: 980 },
      ],
    },
    technicals: {
      rsi14: 71.4,
      macd: "Strong Bullish Expansion (+8.6)",
      ema20: 242.5,
      ema50: 236.0,
      ema200: 218.0,
      support: 242.0,
      resistance: 255.0,
    },
    hermes: {
      state: "MONITORING",
      summary: "SOL strong momentum continuation; observing for breakout pullback confirmation.",
      reasoning:
        "High relative volume and positive funding. No active position currently open. Proposed breakout entry pending risk engine check.",
      confidence: 82,
      signalType: "Breakout Candidate",
      lastAudit: "4 min ago",
    },
    timeframes: solTimeframes,
    aiMarkers: {
      "1h": getSolMarkers(solTimeframes["1h"]),
      "15m": getSolMarkers(solTimeframes["15m"]),
      "4h": getSolMarkers(solTimeframes["4h"]),
      "1m": [],
      "5m": [],
      "1D": [],
    },
  },
};

export const watchlistSymbols = ["BTC-USDT", "ETH-USDT", "SOL-USDT"];
