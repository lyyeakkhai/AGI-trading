"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { PositionSide } from "@/components/trading/PositionSide";
import { OpportunityConfidence } from "./OpportunityConfidence";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityItem } from "@/lib/mockOpportunitiesData";
import { Radar, Sparkles, ChevronRight, Target } from "lucide-react";

interface OpportunityRadarProps {
  opportunities: OpportunityItem[];
  selectedOpportunityId?: string;
  onSelectOpportunity: (opportunity: OpportunityItem) => void;
  className?: string;
}

export function OpportunityRadar({
  opportunities,
  selectedOpportunityId,
  onSelectOpportunity,
  className = "",
}: OpportunityRadarProps) {
  // Sort by confidence descending and take top active candidates
  const topActive = [...opportunities]
    .filter((o) => o.status !== "Expired")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4);

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Radar size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Opportunity Radar Deck
          </span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.2 rounded bg-bg-950 border border-border-color">
            HIGH CONVICTION
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          ORDERED BY SIGNAL CONVICTION
        </span>
      </div>

      {/* Grid of Top Radar Candidates */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {topActive.map((opp) => {
          const isSelected = selectedOpportunityId === opp.id;

          return (
            <button
              key={opp.id}
              type="button"
              onClick={() => onSelectOpportunity(opp)}
              className={`p-3.5 rounded-lg text-left transition-all duration-150 flex flex-col justify-between gap-3 border ${
                isSelected
                  ? "bg-cyan-dim/20 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.12)]"
                  : "bg-surface-2/60 border-border-color hover:border-border-hi hover:bg-surface-hover/70"
              }`}
            >
              {/* Asset & Direction Row */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-sm font-bold ${
                      isSelected ? "text-cyan-300" : "text-gray-100"
                    }`}
                  >
                    {opp.symbol}
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-bg-950 border border-border-color text-gray-300">
                    {opp.timeframe}
                  </span>
                </div>
                <PositionSide side={opp.direction} size="sm" />
              </div>

              {/* Strategy Setup */}
              <div>
                <span className="text-xs font-semibold text-gray-200 block truncate">
                  {opp.setup}
                </span>
                <span className="text-[10px] text-gray-400 font-mono truncate block">
                  Regime: {opp.marketRegime.split(" ")[0]} • R:R: {opp.riskReward}
                </span>
              </div>

              {/* Confidence Meter & Status */}
              <div className="space-y-2 w-full pt-1 border-t border-border-color/60">
                <OpportunityConfidence score={opp.confidence} size="sm" />
                <div className="flex items-center justify-between">
                  <OpportunityStatusBadge status={opp.status} size="sm" />
                  <span className="text-[10px] font-mono text-gray-400 flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>CONTINUOUS TIME-FREQUENCY DECOMPOSITION</span>
        <span className="text-cyan-400">DISCIPLINED FILTERING: ACTIVE</span>
      </div>
    </Surface>
  );
}
