"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { ButtonVariant, ButtonSize } from "./Button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon: React.ReactNode;
  "aria-label": string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-500 text-bg-950 hover:bg-cyan-400 active:bg-cyan-300 border border-transparent shadow-[0_0_10px_rgba(0,229,255,0.2)] focus-visible:ring-1 focus-visible:ring-cyan-300",
  secondary:
    "bg-surface-2 text-gray-300 border border-border-hi hover:bg-surface-elevated hover:text-white hover:border-cyan-500/30 active:bg-surface focus-visible:ring-1 focus-visible:ring-cyan-500/50",
  outline:
    "bg-transparent text-gray-400 border border-border-color hover:border-border-hi hover:bg-surface-2 hover:text-gray-200 focus-visible:ring-1 focus-visible:ring-border-hi",
  ghost:
    "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-surface-2 border border-transparent focus-visible:ring-1 focus-visible:ring-border-hi",
  danger:
    "bg-loss-dim text-loss border border-loss/40 hover:bg-loss/20 hover:border-loss/80 focus-visible:ring-1 focus-visible:ring-loss/60 shadow-[0_0_8px_rgba(255,59,48,0.15)]",
  success:
    "bg-profit-dim text-profit border border-profit/40 hover:bg-profit/20 hover:border-profit/80 focus-visible:ring-1 focus-visible:ring-profit/60 shadow-[0_0_8px_rgba(0,230,118,0.15)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "w-6 h-6 rounded-sm text-xs",
  sm: "w-7 h-7 rounded-md text-sm",
  md: "w-8 h-8 rounded-md text-base",
  lg: "w-10 h-10 rounded-md text-lg",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center transition-all duration-150 select-none outline-none disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
