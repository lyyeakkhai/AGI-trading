"use client";

import React from "react";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { Shield, Lock, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { TradingSettings } from "@/lib/mockSettingsData";

interface TradingModeSectionProps {
  data: TradingSettings;
}

export function TradingModeSection({ data }: TradingModeSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
          <Shield size={16} className="text-cyan-400" />
          <span>Trading Environment</span>
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Execution routing controls, sandbox guarantees, and live order circuit breakers.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Active Environment Banner */}
        <div className="p-4 rounded-lg bg-surface border border-border-color space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Active Execution Mode:
              </span>
              <EnvironmentBadge mode={data.mode} />
            </div>
            <span className="text-[11px] font-mono text-profit bg-profit/10 border border-profit/30 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 size={11} />
              SANDBOX ISOLATION ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed bg-surface-2 p-3 rounded border border-border-color/60">
            {data.explanation}
          </p>
        </div>

        {/* Paper vs Live Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Paper Mode Card */}
          <div className="p-4 rounded-lg bg-surface border border-profit/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-profit" />
                <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
                  Paper Trading
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-profit bg-profit/10 px-2 py-0.5 rounded border border-profit/30">
                ON
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Virtual order book matching engine. Fills simulated positions using deterministic
              mock market ticks with zero capital risk.
            </p>
            <div className="text-[10px] font-mono text-gray-500 pt-1 border-t border-border-color/40 flex items-center justify-between">
              <span>ORDER ROUTING</span>
              <span className="text-profit">IN-MEMORY SIMULATION</span>
            </div>
          </div>

          {/* Live Trading Card (LOCKED) */}
          <div className="p-4 rounded-lg bg-surface border border-border-color space-y-3 relative opacity-85">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-gray-500" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Live Trading
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-loss bg-loss/10 px-2 py-0.5 rounded border border-loss/30 flex items-center gap-1">
                <Lock size={10} />
                OFF (LOCKED)
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Direct connection to exchange order gateways. Requires signed cryptographic keys,
              2FA authorization, and dedicated risk circuit breakers.
            </p>
            <div className="text-[10px] font-mono text-gray-500 pt-1 border-t border-border-color/40 flex items-center justify-between">
              <span>STATUS</span>
              <span className="text-loss">HARDWARE BLOCKED</span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-md bg-warning/10 border border-warning/30 flex items-start gap-3 text-xs">
          <AlertTriangle size={17} className="text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-warning">Live trading is not enabled.</h4>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              This terminal is configured strictly for paper simulation and risk-gated strategy
              validation. Live trade execution endpoints are physically decoupled in this frontend build.
            </p>
          </div>
        </div>

        {/* Architectural Isolation Callout */}
        <div className="p-3.5 rounded-md bg-surface border border-border-color space-y-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-medium">
            <ShieldAlert size={15} />
            <span>Architectural Boundary Guarantee</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            The execution engine is strictly separated from Hermes analysis. Under no circumstances can
            an autonomous prompt or external signal bypass the local Risk Engine or Owner approval.
          </p>
        </div>
      </div>
    </div>
  );
}
