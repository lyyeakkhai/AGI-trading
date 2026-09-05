"use client";

import React from "react";
import { Server, CheckCircle2, Lock, ShieldCheck, DollarSign } from "lucide-react";
import { LiveAccountTelemetry } from "@/lib/mockLiveSafetyData";

interface LiveAccountTelemetryCardProps {
  telemetry: LiveAccountTelemetry;
  isLiveActive: boolean;
}

export function LiveAccountTelemetryCard({
  telemetry,
  isLiveActive,
}: LiveAccountTelemetryCardProps) {
  return (
    <div className="bg-surface border border-border-color rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-color">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-cyan-400" />
          <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            Exchange Account &amp; Capital Telemetry
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
            isLiveActive
              ? "bg-profit/10 border-profit/30 text-profit"
              : "bg-warning/10 border-warning/30 text-warning"
          }`}
        >
          {isLiveActive ? "LIVE CAPITAL ROUTING" : "SIMULATED TELEMETRY"}
        </span>
      </div>

      {/* Capital Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Total Account Equity</span>
          <div className="text-sm font-bold text-gray-100">
            ${telemetry.liveEquityUsd.toLocaleString()} USD
          </div>
          <span className="text-[10px] text-gray-500 block">Binance USD-M Portfolio</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Available Capital</span>
          <div className="text-sm font-bold text-profit">
            ${telemetry.availableCapitalUsd.toLocaleString()} USD
          </div>
          <span className="text-[10px] text-gray-500 block">Free collateral margin</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Active Exposure</span>
          <div className="text-sm font-bold text-cyan-300">
            ${telemetry.currentExposureUsd.toLocaleString()} USD
          </div>
          <span className="text-[10px] text-gray-500 block">Committed position value</span>
        </div>

        <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
          <span className="text-[10px] text-gray-400 block uppercase">Risk Utilization</span>
          <div className="text-sm font-bold text-warning">
            {telemetry.riskUtilizationPercent}%
          </div>
          <span className="text-[10px] text-gray-500 block">Of max daily loss ceiling</span>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="space-y-2 pt-1 border-t border-border-color/60 font-mono text-xs">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
          Cryptographic Permissions Matrix
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2.5 rounded bg-surface-2 border border-border-color flex items-center justify-between">
            <span className="text-gray-400">Read Telemetry</span>
            <span className="text-profit font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> PASS
            </span>
          </div>

          <div className="p-2.5 rounded bg-surface-2 border border-border-color flex items-center justify-between">
            <span className="text-gray-400">Spot Execution</span>
            <span className="text-profit font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> PASS
            </span>
          </div>

          <div className="p-2.5 rounded bg-surface-2 border border-border-color flex items-center justify-between">
            <span className="text-gray-400">Withdrawals</span>
            <span className="text-profit font-bold flex items-center gap-1">
              <Lock size={12} /> DISABLED
            </span>
          </div>

          <div className="p-2.5 rounded bg-surface-2 border border-border-color flex items-center justify-between">
            <span className="text-gray-400">IP Restriction</span>
            <span className="text-profit font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
