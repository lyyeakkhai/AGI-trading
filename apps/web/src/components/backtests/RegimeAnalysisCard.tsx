"use client";

import React from "react";
import { RegimeResult } from "@/lib/mockBacktestsData";
import { Compass, TrendingUp, Shuffle, AlertTriangle, Wind } from "lucide-react";

interface RegimeAnalysisCardProps {
  regimes: RegimeResult[];
}

export function RegimeAnalysisCard({ regimes }: RegimeAnalysisCardProps) {
  const getRegimeIcon = (name: string) => {
    if (name.includes("Trending")) return <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />;
    if (name.includes("Ranging")) return <Shuffle className="w-3.5 h-3.5 text-amber-400" />;
    if (name.includes("High Volatility")) return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    return <Wind className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
            Market Regime Breakdown
          </h3>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          Robustness stress-testing
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {regimes.map((r) => {
          const isProfitable = r.returnPct >= 0;
          return (
            <div
              key={r.regime}
              className="p-3 rounded bg-surface-2/60 border border-border/50 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  {getRegimeIcon(r.regime)}
                  <span className="text-xs font-mono font-medium text-text-primary">
                    {r.regime}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between font-mono">
                <span className={`text-base font-bold ${isProfitable ? "text-emerald-400" : "text-red-400"}`}>
                  {isProfitable ? `+${r.returnPct.toFixed(1)}%` : `${r.returnPct.toFixed(1)}%`}
                </span>
                <span className="text-xs text-text-muted">
                  PF <strong className="text-text-primary">{r.profitFactor.toFixed(2)}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mt-2 pt-2 border-t border-border/30">
                <span>{r.tradeCount} trades</span>
                <span>{r.winRate.toFixed(1)}% win</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
