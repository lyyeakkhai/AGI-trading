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
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
            Execution Assumptions & Friction Decay
          </h3>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          {backtest.executionModel}
        </span>
      </div>

      {/* Gross vs Net PnL comparison visual */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 text-xs font-mono">
        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Gross P&L</span>
          <span className={`text-sm font-bold ${backtest.grossPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {backtest.grossPnl >= 0 ? `+$${backtest.grossPnl.toLocaleString()}` : `-$${Math.abs(backtest.grossPnl).toLocaleString()}`}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">Pre-fee paper baseline</span>
        </div>

        <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/20">
          <span className="text-[10px] text-amber-400 block">Total Drag</span>
          <span className="text-sm font-bold text-amber-400">
            -${frictionTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            Fees ${backtest.fees} + Slip ${backtest.slippage} ({frictionPctOfGross.toFixed(1)}%)
          </span>
        </div>

        <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30">
          <span className="text-[10px] text-cyan-400 block">Realized Net P&L</span>
          <span className={`text-sm font-bold ${backtest.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {backtest.netPnl >= 0 ? `+$${backtest.netPnl.toLocaleString()}` : `-$${Math.abs(backtest.netPnl).toLocaleString()}`}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">Final verifiable yield</span>
        </div>
      </div>

      {/* Assumptions details */}
      <div className="p-2 rounded bg-surface-2/40 border border-border/30 text-[11px] font-mono text-text-muted flex flex-wrap items-center justify-between gap-2">
        <span>Strategy: <strong className="text-text-primary">{backtest.strategyName} {backtest.strategyVersion}</strong></span>
        <span>Market: <strong className="text-text-primary">{backtest.market}</strong></span>
        <span>TF: <strong className="text-text-primary">{backtest.timeframe}</strong></span>
        <span>Window: <strong className="text-text-primary">{backtest.startDate} → {backtest.endDate}</strong></span>
      </div>
    </div>
  );
}
