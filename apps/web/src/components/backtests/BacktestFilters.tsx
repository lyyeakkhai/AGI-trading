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
    <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-surface-1 border border-border">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search backtests (ID, strategy, market)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-background border border-border rounded pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Market Filter */}
          <select
            value={marketFilter}
            onChange={(e) => onMarketChange(e.target.value)}
            className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Markets</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
          </select>

          {/* Timeframe Filter */}
          <select
            value={timeframeFilter}
            onChange={(e) => onTimeframeChange(e.target.value)}
            className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-500/50"
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
            className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-500/50"
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
            className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan-500/50"
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
              className="text-xs font-mono py-1.5 px-2 text-text-muted hover:text-text-primary flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          )}

          {/* Result Count Indicator */}
          <span className="text-[11px] font-mono text-text-muted ml-1">
            {filteredCount} of {totalCount} backtests
          </span>
        </div>
      </div>
    </div>
  );
}
