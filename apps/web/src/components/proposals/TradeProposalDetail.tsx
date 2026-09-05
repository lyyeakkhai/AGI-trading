"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { OpportunityConfidence } from "@/components/opportunities/OpportunityConfidence";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { ProposalPriceLevels } from "./ProposalPriceLevels";
import { ProposalLifecycle } from "./ProposalLifecycle";
import { ProposalRiskValidation } from "./ProposalRiskValidation";
import { TradeProposalItem } from "@/lib/mockTradeProposalsData";
import {
  X,
  Bot,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  FileCheck,
  FileX,
  Info,
  GitMerge,
} from "lucide-react";

interface TradeProposalDetailProps {
  proposal: TradeProposalItem;
  onClose: () => void;
  onRequestApprove: (proposal: TradeProposalItem) => void;
  onRequestReject: (proposal: TradeProposalItem) => void;
  className?: string;
}

export function TradeProposalDetail({
  proposal,
  onClose,
  onRequestApprove,
  onRequestReject,
  className = "",
}: TradeProposalDetailProps) {
  const isAwaitingApproval =
    proposal.status === "Awaiting Approval" && proposal.riskDecision === "APPROVED";
  const isRiskRejected = proposal.riskDecision === "REJECTED";
  const isOwnerApproved = proposal.ownerApprovalStatus === "APPROVED";
  const isOwnerRejected = proposal.ownerApprovalStatus === "REJECTED";

  const marketUrl = `/markets/${proposal.symbol.replace("/", "-")}`;

  return (
    <div
      className={`flex flex-col bg-surface border-l border-border-color shadow-2xl h-full overflow-y-auto ${className}`}
    >
      {/* 1. Header Strip */}
      <div className="flex items-center justify-between p-4 border-b border-border-color bg-surface-2/60 sticky top-0 z-10 backdrop-blur select-none">
        <div className="flex items-center gap-3">
          <PositionSide side={proposal.direction} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-bold text-gray-100">
                {proposal.symbol}
              </h2>
              <span className="px-1.5 py-0.2 rounded bg-bg-950 border border-border-color text-[10px] font-mono text-cyan-400 font-bold">
                {proposal.timeframe}
              </span>
            </div>
            <span className="text-xs text-gray-400 font-sans">
              {proposal.strategy} ({proposal.strategyVersion})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ProposalStatusBadge status={proposal.status} size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-bg-950 border border-border-color text-gray-400 hover:text-gray-200 transition-colors"
            title="Close proposal detail"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="p-4 space-y-5">
        {/* Decision Summary Hero Card */}
        <div className="p-3.5 rounded-lg bg-bg-950 border border-cyan-500/30 space-y-2.5 shadow-[0_0_15px_rgba(0,229,255,0.04)] font-mono text-xs">
          <div className="flex items-center justify-between text-[10px]">
            <span className="uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Bot size={13} />
              <span>Hermes Operational Decision Summary</span>
            </span>
            <span className="text-gray-400">CREATED {proposal.createdAt}</span>
          </div>

          <p className="text-xs text-gray-200 leading-relaxed font-sans font-medium">
            Hermes proposes a <strong>{proposal.direction}</strong> position on{" "}
            <strong>{proposal.symbol}</strong> using <strong>{proposal.strategy}</strong>.
          </p>

          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            &ldquo;{proposal.hermesAssessment}&rdquo;
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-color/60 text-[10px]">
            <div>
              <span className="text-gray-500 block uppercase">Confidence</span>
              <span className="text-cyan-300 font-bold text-xs">
                {proposal.confidence}% High
              </span>
            </div>
            <div>
              <span className="text-gray-500 block uppercase">Risk Sizing</span>
              <span className="text-gray-200 font-bold text-xs">
                {proposal.riskPercent}% Port
              </span>
            </div>
            <div>
              <span className="text-gray-500 block uppercase">Risk Engine</span>
              <span
                className={`font-bold text-xs ${
                  proposal.riskDecision === "APPROVED"
                    ? "text-profit"
                    : "text-loss"
                }`}
              >
                {proposal.riskDecision}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block uppercase">Owner Approval</span>
              <span className="text-warning font-bold text-xs">
                {proposal.ownerApprovalStatus === "APPROVED"
                  ? "AUTHORIZED"
                  : proposal.ownerApprovalStatus === "REJECTED"
                  ? "REJECTED"
                  : "REQUIRED"}
              </span>
            </div>
          </div>
        </div>

        {/* Expiration Notice if Stale */}
        <div className="flex items-center justify-between text-[11px] font-mono p-2.5 rounded bg-surface-2/40 border border-border-color/60">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Clock size={13} className="text-cyan-400" />
            <span>Validity Window: {proposal.expiresAt}</span>
          </div>
          {proposal.isExpired && (
            <span className="text-loss font-bold uppercase text-[10px]">
              PROPOSAL EXPIRED
            </span>
          )}
        </div>

        {/* Lifecycle Stepper */}
        <ProposalLifecycle
          currentStage={proposal.lifecycleStage}
          isRejected={isRiskRejected || isOwnerRejected}
        />

        {/* Price & Level Structure Ladder */}
        <ProposalPriceLevels proposal={proposal} />

        {/* Owner Authorization Action Section */}
        <div className="p-4 rounded-lg bg-surface-2 border border-border-hi space-y-3 select-none">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-400">
            <span>Owner Authorization Action</span>
            <span className="text-cyan-400 font-bold">HUMAN-IN-THE-LOOP</span>
          </div>

          {isAwaitingApproval && (
            <div className="space-y-2">
              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                Deterministic Risk Engine has verified all 7 risk constraints.
                Owner sign-off is required before execution routing is unlocked.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRequestApprove(proposal)}
                  leftIcon={<FileCheck size={14} />}
                  className="font-mono text-xs flex-1"
                >
                  APPROVE PROPOSAL
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRequestReject(proposal)}
                  leftIcon={<FileX size={14} />}
                  className="font-mono text-xs flex-1"
                >
                  REJECT PROPOSAL
                </Button>
              </div>
            </div>
          )}

          {isRiskRejected && (
            <div className="p-3 rounded bg-loss-dim/20 border border-loss/40 text-loss text-xs space-y-1">
              <span className="font-mono font-bold uppercase block text-[10px]">
                Owner Approval Blocked
              </span>
              <p className="font-sans leading-relaxed text-[11px] text-gray-300">
                This proposal failed deterministic risk checks ({proposal.riskRejectionReason}).
                Owner authorization is locked out by safety interlocks.
              </p>
            </div>
          )}

          {isOwnerApproved && (
            <div className="p-3 rounded bg-profit-dim/30 border border-profit/50 text-profit text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-mono font-bold uppercase text-[10px]">
                <CheckCircle2 size={13} />
                <span>Authorized by Owner</span>
              </div>
              <p className="font-sans leading-relaxed text-[11px] text-gray-200">
                Proposal authorized at {proposal.approvalTimestamp || "12:47:03 UTC"}.
                Ready for downstream execution bridge routing (Task 08+ scope).
              </p>
            </div>
          )}

          {isOwnerRejected && (
            <div className="p-3 rounded bg-loss-dim/20 border border-loss/40 text-loss text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-mono font-bold uppercase text-[10px]">
                <AlertCircle size={13} />
                <span>Rejected by Owner</span>
              </div>
              <p className="font-sans leading-relaxed text-[11px] text-gray-300">
                Reason: &ldquo;{proposal.rejectionReason || "Owner declined authorization."}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Strategy Specification */}
        <div className="p-3.5 rounded-lg bg-surface-2/50 border border-border-color space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <GitMerge size={12} />
              <span>Strategy Specification: {proposal.strategy}</span>
            </span>
            <span>{proposal.strategyVersion}</span>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1">
            <div>
              <span className="text-gray-500 uppercase text-[10px] block">
                Entry Trigger Condition:
              </span>
              <span className="text-gray-200 font-sans">
                {proposal.strategySpec.entryCondition}
              </span>
            </div>

            <div>
              <span className="text-gray-500 uppercase text-[10px] block">
                Invalidation Level:
              </span>
              <span className="text-loss font-sans">
                {proposal.strategySpec.invalidation}
              </span>
            </div>

            <div>
              <span className="text-gray-500 uppercase text-[10px] block">
                Target Logic & Sizing:
              </span>
              <span className="text-profit font-sans">
                {proposal.strategySpec.targetLogic}
              </span>
            </div>

            <div>
              <span className="text-gray-500 uppercase text-[10px] block">
                Execution Mode:
              </span>
              <span className="text-gray-300 font-sans">
                {proposal.strategySpec.executionMode}
              </span>
            </div>
          </div>
        </div>

        {/* Deterministic Risk Validation Section */}
        <ProposalRiskValidation
          decision={proposal.riskDecision}
          checks={proposal.riskChecks}
          rejectionReason={proposal.riskRejectionReason}
        />

        {/* Supporting Observable Evidence */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-profit font-bold">
            <CheckCircle2 size={13} />
            <span>Supporting Observable Evidence ({proposal.supportingEvidence.length})</span>
          </div>

          <div className="space-y-1.5">
            {proposal.supportingEvidence.map((ev, idx) => (
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

        {/* Contradicting Evidence & Potential Risks */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-warning font-bold">
            <AlertCircle size={13} />
            <span>Contradicting Evidence & Headwinds ({proposal.contradictingEvidence.length})</span>
          </div>

          <div className="space-y-1.5">
            {proposal.contradictingEvidence.map((ev, idx) => (
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

        {/* Cross Navigation Footers */}
        <div className="p-3 rounded-lg bg-surface-2/40 border border-border-color/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <Link
            href={marketUrl}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Inspect Chart</span>
            <ExternalLink size={11} />
          </Link>

          <Link
            href="/opportunities"
            className="text-gray-400 hover:text-gray-200 flex items-center gap-1"
          >
            <span>Opportunities</span>
            <ArrowRight size={11} />
          </Link>

          <Link
            href="/hermes"
            className="text-gray-400 hover:text-gray-200 flex items-center gap-1"
          >
            <span>Hermes Agent</span>
            <ArrowRight size={11} />
          </Link>

          <Link
            href="/strategies"
            className="text-gray-400 hover:text-gray-200 flex items-center gap-1"
          >
            <span>Strategies</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
