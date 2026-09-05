"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { RiskBadge } from "@/components/trading/RiskBadge";
import { OpportunityConfidence } from "./OpportunityConfidence";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityItem } from "@/lib/mockOpportunitiesData";
import { ChevronRight, SearchX, Clock, ArrowRight } from "lucide-react";

interface OpportunityTableProps {
  opportunities: OpportunityItem[];
  selectedOpportunityId?: string;
  onSelectOpportunity: (opp: OpportunityItem) => void;
  onResetFilters?: () => void;
  className?: string;
}

export function OpportunityTable({
  opportunities,
  selectedOpportunityId,
  onSelectOpportunity,
  onResetFilters,
  className = "",
}: OpportunityTableProps) {
  if (opportunities.length === 0) {
    return (
      <Surface variant="default" padded="md" className={className}>
        <EmptyState
          icon={<SearchX size={32} className="text-gray-500" />}
          title="No Matching Opportunities"
          description="Hermes currently has no setups matching your active search and filter criteria."
          action={
            onResetFilters ? (
              <Button variant="secondary" size="xs" onClick={onResetFilters}>
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      </Surface>
    );
  }

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Table Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Opportunity Surveillance Registry
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            ({opportunities.length} RECORDED)
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          CLICK ROW TO INSPECT EVIDENCE
        </span>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-border-color bg-bg-950/80 text-[10px] font-mono uppercase text-gray-400 select-none">
              <th className="py-2.5 px-4 font-semibold">Asset</th>
              <th className="py-2.5 px-3 font-semibold">Side</th>
              <th className="py-2.5 px-3 font-semibold">Setup & Strategy</th>
              <th className="py-2.5 px-3 font-semibold">TF</th>
              <th className="py-2.5 px-4 font-semibold min-w-[130px]">Confidence</th>
              <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Regime</th>
              <th className="py-2.5 px-3 font-semibold hidden lg:table-cell">Risk</th>
              <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Detected</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/50 font-mono">
            {opportunities.map((opp) => {
              const isSelected = selectedOpportunityId === opp.id;

              return (
                <tr
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-cyan-dim/20 border-l-2 border-l-cyan-400"
                      : "hover:bg-surface-hover/70 border-l-2 border-l-transparent"
                  }`}
                >
                  {/* Asset */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span
                        className={`font-bold ${
                          isSelected ? "text-cyan-300" : "text-gray-100"
                        }`}
                      >
                        {opp.symbol}
                      </span>
                      <span className="text-[10px] text-gray-400 font-sans truncate">
                        {opp.name}
                      </span>
                    </div>
                  </td>

                  {/* Side */}
                  <td className="py-3 px-3">
                    <PositionSide side={opp.direction} size="sm" />
                  </td>

                  {/* Setup & Strategy */}
                  <td className="py-3 px-3 font-sans">
                    <div className="flex flex-col max-w-[190px]">
                      <span className="text-gray-200 font-medium truncate">
                        {opp.setup}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono truncate">
                        {opp.riskReward}
                      </span>
                    </div>
                  </td>

                  {/* Timeframe */}
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-bg-950 border border-border-color text-[10px] text-gray-300">
                      {opp.timeframe}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4">
                    <OpportunityConfidence score={opp.confidence} size="sm" />
                  </td>

                  {/* Regime */}
                  <td className="py-3 px-3 hidden md:table-cell text-gray-300 text-[11px] truncate max-w-[130px]">
                    {opp.marketRegime}
                  </td>

                  {/* Risk State */}
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <RiskBadge level={opp.riskState} />
                  </td>

                  {/* Detected */}
                  <td className="py-3 px-3 hidden sm:table-cell text-gray-400 text-[11px] whitespace-nowrap">
                    {opp.detectedAt}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <OpportunityStatusBadge status={opp.status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium">
                      <span>Detail</span>
                      <ChevronRight size={12} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Strip */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>PRE-TRADE INVESTIGATION PHASE</span>
        <span className="text-cyan-400">HERMES REASONING ENGAGED</span>
      </div>
    </Surface>
  );
}
