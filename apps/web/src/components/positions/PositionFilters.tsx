"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PositionFilterState, defaultPositionFilters } from "@/lib/mockPositionsData";
import { Search, RotateCcw, Filter, ArrowUpDown } from "lucide-react";

interface PositionFiltersProps {
 filters: PositionFilterState;
 onFilterChange: (filters: PositionFilterState) => void;
 openCount: number;
 closedCount: number;
 totalCount: number;
}

export function PositionFilters({
 filters,
 onFilterChange,
 openCount,
 closedCount,
 totalCount,
}: PositionFiltersProps) {
 const handleTabChange = (tab: "open" | "closed" | "all") => {
  onFilterChange({ ...filters, tab });
 };

 const handleReset = () => {
  onFilterChange(defaultPositionFilters);
 };

 return (
  <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-3 space-y-4">
   {/* Top Row: Tabs & Search */}
   <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
    {/* Tab Buttons */}
    <div className="flex items-center p-1 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 self-start">
     <button
      type="button"
      onClick={() => handleTabChange("open")}
      className={`px-4 py-2 text-xs font-sans font-bold tracking-normal transition-all flex items-center gap-2 ${
       filters.tab === "open"
        ? "bg-gray-200 dark:bg-zinc-700/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
        : "text-gray-500 dark:text-zinc-400 hover:text-zinc-300"
      }`}
     >
      <span>Open Positions</span>
      <span className="text-xs px-1.5 py-0.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-zinc-300">
       {openCount}
      </span>
     </button>

     <button
      type="button"
      onClick={() => handleTabChange("closed")}
      className={`px-4 py-2 text-xs font-sans font-bold tracking-normal transition-all flex items-center gap-2 ${
       filters.tab === "closed"
        ? "bg-gray-200 dark:bg-zinc-700/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
        : "text-gray-500 dark:text-zinc-400 hover:text-zinc-300"
      }`}
     >
      <span>Closed History</span>
      <span className="text-xs px-1.5 py-0.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-zinc-300">
       {closedCount}
      </span>
     </button>

     <button
      type="button"
      onClick={() => handleTabChange("all")}
      className={`px-4 py-2 text-xs font-sans font-bold tracking-normal transition-all flex items-center gap-2 ${
       filters.tab === "all"
        ? "bg-gray-200 dark:bg-zinc-700/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
        : "text-gray-500 dark:text-zinc-400 hover:text-zinc-300"
      }`}
     >
      <span>ALL</span>
      <span className="text-xs px-1.5 py-0.5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-zinc-300">
       {totalCount}
      </span>
     </button>
    </div>

    {/* Search Bar */}
    <div className="flex-1 max-w-md">
     <div className="relative flex items-center w-full">
      <Search size={14} className="absolute left-3 text-gray-500 dark:text-zinc-400" />
      <input
       type="text"
       value={filters.search}
       onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
       placeholder="SEARCH SYMBOL, StrategyEGY, ID..."
       className="w-full bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 text-gray-900 dark:text-zinc-50 text-xs font-sans tracking-normal pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-900 focus:bg-black placeholder:text-gray-500 dark:text-zinc-400"
      />
     </div>
    </div>
   </div>

   {/* Bottom Row: Granular Filters & Sorting */}
   <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200 dark:border-white/5">
    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500 font-sans font-bold tracking-normal mr-2 ">
     <Filter size={13} className="text-indigo-600 dark:text-indigo-400" />
     <span>Filters:</span>
    </div>

    {/* Asset Filter */}
    <div className="w-28 sm:w-32">
     <Select
      value={filters.asset}
      onChange={(e) => onFilterChange({ ...filters, asset: e.target.value })}
      options={[
       { value: "All", label: "Asset: All" },
       { value: "BTC/USDT", label: "BTC/USDT" },
       { value: "ETH/USDT", label: "ETH/USDT" },
      ]}
     />
    </div>

    {/* Direction Filter */}
    <div className="w-28 sm:w-32">
     <Select
      value={filters.direction}
      onChange={(e) => onFilterChange({ ...filters, direction: e.target.value })}
      options={[
       { value: "All", label: "Direction: All" },
       { value: "LONG", label: "LONG" },
       { value: "SHORT", label: "SHORT" },
      ]}
     />
    </div>

    {/* Strategy Filter */}
    <div className="w-36 sm:w-44">
     <Select
      value={filters.strategy}
      onChange={(e) => onFilterChange({ ...filters, strategy: e.target.value })}
      options={[
       { value: "All", label: "Strategy: ALL" },
       { value: "Breakout Continuation", label: "Breakout Cont." },
       { value: "Trend Continuation", label: "Trend Cont." },
       { value: "Mean Reversion", label: "Mean Reversion" },
       { value: "Momentum", label: "MOMENTUM" },
       { value: "Volatility Breakout", label: "Vol Breakout" },
      ]}
     />
    </div>

    {/* Risk State Filter */}
    <div className="w-28 sm:w-36">
     <Select
      value={filters.riskState}
      onChange={(e) => onFilterChange({ ...filters, riskState: e.target.value })}
      options={[
       { value: "All", label: "Risk: All" },
       { value: "NORMAL", label: "NORMAL" },
       { value: "ELEVATED", label: "ELEVATED" },
      ]}
     />
    </div>

    {/* Sorting Selector */}
    <div className="w-36 sm:w-44 ml-auto">
     <Select
      value={filters.sortBy}
      onChange={(e) =>
       onFilterChange({
        ...filters,
        sortBy: e.target.value as PositionFilterState["sortBy"],
       })
      }
      options={[
       { value: "default", label: "Sort: Default" },
       { value: "pnl-desc", label: "Sort: PnL (High to Low)" },
       { value: "pnl-asc", label: "Sort: PnL (Low to High)" },
       { value: "pnl-pct-desc", label: "Sort: PnL %" },
       { value: "exposure-desc", label: "SRT: Exposure_DESC" },
       { value: "risk-desc", label: "Sort: Risk" },
       { value: "newest", label: "Sort: Newest" },
       { value: "asset", label: "Sort: Asset" },
      ]}
     />
    </div>

    {/* Reset Button */}
    <button
     type="button"
     onClick={handleReset}
     className="flex items-center gap-1 text-xs font-sans font-bold text-gray-500 dark:text-zinc-400 hover:text-zinc-300 tracking-normal p-2 border border-transparent hover:border-zinc-800 transition-colors"
     title="Reset Filters"
    >
     <RotateCcw size={12} />
     <span>Reset</span>
    </button>
   </div>
  </div>
 );
}
