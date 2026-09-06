"use client";

import React, { useState } from "react";
import { EnvironmentBadge, Button } from "@/components";
import { LineChart, SlidersHorizontal, Download, Calendar, Info } from "lucide-react";

interface AnalyticsSummaryHeaderProps {
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  onOpenCompare?: () => void;
  onExportReport?: () => void;
}

export function AnalyticsSummaryHeader({
  timeframe,
  onTimeframeChange,
  onOpenCompare,
  onExportReport,
}: AnalyticsSummaryHeaderProps) {
  const [showExportToast, setShowExportToast] = useState(false);

  const handleExport = () => {
    if (onExportReport) {
      onExportReport();
    } else {
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 3000);
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border bg-background/50 backdrop-blur-sm pb-5 pt-1">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-text-primary font-mono">
                Analytics
              </h1>
              <EnvironmentBadge mode="PAPER" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Performance telemetry, risk-adjusted returns, strategy behavior, and execution quality.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
        {/* Timeframe Range Selector */}
        <div className="flex items-center gap-1 bg-surface-1 border border-border rounded p-0.5">
          {["7D", "30D", "90D", "YTD", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => onTimeframeChange(range)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                timeframe === range
                  ? "bg-cyan-500/20 text-cyan-300 font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Compare Strategies */}
        {onOpenCompare && (
          <Button
            variant="secondary"
            onClick={onOpenCompare}
            className="text-xs py-1.5 px-3 flex items-center gap-1.5 border-border hover:border-cyan-500/40"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compare</span>
          </Button>
        )}

        {/* Export Report */}
        <Button
          variant="secondary"
          onClick={handleExport}
          className="text-xs py-1.5 px-3 flex items-center gap-1.5 border-border hover:border-cyan-500/40"
        >
          <Download className="w-3.5 h-3.5 text-text-muted" />
          <span>Export</span>
        </Button>
      </div>

      {/* Export Toast Notification */}
      {showExportToast && (
        <div className="absolute top-16 right-0 z-30 p-2.5 rounded bg-surface-1 border border-cyan-500/40 shadow-xl text-xs font-mono text-cyan-300 flex items-center gap-2 animate-in fade-in">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export will be available when the analytics backend is connected.</span>
        </div>
      )}
    </div>
  );
}
