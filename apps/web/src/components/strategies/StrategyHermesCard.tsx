"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { HermesStrategyContext } from "@/lib/mockStrategiesData";
import { Bot, Radio, Clock, ShieldCheck } from "lucide-react";

interface StrategyHermesCardProps {
  hermesContext: HermesStrategyContext;
  strategyName: string;
  version: string;
  className?: string;
}

export function StrategyHermesCard({
  hermesContext,
  strategyName,
  version,
  className = "",
}: StrategyHermesCardProps) {
  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-1.5">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Hermes Agent Operational Context
          </span>
        </div>
        <Badge variant="cyan" size="sm">
          MONITORING
        </Badge>
      </div>

      {/* Narrative Card */}
      <div className="p-3 rounded bg-bg-950/80 border border-cyan-500/20 space-y-2">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-1 text-gray-400">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Radio size={12} className="animate-pulse" />
            <span>
              {strategyName} ({version})
            </span>
          </div>
          <div className="text-[10px] text-gray-500">
            Universe: {hermesContext.activeMarkets.join(", ")} • {hermesContext.timeframe}
          </div>
        </div>

        <p className="text-xs text-gray-300 font-sans leading-relaxed">
          {hermesContext.assessment}
        </p>

        <div className="text-[10px] font-mono text-gray-500 pt-1 border-t border-border-color">
          Active Load: {hermesContext.currentUsage}
        </div>
      </div>
    </Surface>
  );
}
