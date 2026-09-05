"use client";

import React from "react";
import { Bot, Cpu, ShieldCheck, Activity } from "lucide-react";
import { Surface } from "../ui/Surface";
import { AIStatusIndicator, HermesStateType } from "./AIStatusIndicator";
import { AIActivityBadge } from "./AIActivityBadge";

export interface AIStateProps extends React.HTMLAttributes<HTMLDivElement> {
  agentName?: string;
  state: HermesStateType;
  regime?: string;
  currentActivity?: string;
  evidenceCount?: number;
  lastUpdated?: string;
}

export function AIState({
  agentName = "HERMES INTELLIGENCE LAYER",
  state,
  regime = "TRENDING EXPANSION (BULLISH)",
  currentActivity = "CORRELATING SPOT/DERIVATIVES VOLUME",
  evidenceCount = 4,
  lastUpdated = "14:32:05 UTC",
  className = "",
  ...props
}: AIStateProps) {
  return (
    <Surface
      variant="default"
      padded="md"
      className={`flex flex-col gap-3 border-cyan-500/20 bg-surface shadow-[0_0_15px_rgba(0,229,255,0.05)] ${className}`}
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-color">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-dim/40 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.3)]">
            <Bot size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400">
              {agentName}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              AUTONOMOUS INFERENCE ENGINE
            </span>
          </div>
        </div>

        <AIStatusIndicator state={state} size="sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="flex flex-col gap-0.5 p-2 rounded bg-surface-2 border border-border-color">
          <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-gray-400">
            <Activity size={12} className="text-cyan-400" />
            <span>Market Regime</span>
          </div>
          <span className="font-mono text-xs font-semibold text-gray-200 truncate">
            {regime}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 p-2 rounded bg-surface-2 border border-border-color">
          <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-gray-400">
            <Cpu size={12} className="text-cyan-400" />
            <span>Active Inference</span>
          </div>
          <AIActivityBadge activity={currentActivity} showIcon={false} />
        </div>

        <div className="flex flex-col gap-0.5 p-2 rounded bg-surface-2 border border-border-color">
          <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-gray-400">
            <ShieldCheck size={12} className="text-profit" />
            <span>Evidence / Sync</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-200 font-bold">{evidenceCount} SIGNALS</span>
            <span className="text-gray-400 text-[10px]">{lastUpdated}</span>
          </div>
        </div>
      </div>
    </Surface>
  );
}
