"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { TradeProposalItem } from "@/lib/mockTradeProposalsData";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  proposal: TradeProposalItem | null;
}

export function ApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  proposal,
}: ApprovalModalProps) {
  if (!proposal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorize Trade Proposal"
      subtitle="Review proposal specifications before granting owner execution authorization."
      size="md"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Proposal Summary Card */}
        <div className="p-3.5 rounded-lg bg-bg-950 border border-border-color space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-100">
                {proposal.symbol}
              </span>
              <PositionSide side={proposal.direction} size="sm" />
            </div>
            <span className="text-[10px] text-gray-400">
              ID: {proposal.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-border-color/60">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Entry</span>
              <span className="text-gray-100 font-bold">
                ${proposal.entry.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-loss uppercase block">Stop Loss</span>
              <span className="text-loss font-bold">
                ${proposal.stopLoss.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-profit uppercase block">Target</span>
              <span className="text-profit font-bold">
                ${proposal.takeProfit.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 uppercase block">Risk / R:R</span>
              <span className="text-cyan-300 font-bold">
                {proposal.riskPercent}% • {proposal.riskReward}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Engine Status */}
        <div className="p-2.5 rounded bg-profit-dim/20 border border-profit/40 flex items-center gap-2 text-profit text-xs">
          <ShieldCheck size={16} className="shrink-0" />
          <span>Deterministic Risk Engine: <strong>APPROVED (All 7 checks passed)</strong></span>
        </div>

        {/* Critical Safety Notice */}
        <div className="p-3 rounded bg-surface-2 border border-border-hi text-gray-300 space-y-1 font-sans text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-warning font-bold uppercase">
            <AlertCircle size={13} />
            <span>Operational Safety Notice</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Approval authorizes this proposal to proceed to the execution stage.
            This frontend simulation updates local state and does not place real orders on any exchange.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            leftIcon={<CheckCircle2 size={14} />}
            className="font-mono text-xs"
          >
            AUTHORIZE PROPOSAL
          </Button>
        </div>
      </div>
    </Modal>
  );
}
