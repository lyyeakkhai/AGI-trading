"use client";

import React from "react";
import { BacktestRecord } from "@/lib/mockBacktestsData";
import { TrendingUp, TrendingDown, Percent, Target, Clock, ShieldAlert, DollarSign, Activity } from "lucide-react";

interface BacktestMetricsSummaryProps {
  backtest: BacktestRecord;
}

export function BacktestMetricsSummary({ backtest }: BacktestMetricsSummaryProps) {
  const isProfit = backtest.netPnl >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
      {/* 1. Initial Capital */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Initial Capital</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-base font-bold font-mono text-text-primary">
            ${backtest.initialCapital.toLocaleString()}
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">Base equity</span>
      </div>

      {/* 2. Final Equity */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Final Equity</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-base font-bold font-mono ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            ${backtest.finalEquity.toLocaleString()}
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">End of period</span>
      </div>

      {/* 3. Net Return & Realized P&L */}
      <div className="p-3 rounded-lg bg-surface-1 border border-cyan-500/20 bg-cyan-950/10 flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1">
          <Percent className="w-3 h-3" />
          Net Return
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-base font-bold font-mono ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            {isProfit ? `+${backtest.netReturn.toFixed(1)}%` : `${backtest.netReturn.toFixed(1)}%`}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/90 mt-0.5">
          {isProfit ? `+$${backtest.netPnl.toLocaleString()}` : `-$${Math.abs(backtest.netPnl).toLocaleString()}`} net P&L
        </span>
      </div>

      {/* 4. Max Drawdown */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red-400" />
          Max Drawdown
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-base font-bold font-mono text-red-400">
            {backtest.maxDrawdown.toFixed(1)}%
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">
          Avg {backtest.averageDrawdown.toFixed(1)}% ({backtest.longestDrawdown})
        </span>
      </div>

      {/* 5. Win Rate */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <Target className="w-3 h-3 text-cyan-400" />
          Win Rate
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-base font-bold font-mono text-text-primary">
            {backtest.winRate.toFixed(1)}%
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">
          {backtest.winningTrades}W / {backtest.losingTrades}L ({backtest.tradeCount} trades)
        </span>
      </div>

      {/* 6. Profit Factor & Expectancy */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          Profit Factor
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-base font-bold font-mono ${backtest.profitFactor >= 1.5 ? "text-emerald-400" : backtest.profitFactor >= 1.0 ? "text-amber-400" : "text-red-400"}`}>
            {backtest.profitFactor.toFixed(2)}
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 mt-0.5">
          Expectancy: {backtest.expectancy >= 0 ? `+${backtest.expectancy.toFixed(2)}R` : `${backtest.expectancy.toFixed(2)}R`}
        </span>
      </div>

      {/* 7. Trade Friction (Fees & Slippage) */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-amber-400" />
          Friction
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-base font-bold font-mono text-text-primary">
            ${backtest.fees + backtest.slippage}
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted mt-0.5">
          Fees ${backtest.fees} · Slip ${backtest.slippage}
        </span>
      </div>
    </div>
  );
}
