"use client";

import React from "react";
import { RiskEventItem } from "@/lib/mockRiskData";
import { Clock, CheckCircle2, AlertTriangle, Info, AlertOctagon } from "lucide-react";

interface RiskActivityTimelineProps {
  events: RiskEventItem[];
}

export function RiskActivityTimeline({ events }: RiskActivityTimelineProps) {
  const getIcon = (type: RiskEventItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case "error":
        return <AlertOctagon className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Risk Engine Audit Log
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Deterministic events, checks, and breaker status changes
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-text-muted">Real-Time Event Stream</span>
      </div>

      <div className="space-y-2.5 font-mono text-xs">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex items-start gap-2.5 p-2 rounded bg-surface-2/40 border border-border/30 hover:bg-surface-2/60 transition-colors"
          >
            <div className="mt-0.5">{getIcon(ev.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-text-primary text-[11px] truncate">
                  {ev.title}
                </span>
                <span className="text-[10px] text-text-muted whitespace-nowrap">
                  {ev.time}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                {ev.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
