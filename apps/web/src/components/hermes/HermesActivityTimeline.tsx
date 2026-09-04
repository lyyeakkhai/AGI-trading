"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { IntelligenceTimelineEvent } from "@/lib/mockHermesData";
import { Activity, Database, LineChart, Gauge, Zap, Bot } from "lucide-react";

interface HermesActivityTimelineProps {
  events: IntelligenceTimelineEvent[];
  className?: string;
}

export function HermesActivityTimeline({
  events,
  className = "",
}: HermesActivityTimelineProps) {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "DATA":
        return <Database size={13} className="text-blue-400" />;
      case "TECH":
        return <LineChart size={13} className="text-cyan-400" />;
      case "VOL":
        return <Gauge size={13} className="text-warning" />;
      case "SCAN":
        return <Zap size={13} className="text-purple-400" />;
      case "HERMES":
      default:
        return <Bot size={13} className="text-cyan-300" />;
    }
  };

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Operational Intelligence Timeline
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">
          REAL-TIME EVENT BUS
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="p-4 max-h-[380px] overflow-y-auto space-y-4">
        <div className="relative border-l border-border-color/80 ml-2 space-y-4 pb-1">
          {events.map((ev) => (
            <div key={ev.id} className="relative pl-5 group">
              {/* Timeline Pin Node */}
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-bg-950 border border-border-hi flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>

              {/* Event Content Box */}
              <div className="p-2.5 rounded bg-surface-2/40 border border-border-color/70 group-hover:border-border-hi transition-colors space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(ev.category)}
                    <span className="font-mono text-xs font-bold text-gray-100">
                      {ev.title}
                    </span>
                    {ev.symbol && (
                      <span className="px-1 py-0.2 rounded bg-bg-950 border border-border-color text-[9px] font-mono text-cyan-400">
                        {ev.symbol}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[10px] text-gray-400">
                    {ev.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  {ev.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>AUDIT TRAIL PRESERVED IN IMMUTABLE LOG</span>
        <span className="text-gray-400">0 HIDDEN MONOLOGUE</span>
      </div>
    </Surface>
  );
}
