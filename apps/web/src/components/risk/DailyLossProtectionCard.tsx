"use client";

import React from "react";
import { RiskOverviewData } from "@/lib/mockRiskData";
import { ShieldAlert, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DailyLossProtectionCardProps {
  overview: RiskOverviewData;
}

export function DailyLossProtectionCard({ overview }: DailyLossProtectionCardProps) {
  const isHealthy = overview.dailyLossUtilization < 70;
  const isWarning = overview.dailyLossUtilization >= 70 && overview.dailyLossUtilization < 100;

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Daily Loss Circuit Breaker
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Rolling 24-hour drawdown threshold
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-lg text-xs font-sans tracking-tight font-bold ${
            isHealthy
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : isWarning
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {isHealthy ? "HEALTHY" : isWarning ? "WARNING" : "TRIPPED"}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 text-xs font-sans tracking-tight">
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Today&apos;s Loss</span>
          <span className="text-base font-bold text-gray-900 dark:text-zinc-50">
            -${overview.dailyLoss}
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            {overview.dailyLossPercent.toFixed(1)}% of equity
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Daily Limit</span>
          <span className="text-base font-bold text-red-400">
            -${overview.dailyLossLimit}
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            {overview.dailyLossLimitPercent.toFixed(1)}% max floor
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Utilization</span>
          <span className={`text-base font-bold ${isHealthy ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-red-400"}`}>
            {overview.dailyLossUtilization}%
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            ${overview.dailyLossLimit - overview.dailyLoss} buffer
          </span>
        </div>
      </div>

      {/* Progress Bar & Explanation */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${overview.dailyLossUtilization}%` }}
            className={`transition-all duration-300 ${
              isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500"
            }`}
          />
        </div>
        <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
          Rule: Trading is automatically restricted if the configured daily loss threshold (-3.0%) is reached.
        </p>
      </div>
    </div>
  );
}
