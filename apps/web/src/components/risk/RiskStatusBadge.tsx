"use client";

import React from "react";
import { RiskState } from "@/lib/mockRiskData";
import { ShieldCheck, AlertTriangle, AlertOctagon, Lock } from "lucide-react";

interface RiskStatusBadgeProps {
  status: RiskState;
  className?: string;
  showIcon?: boolean;
}

export function RiskStatusBadge({
  status,
  className = "",
  showIcon = true,
}: RiskStatusBadgeProps) {
  switch (status) {
    case "HEALTHY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
          HEALTHY
        </span>
      );
    case "WARNING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          WARNING
        </span>
      );
    case "CRITICAL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse ${className}`}
        >
          {showIcon && <AlertOctagon className="w-3.5 h-3.5 text-red-400" />}
          CRITICAL
        </span>
      );
    case "LOCKED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-950/40 text-red-400 border border-red-500/40 ${className}`}
        >
          {showIcon && <Lock className="w-3.5 h-3.5 text-red-400" />}
          LOCKED
        </span>
      );
    default:
      return null;
  }
}
