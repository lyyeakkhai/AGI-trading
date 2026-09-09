"use client";

import React from "react";
import { ExposureOverviewData } from "@/lib/mockRiskData";
import { Network, ShieldCheck } from "lucide-react";

interface ConcentrationRiskCardProps {
  exposure: ExposureOverviewData;
}

export function ConcentrationRiskCard({ exposure }: ConcentrationRiskCardProps) {
  const isHealthy = exposure.combinedCorrelatedPercent < exposure.maxCombinedCorrelatedPercent;

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Correlated Concentration Limits
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Crypto asset co-movement risk boundary
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-lg text-xs font-sans tracking-tight font-bold ${
            isHealthy
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {exposure.correlationStatus}
        </span>
      </div>

      {/* Asset Correlation Bar */}
      <div className="space-y-3 font-sans tracking-tight text-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-zinc-400 block">BTC Exposure</span>
            <span className="text-sm font-bold text-gray-900 dark:text-zinc-50">25.6%</span>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-zinc-400 block">ETH Exposure</span>
            <span className="text-sm font-bold text-gray-900 dark:text-zinc-50">13.0%</span>
          </div>
          <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
            <span className="text-xs text-cyan-400 block">Combined Total</span>
            <span className="text-sm font-bold text-emerald-400">
              {exposure.combinedCorrelatedPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
            <span>Combined Crypto Exposure: {exposure.combinedCorrelatedPercent.toFixed(1)}%</span>
            <span>Limit: {exposure.maxCombinedCorrelatedPercent.toFixed(1)}% max</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(exposure.combinedCorrelatedPercent / exposure.maxCombinedCorrelatedPercent) * 100}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
          Concentration limits prevent single-asset and correlated asset cascading drawdowns during macro market liqudity shocks.
        </p>
      </div>
    </div>
  );
}
