"use client";

import React from "react";
import { HermesPerformanceReview } from "@/lib/mockAnalyticsData";
import { Sparkles, Trophy, AlertTriangle, Compass } from "lucide-react";

interface HermesAnalyticsPanelProps {
  review: HermesPerformanceReview;
}

export function HermesAnalyticsPanel({ review }: HermesAnalyticsPanelProps) {
  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-cyan-500/25 bg-gradient-to-br from-surface-1 to-cyan-950/10 flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Hermes AI Performance Insight
            </h3>
            <p className="text-[11px] text-text-muted">
              Continuous agent analysis across active strategy configurations
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          ANALYTICS ENGINE
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-text-primary leading-relaxed text-xs">
          &ldquo;{review.assessment}&rdquo;
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 rounded bg-surface-2/60 border border-border/40 flex items-start gap-2">
            <Trophy className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Top Strategy</span>
              <span className="font-bold text-text-primary text-[11px] block mt-0.5">
                {review.topStrategy}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border/40 flex items-start gap-2">
            <Compass className="w-4 h-4 text-cyan-400 mt-0.5" />
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Best Regime</span>
              <span className="font-bold text-text-primary text-[11px] block mt-0.5">
                {review.bestRegime}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border/40 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Friction Risk</span>
              <span className="font-bold text-text-primary text-[11px] block mt-0.5">
                {review.weakestRegime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
