"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { Surface } from "./Surface";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <Inbox size={32} className="text-gray-500" />,
  title,
  description,
  action,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <Surface
      variant="default"
      padded="lg"
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface-2 border border-border-color mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-200 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-400 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </Surface>
  );
}
