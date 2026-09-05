"use client";

import React from "react";

export type StatusType = "online" | "offline" | "busy" | "warning" | "error" | "ai";

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  label?: string;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<StatusType, { dot: string; glow: string; text: string }> = {
  online: {
    dot: "bg-profit",
    glow: "shadow-[0_0_8px_rgba(0,230,118,0.7)]",
    text: "text-profit",
  },
  offline: {
    dot: "bg-gray-500",
    glow: "shadow-none",
    text: "text-gray-400",
  },
  busy: {
    dot: "bg-cyan-400",
    glow: "shadow-[0_0_8px_rgba(34,223,255,0.8)]",
    text: "text-cyan-400",
  },
  ai: {
    dot: "bg-cyan-500",
    glow: "shadow-[0_0_8px_rgba(0,229,255,0.8)]",
    text: "text-cyan-400",
  },
  warning: {
    dot: "bg-warning",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.7)]",
    text: "text-warning",
  },
  error: {
    dot: "bg-loss",
    glow: "shadow-[0_0_8px_rgba(255,59,48,0.8)]",
    text: "text-loss",
  },
};

const dotSizes = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export function StatusIndicator({
  status,
  label,
  pulse = false,
  size = "md",
  className = "",
  ...props
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} {...props}>
      <span className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dot}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${dotSizes[size]} ${config.dot} ${config.glow}`}
        />
      </span>
      {label && (
        <span className={`font-mono text-xs font-medium tracking-tight ${config.text}`}>
          {label}
        </span>
      )}
    </div>
  );
}
