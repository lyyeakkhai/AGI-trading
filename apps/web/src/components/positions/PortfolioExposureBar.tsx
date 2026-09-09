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
    <div className={`bg-black border border-zinc-800 p-4 flex flex-col justify-center h-full space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-black uppercase text-zinc-100 tracking-widest">
            PRTF_EXPOSURE
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-zinc-900 text-cyan-500 border border-zinc-700 tracking-widest">
            CAP_DEPLOYED
          </span>
        </div>
        <div className="text-xs font-mono font-black tracking-tight">
          <span className="text-zinc-100">{totalExposurePercent}%</span>
          <span className="text-zinc-600"> / 100%</span>
        </div>
      </div>

      {/* Segmented Exposure Progress Bar */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-zinc-950 border border-zinc-800 flex">
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
            className="h-full bg-zinc-900 transition-all"
            title={`Available Cash: ${availablePercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[10px] font-mono font-bold tracking-widest uppercase gap-4">
          <div className="flex items-center gap-4">
            {allocations.map((alloc, i) => (
              <div key={alloc.symbol} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5"
                  style={{ backgroundColor: i === 0 ? "#D4D4D8" : "#71717A" }}
                />
                <span className="text-zinc-500">{alloc.symbol}</span>
                <span className="text-zinc-100">
                  {alloc.percentageOfInvested}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-zinc-500">
            <span className="w-2.5 h-2.5 bg-zinc-900 border border-zinc-800" />
            <span>AVL_CASH</span>
            <span className="text-zinc-300">{availablePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
