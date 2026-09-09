"use client";

import React from "react";
import { SafetyStatusData } from "@/lib/mockRiskData";
import { Lock, ShieldAlert, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components";

interface SafetyStatusCardProps {
  safety: SafetyStatusData;
  onOpenControls?: () => void;
}

export function SafetyStatusCard({ safety, onOpenControls }: SafetyStatusCardProps) {
  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Operational Safety Controls
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Execution safeguards and paper environment enforcement
            </p>
          </div>
        </div>
        <span className="text-xs font-sans tracking-tight text-emerald-400 font-bold">
          Paper Safe
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-sans tracking-tight text-xs">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Trading Lock</span>
          <span className="font-bold text-emerald-400 text-sm">{safety.tradingLock}</span>
        </div>

        <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Live Trading</span>
          <span className="font-bold text-gray-500 dark:text-zinc-400 text-sm">{safety.liveTrading}</span>
        </div>

        <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
          <span className="text-xs text-cyan-400 block">Paper Mode</span>
          <span className="font-bold text-cyan-300 text-sm">{safety.paperTrading}</span>
        </div>

        <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Emergency Stop</span>
          <span className="font-bold text-emerald-400 text-sm">{safety.emergencyStop}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/5 font-sans tracking-tight text-xs">
        <span className="text-xs text-gray-500 dark:text-zinc-400">
          All orders route to paper simulator. Live exchange execution disabled.
        </span>
        {onOpenControls && (
          <Button
            variant="secondary"
            onClick={onOpenControls}
            className="text-xs py-1 px-2.5 flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Safety State</span>
          </Button>
        )}
      </div>
    </div>
  );
}
