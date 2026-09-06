"use client";

import React from "react";
import Link from "next/link";
import { EnvironmentBadge, Button } from "@/components";
import { RiskStatusBadge } from "./RiskStatusBadge";
import { RiskOverviewData } from "@/lib/mockRiskData";
import { Shield, ShieldAlert, ArrowUpRight, Lock } from "lucide-react";

interface RiskSummaryHeaderProps {
  overview: RiskOverviewData;
  onOpenSafetyModal?: () => void;
}

export function RiskSummaryHeader({
  overview,
  onOpenSafetyModal,
}: RiskSummaryHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border bg-background/50 backdrop-blur-sm pb-5 pt-1">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-text-primary font-mono">
                Risk Management
              </h1>
              <EnvironmentBadge mode="PAPER" />
              <RiskStatusBadge status={overview.status} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Deterministic portfolio protection, pre-execution checks, and quantitative exposure boundaries.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        {/* Metric Chips */}
        <div className="flex items-center gap-2 bg-surface-1 border border-border rounded px-3 py-1.5">
          <span className="text-text-muted">Portfolio Risk:</span>
          <span className="font-bold text-emerald-400">
            {overview.portfolioRisk.toFixed(1)}%
          </span>
          <span className="text-text-muted text-[11px]">/ {overview.maxPortfolioRisk.toFixed(1)}%</span>
        </div>

        <div className="flex items-center gap-2 bg-surface-1 border border-border rounded px-3 py-1.5">
          <span className="text-text-muted">Daily Loss:</span>
          <span className="font-bold text-text-primary">
            {overview.dailyLossPercent.toFixed(1)}%
          </span>
          <span className="text-text-muted text-[11px]">/ {overview.dailyLossLimitPercent.toFixed(1)}%</span>
        </div>

        <div className="flex items-center gap-2 bg-surface-1 border border-border rounded px-3 py-1.5">
          <span className="text-text-muted">Open Positions:</span>
          <span className="font-bold text-cyan-400">
            {overview.openPositionsCount}
          </span>
          <span className="text-text-muted text-[11px]">/ {overview.maxOpenPositions}</span>
        </div>

        {/* View Safety Controls */}
        {onOpenSafetyModal && (
          <Button
            variant="secondary"
            onClick={onOpenSafetyModal}
            className="text-xs font-mono py-1.5 px-3 flex items-center gap-1.5 border-border hover:border-cyan-500/40"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Safety State</span>
          </Button>
        )}
      </div>
    </div>
  );
}
