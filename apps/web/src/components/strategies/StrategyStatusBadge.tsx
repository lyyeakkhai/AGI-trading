"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { StrategyStatus } from "@/lib/mockStrategiesData";

interface StrategyStatusBadgeProps {
  status: StrategyStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StrategyStatusBadge({
  status,
  size = "sm",
  className = "",
}: StrategyStatusBadgeProps) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="profit" size={size} className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse mr-1" />
          ACTIVE
        </Badge>
      );
    case "UNDER_VALIDATION":
      return (
        <Badge variant="warning" size={size} className={className}>
          VALIDATING
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge variant="cyan" size={size} className={className}>
          DRAFT
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge variant="neutral" size={size} className={className}>
          ARCHIVED
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size} className={className}>
          {status}
        </Badge>
      );
  }
}
