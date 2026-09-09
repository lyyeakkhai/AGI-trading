"use client";

import React from "react";
import { DirectionalAnalytics, ConsistencyMetrics } from "@/lib/mockAnalyticsData";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, ShieldCheck, Flame } from "lucide-react";

interface DirectionalConsistencyCardProps {
  directional: DirectionalAnalytics;
  consistency: ConsistencyMetrics;
}

export function DirectionalConsistencyCard({
  directional,
  consistency,
}: DirectionalConsistencyCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
      {/* Long vs Short Directional Breakdown */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-500/10 border border-zinc-200 dark:border-cyan-900/30 text-cyan-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold font-medium text-text-primary">
              Long vs Short Alpha Distribution
            </h3>
          </div>
          <span className="text-xs text-text-muted">Directional bias</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Long */}
          <div className="p-3 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10">
            <div className="flex items-center gap-1 text-emerald-400 font-bold mb-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Long Trades ({directional.long.trades})</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-emerald-400">
                +${directional.long.netPnl.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted">
                PF <strong className="text-text-primary">{directional.long.profitFactor.toFixed(2)}</strong>
              </span>
            </div>
            <span className="text-xs text-text-muted block mt-1">
              Win rate: {directional.long.winRate.toFixed(1)}%
            </span>
          </div>

          {/* Short */}
          <div className="p-3 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10">
            <div className="flex items-center gap-1 text-cyan-400 font-bold mb-1.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Short Trades ({directional.short.trades})</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-emerald-400">
                +${directional.short.netPnl.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted">
                PF <strong className="text-text-primary">{directional.short.profitFactor.toFixed(2)}</strong>
              </span>
            </div>
            <span className="text-xs text-text-muted block mt-1">
              Win rate: {directional.short.winRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Performance Consistency Metrics */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold font-medium text-text-primary">
              Performance Consistency & Streaks
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-bold">
            High Reliability
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10">
            <span className="text-xs text-text-muted block">Profitable Days</span>
            <span className="text-xs font-bold text-text-primary block mt-1">
              {consistency.profitableDaysRatio}
            </span>
          </div>

          <div className="p-2 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10">
            <span className="text-xs text-text-muted block">Profitable Weeks</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1">
              {consistency.profitableWeeksRatio}
            </span>
          </div>

          <div className="p-2 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10">
            <span className="text-xs text-text-muted block">Win/Loss Streak</span>
            <span className="text-xs font-bold text-text-primary block mt-1">
              {consistency.winningStreak}W / {consistency.losingStreak}L
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
