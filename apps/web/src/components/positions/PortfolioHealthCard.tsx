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
    <div className={`bg-black border border-zinc-800 p-4 h-full flex flex-col justify-center space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black uppercase tracking-widest text-zinc-100">
            SYS_HEALTH
          </span>
        </div>
        <div className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border ${
          isHealthy ? "bg-green-950 border-green-900 text-green-500" : "bg-red-950 border-red-900 text-red-500"
        }`}>
          {health.status}
        </div>
      </div>

      {/* Grid of 4 Health Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {/* Exposure vs Limit */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
            EXPOSURE
          </span>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-mono font-black text-zinc-100 tracking-tight">
                {health.exposure.value}%
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-600 tracking-widest">
                MAX_{health.exposure.limit}%
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">
              {health.exposure.status}
            </div>
          </div>
        </div>

        {/* Daily PnL vs Limit */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
            DLY_PNL
          </span>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-mono font-black text-green-500 tracking-tight">
                +{health.dailyPnl.value}%
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-600 tracking-widest">
                FLR_{health.dailyPnl.limit}%
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">
              {health.dailyPnl.status}
            </div>
          </div>
        </div>

        {/* Drawdown */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
            MAX_DD
          </span>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-mono font-black text-zinc-100 tracking-tight">
                {health.drawdown.value}%
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-600 tracking-widest">
                CAP_{health.drawdown.limit}%
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">
              {health.drawdown.status}
            </div>
          </div>
        </div>

        {/* Risk Utilization */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
            RISK_UTIL
          </span>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-mono font-black text-cyan-500 tracking-tight">
                {health.riskUtilization}%
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-600 tracking-widest">
                {health.openPositionsCount}_POS
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              NOMINAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
