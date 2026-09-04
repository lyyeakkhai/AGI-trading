"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { RiskBadge } from "@/components/trading/RiskBadge";
import { OpportunityConfidence } from "./OpportunityConfidence";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityItem } from "@/lib/mockOpportunitiesData";
import {
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  Compass,
  ArrowRight,
  TrendingUp,
  Target,
  FileText,
  Clock,
  Briefcase,
  Bot,
} from "lucide-react";

interface OpportunityDetailDrawerProps {
  opportunity: OpportunityItem;
  onClose: () => void;
  className?: string;
}

export function OpportunityDetailDrawer({
  opportunity,
  onClose,
  className = "",
}: OpportunityDetailDrawerProps) {
  const isPositive = opportunity.change24h >= 0;
  const marketUrl = `/markets/${opportunity.symbol.replace("/", "-")}`;

  // Lifecycle stage progression indexing
  const stages = [
    { id: "detected", label: "Detected" },
    { id: "monitoring", label: "Monitoring" },
    { id: "investigating", label: "Investigating" },
    { id: "confirmed", label: "Confirmed" },
    { id: "proposal_pending", label: "Trade Proposal" },
  ];

  const currentStageIndex = stages.findIndex(
    (s) => s.id === opportunity.lifecycleStage
  );

  return (
    <div
      className={`flex flex-col bg-surface border-l border-border-color shadow-2xl h-full overflow-y-auto ${className}`}
    >
      {/* 1. Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-border-color bg-surface-2/60 sticky top-0 z-10 backdrop-blur select-none">
        <div className="flex items-center gap-2.5">
          <PositionSide side={opportunity.direction} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-bold text-gray-100">
                {opportunity.symbol}
              </h2>
              <span className="px-1.5 py-0.2 rounded bg-bg-950 border border-border-color text-[10px] font-mono text-cyan-400 font-bold">
                {opportunity.timeframe}
              </span>
            </div>
            <span className="text-xs text-gray-400 font-sans">
              {opportunity.setup}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OpportunityStatusBadge status={opportunity.status} size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-bg-950 border border-border-color text-gray-400 hover:text-gray-200 transition-colors"
            title="Close Detail Drawer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 2. Body Details */}
      <div className="p-4 space-y-5">
        {/* Confidence & Conviction Bar */}
        <div className="p-3.5 rounded-lg bg-bg-950 border border-cyan-500/30 space-y-2 shadow-[0_0_15px_rgba(0,229,255,0.04)]">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="uppercase tracking-wider text-cyan-400 font-bold">
              Opportunity Signal Conviction
            </span>
            <span className="text-gray-400">DETECTED {opportunity.detectedAt}</span>
          </div>
          <OpportunityConfidence score={opportunity.confidence} size="md" />
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1">
            <span>Market Regime: {opportunity.marketRegime}</span>
            <span>Risk State: {opportunity.riskState}</span>
          </div>
        </div>

        {/* Opportunity Lifecycle Flow */}
        <div className="space-y-1.5 bg-surface-2/40 p-3 rounded-lg border border-border-color">
          <div className="text-[10px] font-mono uppercase text-gray-400 font-semibold">
            Opportunity Lifecycle Status
          </div>
          <div className="flex items-center justify-between gap-1 text-[10px] font-mono pt-1">
            {stages.map((stg, idx) => {
              const isPastOrCurrent = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isLastTask7 = idx === stages.length - 1;

              return (
                <div key={stg.id} className="flex-1 flex flex-col items-center gap-1 text-center">
                  <div
                    className={`w-full h-1 rounded-full transition-colors ${
                      isCurrent
                        ? "bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                        : isPastOrCurrent
                        ? "bg-cyan-500/60"
                        : "bg-gray-800"
                    }`}
                  />
                  <span
                    className={`truncate text-[9px] ${
                      isCurrent
                        ? "text-cyan-300 font-bold"
                        : isPastOrCurrent
                        ? "text-gray-300"
                        : "text-gray-600"
                    } ${isLastTask7 ? "italic" : ""}`}
                  >
                    {stg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Context & Targets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-400">
            <span>Market & Target Context</span>
            <Link
              href={marketUrl}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Inspect Chart</span>
              <ExternalLink size={10} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
              <span className="text-[10px] text-gray-400 uppercase block">Mark Price</span>
              <span className="text-gray-100 font-bold text-sm">
                ${opportunity.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`text-[10px] block font-semibold ${
                  isPositive ? "text-profit" : "text-loss"
                }`}
              >
                {isPositive ? "+" : ""}
                {opportunity.change24h.toFixed(2)}%
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
              <span className="text-[10px] text-gray-400 uppercase block">Est. Risk/Reward</span>
              <span className="text-cyan-300 font-bold text-sm">
                {opportunity.riskReward}
              </span>
              <span className="text-[10px] text-gray-400 block truncate">
                Target: ${opportunity.targetPriceEst.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
              <span className="text-[10px] text-gray-400 uppercase block">Stop Distance</span>
              <span className="text-loss font-bold">
                ${opportunity.stopLossEst.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-2/60 border border-border-color">
              <span className="text-[10px] text-gray-400 uppercase block">Volume State</span>
              <span className="text-gray-300 font-medium text-[11px] truncate block">
                {opportunity.volumeState}
              </span>
            </div>
          </div>
        </div>

        {/* Supporting Evidence Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-profit font-bold">
            <CheckCircle2 size={13} />
            <span>Supporting Observable Evidence ({opportunity.supportingEvidence.length})</span>
          </div>

          <div className="space-y-1.5">
            {opportunity.supportingEvidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-bg-950 border border-border-color space-y-0.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-200 font-semibold">{ev.signal}</span>
                  <span className="text-profit font-bold">{ev.value}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  {ev.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contradicting Evidence Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-warning font-bold">
            <AlertCircle size={13} />
            <span>Contradicting Evidence & Barriers ({opportunity.contradictingEvidence.length})</span>
          </div>

          <div className="space-y-1.5">
            {opportunity.contradictingEvidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-bg-950 border border-border-color space-y-0.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-200 font-semibold">{ev.signal}</span>
                  <span className="text-warning font-bold">{ev.value}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  {ev.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hermes Operational Assessment */}
        <div className="p-3.5 rounded-lg bg-bg-950 border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Bot size={13} />
              <span>Hermes Synthesis</span>
            </span>
            <span className="text-gray-400">STRUCTURED ASSESSMENT</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            &ldquo;{opportunity.hermesAssessment}&rdquo;
          </p>
        </div>

        {/* Trade Proposal Boundary Notification */}
        <div className="p-3 rounded-lg bg-surface-2/80 border border-border-hi space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-gray-400 uppercase font-semibold">
              Downstream Proposal Pipeline
            </span>
            <span className="text-cyan-400">TASK 07 SCOPE</span>
          </div>
          <p className="text-gray-300 text-[11px] font-sans leading-relaxed">
            An opportunity represents an identified market edge. When confirmation criteria are satisfied, Hermes advances the setup to a structured Trade Proposal with deterministic risk engine sign-off.
          </p>
          <div className="pt-1 flex items-center justify-between">
            <Link href="/trade-proposals">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FileText size={13} />}
                className="text-xs font-mono"
              >
                VIEW PROPOSALS
              </Button>
            </Link>
            <Link href="/hermes">
              <Button
                variant="ghost"
                size="xs"
                rightIcon={<ArrowRight size={12} />}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px]"
              >
                HERMES LOGS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
