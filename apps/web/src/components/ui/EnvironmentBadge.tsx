"use client";

import React from "react";
import { AlertOctagon, ShieldCheck } from "lucide-react";

export type EnvironmentMode = "PAPER" | "LIVE" | "DEVELOPMENT";

export interface EnvironmentBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: EnvironmentMode;
  showIcon?: boolean;
}

export function EnvironmentBadge({
  mode,
  showIcon = true,
  className = "",
  ...props
}: EnvironmentBadgeProps) {
  if (mode === "LIVE") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-loss-dim/90 border border-loss/60 text-loss rounded-md shadow-[0_0_12px_rgba(255,59,48,0.25)] select-none ${className}`}
        title="LIVE TRADING ENVIRONMENT — REAL CAPITAL AT RISK"
        {...props}
      >
        <div className="w-2 h-2 rounded-full bg-loss animate-pulse shadow-[0_0_6px_rgba(255,59,48,0.8)]" />
        {showIcon && <AlertOctagon size={13} className="text-loss shrink-0" />}
        <span className="font-mono text-[11px] font-bold tracking-wider text-loss uppercase">
          LIVE TRADING
        </span>
      </div>
    );
  }

  if (mode === "DEVELOPMENT") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border-hi text-gray-300 rounded-md select-none ${className}`}
        {...props}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span className="font-mono text-[11px] font-medium tracking-wider text-gray-300 uppercase">
          DEV
        </span>
      </div>
    );
  }

  // Default: PAPER
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border-hi text-cyan-400 rounded-md select-none ${className}`}
      title="Paper Trading Simulation Mode"
      {...props}
    >
      <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.6)] animate-pulse" />
      {showIcon && <ShieldCheck size={13} className="text-cyan-400 shrink-0" />}
      <span className="font-mono text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
        PAPER
      </span>
    </div>
  );
}
