"use client";

import React, { useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { useBinanceFuturesWs } from "../hooks/useBinanceFuturesWs";
import { BinanceFuturesHeader } from "./BinanceFuturesHeader";
import { MarketStatsTickerBar } from "./MarketStatsTickerBar";
import { FuturesChartPane } from "./FuturesChartPane";
import { OrderBookPanel } from "./OrderBookPanel";
import { TradesPanel } from "./TradesPanel";
import { FuturesOrderPanel } from "./FuturesOrderPanel";
import { AccountMarginCard } from "./AccountMarginCard";
import { PositionsOrdersTable } from "./PositionsOrdersTable";
import { BottomTickerStrip } from "./BottomTickerStrip";
import { AgiMarketPanel } from "./AgiMarketPanel";

export function BinanceFuturesDesk() {
  const [activeSymbol, setActiveSymbol] = useState<string>("BTCUSDT");
  const [isMarketPanelOpen, setIsMarketPanelOpen] = useState<boolean>(true);
  const { ticker, asks, bids, trades, connectionStatus } = useBinanceFuturesWs(activeSymbol);

  return (
    <div className="flex flex-col h-screen w-full bg-[#000000] text-[#EDEDED] overflow-hidden select-none font-sans">
      {/* 1. Top Navigation Bar (48px) */}
      <BinanceFuturesHeader />

      {/* 2. 24h Market Stats Ticker Bar (42px) with AGI Market Panel Toggle */}
      <MarketStatsTickerBar
        ticker={ticker}
        onSelectSymbol={setActiveSymbol}
        onToggleMarketPanel={() => setIsMarketPanelOpen((prev) => !prev)}
        isMarketPanelOpen={isMarketPanelOpen}
      />

      {/* 3. Main Trading Workspace: Left Docked Markets Panel + Grid */}
      <div className="flex-1 min-h-0 flex overflow-hidden bg-[#000000]">
        {/* Leftmost Column: Visible AGI Market Watchlist & Market Share Panel */}
        {isMarketPanelOpen ? (
          <div className="w-64 xl:w-72 2xl:w-80 shrink-0 h-full border-r border-[#242D35] flex flex-col bg-[#0E0E0E] z-10 transition-all">
            <AgiMarketPanel
              isDocked={true}
              currentSymbol={activeSymbol}
              onSelectSymbol={setActiveSymbol}
              onClose={() => setIsMarketPanelOpen(false)}
            />
          </div>
        ) : (
          /* Collapsed Mini Sidebar Rail */
          <div className="w-9 shrink-0 h-full border-r border-[#242D35] bg-[#0E0E0E] flex flex-col items-center py-2.5 gap-3 select-none">
            <button
              type="button"
              onClick={() => setIsMarketPanelOpen(true)}
              className="p-1.5 rounded hover:bg-[#1C1C1C] text-[#8A8A8A] hover:text-[#00E5FF] transition-colors cursor-pointer"
              title="Expand Markets & Sector Share Panel"
            >
              <PanelLeftOpen size={15} />
            </button>
            <div
              onClick={() => setIsMarketPanelOpen(true)}
              className="cursor-pointer text-[10px] font-mono text-[#8A8A8A] hover:text-[#00E5FF] tracking-widest uppercase mt-4 flex items-center gap-1.5 [writing-mode:vertical-rl] rotate-180 transition-colors"
            >
              <span>MARKETS & SHARE</span>
            </div>
          </div>
        )}

        {/* Main Trading Desk Grid */}
        <div className="flex-1 min-w-0 grid grid-cols-12 overflow-hidden bg-[#000000]">
          {/* Left Column: Chart (Top) + Positions & Orders Table (Bottom) */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-7 2xl:col-span-8 flex flex-col min-h-0 border-r border-[#242D35]">
            {/* Chart Pane */}
            <div className="flex-1 min-h-0 relative">
              <FuturesChartPane symbol={ticker.symbol} currentPrice={ticker.lastPrice} />
            </div>

            {/* Bottom Table: Positions & Orders */}
            <div className="h-56 xl:h-64 shrink-0 min-h-0">
              <PositionsOrdersTable currentSymbol={ticker.symbol} />
            </div>
          </div>

          {/* Middle Column: Order Book (Top) + Recent Trades (Bottom) */}
          <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 2xl:col-span-2 flex-col min-h-0 border-r border-[#242D35] bg-[#000000]">
            {/* Order Book Panel */}
            <div className="flex-1 min-h-0">
              <OrderBookPanel
                asks={asks}
                bids={bids}
                currentPrice={ticker.lastPrice}
                markPrice={ticker.markPrice}
              />
            </div>

            {/* Recent Trades Panel */}
            <div className="h-56 xl:h-64 shrink-0 min-h-0 border-t border-[#242D35]">
              <TradesPanel trades={trades} />
            </div>
          </div>

          {/* Right Column: Order Placement Panel + Account Margin Card */}
          <div className="hidden lg:flex lg:col-span-3 xl:col-span-3 2xl:col-span-2 flex-col min-h-0 overflow-y-auto no-scrollbar bg-[#000000]">
            {/* Order Execution Form */}
            <FuturesOrderPanel currentPrice={ticker.lastPrice} />

            {/* Account Margin & Deposit Notice */}
            <AccountMarginCard />
          </div>
        </div>
      </div>

      {/* 4. Bottom Status Bar & Scrolling Ticker Marquee (28px) */}
      <BottomTickerStrip connectionStatus={connectionStatus} />
    </div>
  );
}
