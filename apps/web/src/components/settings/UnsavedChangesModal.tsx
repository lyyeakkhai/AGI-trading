"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onDiscard: () => void;
  pendingCount: number;
}

export function UnsavedChangesModal({
  isOpen,
  onStay,
  onDiscard,
  pendingCount,
}: UnsavedChangesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onStay}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-warning">
          <AlertCircle size={18} />
          <span>Unsaved Changes</span>
        </div>
      }
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onStay}>
            Stay and Edit
          </Button>
          <Button variant="danger" size="sm" onClick={onDiscard}>
            Discard Changes
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs text-gray-300">
        <p>
          You have <span className="font-semibold text-warning">{pendingCount}</span> configuration
          changes that have not been saved.
        </p>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Leaving this section without saving will revert your modified parameters back to their
          previously confirmed state.
        </p>
      </div>
    </Modal>
  );
}
