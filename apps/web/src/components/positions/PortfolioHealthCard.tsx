"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { PortfolioHealthMetrics } from "@/lib/mockPositionsData";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface PortfolioHealthCardProps {
  health: PortfolioHealthMetrics;
  className?: string;
}

export function PortfolioHealthCard({
  health,
  className = "",
}: PortfolioHealthCardProps) {
  const isHealthy = health.status === "NORMAL";

  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={16}
            className={isHealthy ? "text-profit" : "text-warning"}
          />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Portfolio Health Snapshot
          </span>
        </div>
        <Badge variant={isHealthy ? "profit" : "warning"} size="sm">
          {health.status}
        </Badge>
      </div>

      {/* Grid of 4 Health Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {/* Exposure vs Limit */}
        <div className="p-2 rounded bg-bg-950 border border-border-color space-y-0.5">
          <span className="text-[10px] text-gray-500 uppercase block">
            Exposure
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-gray-100">
              {health.exposure.value}%
            </span>
            <span className="text-[10px] text-gray-500">
              max {health.exposure.limit}%
            </span>
          </div>
          <div className="text-[10px] text-profit font-semibold">
            {health.exposure.status}
          </div>
        </div>

        {/* Daily PnL vs Limit */}
        <div className="p-2 rounded bg-bg-950 border border-border-color space-y-0.5">
          <span className="text-[10px] text-gray-500 uppercase block">
            Daily P&L
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-profit">
              +{health.dailyPnl.value}%
            </span>
            <span className="text-[10px] text-gray-500">
              floor {health.dailyPnl.limit}%
            </span>
          </div>
          <div className="text-[10px] text-profit font-semibold">
            {health.dailyPnl.status}
          </div>
        </div>

        {/* Drawdown */}
        <div className="p-2 rounded bg-bg-950 border border-border-color space-y-0.5">
          <span className="text-[10px] text-gray-500 uppercase block">
            Max Drawdown
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-gray-100">
              {health.drawdown.value}%
            </span>
            <span className="text-[10px] text-gray-500">
              cap {health.drawdown.limit}%
            </span>
          </div>
          <div className="text-[10px] text-profit font-semibold">
            {health.drawdown.status}
          </div>
        </div>

        {/* Risk Utilization */}
        <div className="p-2 rounded bg-bg-950 border border-border-color space-y-0.5">
          <span className="text-[10px] text-gray-500 uppercase block">
            Risk Utilization
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-cyan-400">
              {health.riskUtilization}%
            </span>
            <span className="text-[10px] text-gray-500">
              {health.openPositionsCount} Pos
            </span>
          </div>
          <div className="text-[10px] text-gray-400">
            Within Guardrails
          </div>
        </div>
      </div>
    </Surface>
  );
}
