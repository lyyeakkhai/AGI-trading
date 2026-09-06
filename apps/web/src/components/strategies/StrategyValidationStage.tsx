"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { ValidationStage, VALIDATION_STAGES_LIST } from "@/lib/mockStrategiesData";
import { Check, Circle, ShieldCheck } from "lucide-react";

interface StrategyValidationStageProps {
  currentStage: ValidationStage;
  className?: string;
}

export function StrategyValidationStage({
  currentStage,
  className = "",
}: StrategyValidationStageProps) {
  const currentIndex = VALIDATION_STAGES_LIST.indexOf(currentStage);

  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-border-color pb-1.5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Validation Ladder (Stage {currentIndex + 1} of 9)
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-cyan-400 border border-border-color font-semibold">
          {currentStage.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center justify-between overflow-x-auto py-2 px-1">
        {VALIDATION_STAGES_LIST.map((stage, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center gap-1.5 min-w-[65px] text-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                    isPassed
                      ? "bg-profit/20 border border-profit text-profit"
                      : isCurrent
                      ? "bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)] animate-pulse"
                      : "bg-surface-2 border border-border-color text-gray-600"
                  }`}
                >
                  {isPassed ? (
                    <Check size={11} />
                  ) : isCurrent ? (
                    <Circle size={8} className="fill-cyan-400 text-cyan-400" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-mono whitespace-nowrap ${
                    isCurrent
                      ? "text-cyan-400 font-bold"
                      : isPassed
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  {stage}
                </span>
              </div>

              {index < VALIDATION_STAGES_LIST.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[12px] mx-1 transition-colors ${
                    isPassed ? "bg-profit/40" : "bg-surface-2"
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
