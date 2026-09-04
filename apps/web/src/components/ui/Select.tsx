"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
  mono?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      mono = false,
      children,
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
          <select
            ref={ref}
            disabled={disabled}
            className={`w-full appearance-none bg-surface border rounded-md text-xs text-gray-200 transition-colors duration-150 outline-none pl-3 pr-8 py-1.5 cursor-pointer ${
              mono ? "font-mono tracking-tight" : "font-sans"
            } ${
              error
                ? "border-loss focus:ring-1 focus:ring-loss"
                : "border-border-color focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
            } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-bg-900 text-gray-200 py-1"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-2.5 pointer-events-none text-gray-500">
            <ChevronDown size={14} />
          </div>
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

Select.displayName = "Select";
