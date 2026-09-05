"use client";

import React from "react";
import { ExposureOverviewData } from "@/lib/mockRiskData";
import { Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PortfolioExposureCardProps {
  exposure: ExposureOverviewData;
  portfolioEquity: number;
}

export function PortfolioExposureCard({
  exposure,
  portfolioEquity,
}: PortfolioExposureCardProps) {
  const totalExposure = exposure.longExposure + exposure.shortExposure;
  const exposurePct = (totalExposure / portfolioEquity) * 100;

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Capital Exposure & Direction
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Active open notional vs liquid cash reserve
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-bold">
          ${totalExposure.toLocaleString()} ({exposurePct.toFixed(1)}%)
        </span>
      </div>

      {/* Directional Split */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs font-mono">
        <div className="p-2 rounded bg-surface-2/60 border border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Long Exposure</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-text-primary">${exposure.longExposure.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400 block">{exposure.longPercent}%</span>
          </div>
        </div>

        <div className="p-2 rounded bg-surface-2/60 border border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-text-muted">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Short Exposure</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-text-primary">${exposure.shortExposure.toLocaleString()}</span>
            <span className="text-[10px] text-text-muted block">{exposure.shortPercent}%</span>
          </div>
        </div>
      </div>

      {/* Asset Exposure Distribution */}
      <div className="space-y-2 text-xs font-mono">
        {exposure.assets.map((a) => (
          <div key={a.symbol} className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-text-primary font-medium">{a.symbol}</span>
              <div className="flex items-center gap-2 text-text-muted">
                <span>${a.exposureAmount.toLocaleString()} ({a.exposurePercent.toFixed(1)}% notional)</span>
                <span className="text-cyan-400 font-bold">{a.portfolioPercent.toFixed(1)}% eq</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${(a.portfolioPercent / a.maxAllowedPercent) * 100}%` }}
                className="bg-cyan-500 h-full rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
