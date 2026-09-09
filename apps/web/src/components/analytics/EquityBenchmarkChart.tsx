"use client";

import React, { useState, useId } from "react";
import { EquityBenchmarkPoint } from "@/lib/mockAnalyticsData";
import { TrendingUp, ShieldCheck } from "lucide-react";

interface EquityBenchmarkChartProps {
  data: EquityBenchmarkPoint[];
  height?: number;
}

export function EquityBenchmarkChart({
  data,
  height = 300,
}: EquityBenchmarkChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const minVal = 9500;
  const maxVal = 13000;
  const valRange = maxVal - minVal;

  const width = 800;
  const paddingX = 45;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Convert points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const yStrategy = paddingY + chartHeight - ((d.equity - minVal) / valRange) * chartHeight;
    const yBtc = paddingY + chartHeight - ((d.btcHold - minVal) / valRange) * chartHeight;
    const yEth = paddingY + chartHeight - ((d.ethHold - minVal) / valRange) * chartHeight;
    return { x, yStrategy, yBtc, yEth, data: d };
  });

  const pathStrategy = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.yStrategy}`, "");
  const pathBtc = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.yBtc}`, "");
  const pathEth = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.yEth}`, "");

  const areaStrategy = `${pathStrategy} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-zinc-200 dark:border-cyan-900/30 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold font-medium text-text-primary">
              Equity Curve vs Benchmark Alpha
            </h3>
            <p className="text-xs font-sans text-text-muted">
              Compounded portfolio performance compared against passive BTC & ETH buy-and-hold baselines
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 font-sans text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-cyan-400 rounded-full" />
            <span className="text-text-primary font-bold">AGI Trading (+24.8%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <span className="w-2.5 h-0.5 bg-amber-400 border-dashed" />
            <span>BTC (+18.1%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <span className="w-2.5 h-0.5 bg-purple-400 border-dashed" />
            <span>ETH (+11.7%)</span>
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
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio) => {
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

          {/* Area under strategy */}
          <path d={areaStrategy} fill={`url(#${gradientId})`} />

          {/* Benchmark Lines */}
          <path
            d={pathEth}
            fill="none"
            stroke="#c084fc"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.7"
          />
          <path
            d={pathBtc}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* Strategy Primary Line */}
          <path
            d={pathStrategy}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Hover Scrubber */}
          {activePoint && (
            <g>
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
              <circle
                cx={activePoint.x}
                cy={activePoint.yStrategy}
                r="4"
                fill="#ffffff"
                stroke="#06b6d4"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Time Labels */}
          {points.map((p, idx) => {
            if (idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) {
              return (
                <text
                  key={p.data.time}
                  x={p.x}
                  y={height - 8}
                  textAnchor={idx === 0 ? "start" : idx === points.length - 1 ? "end" : "middle"}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {p.data.time}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Hover Info Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-white/10 font-sans text-xs text-text-muted">
        <span>Date: <strong className="text-text-primary">{activePoint.data.time}</strong></span>
        <div className="flex items-center gap-3">
          <span>Portfolio: <strong className="text-cyan-400">${activePoint.data.equity.toLocaleString()}</strong></span>
          <span>BTC: <strong className="text-amber-400">${activePoint.data.btcHold.toLocaleString()}</strong></span>
          <span>ETH: <strong className="text-purple-400">${activePoint.data.ethHold.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
}
