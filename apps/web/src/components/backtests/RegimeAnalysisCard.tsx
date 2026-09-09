"use client";

import React from "react";
import { RegimeResult } from "@/lib/mockBacktestsData";
import { Compass, TrendingUp, Shuffle, AlertTriangle, Wind } from "lucide-react";

interface RegimeAnalysisCardProps {
  regimes: RegimeResult[];
}

export function RegimeAnalysisCard({ regimes }: RegimeAnalysisCardProps) {
  const getRegimeIcon = (name: string) => {
    if (name.includes("Trending")) return <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />;
    if (name.includes("Ranging")) return <Shuffle className="w-3.5 h-3.5 text-amber-400" />;
    if (name.includes("High Volatility")) return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    return <Wind className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-sans font-semibold uppercase tracking-wide text-gray-900 dark:text-zinc-50">
            Market Regime Breakdown
          </h3>
        </div>
        <span className="text-[11px] font-sans text-gray-500 dark:text-zinc-400">
          Robustness stress-testing
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {regimes.map((r) => {
          const isProfitable = r.returnPct >= 0;
          return (
            <div
              key={r.regime}
              className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-white/5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  {getRegimeIcon(r.regime)}
                  <span className="text-xs font-sans font-medium text-gray-900 dark:text-zinc-50">
                    {r.regime}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between font-sans">
                <span className={`text-base font-bold ${isProfitable ? "text-emerald-400" : "text-red-400"}`}>
                  {isProfitable ? `+${r.returnPct.toFixed(1)}%` : `${r.returnPct.toFixed(1)}%`}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  PF <strong className="text-gray-900 dark:text-zinc-50">{r.profitFactor.toFixed(2)}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-sans text-gray-500 dark:text-zinc-400 mt-2 pt-2 border-t border-gray-200 dark:border-white/5">
                <span>{r.tradeCount} trades</span>
                <span>{r.winRate.toFixed(1)}% win</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
