"use client";

import React from "react";
import { TradeProposalItem } from "@/lib/mockTradeProposalsData";
import { Target, ArrowUpCircle, AlertOctagon, TrendingUp } from "lucide-react";

interface ProposalPriceLevelsProps {
  proposal: TradeProposalItem;
  className?: string;
}

export function ProposalPriceLevels({
  proposal,
  className = "",
}: ProposalPriceLevelsProps) {
  const isLong = proposal.direction === "LONG";
  const profitDeltaPct = Math.abs(
    ((proposal.takeProfit - proposal.entry) / proposal.entry) * 100
  ).toFixed(2);
  const stopDeltaPct = Math.abs(
    ((proposal.stopLoss - proposal.entry) / proposal.entry) * 100
  ).toFixed(2);

  return (
    <div
      className={`p-3.5 rounded-lg bg-bg-950 border border-border-color space-y-3 font-mono text-xs ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase text-gray-400">
        <span>Execution Level Structure</span>
        <span className="text-cyan-400 font-bold">R:R {proposal.riskReward}</span>
      </div>

      {/* Vertical Price Ladder */}
      <div className="space-y-2 relative pl-3 border-l border-border-color/80">
        {/* Take Profit (Top for Long) */}
        <div className="p-2 rounded bg-profit-dim/20 border border-profit/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={13} className="text-profit" />
            <span className="text-[10px] text-profit uppercase font-bold">
              TAKE PROFIT (TARGET)
            </span>
          </div>
          <div className="text-right">
            <span className="text-profit font-bold text-sm block">
              ${proposal.takeProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-profit/80 block">
              +{profitDeltaPct}% from entry
            </span>
          </div>
        </div>

        {/* Entry Level */}
        <div className="p-2 rounded bg-surface-2 border border-cyan-500/40 flex items-center justify-between shadow-[0_0_10px_rgba(0,229,255,0.06)]">
          <div className="flex items-center gap-2">
            <ArrowUpCircle size={13} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-300 uppercase font-bold">
              ENTRY TRIGGER
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-100 font-bold text-sm block">
              ${proposal.entry.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 block font-sans">
              Planned order price
            </span>
          </div>
        </div>

        {/* Stop Loss Level */}
        <div className="p-2 rounded bg-loss-dim/20 border border-loss/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon size={13} className="text-loss" />
            <span className="text-[10px] text-loss uppercase font-bold">
              STOP LOSS (INVALIDATION)
            </span>
          </div>
          <div className="text-right">
            <span className="text-loss font-bold text-sm block">
              ${proposal.stopLoss.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-loss/80 block">
              -{stopDeltaPct}% from entry
            </span>
          </div>
        </div>
      </div>

      {/* Sizing & Allocation Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-color/60 text-[11px]">
        <div className="p-2 rounded bg-surface-2/60 border border-border-color">
          <span className="text-[10px] text-gray-400 block uppercase">
            Order Sizing
          </span>
          <span className="text-gray-100 font-bold block mt-0.5">
            {proposal.positionSize}
          </span>
        </div>

        <div className="p-2 rounded bg-surface-2/60 border border-border-color">
          <span className="text-[10px] text-gray-400 block uppercase">
            Margin Allocated
          </span>
          <span className="text-gray-100 font-bold block mt-0.5">
            {proposal.capitalAllocation}
          </span>
        </div>
      </div>
    </div>
  );
}
