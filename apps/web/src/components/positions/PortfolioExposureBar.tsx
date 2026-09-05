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
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Portfolio Exposure & Allocation
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-cyan-400 border border-border-color">
            CAPITAL DEPLOYED
          </span>
        </div>
        <div className="text-xs font-mono text-gray-300">
          <span className="font-bold text-gray-100">{totalExposurePercent}%</span>
          <span className="text-gray-500"> / 100% max</span>
        </div>
      </div>

      {/* Segmented Exposure Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-bg-950 rounded overflow-hidden flex border border-border-color">
          {/* BTC Portion */}
          <div
            style={{ width: `${allocations[0]?.percentageOfPortfolio || 0}%` }}
            className="h-full bg-cyan-400 transition-all"
            title={`BTC: ${allocations[0]?.percentageOfPortfolio}%`}
          />
          {/* ETH Portion */}
          <div
            style={{ width: `${allocations[1]?.percentageOfPortfolio || 0}%` }}
            className="h-full bg-blue-500 transition-all"
            title={`ETH: ${allocations[1]?.percentageOfPortfolio}%`}
          />
          {/* Available Cash Buffer */}
          <div
            style={{ width: `${availablePercent}%` }}
            className="h-full bg-surface-2/40 transition-all"
            title={`Available Cash: ${availablePercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono gap-2 pt-0.5">
          <div className="flex items-center gap-3">
            {allocations.map((alloc) => (
              <div key={alloc.symbol} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: alloc.color }}
                />
                <span className="text-gray-300">{alloc.symbol}:</span>
                <span className="font-bold text-gray-100">
                  {alloc.percentageOfInvested}%
                </span>
                <span className="text-gray-500 text-[10px]">
                  (${alloc.investedValue.toLocaleString()})
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-sm bg-surface-2 border border-border-color" />
            <span>Available Cash:</span>
            <span className="font-bold text-gray-200">{availablePercent}%</span>
          </div>
        </div>
      </div>
    </Surface>
  );
}
