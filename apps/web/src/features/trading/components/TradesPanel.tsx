"use client";

import React, { useState } from "react";
import { Maximize2, MoreHorizontal } from "lucide-react";
import { TradeRecord } from "../types/binanceFutures";

interface TradesPanelProps {
  trades: TradeRecord[];
}

export function TradesPanel({ trades }: TradesPanelProps) {
  const [activeTab, setActiveTab] = useState<"Trades" | "Top Movers">("Trades");

  const topMoversMock = [
    { symbol: "RAYSOLUSDT", change: "+24.33%", price: 1.5959, isPositive: true },
    { symbol: "MARSCOINUSDT", change: "+18.64%", price: 0.1324, isPositive: true },
    { symbol: "IOSTUSDT", change: "-14.54%", price: 0.000937, isPositive: false },
    { symbol: "SAGAUSDT", change: "+7.17%", price: 0.01614, isPositive: true },
    { symbol: "ZECUSDT", change: "-1.10%", price: 1157.07, isPositive: false },
  ];

  return (
    <div className="flex flex-col h-full bg-[#181A20] text-xs select-none">
      {/* 1. Header Tabs */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-[#23272E]">
        <div className="flex items-center gap-3">
          {(["Trades", "Top Movers"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-8 font-sans font-semibold text-[12px] border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-[#EAECEF] border-[#F0B90B]"
                  : "text-[#848E9C] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[#848E9C]">
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#2B313A] transition-colors"
            title="Pop out panel"
          >
            <Maximize2 size={12} />
          </button>
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#2B313A] transition-colors"
          >
            <MoreHorizontal size={12} />
          </button>
        </div>
      </div>

      {/* 2. Content */}
      {activeTab === "Trades" ? (
        <>
          {/* Column Headers */}
          <div className="grid grid-cols-3 px-3 py-1 text-[10px] font-mono text-[#848E9C] border-b border-[#23272E]/50">
            <div className="text-left">Price (USDT)</div>
            <div className="text-right">Amount (USDT)</div>
            <div className="text-right">Time</div>
          </div>

          {/* Trade Stream List */}
          <div className="flex-1 overflow-y-auto font-mono text-[11px] py-1 space-y-[2px] no-scrollbar">
            {trades.slice(0, 15).map((trade, idx) => {
              const isBuy = trade.side === "buy";
              return (
                <div
                  key={`${trade.id}-${idx}`}
                  className="grid grid-cols-3 px-3 py-[1px] hover:bg-[#2B313A]/40 transition-colors leading-tight"
                >
                  <div className={`text-left font-medium ${isBuy ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                    {trade.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </div>
                  <div className="text-right text-[#EAECEF]">
                    {trade.amount >= 1000 ? `${(trade.amount / 1000).toFixed(2)}M` : `${trade.amount.toFixed(2)}K`}
                  </div>
                  <div className="text-right text-[#848E9C]">
                    {trade.time}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-1.5 no-scrollbar">
          {topMoversMock.map((m) => (
            <div key={m.symbol} className="flex items-center justify-between p-1.5 rounded hover:bg-[#2B313A]/50">
              <span className="text-white font-medium">{m.symbol}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#848E9C]">${m.price}</span>
                <span className={m.isPositive ? "text-[#0ECB81]" : "text-[#F6465D]"}>{m.change}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
