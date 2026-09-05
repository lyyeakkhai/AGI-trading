"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  mockMarketDetails,
  watchlistSymbols,
  MarketDetail,
} from "@/lib/mockMarketData";
import { MarketHeader } from "./MarketHeader";
import { Watchlist } from "./Watchlist";
import { MarketChart } from "@/components/trading/MarketChart";
import { MarketDetailsPanel } from "./MarketDetailsPanel";

interface MarketsWorkspaceProps {
  initialSymbolKey?: string;
}

export function MarketsWorkspace({
  initialSymbolKey = "BTC-USDT",
}: MarketsWorkspaceProps) {
  const router = useRouter();

  // Validate or fallback initial key
  const validInitialKey = mockMarketDetails[initialSymbolKey]
    ? initialSymbolKey
    : "BTC-USDT";

  const [selectedKey, setSelectedKey] = useState<string>(validInitialKey);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1h");

  const currentMarket: MarketDetail = useMemo(() => {
    return mockMarketDetails[selectedKey] || mockMarketDetails["BTC-USDT"];
  }, [selectedKey]);

  const allWatchlistMarkets: MarketDetail[] = useMemo(() => {
    return watchlistSymbols.map((k) => mockMarketDetails[k]).filter(Boolean);
  }, []);

  const activeCandles = useMemo(() => {
    return (
      currentMarket.timeframes[selectedTimeframe] ||
      currentMarket.timeframes["1h"] ||
      []
    );
  }, [currentMarket, selectedTimeframe]);

  const activeAIMarkers = useMemo(() => {
    return currentMarket.aiMarkers[selectedTimeframe] || [];
  }, [currentMarket, selectedTimeframe]);

  const handleSelectSymbol = (newKey: string) => {
    setSelectedKey(newKey);
    // Gracefully update URL without hard page refresh
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
