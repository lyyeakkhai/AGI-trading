"use client";

import React from "react";

export type ProgressVariant = "cyan" | "profit" | "loss" | "warning";

export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number;
  variant?: ProgressVariant;
  size?: "xs" | "sm" | "md";
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
}

const variantStyles: Record<ProgressVariant, { bar: string; glow: string }> = {
  cyan: {
    bar: "bg-cyan-500",
    glow: "shadow-[0_0_8px_rgba(0,229,255,0.6)]",
  },
  profit: {
    bar: "bg-profit",
    glow: "shadow-[0_0_8px_rgba(0,230,118,0.6)]",
  },
  loss: {
    bar: "bg-loss",
    glow: "shadow-[0_0_8px_rgba(255,59,48,0.6)]",
  },
  warning: {
    bar: "bg-warning",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.6)]",
  },
};

const sizeStyles = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
};

export function ProgressIndicator({
  value = 0,
  max = 100,
  variant = "cyan",
  size = "sm",
  label,
  showValue = false,
  indeterminate = false,
  className = "",
  ...props
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const styles = variantStyles[variant];

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          {label && <span className="text-gray-400 uppercase">{label}</span>}
          {showValue && !indeterminate && (
            <span className="text-gray-200 font-bold">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-surface-2 border border-border-color ${sizeStyles[size]}`}
      >
        {indeterminate ? (
          <div
            className={`h-full w-1/3 rounded-full ${styles.bar} ${styles.glow} animate-indeterminate`}
          />
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${styles.bar} ${styles.glow}`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}
