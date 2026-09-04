"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { MemoryContextData } from "@/lib/mockHermesData";
import { Database, BookmarkCheck, Calendar, TrendingUp } from "lucide-react";

interface HermesMemoryProps {
  memory: MemoryContextData;
  className?: string;
}

export function HermesMemory({ memory, className = "" }: HermesMemoryProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Memory & Context Store
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">
          PERSISTENT CONTEXT
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3.5 text-xs">
        {/* Recent Observation Context */}
        <div className="p-3 rounded bg-bg-950 border border-border-color space-y-1">
          <div className="text-[10px] font-mono uppercase text-gray-400">
            Active Synthesis Memory
          </div>
          <p className="text-xs text-gray-200 leading-relaxed font-sans">
            {memory.recentContext}
          </p>
        </div>

        {/* Historical Stats Grid */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">
              Previous Edge Model
            </span>
            <span className="text-gray-100 font-bold text-xs truncate block">
              {memory.previousSetup}
            </span>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">
              Regime Win Rate
            </span>
            <span className="text-profit font-bold text-sm">
              {memory.historicalWinRate}%
            </span>
          </div>
        </div>

        {/* Learned Market Anchors */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">
            Learned Structural Anchors
          </span>
          <div className="space-y-1">
            {memory.learnedAnchors.map((anchor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-[11px] text-gray-300 bg-surface-2/30 px-2 py-1.5 rounded border border-border-color/60"
              >
                <BookmarkCheck size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>{anchor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-border-color/60">
          <span>Synced with local state store</span>
          <span>Updated {memory.lastReviewed}</span>
        </div>
      </div>
    </Surface>
  );
}
