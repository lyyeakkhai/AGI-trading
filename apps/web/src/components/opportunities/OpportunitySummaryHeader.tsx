"use client";

import React from "react";
import Link from "next/link";
import { Metric } from "@/components/ui/Metric";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HermesCore } from "@/components/hermes/HermesCore";
import {
  OpportunitySummaryMetrics,
  HermesOpportunityScannerState,
} from "@/lib/mockOpportunitiesData";
import { Zap, Bot, ArrowRight, Activity, Radar, Clock } from "lucide-react";

interface OpportunitySummaryHeaderProps {
  metrics: OpportunitySummaryMetrics;
  scannerState: HermesOpportunityScannerState;
  className?: string;
}

export function OpportunitySummaryHeader({
  metrics,
  scannerState,
  className = "",
}: OpportunitySummaryHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Page Title & Live Hermes Scanner Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg bg-surface border border-border-color">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded bg-bg-950 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <Radar size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-gray-100">
                Opportunities
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-cyan-dim/30 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                RADAR
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans">
              AI-detected market setups requiring operational evaluation.
            </p>
          </div>
        </div>

        {/* Live Hermes Opportunity Surveillance Banner */}
        <div className="flex flex-wrap items-center gap-3 p-2.5 rounded bg-bg-950 border border-cyan-500/30 text-xs font-mono">
          <HermesCore state="monitoring" size="sm" />
          <div className="flex flex-col min-w-[200px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-cyan-300 text-[11px]">
                HERMES SURVEILLANCE
              </span>
              <span className="text-[10px] text-gray-400">
                Scan: {scannerState.lastScan}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 truncate">
              {scannerState.marketsScanned} Markets Active • {scannerState.potentialSetups} Setups In Buffer
            </span>
          </div>

          <Link href="/hermes">
            <Button
              variant="ghost"
              size="xs"
              rightIcon={<ArrowRight size={12} />}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[10px]"
            >
              HERMES
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg bg-surface border border-border-color space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Active Setups
          </span>
          <div className="font-mono text-2xl font-bold text-gray-100">
            {metrics.activeOpportunities}
          </div>
          <span className="text-[10px] font-mono text-cyan-400 block">
            Across 3 markets
          </span>
        </div>

        <div className="p-3 rounded-lg bg-surface border border-cyan-500/30 space-y-1 shadow-[0_0_12px_rgba(0,229,255,0.04)]">
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
            High Confidence
          </span>
          <div className="font-mono text-2xl font-bold text-cyan-300">
            {metrics.highConfidenceCount}
          </div>
          <span className="text-[10px] font-mono text-gray-400 block">
            &gt; 70% Conviction
          </span>
        </div>

        <div className="p-3 rounded-lg bg-surface border border-border-color space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Under Investigation
          </span>
          <div className="font-mono text-2xl font-bold text-gray-100">
            {metrics.underInvestigationCount}
          </div>
          <span className="text-[10px] font-mono text-gray-400 block">
            Evaluating evidence
          </span>
        </div>

        <div className="p-3 rounded-lg bg-surface border border-border-color space-y-1">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            New Today
          </span>
          <div className="font-mono text-2xl font-bold text-profit">
            +{metrics.newTodayCount}
          </div>
          <span className="text-[10px] font-mono text-gray-400 block">
            Since 00:00 UTC
          </span>
        </div>

        <div className="p-3 rounded-lg bg-surface border border-border-color space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Avg Confidence
          </span>
          <div className="font-mono text-2xl font-bold text-gray-100">
            {metrics.averageConfidence}%
          </div>
          <span className="text-[10px] font-mono text-cyan-400 block">
            Calculated mean
          </span>
        </div>
      </div>
    </div>
  );
}
