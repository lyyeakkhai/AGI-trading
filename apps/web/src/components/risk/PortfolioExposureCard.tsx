"use client";

import React from "react";
import { ExposureOverviewData } from "@/lib/mockRiskData";
import { Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PortfolioExposureCardProps {
  exposure: ExposureOverviewData;
  portfolioEquity: number;
}

export function PortfolioExposureCard({
  exposure,
  portfolioEquity,
}: PortfolioExposureCardProps) {
  const totalExposure = exposure.longExposure + exposure.shortExposure;
  const exposurePct = (totalExposure / portfolioEquity) * 100;

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Capital Exposure & Direction
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Active open notional vs liquid cash reserve
            </p>
          </div>
        </div>
        <span className="text-xs font-sans tracking-tight text-cyan-400 font-bold">
          ${totalExposure.toLocaleString()} ({exposurePct.toFixed(1)}%)
        </span>
      </div>

      {/* Directional Split */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs font-sans tracking-tight">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Long Exposure</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-gray-900 dark:text-zinc-50">${exposure.longExposure.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 block">{exposure.longPercent}%</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Short Exposure</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-gray-900 dark:text-zinc-50">${exposure.shortExposure.toLocaleString()}</span>
            <span className="text-xs text-gray-500 dark:text-zinc-400 block">{exposure.shortPercent}%</span>
          </div>
        </div>
      </div>

      {/* Asset Exposure Distribution */}
      <div className="space-y-2 text-xs font-sans tracking-tight">
        {exposure.assets.map((a) => (
          <div key={a.symbol} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-900 dark:text-zinc-50 font-medium">{a.symbol}</span>
              <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                <span>${a.exposureAmount.toLocaleString()} ({a.exposurePercent.toFixed(1)}% notional)</span>
                <span className="text-cyan-400 font-bold">{a.portfolioPercent.toFixed(1)}% eq</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${(a.portfolioPercent / a.maxAllowedPercent) * 100}%` }}
                className="bg-cyan-500 h-full rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
