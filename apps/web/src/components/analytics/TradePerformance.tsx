"use client";

import React from "react";
import { AnalyticsSummary } from "@/lib/mockAnalyticsData";
import { TrendingUp, TrendingDown, Clock, Scale, Award, AlertCircle } from "lucide-react";

interface TradePerformanceProps {
  summary: AnalyticsSummary;
  className?: string;
}

export function TradePerformance({ summary, className = "" }: TradePerformanceProps) {
  const winLossRatio =
    summary.averageLoser !== 0
      ? (summary.averageWinner / Math.abs(summary.averageLoser)).toFixed(2)
      : "N/A";

  return (
    <div className={`p-4 rounded-lg bg-surface border border-border-color space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-border-color/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-100">
              Trade Performance & Attribution
            </h3>
            <p className="text-[11px] font-mono text-gray-400">
              Trade payoff profile, winner/loser asymmetry, and execution durations
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-gray-400 text-[10px] uppercase block">Win / Loss Ratio</span>
          <span className="text-cyan-300 font-bold text-sm">{winLossRatio} : 1</span>
        </div>
      </div>

      {/* Primary Payoff Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        {/* Average Winner */}
        <div className="p-3 rounded bg-surface-2/60 border border-border-color/80">
          <div className="flex items-center gap-1.5 text-profit text-[10px] uppercase font-semibold">
            <TrendingUp size={12} />
            <span>Avg Winner</span>
          </div>
          <div className="text-profit font-bold text-base mt-1">
            +${summary.averageWinner.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {summary.winningTrades} trades ({(summary.winRate).toFixed(1)}%)
          </div>
        </div>

        {/* Average Loser */}
        <div className="p-3 rounded bg-surface-2/60 border border-border-color/80">
          <div className="flex items-center gap-1.5 text-loss text-[10px] uppercase font-semibold">
            <TrendingDown size={12} />
            <span>Avg Loser</span>
          </div>
          <div className="text-loss font-bold text-base mt-1">
            -${Math.abs(summary.averageLoser).toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {summary.losingTrades} trades ({(100 - summary.winRate).toFixed(1)}%)
          </div>
        </div>

        {/* Largest Winner */}
        <div className="p-3 rounded bg-surface-2/60 border border-border-color/80">
          <div className="flex items-center gap-1.5 text-profit text-[10px] uppercase font-semibold">
            <Award size={12} />
            <span>Max Gain</span>
          </div>
          <div className="text-profit font-bold text-base mt-1">
            +${summary.largestWinner.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Best outlier trade</div>
        </div>

        {/* Largest Loser */}
        <div className="p-3 rounded bg-surface-2/60 border border-border-color/80">
          <div className="flex items-center gap-1.5 text-loss text-[10px] uppercase font-semibold">
            <AlertCircle size={12} />
            <span>Max Loss</span>
          </div>
          <div className="text-loss font-bold text-base mt-1">
            -${Math.abs(summary.largestLoser).toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Worst stop breach</div>
        </div>

        {/* Average Holding Time */}
        <div className="p-3 rounded bg-surface-2/60 border border-border-color/80">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] uppercase font-semibold">
            <Clock size={12} />
            <span>Avg Hold Time</span>
          </div>
          <div className="text-gray-100 font-bold text-base mt-1">
            {summary.averageHoldingTime}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Entry to exit duration</div>
        </div>

        {/* Trade Expectancy */}
        <div className="p-3 rounded bg-surface-2/60 border border-border-color/80">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] uppercase font-semibold">
            <Scale size={12} />
            <span>Expectancy</span>
          </div>
          <div className="text-cyan-300 font-bold text-base mt-1">
            +{summary.expectancy.toFixed(2)} R
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Per risk-unit edge</div>
        </div>
      </div>

      {/* Friction & Cost Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-surface-2/40 border border-border-color/40 text-[11px] font-mono text-gray-400">
        <div>
          Gross Profit: <span className="font-bold text-gray-200">${summary.grossPnl.toLocaleString()}</span>
        </div>
        <div>
          Exchange Fees: <span className="font-bold text-amber-400">-${summary.fees.toFixed(2)}</span>
        </div>
        <div>
          Est. Slippage: <span className="font-bold text-amber-400">-${summary.slippage.toFixed(2)}</span>
        </div>
        <div>
          Friction Drag: <span className="font-bold text-gray-200">{summary.costImpact.toFixed(2)}%</span> of P&L
        </div>
      </div>
    </div>
  );
}
