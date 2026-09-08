import React from "react";
import type { ConclusionOutcome } from "@/lib/researchApi";

const CONFIG: Record<ConclusionOutcome, { label: string; classes: string }> = {
  SUPPORTED:          { label: "SUPPORTED",          classes: "bg-green-950 text-green-400 border-green-700" },
  PARTIALLY_SUPPORTED:{ label: "PARTIALLY SUPPORTED", classes: "bg-yellow-950 text-yellow-400 border-yellow-700" },
  REJECTED:           { label: "REJECTED",           classes: "bg-red-950 text-red-400 border-red-800" },
  INCONCLUSIVE:       { label: "INCONCLUSIVE",       classes: "bg-gray-800 text-gray-400 border-gray-700" },
};

interface Props { outcome: ConclusionOutcome | null | undefined; className?: string }

export function ConclusionBadge({ outcome, className = "" }: Props) {
  if (!outcome) return <span className="text-gray-600 text-xs font-mono">—</span>;
  const cfg = CONFIG[outcome];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded border ${cfg.classes} ${className}`}>
      {cfg.label}
    </span>
  );
}
