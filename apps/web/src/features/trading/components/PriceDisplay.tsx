"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface PriceDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  symbol?: string;
  price: number | string;
  currency?: string;
  change24h?: number;
  size?: "sm" | "md" | "lg" | "xl";
  inline?: boolean;
}

export function PriceDisplay({
  symbol,
  price,
  currency = "$",
  change24h,
  size = "md",
  inline = false,
  className = "",
  ...props
}: PriceDisplayProps) {
  const formattedPrice =
    typeof price === "number"
      ? price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : price;

  const isPositive = change24h !== undefined && change24h > 0;
  const isNegative = change24h !== undefined && change24h < 0;

  const sizeStyles = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  if (inline) {
    return (
      <div className={`inline-flex items-center gap-2 font-mono ${className}`} {...props}>
        {symbol && (
          <span className="text-xs font-semibold text-gray-400 tracking-wider">
            {symbol}
          </span>
        )}
        <span className={`font-bold text-gray-100 ${sizeStyles}`}>
          {currency}{formattedPrice}
        </span>
        {change24h !== undefined && (
          <span
            className={`text-xs font-semibold inline-flex items-center ${
              isPositive
                ? "text-profit"
                : isNegative
                ? "text-loss"
                : "text-gray-400"
            }`}
          >
            {isPositive && "+"}
            {change24h.toFixed(2)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`} {...props}>
      {symbol && (
        <span className="text-[11px] font-mono font-semibold tracking-wider text-gray-400 uppercase">
          {symbol}
        </span>
      )}
      <div className="flex items-baseline gap-2 mt-0.5">
        <span className={`font-mono font-bold tracking-tight text-gray-100 ${sizeStyles}`}>
          {currency}{formattedPrice}
        </span>
        {change24h !== undefined && (
          <span
            className={`inline-flex items-center text-xs font-mono font-semibold ${
              isPositive
                ? "text-profit"
                : isNegative
                ? "text-loss"
                : "text-gray-400"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={13} className="shrink-0" />
            ) : isNegative ? (
              <ArrowDownRight size={13} className="shrink-0" />
            ) : null}
            <span>
              {isPositive && "+"}
              {change24h.toFixed(2)}%
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
