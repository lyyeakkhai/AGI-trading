"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { PositionItem } from "@/lib/mockPositionsData";
import { Bot, Clock, Radio, ShieldCheck } from "lucide-react";

interface PositionHermesPanelProps {
  position: PositionItem;
  className?: string;
}

export function PositionHermesPanel({
  position,
  className = "",
}: PositionHermesPanelProps) {
  const { hermesAssessment } = position;

  const biasBadgeVariant =
    hermesAssessment.bias === "FAVORABLE"
      ? "profit"
      : hermesAssessment.bias === "CAUTION"
      ? "warning"
      : "cyan";

  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-2">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Hermes Operational Monitoring
          </span>
        </div>
        <Badge variant={biasBadgeVariant} size="sm">
          {hermesAssessment.bias} BIAS
        </Badge>
      </div>

      {/* Operational Assessment Card */}
      <div className="p-3 rounded bg-bg-950/80 border border-cyan-500/20 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Radio size={12} className="animate-pulse" />
            <span className="font-bold uppercase tracking-wide">
              {hermesAssessment.status}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Clock size={11} />
            <span>Reviewed {hermesAssessment.lastReview}</span>
          </div>
        </div>

        <p className="text-xs text-gray-300 font-sans leading-relaxed">
          {hermesAssessment.summary}
        </p>
      </div>

      {/* Guardrail Note */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-0.5">
        <div className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-profit" />
          <span>INDEPENDENT RISK ENGINE CONSTRAINTS ENFORCED</span>
        </div>
        <span className="text-cyan-400">TELEMETRY SYNCED</span>
      </div>
    </Surface>
  );
}
