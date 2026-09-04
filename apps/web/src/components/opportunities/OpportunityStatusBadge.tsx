"use client";

import React from "react";
import { OpportunityStatus } from "@/lib/mockOpportunitiesData";

export interface OpportunityStatusBadgeProps {
  status: OpportunityStatus;
  size?: "sm" | "md";
  className?: string;
}

export function OpportunityStatusBadge({
  status,
  size = "sm",
  className = "",
}: OpportunityStatusBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  switch (status) {
    case "New":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-cyan-dim/30 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(0,229,255,0.15)] ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          NEW
        </span>
      );

    case "Investigating":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-cyan-dim/40 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.25)] ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
          INVESTIGATING
        </span>
      );

    case "Confirmed":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-profit-dim/40 border border-profit/50 text-profit shadow-[0_0_8px_rgba(0,230,118,0.2)] ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-profit" />
          CONFIRMED
        </span>
      );

    case "Monitoring":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          MONITORING
        </span>
      );

    case "Weakening":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded bg-warning-dim/30 border border-warning/40 text-warning ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-warning" />
          WEAKENING
        </span>
      );

    case "Expired":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-medium rounded bg-gray-800/40 border border-border-color text-gray-500 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          EXPIRED
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase rounded bg-surface-2 border border-border-color text-gray-400 ${sizeClasses} ${className}`}
        >
          {status}
        </span>
      );
  }
}
