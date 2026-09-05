"use client";

import React, { forwardRef } from "react";

export type SurfaceVariant = "default" | "elevated" | "interactive" | "subtle";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  glow?: "none" | "cyan" | "profit" | "loss";
  padded?: boolean | "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<SurfaceVariant, string> = {
  default: "bg-surface border border-border-color",
  elevated: "bg-surface-elevated border border-border-hi shadow-sm",
  interactive:
    "bg-surface border border-border-color hover:border-border-hi hover:bg-surface-hover transition-colors duration-150 cursor-pointer focus-visible:ring-1 focus-visible:ring-cyan-500/40 outline-none",
  subtle: "bg-bg-900 border border-border-color",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const glowStyles = {
  none: "",
  cyan: "shadow-[0_0_12px_rgba(0,229,255,0.12)] border-cyan-500/40",
  profit: "shadow-[0_0_12px_rgba(0,230,118,0.12)] border-profit/40",
  loss: "shadow-[0_0_12px_rgba(255,59,48,0.12)] border-loss/40",
};

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      children,
      variant = "default",
      glow = "none",
      padded = "md",
      className = "",
      ...props
    },
    ref
  ) => {
    const padClass =
      typeof padded === "boolean"
        ? padded
          ? paddingStyles.md
          : paddingStyles.none
        : paddingStyles[padded];

    return (
      <div
        ref={ref}
        className={`rounded-lg ${variantStyles[variant]} ${glowStyles[glow]} ${padClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = "Surface";
