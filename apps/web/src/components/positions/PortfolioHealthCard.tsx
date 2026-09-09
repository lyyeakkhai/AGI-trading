"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { PortfolioHealthMetrics } from "@/lib/mockPositionsData";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface PortfolioHealthCardProps {
 health: PortfolioHealthMetrics;
 className?: string;
}

export function PortfolioHealthCard({
 health,
 className = "",
}: PortfolioHealthCardProps) {
 const isHealthy = health.status === "NORMAL";

 return (
  <div className={`bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-4 h-full flex flex-col justify-center space-y-4 ${className}`}>
   {/* Header */}
   <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-2">
    <div className="flex items-center gap-2">
     <span className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
      SYS_HEALTH
     </span>
    </div>
    <div className={`px-2 py-0.5 text-xs font-sans font-bold tracking-normal border ${
     isHealthy ? "bg-green-950 border-green-900 text-green-500" : "bg-red-950 border-red-900 text-red-500"
    }`}>
     {health.status}
    </div>
   </div>

   {/* Grid of 4 Health Dimensions */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
    {/* Exposure vs Limit */}
    <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between">
     <span className="text-xs font-sans font-bold text-gray-500 dark:text-zinc-400 tracking-normal mb-2">
      ExposureOSURE
     </span>
     <div>
      <div className="flex items-baseline justify-between mb-1">
       <span className="text-sm font-sans font-semibold text-gray-900 dark:text-zinc-50 tracking-tight">
        {health.exposure.value}%
       </span>
       <span className="text-xs font-sans font-bold text-gray-400 dark:text-zinc-500 tracking-normal">
        MAX_{health.exposure.limit}%
       </span>
      </div>
      <div className="text-xs font-sans font-bold text-green-500 tracking-normal">
       {health.exposure.status}
      </div>
     </div>
    </div>

    {/* Daily PnL vs Limit */}
    <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between">
     <span className="text-xs font-sans font-bold text-gray-500 dark:text-zinc-400 tracking-normal mb-2">
      DLY_PNL
     </span>
     <div>
      <div className="flex items-baseline justify-between mb-1">
       <span className="text-sm font-sans font-semibold text-green-500 tracking-tight">
        +{health.dailyPnl.value}%
       </span>
       <span className="text-xs font-sans font-bold text-gray-400 dark:text-zinc-500 tracking-normal">
        FLR_{health.dailyPnl.limit}%
       </span>
      </div>
      <div className="text-xs font-sans font-bold text-green-500 tracking-normal">
       {health.dailyPnl.status}
      </div>
     </div>
    </div>

    {/* Drawdown */}
    <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between">
     <span className="text-xs font-sans font-bold text-gray-500 dark:text-zinc-400 tracking-normal mb-2">
      MAX_DD
     </span>
     <div>
      <div className="flex items-baseline justify-between mb-1">
       <span className="text-sm font-sans font-semibold text-gray-900 dark:text-zinc-50 tracking-tight">
        {health.drawdown.value}%
       </span>
       <span className="text-xs font-sans font-bold text-gray-400 dark:text-zinc-500 tracking-normal">
        CAP_{health.drawdown.limit}%
       </span>
      </div>
      <div className="text-xs font-sans font-bold text-green-500 tracking-normal">
       {health.drawdown.status}
      </div>
     </div>
    </div>

    {/* Risk Utilization */}
    <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col justify-between">
     <span className="text-xs font-sans font-bold text-gray-500 dark:text-zinc-400 tracking-normal mb-2">
      RISK_UTIL
     </span>
     <div>
      <div className="flex items-baseline justify-between mb-1">
       <span className="text-sm font-sans font-semibold text-indigo-600 dark:text-indigo-400 tracking-tight">
        {health.riskUtilization}%
       </span>
       <span className="text-xs font-sans font-bold text-gray-400 dark:text-zinc-500 tracking-normal">
        {health.openPositionsCount} Positions
       </span>
      </div>
      <div className="text-xs font-sans font-bold text-gray-500 dark:text-zinc-400 tracking-normal">
       Nominal
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
