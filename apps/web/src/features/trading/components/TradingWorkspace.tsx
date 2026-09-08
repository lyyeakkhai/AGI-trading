"use client";

import React, { useState } from "react";
import { MarketChart } from "./MarketChart";
import { OrderPanel } from "./OrderPanel";
import { useSearchParams } from "next/navigation";

export function TradingWorkspace() {
  const searchParams = useSearchParams();
  const marketType = searchParams.get("type") === "spot" ? "spot" : "futures";
  const symbol = searchParams.get("symbol") || "BTCUSDT";

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 grid-rows-[auto_1fr_auto] lg:grid-rows-[1fr_300px] h-full overflow-hidden">
      
      {/* Left Column: Chart (Takes up 3/4 width on large screens) */}
      <div className="lg:col-span-3 lg:row-span-1 bg-[#0A0D0F] border-r border-b border-[#222B32] relative flex flex-col min-h-[400px]">
        <div className="h-12 border-b border-[#222B32] flex items-center px-4 bg-[#101417]">
          <div className="font-mono font-bold text-lg text-gray-100">{symbol}</div>
          <div className="ml-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1A2126] text-gray-400">
            {marketType}
          </div>
        </div>
        <div className="flex-1 relative">
          <MarketChart
            symbol={symbol}
            candles={[]} timeframe="1h" onTimeframeChange={() => {}}
          />
        </div>
      </div>

      {/* Right Column: Order Panel (Takes up 1/4 width) */}
      <div className="lg:col-span-1 lg:row-span-2 bg-[#101417] border-l border-[#222B32] flex flex-col overflow-y-auto">
        <OrderPanel initialMarketType={marketType} initialSymbol={symbol} />
      </div>

      {/* Bottom Row: Positions / Orders (Takes up full width minus order panel) */}
      <div className="lg:col-span-3 lg:row-span-1 bg-[#101417] border-r border-[#222B32] flex flex-col">
        <div className="flex items-center border-b border-[#222B32] bg-[#151A1E]">
          <button className="px-4 py-2 text-xs font-mono font-bold text-cyan-400 border-b-2 border-cyan-400 bg-[#1A2126]">
            Positions
          </button>
          <button className="px-4 py-2 text-xs font-mono font-medium text-gray-500 hover:text-gray-300 transition-colors">
            Open Orders
          </button>
          <button className="px-4 py-2 text-xs font-mono font-medium text-gray-500 hover:text-gray-300 transition-colors">
            Order History
          </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center text-sm font-mono text-gray-500">
          No open positions.
        </div>
      </div>

    </div>
  );
}
