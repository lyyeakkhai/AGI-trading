"use client";

import React from "react";
import { ConfidenceCalibrationItem } from "@/lib/mockAnalyticsData";
import { Target, Sparkles } from "lucide-react";

interface ConfidenceCalibrationCardProps {
  data: ConfidenceCalibrationItem[];
}

export function ConfidenceCalibrationCard({ data }: ConfidenceCalibrationCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex flex-col justify-between h-full font-sans text-xs">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-zinc-200 dark:border-cyan-900/30 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold font-medium text-text-primary">
              AI Confidence Calibration
            </h3>
            <p className="text-xs font-sans text-text-muted">
              Observed win rate reliability versus Hermes probability estimates
            </p>
          </div>
        </div>
        <span className="text-xs text-cyan-400">
          Well Calibrated
        </span>
      </div>

      <div className="space-y-2 mb-2">
        {data.map((item) => (
          <div key={item.range} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-primary font-medium">{item.range} Confidence</span>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">{item.trades} trades</span>
                <span className="text-emerald-400 font-bold">{item.winRate.toFixed(1)}% win</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white dark:bg-zinc-900/50 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${item.winRate}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted mt-1 leading-relaxed">
        Observed trade win rates scale monotonically with Hermes model confidence ratings, indicating healthy calibration across the 184-trade sample.
      </p>
    </div>
  );
}
