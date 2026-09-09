"use client";

import React from "react";
import { Clock, CheckCircle, Play, CheckCircle2, Ban, XCircle } from "lucide-react";

export type OrderStatusType =
  | "PENDING"
  | "APPROVED"
  | "EXECUTING"
  | "FILLED"
  | "CANCELLED"
  | "REJECTED";

export interface OrderStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OrderStatusType;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const statusConfig: Record<
  OrderStatusType,
  { container: string; icon: React.ReactNode; label: string }
> = {
  PENDING: {
    container: "bg-surface-2 text-gray-400 border border-border-color",
    icon: <Clock size={12} className="text-gray-400" />,
    label: "PENDING",
  },
  APPROVED: {
    container: "bg-cyan-dim/40 text-cyan-300 border border-cyan-500/40",
    icon: <CheckCircle size={12} className="text-cyan-400" />,
    label: "APPROVED",
  },
  EXECUTING: {
    container: "bg-cyan-dim text-cyan-300 border border-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.25)] animate-pulse",
    icon: <Play size={12} className="text-cyan-400" />,
    label: "EXECUTING",
  },
  FILLED: {
    container: "bg-profit-dim text-profit border border-profit/40 shadow-[0_0_6px_rgba(0,230,118,0.15)]",
    icon: <CheckCircle2 size={12} className="text-profit" />,
    label: "FILLED",
  },
  CANCELLED: {
    container: "bg-surface text-gray-500 border border-border-color",
    icon: <Ban size={12} className="text-gray-500" />,
    label: "CANCELLED",
  },
  REJECTED: {
    container: "bg-loss-dim text-loss border border-loss/50 shadow-[0_0_6px_rgba(255,59,48,0.15)]",
    icon: <XCircle size={12} className="text-loss" />,
    label: "REJECTED",
  },
};

export function OrderStatus({
  status,
  size = "md",
  showIcon = true,
  className = "",
  ...props
}: OrderStatusProps) {
  const config = statusConfig[status] || statusConfig.PENDING;

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-[11px] px-2 py-0.5 gap-1.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold tracking-wider rounded select-none ${config.container} ${sizeStyles} ${className}`}
      {...props}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
