"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { PnLDisplay } from "@/features/trading/components/PnLDisplay";
import { PortfolioSummaryMetrics } from "@/lib/mockPositionsData";
import { DollarSign, PieChart, ShieldCheck, Activity } from "lucide-react";

interface PortfolioSummaryHeaderProps {
  metrics: PortfolioSummaryMetrics;
  openCount: number;
}

export function PortfolioSummaryHeader({
  metrics,
  openCount,
}: PortfolioSummaryHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 1. Page Title & Terminal State Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b-2 border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tighter text-zinc-100 uppercase font-mono">
              Positions
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-cyan-400 font-bold uppercase tracking-widest">
              {openCount} ACTIVE
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-wide">
            Real-time portfolio exposure & metrics.
          </p>
        </div>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
            PAPER MODE
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-black border border-cyan-900/50 text-[11px] font-mono text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
            <span className="w-2 h-2 bg-cyan-400 animate-pulse" />
            <span className="font-bold tracking-widest uppercase">SYS.ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 2. Compact Financial Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
        {/* Portfolio Value */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">
            PRTF_VAL
          </span>
          <div className="text-sm sm:text-base font-mono font-black text-zinc-100 tracking-tight">
            ${metrics.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Available Capital */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">
            AVL_CAP
          </span>
          <div className="text-sm sm:text-base font-mono font-black text-zinc-300 tracking-tight">
            ${metrics.availableCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Invested Capital */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">
            INV_CAP
          </span>
          <div className="text-sm sm:text-base font-mono font-black text-cyan-500 tracking-tight">
            ${metrics.investedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">
            UNRLZ_PNL
          </span>
          <div className="text-sm sm:text-base font-mono font-black tracking-tight">
            <PnLDisplay
              amount={metrics.unrealizedPnl}
              percentage={metrics.unrealizedPnlPercent}
              size="md"
            />
          </div>
        </div>

        {/* Realized P&L */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">
            RLZ_PNL
          </span>
          <div className="text-sm sm:text-base font-mono font-black tracking-tight">
            <PnLDisplay
              amount={metrics.realizedPnl}
              percentage={metrics.realizedPnlPercent}
              size="md"
            />
          </div>
        </div>

        {/* Total Exposure */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">
            TTL_EXP
          </span>
          <div className="text-sm sm:text-base font-mono font-black text-zinc-100 flex items-baseline gap-1 tracking-tight">
            <span>{metrics.totalExposure}%</span>
            <span className="text-[10px] font-normal text-zinc-600 tracking-widest">/CAP</span>
          </div>
        </div>

        {/* Today's P&L */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">
            TDY_PNL
          </span>
          <div className="text-sm sm:text-base font-mono font-black tracking-tight">
            <PnLDisplay
              amount={metrics.todayPnl}
              percentage={metrics.todayPnlPercent}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
