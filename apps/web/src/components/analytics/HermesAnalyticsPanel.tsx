"use client";

import React from "react";
import { HermesPerformanceReview } from "@/lib/mockAnalyticsData";
import { Sparkles, Trophy, AlertTriangle, Compass } from "lucide-react";

interface HermesAnalyticsPanelProps {
  review: HermesPerformanceReview;
}

export function HermesAnalyticsPanel({ review }: HermesAnalyticsPanelProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-cyan-900/30 bg-gradient-to-br from-zinc-100 dark:from-zinc-900 to-cyan-950/10 flex flex-col justify-between font-sans text-xs">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-zinc-200 dark:border-cyan-900/30 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-semibold font-medium text-text-primary">
              Hermes AI Performance Insight
            </h3>
            <p className="text-xs text-text-muted">
              Continuous agent analysis across active strategy configurations
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/10 text-cyan-400 border border-zinc-200 dark:border-cyan-900/30">
          ANALYTICS ENGINE
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-text-primary leading-relaxed text-xs">
          &ldquo;{review.assessment}&rdquo;
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex items-start gap-2">
            <Trophy className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div>
              <span className="text-xs text-text-muted block">Top Strategy</span>
              <span className="font-bold text-text-primary text-xs block mt-0.5">
                {review.topStrategy}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex items-start gap-2">
            <Compass className="w-4 h-4 text-cyan-400 mt-0.5" />
            <div>
              <span className="text-xs text-text-muted block">Best Regime</span>
              <span className="font-bold text-text-primary text-xs block mt-0.5">
                {review.bestRegime}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <span className="text-xs text-text-muted block">Friction Risk</span>
              <span className="font-bold text-text-primary text-xs block mt-0.5">
                {review.weakestRegime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
