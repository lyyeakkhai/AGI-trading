"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StrategySummaryMetrics } from "@/lib/mockStrategiesData";
import { Plus, GitMerge, ShieldAlert } from "lucide-react";

interface StrategySummaryHeaderProps {
  metrics: StrategySummaryMetrics;
  onOpenCreateModal: () => void;
}

export function StrategySummaryHeader({
  metrics,
  onOpenCreateModal,
}: StrategySummaryHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border-color">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-gray-100 font-sans">
              Strategies
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-2 border border-border-color text-cyan-400 font-medium">
              REGISTRY
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Reusable algorithmic trading strategies, mathematical validation gates, and version pedigree.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="cyan" size="md">
            PAPER MODE
          </Badge>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateModal}
            className="text-xs font-mono font-semibold"
          >
            <Plus size={13} className="mr-1.5" />
            <span>Create Strategy</span>
          </Button>
        </div>
      </div>

      {/* 5 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Active Strategies
          </span>
          <div className="text-base font-mono font-bold text-gray-100">
            {metrics.activeStrategies}
          </div>
          <span className="text-[10px] font-mono text-profit block">Live surveillance</span>
        </Surface>

        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Paper Approved
          </span>
          <div className="text-base font-mono font-bold text-profit">
            {metrics.paperApproved}
          </div>
          <span className="text-[10px] font-mono text-gray-400 block">Cleared gates 1-4</span>
        </Surface>

        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Under Validation
          </span>
          <div className="text-base font-mono font-bold text-warning">
            {metrics.underValidation}
          </div>
          <span className="text-[10px] font-mono text-gray-400 block">Walk-forward / OOS</span>
        </Surface>

        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Backtested
          </span>
          <div className="text-base font-mono font-bold text-cyan-400">
            {metrics.backtested}
          </div>
          <span className="text-[10px] font-mono text-gray-400 block">Historical models</span>
        </Surface>

        <Surface variant="default" padded="sm" className="space-y-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
            Live Approved
          </span>
          <div className="text-base font-mono font-bold text-gray-500">
            {metrics.liveApproved}
          </div>
          <span className="text-[10px] font-mono text-gray-500 block">Requires Task 18 Sign-off</span>
        </Surface>
      </div>
    </div>
  );
}
