"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { OpportunityConfidence } from "@/components/opportunities/OpportunityConfidence";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { TradeProposalItem } from "@/lib/mockTradeProposalsData";
import { ChevronRight, SearchX, ShieldCheck, ShieldAlert, Clock } from "lucide-react";

interface TradeProposalTableProps {
  proposals: TradeProposalItem[];
  selectedProposalId?: string;
  onSelectProposal: (proposal: TradeProposalItem) => void;
  onResetFilters?: () => void;
  className?: string;
}

export function TradeProposalTable({
  proposals,
  selectedProposalId,
  onSelectProposal,
  onResetFilters,
  className = "",
}: TradeProposalTableProps) {
  if (proposals.length === 0) {
    return (
      <Surface variant="default" padded="md" className={className}>
        <EmptyState
          icon={<SearchX size={32} className="text-gray-500" />}
          title="No Proposals Found"
          description="There are currently no trade proposals matching your selected filter parameters."
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
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Proposal Queue
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            ({proposals.length} PROPOSALS)
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          SELECT PROPOSAL TO INSPECT
        </span>
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-border-color bg-bg-950/80 text-[10px] font-mono uppercase text-gray-400 select-none">
              <th className="py-2.5 px-4 font-semibold">Asset</th>
              <th className="py-2.5 px-3 font-semibold">Side</th>
              <th className="py-2.5 px-3 font-semibold">Strategy</th>
              <th className="py-2.5 px-3 font-semibold text-right">Entry</th>
              <th className="py-2.5 px-3 font-semibold text-right">Stop</th>
              <th className="py-2.5 px-3 font-semibold text-right">Target</th>
              <th className="py-2.5 px-3 font-semibold text-center">R:R</th>
              <th className="py-2.5 px-3 font-semibold text-center">Risk %</th>
              <th className="py-2.5 px-4 font-semibold min-w-[120px]">Confidence</th>
              <th className="py-2.5 px-3 font-semibold text-center">Risk Engine</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/50 font-mono">
            {proposals.map((prop) => {
              const isSelected = selectedProposalId === prop.id;

              return (
                <tr
                  key={prop.id}
                  onClick={() => onSelectProposal(prop)}
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
                        {prop.symbol}
                      </span>
                      <span className="text-[10px] text-gray-400 font-sans truncate">
                        {prop.id}
                      </span>
                    </div>
                  </td>

                  {/* Side */}
                  <td className="py-3 px-3">
                    <PositionSide side={prop.direction} size="sm" />
                  </td>

                  {/* Strategy */}
                  <td className="py-3 px-3 font-sans">
                    <div className="flex flex-col max-w-[150px]">
                      <span className="text-gray-200 font-medium truncate">
                        {prop.strategy}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {prop.timeframe} • {prop.strategyVersion}
                      </span>
                    </div>
                  </td>

                  {/* Entry */}
                  <td className="py-3 px-3 text-right text-gray-200">
                    ${prop.entry.toLocaleString()}
                  </td>

                  {/* Stop */}
                  <td className="py-3 px-3 text-right text-loss font-semibold">
                    ${prop.stopLoss.toLocaleString()}
                  </td>

                  {/* Target */}
                  <td className="py-3 px-3 text-right text-profit font-semibold">
                    ${prop.takeProfit.toLocaleString()}
                  </td>

                  {/* R:R */}
                  <td className="py-3 px-3 text-center text-cyan-300 font-bold">
                    {prop.riskReward}
                  </td>

                  {/* Risk % */}
                  <td className="py-3 px-3 text-center text-gray-300">
                    {prop.riskPercent}%
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4">
                    <OpportunityConfidence score={prop.confidence} size="sm" />
                  </td>

                  {/* Risk Decision */}
                  <td className="py-3 px-3 text-center">
                    {prop.riskDecision === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-profit bg-profit-dim/30 px-1.5 py-0.5 rounded border border-profit/40">
                        <ShieldCheck size={11} />
                        PASS
                      </span>
                    ) : prop.riskDecision === "REJECTED" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-loss bg-loss-dim/30 px-1.5 py-0.5 rounded border border-loss/40">
                        <ShieldAlert size={11} />
                        FAIL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-surface-2 px-1.5 py-0.5 rounded border border-border-color">
                        <Clock size={11} />
                        REVIEW
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <ProposalStatusBadge status={prop.status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium">
                      <span>Review</span>
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
        <span>HERMES PROPOSAL VALIDATION PIPELINE</span>
        <span className="text-cyan-400">HARDWARE INTERLOCKS ENGAGED</span>
      </div>
    </Surface>
  );
}
