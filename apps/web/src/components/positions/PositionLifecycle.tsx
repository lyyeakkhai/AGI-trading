"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Check, Circle } from "lucide-react";

interface PositionLifecycleProps {
  isClosed?: boolean;
  className?: string;
}

export function PositionLifecycle({
  isClosed = false,
  className = "",
}: PositionLifecycleProps) {
  const steps = [
    { id: "proposal", label: "Proposal", status: "completed" },
    { id: "risk", label: "Risk Engine", status: "completed" },
    { id: "approval", label: "Owner Signed", status: "completed" },
    { id: "execution", label: "Paper Execution", status: "completed" },
    {
      id: "position_open",
      label: "Position Open",
      status: isClosed ? "completed" : "active",
    },
    {
      id: "exit",
      label: "Exit / Close",
      status: isClosed ? "completed" : "pending",
    },
  ];

  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-border-color pb-1.5">
        <span className="text-xs font-mono font-bold uppercase text-gray-200">
          Position Lifecycle & Execution Pipeline
        </span>
        <span className="text-[10px] font-mono text-cyan-400">
          DETERMINISTIC CHAIN
        </span>
      </div>

      <div className="flex items-center justify-between overflow-x-auto py-2 px-1">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isActive = step.status === "active";

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 min-w-[70px] text-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                    isCompleted
                      ? "bg-profit/20 border border-profit text-profit"
                      : isActive
                      ? "bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.4)] animate-pulse"
                      : "bg-surface-2 border border-border-color text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={11} />
                  ) : isActive ? (
                    <Circle size={8} className="fill-cyan-400 text-cyan-400" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono whitespace-nowrap ${
                    isActive
                      ? "text-cyan-400 font-bold"
                      : isCompleted
                      ? "text-gray-300"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[16px] mx-1 transition-colors ${
                    isCompleted ? "bg-profit/40" : "bg-surface-2"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Surface>
  );
}
