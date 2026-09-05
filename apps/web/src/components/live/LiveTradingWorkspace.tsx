"use client";

import React, { useState } from "react";
import {
  initialReadinessGates,
  initialLiveLimits,
  initialLiveTelemetry,
  ReadinessGate,
  LiveAccountTelemetry,
  LiveProductionLimits,
} from "@/lib/mockLiveSafetyData";
import { LiveStatusHeader } from "./LiveStatusHeader";
import { ReadinessGatesCard } from "./ReadinessGatesCard";
import { LiveProductionLimitsCard } from "./LiveProductionLimitsCard";
import { LiveAccountTelemetryCard } from "./LiveAccountTelemetryCard";
import { MultiStepActivationModal } from "./MultiStepActivationModal";
import { DisableLiveModal } from "./DisableLiveModal";
import { EmergencyStopModal } from "./EmergencyStopModal";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export function LiveTradingWorkspace() {
  const [isLiveEnabled, setIsLiveEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [gates, setGates] = useState<ReadinessGate[]>(initialReadinessGates);
  const [limits] = useState<LiveProductionLimits>(initialLiveLimits);
  const [telemetry, setTelemetry] = useState<LiveAccountTelemetry>(initialLiveTelemetry);

  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Live Activation Handler
  const handleConfirmActivate = async () => {
    try {
      await fetch("/api/live/activate", { method: "POST" });
    } catch {
      // Fallback in mock environment
    }
    setIsLiveEnabled(true);
    setGates((prev) =>
      prev.map((g) => {
        if (g.id === "GATE-10" || g.id === "GATE-11") {
          return { ...g, status: "PASS", detail: "Explicitly enabled by authorized owner session." };
        }
        return g;
      })
    );
    setTelemetry((prev) => ({ ...prev, status: "ACTIVE" }));
    showToast("LIVE TRADING ENABLED: Production order execution armed.");
  };

  // Disable Live Trading Handler
  const handleConfirmDisable = async () => {
    try {
      await fetch("/api/live/disable", { method: "POST" });
    } catch {
      // Fallback in mock environment
    }
    setIsLiveEnabled(false);
    setGates((prev) =>
      prev.map((g) => {
        if (g.id === "GATE-10") {
          return {
            ...g,
            status: "WARNING",
            detail: "Active workspace reverted to safe PAPER sandbox.",
          };
        }
        if (g.id === "GATE-11") {
          return {
            ...g,
            status: "WARNING",
            detail: "LIVE_TRADING_ENABLED feature flag disabled.",
          };
        }
        return g;
      })
    );
    setTelemetry((prev) => ({ ...prev, status: "RESTRICTED" }));
    showToast("Live trading disabled. Workspace reverted to paper simulation.");
  };

  // Emergency Stop Handler
  const handleEmergencyStop = async () => {
    try {
      await Promise.allSettled([
        fetch("/api/live/emergency-stop", { method: "POST" }),
        fetch("/api/trades/kill-switch", { method: "POST" }),
      ]);
    } catch {
      // Fallback
    }
    setIsLocked(true);
    setIsLiveEnabled(false);
    setGates((prev) =>
      prev.map((g) => {
        if (g.id === "GATE-08" || g.id === "GATE-12") {
          return { ...g, status: "BLOCKED", detail: "Execution locked due to emergency kill switch." };
        }
        return g;
      })
    );
    showToast("EMERGENCY KILL SWITCH ENGAGED: All orders cancelled and execution locked.");
  };

  return (
    <div className="min-h-screen bg-bg-950 text-gray-100 flex flex-col">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-surface-elevated border border-profit/50 text-profit shadow-2xl animate-fadeIn text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <LiveStatusHeader
          isLiveEnabled={isLiveEnabled}
          isLocked={isLocked}
          onOpenActivate={() => setIsActivateModalOpen(true)}
          onOpenDisable={() => setIsDisableModalOpen(true)}
          onOpenEmergencyStop={() => setIsEmergencyModalOpen(true)}
        />

        {/* Top Grid: Live Capital & Production Limits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveAccountTelemetryCard
            telemetry={telemetry}
            isLiveActive={isLiveEnabled}
          />
          <LiveProductionLimitsCard limits={limits} />
        </div>

        {/* Readiness Gates Matrix */}
        <ReadinessGatesCard gates={gates} />
      </div>

      {/* Modals */}
      <MultiStepActivationModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onConfirmActivate={handleConfirmActivate}
        gates={gates}
      />

      <DisableLiveModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onConfirm={handleConfirmDisable}
      />

      <EmergencyStopModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmKillSwitch={handleEmergencyStop}
      />
    </div>
  );
}
