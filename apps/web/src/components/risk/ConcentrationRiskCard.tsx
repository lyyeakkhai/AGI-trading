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
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Correlated Concentration Limits
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Crypto asset co-movement risk boundary
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
            isHealthy
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {exposure.correlationStatus}
        </span>
      </div>

      {/* Asset Correlation Bar */}
      <div className="space-y-3 font-mono text-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">BTC Exposure</span>
            <span className="text-sm font-bold text-text-primary">25.6%</span>
          </div>
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">ETH Exposure</span>
            <span className="text-sm font-bold text-text-primary">13.0%</span>
          </div>
          <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/30">
            <span className="text-[10px] text-cyan-400 block">Combined Total</span>
            <span className="text-sm font-bold text-emerald-400">
              {exposure.combinedCorrelatedPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Combined Crypto Exposure: {exposure.combinedCorrelatedPercent.toFixed(1)}%</span>
            <span>Limit: {exposure.maxCombinedCorrelatedPercent.toFixed(1)}% max</span>
          </div>
          <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(exposure.combinedCorrelatedPercent / exposure.maxCombinedCorrelatedPercent) * 100}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed">
          Concentration limits prevent single-asset and correlated asset cascading drawdowns during macro market liqudity shocks.
        </p>
      </div>
    </div>
  );
}
