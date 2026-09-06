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
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <PieChart className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Portfolio Risk Budget
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Aggregate capital at risk across all concurrent stop levels
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
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
      <div className="grid grid-cols-3 gap-2.5 mb-3 text-xs font-mono">
        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Current Risk</span>
          <span className="text-base font-bold text-emerald-400">
            {overview.portfolioRisk.toFixed(1)}%
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            ${((overview.portfolioEquity * overview.portfolioRisk) / 100).toFixed(0)} exposed
          </span>
        </div>

        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Available Risk</span>
          <span className="text-base font-bold text-cyan-400">
            {overview.availableRisk.toFixed(1)}%
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            ${((overview.portfolioEquity * overview.availableRisk) / 100).toFixed(0)} headroom
          </span>
        </div>

        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Maximum Limit</span>
          <span className="text-base font-bold text-text-primary">
            {overview.maxPortfolioRisk.toFixed(1)}%
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">Hard ceiling</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-text-muted">
          <span>{overview.portfolioRisk.toFixed(1)}% of {overview.maxPortfolioRisk.toFixed(1)}% Allocated</span>
          <span>{utilizationPct.toFixed(0)}% budget consumed</span>
        </div>
        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden flex">
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
