"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceIndicator } from "@/components/trading/ConfidenceIndicator";
import { InvestigationDetail } from "@/lib/mockHermesData";
import { Brain, Activity, Gauge, TrendingUp, BarChart2, Compass } from "lucide-react";

interface HermesInvestigationProps {
  investigation: InvestigationDetail;
  className?: string;
}

export function HermesInvestigation({
  investigation,
  className = "",
}: HermesInvestigationProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Current Investigation
          </span>
          <span className="px-1.5 py-0.2 rounded bg-bg-950 border border-border-color text-[10px] font-mono text-cyan-400 font-bold">
            {investigation.symbol}
          </span>
        </div>
        <Badge variant="cyan" size="sm" dot>
          ACTIVE EVALUATION
        </Badge>
      </div>

      {/* Investigation Details Body */}
      <div className="p-4 space-y-4">
        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">Structure</span>
            <span className="text-profit font-bold">{investigation.structure}</span>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">Momentum</span>
            <span className="text-gray-200 font-bold">{investigation.momentum}</span>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">Volatility</span>
            <span className="text-warning font-bold">{investigation.volatility}</span>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">Volume Delta</span>
            <span className="text-profit font-bold">{investigation.volume}</span>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">Market Regime</span>
            <span className="text-cyan-300 font-bold truncate block" title={investigation.regime}>
              {investigation.regime.split(" ")[0]}
            </span>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
            <span className="text-[10px] text-gray-400 uppercase block">Confidence</span>
            <ConfidenceIndicator score={investigation.confidence} size="sm" showBar={false} />
          </div>
        </div>

        {/* Structured Operational Assessment */}
        <div className="p-3.5 rounded bg-bg-950/80 border border-border-color space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Compass size={12} />
              <span>Hermes Operational Synthesis</span>
            </span>
            <span className="text-gray-400">NO CHAIN-OF-THOUGHT EXPOSED</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            &ldquo;{investigation.assessment}&rdquo;
          </p>
        </div>

        {/* Key Pivot Levels */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono p-2.5 rounded bg-surface-2/40 border border-border-color/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase">Support Level:</span>
            <span className="text-profit font-bold">
              ${investigation.keyLevels.support.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase">Daily Pivot:</span>
            <span className="text-gray-200 font-bold">
              ${investigation.keyLevels.pivot.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase">Resistance Level:</span>
            <span className="text-loss font-bold">
              ${investigation.keyLevels.resistance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Surface>
  );
}
