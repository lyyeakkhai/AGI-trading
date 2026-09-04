"use client";

import React from "react";

export interface ConfidenceIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number; // 0 to 100
  showBar?: boolean;
  size?: "sm" | "md";
}

export function ConfidenceIndicator({
  score,
  showBar = true,
  size = "md",
  className = "",
  ...props
}: ConfidenceIndicatorProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  let levelText = "LOW";
  let colorClass = "text-gray-400";
  let barColor = "bg-gray-400";

  if (clampedScore >= 80) {
    levelText = "HIGH";
    colorClass = "text-cyan-300";
    barColor = "bg-cyan-400 shadow-[0_0_8px_rgba(34,223,255,0.6)]";
  } else if (clampedScore >= 55) {
    levelText = "MODERATE";
    colorClass = "text-cyan-400";
    barColor = "bg-cyan-500 shadow-[0_0_6px_rgba(0,229,255,0.4)]";
  } else {
    levelText = "LOW";
    colorClass = "text-gray-400";
    barColor = "bg-gray-500";
  }

  return (
    <div className={`inline-flex flex-col gap-1 select-none ${className}`} {...props}>
      <div className="flex items-center gap-1.5 font-mono">
        <span
          className={`font-bold tracking-tight ${
            size === "sm" ? "text-xs" : "text-sm"
          } ${colorClass}`}
        >
          {clampedScore}%
        </span>
        <span className="text-[10px] uppercase font-semibold text-gray-400">
          {levelText}
        </span>
      </div>
      {showBar && (
        <div className="w-16 h-1 rounded-full bg-surface-2 overflow-hidden border border-border-color">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      )}
    </div>
  );
}
