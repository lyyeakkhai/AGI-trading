"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { Search, Zap, ArrowRight, ShieldCheck, Lock, Activity } from "lucide-react";

interface ExecutionHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  serviceStatus: "READY" | "LOCKED" | "PAUSED";
  onToggleLock: () => void;
}

export function ExecutionHeader({
  searchQuery,
  onSearchChange,
  serviceStatus,
  onToggleLock,
}: ExecutionHeaderProps) {
  return (
    <div className="space-y-4 pb-4 border-b border-border-color">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">
              Execution Engine &amp; Order Lifecycle
            </h1>
            <Badge variant="cyan" size="sm" className="font-mono">
              GATEWAY v1.0
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Dual-signature validated order dispatch, state machine transitions, and execution telemetry.
          </p>
        </div>

        {/* Global Controls & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <EnvironmentBadge mode="PAPER" />

          {/* Engine Status Toggle / Indicator */}
          <button
            type="button"
            onClick={onToggleLock}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
              serviceStatus === "READY"
                ? "bg-profit/10 border border-profit/30 text-profit hover:bg-profit/20"
                : "bg-loss/10 border border-loss/30 text-loss hover:bg-loss/20"
            }`}
            title="Click to toggle execution lock"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                serviceStatus === "READY" ? "bg-profit animate-pulse" : "bg-loss"
              }`}
            />
            <span>STATUS: {serviceStatus}</span>
          </button>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search execution or proposal..."
              className="w-full bg-surface border border-border-color rounded-md text-xs text-gray-200 placeholder-gray-500 pl-8 pr-3 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Architectural Authority Pipeline Banner (Section 2) */}
      <div className="p-2.5 rounded-lg bg-surface border border-border-color flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <Activity size={13} className="text-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Authorization Chain:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            1. Hermes Propose
          </span>
          <ArrowRight size={11} className="text-gray-600" />
          <span className="px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/30">
            2. Risk Validate
          </span>
          <ArrowRight size={11} className="text-gray-600" />
          <span className="px-2 py-0.5 rounded bg-profit/10 text-profit border border-profit/30">
            3. Owner Sign
          </span>
          <ArrowRight size={11} className="text-gray-600" />
          <span className="px-2 py-0.5 rounded bg-surface-2 text-gray-200 border border-border-color font-semibold">
            4. Execution Engine
          </span>
          <ArrowRight size={11} className="text-gray-600" />
          <span className="px-2 py-0.5 rounded bg-loss/10 text-loss border border-loss/30 flex items-center gap-1 font-semibold">
            <Lock size={10} /> Live Order (Disabled)
          </span>
        </div>
      </div>
    </div>
  );
}
