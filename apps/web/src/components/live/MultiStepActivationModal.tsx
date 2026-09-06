"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { ReadinessGate } from "@/lib/mockLiveSafetyData";

interface MultiStepActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmActivate: () => void;
  gates: ReadinessGate[];
}

export function MultiStepActivationModal({
  isOpen,
  onClose,
  onConfirmActivate,
  gates,
}: MultiStepActivationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Checkbox state for Step 3
  const [ackRealCapital, setAckRealCapital] = useState(false);
  const [ackWithdrawalsDisabled, setAckWithdrawalsDisabled] = useState(false);
  const [ackRiskLimits, setAckRiskLimits] = useState(false);
  const [ackOwnerApproval, setAckOwnerApproval] = useState(false);
  const [ackOrderExecution, setAckOrderExecution] = useState(false);

  const allChecked =
    ackRealCapital &&
    ackWithdrawalsDisabled &&
    ackRiskLimits &&
    ackOwnerApproval &&
    ackOrderExecution;

  const handleResetAndClose = () => {
    setStep(1);
    setAckRealCapital(false);
    setAckWithdrawalsDisabled(false);
    setAckRiskLimits(false);
    setAckOwnerApproval(false);
    setAckOrderExecution(false);
    onClose();
  };

  const handleFinalConfirm = () => {
    onConfirmActivate();
    handleResetAndClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-warning">
          <ShieldAlert size={18} />
          <span>Live Trading Activation Gateway</span>
        </div>
      }
      subtitle={`Deliberate Step ${step} of 4: ${
        step === 1
          ? "System Readiness Audit"
          : step === 2
          ? "Production Safeguard Review"
          : step === 3
          ? "Explicit Owner Acknowledgements"
          : "Final Operational Authorization"
      }`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={handleResetAndClose}>
            Abort Activation
          </Button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
              >
                Back
              </Button>
            )}

            {step === 1 && (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight size={13} />}
                onClick={() => setStep(2)}
              >
                Continue to Safeguards
              </Button>
            )}

            {step === 2 && (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight size={13} />}
                onClick={() => setStep(3)}
              >
                Continue to Acknowledgements
              </Button>
            )}

            {step === 3 && (
              <Button
                variant="primary"
                size="sm"
                disabled={!allChecked}
                rightIcon={<ArrowRight size={13} />}
                onClick={() => setStep(4)}
              >
                Proceed to Final Sign
              </Button>
            )}

            {step === 4 && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<ShieldAlert size={14} />}
                onClick={handleFinalConfirm}
                className="bg-loss hover:bg-loss/90 text-white font-bold"
              >
                ENABLE LIVE TRADING
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Step 1: System Readiness Audit */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="p-3 rounded bg-surface border border-border-color space-y-1">
              <span className="font-semibold text-gray-200">Pre-Flight Readiness Check</span>
              <p className="text-[11px] text-gray-400">
                Live order execution routes to the Binance exchange gateway. Verifying baseline prerequisites.
              </p>
            </div>

            <div className="space-y-1.5 border border-border-color rounded-md overflow-hidden divide-y divide-border-color/60 bg-surface">
              {gates.slice(0, 6).map((g) => (
                <div key={g.id} className="p-2.5 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-gray-300">{g.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      g.status === "PASS"
                        ? "bg-profit/15 text-profit border border-profit/30"
                        : "bg-warning/15 text-warning border border-warning/30"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Production Safeguard Review */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="p-3 rounded-md bg-warning/10 border border-warning/30 text-warning space-y-1">
              <span className="font-bold">Production Safeguard Guarantees</span>
              <p className="text-[11px] text-gray-300">
                Confirm that hard constraints are actively enforced at the protocol and exchange layer.
              </p>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-3 rounded bg-surface border border-border-color flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-200">Withdrawals Status</span>
                  <p className="text-[10px] text-gray-400">Funds cannot be moved out of account</p>
                </div>
                <span className="text-profit font-bold">STRICTLY DISABLED</span>
              </div>

              <div className="p-3 rounded bg-surface border border-border-color flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-200">IP Whitelist Enforced</span>
                  <p className="text-[10px] text-gray-400">Restricted to static datacenter IP</p>
                </div>
                <span className="text-profit font-bold">LOCKED</span>
              </div>

              <div className="p-3 rounded bg-surface border border-border-color flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-200">Risk Engine Gatekeeper</span>
                  <p className="text-[10px] text-gray-400">Hard stop at 0.50% risk per trade</p>
                </div>
                <span className="text-profit font-bold">AUTHORITATIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Explicit Owner Acknowledgements */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="p-3 rounded bg-surface border border-border-color space-y-1">
              <span className="font-semibold text-gray-200">Mandatory Operator Acknowledgements</span>
              <p className="text-[11px] text-gray-400">
                Select every safeguard clause to proceed to final activation.
              </p>
            </div>

            <div className="space-y-2 bg-surface border border-border-color rounded-md p-3.5">
              {[
                {
                  id: "ack1",
                  checked: ackRealCapital,
                  setter: setAckRealCapital,
                  text: "I understand that live trading uses real capital.",
                },
                {
                  id: "ack2",
                  checked: ackWithdrawalsDisabled,
                  setter: setAckWithdrawalsDisabled,
                  text: "I confirm that withdrawals remain disabled.",
                },
                {
                  id: "ack3",
                  checked: ackRiskLimits,
                  setter: setAckRiskLimits,
                  text: "I confirm that risk limits are configured.",
                },
                {
                  id: "ack4",
                  checked: ackOwnerApproval,
                  setter: setAckOwnerApproval,
                  text: "I confirm that owner approval is required.",
                },
                {
                  id: "ack5",
                  checked: ackOrderExecution,
                  setter: setAckOrderExecution,
                  text: "I understand that this action enables real order execution.",
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 cursor-pointer hover:bg-surface-2 p-1.5 rounded transition-colors text-xs text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="mt-0.5 rounded border-border-color text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="leading-snug">{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-loss/10 border border-loss/40 text-loss space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>FINAL AUTHORIZATION: ENABLE LIVE TRADING</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                This will allow approved trade proposals to proceed to real exchange execution.
                Orders will be dispatched directly to Binance with real account capital.
              </p>
            </div>

            <div className="p-3 rounded bg-surface border border-border-color space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Exchange Gateway:</span>
                <span className="text-gray-100 font-bold">Binance Live</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target Mode:</span>
                <span className="text-loss font-bold">LIVE PRODUCTION</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Max Risk / Trade:</span>
                <span className="text-gray-200">0.50%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Portfolio Risk Limit:</span>
                <span className="text-gray-200">5.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Withdrawals:</span>
                <span className="text-profit font-bold">DISABLED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
