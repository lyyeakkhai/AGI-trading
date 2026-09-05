"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface AIActivityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  activity: string;
  showIcon?: boolean;
}

export function AIActivityBadge({
  activity,
  showIcon = true,
  className = "",
  ...props
}: AIActivityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-dim/20 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-medium tracking-tight shadow-[0_0_8px_rgba(0,229,255,0.1)] select-none ${className}`}
      {...props}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
      </span>
      {showIcon && <Sparkles size={11} className="text-cyan-400 shrink-0" />}
      <span className="uppercase truncate max-w-[200px] sm:max-w-none">{activity}</span>
    </span>
  );
}
