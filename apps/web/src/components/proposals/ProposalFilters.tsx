"use client";

import React from "react";
import { Search, RotateCcw, ArrowUpDown } from "lucide-react";

export interface ProposalFilterState {
  search: string;
  status: string;
  asset: string;
  direction: string;
  timeframe: string;
  strategy: string;
  sortBy: "default" | "confidence-desc" | "rr-desc" | "newest" | "risk";
}

interface ProposalFiltersProps {
  filters: ProposalFilterState;
  onFilterChange: (filters: ProposalFilterState) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}

export function ProposalFilters({
  filters,
  onFilterChange,
  onReset,
  resultCount,
  totalCount,
  className = "",
}: ProposalFiltersProps) {
  const updateFilter = <K extends keyof ProposalFilterState>(
    key: K,
    value: ProposalFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const isFiltered =
    filters.search !== "" ||
    filters.status !== "All" ||
    filters.asset !== "All" ||
    filters.direction !== "All" ||
    filters.timeframe !== "All" ||
    filters.strategy !== "All";

  return (
    <div
      className={`p-3 rounded-lg bg-surface border border-border-color space-y-3 ${className}`}
    >
      {/* Top Search & Sorting Line */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search proposals by symbol, strategy, or ID (e.g. BTC, Breakout)..."
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
                  e.target.value as ProposalFilterState["sortBy"]
                )
              }
              className="bg-bg-950 border border-border-color text-gray-200 text-xs font-mono rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="default">Awaiting Approval + Confidence</option>
              <option value="confidence-desc">Confidence: High to Low</option>
              <option value="rr-desc">Risk/Reward: High to Low</option>
              <option value="newest">Newest Generated</option>
              <option value="risk">Risk % (Lowest First)</option>
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

      {/* Selectable Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-color/60 text-xs font-mono">
        {/* Status */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Status:</span>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Awaiting Approval">Awaiting Approval</option>
            <option value="Risk Approved">Risk Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Asset */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Asset:</span>
          <select
            value={filters.asset}
            onChange={(e) => updateFilter("asset", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Assets</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
          </select>
        </div>

        {/* Direction */}
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

        {/* Timeframe */}
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
          </select>
        </div>

        {/* Strategy */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase">Strategy:</span>
          <select
            value={filters.strategy}
            onChange={(e) => updateFilter("strategy", e.target.value)}
            className="bg-bg-950 border border-border-color text-gray-200 text-[11px] rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Strategies</option>
            <option value="Breakout Continuation">Breakout Continuation</option>
            <option value="Trend Continuation">Trend Continuation</option>
            <option value="Mean Reversion">Mean Reversion</option>
            <option value="Volatility Compression">Volatility Compression</option>
          </select>
        </div>

        {/* Count */}
        <div className="ml-auto text-[10px] text-gray-400">
          Showing <span className="font-bold text-gray-200">{resultCount}</span> of{" "}
          {totalCount} proposals
        </div>
      </div>
    </div>
  );
}
