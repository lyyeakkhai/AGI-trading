"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Lock } from "lucide-react";

interface DisableLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisableLiveModal({ isOpen, onClose, onConfirm }: DisableLiveModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-profit">
          <ShieldCheck size={18} />
          <span>Disable Live Trading</span>
        </div>
      }
      subtitle="Revert workspace to safe paper simulation."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Lock size={14} />}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Disable Live Trading
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs text-gray-300">
        <p className="leading-relaxed">
          New live execution requests will be immediately blocked and order routing will be
          reverted to safe in-memory paper matching.
        </p>
        <p className="text-[11px] text-gray-400">
          Any already open positions remain tracked on the exchange.
        </p>
      </div>
    </Modal>
  );
}
