"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/trading/RiskBadge";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { RiskStatusSummary } from "@/lib/mockOverviewData";
import { Shield, ArrowRight, CheckCircle2, Lock } from "lucide-react";

interface RiskStatusWidgetProps {
  risk: RiskStatusSummary;
  className?: string;
}

export function RiskStatusWidget({ risk, className = "" }: RiskStatusWidgetProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/40">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-profit" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Deterministic Risk Engine
          </span>
          <Badge variant="profit" size="sm" dot>
            {risk.riskEngineState}
          </Badge>
        </div>
        <Link href="/risk">
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight size={12} />}
            className="text-gray-400 hover:text-cyan-400 font-mono text-[11px]"
          >
            RISK DASHBOARD
          </Button>
        </Link>
      </div>

      {/* Body Grid */}
      <div className="p-4 space-y-3.5">
        {/* Top Status Badges */}
        <div className="flex items-center justify-between p-2 rounded bg-surface-2/60 border border-border-color">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-gray-400">
              System Risk Status:
            </span>
            <RiskBadge level={risk.overallRisk} size="sm" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-profit">
            <Lock size={12} />
            <span className="font-bold">INTERLOCK {risk.interlockStatus}</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {/* Exposure */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-400 uppercase">Capital Exposure</span>
              <span className="text-gray-200 font-semibold">
                {risk.currentExposurePct}% / {risk.maxExposureCapPct}% Cap
              </span>
            </div>
            <ProgressIndicator
              value={risk.currentExposurePct}
              max={risk.maxExposureCapPct}
              variant="cyan"
              size="sm"
            />
          </div>

          {/* Daily Loss */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-400 uppercase">Daily Loss Utilized</span>
              <span className="text-gray-200 font-semibold">
                {risk.dailyLossCurrentPct}% / {risk.dailyLossCapPct}% Max
              </span>
            </div>
            <ProgressIndicator
              value={risk.dailyLossCurrentPct}
              max={risk.dailyLossCapPct}
              variant={risk.dailyLossCurrentPct > 2.0 ? "warning" : "profit"}
              size="sm"
            />
          </div>

          {/* Max Drawdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-400 uppercase">Max Trailing Drawdown</span>
              <span className="text-gray-200 font-semibold">
                {risk.maxDrawdownCurrentPct}% / {risk.maxDrawdownCapPct}% Cap
              </span>
            </div>
            <ProgressIndicator
              value={risk.maxDrawdownCurrentPct}
              max={risk.maxDrawdownCapPct}
              variant="profit"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-500 flex items-center justify-between">
        <span>MARGIN HEALTH: {risk.marginHealthScore}/100</span>
        <span className="text-profit flex items-center gap-1">
          <CheckCircle2 size={11} />
          PRE-TRADE RULES ACTIVE
        </span>
      </div>
    </Surface>
  );
}
