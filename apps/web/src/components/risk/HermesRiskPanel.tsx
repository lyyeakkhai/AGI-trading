"use client";

import React from "react";
import { Sparkles, Shield, Eye } from "lucide-react";

interface HermesRiskPanelProps {
  portfolioRisk: number;
  availableRisk: number;
  warningCount?: number;
}

export function HermesRiskPanel({
  portfolioRisk,
  availableRisk,
  warningCount = 0,
}: HermesRiskPanelProps) {
  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-cyan-500/25 bg-gradient-to-br from-surface-1 to-cyan-950/10 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Hermes AI Risk Awareness
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Agent boundary protocol & real-time risk envelope telemetry
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Eye className="w-3 h-3 text-cyan-400" />
          OBSERVER ONLY
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <p className="text-text-primary leading-relaxed">
          &ldquo;Current portfolio risk remains well within configured limits ({portfolioRisk.toFixed(1)}% vs 5.0% ceiling). Headroom of {availableRisk.toFixed(1)}% permits candidate sizing up to standard 1.0% trade allocations.&rdquo;
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Observed Risk</span>
            <span className="text-sm font-bold text-emerald-400">{portfolioRisk.toFixed(1)}%</span>
          </div>
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Risk Headroom</span>
            <span className="text-sm font-bold text-cyan-400">{availableRisk.toFixed(1)}%</span>
          </div>
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Active Warnings</span>
            <span className="text-sm font-bold text-text-primary">{warningCount}</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-surface-2/40 border border-border/30 text-[11px] text-text-muted leading-relaxed">
          <strong className="text-cyan-400">Architectural Boundary:</strong> Hermes investigates and proposes trades, but cannot bypass, mutate, or override deterministic institutional risk controls.
        </div>
      </div>
    </div>
  );
}
