"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { StrategyStatusBadge } from "./StrategyStatusBadge";
import { StrategyValidationStage } from "./StrategyValidationStage";
import { ValidationGateList } from "./ValidationGateList";
import { StrategyPerformanceCard } from "./StrategyPerformanceCard";
import { StrategyDefinitionCard } from "./StrategyDefinitionCard";
import { StrategyUsageCard } from "./StrategyUsageCard";
import { StrategyHermesCard } from "./StrategyHermesCard";
import { StrategyVersionHistory } from "./StrategyVersionHistory";
import { StrategyItem } from "@/lib/mockStrategiesData";
import {
  X,
  ExternalLink,
  Zap,
  FileText,
  Briefcase,
  History,
  Bot,
  AlertTriangle,
} from "lucide-react";

interface StrategyDetailDrawerProps {
  strategy: StrategyItem | null;
  onClose: () => void;
}

export function StrategyDetailDrawer({
  strategy,
  onClose,
}: StrategyDetailDrawerProps) {
  if (!strategy) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl bg-bg-900 border-l border-border-color shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* 1. Header Strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-color bg-surface-2/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-100 font-mono">
              {strategy.name}
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-2 text-cyan-400 border border-border-color font-semibold">
              {strategy.version}
            </span>
            <StrategyStatusBadge status={strategy.status} size="sm" />
          </div>
          <span className="text-[10px] font-mono text-gray-500">
            ID: {strategy.id} • {strategy.primaryMarket} ({strategy.primaryTimeframe}) • {strategy.type}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-surface-2 transition-colors"
          title="Close Strategy Inspector"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Archive Banner if Archived */}
        {strategy.status === "ARCHIVED" && strategy.archiveReason && (
          <div className="p-3 rounded bg-surface-2/60 border border-warning/40 text-xs font-mono text-warning flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase text-[10px] block">
                Archived Strategy Notice:
              </span>
              <p className="font-sans text-gray-300 text-[11px] mt-0.5 leading-relaxed">
                {strategy.archiveReason}
              </p>
            </div>
          </div>
        )}

        {/* Validation Ladder */}
        <StrategyValidationStage currentStage={strategy.validationStage} />

        {/* Validation Gates Requirements */}
        <ValidationGateList gates={strategy.validationGates} />

        {/* Performance Snapshot & Simulated Equity Curve */}
        <StrategyPerformanceCard performance={strategy.performance} />

        {/* Strategy Methodology, Rules, and Risk Profile */}
        <StrategyDefinitionCard definition={strategy.definition} />

        {/* Portfolio Footprint & Traceability */}
        <StrategyUsageCard
          usage={strategy.usage}
          strategyName={strategy.name}
        />

        {/* Hermes Agent Context */}
        <StrategyHermesCard
          hermesContext={strategy.hermesContext}
          strategyName={strategy.name}
          version={strategy.version}
        />

        {/* Version Audit History */}
        <StrategyVersionHistory versions={strategy.versions} />

        {/* Cross-Workspace Navigation */}
        <Surface variant="default" padded="md" className="space-y-2.5">
          <span className="text-xs font-mono font-bold uppercase text-gray-200 block border-b border-border-color pb-1.5">
            Cross-Workspace Navigation
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <Link
              href="/opportunities"
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="text-cyan-400" />
                <span>Opportunities</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>

            <Link
              href="/trade-proposals"
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <FileText size={13} className="text-cyan-400" />
                <span>Proposals</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>

            <Link
              href="/positions"
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <Briefcase size={13} className="text-cyan-400" />
                <span>Positions</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>

            <Link
              href="/hermes"
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <Bot size={13} className="text-cyan-400" />
                <span>Hermes</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>

            <Link
              href="/backtests"
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <History size={13} className="text-cyan-400" />
                <span>Backtests</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>
          </div>
        </Surface>
      </div>
    </div>
  );
}
