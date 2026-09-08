"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { PositionSide } from "@/features/trading/components/PositionSide";
import { StrategyUsage } from "@/lib/mockStrategiesData";
import { Zap, FileText, Briefcase, History, ArrowRight } from "lucide-react";

interface StrategyUsageCardProps {
  usage: StrategyUsage;
  strategyName: string;
  className?: string;
}

export function StrategyUsageCard({
  usage,
  strategyName,
  className = "",
}: StrategyUsageCardProps) {
  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-border-color pb-1.5">
        <span className="text-xs font-mono font-bold uppercase text-gray-200">
          Strategy Lineage & Portfolio Footprint
        </span>
        <span className="text-[10px] font-mono text-cyan-400">
          TRACEABILITY MAP
        </span>
      </div>

      {/* 4 Usage Channels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <Link
          href="/opportunities"
          className="p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
            <span>Opportunities</span>
            <Zap size={11} className="text-cyan-400" />
          </div>
          <div className="text-base font-bold text-gray-100 group-hover:text-cyan-400 mt-1">
            {usage.activeOpportunitiesCount}
          </div>
          <span className="text-[10px] text-gray-500">Active radar</span>
        </Link>

        <Link
          href="/trade-proposals"
          className="p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
            <span>Proposals</span>
            <FileText size={11} className="text-cyan-400" />
          </div>
          <div className="text-base font-bold text-gray-100 group-hover:text-cyan-400 mt-1">
            {usage.pendingProposalsCount}
          </div>
          <span className="text-[10px] text-gray-500">In pipeline</span>
        </Link>

        <Link
          href="/positions"
          className="p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
            <span>Open Positions</span>
            <Briefcase size={11} className="text-cyan-400" />
          </div>
          <div className="text-base font-bold text-gray-100 group-hover:text-cyan-400 mt-1">
            {usage.openPositionsCount}
          </div>
          <span className="text-[10px] text-gray-500">Live paper</span>
        </Link>

        <Link
          href="/positions"
          className="p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 transition-colors group"
        >
          <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase">
            <span>Closed History</span>
            <History size={11} className="text-cyan-400" />
          </div>
          <div className="text-base font-bold text-gray-100 group-hover:text-cyan-400 mt-1">
            {usage.closedPositionsCount}
          </div>
          <span className="text-[10px] text-gray-500">Completed</span>
        </Link>
      </div>

      {/* Sample Positions Generated */}
      {usage.samplePositions && usage.samplePositions.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold block">
            Generated Positions Sample:
          </span>
          <div className="space-y-1 text-xs font-mono">
            {usage.samplePositions.map((pos) => (
              <div
                key={pos.id}
                className="flex items-center justify-between p-2 rounded bg-bg-950/70 border border-border-color"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">{pos.id}</span>
                  <span className="font-bold text-gray-200">{pos.symbol}</span>
                  <PositionSide side={pos.side} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      pos.pnl >= 0 ? "text-profit font-bold" : "text-loss font-bold"
                    }
                  >
                    {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-gray-400 border border-border-color">
                    {pos.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Surface>
  );
}
