"use client";

import React from "react";
import { ProposalStatus } from "@/lib/mockTradeProposalsData";

export interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  size?: "sm" | "md";
  className?: string;
}

export function ProposalStatusBadge({
  status,
  size = "sm",
  className = "",
}: ProposalStatusBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  switch (status) {
    case "Awaiting Approval":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-warning-dim/40 border border-warning/60 text-warning shadow-[0_0_8px_rgba(245,158,11,0.2)] ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
          AWAITING APPROVAL
        </span>
      );

    case "Risk Approved":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded bg-cyan-dim/30 border border-cyan-500/40 text-cyan-300 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          RISK APPROVED
        </span>
      );

    case "Under Review":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          UNDER REVIEW
        </span>
      );

    case "Approved":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-profit-dim/40 border border-profit/60 text-profit shadow-[0_0_8px_rgba(0,230,118,0.25)] ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-profit" />
          APPROVED
        </span>
      );

    case "Rejected":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-loss-dim/30 border border-loss/50 text-loss ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-loss" />
          REJECTED
        </span>
      );

    case "Expired":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-medium rounded bg-gray-800/40 border border-border-color text-gray-500 line-through ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          EXPIRED
        </span>
      );

    case "Executed":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-cyan-500/20 border border-cyan-400 text-cyan-200 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
          EXECUTED
        </span>
      );

    case "Draft":
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
