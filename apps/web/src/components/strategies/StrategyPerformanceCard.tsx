"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { StrategyPerformance } from "@/lib/mockStrategiesData";
import { BarChart2, TrendingUp } from "lucide-react";

interface StrategyPerformanceCardProps {
  performance: StrategyPerformance;
  className?: string;
}

export function StrategyPerformanceCard({
  performance,
  className = "",
}: StrategyPerformanceCardProps) {
  // Compute SVG polyline points from equityCurve
  const curve = performance.equityCurve;
  const minEquity = Math.min(...curve.map((c) => c.equity));
  const maxEquity = Math.max(...curve.map((c) => c.equity));
  const range = maxEquity - minEquity || 1;

  const width = 400;
  const height = 90;
  const padding = 8;

  const points = curve
    .map((c, i) => {
      const x = padding + (i / (curve.length - 1 || 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((c.equity - minEquity) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const startVal = curve[0]?.equity || 10000;
  const endVal = curve[curve.length - 1]?.equity || 10000;
  const isGain = endVal >= startVal;

  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-2">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Performance Snapshot & Simulated Equity Curve
          </span>
        </div>
        <div className="text-xs font-mono">
          <span className="text-gray-400">Total Trades: </span>
          <span className="font-bold text-gray-100">{performance.totalTrades}</span>
        </div>
      </div>

      {/* Equity Curve SVG Preview */}
      <div className="p-3 rounded bg-bg-950 border border-border-color space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
          <span>Initial: ${startVal.toLocaleString()}</span>
          <span className={isGain ? "text-profit font-bold" : "text-loss font-bold"}>
            Final Simulated: ${endVal.toLocaleString()} ({performance.netReturnPercent > 0 ? "+" : ""}
            {performance.netReturnPercent}%)
          </span>
        </div>

        <div className="w-full overflow-hidden h-[90px] relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal baseline */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#333333"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
            {/* Sparkline curve */}
            <polyline
              fill="none"
              stroke={isGain ? "#00E5FF" : "#EF4444"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Quantitative Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Win Rate</span>
          <span className="font-bold text-gray-100 text-sm">
            {performance.winRatePercent}%
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Profit Factor</span>
          <span className="font-bold text-cyan-400 text-sm">
            {performance.profitFactor.toFixed(2)}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Expectancy</span>
          <span className="font-bold text-profit text-sm">
            {performance.expectancy}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-loss/30">
          <span className="text-[10px] text-loss uppercase block">Max Drawdown</span>
          <span className="font-bold text-loss text-sm">
            -{performance.maxDrawdownPercent}%
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Sharpe Ratio</span>
          <span className="font-bold text-gray-200">
            {performance.sharpeRatio.toFixed(2)}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Sortino Ratio</span>
          <span className="font-bold text-gray-200">
            {performance.sortinoRatio.toFixed(2)}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Avg Winner</span>
          <span className="font-bold text-profit">
            {performance.avgWinner}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Avg Loser</span>
          <span className="font-bold text-loss">
            {performance.avgLoser}
          </span>
        </div>
      </div>
    </Surface>
  );
}
