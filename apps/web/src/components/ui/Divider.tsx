"use client";

import React from "react";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Divider({
  orientation = "horizontal",
  label,
  className = "",
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`inline-block w-px self-stretch bg-border-color ${className}`}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={`flex items-center gap-3 my-3 w-full ${className}`}
        {...props}
      >
        <div className="flex-1 h-px bg-border-color" />
        <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
          {label}
        </span>
        <div className="flex-1 h-px bg-border-color" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={`w-full h-px bg-border-color my-3 ${className}`}
      {...props}
    />
  );
}
