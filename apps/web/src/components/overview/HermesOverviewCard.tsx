"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/features/trading/components/RiskBadge";
import { ConfidenceIndicator } from "@/features/trading/components/ConfidenceIndicator";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";
import { AIActivityBadge } from "@/components/ai/AIActivityBadge";
import { HermesOverviewState } from "@/lib/mockOverviewData";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
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
      variant="iron"
      padded="none"
      className={`flex flex-col justify-between border-[#242D35] border-t-[#384652] shadow-[0_0_24px_rgba(0,229,255,0.06)] overflow-hidden ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 iron-header">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-cyan-400" />
          <span className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            HERMES COGNITIVE LAYER
          </span>
          <span className="text-xs font-mono text-cyan-400/90 hidden sm:inline">
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
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Current Focus
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={11} />
                {hermes.lastActiveTimestamp}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono tabular-nums text-xs font-bold text-cyan-300 truncate">
              <CryptoIcon symbol={hermes.focusAsset} size="sm" />
              {hermes.focusAsset}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-iron-900 border border-iron-700/60 text-xs text-gray-300">
                {hermes.marketRegime}
              </span>
              <RiskBadge level={hermes.riskState} size="sm" />
            </div>
          </div>
        </div>

        {/* Latest Observation Card */}
        <div className="p-3 rounded iron-inset space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-cyan-400 font-bold uppercase tracking-wider">
              <Brain size={12} />
              <span>Latest Intelligence</span>
            </span>
            <span className="text-gray-400 font-semibold text-[11px] tracking-wide">SIGNAL CONFIRMED</span>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed font-sans">
            &ldquo;{hermes.latestObservation}&rdquo;
          </p>
        </div>

        {/* Confidence & Activity Breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 rounded iron-inset flex flex-col justify-between">
            <span className="text-xs uppercase text-gray-400 font-medium">
              Confidence Score
            </span>
            <div className="mt-1">
              <ConfidenceIndicator score={hermes.confidenceScore} />
            </div>
          </div>

          <div className="p-2.5 rounded iron-inset flex flex-col justify-between">
            <span className="text-xs uppercase text-gray-400 font-medium">
              Active Task
            </span>
            <div className="mt-1 truncate">
              <AIActivityBadge activity={hermes.latestActivity} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation CTA */}
      <div className="px-4 py-2.5 border-t border-[#222B32] bg-iron-950/70 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono tracking-tight">
          AUTONOMOUS RISK INTERLOCK: LOCKED
        </span>
        <Link href="/hermes">
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight size={12} />}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
          >
            HERMES TERMINAL
          </Button>
        </Link>
      </div>
    </Surface>
  );
}
