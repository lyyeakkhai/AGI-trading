"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { PnLDisplay } from "@/components/trading/PnLDisplay";
import { PortfolioSummaryMetrics } from "@/lib/mockPositionsData";
import { DollarSign, PieChart, ShieldCheck, Activity } from "lucide-react";

interface PortfolioSummaryHeaderProps {
  metrics: PortfolioSummaryMetrics;
  openCount: number;
}

export function PortfolioSummaryHeader({
  metrics,
  openCount,
}: PortfolioSummaryHeaderProps) {
  return (
    <div className="space-y-3">
      {/* 1. Page Title & Terminal State Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border-color">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-gray-100 font-sans">
              Positions
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-2 border border-border-color text-cyan-400 font-medium">
              {openCount} ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Open positions and real-time portfolio exposure across monitored assets.
          </p>
        </div>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="cyan" size="md">
            PAPER MODE
          </Badge>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-2 border border-border-color text-[11px] font-mono text-gray-300">
            <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            <span className="font-semibold text-gray-200">PORTFOLIO ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 2. Compact Financial Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {/* Portfolio Value */}
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Portfolio Value
          </span>
          <div className="text-sm sm:text-base font-mono font-bold text-gray-100">
            ${metrics.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Surface>

        {/* Available Capital */}
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Available Capital
          </span>
          <div className="text-sm sm:text-base font-mono font-bold text-gray-200">
            ${metrics.availableCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Surface>

        {/* Invested Capital */}
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Invested Capital
          </span>
          <div className="text-sm sm:text-base font-mono font-bold text-cyan-400">
            ${metrics.investedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Surface>

        {/* Unrealized P&L */}
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Unrealized P&L
          </span>
          <div className="text-sm sm:text-base font-mono">
            <PnLDisplay
              amount={metrics.unrealizedPnl}
              percentage={metrics.unrealizedPnlPercent}
              size="md"
            />
          </div>
        </Surface>

        {/* Realized P&L */}
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Realized P&L
          </span>
          <div className="text-sm sm:text-base font-mono">
            <PnLDisplay
              amount={metrics.realizedPnl}
              percentage={metrics.realizedPnlPercent}
              size="md"
            />
          </div>
        </Surface>

        {/* Total Exposure */}
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Total Exposure
          </span>
          <div className="text-sm sm:text-base font-mono font-bold text-gray-100 flex items-baseline gap-1">
            <span>{metrics.totalExposure}%</span>
            <span className="text-[10px] font-normal text-gray-400">of cap</span>
          </div>
        </Surface>

        {/* Today's P&L */}
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Today&apos;s P&L
          </span>
          <div className="text-sm sm:text-base font-mono">
            <PnLDisplay
              amount={metrics.todayPnl}
              percentage={metrics.todayPnlPercent}
              size="md"
            />
          </div>
        </Surface>
      </div>
    </div>
  );
}
