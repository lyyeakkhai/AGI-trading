"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { ConfidenceIndicator } from "@/components/trading/ConfidenceIndicator";
import { OpportunityPreviewItem } from "@/lib/mockHermesData";
import { Zap, ArrowRight, Clock, Target } from "lucide-react";

interface HermesOpportunityPreviewProps {
  opportunities: OpportunityPreviewItem[];
  className?: string;
}

export function HermesOpportunityPreview({
  opportunities,
  className = "",
}: HermesOpportunityPreviewProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Opportunity Watch Preview
          </span>
        </div>
        <Link href="/opportunities">
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight size={12} />}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px]"
          >
            VIEW ALL
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="p-3 rounded bg-surface-2/60 border border-border-color hover:border-border-hi transition-colors space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PositionSide side={opp.side} size="sm" />
                <span className="font-mono text-xs font-bold text-gray-100">
                  {opp.symbol}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  • {opp.timeHorizon}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-300">
                  Target: {opp.riskReward}
                </span>
                <Badge variant={opp.confidence > 70 ? "cyan" : "neutral"} size="sm">
                  {opp.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border-color/60 text-xs">
              <span className="text-gray-300 text-[11px] font-medium">
                Setup: {opp.setup}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-gray-400 uppercase">
                  Confidence:
                </span>
                <ConfidenceIndicator score={opp.confidence} size="sm" showBar={false} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>PRE-PROPOSAL STAGE: EVIDENCE COLLECTION</span>
        <span className="text-profit">RISK ENGINE INTERLOCKED</span>
      </div>
    </Surface>
  );
}
