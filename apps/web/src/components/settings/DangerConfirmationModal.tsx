"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertOctagon } from "lucide-react";

export type DangerActionType = "RESET_SETTINGS" | "CLEAR_MOCK_DATA" | "RESET_WORKSPACE";

interface DangerConfirmationModalProps {
  isOpen: boolean;
  actionType: DangerActionType | null;
  onClose: () => void;
  onConfirm: () => void;
}

const ACTION_METADATA: Record<
  DangerActionType,
  { title: string; subtitle: string; description: string; confirmLabel: string }
> = {
  RESET_SETTINGS: {
    title: "Reset Configuration to Default?",
    subtitle: "Restores initial factory parameters for all settings tabs.",
    description:
      "This action will reset your workspace preferences, Hermes operating mode, risk limits, and notification flags back to their factory defaults. This action does not touch database records.",
    confirmLabel: "Reset Settings",
  },
  CLEAR_MOCK_DATA: {
    title: "Clear Mock Session Storage?",
    subtitle: "Purges cached simulation state from local browser memory.",
    description:
      "This will flush simulated orders, in-flight backtest traces, and ephemeral market ticks stored in browser session storage. No actual network keys or configurations are affected.",
    confirmLabel: "Clear Mock Data",
  },
  RESET_WORKSPACE: {
    title: "Reset Entire Workspace?",
    subtitle: "Re-initializes all local view configurations and filter states.",
    description:
      "This will reset all UI panels, chart layouts, table sort preferences, and active tab selections across all platform screens.",
    confirmLabel: "Reset Workspace",
  },
};

export function DangerConfirmationModal({
  isOpen,
  actionType,
  onClose,
  onConfirm,
}: DangerConfirmationModalProps) {
  if (!actionType) return null;
  const meta = ACTION_METADATA[actionType];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-loss">
          <AlertOctagon size={18} />
          <span>{meta.title}</span>
        </div>
      }
      subtitle={meta.subtitle}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {meta.confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs text-gray-300">
        <p className="leading-relaxed">{meta.description}</p>
        <div className="p-2.5 rounded bg-loss/10 border border-loss/20 text-loss text-[11px]">
          Warning: This action will reload local frontend state immediately.
        </div>
      </div>
    </Modal>
  );
}
