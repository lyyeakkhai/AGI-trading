"use client";

import React from "react";
import { AnalyticsSummary } from "@/lib/mockAnalyticsData";
import { Sliders, DollarSign, ArrowRight } from "lucide-react";

interface ExecutionQualityCardProps {
  summary: AnalyticsSummary;
}

export function ExecutionQualityCard({ summary }: ExecutionQualityCardProps) {
  const frictionTotal = summary.fees + summary.slippage;
  const frictionPercent = ((frictionTotal / summary.grossPnl) * 100).toFixed(1);

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full font-mono text-xs">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Execution Quality & Friction Drag
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Pre-fee theoretical gross vs post-slippage realized net returns
            </p>
          </div>
        </div>
        <span className="text-[11px] text-amber-400">
          -{frictionPercent}% Gross Yield Drag
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-2">
        <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Theoretical Gross</span>
          <span className="text-base font-bold text-emerald-400">
            +${summary.grossPnl.toLocaleString()}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">Pre-friction alpha</span>
        </div>

        <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/20">
          <span className="text-[10px] text-amber-400 block">Total Drag</span>
          <span className="text-base font-bold text-amber-400">
            -${frictionTotal}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            Fees: ${summary.fees} · Slip: ${summary.slippage}
          </span>
        </div>

        <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30">
          <span className="text-[10px] text-cyan-400 block">Realized Net Yield</span>
          <span className="text-base font-bold text-emerald-400">
            +${summary.netPnl.toLocaleString()}
          </span>
          <span className="text-[10px] text-text-muted block mt-0.5">Final wallet return</span>
        </div>
      </div>
    </div>
  );
}
