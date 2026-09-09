"use client";

import React from "react";
import { DistributionBucket } from "@/lib/mockAnalyticsData";
import { BarChart2 } from "lucide-react";

interface PnlDistributionChartProps {
  distribution: DistributionBucket[];
}

export function PnlDistributionChart({ distribution }: PnlDistributionChartProps) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-200 dark:border-white/10 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-zinc-200 dark:border-cyan-900/30 text-cyan-400">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold font-medium text-text-primary">
              Trade P&L R-Multiple Distribution
            </h3>
            <p className="text-xs font-sans text-text-muted">
              Frequency histogram of realized trade outcome multiples
            </p>
          </div>
        </div>
        <span className="text-xs font-sans text-text-muted">
          184 Total Trades
        </span>
      </div>

      {/* Vertical Histogram Bars */}
      <div className="flex items-end justify-between gap-2 h-36 px-2 pb-2 pt-4">
        {distribution.map((b) => {
          const heightPct = (b.count / maxCount) * 100;
          const isWin = b.type === "win";

          return (
            <div key={b.range} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-xs font-sans text-text-muted">
                {b.count}
              </span>
              <div
                style={{ height: `${Math.max(heightPct, 8)}%` }}
                className={`w-full rounded-t transition-all duration-300 ${
                  isWin
                    ? "bg-emerald-500/80 hover:bg-emerald-400"
                    : "bg-red-500/80 hover:bg-red-400"
                }`}
              />
              <span className="text-xs font-sans text-text-muted whitespace-nowrap mt-1">
                {b.range}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
