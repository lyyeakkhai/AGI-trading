"use client";

import React, { useState, useMemo, useCallback } from "react";
import { MarketChart } from "./MarketChart";
import { TradePanel } from "./TradePanel";
import { useSearchParams } from "next/navigation";
import { useTradingPlan } from "../hooks/useTradingPlan";
import { mockMarketDetails, CandleData } from "@/lib/mockMarketData";

const EMPTY_CANDLES: CandleData[] = [];

export function TradingWorkspace() {
  const searchParams = useSearchParams();
  const marketType = (searchParams.get("type") === "spot" ? "spot" : "futures") as "spot" | "futures";
  const symbol = searchParams.get("symbol") || "BTCUSDT";

  const { plan, updatePlan, metrics } = useTradingPlan(symbol, marketType);
  const [timeframe, setTimeframe] = useState<string>("1h");

  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    setTimeframe(newTimeframe);
  }, []);

  const normalizedKey = useMemo(() => {
    if (symbol.includes("-")) return symbol;
    if (symbol.includes("/")) return symbol.replace("/", "-");
    if (symbol.endsWith("USDT")) return `${symbol.slice(0, -4)}-USDT`;
    return "BTC-USDT";
  }, [symbol]);

  const candles = useMemo(() => {
    const market = mockMarketDetails[normalizedKey] || mockMarketDetails["BTC-USDT"];
    return market?.timeframes?.[timeframe] || market?.timeframes?.["1h"] || EMPTY_CANDLES;
  }, [normalizedKey, timeframe]);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 grid-rows-[auto_1fr_auto] lg:grid-rows-[1fr_300px] h-full overflow-hidden bg-[#000000]">
      
      {/* Left Column: Chart (Takes up 3/4 width on large screens) */}
      <div className="lg:col-span-3 lg:row-span-1 bg-[#0E0E0E] border-r border-b border-[#1C1C1C] relative flex flex-col min-h-[400px]">
        <div className="h-12 border-b border-[#1C1C1C] flex items-center px-4 bg-[#0E0E0E]">
          <div className="font-mono font-bold text-sm text-[#EDEDED]">{plan.symbol}</div>
          <div className="ml-3 px-2 py-0.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-[#1C1C1C] text-[#8A8A8A]">
            {plan.market}
          </div>
        </div>
        <div className="flex-1 relative">
          <MarketChart
            symbol={plan.symbol}
            candles={candles} 
            timeframe={timeframe} 
            onTimeframeChange={handleTimeframeChange}
            plan={plan}
          />
        </div>
      </div>

      {/* Right Column: Order Panel (Takes up 1/4 width) */}
      <div className="lg:col-span-1 lg:row-span-2 bg-[#0E0E0E] border-l border-[#1C1C1C] flex flex-col overflow-hidden">
        <TradePanel plan={plan} updatePlan={updatePlan} metrics={metrics} />
      </div>

      {/* Bottom Row: Positions / Orders (Takes up full width minus order panel) */}
      <div className="lg:col-span-3 lg:row-span-1 bg-[#0E0E0E] border-r border-[#1C1C1C] flex flex-col">
        <div className="flex items-center border-b border-[#1C1C1C] bg-[#0E0E0E]">
          <button className="px-4 py-2 text-xs font-mono font-bold text-[#00E5FF] border-b-2 border-[#00E5FF] bg-[#1C1C1C]">
            Positions
          </button>
          <button className="px-4 py-2 text-xs font-mono font-medium text-[#8A8A8A] hover:text-[#EDEDED] transition-colors">
            Open Orders
          </button>
          <button className="px-4 py-2 text-xs font-mono font-medium text-[#8A8A8A] hover:text-[#EDEDED] transition-colors">
            Order History
          </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center text-sm font-mono text-[#8A8A8A]">
          No open positions.
        </div>
      </div>

    </div>
  );
}
