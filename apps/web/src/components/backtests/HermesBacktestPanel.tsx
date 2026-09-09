"use client";

import React from "react";
import { HermesBacktestReview } from "@/lib/mockBacktestsData";
import { Sparkles, CheckCircle2, AlertCircle, Eye } from "lucide-react";

interface HermesBacktestPanelProps {
  strategyName: string;
  strategyVersion: string;
  review: HermesBacktestReview;
}

export function HermesBacktestPanel({
  strategyName,
  strategyVersion,
  review,
}: HermesBacktestPanelProps) {
  const isReviewing = review.status === "Reviewing";
  const isValidated = review.status === "Validated";

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-cyan-500/25 bg-gradient-to-br from-surface-1 to-cyan-950/10 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-200/50 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wide text-gray-900 dark:text-zinc-50">
              Hermes AI Quantitative Review
            </h3>
            <p className="text-[11px] font-sans text-gray-500 dark:text-zinc-400">
              Continuous agent analysis for {strategyName} {strategyVersion}
            </p>
          </div>
        </div>

        {/* Review Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-xs font-sans font-medium border ${
            isValidated
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : isReviewing
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {isValidated ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          ) : isReviewing ? (
            <Eye className="w-3 h-3 text-cyan-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-400" />
          )}
          {review.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-xs font-sans">
        <div>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-wide block">Assessment</span>
          <p className="text-gray-900 dark:text-zinc-50 leading-relaxed mt-0.5">
            {review.assessment}
          </p>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-white/5">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wide block">Quantitative Directive</span>
          <p className="text-cyan-300/90 leading-relaxed mt-0.5">
            {review.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
