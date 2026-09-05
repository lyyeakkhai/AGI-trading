"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Bell, CheckCircle2, RotateCcw, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { NotificationSettings } from "@/lib/mockSettingsData";

interface NotificationSettingsSectionProps {
  data: NotificationSettings;
  onChange: (updated: Partial<NotificationSettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
}

export function NotificationSettingsSection({
  data,
  onChange,
  onSave,
  onCancel,
  isDirty,
}: NotificationSettingsSectionProps) {
  const toggleChannel = (channel: keyof NotificationSettings["channels"]) => {
    onChange({
      channels: {
        ...data.channels,
        [channel]: !data.channels[channel],
      },
    });
  };

  const toggleType = (typeKey: keyof NotificationSettings["types"]) => {
    onChange({
      types: {
        ...data.types,
        [typeKey]: !data.types[typeKey],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Bell size={16} className="text-cyan-400" />
            <span>Notification &amp; Alert Preferences</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Event triggers, dispatch channels, and severity escalations for terminal telemetry.
          </p>
        </div>

        {isDirty && (
          <span className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* Delivery Channels */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            Dispatch Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* In-App */}
            <div className="p-3 rounded bg-surface-2 border border-border-color flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-200">In-App Terminal</span>
                <p className="text-[10px] text-gray-400">Activity drawer and status toast banners</p>
              </div>
              <button
                type="button"
                onClick={() => toggleChannel("inApp")}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  data.channels.inApp ? "bg-cyan-500" : "bg-surface-elevated border border-border-color"
                }`}
              >
                <div
                  className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    data.channels.inApp ? "translate-x-4 bg-white" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Email */}
            <div className="p-3 rounded bg-surface-2 border border-border-color flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-200">Email Gateway</span>
                <p className="text-[10px] text-gray-400">Daily summary and critical escalations</p>
              </div>
              <button
                type="button"
                onClick={() => toggleChannel("email")}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  data.channels.email ? "bg-cyan-500" : "bg-surface-elevated border border-border-color"
                }`}
              >
                <div
                  className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    data.channels.email ? "translate-x-4 bg-white" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Telegram */}
            <div className="p-3 rounded bg-surface-2 border border-border-color flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-200">Telegram Bot</span>
                <p className="text-[10px] text-gray-400">Instant proposal notification stream</p>
              </div>
              <button
                type="button"
                onClick={() => toggleChannel("telegram")}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  data.channels.telegram ? "bg-cyan-500" : "bg-surface-elevated border border-border-color"
                }`}
              >
                <div
                  className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    data.channels.telegram ? "translate-x-4 bg-white" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Push */}
            <div className="p-3 rounded bg-surface-2 border border-border-color flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-200">Browser Web Push</span>
                <p className="text-[10px] text-gray-400">Desktop notifications when tab is idle</p>
              </div>
              <button
                type="button"
                onClick={() => toggleChannel("push")}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  data.channels.push ? "bg-cyan-500" : "bg-surface-elevated border border-border-color"
                }`}
              >
                <div
                  className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    data.channels.push ? "translate-x-4 bg-white" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Event Subscriptions */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            Event Subscriptions
          </h3>

          <div className="space-y-2.5 divide-y divide-border-color/60">
            {(
              [
                { key: "opportunityDetected", label: "Opportunity Detected", desc: "Hermes flags high-conviction market setup" },
                { key: "tradeProposalCreated", label: "Trade Proposal Created", desc: "Structured trade plan formulated for review" },
                { key: "riskRejection", label: "Risk Engine Rejection", desc: "Proposal breaches deterministic safety rule" },
                { key: "positionOpened", label: "Position Opened", desc: "Simulated paper order matched into portfolio" },
                { key: "positionClosed", label: "Position Closed", desc: "Stop loss or take profit limit reached" },
                { key: "dailyLossWarning", label: "Daily Loss Warning", desc: "Portfolio draws down near circuit breaker" },
                { key: "systemError", label: "System Anomaly / Error", desc: "Internal pipeline exception or feed timeout" },
                { key: "backtestCompleted", label: "Backtest Completed", desc: "Historical validation run finished" },
              ] as const
            ).map((item) => (
              <div key={item.key} className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-medium text-gray-200">{item.label}</span>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleType(item.key)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    data.types[item.key]
                      ? "bg-cyan-500"
                      : "bg-surface-elevated border border-border-color"
                  }`}
                >
                  <div
                    className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      data.types[item.key] ? "translate-x-4 bg-white" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Severity Preferences (Section 15) */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            Alert Severity Matrix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-surface-2 border border-loss/30 space-y-1">
              <div className="flex items-center gap-1.5 text-loss font-semibold text-xs">
                <ShieldAlert size={14} />
                <span>Critical</span>
              </div>
              <p className="text-[10px] text-gray-400">Risk breach, feed error</p>
              <div className="text-[11px] font-mono text-loss font-bold pt-1">
                Dispatch: IMMEDIATE
              </div>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-warning/30 space-y-1">
              <div className="flex items-center gap-1.5 text-warning font-semibold text-xs">
                <AlertTriangle size={14} />
                <span>Warning</span>
              </div>
              <p className="text-[10px] text-gray-400">Near loss limit, proposal veto</p>
              <div className="text-[11px] font-mono text-warning font-bold pt-1">
                Dispatch: IMMEDIATE
              </div>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-cyan-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                <Info size={14} />
                <span>Informational</span>
              </div>
              <p className="text-[10px] text-gray-400">New opportunity, backtest</p>
              <div className="text-[11px] font-mono text-cyan-300 font-bold pt-1">
                Dispatch: IN-APP
              </div>
            </div>
          </div>
        </div>

        {/* Save / Cancel Action Bar */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={14} />}
            disabled={!isDirty}
            onClick={onSave}
          >
            Save Preferences
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            disabled={!isDirty}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
