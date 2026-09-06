"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { StrategyDefinition } from "@/lib/mockStrategiesData";
import { CheckCircle2, ArrowRight, AlertOctagon, ShieldAlert, Sliders } from "lucide-react";

interface StrategyDefinitionCardProps {
  definition: StrategyDefinition;
  className?: string;
}

export function StrategyDefinitionCard({
  definition,
  className = "",
}: StrategyDefinitionCardProps) {
  return (
    <Surface variant="default" padded="md" className={`space-y-4 ${className}`}>
      {/* Description */}
      <div className="space-y-1 border-b border-border-color pb-2">
        <span className="text-xs font-mono font-bold uppercase text-gray-200 block">
          Strategy Methodology & Premise
        </span>
        <p className="text-xs text-gray-300 font-sans leading-relaxed">
          {definition.description}
        </p>
      </div>

      {/* Entry Conditions */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-profit font-bold">
          <CheckCircle2 size={13} className="text-profit" />
          <span>Execution Entry Conditions</span>
        </div>
        <div className="space-y-1 text-xs">
          {definition.entryConditions.map((cond, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded bg-bg-950 border border-border-color text-gray-300 font-mono text-[11px]"
            >
              <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
              <span>{cond}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exit Conditions */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-cyan-400 font-bold">
          <ArrowRight size={13} className="text-cyan-400" />
          <span>Exit Rules & Targets</span>
        </div>
        <div className="space-y-1 text-xs">
          {definition.exitConditions.map((cond, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded bg-bg-950 border border-border-color text-gray-300 font-mono text-[11px]"
            >
              <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
              <span>{cond}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invalidation Rules */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-loss font-bold">
          <AlertOctagon size={13} className="text-loss" />
          <span>Strict Invalidation Rules</span>
        </div>
        <div className="space-y-1 text-xs">
          {definition.invalidationConditions.map((cond, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded bg-bg-950 border border-loss/20 text-gray-300 font-mono text-[11px]"
            >
              <span className="text-loss font-bold shrink-0">{i + 1}.</span>
              <span>{cond}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Risk Profile */}
      <div className="pt-2 border-t border-border-color space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-gray-200 font-bold">
          <Sliders size={13} className="text-cyan-400" />
          <span>Strategy Risk & Regime Profile</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-bg-950 border border-border-color">
            <span className="text-[10px] text-gray-500 uppercase block">Default Risk</span>
            <span className="text-gray-200 font-bold">
              {definition.defaultRiskPercent}%
            </span>
          </div>

          <div className="p-2 rounded bg-bg-950 border border-border-color">
            <span className="text-[10px] text-gray-500 uppercase block">Maximum Risk</span>
            <span className="text-gray-200 font-bold">
              {definition.maxRiskPercent}%
            </span>
          </div>

          <div className="p-2 rounded bg-bg-950 border border-border-color">
            <span className="text-[10px] text-gray-500 uppercase block">Typical R:R</span>
            <span className="text-cyan-400 font-bold">
              {definition.typicalRR}
            </span>
          </div>

          <div className="p-2 rounded bg-bg-950 border border-border-color">
            <span className="text-[10px] text-gray-500 uppercase block">Max Positions</span>
            <span className="text-gray-200 font-bold">
              {definition.maxConcurrentPositions} Concurrent
            </span>
          </div>

          <div className="p-2 rounded bg-bg-950 border border-border-color sm:col-span-2">
            <span className="text-[10px] text-gray-500 uppercase block">Preferred Regime</span>
            <span className="text-profit font-bold truncate block">
              {definition.preferredRegime}
            </span>
          </div>
        </div>
      </div>
    </Surface>
  );
}
