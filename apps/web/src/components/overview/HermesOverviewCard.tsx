"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/trading/RiskBadge";
import { ConfidenceIndicator } from "@/components/trading/ConfidenceIndicator";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";
import { AIActivityBadge } from "@/components/ai/AIActivityBadge";
import { HermesOverviewState } from "@/lib/mockOverviewData";
import { HermesCoreVisual } from "./HermesCoreVisual";
import { Bot, ArrowRight, Brain, Clock, ShieldCheck, Target } from "lucide-react";

interface HermesOverviewCardProps {
  hermes: HermesOverviewState;
  className?: string;
}

export function HermesOverviewCard({
  hermes,
  className = "",
}: HermesOverviewCardProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col justify-between border-cyan-500/30 bg-surface shadow-[0_0_20px_rgba(0,229,255,0.06)] overflow-hidden ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/60">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-cyan-400" />
          <span className="text-xs font-bold text-gray-100 font-mono tracking-wider uppercase">
            HERMES COGNITIVE LAYER
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 hidden sm:inline">
            v3.2
          </span>
        </div>
        <AIStatusIndicator state={hermes.state} size="sm" />
      </div>

      {/* Main Intelligence Body */}
      <div className="p-4 space-y-4">
        {/* Core Visual + Focus & Regime Row */}
        <div className="flex items-start gap-4">
          <HermesCoreVisual state={hermes.state} size={54} />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                Current Focus
              </span>
              <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                <Clock size={11} />
                {hermes.lastActiveTimestamp}
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-cyan-300 truncate">
              {hermes.focusAsset}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-surface-2 border border-border-color font-mono text-[10px] text-gray-300">
                {hermes.marketRegime}
              </span>
              <RiskBadge level={hermes.riskState} size="sm" />
            </div>
          </div>
        </div>

        {/* Latest Observation Card */}
        <div className="p-3 rounded bg-bg-950/80 border border-border-color space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center gap-1 text-cyan-400 font-bold uppercase tracking-wider">
              <Brain size={12} />
              <span>Latest Intelligence</span>
            </span>
            <span className="text-gray-500 font-semibold">SIGNAL CONFIRMED</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            &ldquo;{hermes.latestObservation}&rdquo;
          </p>
        </div>

        {/* Confidence & Activity Breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-gray-500">
              Confidence Score
            </span>
            <div className="mt-1">
              <ConfidenceIndicator score={hermes.confidenceScore} />
            </div>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border-color flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-gray-500">
              Active Task
            </span>
            <div className="mt-1 truncate">
              <AIActivityBadge activity={hermes.latestActivity} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation CTA */}
      <div className="px-4 py-2.5 border-t border-border-color bg-surface-2/30 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400">
          AUTONOMOUS RISK INTERLOCK: LOCKED
        </span>
        <Link href="/hermes">
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight size={12} />}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px]"
          >
            HERMES TERMINAL
          </Button>
        </Link>
      </div>
    </Surface>
  );
}
