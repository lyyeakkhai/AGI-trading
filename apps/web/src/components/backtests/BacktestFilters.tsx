"use client";

import React from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components";

export type BacktestSortOption = "recent" | "netReturn" | "maxDrawdown" | "profitFactor" | "tradeCount";

interface BacktestFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  marketFilter: string;
  onMarketChange: (val: string) => void;
  timeframeFilter: string;
  onTimeframeChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  sortBy: BacktestSortOption;
  onSortChange: (val: BacktestSortOption) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export function BacktestFilters({
  search,
  onSearchChange,
  marketFilter,
  onMarketChange,
  timeframeFilter,
  onTimeframeChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  onReset,
  totalCount,
  filteredCount,
}: BacktestFiltersProps) {
  const isFiltered =
    search !== "" ||
    marketFilter !== "ALL" ||
    timeframeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    sortBy !== "recent";

  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Search backtests (ID, strategy, market)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-background border border-gray-200 dark:border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-zinc-50 placeholder:text-gray-500 dark:text-zinc-400 font-sans focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Market Filter */}
          <select
            value={marketFilter}
            onChange={(e) => onMarketChange(e.target.value)}
            className="bg-background border border-gray-200 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-zinc-50 font-sans focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Markets</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
          </select>

          {/* Timeframe Filter */}
          <select
            value={timeframeFilter}
            onChange={(e) => onTimeframeChange(e.target.value)}
            className="bg-background border border-gray-200 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-zinc-50 font-sans focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Timeframes</option>
            <option value="5M">5M</option>
            <option value="15M">15M</option>
            <option value="1H">1H</option>
            <option value="4H">4H</option>
            <option value="1D">1D</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-background border border-gray-200 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-zinc-50 font-sans focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as BacktestSortOption)}
            className="bg-background border border-gray-200 dark:border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-zinc-50 font-sans focus:outline-none focus:border-cyan-500/50"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="netReturn">Sort: Net Return</option>
            <option value="profitFactor">Sort: Profit Factor</option>
            <option value="maxDrawdown">Sort: Lowest Drawdown</option>
            <option value="tradeCount">Sort: Trade Count</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="text-xs font-sans py-1.5 px-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:text-zinc-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          )}

          {/* Result Count Indicator */}
          <span className="text-[11px] font-sans text-gray-500 dark:text-zinc-400 ml-1">
            {filteredCount} of {totalCount} backtests
          </span>
        </div>
      </div>
    </div>
  );
}
