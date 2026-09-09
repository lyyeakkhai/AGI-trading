"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { AssetAllocationItem } from "@/lib/mockPositionsData";

interface PortfolioExposureBarProps {
 totalExposurePercent: number;
 availablePercent: number;
 allocations: AssetAllocationItem[];
 className?: string;
}

export function PortfolioExposureBar({
 totalExposurePercent,
 availablePercent,
 allocations,
 className = "",
}: PortfolioExposureBarProps) {
 return (
  <div className={`bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-4 flex flex-col justify-center h-full space-y-4 ${className}`}>
   {/* Header */}
   <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-2">
    <div className="flex items-center gap-3">
     <span className="text-xs font-sans font-semibold text-gray-900 dark:text-zinc-50 tracking-normal">
      PRTF_ExposureOSURE
     </span>
     <span className="text-xs font-sans font-bold px-2 py-0.5 bg-gray-100 dark:bg-zinc-800/50 rounded-lg text-indigo-600 dark:text-indigo-400 border border-gray-300 dark:border-white/10 tracking-normal">
      CAP_DEPLOYED
     </span>
    </div>
    <div className="text-xs font-sans font-semibold tracking-tight">
     <span className="text-gray-900 dark:text-zinc-50">{totalExposurePercent}%</span>
     <span className="text-gray-400 dark:text-zinc-500"> / 100%</span>
    </div>
   </div>

   {/* Segmented Exposure Progress Bar */}
   <div className="space-y-3">
    <div className="h-4 w-full bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 flex">
     {/* BTC Portion */}
     <div
      style={{ width: `${allocations[0]?.percentageOfPortfolio || 0}%` }}
      className="h-full bg-zinc-300 border-r border-black transition-all"
      title={`BTC: ${allocations[0]?.percentageOfPortfolio}%`}
     />
     {/* ETH Portion */}
     <div
      style={{ width: `${allocations[1]?.percentageOfPortfolio || 0}%` }}
      className="h-full bg-zinc-500 border-r border-black transition-all"
      title={`ETH: ${allocations[1]?.percentageOfPortfolio}%`}
     />
     {/* Available Cash Buffer */}
     <div
      style={{ width: `${availablePercent}%` }}
      className="h-full bg-gray-100 dark:bg-zinc-800/50 rounded-lg transition-all"
      title={`Available Cash: ${availablePercent}%`}
     />
    </div>

    {/* Legend */}
    <div className="flex flex-wrap items-center justify-between text-xs font-sans font-bold tracking-normal gap-4">
     <div className="flex items-center gap-4">
      {allocations.map((alloc, i) => (
       <div key={alloc.symbol} className="flex items-center gap-2">
        <span
         className="w-2.5 h-2.5"
         style={{ backgroundColor: i === 0 ? "#D4D4D8" : "#71717A" }}
        />
        <span className="text-gray-500 dark:text-zinc-400">{alloc.symbol}</span>
        <span className="text-gray-900 dark:text-zinc-50">
         {alloc.percentageOfInvested}%
        </span>
       </div>
      ))}
     </div>

     <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
      <span className="w-2.5 h-2.5 bg-gray-100 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-white/5" />
      <span>AVL_CASH</span>
      <span className="text-gray-800 dark:text-zinc-200">{availablePercent}%</span>
     </div>
    </div>
   </div>
  </div>
 );
}
