"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";

export interface AnalyticsFilterState {
  strategy: string;
  asset: string;
  timeframe: string;
  regime: string;
  direction: string;
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilterState;
  onFilterChange: (filters: AnalyticsFilterState) => void;
  onReset: () => void;
  className?: string;
}

export function AnalyticsFilters({
  filters,
  onFilterChange,
  onReset,
  className = "",
}: AnalyticsFiltersProps) {
  const updateFilter = <K extends keyof AnalyticsFilterState>(
    key: K,
    value: AnalyticsFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const isFiltered =
    filters.strategy !== "All" ||
    filters.asset !== "All" ||
    filters.timeframe !== "All" ||
    filters.regime !== "All" ||
    filters.direction !== "All";

  return (
    <div className={`p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-sans text-gray-300">
          <Filter size={14} className="text-cyan-400" />
          <span className="font-semibold font-medium text-xs text-gray-200">
            Attribution Filters
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-sans">
          {/* Strategy Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Strategy:</span>
            <select
              value={filters.strategy}
              onChange={(e) => updateFilter("strategy", e.target.value)}
              className="bg-bg-950 border border-zinc-200 dark:border-white/10 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Strategies</option>
              <option value="Momentum Breakout">Momentum Breakout</option>
              <option value="Trend Expansion">Trend Expansion</option>
              <option value="Mean Reversion Spread">Mean Reversion</option>
              <option value="Volatility Compression">Volatility Compression</option>
            </select>
          </div>

          {/* Asset Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Asset:</span>
            <select
              value={filters.asset}
              onChange={(e) => updateFilter("asset", e.target.value)}
              className="bg-bg-950 border border-zinc-200 dark:border-white/10 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Assets</option>
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">TF:</span>
            <select
              value={filters.timeframe}
              onChange={(e) => updateFilter("timeframe", e.target.value)}
              className="bg-bg-950 border border-zinc-200 dark:border-white/10 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Timeframes</option>
              <option value="15M">15M</option>
              <option value="1H">1H</option>
              <option value="4H">4H</option>
              <option value="1D">1D</option>
            </select>
          </div>

          {/* Market Regime */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Regime:</span>
            <select
              value={filters.regime}
              onChange={(e) => updateFilter("regime", e.target.value)}
              className="bg-bg-950 border border-zinc-200 dark:border-white/10 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Regimes</option>
              <option value="Trending Bull">Trending Bull</option>
              <option value="Ranging Low Vol">Ranging Low Vol</option>
              <option value="Trending Bear">Trending Bear</option>
              <option value="High Vol Expansion">High Vol Expansion</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Side:</span>
            <select
              value={filters.direction}
              onChange={(e) => updateFilter("direction", e.target.value)}
              className="bg-bg-950 border border-zinc-200 dark:border-white/10 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Sides</option>
              <option value="LONG">Long Only</option>
              <option value="SHORT">Short Only</option>
            </select>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-sans text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-bg-950 border border-zinc-200 dark:border-white/10 hover:border-cyan-500/40 transition-colors ml-1"
              title="Reset attribution filters"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
