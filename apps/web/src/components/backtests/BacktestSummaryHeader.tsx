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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm pb-5 pt-1">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 font-sans">
                Backtests
              </h1>
              <EnvironmentBadge mode="PAPER" />
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Historical strategy validation, regime stress-testing, and quantitative walk-forward verification.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Strategy Context Filter */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl px-2.5 py-1 text-xs">
          <span className="text-gray-500 dark:text-zinc-400 font-sans">Strategy:</span>
          <select
            value={selectedStrategyId}
            onChange={(e) => onSelectStrategy(e.target.value)}
            className="bg-transparent text-gray-900 dark:text-zinc-50 font-sans text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-zinc-900/50 shadow-sm text-gray-900 dark:text-zinc-50">All Strategies</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900/50 shadow-sm text-gray-900 dark:text-zinc-50">
                {s.name} ({s.version})
              </option>
            ))}
          </select>
        </div>

        {/* View in Strategies Page Link */}
        <Link
          href="/strategies"
          className="inline-flex items-center gap-1 text-xs font-sans text-cyan-400 hover:text-cyan-300 px-2.5 py-1.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 transition-colors"
        >
          <span>Registry</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>

        {/* Comparison Trigger if items selected */}
        {comparisonCount > 0 && onOpenComparison && (
          <Button
            variant="secondary"
            onClick={onOpenComparison}
            className="text-xs font-sans py-1.5 px-3 flex items-center gap-1.5 border-cyan-500/40 text-cyan-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Compare ({comparisonCount})</span>
          </Button>
        )}

        {/* New Backtest Action */}
        <Button
          variant="primary"
          onClick={onOpenNewBacktest}
          className="text-xs font-sans py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Backtest</span>
        </Button>
      </div>
    </div>
  );
}
