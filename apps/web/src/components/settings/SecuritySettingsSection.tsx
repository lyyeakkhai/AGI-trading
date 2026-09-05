"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Lock, ShieldCheck, KeyRound, ExternalLink, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { SecuritySettings } from "@/lib/mockSettingsData";
import { DangerZoneSection } from "./DangerZoneSection";

interface SecuritySettingsSectionProps {
  data: SecuritySettings;
  onResetSettings: () => void;
  onClearMockData: () => void;
  onResetWorkspace: () => void;
}

export function SecuritySettingsSection({
  data,
  onResetSettings,
  onClearMockData,
  onResetWorkspace,
}: SecuritySettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
          <Lock size={16} className="text-cyan-400" />
          <span>Security &amp; Session Controls</span>
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Active session telemetry, credential safeguards, and audit log integration.
        </p>
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* Security Posture Summary Card */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-color">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-profit" />
              <div>
                <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
                  Security Posture
                </h3>
                <p className="text-[11px] text-gray-400">Single-operator local paper sandbox</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-profit bg-profit/10 px-2.5 py-1 rounded border border-profit/30">
              ENFORCED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-gray-400 text-[11px]">Current Session Status</span>
              <div className="font-mono text-profit font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
                {data.currentSession}
              </div>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-gray-400 text-[11px]">Last Authenticated</span>
              <div className="font-mono text-gray-200">{data.lastLogin}</div>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-gray-400 text-[11px]">Two-Factor Authentication</span>
              <div className="font-mono text-gray-400 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-warning" />
                {data.twoFactorAuth} (Paper Sandbox)
              </div>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-gray-400 text-[11px]">API Credential Storage</span>
              <div className="font-mono text-profit flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                {data.apiCredentialStatus}
              </div>
            </div>
          </div>

          {/* Audit Link Button (Section 17) */}
          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Deterministic ledger traces all logins, state transitions, and setting changes.
            </p>
            <Link href="/activity">
              <Button
                variant="secondary"
                size="sm"
                rightIcon={<ExternalLink size={13} />}
              >
                Review Activity
              </Button>
            </Link>
          </div>
        </div>

        {/* Strict Security Rules Callout (Section 18) */}
        <div className="p-4 rounded-lg bg-surface border border-border-color space-y-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <KeyRound size={15} />
            <span>Zero Credential Exposure Rule</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-gray-400 list-disc list-inside">
            <li>Plaintext API keys, signing secrets, or private tokens are never rendered.</li>
            <li>Exchange credentials are physically blocked from persisting into local disk.</li>
            <li>Network endpoints for real funds withdrawal or real order placement do not exist.</li>
          </ul>
        </div>

        {/* Danger Zone (Section 19) */}
        <DangerZoneSection
          onResetSettings={onResetSettings}
          onClearMockData={onClearMockData}
          onResetWorkspace={onResetWorkspace}
        />
      </div>
    </div>
  );
}
