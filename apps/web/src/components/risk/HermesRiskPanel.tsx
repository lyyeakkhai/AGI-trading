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
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-cyan-500/25 bg-gradient-to-br from-surface-1 to-cyan-950/10 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-200 dark:border-white/5/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Hermes AI Risk Awareness
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Agent boundary protocol & real-time risk envelope telemetry
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-sans tracking-tight font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Eye className="w-3 h-3 text-cyan-400" />
          Observer Only
        </span>
      </div>

      <div className="space-y-3 font-sans tracking-tight text-xs">
        <p className="text-gray-900 dark:text-zinc-50 leading-relaxed">
          &ldquo;Current portfolio risk remains well within configured limits ({portfolioRisk.toFixed(1)}% vs 5.0% ceiling). Headroom of {availableRisk.toFixed(1)}% permits candidate sizing up to standard 1.0% trade allocations.&rdquo;
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-zinc-400 block">Observed Risk</span>
            <span className="text-sm font-bold text-emerald-400">{portfolioRisk.toFixed(1)}%</span>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-zinc-400 block">Risk Headroom</span>
            <span className="text-sm font-bold text-cyan-400">{availableRisk.toFixed(1)}%</span>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-zinc-400 block">Active Warnings</span>
            <span className="text-sm font-bold text-gray-900 dark:text-zinc-50">{warningCount}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800/40 border border-gray-200 dark:border-white/5/30 text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
          <strong className="text-cyan-400">Architectural Boundary:</strong> Hermes investigates and proposes trades, but cannot bypass, mutate, or override deterministic institutional risk controls.
        </div>
      </div>
    </div>
  );
}
