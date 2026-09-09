"use client";

import React from "react";
import { RiskLimitConfig } from "@/lib/mockRiskData";
import { Sliders, Shield } from "lucide-react";

interface RiskLimitsCardProps {
  limits: RiskLimitConfig;
}

export function RiskLimitsCard({ limits }: RiskLimitsCardProps) {
  const limitItems = [
    { label: "Max Risk / Trade", value: `${limits.maxRiskPerTrade.toFixed(1)}%`, note: "Hard per-order stop loss ceiling" },
    { label: "Max Portfolio Risk", value: `${limits.maxPortfolioRisk.toFixed(1)}%`, note: "Simultaneous open risk envelope" },
    { label: "Max Daily Loss", value: `${limits.maxDailyLoss.toFixed(1)}%`, note: "24-hour circuit breaker lock" },
    { label: "Max Open Positions", value: `${limits.maxOpenPositions}`, note: "Concurrent active executions" },
    { label: "Max Single Asset", value: `${limits.maxAssetExposure.toFixed(0)}%`, note: "Per-symbol capital cap" },
    { label: "Max Correlated Exposure", value: `${limits.maxCorrelatedExposure.toFixed(0)}%`, note: "Crypto basket concentration limit" },
    { label: "Minimum Risk/Reward", value: `${limits.minRiskReward.toFixed(1)}R`, note: "Trade proposal hurdle rate" },
    { label: "Live Trading Execution", value: limits.liveTradingEnabled ? "ACTIVE" : "OFF", note: "Protected paper sandbox mode" },
  ];

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Configured Deterministic Limits
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Immutable institutional risk guardrails enforced before any trade acceptance
            </p>
          </div>
        </div>
        <span className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
          Read-Only Deterministic Layer
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-sans tracking-tight text-xs">
        {limitItems.map((item) => (
          <div
            key={item.label}
            className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between"
          >
            <span className="text-xs text-gray-500 dark:text-zinc-400">{item.label}</span>
            <span className="text-base font-bold text-gray-900 dark:text-zinc-50 mt-1">
              {item.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-400 mt-1 truncate" title={item.note}>
              {item.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
