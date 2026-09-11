"use client";

import React, { useState } from "react";
import { ChevronDown, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { OrderBookRow } from "../types/binanceFutures";

interface OrderBookPanelProps {
  asks: OrderBookRow[];
  bids: OrderBookRow[];
  currentPrice: number;
  markPrice: number;
  onSelectPrice?: (price: number) => void;
}

export function OrderBookPanel({
  asks,
  bids,
  currentPrice,
  markPrice,
  onSelectPrice,
}: OrderBookPanelProps) {
  const [viewMode, setViewMode] = useState<"both" | "asks" | "bids">("both");
  const [precision, setPrecision] = useState<string>("0.1");

  const visibleAsks = viewMode === "bids" ? [] : viewMode === "asks" ? asks : asks.slice(-7);
  const visibleBids = viewMode === "asks" ? [] : viewMode === "bids" ? bids : bids.slice(0, 7);

  return (
    <div className="flex flex-col h-full bg-[#181A20] text-xs select-none border-b border-[#23272E]">
      {/* 1. Header Toolbar */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-[#23272E]">
        <span className="font-sans font-semibold text-[#EAECEF] text-[12px]">Order Book</span>

        {/* Controls: Mode icons, precision, more */}
        <div className="flex items-center gap-1.5">
          {/* Mode Toggles */}
          <div className="flex items-center gap-0.5 bg-[#12161A] p-0.5 rounded border border-[#23272E]">
            {/* Both */}
            <button
              type="button"
              onClick={() => setViewMode("both")}
              className={`p-0.5 rounded flex flex-col gap-0.5 w-4 h-4 justify-center items-center ${
                viewMode === "both" ? "bg-[#2B313A]" : "hover:bg-[#2B313A]/50"
              }`}
              title="Both Bids and Asks"
            >
              <div className="w-2.5 h-1 bg-[#F6465D] rounded-[0.5px]" />
              <div className="w-2.5 h-1 bg-[#0ECB81] rounded-[0.5px]" />
            </button>

            {/* Bids only */}
            <button
              type="button"
              onClick={() => setViewMode("bids")}
              className={`p-0.5 rounded flex flex-col gap-0.5 w-4 h-4 justify-center items-center ${
                viewMode === "bids" ? "bg-[#2B313A]" : "hover:bg-[#2B313A]/50"
              }`}
              title="Buy Orders Only"
            >
              <div className="w-2.5 h-1.5 bg-[#0ECB81] rounded-[0.5px]" />
              <div className="w-2.5 h-1 bg-[#0ECB81] rounded-[0.5px]" />
            </button>

            {/* Asks only */}
            <button
              type="button"
              onClick={() => setViewMode("asks")}
              className={`p-0.5 rounded flex flex-col gap-0.5 w-4 h-4 justify-center items-center ${
                viewMode === "asks" ? "bg-[#2B313A]" : "hover:bg-[#2B313A]/50"
              }`}
              title="Sell Orders Only"
            >
              <div className="w-2.5 h-1 bg-[#F6465D] rounded-[0.5px]" />
              <div className="w-2.5 h-1.5 bg-[#F6465D] rounded-[0.5px]" />
            </button>
          </div>

          {/* Tick Precision */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#12161A] border border-[#23272E] text-[10px] font-mono text-[#848E9C] hover:text-white"
            >
              <span>{precision}</span>
              <ChevronDown size={10} />
            </button>
          </div>

          <button
            type="button"
            className="p-1 text-[#848E9C] hover:text-white rounded hover:bg-[#2B313A] transition-colors"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* 2. Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1 text-[10px] font-mono text-[#848E9C] border-b border-[#23272E]/50">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Size (USDT)</div>
        <div className="text-right">Sum (USDT)</div>
      </div>

      {/* 3. Table Rows Container */}
      <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden font-mono text-[11px]">
        {/* Asks (Sell Orders - Red) */}
        <div className="flex flex-col justify-end space-y-[1px]">
          {visibleAsks.map((row, idx) => (
            <div
              key={`ask-${idx}-${row.price}`}
              onClick={() => onSelectPrice?.(row.price)}
              className="grid grid-cols-3 px-3 py-[1px] relative hover:bg-[#2B313A]/40 cursor-pointer group leading-tight"
            >
              {/* Depth Background Bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#F6465D]/15 pointer-events-none transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(8, row.depthPercent))}%` }}
              />
              <div className="text-left text-[#F6465D] font-medium z-10">
                {row.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </div>
              <div className="text-right text-[#EAECEF] z-10">
                {row.size >= 1000 ? `${(row.size / 1000).toFixed(2)}K` : row.size.toFixed(2)}
              </div>
              <div className="text-right text-[#848E9C] z-10">
                {row.sum >= 1000 ? `${(row.sum / 1000).toFixed(2)}K` : `${row.sum.toFixed(2)}K`}
              </div>
            </div>
          ))}
        </div>

        {/* Center Spread / Last Price Bar */}
        <div className="my-1 py-1.5 px-3 bg-[#12161A] border-y border-[#23272E] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-[#0ECB81]">
              {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <ArrowUp size={12} className="text-[#0ECB81]" />
            <span className="text-[11px] text-[#848E9C]">
              {markPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
          </div>
        </div>

        {/* Bids (Buy Orders - Green) */}
        <div className="flex flex-col space-y-[1px]">
          {visibleBids.map((row, idx) => (
            <div
              key={`bid-${idx}-${row.price}`}
              onClick={() => onSelectPrice?.(row.price)}
              className="grid grid-cols-3 px-3 py-[1px] relative hover:bg-[#2B313A]/40 cursor-pointer group leading-tight"
            >
              {/* Depth Background Bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#0ECB81]/15 pointer-events-none transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(8, row.depthPercent))}%` }}
              />
              <div className="text-left text-[#0ECB81] font-medium z-10">
                {row.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </div>
              <div className="text-right text-[#EAECEF] z-10">
                {row.size >= 1000 ? `${(row.size / 1000).toFixed(2)}K` : row.size.toFixed(2)}
              </div>
              <div className="text-right text-[#848E9C] z-10">
                {row.sum >= 1000 ? `${(row.sum / 1000).toFixed(2)}M` : `${row.sum.toFixed(2)}K`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
