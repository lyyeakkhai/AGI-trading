"use client";

import { useState, useEffect, useRef } from "react";
import {
  OrderBookRow,
  TradeRecord,
  FuturesTickerStats,
} from "../types/binanceFutures";
import { mockMarketDetails } from "@/lib/mockMarketData";

const INITIAL_TICKER: FuturesTickerStats = {
  symbol: "BTCUSDT",
  lastPrice: 77841.9,
  priceChange: 870.0,
  priceChangePercent: 1.13,
  markPrice: 77829.3,
  indexPrice: 77835.5,
  fundingRate: 0.00558,
  countdownFormatted: "02:17:26",
  high24h: 78115.4,
  low24h: 76000.3,
  volumeBtc: 147438.639,
  volumeUsdt: 11367549926.4,
  openInterestUsdt: 8239420736.4,
};

const INITIAL_ASKS: OrderBookRow[] = [
  { price: 77843.8, size: 77.9, sum: 259.05, depthPercent: 26 },
  { price: 77843.5, size: 155.7, sum: 258.98, depthPercent: 42 },
  { price: 77843.2, size: 77.9, sum: 258.82, depthPercent: 28 },
  { price: 77842.3, size: 155.7, sum: 258.74, depthPercent: 54 },
  { price: 77842.2, size: 77.9, sum: 258.59, depthPercent: 30 },
  { price: 77842.1, size: 19.69, sum: 258.51, depthPercent: 15 },
  { price: 77842.0, size: 238.81, sum: 238.81, depthPercent: 88 },
];

const INITIAL_BIDS: OrderBookRow[] = [
  { price: 77841.9, size: 919.31, sum: 919.31, depthPercent: 92 },
  { price: 77841.8, size: 5.21, sum: 924.52, depthPercent: 12 },
  { price: 77841.7, size: 467.1, sum: 924.99, depthPercent: 65 },
  { price: 77841.3, size: 155.7, sum: 925.15, depthPercent: 35 },
  { price: 77840.8, size: 1.71, sum: 926.86, depthPercent: 18 },
  { price: 77840.7, size: 77.84, sum: 1000.0, depthPercent: 50 },
  { price: 77840.4, size: 43.43, sum: 1040.0, depthPercent: 40 },
];

const INITIAL_TRADES: TradeRecord[] = [
  { id: "1", price: 77841.9, amount: 93.02, time: "20:42:33", side: "buy" },
  { id: "2", price: 77840.4, amount: 80.4, time: "20:42:33", side: "sell" },
  { id: "3", price: 77845.1, amount: 72.62, time: "20:42:32", side: "buy" },
  { id: "4", price: 77841.0, amount: 307.62, time: "20:42:32", side: "sell" },
  { id: "5", price: 77845.1, amount: 375.13, time: "20:42:31", side: "buy" },
  { id: "6", price: 77839.1, amount: 67.01, time: "20:42:31", side: "sell" },
];

