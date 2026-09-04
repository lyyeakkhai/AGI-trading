"use client";

import React from "react";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  action,
  className = "",
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-color ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-200">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
