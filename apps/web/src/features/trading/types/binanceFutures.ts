export interface OrderBookRow {
  price: number;
  size: number;
  sum: number;
  depthPercent: number;
}

export interface TradeRecord {
  id: string;
  price: number;
  amount: number;
  time: string;
  side: "buy" | "sell";
}

export interface FuturesTickerStats {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  countdownFormatted: string;
  high24h: number;
  low24h: number;
  volumeBtc: number;
  volumeUsdt: number;
  openInterestUsdt: number;
}

export type MarginMode = "cross" | "isolated";
export type FuturesOrderType = "limit" | "market" | "conditional";
export type TimeInForce = "GTC" | "IOC" | "FOK";

export interface TickerMarqueeItem {
  symbol: string;
  changePercent: number;
  price: number;
}

export interface PositionRow {
  symbol: string;
  size: number;
  entryPrice: number;
  breakEvenPrice: number;
  markPrice: number;
  liqPrice: number;
  marginRatio: number;
  margin: number;
  pnl: number;
  roi: number;
  estFundingFee: number;
}
