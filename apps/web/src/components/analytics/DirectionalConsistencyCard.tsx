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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
      {/* Long vs Short Directional Breakdown */}
      <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Long vs Short Alpha Distribution
            </h3>
          </div>
          <span className="text-[11px] text-text-muted">Directional bias</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Long */}
          <div className="p-3 rounded bg-surface-2/60 border border-border/40">
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
            <span className="text-[11px] text-text-muted block mt-1">
              Win rate: {directional.long.winRate.toFixed(1)}%
            </span>
          </div>

          {/* Short */}
          <div className="p-3 rounded bg-surface-2/60 border border-border/40">
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
            <span className="text-[11px] text-text-muted block mt-1">
              Win rate: {directional.short.winRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Performance Consistency Metrics */}
      <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Performance Consistency & Streaks
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold">
            High Reliability
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Profitable Days</span>
            <span className="text-xs font-bold text-text-primary block mt-1">
              {consistency.profitableDaysRatio}
            </span>
          </div>

          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Profitable Weeks</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1">
              {consistency.profitableWeeksRatio}
            </span>
          </div>

          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Win/Loss Streak</span>
            <span className="text-xs font-bold text-text-primary block mt-1">
              {consistency.winningStreak}W / {consistency.losingStreak}L
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
