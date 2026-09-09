"use client";

import React from "react";
import { BacktestRecord } from "@/lib/mockBacktestsData";
import { Layers, Sliders, DollarSign, ArrowRight } from "lucide-react";

interface ExecutionAssumptionsCardProps {
  backtest: BacktestRecord;
}

export function ExecutionAssumptionsCard({ backtest }: ExecutionAssumptionsCardProps) {
  const frictionTotal = backtest.fees + backtest.slippage;
  const frictionPctOfGross = backtest.grossPnl !== 0 ? (frictionTotal / Math.abs(backtest.grossPnl)) * 100 : 0;

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-sans font-semibold uppercase tracking-wide text-gray-900 dark:text-zinc-50">
            Execution Assumptions & Friction Decay
          </h3>
        </div>
        <span className="text-[11px] font-sans text-gray-500 dark:text-zinc-400">
          {backtest.executionModel}
        </span>
      </div>

      {/* Gross vs Net PnL comparison visual */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 text-xs font-sans">
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">Gross P&L</span>
          <span className={`text-sm font-bold ${backtest.grossPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {backtest.grossPnl >= 0 ? `+$${backtest.grossPnl.toLocaleString()}` : `-$${Math.abs(backtest.grossPnl).toLocaleString()}`}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-0.5">Pre-fee paper baseline</span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
          <span className="text-[10px] text-amber-400 block">Total Drag</span>
          <span className="text-sm font-bold text-amber-400">
            -${frictionTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-0.5">
            Fees ${backtest.fees} + Slip ${backtest.slippage} ({frictionPctOfGross.toFixed(1)}%)
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
          <span className="text-[10px] text-cyan-400 block">Realized Net P&L</span>
          <span className={`text-sm font-bold ${backtest.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {backtest.netPnl >= 0 ? `+$${backtest.netPnl.toLocaleString()}` : `-$${Math.abs(backtest.netPnl).toLocaleString()}`}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-0.5">Final verifiable yield</span>
        </div>
      </div>

      {/* Assumptions details */}
      <div className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 text-[11px] font-sans text-gray-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2">
        <span>Strategy: <strong className="text-gray-900 dark:text-zinc-50">{backtest.strategyName} {backtest.strategyVersion}</strong></span>
        <span>Market: <strong className="text-gray-900 dark:text-zinc-50">{backtest.market}</strong></span>
        <span>TF: <strong className="text-gray-900 dark:text-zinc-50">{backtest.timeframe}</strong></span>
        <span>Window: <strong className="text-gray-900 dark:text-zinc-50">{backtest.startDate} → {backtest.endDate}</strong></span>
      </div>
    </div>
  );
}
