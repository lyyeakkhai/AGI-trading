"use client";

import React from "react";
import { BacktestStatus } from "@/lib/mockBacktestsData";
import { CheckCircle2, Clock, AlertTriangle, XCircle, PlayCircle, FileText } from "lucide-react";

interface BacktestStatusBadgeProps {
  status: BacktestStatus;
  className?: string;
}

export function BacktestStatusBadge({ status, className = "" }: BacktestStatusBadgeProps) {
  switch (status) {
    case "completed":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          COMPLETED
        </span>
      );
    case "running":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse ${className}`}>
          <PlayCircle className="w-3 h-3 text-cyan-400 animate-spin" />
          RUNNING
        </span>
      );
    case "queued":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
          <Clock className="w-3 h-3 text-amber-400" />
          QUEUED
        </span>
      );
    case "failed":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20 ${className}`}>
          <AlertTriangle className="w-3 h-3 text-red-400" />
          FAILED
        </span>
      );
    case "cancelled":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 ${className}`}>
          <XCircle className="w-3 h-3 text-gray-400" />
          CANCELLED
        </span>
      );
    case "draft":
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-800 text-gray-400 border border-gray-700 ${className}`}>
          <FileText className="w-3 h-3 text-gray-400" />
          DRAFT
        </span>
      );
  }
}
