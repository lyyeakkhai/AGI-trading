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
   <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b-2 border-gray-200 dark:border-white/5">
    <div>
     <div className="flex items-center gap-3">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-zinc-50 font-sans">
       Positions
      </h1>
      <span className="text-xs font-sans px-2 py-0.5 bg-gray-100 dark:bg-zinc-800/50 rounded-lg border border-gray-300 dark:border-white/10 text-indigo-600 dark:text-indigo-400 font-bold tracking-normal">
       {openCount} ACTIVE
      </span>
     </div>
     <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-sans tracking-wide">
      Real-time portfolio exposure & metrics.
     </p>
    </div>

    {/* Right Status Indicators */}
    <div className="flex items-center gap-2 self-start sm:self-auto">
     <div className="px-2 py-1 bg-gray-100 dark:bg-zinc-800/50 rounded-lg border border-gray-300 dark:border-white/10 text-xs font-sans font-bold text-gray-600 dark:text-zinc-300 tracking-normal">
      Paper Mode
     </div>
     <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-[#0a0a0a] border border-cyan-900/50 text-[11px] font-sans text-indigo-600 dark:text-indigo-400 shadow-sm">
      <span className="w-2 h-2 bg-cyan-400 animate-pulse" />
      <span className="font-bold tracking-normal ">System Active</span>
     </div>
    </div>
   </div>

   {/* 2. Compact Financial Metrics Strip */}
   <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
    {/* Portfolio Value */}
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 p-3 space-y-1">
     <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-bold tracking-normal block">
      Portfolio Value
     </span>
     <div className="text-sm sm:text-base font-sans font-semibold text-gray-900 dark:text-zinc-50 tracking-tight">
      ${metrics.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
     </div>
    </div>

    {/* Available Capital */}
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 p-3 space-y-1">
     <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-bold tracking-normal block">
      Available Capital
     </span>
     <div className="text-sm sm:text-base font-sans font-semibold text-gray-800 dark:text-zinc-200 tracking-tight">
      ${metrics.availableCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
     </div>
    </div>

    {/* Invested Capital */}
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 p-3 space-y-1">
     <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-bold tracking-normal block">
      Invested Capital
     </span>
     <div className="text-sm sm:text-base font-sans font-semibold text-indigo-600 dark:text-indigo-400 tracking-tight">
      ${metrics.investedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
     </div>
    </div>

    {/* Unrealized P&L */}
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 p-3 space-y-1">
     <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-bold tracking-normal block">
      Unrealized P&L
     </span>
     <div className="text-sm sm:text-base font-sans font-semibold tracking-tight">
      <PnLDisplay
       amount={metrics.unrealizedPnl}
       percentage={metrics.unrealizedPnlPercent}
       size="md"
      />
     </div>
    </div>

    {/* Realized P&L */}
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 p-3 space-y-1">
     <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-bold tracking-normal block">
      Realized P&L
     </span>
     <div className="text-sm sm:text-base font-sans font-semibold tracking-tight">
      <PnLDisplay
       amount={metrics.realizedPnl}
       percentage={metrics.realizedPnlPercent}
       size="md"
      />
     </div>
    </div>

    {/* Total Exposure */}
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 p-3 space-y-1">
     <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-bold tracking-normal block">
      Total Exposure
     </span>
     <div className="text-sm sm:text-base font-sans font-semibold text-gray-900 dark:text-zinc-50 flex items-baseline gap-1 tracking-tight">
      <span>{metrics.totalExposure}%</span>
      <span className="text-xs font-normal text-gray-400 dark:text-zinc-500 tracking-normal">% of Capital</span>
     </div>
    </div>

    {/* Today's P&L */}
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 p-3 space-y-1">
     <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-bold tracking-normal block">
      Today's P&L
     </span>
     <div className="text-sm sm:text-base font-sans font-semibold tracking-tight">
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
