"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { PositionItem } from "@/lib/mockPositionsData";
import { FileText, ArrowRight, Lightbulb, AlertOctagon, CheckCircle2 } from "lucide-react";

interface PositionThesisProps {
  position: PositionItem;
  className?: string;
}

export function PositionThesis({
  position,
  className = "",
}: PositionThesisProps) {
  const { thesis } = position;

  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Original Trade Thesis & Pedigree
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          {position.strategy} {position.strategyVersion}
        </span>
      </div>

      {/* Pedigree Provenance IDs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <Link
          href="/opportunities"
          className="flex items-center gap-1 px-2 py-1 rounded bg-bg-950 border border-border-color text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          title="Inspect Source Opportunity"
        >
          <span className="text-[10px] text-gray-500">OPPORTUNITY:</span>
          <span className="font-bold text-cyan-400">{position.opportunityId}</span>
          <ArrowRight size={10} className="text-gray-500" />
        </Link>

        <Link
          href={`/trade-proposals/${position.proposalId}`}
          className="flex items-center gap-1 px-2 py-1 rounded bg-bg-950 border border-border-color text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          title="Inspect Source Proposal"
        >
          <span className="text-[10px] text-gray-500">PROPOSAL:</span>
          <span className="font-bold text-cyan-400">{position.proposalId}</span>
          <ArrowRight size={10} className="text-gray-500" />
        </Link>

        <span className="text-[10px] text-gray-500 ml-auto">
          Position ID: {position.id}
        </span>
      </div>

      {/* Thesis Breakdown */}
      <div className="space-y-2 text-xs">
        {/* Rationale */}
        <div className="p-2.5 rounded bg-bg-950/70 border border-border-color space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-gray-400 font-semibold">
            <CheckCircle2 size={12} className="text-profit" />
            <span>Core Rationale</span>
          </div>
          <p className="text-gray-300 font-sans leading-relaxed text-[11px]">
            {thesis.rationale}
          </p>
        </div>

        {/* Expected Behavior */}
        <div className="p-2.5 rounded bg-bg-950/70 border border-border-color space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-gray-400 font-semibold">
            <ArrowRight size={12} className="text-cyan-400" />
            <span>Target Horizon & Behavior</span>
          </div>
          <p className="text-gray-300 font-sans leading-relaxed text-[11px]">
            {thesis.expectedBehavior}
          </p>
        </div>

        {/* Invalidation Rule */}
        <div className="p-2.5 rounded bg-bg-950/70 border border-loss/20 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-loss font-semibold">
            <AlertOctagon size={12} className="text-loss" />
            <span>Strict Invalidation Rule</span>
          </div>
          <p className="text-gray-300 font-sans leading-relaxed text-[11px]">
            {thesis.invalidation}
          </p>
        </div>
      </div>
    </Surface>
  );
}
