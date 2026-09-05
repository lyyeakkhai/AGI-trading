"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { ExecutionRequest } from "@/lib/mockExecutionData";

interface CancelConfirmModalProps {
  isOpen: boolean;
  request: ExecutionRequest | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelConfirmModal({
  isOpen,
  request,
  onClose,
  onConfirm,
}: CancelConfirmModalProps) {
  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle size={18} />
          <span>Cancel Active Order</span>
        </div>
      }
      subtitle={`Cancel resting limit on simulated exchange`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Keep Order
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm Cancel
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs text-gray-300">
        <p>
          Are you sure you want to cancel the resting order for{" "}
          <span className="font-semibold text-gray-100 font-mono">
            {request.symbol} {request.side} ({request.quantity})
          </span>
          ?
        </p>
        <p className="text-[11px] text-gray-400">
          This will withdraw the order from the order book and mark execution request{" "}
          <span className="font-mono text-gray-300">{request.id}</span> as CANCELLED.
        </p>
      </div>
    </Modal>
  );
}
