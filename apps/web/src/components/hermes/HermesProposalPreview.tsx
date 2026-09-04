"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { TradeProposalDraft } from "@/lib/mockHermesData";
import { FileText, ArrowRight, ShieldCheck, CheckCircle, AlertTriangle, Eye } from "lucide-react";

interface HermesProposalPreviewProps {
  proposal: TradeProposalDraft;
  className?: string;
}

export function HermesProposalPreview({
  proposal,
  className = "",
}: HermesProposalPreviewProps) {
  // Allow toggling between default empty state and previewing proposal schema
  const [simulateActive, setSimulateActive] = useState(false);

  const isProposalActive = proposal.hasProposal || simulateActive;

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Structured Proposal Pipeline
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSimulateActive((prev) => !prev)}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline"
          >
            {simulateActive ? "Show Empty State" : "Simulate Ready Proposal"}
          </button>
        </div>
      </div>

      {/* Body: Conditional rendering */}
      {isProposalActive && proposal.symbol ? (
        <div className="p-4 space-y-4">
          {/* Proposal Meta Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded bg-surface-2/60 border border-border-color">
            <div className="flex items-center gap-2.5">
              <PositionSide side={proposal.side || "LONG"} size="sm" />
              <div>
                <span className="font-mono text-xs font-bold text-gray-100">
                  {proposal.symbol}
                </span>
                <span className="text-[10px] font-mono text-gray-400 ml-2">
                  ID: {proposal.proposalId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm">
                CONFIDENCE: {proposal.confidence}%
              </Badge>
              <Badge variant="warning" size="sm">
                AWAITING OWNER SIGN-OFF
              </Badge>
            </div>
          </div>

          {/* Pricing Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-bg-950 border border-cyan-500/30">
              <span className="text-[10px] text-gray-400 block uppercase">Entry Trigger</span>
              <span className="text-gray-100 font-bold">
                ${proposal.entryPrice?.toLocaleString()}
              </span>
            </div>

            <div className="p-2 rounded bg-bg-950 border border-loss/30">
              <span className="text-[10px] text-loss block uppercase">Stop Loss</span>
              <span className="text-loss font-bold">
                ${proposal.stopPrice?.toLocaleString()}
              </span>
            </div>

            <div className="p-2 rounded bg-bg-950 border border-profit/30">
              <span className="text-[10px] text-profit block uppercase">Take Profit</span>
              <span className="text-profit font-bold">
                ${proposal.targetPrice?.toLocaleString()}
              </span>
            </div>

            <div className="p-2 rounded bg-bg-950 border border-border-color">
              <span className="text-[10px] text-gray-400 block uppercase">Max Risk Sizing</span>
              <span className="text-gray-200 font-bold">
                {proposal.riskPct}% Portfolio
              </span>
            </div>
          </div>

          {/* Decision Pillars Flow: Evidence -> Strategy -> Risk -> Decision */}
          <div className="space-y-1.5 text-xs bg-bg-950/70 p-3 rounded border border-border-color">
            <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
              Autonomous Synthesis Breakdown
            </div>
            <div className="space-y-1 text-gray-300 text-[11px] font-sans">
              {proposal.supportingEvidence?.map((ev, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-profit shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </div>
              ))}
              {proposal.contradictingEvidence?.map((ev, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle size={12} className="text-warning shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Link to Workspace */}
          <div className="pt-1 flex justify-end">
            <Link
              href="/trade-proposals"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors group"
            >
              <span>Inspect in Proposals Workspace</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      ) : (
        /* Empty Calm State */
        <div className="py-10 px-4 text-center space-y-2.5">
          <div className="flex justify-center text-gray-600">
            <FileText size={32} />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase text-gray-300">
            No Active Proposals Queued
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans leading-relaxed">
            Trade proposals appear here when Hermes identifies a validated opportunity that clears all deterministic risk engine constraints.
          </p>
          <div className="pt-2 text-[10px] font-mono text-cyan-400/80 flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-profit" />
            <span>PIPELINE: EVIDENCE → STRATEGY → RISK → DECISION</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>EXECUTION AUTHORIZATION: OWNER SIGNING ONLY</span>
        <Link
          href="/trade-proposals"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group"
        >
          <span>PROPOSALS WORKSPACE</span>
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Surface>
  );
}
