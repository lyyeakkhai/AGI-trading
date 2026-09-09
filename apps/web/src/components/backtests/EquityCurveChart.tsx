"use client";

import React, { useState, useId } from "react";
import { BacktestEquityPoint } from "@/lib/mockBacktestsData";
import { TrendingUp, ShieldCheck } from "lucide-react";

interface EquityCurveChartProps {
  data: BacktestEquityPoint[];
  initialCapital: number;
  finalEquity: number;
  height?: number;
}

export function EquityCurveChart({
  data,
  initialCapital,
  finalEquity,
  height = 280,
}: EquityCurveChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl text-gray-500 dark:text-zinc-400 font-sans text-xs">
        No equity curve data available.
      </div>
    );
  }

  // Calculate scales
  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, initialCapital * 0.95);
  const maxVal = Math.max(...values, initialCapital * 1.05);
  const valRange = maxVal - minVal || 1;

  const width = 800;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Convert points to SVG coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const baselineY = paddingY + chartHeight - ((initialCapital - minVal) / valRange) * chartHeight;
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;

  // Hover item
  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];
  const activeReturn = ((activePoint.data.value - initialCapital) / initialCapital) * 100;
  const isGain = activePoint.data.value >= initialCapital;

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 flex flex-col">
      {/* Header with legend & hover stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wide text-gray-900 dark:text-zinc-50">
              Equity Curve (Continuous Simulation)
            </h3>
            <p className="text-[11px] font-sans text-gray-500 dark:text-zinc-400">
              Compounded account balance across all executed signals after fees and modeled slippage.
            </p>
          </div>
        </div>

        {/* Dynamic Hover / Final Indicator */}
        <div className="flex items-center gap-3 font-sans text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">
              {hoverIndex !== null ? `Point on ${activePoint.data.time}` : "Latest Position"}
            </span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isGain ? "text-emerald-400" : "text-red-400"}`}>
                ${activePoint.data.value.toLocaleString()}
              </span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-xl ${isGain ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {isGain ? `+${activeReturn.toFixed(1)}%` : `${activeReturn.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
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
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + chartHeight * ratio;
            const val = maxVal - ratio * valRange;
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
                  ${Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Initial Capital Baseline line */}
          <line
            x1={paddingX}
            y1={baselineY}
            x2={width - paddingX}
            y2={baselineY}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={width - paddingX + 4}
            y={baselineY + 3}
            fill="rgba(255,255,255,0.4)"
            fontSize="9"
            fontFamily="monospace"
          >
            Base $10k
          </text>

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Scrubber & Indicator */}
          {activePoint && (
            <g>
              {/* Vertical crosshair line */}
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={paddingY + chartHeight}
                stroke="#06b6d4"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              {/* Outer pulsing ring */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                opacity="0.5"
              />
              {/* Center point */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3.5"
                fill="#ffffff"
                stroke="#06b6d4"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Date labels on bottom axis */}
          {points.length > 0 && (
            <g>
              <text
                x={paddingX}
                y={height - 8}
                textAnchor="start"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontFamily="monospace"
              >
                {data[0].time}
              </text>
              <text
                x={width / 2}
                y={height - 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontFamily="monospace"
              >
                {data[Math.floor(data.length / 2)].time}
              </text>
              <text
                x={width - paddingX}
                y={height - 8}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontFamily="monospace"
              >
                {data[data.length - 1].time}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
