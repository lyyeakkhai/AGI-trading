"use client";

import React from "react";
import { AnalyticsSummary } from "@/lib/mockAnalyticsData";
import { TrendingUp, ShieldAlert, Target, Activity, Award, Clock, DollarSign } from "lucide-react";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const isProfit = summary.netPnl >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
      {/* 1. Net Return */}
      <div className="p-3 rounded-lg bg-surface-1 border border-cyan-500/20 bg-cyan-950/10 flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Net Return
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-lg font-bold font-mono ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            {isProfit ? `+${summary.netReturn.toFixed(1)}%` : `${summary.netReturn.toFixed(1)}%`}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/90 mt-0.5">
          {isProfit ? `+$${summary.netPnl.toLocaleString()}` : `-$${Math.abs(summary.netPnl).toLocaleString()}`} net P&L
        </span>
      </div>

      {/* 2. Profit Factor */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          Profit Factor
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono text-text-primary">
            {summary.profitFactor.toFixed(2)}
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 mt-0.5">
          Expectancy: +{summary.expectancy.toFixed(2)}R
        </span>
      </div>

      {/* 3. Win Rate */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <Target className="w-3 h-3 text-cyan-400" />
          Win Rate
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono text-text-primary">
            {summary.winRate.toFixed(1)}%
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">
          {summary.winningTrades}W / {summary.losingTrades}L ({summary.tradeCount} trades)
        </span>
      </div>

      {/* 4. Max Drawdown */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red-400" />
          Max Drawdown
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono text-red-400">
            {summary.maxDrawdown.toFixed(1)}%
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">
          Calmar: {summary.calmarStyle.toFixed(2)}
        </span>
      </div>

      {/* 5. Risk-Adjusted Quality */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <Award className="w-3 h-3 text-emerald-400" />
          Risk-Adjusted
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold font-mono text-text-primary">
            Sh: {summary.sharpeStyle.toFixed(2)}
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            So: {summary.sortinoStyle.toFixed(2)}
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">
          Friction Drag: -${summary.fees + summary.slippage}
        </span>
      </div>
    </div>
  );
}
