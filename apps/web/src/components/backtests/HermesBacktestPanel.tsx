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
    <div className="p-4 rounded-lg bg-surface-1 border border-cyan-500/25 bg-gradient-to-br from-surface-1 to-cyan-950/10 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Hermes AI Quantitative Review
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Continuous agent analysis for {strategyName} {strategyVersion}
            </p>
          </div>
        </div>

        {/* Review Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${
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

      <div className="space-y-2 text-xs font-mono">
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block">Assessment</span>
          <p className="text-text-primary leading-relaxed mt-0.5">
            {review.assessment}
          </p>
        </div>

        <div className="pt-2 border-t border-border/30">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">Quantitative Directive</span>
          <p className="text-cyan-300/90 leading-relaxed mt-0.5">
            {review.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