export function useBinanceFuturesWs(symbol: string = "BTCUSDT") {
  const [ticker, setTicker] = useState<FuturesTickerStats>(INITIAL_TICKER);
  const [asks, setAsks] = useState<OrderBookRow[]>(INITIAL_ASKS);
  const [bids, setBids] = useState<OrderBookRow[]>(INITIAL_BIDS);
  const [trades, setTrades] = useState<TradeRecord[]>(INITIAL_TRADES);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");

  const countdownSecondsRef = useRef(8246); // ~2h 17m 26s

  // Synchronize when symbol changes
  useEffect(() => {
    const rawClean = symbol.toUpperCase().replace(/[^A-Z]/g, "");
    const baseAsset = rawClean.endsWith("USDT") ? rawClean.replace("USDT", "") : rawClean;
    const formattedKey = `${baseAsset}-USDT`;
    const mock = mockMarketDetails[formattedKey];

    if (mock) {
      const p = mock.price;
      const step = p > 1000 ? 0.1 : p > 10 ? 0.01 : 0.0001;

      setTicker((prev) => ({
        ...prev,
        symbol: `${baseAsset}USDT`,
        lastPrice: p,
        markPrice: Math.round((p - p * 0.00015) * 100) / 100,
        indexPrice: Math.round((p - p * 0.00008) * 100) / 100,
        priceChange: Math.round(p * (mock.change24h / 100) * 100) / 100,
        priceChangePercent: mock.change24h,
        high24h: mock.high24h,
        low24h: mock.low24h,
      }));

      // Generate initial asks & bids for new price scale
      const newAsks: OrderBookRow[] = [];
      let askSum = 0;
      for (let i = 1; i <= 7; i++) {
        const askPrice = Math.round((p + i * step) * 100) / 100;
        const size = Math.round((((i * 19) % 50) + 10) * 100) / 100;
        askSum += size;
        newAsks.push({
          price: askPrice,
          size,
          sum: Math.round(askSum * 100) / 100,
          depthPercent: Math.min(100, Math.round((size / 60) * 100)),
        });
      }
      setAsks(newAsks.reverse());

      const newBids: OrderBookRow[] = [];
      let bidSum = 0;
      for (let i = 1; i <= 7; i++) {
        const bidPrice = Math.round((p - i * step) * 100) / 100;
        const size = Math.round((((i * 17) % 50) + 10) * 100) / 100;
        bidSum += size;
        newBids.push({
          price: bidPrice,
          size,
          sum: Math.round(bidSum * 100) / 100,
          depthPercent: Math.min(100, Math.round((size / 60) * 100)),
        });
      }
      setBids(newBids);

      const newTrades: TradeRecord[] = [
        { id: "t1", price: p, amount: 12.5, time: "20:42:33", side: "buy" },
        { id: "t2", price: Math.round((p - step) * 100) / 100, amount: 8.2, time: "20:42:33", side: "sell" },
        { id: "t3", price: Math.round((p + step) * 100) / 100, amount: 15.0, time: "20:42:32", side: "buy" },
      ];
      setTrades(newTrades);
    }
  }, [symbol]);

  // Format countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      countdownSecondsRef.current = Math.max(0, countdownSecondsRef.current - 1);
      const hours = Math.floor(countdownSecondsRef.current / 3600);
      const minutes = Math.floor((countdownSecondsRef.current % 3600) / 60);
      const seconds = countdownSecondsRef.current % 60;
      const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      setTicker((prev) => ({ ...prev, countdownFormatted: formatted }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Public WebSocket with fallback simulation
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const lowerSymbol = symbol.toLowerCase();
    const wsUrl = `wss://fstream.binance.com/ws/${lowerSymbol}@ticker/${lowerSymbol}@depth20@100ms/${lowerSymbol}@aggTrade`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Ticker stream event
          if (data.e === "24hrTicker") {
            setTicker((prev) => ({
              ...prev,
              lastPrice: parseFloat(data.c),
              priceChange: parseFloat(data.p),
              priceChangePercent: parseFloat(data.P),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volumeBtc: parseFloat(data.v),
              volumeUsdt: parseFloat(data.q),
            }));
          }
          // Depth stream event
          if (data.e === "depthUpdate" || (data.b && data.a)) {
            const rawAsks = data.a || [];
            const rawBids = data.b || [];
            if (rawAsks.length > 0) {
              let cumulative = 0;
              const formattedAsks: OrderBookRow[] = rawAsks.slice(0, 7).map((item: string[]) => {
                const price = parseFloat(item[0]);
                const size = parseFloat(item[1]);
                cumulative += size;
                return {
                  price,
                  size,
                  sum: cumulative,
                  depthPercent: Math.min(100, Math.round((size / 300) * 100)),
                };
              });
              setAsks(formattedAsks);
            }
            if (rawBids.length > 0) {
              let cumulative = 0;
              const formattedBids: OrderBookRow[] = rawBids.slice(0, 7).map((item: string[]) => {
                const price = parseFloat(item[0]);
                const size = parseFloat(item[1]);
                cumulative += size;
                return {
                  price,
                  size,
                  sum: cumulative,
                  depthPercent: Math.min(100, Math.round((size / 300) * 100)),
                };
              });
              setBids(formattedBids);
            }
          }
          // Trade stream event
          if (data.e === "aggTrade") {
            const newTrade: TradeRecord = {
              id: String(data.a),
              price: parseFloat(data.p),
              amount: parseFloat(data.q),
              time: new Date(data.T).toLocaleTimeString("en-GB", { hour12: false }),
              side: data.m ? "sell" : "buy",
            };
            setTrades((prev) => [newTrade, ...prev.slice(0, 19)]);
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onerror = () => {
        setConnectionStatus("connecting");
      };

      ws.onclose = () => {
        setConnectionStatus("connecting");
      };
    } catch {
      setConnectionStatus("connecting");
    }

    // Micro-jitter simulation to keep numbers dynamic even if network is offline or WS blocked
    fallbackInterval = setInterval(() => {
      setTicker((prev) => {
        const delta = (Math.random() - 0.49) * (prev.lastPrice > 1000 ? 1.5 : 0.05);
        const newPrice = Math.round((prev.lastPrice + delta) * 100) / 100;
        return {
          ...prev,
          lastPrice: newPrice,
          markPrice: Math.round((newPrice - newPrice * 0.00015) * 100) / 100,
          indexPrice: Math.round((newPrice - newPrice * 0.00008) * 100) / 100,
        };
      });

      // Occasional new trade simulation
      if (Math.random() > 0.4) {
        const side = Math.random() > 0.5 ? "buy" : "sell";
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0];
        setTrades((prev) => {
          const basePrice = prev[0]?.price || 77841.9;
          const priceDiff = (Math.random() - 0.48) * (basePrice > 1000 ? 0.8 : 0.02);
          const nextPrice = Math.round((basePrice + priceDiff) * 100) / 100;
          const amount = Math.round((Math.random() * 200 + 10) * 100) / 100;
          const newTrade: TradeRecord = {
            id: String(Date.now()),
            price: nextPrice,
            amount,
            time: timeStr,
            side,
          };
          return [newTrade, ...prev.slice(0, 19)];
        });
      }
    }, 1200);

    return () => {
      if (ws) {
        ws.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [symbol]);

  return {
    ticker,
    asks,
    bids,
    trades,
    connectionStatus,
  };
}
