import React from "react";
import type { ValidationRunType } from "@/lib/researchApi";

const CONFIG: Record<ValidationRunType, { label: string; classes: string }> = {
  BACKTEST:       { label: "BACKTEST",   classes: "bg-blue-950 text-blue-400 border-blue-800" },
  OUT_OF_SAMPLE:  { label: "OOS",        classes: "bg-purple-950 text-purple-400 border-purple-800" },
  WALK_FORWARD:   { label: "WALK-FWD",   classes: "bg-orange-950 text-orange-400 border-orange-800" },
  REGIME_ANALYSIS:{ label: "REGIME",     classes: "bg-cyan-950 text-cyan-400 border-cyan-700" },
};

interface Props { runType: ValidationRunType; className?: string }

export function ValidationRunTypeBadge({ runType, className = "" }: Props) {
  const cfg = CONFIG[runType] ?? { label: runType, classes: "bg-gray-800 text-gray-400 border-gray-700" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded border ${cfg.classes} ${className}`}>
      {cfg.label}
    </span>
  );
}
