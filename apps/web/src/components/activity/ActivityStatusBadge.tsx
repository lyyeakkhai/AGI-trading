"use client";

import React from "react";
import { ActivityEventStatus, ActivityEventType } from "@/lib/mockActivityData";
import { CheckCircle2, AlertTriangle, XCircle, Info, Ban } from "lucide-react";

interface ActivityStatusBadgeProps {
  status: ActivityEventStatus;
  className?: string;
}

export function ActivityStatusBadge({ status, className = "" }: ActivityStatusBadgeProps) {
  switch (status) {
    case "SUCCESS":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-sans font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
          <CheckCircle2 className="w-2.5 h-2.5" />
          SUCCESS
        </span>
      );
    case "WARNING":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-sans font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
          <AlertTriangle className="w-2.5 h-2.5" />
          WARNING
        </span>
      );
    case "FAILED":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-sans font-bold bg-red-500/10 text-red-400 border border-red-500/20 ${className}`}>
          <XCircle className="w-2.5 h-2.5" />
          FAILED
        </span>
      );
    case "REJECTED":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-sans font-bold bg-red-500/10 text-red-400 border border-red-500/20 ${className}`}>
          <XCircle className="w-2.5 h-2.5" />
          REJECTED
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-sans font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 ${className}`}>
          <Ban className="w-2.5 h-2.5" />
          CANCELLED
        </span>
      );
    case "INFO":
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-sans font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${className}`}>
          <Info className="w-2.5 h-2.5" />
          INFO
        </span>
      );
  }
}

interface ActivityTypeBadgeProps {
  type: ActivityEventType;
  className?: string;
}

export function ActivityTypeBadge({ type, className = "" }: ActivityTypeBadgeProps) {
  const getStyle = () => {
    switch (type) {
      case "RISK":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "HERMES":
      case "OPPORTUNITY":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
      case "TRADE_PROPOSAL":
      case "EXECUTION":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "POSITION":
      case "PORTFOLIO":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "STRATEGY":
      case "BACKTEST":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ERROR":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "SECURITY":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "MARKET":
      case "SYSTEM":
      default:
        return "bg-surface-2 text-text-muted border-border";
    }
  };

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-xl text-[10px] font-sans font-medium uppercase tracking-wider border ${getStyle()} ${className}`}>
      {type}
    </span>
  );
}
