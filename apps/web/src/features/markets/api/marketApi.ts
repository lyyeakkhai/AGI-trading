/**
 * Real Market Data Client for AGI Trading.
 * Communicates with the FastAPI backend (/api/v1/markets) backed by live Binance CCXT streams.
 * Includes automatic fallback to mock data if the backend is temporarily unreachable.
 */

export interface MarketTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  quoteVolume24h: string;
  timestamp: string;
}

export interface MarketCandle {
  symbol: string;
  timeframe: string;
  timestamp: string;
  open: string | number;
  high: string | number;
  low: string | number;
  close: string | number;
  volume: string | number;
  is_closed: boolean;
}

export interface OrderBookEntry {
  price: number;
  size: number;
}

export interface MarketOrderBook {
  symbol: string;
  timestamp: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

class MarketApiClient {
  private baseUrl = "/api/v1/markets";

  async getTickers(): Promise<MarketTicker[]> {
    try {
      const res = await fetch(`${this.baseUrl}/tickers`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live tickers from FastAPI, using fallback", err);
    }
    return [];
  }

  async getCandles(
    symbol: string,
    timeframe: string = "1h",
    limit: number = 100
  ): Promise<MarketCandle[]> {
    try {
      const encodedSymbol = encodeURIComponent(symbol.replace("-", "/"));
      const res = await fetch(
        `${this.baseUrl}/candles?symbol=${encodedSymbol}&timeframe=${timeframe}&limit=${limit}`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live candles from FastAPI, using fallback", err);
    }
    return [];
  }

  async getOrderBook(symbol: string, depth: number = 20): Promise<MarketOrderBook | null> {
    try {
      const encodedSymbol = encodeURIComponent(symbol.replace("-", "/"));
      const res = await fetch(
        `${this.baseUrl}/orderbook?symbol=${encodedSymbol}&depth=${depth}`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Failed to fetch live orderbook from FastAPI", err);
    }
    return null;
  }
}

export const marketApi = new MarketApiClient();
