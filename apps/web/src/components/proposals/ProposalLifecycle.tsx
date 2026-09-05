"use client";

import React from "react";
import { Check, Clock, Circle } from "lucide-react";

export type ProposalLifecycleStage =
  | "opportunity"
  | "investigation"
  | "proposal"
  | "risk_validation"
  | "owner_approval"
  | "execution";

interface ProposalLifecycleProps {
  currentStage: ProposalLifecycleStage;
  isRejected?: boolean;
  className?: string;
}

export function ProposalLifecycle({
  currentStage,
  isRejected = false,
  className = "",
}: ProposalLifecycleProps) {
  const stages = [
    { id: "opportunity", label: "Opportunity" },
    { id: "investigation", label: "Investigation" },
    { id: "proposal", label: "Proposal" },
    { id: "risk_validation", label: "Risk Engine" },
    { id: "owner_approval", label: "Owner Approval" },
    { id: "execution", label: "Execution" },
  ];

  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <div
      className={`p-3.5 rounded-lg bg-surface-2/40 border border-border-color space-y-2 select-none ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-400">
        <span>Decision Lifecycle Stage</span>
        <span className="text-cyan-400 font-bold">STAGE {currentIndex + 1} OF 6</span>
      </div>

      <div className="grid grid-cols-6 gap-1.5 pt-1 font-mono text-[10px]">
        {stages.map((stg, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          let nodeColor = "bg-bg-950 border-border-color text-gray-600";
          let barColor = "bg-gray-800";
          let labelColor = "text-gray-600";
          let icon = <Circle size={10} />;

          if (isPassed) {
            nodeColor = "bg-cyan-dim/40 border-cyan-500/60 text-cyan-300";
            barColor = "bg-cyan-500/60";
            labelColor = "text-gray-300";
            icon = <Check size={10} />;
          } else if (isCurrent) {
            if (isRejected) {
              nodeColor = "bg-loss-dim/40 border-loss text-loss animate-pulse";
              barColor = "bg-loss/60";
              labelColor = "text-loss font-bold";
              icon = <Clock size={10} />;
            } else {
              nodeColor = "bg-warning-dim/40 border-warning text-warning animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]";
              barColor = "bg-warning/60";
              labelColor = "text-warning font-bold";
              icon = <Clock size={10} />;
            }
          }

          return (
            <div key={stg.id} className="flex flex-col items-center gap-1.5 text-center">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${nodeColor}`}
              >
                {icon}
              </div>
              <span className={`text-[9px] truncate max-w-full ${labelColor}`}>
                {stg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
