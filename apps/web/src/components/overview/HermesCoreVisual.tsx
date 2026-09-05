"use client";

import React from "react";
import { HermesStateType } from "@/components/ai/AIStatusIndicator";

interface HermesCoreVisualProps {
  state: HermesStateType;
  size?: number;
  className?: string;
}

export function HermesCoreVisual({
  state,
  size = 56,
  className = "",
}: HermesCoreVisualProps) {
  const isAnalyzing = state === "ANALYZING" || state === "RESEARCHING";
  const isReady = state === "PROPOSAL READY" || state === "AWAITING APPROVAL";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Hermes Intelligence Core: ${state}`}
    >
      {/* Outer subtle orbital ring */}
      <svg
        className={`absolute inset-0 w-full h-full text-cyan-500/30 ${
          isAnalyzing ? "animate-spin duration-1000" : "animate-spin duration-3000"
        }`}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />
      </svg>

      {/* Inner counter-rotating ring */}
      <svg
        className={`absolute inset-0 w-full h-full text-cyan-400/40 ${
          isAnalyzing
            ? "animate-spin-reverse duration-800"
            : "animate-spin-reverse duration-2500"
        }`}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="8 6"
        />
      </svg>

      {/* Center glowing intelligence core */}
      <div
        className={`relative flex items-center justify-center rounded-full bg-bg-950 border transition-all duration-300 ${
          isReady
            ? "border-cyan-400 shadow-[0_0_16px_rgba(0,229,255,0.7)]"
            : "border-cyan-500/60 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
        }`}
        style={{ width: size * 0.46, height: size * 0.46 }}
      >
        <div
          className={`w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45 transition-all ${
            isAnalyzing ? "animate-ping opacity-90" : "animate-pulse"
          }`}
        />
        <div className="absolute inset-0 rounded-full bg-cyan-500/20" />
      </div>

      {/* Subtle cardinal technical ticks */}
      <div className="absolute top-0 w-1 h-1 bg-cyan-400/60 rounded-full" />
      <div className="absolute bottom-0 w-1 h-1 bg-cyan-400/60 rounded-full" />
      <div className="absolute left-0 w-1 h-1 bg-cyan-400/60 rounded-full" />
      <div className="absolute right-0 w-1 h-1 bg-cyan-400/60 rounded-full" />
    </div>
  );
}
