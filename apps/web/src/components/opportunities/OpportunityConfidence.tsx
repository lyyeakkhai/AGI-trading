"use client";

import React from "react";

export interface OpportunityConfidenceProps {
  score: number;
  size?: "sm" | "md";
  showBandLabel?: boolean;
  className?: string;
}

export function OpportunityConfidence({
  score,
  size = "md",
  showBandLabel = true,
  className = "",
}: OpportunityConfidenceProps) {
  let band = "Low";
  let textColor = "text-gray-400";
  let barColor = "bg-gray-600";
  let glow = "";

  if (score >= 85) {
    band = "Very High";
    textColor = "text-cyan-300 font-bold";
    barColor = "bg-cyan-300";
    glow = "shadow-[0_0_8px_rgba(0,229,255,0.4)]";
  } else if (score >= 70) {
    band = "High";
    textColor = "text-cyan-400 font-bold";
    barColor = "bg-cyan-400";
    glow = "shadow-[0_0_6px_rgba(0,229,255,0.25)]";
  } else if (score >= 50) {
    band = "Moderate";
    textColor = "text-gray-300 font-medium";
    barColor = "bg-cyan-500/70";
  } else {
    band = "Low";
    textColor = "text-gray-500";
    barColor = "bg-gray-600";
  }

  const heightClass = size === "sm" ? "h-1" : "h-1.5";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={`flex flex-col gap-1 select-none font-mono ${className}`}
      title={`Opportunity System Confidence: ${score}% (${band}) — Model signal conviction, not a profit guarantee.`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`${textClass} font-bold ${textColor}`}>
          {score}%
        </span>
        {showBandLabel && (
          <span className="text-[10px] text-gray-400 uppercase tracking-tight">
            {band}
          </span>
        )}
      </div>

      {/* Progress Track */}
      <div className={`w-full bg-bg-950 rounded-full overflow-hidden border border-border-color/60 ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-300 ${barColor} ${glow}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
