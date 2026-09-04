"use client";

import React from "react";
import { Metric } from "@/components/ui/Metric";
import { Badge } from "@/components/ui/Badge";
import { RiskBadge } from "@/components/trading/RiskBadge";
import { PortfolioMetrics } from "@/lib/mockOverviewData";
import { Wallet, DollarSign, TrendingUp, BarChart3, PieChart, ShieldAlert } from "lucide-react";

interface PortfolioSummaryHeaderProps {
  metrics: PortfolioMetrics;
  className?: string;
}

export function PortfolioSummaryHeader({
  metrics,
  className = "",
}: PortfolioSummaryHeaderProps) {
  const formattedEquity = `$${metrics.totalEquity.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedAvailable = `$${metrics.availableBalance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedUnrealized = `${metrics.unrealizedPnL >= 0 ? "+" : ""}$${Math.abs(
    metrics.unrealizedPnL
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedRealized = `${metrics.realizedPnL30d >= 0 ? "+" : ""}$${Math.abs(
    metrics.realizedPnL30d
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${className}`}>
      {/* Total Equity */}
      <Metric
        label="Total Equity"
        value={formattedEquity}
        change={metrics.equityChangePct24h}
        changePeriod="24h"
        subtext={`+$${metrics.equityChange24h.toFixed(2)} today`}
        icon={<Wallet size={14} />}
        size="md"
      />

      {/* Available Balance */}
      <Metric
        label="Available Balance"
        value={formattedAvailable}
        subtext={`${((metrics.availableBalance / metrics.totalEquity) * 100).toFixed(1)}% free`}
        icon={<DollarSign size={14} />}
        size="md"
      />

      {/* Unrealized PnL */}
      <Metric
        label="Unrealized P&L"
        value={formattedUnrealized}
        change={metrics.unrealizedPnLPct}
        changePeriod="open"
        icon={<TrendingUp size={14} />}
        size="md"
        badge={
          <Badge variant={metrics.unrealizedPnL >= 0 ? "profit" : "loss"} size="sm">
            {metrics.unrealizedPnL >= 0 ? "PROFIT" : "LOSS"}
          </Badge>
        }
      />

      {/* Realized PnL (30D) */}
      <Metric
        label="Realized P&L"
        value={formattedRealized}
        change={metrics.realizedPnLPct30d}
        changePeriod="30D"
        subtext={`Win Rate: ${metrics.winRatePct}%`}
        icon={<BarChart3 size={14} />}
        size="md"
      />

      {/* Exposure */}
      <Metric
        label="Exposure"
        value={`${metrics.exposurePct}%`}
        subtext={`Cap: 50.0% max`}
        icon={<PieChart size={14} />}
        size="md"
        badge={
          <span className="text-[10px] font-mono text-gray-400">
            ${((metrics.totalEquity * metrics.exposurePct) / 100).toFixed(0)} active
          </span>
        }
      />

      {/* Drawdown */}
      <Metric
        label="Max Drawdown"
        value={`${metrics.maxDrawdownPct}%`}
        subtext="Limit: 5.0% max"
        icon={<ShieldAlert size={14} />}
        size="md"
        badge={<RiskBadge level="LOW" size="sm" showIcon={false} />}
      />
    </div>
  );
}
