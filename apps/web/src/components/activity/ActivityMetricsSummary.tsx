"use client";

import React from "react";
import { mockActivitySummary } from "@/lib/mockActivityData";
import { Activity, ShieldCheck, Sparkles, TrendingUp, AlertTriangle, AlertOctagon } from "lucide-react";

interface ActivityMetricsSummaryProps {
  summary?: typeof mockActivitySummary;
}

const MetricCard = ({
  icon,
  label,
  value,
  valueColor,
  subLabel,
  subLabelColor = "text-zinc-500",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueColor: string;
  subLabel: string;
  subLabelColor?: string;
}) => (
  <div className="px-4 py-3 bg-[#0E0E0E] border-r border-white/5 last:border-r-0 flex flex-col gap-1 min-w-0">
    <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-sans">
      {icon}
      {label}
    </span>
    <span className={`text-xl font-mono font-bold leading-none ${valueColor}`}>{value}</span>
    <span className={`text-[10px] font-sans ${subLabelColor}`}>{subLabel}</span>
  </div>
);

export function ActivityMetricsSummary({
  summary = mockActivitySummary,
}: ActivityMetricsSummaryProps) {
  return (
    <div className="flex rounded-md bg-[#0E0E0E] border border-white/5 overflow-hidden">
      <MetricCard
        icon={<Activity className="w-3 h-3 text-cyan-400" />}
        label="Events Today"
        value={summary.eventsToday}
        valueColor="text-zinc-100"
        subLabel="Recorded actions"
      />
      <MetricCard
        icon={<TrendingUp className="w-3 h-3 text-emerald-400" />}
        label="Trading Events"
        value={summary.tradingEvents}
        valueColor="text-emerald-400"
        subLabel="Orders & fills"
      />
      <MetricCard
        icon={<ShieldCheck className="w-3 h-3 text-amber-400" />}
        label="Risk Decisions"
        value={summary.riskDecisions}
        valueColor="text-zinc-100"
        subLabel="Deterministic gates"
      />
      <MetricCard
        icon={<Sparkles className="w-3 h-3 text-cyan-400" />}
        label="Hermes AI Events"
        value={summary.hermesEvents}
        valueColor="text-cyan-400"
        subLabel="Investigations & scans"
      />
      <MetricCard
        icon={<AlertTriangle className="w-3 h-3 text-amber-400" />}
        label="Warnings"
        value={summary.warnings}
        valueColor="text-amber-400"
        subLabel="Non-critical retries"
      />
      <MetricCard
        icon={<AlertOctagon className="w-3 h-3 text-red-400" />}
        label="Errors"
        value={summary.errors}
        valueColor="text-zinc-100"
        subLabel="Zero critical halts"
        subLabelColor="text-emerald-500"
      />
    </div>
  );
}
