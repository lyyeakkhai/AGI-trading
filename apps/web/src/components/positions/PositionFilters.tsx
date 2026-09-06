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
    <Surface variant="default" padded="md" className="space-y-3">
      {/* Top Row: Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-md bg-bg-950 border border-border-color self-start">
          <button
            type="button"
            onClick={() => handleTabChange("open")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              filters.tab === "open"
                ? "bg-surface-2 text-cyan-400 font-bold border border-border-color shadow-[0_0_8px_rgba(0,229,255,0.1)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>Open Positions</span>
            <span className="text-[10px] px-1 rounded bg-bg-900 border border-border-color">
              {openCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("closed")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              filters.tab === "closed"
                ? "bg-surface-2 text-cyan-400 font-bold border border-border-color shadow-[0_0_8px_rgba(0,229,255,0.1)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>Closed History</span>
            <span className="text-[10px] px-1 rounded bg-bg-900 border border-border-color">
              {closedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              filters.tab === "all"
                ? "bg-surface-2 text-cyan-400 font-bold border border-border-color shadow-[0_0_8px_rgba(0,229,255,0.1)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1 rounded bg-bg-900 border border-border-color">
              {totalCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <Input
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            placeholder="Search symbol, strategy, ID, thesis..."
            leftIcon={<Search size={14} className="text-gray-400" />}
            className="w-full"
          />
        </div>
      </div>

      {/* Bottom Row: Granular Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-color">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mr-1">
          <Filter size={13} className="text-cyan-400" />
          <span>Filters:</span>
        </div>

        {/* Asset Filter */}
        <div className="w-28 sm:w-32">
          <Select
            value={filters.asset}
            onChange={(e) =>
              onFilterChange({ ...filters, asset: e.target.value })
            }
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
            onChange={(e) =>
              onFilterChange({ ...filters, direction: e.target.value })
            }
            options={[
              { value: "All", label: "Side: All" },
              { value: "LONG", label: "Long" },
              { value: "SHORT", label: "Short" },
            ]}
          />
        </div>

        {/* Strategy Filter */}
        <div className="w-36 sm:w-44">
          <Select
            value={filters.strategy}
            onChange={(e) =>
              onFilterChange({ ...filters, strategy: e.target.value })
            }
            options={[
              { value: "All", label: "Strategy: All" },
              { value: "Breakout Continuation", label: "Breakout Continuation" },
              { value: "Trend Continuation", label: "Trend Continuation" },
              { value: "Mean Reversion", label: "Mean Reversion" },
              { value: "Momentum", label: "Momentum" },
              { value: "Volatility Breakout", label: "Volatility Breakout" },
            ]}
          />
        </div>

        {/* Risk State Filter */}
        <div className="w-28 sm:w-36">
          <Select
            value={filters.riskState}
            onChange={(e) =>
              onFilterChange({ ...filters, riskState: e.target.value })
            }
            options={[
              { value: "All", label: "Risk: All" },
              { value: "NORMAL", label: "Normal" },
              { value: "ELEVATED", label: "Elevated" },
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
              { value: "default", label: "Sort: Default Priority" },
              { value: "pnl-desc", label: "Sort: P&L (High to Low)" },
              { value: "pnl-asc", label: "Sort: P&L (Low to High)" },
              { value: "pnl-pct-desc", label: "Sort: P&L %" },
              { value: "exposure-desc", label: "Sort: Exposure" },
              { value: "risk-desc", label: "Sort: Risk %" },
              { value: "newest", label: "Sort: Newest First" },
              { value: "asset", label: "Sort: Asset Symbol" },
            ]}
          />
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-200"
          title="Reset Filters"
        >
          <RotateCcw size={12} className="mr-1" />
          Reset
        </Button>
      </div>
    </Surface>
  );
}
