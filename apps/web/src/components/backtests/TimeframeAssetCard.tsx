"use client";

import React from "react";
import { TimeframeResult, AssetResult } from "@/lib/mockBacktestsData";
import { Clock, Coins } from "lucide-react";

interface TimeframeAssetCardProps {
  timeframes: TimeframeResult[];
  assets: AssetResult[];
}

export function TimeframeAssetCard({ timeframes, assets }: TimeframeAssetCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Timeframe Analysis */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wide text-gray-900 dark:text-zinc-50">
              Performance by Timeframe
            </h3>
          </div>
          <span className="text-[11px] font-sans text-gray-500 dark:text-zinc-400">Resolution sensitivity</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
          {timeframes.map((tf) => (
            <div
              key={tf.timeframe}
              className={`p-2.5 rounded-xl border ${
                tf.tested
                  ? "bg-gray-50 dark:bg-zinc-800/50 border-gray-200/50 dark:border-white/5"
                  : "bg-gray-50 dark:bg-zinc-800/50 border-dashed border-gray-200 dark:border-white/5 opacity-60"
              }`}
            >
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">{tf.timeframe}</span>
              {tf.tested ? (
                <>
                  <span className={`text-sm font-bold block mt-0.5 ${tf.returnPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {tf.returnPct >= 0 ? `+${tf.returnPct.toFixed(1)}%` : `${tf.returnPct.toFixed(1)}%`}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                    PF {tf.profitFactor.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 block mt-1">Not Tested</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Asset Universe Analysis */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wide text-gray-900 dark:text-zinc-50">
              Performance by Market Asset
            </h3>
          </div>
          <span className="text-[11px] font-sans text-gray-500 dark:text-zinc-400">Asset cross-validation</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
          {assets.map((asset) => (
            <div
              key={asset.asset}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-white/5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-zinc-50">{asset.asset}</span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400">{asset.trades} trades</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-base font-bold ${asset.returnPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {asset.returnPct >= 0 ? `+${asset.returnPct.toFixed(1)}%` : `${asset.returnPct.toFixed(1)}%`}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  PF <strong className="text-gray-900 dark:text-zinc-50">{asset.profitFactor.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
