"use client";

import React from "react";
import { BacktestRecord } from "@/lib/mockBacktestsData";
import { BarChart3, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface TradeStatisticsCardProps {
  backtest: BacktestRecord;
}

export function TradeStatisticsCard({ backtest }: TradeStatisticsCardProps) {
  const winPct = backtest.tradeCount > 0 ? (backtest.winningTrades / backtest.tradeCount) * 100 : 0;
  const lossPct = backtest.tradeCount > 0 ? (backtest.losingTrades / backtest.tradeCount) * 100 : 0;

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
            Trade Statistics & Distribution
          </h3>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          Avg Hold: {backtest.averageHoldingTime}
        </span>
      </div>

      {/* Win/Loss Proportion Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {backtest.winningTrades} Winners ({winPct.toFixed(1)}%)
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {backtest.losingTrades} Losers ({lossPct.toFixed(1)}%)
          </span>
        </div>
        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${winPct}%` }}
            className="bg-emerald-500 transition-all duration-300"
          />
          <div
            style={{ width: `${lossPct}%` }}
            className="bg-red-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="p-2 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Avg Winner</span>
          <span className="text-emerald-400 font-bold text-sm">
            +{backtest.averageWinner.toFixed(2)}R
          </span>
        </div>
        <div className="p-2 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Avg Loser</span>
          <span className="text-red-400 font-bold text-sm">
            {backtest.averageLoser.toFixed(2)}R
          </span>
        </div>
        <div className="p-2 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Max Winner</span>
          <span className="text-emerald-400 font-bold text-sm">
            +{backtest.largestWinner.toFixed(1)}R
          </span>
        </div>
        <div className="p-2 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Max Loser</span>
          <span className="text-red-400 font-bold text-sm">
            {backtest.largestLoser.toFixed(1)}R
          </span>
        </div>
      </div>
    </div>
  );
}
