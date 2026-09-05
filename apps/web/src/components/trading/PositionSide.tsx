"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export type PositionSideType = "LONG" | "SHORT";

export interface PositionSideProps extends React.HTMLAttributes<HTMLSpanElement> {
  side: PositionSideType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function PositionSide({
  side,
  size = "md",
  showIcon = true,
  className = "",
  ...props
}: PositionSideProps) {
  const isLong = side === "LONG";

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-[11px] px-2 py-0.5 gap-1.5",
    lg: "text-xs px-2.5 py-1 gap-1.5",
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  }[size];

  if (isLong) {
    return (
      <span
        className={`inline-flex items-center font-mono font-bold tracking-wider rounded bg-profit-dim text-profit border border-profit/50 shadow-[0_0_8px_rgba(0,230,118,0.15)] select-none ${sizeStyles} ${className}`}
        {...props}
      >
        {showIcon && <TrendingUp size={iconSizes} className="shrink-0" />}
        <span>LONG</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-wider rounded bg-loss-dim text-loss border border-loss/50 shadow-[0_0_8px_rgba(255,59,48,0.15)] select-none ${sizeStyles} ${className}`}
      {...props}
    >
      {showIcon && <TrendingDown size={iconSizes} className="shrink-0" />}
      <span>SHORT</span>
    </span>
  );
}
