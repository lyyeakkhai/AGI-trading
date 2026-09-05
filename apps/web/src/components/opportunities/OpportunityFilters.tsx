"use client";

import React from "react";
import { Search, Filter, RotateCcw, ArrowUpDown } from "lucide-react";

export interface OpportunityFilterState {
  search: string;
  market: string;
  direction: string;
  timeframe: string;
  strategy: string;
  confidence: string;
  status: string;
  sortBy: "confidence-desc" | "confidence-asc" | "newest" | "risk" | "symbol";
}

interface OpportunityFiltersProps {
  filters: OpportunityFilterState;
  onFilterChange: (filters: OpportunityFilterState) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}

export function OpportunityFilters({
  filters,
  onFilterChange,
  onReset,
  resultCount,
  totalCount,
  className = "",
}: OpportunityFiltersProps) {
  const updateFilter = <K extends keyof OpportunityFilterState>(
    key: K,
    value: OpportunityFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const isFiltered =
    filters.search !== "" ||
    filters.market !== "All" ||
    filters.direction !== "All" ||
    filters.timeframe !== "All" ||
    filters.strategy !== "All" ||
    filters.confidence !== "All" ||
    filters.status !== "All";

  return (
    <div
      className={`p-3 rounded-lg bg-surface border border-border-color space-y-3 ${className}`}
    >
      {/* Search & Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search setups by symbol, strategy, or regime (e.g. BTC, Breakout)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-bg-950 border border-border-color rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Sorting Dropdown & Results Counter */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
            <ArrowUpDown size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                updateFilter(
                  "sortBy",
                  e.target.value as OpportunityFilterState["sortBy"]
                )
              }
              className="bg-bg-950 border border-border-color text-gray-200 text-xs font-mono rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="confidence-desc">Confidence: High to Low</option>
              <option value="confidence-asc">Confidence: Low to High</option>
              <option value="newest">Newest Detected</option>
              <option value="risk">Risk Level</option>
              <option value="symbol">Asset (A-Z)</option>
            </select>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Selectable Filter Chips / Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-color/60 text-xs font-mono">
        {/* Market Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Market:</span>
          <select
            value={filters.market}
            onChange={(e) => updateFilter("market", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Markets</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>
        </div>

        {/* Direction Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Direction:</span>
          <select
            value={filters.direction}
            onChange={(e) => updateFilter("direction", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Directions</option>
            <option value="LONG">Long Only</option>
            <option value="SHORT">Short Only</option>
          </select>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Timeframe:</span>
          <select
            value={filters.timeframe}
            onChange={(e) => updateFilter("timeframe", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Timeframes</option>
            <option value="15M">15M</option>
            <option value="1H">1H</option>
            <option value="4H">4H</option>
            <option value="1D">1D</option>
          </select>
        </div>

        {/* Confidence Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Confidence:</span>
          <select
            value={filters.confidence}
            onChange={(e) => updateFilter("confidence", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="high">High (&gt;70%)</option>
            <option value="medium">Medium (50-70%)</option>
            <option value="low">Low (&lt;50%)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Status:</span>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active (Excl. Expired)</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Weakening">Weakening</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Counter Info */}
        <div className="ml-auto text-[10px] text-gray-400">
          Showing <span className="font-bold text-gray-200">{resultCount}</span> of{" "}
          {totalCount} setups
        </div>
      </div>
    </div>
  );
}
