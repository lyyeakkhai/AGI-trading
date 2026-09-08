/**
 * Mock Market & Candlestick Data Architecture for AGI Trading
 * Provides deterministic, realistic OHLCV datasets, AI markers, and position contexts.
 */

import { Time } from "lightweight-charts";
import { PositionSideType } from "@/features/trading/components/PositionSide";
import { RiskLevel } from "@/features/trading/components/RiskBadge";
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


// Additional Pre-generated timeframes

const xrpTimeframes = generateTimeframeData(0.55, 0.62, 0.02, 100000, 707);
const adaTimeframes = generateTimeframeData(0.40, 0.45, 0.015, 200000, 808);
const linkTimeframes = generateTimeframeData(15.0, 18.2, 0.025, 50000, 909);

const bnbTimeframes = generateTimeframeData(580, 594.3, 0.005, 500, 404);
const avaxTimeframes = generateTimeframeData(34, 38.2, 0.015, 20000, 505);
const dogeTimeframes = generateTimeframeData(0.14, 0.162, 0.018, 500000, 606);

// Additional markers
function getBasicMarkers(candles: CandleData[], color: string, type: "BULLISH" | "BEARISH"): AIMarketMarker[] {
  if (candles.length < 50) return [];
  const pos: "belowBar" | "aboveBar" = type === "BULLISH" ? "belowBar" : "aboveBar";
  const shape: "arrowUp" | "arrowDown" = type === "BULLISH" ? "arrowUp" : "arrowDown";
  return [
    {
      time: candles[candles.length - 10].time,
      position: pos,
      color: color,
      shape: shape,
      text: type === "BULLISH" ? "◆ VOL SURGE" : "◆ EXHAUSTION",
      description: "AI pattern recognition signal",
      confidence: 75,
    }
  ];
}

