"use client";

import React from "react";
import { EnvironmentBadge, Button } from "@/components";
import { Activity, Clock, List, LayoutList, ShieldCheck } from "lucide-react";

interface ActivitySummaryHeaderProps {
  viewMode: "timeline" | "table";
  onViewModeChange: (mode: "timeline" | "table") => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
}

export function ActivitySummaryHeader({
  viewMode,
  onViewModeChange,
  dateRange,
  onDateRangeChange,
  onExportCSV,
  onExportJSON,
}: ActivitySummaryHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border bg-background/50 backdrop-blur-sm pb-5 pt-1">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-text-primary font-sans">
                Activity & Audit
              </h1>
              <EnvironmentBadge mode="PAPER" />
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-[11px] font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                SYSTEM OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Deterministic operational ledger, execution checkpoints, state transitions, and audit telemetry.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 font-sans text-xs">
        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm rounded-xl p-0.5">
          {["Today", "7 Days", "30 Days", "All Time"].map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`px-2.5 py-1 rounded-xl text-xs transition-colors ${
                dateRange === range
                  ? "bg-cyan-500/20 text-cyan-300 font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* View Switcher: Timeline vs Table */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm rounded-xl p-0.5">
          <button
            onClick={() => onViewModeChange("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-colors ${
              viewMode === "timeline"
                ? "bg-cyan-500/20 text-cyan-300 font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-colors ${
              viewMode === "table"
                ? "bg-cyan-500/20 text-cyan-300 font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm rounded-xl p-0.5">
          <button
            type="button"
            onClick={onExportCSV}
            className="px-2.5 py-1 rounded-xl text-[11px] text-gray-300 hover:text-white hover:bg-surface-2 transition-colors font-semibold"
            title="Export filtered events as CSV"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={onExportJSON}
            className="px-2.5 py-1 rounded-xl text-[11px] text-gray-300 hover:text-white hover:bg-surface-2 transition-colors font-semibold"
            title="Export filtered events as JSON"
          >
            JSON
          </button>
        </div>
      </div>
    </div>
  );
}
