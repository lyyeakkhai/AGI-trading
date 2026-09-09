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
    <div className="bg-black border border-zinc-800 p-3 space-y-4">
      {/* Top Row: Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 self-start">
          <button
            type="button"
            onClick={() => handleTabChange("open")}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
              filters.tab === "open"
                ? "bg-zinc-800 text-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>OPN_POS</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-black border border-zinc-800 text-zinc-400">
              {openCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("closed")}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
              filters.tab === "closed"
                ? "bg-zinc-800 text-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>CLS_HST</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-black border border-zinc-800 text-zinc-400">
              {closedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
              filters.tab === "all"
                ? "bg-zinc-800 text-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>ALL</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-black border border-zinc-800 text-zinc-400">
              {totalCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center w-full">
            <Search size={14} className="absolute left-3 text-zinc-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="SEARCH SYMBOL, STRATEGY, ID..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono tracking-widest uppercase pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-900 focus:bg-black placeholder:text-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Granular Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono font-bold tracking-widest mr-2 uppercase">
          <Filter size={13} className="text-cyan-500" />
          <span>FLTR_SYS:</span>
        </div>

        {/* Asset Filter */}
        <div className="w-28 sm:w-32">
          <Select
            value={filters.asset}
            onChange={(e) => onFilterChange({ ...filters, asset: e.target.value })}
            options={[
              { value: "All", label: "AST: ALL" },
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
              { value: "All", label: "DIR: ALL" },
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
              { value: "All", label: "STRAT: ALL" },
              { value: "Breakout Continuation", label: "BRK_CONT" },
              { value: "Trend Continuation", label: "TRND_CONT" },
              { value: "Mean Reversion", label: "MN_REV" },
              { value: "Momentum", label: "MOMENTUM" },
              { value: "Volatility Breakout", label: "VOL_BRK" },
            ]}
          />
        </div>

        {/* Risk State Filter */}
        <div className="w-28 sm:w-36">
          <Select
            value={filters.riskState}
            onChange={(e) => onFilterChange({ ...filters, riskState: e.target.value })}
            options={[
              { value: "All", label: "RSK: ALL" },
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
              { value: "default", label: "SRT: DEFAULT" },
              { value: "pnl-desc", label: "SRT: PNL_DESC" },
              { value: "pnl-asc", label: "SRT: PNL_ASC" },
              { value: "pnl-pct-desc", label: "SRT: PNL_PCT" },
              { value: "exposure-desc", label: "SRT: EXP_DESC" },
              { value: "risk-desc", label: "SRT: RSK_DESC" },
              { value: "newest", label: "SRT: NEWEST" },
              { value: "asset", label: "SRT: ASSET" },
            ]}
          />
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest p-2 border border-transparent hover:border-zinc-800 transition-colors"
          title="Reset Filters"
        >
          <RotateCcw size={12} />
          <span>RST</span>
        </button>
      </div>
    </div>
  );
}
