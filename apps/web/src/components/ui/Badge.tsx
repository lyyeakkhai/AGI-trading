"use client";

import React from "react";

export type BadgeVariant =
  | "neutral"
  | "cyan"
  | "profit"
  | "loss"
  | "warning"
  | "info"
  | "outline";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  neutral: {
    container: "bg-surface-2 text-gray-300 border border-border-color",
    dot: "bg-gray-400",
  },
  cyan: {
    container: "bg-cyan-dim/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.1)]",
    dot: "bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.6)]",
  },
  profit: {
    container: "bg-profit-dim/80 text-profit border border-profit/40 shadow-[0_0_6px_rgba(0,230,118,0.1)]",
    dot: "bg-profit shadow-[0_0_6px_rgba(0,230,118,0.6)]",
  },
  loss: {
    container: "bg-loss-dim/80 text-loss border border-loss/40 shadow-[0_0_6px_rgba(255,59,48,0.1)]",
    dot: "bg-loss shadow-[0_0_6px_rgba(255,59,48,0.6)]",
  },
  warning: {
    container: "bg-warning-dim/80 text-warning border border-warning/40 shadow-[0_0_6px_rgba(245,158,11,0.1)]",
    dot: "bg-warning shadow-[0_0_6px_rgba(245,158,11,0.6)]",
  },
  info: {
    container: "bg-info-dim/80 text-info border border-info/40",
    dot: "bg-info",
  },
  outline: {
    container: "bg-transparent text-gray-400 border border-border-hi",
    dot: "bg-gray-500",
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1 rounded-sm",
  md: "text-[11px] px-2 py-0.5 gap-1.5 rounded-md",
  lg: "text-xs px-2.5 py-1 gap-1.5 rounded-md",
};

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  icon,
  className = "",
  ...props
}: BadgeProps) {
  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium tracking-tight whitespace-nowrap select-none ${currentVariant.container} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dot} ${
            pulse ? "animate-pulse" : ""
          }`}
        />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
