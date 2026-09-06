"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, Power } from "lucide-react";

interface EmergencyStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmKillSwitch: () => Promise<void>;
}

export function EmergencyStopModal({
  isOpen,
  onClose,
  onConfirmKillSwitch,
}: EmergencyStopModalProps) {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
      await onConfirmKillSwitch();
    } finally {
      setIsTriggering(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-loss">
          <AlertOctagon size={18} />
          <span>ENGAGE EMERGENCY KILL SWITCH</span>
        </div>
      }
      subtitle="Critical failsafe intervention"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isTriggering}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isTriggering}
            leftIcon={<Power size={14} />}
            onClick={handleTrigger}
            className="bg-loss hover:bg-loss/90 text-white font-bold"
          >
            ENGAGE KILL SWITCH
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs text-gray-300">
        <p className="leading-relaxed">
          This initiates the emergency server-side kill switch:
        </p>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-loss font-mono">
          <li>Cancels ALL open resting orders across all symbols.</li>
          <li>Locks the execution engine against any incoming orders.</li>
          <li>Emits critical telemetry halt events to the audit ledger.</li>
        </ul>
        <div className="p-2.5 rounded bg-loss/10 border border-loss/20 text-loss text-[10px]">
          Warning: Once engaged, the trading lock must be manually cleared by the operator.
        </div>
      </div>
    </Modal>
  );
}
