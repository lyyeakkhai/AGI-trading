"use client";

import React from "react";
import {
  AssetAnalyticsItem,
  TimeframeAnalyticsItem,
  RegimeAnalyticsItem,
} from "@/lib/mockAnalyticsData";
import { Coins, Clock, Compass, TrendingUp, Shuffle, AlertTriangle, Wind } from "lucide-react";

interface AssetTimeframeRegimeCardsProps {
  assets: AssetAnalyticsItem[];
  timeframes: TimeframeAnalyticsItem[];
  regimes: RegimeAnalyticsItem[];
}

export function AssetTimeframeRegimeCards({
  assets,
  timeframes,
  regimes,
}: AssetTimeframeRegimeCardsProps) {
  const getRegimeIcon = (name: string) => {
    if (name.includes("Trending")) return <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />;
    if (name.includes("Ranging")) return <Shuffle className="w-3.5 h-3.5 text-amber-400" />;
    if (name.includes("High Volatility")) return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    return <Wind className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="space-y-4">
      {/* 1. Market Regime Matrix */}
      <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Performance by Market Regime
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">Macro structural sensitivity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
          {regimes.map((r) => {
            const isProfit = r.returnPct >= 0;
            return (
              <div
                key={r.regime}
                className="p-3 rounded bg-surface-2/60 border border-border/40 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  {getRegimeIcon(r.regime)}
                  <span className="font-semibold text-text-primary text-xs">{r.regime}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className={`text-base font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                    {isProfit ? `+${r.returnPct.toFixed(1)}%` : `${r.returnPct.toFixed(1)}%`}
                  </span>
                  <span className="text-xs text-text-muted">
                    PF <strong className="text-text-primary">{r.profitFactor.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted mt-2 pt-2 border-t border-border/30">
                  <span>{r.tradeCount} trades</span>
                  <span>{r.winRate.toFixed(1)}% win</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Asset & Timeframe 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assets */}
        <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Performance by Asset
              </h3>
            </div>
            <span className="text-[11px] font-mono text-text-muted">Asset cross-validation</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {assets.map((a) => (
              <div
                key={a.asset}
                className="p-3 rounded bg-surface-2/60 border border-border/40 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">{a.asset}</span>
                  <span className="text-[10px] text-text-muted">{a.trades} trades</span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-base font-bold text-emerald-400">
                    +{a.returnPct.toFixed(1)}%
                  </span>
                  <span className="text-xs text-text-muted">
                    PF <strong className="text-text-primary">{a.profitFactor.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted mt-2 pt-2 border-t border-border/30">
                  <span>+${a.netPnl.toLocaleString()} P&L</span>
                  <span>{a.winRate.toFixed(1)}% win</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeframes */}
        <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Performance by Timeframe
              </h3>
            </div>
            <span className="text-[11px] font-mono text-text-muted">Resolution efficiency</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {timeframes.map((tf) => (
              <div
                key={tf.timeframe}
                className="p-2.5 rounded bg-surface-2/60 border border-border/40 flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-text-primary">{tf.timeframe}</span>
                <span className="text-base font-bold text-emerald-400 mt-1">
                  +{tf.returnPct.toFixed(1)}%
                </span>
                <div className="flex flex-col text-[10px] text-text-muted mt-1.5 pt-1.5 border-t border-border/30">
                  <span>PF {tf.profitFactor.toFixed(2)}</span>
                  <span>{tf.trades} trades</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
