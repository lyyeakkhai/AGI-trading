"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components";

interface ActivityFiltersBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeChange: (val: string) => void;
  sourceFilter: string;
  onSourceChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  envFilter: string;
  onEnvChange: (val: string) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export function ActivityFiltersBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  sourceFilter,
  onSourceChange,
  statusFilter,
  onStatusChange,
  envFilter,
  onEnvChange,
  onReset,
  totalCount,
  filteredCount,
}: ActivityFiltersBarProps) {
  const isFiltered =
    search !== "" ||
    typeFilter !== "ALL" ||
    sourceFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    envFilter !== "ALL";

  return (
    <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative w-full md:w-72">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search activity (ID, object, symbol)..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background border border-border rounded pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end font-mono text-xs">
        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value="ALL">All Types</option>
          <option value="RISK">Risk</option>
          <option value="HERMES">Hermes</option>
          <option value="TRADE_PROPOSAL">Trade Proposals</option>
          <option value="OPPORTUNITY">Opportunities</option>
          <option value="APPROVAL">Approvals</option>
          <option value="EXECUTION">Executions</option>
          <option value="POSITION">Positions</option>
          <option value="PORTFOLIO">Portfolio</option>
          <option value="SECURITY">Security</option>
          <option value="MARKET">Market Data</option>
          <option value="STRATEGY">Strategies</option>
          <option value="BACKTEST">Backtests</option>
          <option value="SYSTEM">System</option>
          <option value="ERROR">Errors / Warnings</option>
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => onSourceChange(e.target.value)}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value="ALL">All Sources</option>
          <option value="Hermes">Hermes</option>
          <option value="Risk Engine">Risk Engine</option>
          <option value="Owner">Owner</option>
          <option value="Execution Service">Execution Service</option>
          <option value="Portfolio">Portfolio</option>
          <option value="Market Data">Market Data</option>
          <option value="System">System</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="REJECTED">Rejected</option>
          <option value="WARNING">Warning</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="INFO">Info</option>
        </select>

        {/* Environment Filter */}
        <select
          value={envFilter}
          onChange={(e) => onEnvChange(e.target.value)}
          className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
        >
          <option value="ALL">All Environments</option>
          <option value="PAPER">Paper Mode</option>
          <option value="LIVE">Live Mode</option>
        </select>

        {/* Reset Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-xs py-1.5 px-2 text-text-muted hover:text-text-primary flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </Button>
        )}

        <span className="text-[11px] text-text-muted ml-1">
          {filteredCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
