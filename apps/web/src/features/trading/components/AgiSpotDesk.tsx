"use client";

import React, { useState } from "react";
import { useBinanceFuturesWs } from "../hooks/useBinanceFuturesWs";
import { AgiSpotHeader } from "./AgiSpotHeader";
import { SpotStatsTickerBar } from "./SpotStatsTickerBar";
import { OrderBookPanel } from "./OrderBookPanel";
import { FuturesChartPane } from "./FuturesChartPane";
import { SpotDualOrderPanel } from "./SpotDualOrderPanel";
import { SpotMarketsTradesColumn } from "./SpotMarketsTradesColumn";
import { BottomTickerStrip } from "./BottomTickerStrip";

export function AgiSpotDesk() {
  const [activeSymbol, setActiveSymbol] = useState<string>("BTCUSDT");
  const [isAnnouncementDrawerOpen, setIsAnnouncementDrawerOpen] = useState(false);

  const { ticker, asks, bids, trades, connectionStatus } = useBinanceFuturesWs(activeSymbol);

  return (
    <div className="flex flex-col h-screen w-full bg-[#000000] text-[#EDEDED] overflow-hidden select-none font-sans">
      {/* 1. Top Navigation Bar (48px) + Announcement Bulletin Marquee (28px) */}
      <AgiSpotHeader
        onToggleAnnouncementsDrawer={() => setIsAnnouncementDrawerOpen((prev) => !prev)}
      />

      {/* 2. 24h Spot Market Stats Ticker Bar (44px) */}
      <SpotStatsTickerBar ticker={ticker} onSelectSymbol={setActiveSymbol} />

      {/* 3. Main 3-Column Trading Workspace (1:1 Reference Layout) */}
      <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden bg-[#000000]">
        {/* ================= COLUMN 1 (LEFT): ORDER BOOK (~280px) ================= */}
        <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 2xl:col-span-2 flex-col min-h-0 border-r border-[#242D35] bg-[#000000]">
          <OrderBookPanel
            asks={asks}
            bids={bids}
            currentPrice={ticker.lastPrice}
            markPrice={ticker.markPrice}
          />
        </div>

        {/* ================= COLUMN 2 (CENTER): CHART + DUAL ORDER DESK ================= */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-7 2xl:col-span-7 flex flex-col min-h-0 border-r border-[#242D35]">
          {/* Top: Candlestick Chart Pane with In-Chart Quick-Order Widget */}
          <div className="flex-1 min-h-0 relative">
            <FuturesChartPane symbol={ticker.symbol} currentPrice={ticker.lastPrice} />
          </div>

          {/* Bottom: Dual Side-by-Side Spot Order Placement Desk */}
          <div className="h-72 xl:h-80 shrink-0 min-h-0 border-t border-[#242D35]">
            <SpotDualOrderPanel currentPrice={ticker.lastPrice} symbol={ticker.symbol} />
          </div>
        </div>

        {/* ================= COLUMN 3 (RIGHT): MARKETS WATCHLIST & TRADES ================= */}
        <div className="hidden lg:flex lg:col-span-3 xl:col-span-3 2xl:col-span-3 flex-col min-h-0 bg-[#000000] relative">
          <SpotMarketsTradesColumn
            currentSymbol={activeSymbol}
            onSelectSymbol={setActiveSymbol}
            trades={trades}
            isAnnouncementDrawerOpen={isAnnouncementDrawerOpen}
            onCloseAnnouncementDrawer={() => setIsAnnouncementDrawerOpen(false)}
          />
        </div>
      </div>

      {/* 4. Bottom Status Bar & Scrolling Ticker Marquee (28px) */}
      <BottomTickerStrip connectionStatus={connectionStatus} />
    </div>
  );
}
