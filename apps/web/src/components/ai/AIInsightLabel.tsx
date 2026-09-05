"use client";

import React from "react";
import { BrainCircuit } from "lucide-react";

export interface AIInsightLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  confidence?: number;
  type?: "insight" | "evidence" | "risk" | "hypothesis";
}

export function AIInsightLabel({
  label,
  confidence,
  type = "insight",
  className = "",
  ...props
}: AIInsightLabelProps) {
  const typeConfig = {
    insight: "border-cyan-500/40 text-cyan-300 bg-cyan-dim/20",
    evidence: "border-border-hi text-gray-300 bg-surface-2",
    risk: "border-warning/40 text-warning bg-warning-dim/30",
    hypothesis: "border-cyan-400/30 text-cyan-400 bg-bg-900",
  }[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono text-[10px] tracking-wide select-none ${typeConfig} ${className}`}
      {...props}
    >
      <BrainCircuit size={11} className="shrink-0 opacity-80" />
      <span className="font-semibold uppercase">{label}</span>
      {confidence !== undefined && (
        <span className="text-gray-400 border-l border-border-color pl-1 font-bold">
          {confidence}%
        </span>
      )}
    </span>
  );
}
