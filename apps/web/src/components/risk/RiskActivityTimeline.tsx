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
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Risk Engine Audit Log
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Deterministic events, checks, and breaker status changes
            </p>
          </div>
        </div>
        <span className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">Real-Time Event Stream</span>
      </div>

      <div className="space-y-2.5 font-sans tracking-tight text-xs">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-100 dark:bg-zinc-800/40 border border-gray-200 dark:border-white/5/30 hover:bg-gray-50 dark:bg-zinc-800/50 transition-colors"
          >
            <div className="mt-0.5">{getIcon(ev.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900 dark:text-zinc-50 text-xs truncate">
                  {ev.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-400 whitespace-nowrap">
                  {ev.time}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                {ev.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
