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
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Configured Deterministic Limits
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Immutable institutional risk guardrails enforced before any trade acceptance
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          Read-Only Deterministic Layer
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
        {limitItems.map((item) => (
          <div
            key={item.label}
            className="p-2.5 rounded bg-surface-2/60 border border-border/40 flex flex-col justify-between"
          >
            <span className="text-[10px] text-text-muted">{item.label}</span>
            <span className="text-base font-bold text-text-primary mt-1">
              {item.value}
            </span>
            <span className="text-[10px] text-text-muted mt-1 truncate" title={item.note}>
              {item.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
