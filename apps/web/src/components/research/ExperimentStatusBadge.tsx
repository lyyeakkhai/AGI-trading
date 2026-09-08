import React from "react";
import type { ExperimentStatus } from "@/lib/researchApi";

const STATUS_CONFIG: Record<ExperimentStatus, { label: string; classes: string }> = {
  DRAFT:     { label: "DRAFT",     classes: "bg-gray-800 text-gray-400 border-gray-700" },
  READY:     { label: "READY",     classes: "bg-blue-950 text-blue-400 border-blue-800" },
  RUNNING:   { label: "RUNNING",   classes: "bg-cyan-950 text-cyan-400 border-cyan-700" },
  COMPLETED: { label: "COMPLETED", classes: "bg-indigo-950 text-indigo-300 border-indigo-700" },
  VALIDATED: { label: "VALIDATED", classes: "bg-green-950 text-green-400 border-green-700" },
  REJECTED:  { label: "REJECTED",  classes: "bg-red-950 text-red-400 border-red-800" },
  ARCHIVED:  { label: "ARCHIVED",  classes: "bg-gray-900 text-gray-500 border-gray-700" },
};

interface Props { status: ExperimentStatus; className?: string }

export function ExperimentStatusBadge({ status, className = "" }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded border ${cfg.classes} ${className}`}
    >
      {cfg.label}
    </span>
  );
}
