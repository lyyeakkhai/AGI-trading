"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "ghost" 
  | "outline" 
  | "danger" 
  | "success";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-500 text-bg-950 font-semibold hover:bg-cyan-400 active:bg-cyan-300 border border-transparent shadow-[0_0_10px_rgba(0,229,255,0.2)] focus-visible:ring-1 focus-visible:ring-cyan-300",
  secondary:
    "bg-surface-2 text-gray-200 border border-border-hi hover:bg-surface-elevated hover:border-cyan-500/30 active:bg-surface focus-visible:ring-1 focus-visible:ring-cyan-500/50",
  outline:
    "bg-transparent text-gray-300 border border-border-color hover:border-border-hi hover:bg-surface-2 hover:text-white focus-visible:ring-1 focus-visible:ring-border-hi",
  ghost:
    "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-surface-2 border border-transparent focus-visible:ring-1 focus-visible:ring-border-hi",
  danger:
    "bg-loss-dim text-loss border border-loss/40 hover:bg-loss/20 hover:border-loss/80 focus-visible:ring-1 focus-visible:ring-loss/60 shadow-[0_0_8px_rgba(255,59,48,0.15)]",
  success:
    "bg-profit-dim text-profit border border-profit/40 hover:bg-profit/20 hover:border-profit/80 focus-visible:ring-1 focus-visible:ring-profit/60 shadow-[0_0_8px_rgba(0,230,118,0.15)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-[11px] gap-1.5 rounded-sm",
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
  md: "h-8 px-3 text-xs gap-2 rounded-md",
  lg: "h-10 px-4 text-sm gap-2.5 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
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
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none outline-none disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
