"use client";

import React from "react";
import { Bot, Search, Brain, FileCheck, Clock, Zap, CheckCircle2 } from "lucide-react";

export type HermesStateType =
  | "MONITORING"
  | "ANALYZING"
  | "RESEARCHING"
  | "PROPOSAL READY"
  | "AWAITING APPROVAL"
  | "EXECUTING"
  | "COMPLETED";

export interface AIStatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  state: HermesStateType;
  agentName?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const stateConfig: Record<
  HermesStateType,
  {
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    glow: string;
    pulse: boolean;
  }
> = {
  MONITORING: {
    icon: <Bot size={13} className="text-cyan-400" />,
    color: "text-cyan-400",
    bg: "bg-surface-2",
    border: "border-border-hi",
    glow: "shadow-[0_0_8px_rgba(0,229,255,0.15)]",
    pulse: false,
  },
  ANALYZING: {
    icon: <Brain size={13} className="text-cyan-300" />,
    color: "text-cyan-300",
    bg: "bg-cyan-dim/30",
    border: "border-cyan-500/50",
    glow: "shadow-[0_0_10px_rgba(0,229,255,0.25)]",
    pulse: true,
  },
  RESEARCHING: {
    icon: <Search size={13} className="text-cyan-400" />,
    color: "text-cyan-400",
    bg: "bg-cyan-dim/20",
    border: "border-cyan-500/40",
    glow: "shadow-[0_0_8px_rgba(0,229,255,0.15)]",
    pulse: true,
  },
  "PROPOSAL READY": {
    icon: <FileCheck size={13} className="text-cyan-300" />,
    color: "text-cyan-300",
    bg: "bg-cyan-dim/40",
    border: "border-cyan-400",
    glow: "shadow-[0_0_12px_rgba(0,229,255,0.35)]",
    pulse: false,
  },
  "AWAITING APPROVAL": {
    icon: <Clock size={13} className="text-warning" />,
    color: "text-warning",
    bg: "bg-warning-dim/60",
    border: "border-warning/50",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    pulse: true,
  },
  EXECUTING: {
    icon: <Zap size={13} className="text-cyan-300" />,
    color: "text-cyan-300",
    bg: "bg-cyan-dim",
    border: "border-cyan-400",
    glow: "shadow-[0_0_14px_rgba(0,229,255,0.4)]",
    pulse: true,
  },
  COMPLETED: {
    icon: <CheckCircle2 size={13} className="text-profit" />,
    color: "text-profit",
    bg: "bg-profit-dim/40",
    border: "border-profit/40",
    glow: "shadow-[0_0_8px_rgba(0,230,118,0.15)]",
    pulse: false,
  },
};

export function AIStatusIndicator({
  state,
  agentName = "HERMES",
  size = "md",
  showIcon = true,
  className = "",
  ...props
}: AIStatusIndicatorProps) {
  const config = stateConfig[state] || stateConfig.MONITORING;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-2",
    lg: "px-3 py-1.5 text-sm gap-2.5",
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-md border select-none transition-all duration-200 ${config.bg} ${config.border} ${config.glow} ${sizeStyles} ${className}`}
      {...props}
    >
      <span className="flex items-center gap-1">
        {config.pulse ? (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        )}
        {showIcon && config.icon}
      </span>

      {agentName && (
        <span className="font-sans font-bold text-gray-400 text-[10px] tracking-wider uppercase">
          {agentName}
        </span>
      )}

      <span className={`font-mono font-bold tracking-tight uppercase ${config.color}`}>
        {state}
      </span>
    </div>
  );
}
