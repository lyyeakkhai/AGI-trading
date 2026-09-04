"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Surface } from "./Surface";

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  change?: number | string;
  changeType?: "profit" | "loss" | "neutral" | "auto";
  changePeriod?: string;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Metric({
  label,
  value,
  change,
  changeType = "auto",
  changePeriod,
  subtext,
  icon,
  badge,
  size = "md",
  className = "",
  ...props
}: MetricProps) {
  // Determine trend color
  let trendClass = "text-gray-400";
  let TrendIcon = Minus;

  if (change !== undefined) {
    const numChange = typeof change === "number" ? change : parseFloat(change);
    const isProfit = changeType === "profit" || (changeType === "auto" && numChange > 0);
    const isLoss = changeType === "loss" || (changeType === "auto" && numChange < 0);

    if (isProfit) {
      trendClass = "text-profit";
      TrendIcon = ArrowUpRight;
    } else if (isLoss) {
      trendClass = "text-loss";
      TrendIcon = ArrowDownRight;
    }
  }

  const valueSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Surface
      variant="default"
      padded="md"
      className={`flex flex-col justify-between ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 truncate">
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge}
          {icon && <div className="text-gray-500">{icon}</div>}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`font-mono font-bold tracking-tight text-gray-100 ${valueSizes[size]}`}>
          {value}
        </div>
      </div>

      {(change !== undefined || subtext) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-color/60 text-xs">
          {change !== undefined && (
            <span className={`inline-flex items-center font-mono font-medium gap-0.5 ${trendClass}`}>
              <TrendIcon size={13} className="shrink-0" />
              <span>
                {typeof change === "number" && change > 0 ? `+${change}` : change}
                {typeof change === "number" && !change.toString().includes("%") ? "%" : ""}
              </span>
            </span>
          )}
          {changePeriod && (
            <span className="text-[11px] text-gray-500 font-mono">
              {changePeriod}
            </span>
          )}
          {subtext && (
            <span className="text-[11px] text-gray-400 truncate ml-auto">
              {subtext}
            </span>
          )}
        </div>
      )}
    </Surface>
  );
}
