"use client";

import React, { useState } from "react";
import { Maximize2, MoreHorizontal } from "lucide-react";
import { TradeRecord } from "../types/binanceFutures";

interface TradesPanelProps {
  trades: TradeRecord[];
  onSelectPrice?: (price: number) => void;
}

interface TopMover {
  symbol: string;
  change: string;
  price: number;
  isPositive: boolean;
}

const TOP_MOVERS_DATA: TopMover[] = [
  { symbol: "RAYSOLUSDT", change: "+24.33%", price: 1.5959, isPositive: true },
  { symbol: "MARSCOINUSDT", change: "+18.64%", price: 0.1324, isPositive: true },
  { symbol: "ENAUSDT", change: "+12.85%", price: 0.4521, isPositive: true },
  { symbol: "DOGEUSDT", change: "+8.42%", price: 0.1843, isPositive: true },
  { symbol: "SAGAUSDT", change: "+7.17%", price: 0.01614, isPositive: true },
  { symbol: "ZECUSDT", change: "-1.10%", price: 1157.07, isPositive: false },
  { symbol: "PEPEUSDT", change: "-5.23%", price: 0.0000094, isPositive: false },
  { symbol: "IOSTUSDT", change: "-14.54%", price: 0.000937, isPositive: false },
];

export function TradesPanel({ trades, onSelectPrice }: TradesPanelProps) {
  const [activeTab, setActiveTab] = useState<"Trades" | "Top Movers">("Trades");

  const formatAmount = (amt: number) => {
    if (amt >= 1000) {
      return `${(amt / 1000).toFixed(2)}M`;
    }
    if (amt >= 1) {
      return `${amt.toFixed(2)}K`;
    }
    return `${amt.toFixed(3)}K`;
  };

  const formatMoverPrice = (p: number) => {
    if (p < 0.001) return p.toFixed(7);
    if (p < 1) return p.toFixed(4);
    return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-xs select-none">
      {/* 1. Header Tabs */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-[#242D35]">
        <div className="flex items-center gap-4">
          {(["Trades", "Top Movers"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-8 font-sans font-semibold text-xs border-b-2 transition-colors flex items-center cursor-pointer ${
                  isActive
                    ? "text-[#EDEDED] border-[#00E5FF]"
                    : "text-[#8A8A8A] border-transparent hover:text-[#EDEDED]"
                }`}
              >
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-[#8A8A8A]">
          <button
            type="button"
            className="p-1 hover:text-[#EDEDED] rounded hover:bg-[#1C1C1C] transition-colors cursor-pointer"
            title="Pop out panel"
          >
            <Maximize2 size={13} />
          </button>
          <button
            type="button"
            className="p-1 hover:text-[#EDEDED] rounded hover:bg-[#1C1C1C] transition-colors cursor-pointer"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* 2. Content */}
      {activeTab === "Trades" ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-3 px-3 py-1 text-xs font-sans text-[#8A8A8A] border-b border-[#242D35]/50">
            <div className="text-left">Price (USDT)</div>
            <div className="text-right">Amount (USDT)</div>
            <div className="text-right">Time</div>
          </div>

          {/* Trade Stream Tape List */}
          <div className="flex-1 overflow-y-auto font-mono text-xs py-0.5 space-y-[1px] no-scrollbar">
            {trades.slice(0, 30).map((trade, idx) => {
              const isBuy = trade.side === "buy";
              return (
                <div
                  key={`${trade.id}-${idx}`}
                  onClick={() => onSelectPrice?.(trade.price)}
                  className="grid grid-cols-3 px-3 py-[1.5px] hover:bg-[#1C1C1C]/40 transition-colors duration-150 leading-tight cursor-pointer group"
                >
                  <div
                    className={`text-left font-medium transition-colors ${
                      isBuy ? "text-[#00E676]" : "text-[#FF3B30]"
                    }`}
                  >
                    {trade.price.toLocaleString("en-US", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </div>
                  <div className="text-right text-[#EDEDED] transition-colors">
                    {formatAmount(trade.amount)}
                  </div>
                  <div className="text-right text-[#8A8A8A] transition-colors">
                    {trade.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-3 px-3 py-1 text-xs font-sans text-[#8A8A8A] border-b border-[#242D35]/50">
            <div className="text-left">Symbol</div>
            <div className="text-right">Price (USDT)</div>
            <div className="text-right">24h Change</div>
          </div>

          {/* Top Movers List */}
          <div className="flex-1 overflow-y-auto font-mono text-xs py-0.5 space-y-[1px] no-scrollbar">
            {TOP_MOVERS_DATA.map((item) => (
              <div
                key={item.symbol}
                onClick={() => onSelectPrice?.(item.price)}
                className="grid grid-cols-3 px-3 py-1.5 hover:bg-[#1C1C1C]/40 transition-colors duration-150 items-center cursor-pointer group"
              >
                <div className="text-left font-medium text-[#EDEDED] group-hover:text-[#00E5FF] transition-colors">
                  {item.symbol}
                </div>
                <div className="text-right text-[#8A8A8A]">
                  {formatMoverPrice(item.price)}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-sm text-[11px] font-medium leading-none ${
                      item.isPositive
                        ? "text-[#00E676] bg-[#00E676]/15"
                        : "text-[#FF3B30] bg-[#FF3B30]/15"
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