export const mockMarketDetails: Record<string, MarketDetail> = {

  "XRP-USDT": {
    symbol: "XRP/USDT",
    name: "Ripple",
    baseAsset: "XRP",
    quoteAsset: "USDT",
    price: 0.62,
    change24h: 12.5,
    high24h: 0.65,
    low24h: 0.54,
    volume24h: "545M XRP",
    quoteVolume24h: "$337M",
    fundingRate: 0.015,
    openInterest: "$150M",
    regime: "Momentum Breakout",
    trend: "BULLISH",
    volatility: "HIGH",
    spread: "$0.0001 (0.01%)",
    orderBook: { bids: [{price: 0.619, size: 50000}], asks: [{price: 0.621, size: 45000}] },
    technicals: { rsi14: 82, macd: "Bullish (+0.05)", ema20: 0.58, ema50: 0.55, ema200: 0.50, support: 0.55, resistance: 0.65 },
    hermes: { state: "ANALYZING", summary: "Regulatory news breakout.", reasoning: "Volume expansion.", confidence: 90, signalType: "Long", lastAudit: "Just now" },
    timeframes: xrpTimeframes,
    aiMarkers: { "1h": getBasicMarkers(xrpTimeframes["1h"], "#00E5FF", "BULLISH"), "15m": [], "4h": [], "1m": [], "5m": [], "1D": [] },
  },
  "ADA-USDT": {
    symbol: "ADA/USDT",
    name: "Cardano",
    baseAsset: "ADA",
    quoteAsset: "USDT",
    price: 0.45,
    change24h: -1.2,
    high24h: 0.47,
    low24h: 0.44,
    volume24h: "120M ADA",
    quoteVolume24h: "$54M",
    fundingRate: 0.001,
    openInterest: "$45M",
    regime: "Range Bound",
    trend: "NEUTRAL",
    volatility: "LOW",
    spread: "$0.0002 (0.04%)",
    orderBook: { bids: [{price: 0.449, size: 10000}], asks: [{price: 0.451, size: 12000}] },
    technicals: { rsi14: 48, macd: "Neutral", ema20: 0.46, ema50: 0.45, ema200: 0.40, support: 0.43, resistance: 0.48 },
    hermes: { state: "MONITORING", summary: "Consolidating.", reasoning: "Low volume.", confidence: 45, signalType: "None", lastAudit: "1 hr ago" },
    timeframes: adaTimeframes,
    aiMarkers: { "1h": [], "15m": [], "4h": [], "1m": [], "5m": [], "1D": [] },
  },
  "LINK-USDT": {
    symbol: "LINK/USDT",
    name: "Chainlink",
    baseAsset: "LINK",
    quoteAsset: "USDT",
    price: 18.20,
    change24h: 4.5,
    high24h: 18.5,
    low24h: 17.0,
    volume24h: "5M LINK",
    quoteVolume24h: "$91M",
    fundingRate: 0.01,
    openInterest: "$75M",
    regime: "Steady Uptrend",
    trend: "BULLISH",
    volatility: "MODERATE",
    spread: "$0.01 (0.05%)",
    orderBook: { bids: [{price: 18.15, size: 2000}], asks: [{price: 18.25, size: 2200}] },
    technicals: { rsi14: 65, macd: "Bullish (+0.4)", ema20: 17.5, ema50: 16.8, ema200: 15.0, support: 17.0, resistance: 19.5 },
    hermes: { state: "MONITORING", summary: "Uptrend intact.", reasoning: "Higher lows.", confidence: 78, signalType: "Long", lastAudit: "2 min ago" },
    timeframes: linkTimeframes,
    aiMarkers: { "1h": getBasicMarkers(linkTimeframes["1h"], "#00E5FF", "BULLISH"), "15m": [], "4h": [], "1m": [], "5m": [], "1D": [] },
  },


  "BNB-USDT": {
    symbol: "BNB/USDT",
    name: "Binance Coin",
    baseAsset: "BNB",
    quoteAsset: "USDT",
    price: 594.30,
    change24h: 1.2,
    high24h: 605.0,
    low24h: 582.0,
    volume24h: "45,200 BNB",
    quoteVolume24h: "$26.8M",
    fundingRate: 0.005,
    openInterest: "$180M",
    regime: "Range Bound",
    trend: "NEUTRAL",
    volatility: "LOW",
    spread: "$0.10 (0.016%)",
    orderBook: { bids: [{price: 594.2, size: 10}, {price: 594.0, size: 25}], asks: [{price: 594.4, size: 12}, {price: 594.5, size: 30}] },
    technicals: { rsi14: 55, macd: "Neutral (+0.5)", ema20: 590, ema50: 585, ema200: 560, support: 580, resistance: 605 },
    hermes: { state: "MONITORING", summary: "Low volatility consolidation.", reasoning: "No clear edge in current structure.", confidence: 50, signalType: "None", lastAudit: "10 min ago" },
    timeframes: bnbTimeframes,
    aiMarkers: { "1h": getBasicMarkers(bnbTimeframes["1h"], "#00E5FF", "BULLISH"), "15m": [], "4h": [], "1m": [], "5m": [], "1D": [] },
  },
  "AVAX-USDT": {
    symbol: "AVAX/USDT",
    name: "Avalanche",
    baseAsset: "AVAX",
    quoteAsset: "USDT",
    price: 38.20,
    change24h: 8.5,
    high24h: 39.5,
    low24h: 35.0,
    volume24h: "1.2M AVAX",
    quoteVolume24h: "$45.8M",
    fundingRate: 0.025,
    openInterest: "$110M",
    regime: "Momentum Breakout",
    trend: "BULLISH",
    volatility: "HIGH",
    spread: "$0.01 (0.02%)",
    orderBook: { bids: [{price: 38.15, size: 1000}, {price: 38.0, size: 2500}], asks: [{price: 38.25, size: 1200}, {price: 38.3, size: 3000}] },
    technicals: { rsi14: 78, macd: "Strong Bullish (+1.2)", ema20: 36, ema50: 34, ema200: 30, support: 36, resistance: 40 },
    hermes: { state: "ANALYZING", summary: "Strong breakout detected.", reasoning: "Volume expansion supports trend.", confidence: 85, signalType: "Long", lastAudit: "1 min ago" },
    timeframes: avaxTimeframes,
    aiMarkers: { "1h": getBasicMarkers(avaxTimeframes["1h"], "#00E5FF", "BULLISH"), "15m": [], "4h": [], "1m": [], "5m": [], "1D": [] },
  },
  "DOGE-USDT": {
    symbol: "DOGE/USDT",
    name: "Dogecoin",
    baseAsset: "DOGE",
    quoteAsset: "USDT",
    price: 0.162,
    change24h: -3.2,
    high24h: 0.170,
    low24h: 0.155,
    volume24h: "145M DOGE",
    quoteVolume24h: "$23.4M",
    fundingRate: -0.01,
    openInterest: "$85M",
    regime: "Mean Reversion",
    trend: "BEARISH",
    volatility: "MODERATE",
    spread: "$0.0001 (0.06%)",
    orderBook: { bids: [{price: 0.161, size: 100000}, {price: 0.160, size: 250000}], asks: [{price: 0.163, size: 120000}, {price: 0.164, size: 300000}] },
    technicals: { rsi14: 42, macd: "Bearish (-0.002)", ema20: 0.165, ema50: 0.168, ema200: 0.15, support: 0.155, resistance: 0.170 },
    hermes: { state: "MONITORING", summary: "Pullback to support.", reasoning: "Testing local demands.", confidence: 60, signalType: "Wait", lastAudit: "5 min ago" },
    timeframes: dogeTimeframes,
    aiMarkers: { "1h": getBasicMarkers(dogeTimeframes["1h"], "#FF3B30", "BEARISH"), "15m": [], "4h": [], "1m": [], "5m": [], "1D": [] },
  },

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

export const watchlistSymbols = ["BTC-USDT", "ETH-USDT", "SOL-USDT", "BNB-USDT", "AVAX-USDT", "DOGE-USDT", "XRP-USDT", "ADA-USDT", "LINK-USDT"];
