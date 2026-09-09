"use client";

import React from "react";
import { RiskOverviewData } from "@/lib/mockRiskData";
import { ShieldCheck, PieChart, Percent, AlertCircle } from "lucide-react";

interface RiskBudgetCardProps {
  overview: RiskOverviewData;
}

export function RiskBudgetCard({ overview }: RiskBudgetCardProps) {
  const utilizationPct = (overview.portfolioRisk / overview.maxPortfolioRisk) * 100;
  const isHealthy = utilizationPct < 70;
  const isWarning = utilizationPct >= 70 && utilizationPct < 100;

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <PieChart className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Portfolio Risk Budget
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Aggregate capital at risk across all concurrent stop levels
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
          {isHealthy ? "HEALTHY" : isWarning ? "WARNING" : "CRITICAL"}
        </span>
      </div>

      {/* Numerical Metrics */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 text-xs font-sans tracking-tight">
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Current Risk</span>
          <span className="text-base font-bold text-emerald-400">
            {overview.portfolioRisk.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            ${((overview.portfolioEquity * overview.portfolioRisk) / 100).toFixed(0)} exposed
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Available Risk</span>
          <span className="text-base font-bold text-cyan-400">
            {overview.availableRisk.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            ${((overview.portfolioEquity * overview.availableRisk) / 100).toFixed(0)} headroom
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Maximum Limit</span>
          <span className="text-base font-bold text-gray-900 dark:text-zinc-50">
            {overview.maxPortfolioRisk.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">Hard ceiling</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
          <span>{overview.portfolioRisk.toFixed(1)}% of {overview.maxPortfolioRisk.toFixed(1)}% Allocated</span>
          <span>{utilizationPct.toFixed(0)}% budget consumed</span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${utilizationPct}%` }}
            className={`transition-all duration-300 ${
              isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
