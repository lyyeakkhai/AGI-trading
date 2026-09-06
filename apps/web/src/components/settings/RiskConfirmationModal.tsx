"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { RiskSettings } from "@/lib/mockSettingsData";

export interface RiskFieldChange {
  label: string;
  previous: string | number;
  current: string | number;
  unit?: string;
}

interface RiskConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: RiskFieldChange[];
  newRiskState: RiskSettings;
}

export function RiskConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  changes,
}: RiskConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle size={18} />
          <span>Confirm Risk Configuration</span>
        </div>
      }
      subtitle="Changes directly modify future deterministic trade proposal validation."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ShieldCheck size={14} />}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-md bg-warning/10 border border-warning/30 text-gray-200 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-warning">Deterministic Safety Boundary</p>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              These limits are enforced by the pre-trade deterministic risk engine. Future
              trade proposals that exceed these boundaries will be automatically rejected.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Modified Parameters ({changes.length})
          </h4>
          {changes.length === 0 ? (
            <p className="text-gray-500 italic py-2">No parameter changes detected.</p>
          ) : (
            <div className="space-y-1.5 border border-border-color rounded-md overflow-hidden divide-y divide-border-color/60 bg-surface">
              {changes.map((change) => (
                <div
                  key={change.label}
                  className="px-3 py-2 flex items-center justify-between text-xs hover:bg-surface-2"
                >
                  <span className="text-gray-300 font-medium">{change.label}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-gray-500 line-through">
                      {change.previous}
                      {change.unit || ""}
                    </span>
                    <ArrowRight size={12} className="text-cyan-400" />
                    <span className="text-cyan-300 font-semibold">
                      {change.current}
                      {change.unit || ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-[11px] text-gray-500">
          Source attribution: <span className="text-gray-300 font-mono">Owner / Interactive Session</span>
        </div>
      </div>
    </Modal>
  );
}
