"use client";

import React, { useState } from "react";
import { Surface } from "@/components/ui/Surface";
import { EquityDataPoint, mockEquityHistories } from "@/lib/mockOverviewData";
import { TrendingUp, Calendar, Maximize2 } from "lucide-react";

interface PerformanceChartProps {
  className?: string;
}

const timeframes = ["1D", "1W", "1M", "3M", "ALL"] as const;
type Timeframe = (typeof timeframes)[number];

export function PerformanceChart({ className = "" }: PerformanceChartProps) {
  const [activeTf, setActiveTf] = useState<Timeframe>("1D");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data: EquityDataPoint[] = mockEquityHistories[activeTf] || mockEquityHistories["1D"];

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.998;
  const maxVal = Math.max(...values) * 1.002;
  const range = maxVal - minVal || 1;

  const width = 640;
  const height = 220;
  const paddingX = 20;
  const paddingY = 24;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.value - minVal) / range) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Generate SVG path command with smooth bezier curves
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const midX = (prev.x + point.x) / 2;
    return `${acc} C ${midX},${prev.y} ${midX},${point.y} ${point.x},${point.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];
  const startVal = data[0].value;
  const endVal = activePoint.value;
  const diffVal = endVal - startVal;
  const diffPct = ((diffVal / startVal) * 100).toFixed(2);
  const isPositive = diffVal >= 0;

  return (
    <Surface variant="default" padded="none" className={`flex flex-col overflow-hidden ${className}`}>
      {/* Chart Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/40">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-cyan-500" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Portfolio Equity Trajectory
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-cyan-dim/30 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
            SIMULATED
          </span>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-surface rounded p-0.5 border border-border-color">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setActiveTf(tf);
                setHoverIndex(null);
              }}
              className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded transition-colors ${
                activeTf === tf
                  ? "bg-cyan-dim/40 text-cyan-300 border border-cyan-500/40 shadow-[0_0_6px_rgba(0,229,255,0.2)] font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Trajectory Stat Overlay */}
      <div className="flex items-baseline justify-between px-4 pt-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xl font-bold text-gray-100 tracking-tight">
            ${activePoint.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span
            className={`font-mono text-xs font-semibold inline-flex items-center gap-0.5 ${
              isPositive ? "text-profit" : "text-loss"
            }`}
          >
            {isPositive ? "+" : ""}
            ${diffVal.toFixed(2)} ({isPositive ? "+" : ""}
            {diffPct}%)
          </span>
          <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
            Point: {activePoint.time}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
          <span>High: ${Math.max(...values).toLocaleString()}</span>
          <span>Low: ${Math.min(...values).toLocaleString()}</span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#00E5FF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line
            x1="0"
            y1={paddingY}
            x2={width}
            y2={paddingY}
            stroke="#1B2A32"
            strokeDasharray="2 4"
          />
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="#1B2A32"
            strokeDasharray="2 4"
          />
          <line
            x1="0"
            y1={height - paddingY}
            x2={width}
            y2={height - paddingY}
            stroke="#1B2A32"
            strokeDasharray="2 4"
          />

          {/* Shaded Area Under Curve */}
          <path d={areaPath} fill="url(#equityGradient)" />

          {/* Main Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]"
          />

          {/* Interactive Hover Anchor & Point */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              className="group cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === idx ? 5 : 3}
                className={`transition-all duration-150 ${
                  hoverIndex === idx
                    ? "fill-cyan-300 stroke-bg-950 stroke-2 drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]"
                    : "fill-cyan-500 opacity-60"
                }`}
              />
              {/* Invisible wide touch area */}
              <rect
                x={pt.x - 20}
                y="0"
                width="40"
                height={height}
                fill="transparent"
              />
            </g>
          ))}

          {/* Active Vertical Crosshair */}
          {hoverIndex !== null && (
            <line
              x1={activePoint.x}
              y1="0"
              x2={activePoint.x}
              y2={height}
              stroke="rgba(0,229,255,0.4)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>

      {/* Sub-bar / Statistical Summary */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-4">
          <span>Sharpe: <strong className="text-gray-200 font-bold">2.41</strong></span>
          <span>Profit Factor: <strong className="text-gray-200 font-bold">2.84</strong></span>
          <span>Max Recovery: <strong className="text-gray-200 font-bold">14h</strong></span>
        </div>
        <span className="text-gray-400 flex items-center gap-1">
          <Calendar size={11} className="text-gray-500" />
          <span>REAL-TIME STREAM</span>
        </span>
      </div>
    </Surface>
  );
}
