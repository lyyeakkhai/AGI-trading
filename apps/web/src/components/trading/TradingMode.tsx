"use client";

import React from "react";
import { EnvironmentBadge, EnvironmentMode } from "../ui/EnvironmentBadge";

export interface TradingModeProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: EnvironmentMode;
  onModeChange?: (newMode: EnvironmentMode) => void;
  interactive?: boolean;
}

export function TradingMode({
  mode,
  onModeChange,
  interactive = false,
  className = "",
  ...props
}: TradingModeProps) {
  if (!interactive) {
    return <EnvironmentBadge mode={mode} className={className} {...props} />;
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-md bg-surface border border-border-color ${className}`}
      {...props}
    >
      <button
        type="button"
        onClick={() => onModeChange?.("PAPER")}
        className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded transition-colors ${
          mode === "PAPER"
            ? "bg-cyan-dim/40 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        PAPER
      </button>
      <button
        type="button"
        onClick={() => onModeChange?.("LIVE")}
        className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded transition-colors ${
          mode === "LIVE"
            ? "bg-loss-dim text-loss border border-loss/70 shadow-[0_0_10px_rgba(255,59,48,0.3)]"
            : "text-gray-500 hover:text-loss"
        }`}
      >
        LIVE
      </button>
    </div>
  );
}
