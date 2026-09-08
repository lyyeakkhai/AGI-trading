"use client";

import React from "react";
import { Shield, ShieldAlert, ShieldX, ShieldCheck } from "lucide-react";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const riskConfig: Record<
  RiskLevel,
  { container: string; icon: React.ReactNode; text: string }
> = {
  LOW: {
    container:
      "bg-profit-dim/60 text-profit border border-profit/40 shadow-[0_0_6px_rgba(0,230,118,0.1)]",
    icon: <ShieldCheck size={13} className="shrink-0 text-profit" />,
    text: "LOW RISK",
  },
  MEDIUM: {
    container:
      "bg-warning-dim/60 text-warning border border-warning/40 shadow-[0_0_6px_rgba(245,158,11,0.15)]",
    icon: <Shield size={13} className="shrink-0 text-warning" />,
    text: "MED RISK",
  },
  HIGH: {
    container:
      "bg-loss-dim/60 text-loss border border-loss/40 shadow-[0_0_8px_rgba(255,59,48,0.2)]",
    icon: <ShieldAlert size={13} className="shrink-0 text-loss" />,
    text: "HIGH RISK",
  },
  BLOCKED: {
    container:
      "bg-loss-dim text-loss border border-loss/80 shadow-[0_0_12px_rgba(255,59,48,0.3)] animate-pulse",
    icon: <ShieldX size={13} className="shrink-0 text-loss" />,
    text: "BLOCKED",
  },
};

export function RiskBadge({
  level,
  size = "md",
  showIcon = true,
  className = "",
  ...props
}: RiskBadgeProps) {
  const config = riskConfig[level];

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-[11px] px-2 py-0.5 gap-1.5",
    lg: "text-xs px-2.5 py-1 gap-1.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-wider rounded select-none ${config.container} ${sizeStyles} ${className}`}
      {...props}
    >
      {showIcon && config.icon}
      <span>{config.text}</span>
    </span>
  );
}
