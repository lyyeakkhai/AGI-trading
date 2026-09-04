"use client";

import React from "react";
import { HermesVisualState } from "@/lib/mockHermesData";

export interface HermesCoreProps {
  state?: HermesVisualState;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function HermesCore({
  state = "monitoring",
  size = "lg",
  className = "",
}: HermesCoreProps) {
  const sizePixels = {
    sm: 48,
    md: 72,
    lg: 104,
    xl: 140,
  }[size];

  // Specific state behaviors
  const isAnalyzing = state === "analyzing" || state === "researching";
  const isOpportunity = state === "opportunity" || state === "proposal";
  const isApproval = state === "approval";
  const isExecuting = state === "executing";
  const isCompleted = state === "completed";

  // Accent ring colors
  let accentColor = "text-cyan-500/40";
  let coreBorderColor = "border-cyan-500/60 shadow-[0_0_15px_rgba(0,229,255,0.4)]";
  let innerDotColor = "bg-cyan-400";

  if (isApproval) {
    accentColor = "text-warning/50";
    coreBorderColor = "border-warning/70 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
    innerDotColor = "bg-warning";
  } else if (isCompleted) {
    accentColor = "text-profit/50";
    coreBorderColor = "border-profit/70 shadow-[0_0_15px_rgba(0,230,118,0.5)]";
    innerDotColor = "bg-profit";
  } else if (isOpportunity) {
    coreBorderColor = "border-cyan-400 shadow-[0_0_22px_rgba(0,229,255,0.7)]";
    innerDotColor = "bg-cyan-300";
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: sizePixels, height: sizePixels }}
      title={`Hermes Intelligence Core: ${state.toUpperCase()}`}
    >
      {/* Outermost Telemetry Orbital Ring */}
      <svg
        className={`absolute inset-0 w-full h-full ${accentColor} ${
          isAnalyzing
            ? "animate-spin duration-700"
            : isExecuting
            ? "animate-spin duration-500"
            : "animate-spin duration-3000"
        }`}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 8"
        />
      </svg>

      {/* Counter-Rotating Segmented Precision Ring */}
      <svg
        className={`absolute inset-0 w-full h-full ${accentColor} ${
          isAnalyzing
            ? "animate-spin-reverse duration-800"
            : isExecuting
            ? "animate-spin-reverse duration-600"
            : "animate-spin-reverse duration-2500"
        }`}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
        {/* Angular ticks */}
        <line x1="50" y1="12" x2="50" y2="16" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="84" x2="50" y2="88" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="50" x2="16" y2="50" stroke="currentColor" strokeWidth="2" />
        <line x1="84" y1="50" x2="88" y2="50" stroke="currentColor" strokeWidth="2" />
      </svg>

      {/* Middle Neural Boundary */}
      <div
        className={`absolute rounded-full border border-cyan-500/20 ${
          isOpportunity ? "animate-pulse" : ""
        }`}
        style={{
          width: sizePixels * 0.58,
          height: sizePixels * 0.58,
        }}
      />

      {/* Central Geometric Intelligence Core */}
      <div
        className={`relative flex items-center justify-center rounded-full bg-bg-950 border transition-all duration-300 ${coreBorderColor}`}
        style={{ width: sizePixels * 0.42, height: sizePixels * 0.42 }}
      >
        {/* Subtle Ambient Radial Glow inside core */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/15" />

        {/* Micro Digital Entity Element */}
        <div
          className={`w-3 h-3 rounded-sm rotate-45 transition-all duration-300 ${innerDotColor} ${
            isAnalyzing
              ? "animate-ping opacity-85"
              : isExecuting
              ? "animate-pulse"
              : "opacity-90"
          }`}
        />

        {/* Geometric Cross Ticks */}
        <div className="absolute w-1 h-1 bg-cyan-400/80 rounded-full -top-1" />
        <div className="absolute w-1 h-1 bg-cyan-400/80 rounded-full -bottom-1" />
        <div className="absolute w-1 h-1 bg-cyan-400/80 rounded-full -left-1" />
        <div className="absolute w-1 h-1 bg-cyan-400/80 rounded-full -right-1" />
      </div>

      {/* Fixed Cardinal Sub-pixel Indicators */}
      <div className="absolute top-1 left-1 w-1 h-1 bg-cyan-500/40 rounded-full" />
      <div className="absolute top-1 right-1 w-1 h-1 bg-cyan-500/40 rounded-full" />
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-cyan-500/40 rounded-full" />
      <div className="absolute bottom-1 right-1 w-1 h-1 bg-cyan-500/40 rounded-full" />
    </div>
  );
}
