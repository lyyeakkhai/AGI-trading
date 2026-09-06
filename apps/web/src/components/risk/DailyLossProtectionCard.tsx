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
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Daily Loss Circuit Breaker
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Rolling 24-hour drawdown threshold
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
          {isHealthy ? "HEALTHY" : isWarning ? "WARNING" : "TRIPPED"}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 text-xs font-mono">
        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Today&apos;s Loss</span>
          <span className="text-base font-bold text-text-primary">
            -${overview.dailyLoss}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            {overview.dailyLossPercent.toFixed(1)}% of equity
          </span>
        </div>

        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Daily Limit</span>
          <span className="text-base font-bold text-red-400">
            -${overview.dailyLossLimit}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            {overview.dailyLossLimitPercent.toFixed(1)}% max floor
          </span>
        </div>

        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Utilization</span>
          <span className={`text-base font-bold ${isHealthy ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-red-400"}`}>
            {overview.dailyLossUtilization}%
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            ${overview.dailyLossLimit - overview.dailyLoss} buffer
          </span>
        </div>
      </div>

      {/* Progress Bar & Explanation */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${overview.dailyLossUtilization}%` }}
            className={`transition-all duration-300 ${
              isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500"
            }`}
          />
        </div>
        <p className="text-[11px] font-mono text-text-muted">
          Rule: Trading is automatically restricted if the configured daily loss threshold (-3.0%) is reached.
        </p>
      </div>
    </div>
  );
}
