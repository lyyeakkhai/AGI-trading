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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 bg-background/50 backdrop-blur-sm pb-5 pt-1">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl shadow-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 font-sans tracking-tight">
                Risk Management
              </h1>
              <EnvironmentBadge mode="PAPER" />
              <RiskStatusBadge status={overview.status} />
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Deterministic portfolio protection, pre-execution checks, and quantitative exposure boundaries.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 font-sans tracking-tight text-xs">
        {/* Metric Chips */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-1.5">
          <span className="text-gray-500 dark:text-zinc-400">Portfolio Risk:</span>
          <span className="font-bold text-emerald-400">
            {overview.portfolioRisk.toFixed(1)}%
          </span>
          <span className="text-gray-500 dark:text-zinc-400 text-xs">/ {overview.maxPortfolioRisk.toFixed(1)}%</span>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-1.5">
          <span className="text-gray-500 dark:text-zinc-400">Daily Loss:</span>
          <span className="font-bold text-gray-900 dark:text-zinc-50">
            {overview.dailyLossPercent.toFixed(1)}%
          </span>
          <span className="text-gray-500 dark:text-zinc-400 text-xs">/ {overview.dailyLossLimitPercent.toFixed(1)}%</span>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-1.5">
          <span className="text-gray-500 dark:text-zinc-400">Open Positions:</span>
          <span className="font-bold text-cyan-400">
            {overview.openPositionsCount}
          </span>
          <span className="text-gray-500 dark:text-zinc-400 text-xs">/ {overview.maxOpenPositions}</span>
        </div>

        {/* View Safety Controls */}
        {onOpenSafetyModal && (
          <Button
            variant="secondary"
            onClick={onOpenSafetyModal}
            className="text-xs font-sans tracking-tight py-1.5 px-3 flex items-center gap-1.5 border-gray-200 dark:border-white/5 hover:border-cyan-500/40"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Safety State</span>
          </Button>
        )}
      </div>
    </div>
  );
}
