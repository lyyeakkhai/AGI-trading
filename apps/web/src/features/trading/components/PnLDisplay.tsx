"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface PnLDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;
  percentage?: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  layout?: "stacked" | "inline";
  showIcon?: boolean;
}

export function PnLDisplay({
  amount,
  percentage,
  currency = "$",
  size = "md",
  layout = "stacked",
  showIcon = true,
  className = "",
  ...props
}: PnLDisplayProps) {
  const isProfit = amount > 0;
  const isLoss = amount < 0;

  const colorClass = isProfit
    ? "text-profit"
    : isLoss
    ? "text-loss"
    : "text-gray-400";

  const formattedAmount = `${amount > 0 ? "+" : ""}${currency}${Math.abs(amount).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

  const formattedPercentage =
    percentage !== undefined
      ? `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`
      : null;

  const sizeStyles = {
    sm: {
      amount: "text-xs font-semibold",
      percent: "text-[10px]",
      icon: 12,
    },
    md: {
      amount: "text-sm font-bold",
      percent: "text-xs",
      icon: 14,
    },
    lg: {
      amount: "text-lg font-bold",
      percent: "text-xs font-semibold",
      icon: 16,
    },
  }[size];

  const IconComponent = isProfit
    ? ArrowUpRight
    : isLoss
    ? ArrowDownRight
    : Minus;

  if (layout === "inline") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-mono ${colorClass} ${className}`}
        {...props}
      >
        {showIcon && <IconComponent size={sizeStyles.icon} className="shrink-0" />}
        <span className={sizeStyles.amount}>{formattedAmount}</span>
        {formattedPercentage && (
          <span className={`opacity-85 ${sizeStyles.percent}`}>
            ({formattedPercentage})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col font-mono ${colorClass} ${className}`} {...props}>
      <div className="flex items-center gap-1">
        {showIcon && <IconComponent size={sizeStyles.icon} className="shrink-0" />}
        <span className={sizeStyles.amount}>{formattedAmount}</span>
      </div>
      {formattedPercentage && (
        <span className={`opacity-85 ${sizeStyles.percent} pl-4`}>
          {formattedPercentage}
        </span>
      )}
    </div>
  );
}
