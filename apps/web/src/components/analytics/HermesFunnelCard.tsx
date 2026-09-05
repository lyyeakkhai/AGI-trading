"use client";

import React from "react";
import { HermesFunnelStage } from "@/lib/mockAnalyticsData";
import { Filter, ArrowRight } from "lucide-react";

interface HermesFunnelCardProps {
  stages: HermesFunnelStage[];
}

export function HermesFunnelCard({ stages }: HermesFunnelCardProps) {
  const maxCount = stages[0]?.count || 1;

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full font-mono text-xs">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Trading Intelligence Funnel
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Selectivity ratio from broad opportunity scans to executed profitable trades
            </p>
          </div>
        </div>
        <span className="text-[11px] text-cyan-400 font-bold">
          428 → 41 Alpha Filter
        </span>
      </div>

      <div className="space-y-2">
        {stages.map((st, i) => {
          const widthPct = (st.count / maxCount) * 100;
          return (
            <div key={st.stage} className="space-y-0.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-text-primary font-medium">{st.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{st.count}</span>
                  <span className="text-[10px] text-text-muted">({st.conversionPct.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.max(widthPct, 4)}%` }}
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
        High selectivity: only 15.0% of monitored events convert to trade proposals, protecting capital from low-expectancy chop.
      </p>
    </div>
  );
}
