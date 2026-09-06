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
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Operational Safety Controls
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Execution safeguards and paper environment enforcement
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">
          PAPER SAFE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
        <div className="p-2 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Trading Lock</span>
          <span className="font-bold text-emerald-400 text-sm">{safety.tradingLock}</span>
        </div>

        <div className="p-2 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Live Trading</span>
          <span className="font-bold text-text-muted text-sm">{safety.liveTrading}</span>
        </div>

        <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/30">
          <span className="text-[10px] text-cyan-400 block">Paper Mode</span>
          <span className="font-bold text-cyan-300 text-sm">{safety.paperTrading}</span>
        </div>

        <div className="p-2 rounded bg-surface-2/60 border border-border/40">
          <span className="text-[10px] text-text-muted block">Emergency Stop</span>
          <span className="font-bold text-emerald-400 text-sm">{safety.emergencyStop}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 font-mono text-xs">
        <span className="text-[11px] text-text-muted">
          All orders route to paper simulator. Live exchange execution disabled.
        </span>
        {onOpenControls && (
          <Button
            variant="secondary"
            onClick={onOpenControls}
            className="text-[11px] py-1 px-2.5 flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Safety State</span>
          </Button>
        )}
      </div>
    </div>
  );
}
