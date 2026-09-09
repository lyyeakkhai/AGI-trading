"use client";

import React from "react";
import { mockActivitySummary } from "@/lib/mockActivityData";
import { Activity, ShieldCheck, Sparkles, TrendingUp, AlertTriangle, AlertOctagon } from "lucide-react";

interface ActivityMetricsSummaryProps {
  summary?: typeof mockActivitySummary;
}

export function ActivityMetricsSummary({
  summary = mockActivitySummary,
}: ActivityMetricsSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 font-sans text-xs">
      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          Events Today
        </span>
        <span className="text-lg font-bold text-text-primary mt-1">
          {summary.eventsToday}
        </span>
        <span className="text-[10px] text-text-muted mt-0.5">Recorded actions</span>
      </div>

      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          Trading Events
        </span>
        <span className="text-lg font-bold text-emerald-400 mt-1">
          {summary.tradingEvents}
        </span>
        <span className="text-[10px] text-text-muted mt-0.5">Orders & fills</span>
      </div>

      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          Risk Decisions
        </span>
        <span className="text-lg font-bold text-text-primary mt-1">
          {summary.riskDecisions}
        </span>
        <span className="text-[10px] text-text-muted mt-0.5">Deterministic gates</span>
      </div>

      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Hermes AI Events
        </span>
        <span className="text-lg font-bold text-cyan-400 mt-1">
          {summary.hermesEvents}
        </span>
        <span className="text-[10px] text-text-muted mt-0.5">Investigations & scans</span>
      </div>

      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Warnings
        </span>
        <span className="text-lg font-bold text-amber-400 mt-1">
          {summary.warnings}
        </span>
        <span className="text-[10px] text-text-muted mt-0.5">Non-critical retries</span>
      </div>

      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
          <AlertOctagon className="w-3 h-3 text-red-400" />
          Errors
        </span>
        <span className="text-lg font-bold text-text-primary mt-1">
          {summary.errors}
        </span>
        <span className="text-[10px] text-emerald-400 mt-0.5">Zero critical halts</span>
      </div>
    </div>
  );
}
