"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  variant?: "cyan" | "white" | "profit" | "loss";
}

export function Spinner({
  size = "md",
  variant = "cyan",
  className = "",
  ...props
}: SpinnerProps) {
  const sizeClass = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  }[size];

  const variantClass = {
    cyan: "text-cyan-500",
    white: "text-gray-200",
    profit: "text-profit",
    loss: "text-loss",
  }[variant];

  return (
    <Loader2
      className={`animate-spin ${sizeClass} ${variantClass} ${className}`}
      {...props}
    />
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({
  width,
  height,
  rounded = "md",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={`bg-surface-2 animate-pulse ${roundedClass} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subtext?: string;
}

export function LoadingState({
  message = "PROCESSING FEED...",
  subtext,
  className = "",
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      {...props}
    >
      <Spinner size="lg" variant="cyan" className="mb-3" />
      <span className="text-xs font-mono font-medium tracking-wider text-cyan-400">
        {message}
      </span>
      {subtext && (
        <span className="text-[11px] text-gray-500 mt-1">{subtext}</span>
      )}
    </div>
  );
}
