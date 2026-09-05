"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { ToolActivityItem } from "@/lib/mockHermesData";
import { Wrench, CheckCircle, Clock, Loader2, Lock, ArrowRight } from "lucide-react";

interface HermesToolActivityProps {
  tools: ToolActivityItem[];
  className?: string;
}

export function HermesToolActivity({
  tools,
  className = "",
}: HermesToolActivityProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Wrench size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Analytical Tool Pipeline
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">
          6/6 MODULES NOMINAL
        </span>
      </div>

      {/* Visual Pipeline Hierarchy Indicator */}
      <div className="px-4 py-2 bg-bg-950 border-b border-border-color/60 text-[10px] font-mono text-gray-400 flex flex-wrap items-center gap-1.5 overflow-x-auto select-none">
        <span className="text-cyan-400 font-bold">HERMES</span>
        <ArrowRight size={10} className="text-gray-600" />
        <span className="text-gray-200">TOOLS</span>
        <ArrowRight size={10} className="text-gray-600" />
        <span className="text-gray-200">EVIDENCE</span>
        <ArrowRight size={10} className="text-gray-600" />
        <span className="text-gray-200">EVALUATION</span>
        <ArrowRight size={10} className="text-gray-600" />
        <span className="text-cyan-300 font-bold">TRADE PROPOSAL</span>
      </div>

      {/* Tools List */}
      <div className="divide-y divide-border-color/50">
        {tools.map((t) => {
          let statusBadge = (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-profit">
              <CheckCircle size={12} />
              Completed
            </span>
          );

          if (t.status === "Running") {
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 animate-pulse font-bold">
                <Loader2 size={12} className="animate-spin" />
                Running
              </span>
            );
          } else if (t.status === "Waiting") {
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-400">
                <Clock size={12} />
                Standby
              </span>
            );
          } else if (t.status === "Interlocked") {
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-warning font-semibold">
                <Lock size={12} />
                Interlocked
              </span>
            );
          }

          return (
            <div
              key={t.id}
              className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-surface-hover/40 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-gray-100">
                    {t.tool}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    ({t.latency})
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 truncate block">
                  {t.description}
                </span>
              </div>

              <div className="shrink-0 text-right">{statusBadge}</div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
