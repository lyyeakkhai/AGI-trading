"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { StrategyFilterState, defaultStrategyFilters } from "@/lib/mockStrategiesData";
import { Search, RotateCcw, Filter } from "lucide-react";

interface StrategyFiltersProps {
  filters: StrategyFilterState;
  onFilterChange: (filters: StrategyFilterState) => void;
  totalCount: number;
}

export function StrategyFilters({
  filters,
  onFilterChange,
  totalCount,
}: StrategyFiltersProps) {
  const handleReset = () => {
    onFilterChange(defaultStrategyFilters);
  };

  return (
    <Surface variant="default" padded="md" className="space-y-3">
      {/* Top Row: Search & Count */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            placeholder="Search strategy name, version, market, type..."
            leftIcon={<Search size={14} className="text-gray-400" />}
            className="w-full"
          />
        </div>

        <div className="text-xs font-mono text-gray-400 self-end sm:self-auto">
          Showing <span className="font-bold text-cyan-400">{totalCount}</span> strategies
        </div>
      </div>

      {/* Bottom Row: Granular Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-color">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mr-1">
          <Filter size={13} className="text-cyan-400" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="w-28 sm:w-32">
          <Select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value })
            }
            options={[
              { value: "All", label: "Status: All" },
              { value: "ACTIVE", label: "Active" },
              { value: "UNDER_VALIDATION", label: "Validating" },
              { value: "DRAFT", label: "Draft" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
          />
        </div>

        {/* Validation Stage Filter */}
        <div className="w-36 sm:w-44">
          <Select
            value={filters.validationStage}
            onChange={(e) =>
              onFilterChange({ ...filters, validationStage: e.target.value })
            }
            options={[
              { value: "All", label: "Stage: All" },
              { value: "Trading Idea", label: "Idea" },
              { value: "Formal Strategy", label: "Formalized" },
              { value: "Backtest", label: "Backtest" },
              { value: "Out-of-Sample", label: "Out-of-Sample" },
              { value: "Walk-Forward", label: "Walk-Forward" },
              { value: "Paper Trading", label: "Paper Trading" },
              { value: "Approved", label: "Approved" },
            ]}
          />
        </div>

        {/* Market Filter */}
        <div className="w-28 sm:w-32">
          <Select
            value={filters.market}
            onChange={(e) =>
              onFilterChange({ ...filters, market: e.target.value })
            }
            options={[
              { value: "All", label: "Market: All" },
              { value: "BTC/USDT", label: "BTC/USDT" },
              { value: "ETH/USDT", label: "ETH/USDT" },
              { value: "Multi-Asset", label: "Multi-Asset" },
            ]}
          />
        </div>

        {/* Timeframe Filter */}
        <div className="w-24 sm:w-28">
          <Select
            value={filters.timeframe}
            onChange={(e) =>
              onFilterChange({ ...filters, timeframe: e.target.value })
            }
            options={[
              { value: "All", label: "TF: All" },
              { value: "15M", label: "15M" },
              { value: "1H", label: "1H" },
              { value: "4H", label: "4H" },
            ]}
          />
        </div>

        {/* Strategy Type Filter */}
        <div className="w-28 sm:w-36">
          <Select
            value={filters.type}
            onChange={(e) =>
              onFilterChange({ ...filters, type: e.target.value })
            }
            options={[
              { value: "All", label: "Type: All" },
              { value: "Trend", label: "Trend" },
              { value: "Breakout", label: "Breakout" },
              { value: "Mean Reversion", label: "Mean Reversion" },
              { value: "Momentum", label: "Momentum" },
              { value: "Volatility", label: "Volatility" },
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
                sortBy: e.target.value as StrategyFilterState["sortBy"],
              })
            }
            options={[
              { value: "default", label: "Sort: Default Priority" },
              { value: "stage", label: "Sort: Validation Stage" },
              { value: "return-desc", label: "Sort: Net Return %" },
              { value: "winrate-desc", label: "Sort: Win Rate %" },
              { value: "pf-desc", label: "Sort: Profit Factor" },
              { value: "drawdown-asc", label: "Sort: Lowest Drawdown" },
              { value: "newest", label: "Sort: Newest First" },
              { value: "name", label: "Sort: Name A-Z" },
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
