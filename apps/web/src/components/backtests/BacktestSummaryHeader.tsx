"use client";

import React from "react";
import Link from "next/link";
import { EnvironmentBadge, Button } from "@/components";
import { Plus, SlidersHorizontal, ArrowUpRight, BarChart2 } from "lucide-react";

interface BacktestSummaryHeaderProps {
  strategies: { id: string; name: string; version: string }[];
  selectedStrategyId: string;
  onSelectStrategy: (stratId: string) => void;
  onOpenNewBacktest: () => void;
  onOpenComparison?: () => void;
  comparisonCount?: number;
}

export function BacktestSummaryHeader({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  onOpenNewBacktest,
  onOpenComparison,
  comparisonCount = 0,
}: BacktestSummaryHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border bg-background/50 backdrop-blur-sm pb-5 pt-1">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-text-primary font-mono">
                Backtests
              </h1>
              <EnvironmentBadge mode="PAPER" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Historical strategy validation, regime stress-testing, and quantitative walk-forward verification.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Strategy Context Filter */}
        <div className="flex items-center gap-1.5 bg-surface-1 border border-border rounded px-2.5 py-1 text-xs">
          <span className="text-text-muted font-mono">Strategy:</span>
          <select
            value={selectedStrategyId}
            onChange={(e) => onSelectStrategy(e.target.value)}
            className="bg-transparent text-text-primary font-mono text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-surface-1 text-text-primary">All Strategies</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface-1 text-text-primary">
                {s.name} ({s.version})
              </option>
            ))}
          </select>
        </div>

        {/* View in Strategies Page Link */}
        <Link
          href="/strategies"
          className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 px-2.5 py-1.5 rounded bg-cyan-950/20 border border-cyan-500/20 transition-colors"
        >
          <span>Registry</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>

        {/* Comparison Trigger if items selected */}
        {comparisonCount > 0 && onOpenComparison && (
          <Button
            variant="secondary"
            onClick={onOpenComparison}
            className="text-xs font-mono py-1.5 px-3 flex items-center gap-1.5 border-cyan-500/40 text-cyan-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Compare ({comparisonCount})</span>
          </Button>
        )}

        {/* New Backtest Action */}
        <Button
          variant="primary"
          onClick={onOpenNewBacktest}
          className="text-xs font-mono py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Backtest</span>
        </Button>
      </div>
    </div>
  );
}
