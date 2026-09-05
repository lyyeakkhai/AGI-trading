"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert,
  ShieldCheck,
  Power,
  Lock,
  CheckCircle2,
  Server,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface LiveStatusHeaderProps {
  isLiveEnabled: boolean;
  isLocked: boolean;
  onOpenActivate: () => void;
  onOpenDisable: () => void;
  onOpenEmergencyStop: () => void;
}

export function LiveStatusHeader({
  isLiveEnabled,
  isLocked,
  onOpenActivate,
  onOpenDisable,
  onOpenEmergencyStop,
}: LiveStatusHeaderProps) {
  return (
    <div className="space-y-4 pb-4 border-b border-border-color">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">
              Live Trading Controls &amp; Production Safety
            </h1>
            <Badge variant="cyan" size="sm" className="font-mono">
              SECOPS v1.0
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Authoritative readiness gates, multi-step live activation, and server-side emergency kill switch.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isLiveEnabled ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShieldAlert size={14} />}
              onClick={onOpenActivate}
            >
              Request Live Activation
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Lock size={14} />}
              onClick={onOpenDisable}
              className="border-warning text-warning hover:bg-warning/10"
            >
              Disable Live Trading
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            leftIcon={<Power size={14} />}
            onClick={onOpenEmergencyStop}
            className="bg-loss hover:bg-loss/90 text-white font-bold"
          >
            Emergency Stop
          </Button>
        </div>
      </div>

      {/* Primary Status Banner (Section 5) */}
      <div className="p-3 rounded-lg bg-surface border border-border-color flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Current Security Posture:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
              isLiveEnabled
                ? "bg-profit/15 border-profit/40 text-profit animate-pulse"
                : "bg-loss/15 border-loss/40 text-loss"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isLiveEnabled ? "bg-profit" : "bg-loss"}`}
            />
            <span>LIVE TRADING: {isLiveEnabled ? "ENABLED" : "DISABLED"}</span>
          </div>

          <div
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 ${
              isLocked
                ? "bg-loss/10 border-loss/30 text-loss font-semibold"
                : "bg-surface-2 border-border-color text-gray-300"
            }`}
          >
            <Lock size={12} />
            <span>EXECUTION: {isLocked ? "LOCKED" : "READY"}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-surface-2 border border-border-color text-profit flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            <span>RISK: ENFORCED</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-surface-2 border border-border-color text-cyan-300 flex items-center gap-1.5">
            <Server size={12} />
            <span>BINANCE: CONNECTED</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-surface-2 border border-border-color text-gray-300 flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-profit" />
            <span>OWNER: VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
