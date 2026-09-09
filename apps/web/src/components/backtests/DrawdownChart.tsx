"use client";

import React, { useState, useId } from "react";
import { BacktestDrawdownPoint } from "@/lib/mockBacktestsData";
import { ShieldAlert } from "lucide-react";

interface DrawdownChartProps {
  data: BacktestDrawdownPoint[];
  maxDrawdown: number;
  averageDrawdown: number;
  longestDrawdown: string;
  height?: number;
}

export function DrawdownChart({
  data,
  maxDrawdown,
  averageDrawdown,
  longestDrawdown,
  height = 180,
}: DrawdownChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl text-gray-500 dark:text-zinc-400 font-sans text-xs">
        No drawdown data available.
      </div>
    );
  }

  // Drawdowns are negative numbers (e.g. 0 to -15)
  const minVal = Math.min(...data.map((d) => d.value), maxDrawdown * 1.15, -10);
  const maxVal = 0; // Ceiling is always 0%
  const valRange = Math.abs(minVal) || 1;

  const width = 800;
  const paddingX = 40;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    // Y=paddingY is 0% drawdown, Y=paddingY+chartHeight is max negative
    const y = paddingY + (Math.abs(d.value) / valRange) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY} L ${points[0].x} ${paddingY} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wide text-gray-900 dark:text-zinc-50">
              Underwater Drawdown Profile
            </h3>
            <p className="text-[11px] font-sans text-gray-500 dark:text-zinc-400">
              Peak-to-trough equity degradation and recovery cycles.
            </p>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="flex items-center gap-3 font-sans text-xs">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">Worst Dip</span>
            <span className="block text-red-400 font-bold">{maxDrawdown.toFixed(1)}%</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">Avg Dip</span>
            <span className="block text-gray-900 dark:text-zinc-50 font-bold">{averageDrawdown.toFixed(1)}%</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">Max Duration</span>
            <span className="block text-amber-400 font-bold">{longestDrawdown}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none cursor-crosshair"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const normX = (mouseX / rect.width) * width;
            const clampedX = Math.max(paddingX, Math.min(width - paddingX, normX));
            const ratio = (clampedX - paddingX) / chartWidth;
            const index = Math.round(ratio * (data.length - 1));
            setHoverIndex(Math.max(0, Math.min(data.length - 1, index)));
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Grid lines: 0%, 50%, 100% */}
          {[0, 0.5, 1].map((ratio) => {
            const y = paddingY + chartHeight * ratio;
            const val = -ratio * valRange;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.3)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* 0% Top Line */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Drawdown Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scrubber */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={paddingY + chartHeight}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3"
                fill="#ffffff"
                stroke="#ef4444"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
