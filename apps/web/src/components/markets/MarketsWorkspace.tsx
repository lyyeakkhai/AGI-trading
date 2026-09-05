"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  mockMarketDetails,
  watchlistSymbols,
  MarketDetail,
  CandleData,
} from "@/lib/mockMarketData";
import { marketApi, MarketTicker } from "@/lib/marketApi";
import { MarketHeader } from "./MarketHeader";
import { Watchlist } from "./Watchlist";
import { MarketChart } from "@/components/trading/MarketChart";
import { MarketDetailsPanel } from "./MarketDetailsPanel";
import { Time } from "lightweight-charts";

interface MarketsWorkspaceProps {
  initialSymbolKey?: string;
}

export function MarketsWorkspace({
  initialSymbolKey = "BTC-USDT",
}: MarketsWorkspaceProps) {
  const router = useRouter();

  const validInitialKey = mockMarketDetails[initialSymbolKey]
    ? initialSymbolKey
    : "BTC-USDT";

  const [selectedKey, setSelectedKey] = useState<string>(validInitialKey);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1h");
  const [liveTickers, setLiveTickers] = useState<Record<string, MarketTicker>>({});
  const [liveCandles, setLiveCandles] = useState<CandleData[] | null>(null);

  // Poll live tickers every 4s
  useEffect(() => {
    let isMounted = true;
    async function fetchTickers() {
      const data = await marketApi.getTickers();
      if (!isMounted || !data || data.length === 0) return;
      const map: Record<string, MarketTicker> = {};
      data.forEach((t) => {
        const key = t.symbol.replace("/", "-");
        map[key] = t;
      });
      setLiveTickers(map);
    }

    fetchTickers();
    const interval = setInterval(fetchTickers, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Base market definition
  const baseMarket: MarketDetail = useMemo(() => {
    return mockMarketDetails[selectedKey] || mockMarketDetails["BTC-USDT"];
  }, [selectedKey]);

  // Merge live ticker stats if available
  const currentMarket: MarketDetail = useMemo(() => {
    const live = liveTickers[selectedKey];
    if (!live) return baseMarket;

    return {
      ...baseMarket,
      price: live.price,
      change24h: live.change24h,
      high24h: live.high24h,
      low24h: live.low24h,
      quoteVolume24h: live.quoteVolume24h,
      volume24h: `${live.volume24h} ${baseMarket.baseAsset}`,
    };
  }, [baseMarket, selectedKey, liveTickers]);

  // Merge live ticker stats into all watchlist markets
  const allWatchlistMarkets: MarketDetail[] = useMemo(() => {
    return watchlistSymbols
      .map((k) => {
        const m = mockMarketDetails[k];
        if (!m) return null;
        const live = liveTickers[k];
        if (!live) return m;
        return {
          ...m,
          price: live.price,
          change24h: live.change24h,
          high24h: live.high24h,
          low24h: live.low24h,
          quoteVolume24h: live.quoteVolume24h,
        };
      })
      .filter((m): m is MarketDetail => m !== null);
  }, [liveTickers]);

  // Fetch real Binance OHLCV candles
  useEffect(() => {
    let isMounted = true;
    async function fetchCandles() {
      const raw = await marketApi.getCandles(currentMarket.symbol, selectedTimeframe, 150);
      if (!isMounted || !raw || raw.length === 0) {
        return;
      }
      const formatted: CandleData[] = raw
        .map((c) => ({
          time: Math.floor(new Date(c.timestamp).getTime() / 1000) as Time,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume),
        }))
        .sort((a, b) => Number(a.time) - Number(b.time));

      if (formatted.length > 0) {
        setLiveCandles(formatted);
      }
    }

    fetchCandles();
    const interval = setInterval(fetchCandles, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentMarket.symbol, selectedTimeframe]);

  const activeCandles = useMemo(() => {
    if (liveCandles && liveCandles.length > 0) {
      return liveCandles;
    }
    return (
      currentMarket.timeframes[selectedTimeframe] ||
      currentMarket.timeframes["1h"] ||
      []
    );
  }, [liveCandles, currentMarket, selectedTimeframe]);

  const activeAIMarkers = useMemo(() => {
    return currentMarket.aiMarkers[selectedTimeframe] || [];
  }, [currentMarket, selectedTimeframe]);

  const handleSelectSymbol = (newKey: string) => {
    setSelectedKey(newKey);
    setLiveCandles(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/markets/${newKey}`);
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* 1. Market Page Top Header */}
      <MarketHeader market={currentMarket} />

      {/* 2. Workspace Grid: Watchlist (Left) + Chart and Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Watchlist: 3 Cols on lg */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Watchlist
            markets={allWatchlistMarkets}
            selectedSymbolKey={selectedKey}
            onSelectSymbol={handleSelectSymbol}
          />
        </div>

        {/* Chart & Analysis Details: 9 Cols on lg */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          {/* Main Professional Candlestick Chart */}
          <MarketChart
            candles={activeCandles}
            aiMarkers={activeAIMarkers}
            position={currentMarket.position}
            timeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            symbol={currentMarket.symbol}
            height={490}
          />

          {/* Contextual Market Details & Hermes Intelligence */}
          <MarketDetailsPanel market={currentMarket} />
        </div>
      </div>
    </div>
  );
}
