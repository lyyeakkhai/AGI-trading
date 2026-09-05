"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TradeProposalItem } from "@/lib/mockTradeProposalsData";
import { AlertTriangle, XCircle } from "lucide-react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  proposal: TradeProposalItem | null;
}

export function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  proposal,
}: RejectModalProps) {
  const [reason, setReason] = useState("");

  if (!proposal) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || "Owner rejected proposal without note.");
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Trade Proposal"
      subtitle="Decline owner authorization for this trading proposal."
      size="sm"
    >
      <div className="space-y-4 text-xs font-mono">
        <div className="p-3 rounded bg-loss-dim/20 border border-loss/40 text-loss flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span className="font-sans leading-relaxed">
            Rejecting this proposal terminates its lifecycle and archives it into the decision audit trail.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] text-gray-400 block uppercase">
            Rejection Rationale (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Invalidation too close to resistance, macro liquidity headwind, etc."
            rows={3}
            className="w-full p-2.5 bg-bg-950 border border-border-color rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-loss text-xs font-mono resize-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            leftIcon={<XCircle size={14} />}
          >
            CONFIRM REJECTION
          </Button>
        </div>
      </div>
    </Modal>
  );
}
