"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Play, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { ExecutionRequest } from "@/lib/mockExecutionData";

interface ExecuteConfirmModalProps {
  isOpen: boolean;
  request: ExecutionRequest | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExecuteConfirmModal({
  isOpen,
  request,
  onClose,
  onConfirm,
}: ExecuteConfirmModalProps) {
  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-cyan-400">
          <Play size={18} />
          <span>Execute Paper Order</span>
        </div>
      }
      subtitle={`Execution Request ID: ${request.id} • Idempotency: ${request.idempotencyKey}`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play size={14} />}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Dispatch Order
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Environment callout */}
        <div className="p-3 rounded-md bg-profit/10 border border-profit/30 text-profit flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            <span className="font-semibold">ENVIRONMENT: {request.environment} SIMULATION</span>
          </div>
          <span className="text-[10px] text-gray-300 bg-surface px-1.5 py-0.5 rounded border border-profit/20">
            ZERO CAPITAL RISK
          </span>
        </div>

        {/* Order Details */}
        <div className="bg-surface border border-border-color rounded-md p-3.5 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-border-color/60">
            <span className="text-gray-400">Instrument &amp; Direction:</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-gray-100">{request.symbol}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  request.side === "LONG"
                    ? "bg-profit/15 text-profit border border-profit/30"
                    : "bg-loss/15 text-loss border border-loss/30"
                }`}
              >
                {request.side}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Order Type:</span>
            <span className="text-gray-200">{request.orderType}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Order Quantity:</span>
            <span className="text-cyan-300 font-semibold">{request.quantity}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Limit Price:</span>
            <span className="text-gray-100 font-semibold">
              ${request.requestedPrice.toLocaleString()} USD
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Allocated Risk:</span>
            <span className="text-profit">{request.riskPercent}% of Portfolio</span>
          </div>
        </div>

        {/* Authorization Chain Verification */}
        <div className="p-3 rounded-md bg-surface-2 border border-border-color space-y-2">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-profit" />
            <span>Dual-Signature Verification</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-surface border border-border-color/60">
              <span className="text-gray-400">Risk Engine</span>
              <span className="text-profit font-semibold">VERIFIED</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface border border-border-color/60">
              <span className="text-gray-400">Owner Approval</span>
              <span className="text-profit font-semibold">SIGNED</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
