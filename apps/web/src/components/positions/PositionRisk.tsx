"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { PositionItem } from "@/lib/mockPositionsData";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PositionRiskProps {
  position: PositionItem;
  portfolioExposureTotal: number;
  className?: string;
}

export function PositionRisk({
  position,
  portfolioExposureTotal,
  className = "",
}: PositionRiskProps) {
  const isElevated = position.riskState === "ELEVATED";

  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Position Risk & Exposure Assessment
          </span>
        </div>
        <Badge variant={isElevated ? "warning" : "profit"} size="sm">
          {position.riskState} RISK
        </Badge>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded bg-bg-950 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Risk Per Trade</span>
          <span className="text-gray-200 font-bold text-sm">
            {position.riskPercent}% Portfolio
          </span>
        </div>

        <div className="p-2.5 rounded bg-bg-950 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Position Exposure</span>
          <span className="text-gray-200 font-bold text-sm">
            {position.exposurePercent}% Cap
          </span>
        </div>

        <div className="p-2.5 rounded bg-bg-950 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Portfolio Exposure</span>
          <span className="text-gray-200 font-bold text-sm">
            {portfolioExposureTotal}% Total
          </span>
        </div>

        <div className="p-2.5 rounded bg-bg-950 border border-loss/30">
          <span className="text-[10px] text-loss uppercase block">Distance to Stop</span>
          <span className="text-loss font-bold text-sm">
            {position.distanceToStopPercent}%
          </span>
        </div>

        <div className="p-2.5 rounded bg-bg-950 border border-profit/30">
          <span className="text-[10px] text-profit uppercase block">Distance to Target</span>
          <span className="text-profit font-bold text-sm">
            {position.distanceToTargetPercent}%
          </span>
        </div>

        <div className="p-2.5 rounded bg-bg-950 border border-border-color">
          <span className="text-[10px] text-gray-500 uppercase block">Strategy Model</span>
          <span className="text-cyan-400 font-bold text-sm truncate block">
            {position.strategy}
          </span>
        </div>
      </div>

      {/* Warning Callout when Elevated */}
      {isElevated && position.riskWarningReason && (
        <div className="p-2.5 rounded bg-warning-dim/20 border border-warning/40 text-xs text-warning flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div className="font-sans leading-relaxed">
            <span className="font-bold font-mono uppercase text-[10px] block">
              Risk Caution Triggered:
            </span>
            {position.riskWarningReason}
          </div>
        </div>
      )}
    </Surface>
  );
}
