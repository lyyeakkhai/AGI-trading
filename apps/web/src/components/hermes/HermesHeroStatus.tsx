"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { HermesCore } from "./HermesCore";
import {
  HermesVisualState,
  hermesStateDefinitions,
} from "@/lib/mockHermesData";
import { Bot, Cpu, Target, Clock, ShieldCheck, Activity } from "lucide-react";

interface HermesHeroStatusProps {
  currentState: HermesVisualState;
  onStateChange?: (state: HermesVisualState) => void;
  currentFocus?: string;
  activeTimeframe?: string;
  lastAction?: string;
  className?: string;
}

export function HermesHeroStatus({
  currentState,
  onStateChange,
  currentFocus = "BTC/USDT",
  activeTimeframe = "1H",
  lastAction = "Market structure & CVD delta evaluation",
  className = "",
}: HermesHeroStatusProps) {
  const stateDef = hermesStateDefinitions[currentState];

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col border-cyan-500/30 bg-surface shadow-[0_0_24px_rgba(0,229,255,0.06)] overflow-hidden ${className}`}
    >
      {/* Top Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-border-color bg-surface-2/60 select-none">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-cyan-400" />
          <span className="font-mono text-xs font-bold text-gray-100 uppercase tracking-wider">
            HERMES AUTONOMOUS TRADING AGENT
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 px-1.5 py-0.2 rounded bg-bg-950 border border-border-color">
            v3.2-Q
          </span>
        </div>

        {/* State Interactive Pill Strip */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase hidden sm:inline">
            SIMULATE STATE:
          </span>
          <select
            value={currentState}
            onChange={(e) => onStateChange?.(e.target.value as HermesVisualState)}
            className="bg-bg-950 border border-border-hi text-cyan-300 text-xs font-mono rounded px-2 py-0.5 outline-none focus:border-cyan-500 cursor-pointer"
            aria-label="Select Hermes simulation state"
          >
            {Object.keys(hermesStateDefinitions).map((st) => (
              <option key={st} value={st} className="bg-bg-900 text-gray-200">
                {hermesStateDefinitions[st as HermesVisualState].badgeLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Hero Identity Grid */}
      <div className="p-5 flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Visual Intelligence Core */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <HermesCore state={currentState} size="lg" />
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            NEURAL CORE ACTIVE
          </span>
        </div>

        {/* Status Context & Assessment */}
        <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-gray-100">
                Hermes is {stateDef.title}
              </span>
              <Badge variant="cyan" size="sm" dot pulse>
                {stateDef.badgeLabel}
              </Badge>
            </div>
            <p className="text-xs text-gray-300 font-sans max-w-2xl leading-relaxed">
              {stateDef.description}
            </p>
          </div>

          {/* Core Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface-2/70 border border-border-color flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase">Current Focus</span>
              <span className="text-cyan-300 font-bold text-sm truncate mt-0.5">
                {currentFocus}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-2/70 border border-border-color flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase">Active Timeframe</span>
              <span className="text-gray-100 font-bold text-sm mt-0.5">
                {activeTimeframe}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-2/70 border border-border-color flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase">Safety Interlock</span>
              <span className="text-profit font-bold text-sm flex items-center gap-1 mt-0.5">
                <ShieldCheck size={13} />
                NORMAL
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-2/70 border border-border-color flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase">Last Action</span>
              <span className="text-gray-300 text-[11px] truncate mt-0.5" title={lastAction}>
                {lastAction}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/30 text-[10px] font-mono text-gray-400 flex flex-wrap items-center justify-between gap-2 select-none">
        <span>CONTINUOUS INGESTION: SPOT & PERP L2 FEEDS (14ms LATENCY)</span>
        <span className="text-cyan-400">DETERMINISTIC GUARDRAILS: ENGAGED</span>
      </div>
    </Surface>
  );
}
