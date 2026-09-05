"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      mono = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={`w-full bg-surface border rounded-md text-xs text-gray-100 placeholder-gray-500 transition-colors outline-none duration-150 py-1.5 ${
              leftIcon ? "pl-8" : "pl-3"
            } ${rightIcon ? "pr-8" : "pr-3"} ${
              mono ? "font-mono tracking-tight" : "font-sans"
            } ${
              error
                ? "border-loss focus:ring-1 focus:ring-loss"
                : "border-border-color focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
            } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 flex items-center pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-[10px] font-mono text-loss">{error}</span>
        ) : helperText ? (
          <span className="text-[10px] text-gray-500">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
