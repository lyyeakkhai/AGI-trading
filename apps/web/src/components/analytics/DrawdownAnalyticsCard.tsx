"use client";

import React, { useId } from "react";
import { DrawdownAnalysisData } from "@/lib/mockAnalyticsData";
import { ShieldAlert } from "lucide-react";

interface DrawdownAnalyticsCardProps {
  data: DrawdownAnalysisData;
}

export function DrawdownAnalyticsCard({ data }: DrawdownAnalyticsCardProps) {
  const gradientId = useId();
  const width = 600;
  const height = 150;
  const paddingX = 35;
  const paddingY = 15;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const minVal = -10;
  const valRange = 10;

  const points = data.curve.map((d, i) => {
    const x = paddingX + (i / (data.curve.length - 1)) * chartWidth;
    const y = paddingY + (Math.abs(d.value) / valRange) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY} L ${points[0].x} ${paddingY} Z`;

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-200 dark:border-white/10 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200 dark:border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold font-medium text-text-primary">
              Underwater Drawdown Analysis
            </h3>
            <p className="text-xs font-sans text-text-muted">
              Peak degradation and recovery cycles
            </p>
          </div>
        </div>
        <span className="text-xs font-sans text-red-400 font-bold">
          Max {data.maxDrawdown.toFixed(1)}%
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-sans">
        <div className="p-2 rounded bg-white dark:bg-zinc-900/50/60 border border-zinc-200 dark:border-zinc-200 dark:border-white/10">
          <span className="text-xs text-text-muted block">Current Dip</span>
          <span className="font-bold text-red-400">{data.currentDrawdown.toFixed(1)}%</span>
        </div>
        <div className="p-2 rounded bg-white dark:bg-zinc-900/50/60 border border-zinc-200 dark:border-zinc-200 dark:border-white/10">
          <span className="text-xs text-text-muted block">Average Dip</span>
          <span className="font-bold text-text-primary">{data.averageDrawdown.toFixed(1)}%</span>
        </div>
        <div className="p-2 rounded bg-white dark:bg-zinc-900/50/60 border border-zinc-200 dark:border-zinc-200 dark:border-white/10">
          <span className="text-xs text-text-muted block">Longest Cycle</span>
          <span className="font-bold text-amber-400">{data.longestDrawdown}</span>
        </div>
        <div className="p-2 rounded bg-white dark:bg-zinc-900/50/60 border border-zinc-200 dark:border-zinc-200 dark:border-white/10">
          <span className="text-xs text-text-muted block">Avg Recovery</span>
          <span className="font-bold text-emerald-400">{data.recoveryTime}</span>
        </div>
      </div>

      {/* Mini SVG Drawdown */}
      <div className="relative w-full h-24">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* 0% Top Line */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />

          <path d={areaD} fill={`url(#${gradientId})`} />
          <path
            d={pathD}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
