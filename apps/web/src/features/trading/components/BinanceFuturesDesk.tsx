"use client";

import React, { useState } from "react";
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

export function BinanceFuturesDesk() {
  const [activeSymbol, setActiveSymbol] = useState<string>("BTCUSDT");
  const { ticker, asks, bids, trades, connectionStatus } = useBinanceFuturesWs(activeSymbol);

  return (
    <div className="flex flex-col h-screen w-full bg-[#000000] text-[#EDEDED] overflow-hidden select-none font-sans">
      {/* 1. Top Navigation Bar (48px) */}
      <BinanceFuturesHeader />

      {/* 2. 24h Market Stats Ticker Bar (42px) with AGI Market Panel */}
      <MarketStatsTickerBar
        ticker={ticker}
        onSelectSymbol={setActiveSymbol}
      />

      {/* 3. Main Trading Workspace Grid (Takes full remaining vertical space) */}
      <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden bg-[#000000]">
        {/* Left Column: Chart (Top) + Positions & Orders Table (Bottom) */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 border-r border-[#242D35]">
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
        <div className="hidden lg:flex lg:col-span-2 xl:col-span-2 flex-col min-h-0 border-r border-[#242D35] bg-[#000000]">
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
        <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col min-h-0 overflow-y-auto no-scrollbar bg-[#000000]">
          {/* Order Execution Form */}
          <FuturesOrderPanel currentPrice={ticker.lastPrice} />

          {/* Account Margin & Deposit Notice */}
          <AccountMarginCard />
        </div>
      </div>

      {/* 4. Bottom Status Bar & Scrolling Ticker Marquee (28px) */}
      <BottomTickerStrip connectionStatus={connectionStatus} />
    </div>
  );
}
