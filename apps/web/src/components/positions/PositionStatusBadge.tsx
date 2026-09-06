"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { PositionStatusType } from "@/lib/mockPositionsData";

interface PositionStatusBadgeProps {
  status: PositionStatusType;
  size?: "sm" | "md";
  className?: string;
}

export function PositionStatusBadge({
  status,
  size = "sm",
  className = "",
}: PositionStatusBadgeProps) {
  switch (status) {
    case "OPEN":
      return (
        <Badge variant="profit" size={size} className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse mr-1" />
          OPEN
        </Badge>
      );
    case "PARTIALLY_CLOSED":
      return (
        <Badge variant="warning" size={size} className={className}>
          PARTIAL CLOSE
        </Badge>
      );
    case "CLOSING":
      return (
        <Badge variant="cyan" size={size} className={className}>
          CLOSING
        </Badge>
      );
    case "CLOSED":
      return (
        <Badge variant="neutral" size={size} className={className}>
          CLOSED
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
