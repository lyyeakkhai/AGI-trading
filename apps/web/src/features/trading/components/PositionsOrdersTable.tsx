"use client";

import React, { useState } from "react";
import { FileText, SlidersHorizontal } from "lucide-react";

export function PositionsOrdersTable() {
  const [activeTab, setActiveTab] = useState<string>("Positions(0)");
  const [hideOtherSymbols, setHideOtherSymbols] = useState(false);

  const tabs = [
    "Positions(0)",
    "Open Orders(0)",
    "Order History",
    "Trade History",
    "Transaction History",
    "Position History",
    "Bots",
    "Assets",
  ];

  const columns = [
    "Symbol",
    "Size",
    "Entry Price",
    "Break Even Price",
    "Mark Price",
    "Liq.Price",
    "Margin Ratio",
    "Margin",
    "PNL(ROI %)",
    "Est. Funding Fee",
    "MKT Close All",
    "PnL-Based Close All",
    "Reverse",
    "TP/SL for position",
    "TP/SL",
  ];

  return (
    <div className="flex flex-col h-full bg-[#181A20] text-xs select-none border-t border-[#23272E]">
      {/* 1. Tabs & Right Controls */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#23272E] bg-[#181A20]">
        {/* Left: Tab list */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar font-sans">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-9 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-[#EAECEF] border-[#F0B90B] font-semibold"
                  : "text-[#848E9C] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right: Hide Other Symbols toggle & options */}
        <div className="flex items-center gap-3 shrink-0 ml-4 font-sans text-[11px] text-[#848E9C]">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#EAECEF]">
            <input
              type="checkbox"
              checked={hideOtherSymbols}
              onChange={(e) => setHideOtherSymbols(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#2B313A] border-[#474D57] text-[#F0B90B] focus:ring-0"
            />
            <span>Hide Other Symbols</span>
          </label>

          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#2B313A] transition-colors"
            title="Customise table columns"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* 2. Table Column Headers */}
      <div className="grid grid-cols-15 px-3 py-2 text-[10px] font-mono text-[#848E9C] border-b border-[#23272E]/60 overflow-x-auto no-scrollbar min-w-[1100px]">
        {columns.map((col) => (
          <div key={col} className="truncate pr-2">
            {col}
          </div>
        ))}
      </div>

      {/* 3. Empty State or Rows Container */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 min-h-[140px] text-[#848E9C]">
        {/* Empty State Illustrated Icon */}
        <div className="w-12 h-12 rounded-lg bg-[#1E2329] border border-[#2B313A] flex items-center justify-center mb-2 shadow-inner">
          <FileText size={24} className="text-[#848E9C]/60" />
        </div>
        <span className="text-[12px] font-sans text-[#848E9C]">You have no position.</span>
      </div>
    </div>
  );
}
