"use client";

import React from "react";
import { ShieldCheck, Scale, AlertTriangle } from "lucide-react";
import { LiveProductionLimits } from "@/lib/mockLiveSafetyData";

interface LiveProductionLimitsCardProps {
  limits: LiveProductionLimits;
}

export function LiveProductionLimitsCard({ limits }: LiveProductionLimitsCardProps) {
  return (
    <div className="bg-surface border border-border-color rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-color">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-cyan-400" />
          <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            Live Risk Engine Enforcements
          </h3>
        </div>
        <span className="text-[10px] font-mono text-profit bg-profit/10 px-2 py-0.5 rounded border border-profit/30 font-semibold">
          IMMUTABLE AT EXECUTION
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Max Risk / Trade</span>
          <div className="text-sm font-bold text-profit">{limits.riskPerTradePercent}%</div>
          <span className="text-[10px] text-gray-500 block">Strict capital stop</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Portfolio Risk Limit</span>
          <div className="text-sm font-bold text-profit">{limits.maxPortfolioRiskPercent}%</div>
          <span className="text-[10px] text-gray-500 block">Cumulative open stop ceiling</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Daily Circuit Breaker</span>
          <div className="text-sm font-bold text-warning">{limits.maxDailyLossPercent}%</div>
          <span className="text-[10px] text-gray-500 block">Hard automatic trading halt</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Max Concurrent Slots</span>
          <div className="text-sm font-bold text-gray-100">{limits.maxOpenPositions} Slots</div>
          <span className="text-[10px] text-gray-500 block">Live concurrent positions</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Single Asset Exposure</span>
          <div className="text-sm font-bold text-gray-100">{limits.maxAssetExposurePercent}%</div>
          <span className="text-[10px] text-gray-500 block">Max ticker concentration</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Min Risk / Reward</span>
          <div className="text-sm font-bold text-cyan-300">{limits.minRiskRewardRatio}R</div>
          <span className="text-[10px] text-gray-500 block">Floor proposal threshold</span>
        </div>
      </div>

      <div className="p-3 rounded bg-surface-2 border border-border-color/60 text-[11px] text-gray-400 flex items-start gap-2">
        <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
        <span>
          Parameters match active Risk Configuration. Under no circumstances can Hermes or execution
          gateways alter limits at runtime without owner re-authorization.
        </span>
      </div>
    </div>
  );
}
