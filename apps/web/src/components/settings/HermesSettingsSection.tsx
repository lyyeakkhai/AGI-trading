"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Cpu, ShieldCheck, Lock, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight } from "lucide-react";
import { HermesSettings, HermesOperatingMode, HermesResearchDepth } from "@/lib/mockSettingsData";

interface HermesSettingsSectionProps {
  data: HermesSettings;
  onChange: (updated: Partial<HermesSettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
}

export function HermesSettingsSection({
  data,
  onChange,
  onSave,
  onCancel,
  isDirty,
}: HermesSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Cpu size={16} className="text-cyan-400" />
            <span>Hermes &amp; AI Intelligence</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Main Trading Agent reasoning depth, multi-timeframe monitoring, and governance boundaries.
          </p>
        </div>

        {isDirty && (
          <span className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* Hermes Status & Operating Mode */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-color">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              <div>
                <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
                  Hermes Agent Status
                </h3>
                <p className="text-[11px] text-gray-400">Continuous background intelligence loop</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
              {data.status}
            </span>
          </div>

          {/* Operating Mode Selector (Conservative / Balanced / Aggressive) */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400 block">
              Operating Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  {
                    id: "CONSERVATIVE",
                    label: "Conservative",
                    desc: "Higher evidence requirements, stricter confluence filters.",
                  },
                  {
                    id: "BALANCED",
                    label: "Balanced (Default)",
                    desc: "Standard evidence thresholds and risk-reward profile.",
                  },
                  {
                    id: "AGGRESSIVE",
                    label: "Aggressive",
                    desc: "Lower opportunity thresholds; higher trade cadence.",
                  },
                ] as const
              ).map((mode) => {
                const isSelected = data.operatingMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onChange({ operatingMode: mode.id as HermesOperatingMode })}
                    className={`p-3 rounded-md text-left transition-all border flex flex-col justify-between ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                        : "bg-surface-2 border-border-color text-gray-400 hover:text-gray-200 hover:border-border-hi"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-200 flex items-center justify-between">
                        <span>{mode.label}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-snug">{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Research Depth */}
          <div className="pt-2">
            <Select
              label="Research Depth"
              value={data.researchDepth}
              onChange={(e) =>
                onChange({ researchDepth: e.target.value as HermesResearchDepth })
              }
              options={[
                { label: "QUICK (Fast pattern scan)", value: "QUICK" },
                { label: "STANDARD (Multi-timeframe + Liquidity)", value: "STANDARD" },
                { label: "DEEP (Orderbook microstructure + Regime clustering)", value: "DEEP" },
              ]}
              helperText="Determines how many candlestick levels and indicators Hermes cross-references."
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            Agent Subsystem Controls
          </h3>

          <div className="space-y-3 divide-y divide-border-color/60">
            {/* Market Monitoring */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-medium text-gray-200">Continuous Market Monitoring</span>
                <p className="text-[11px] text-gray-400">
                  Ingests ticks and evaluates price trends across supported pairs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ monitoring: !data.monitoring })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  data.monitoring ? "bg-cyan-500" : "bg-surface-elevated border border-border-color"
                }`}
              >
                <div
                  className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    data.monitoring ? "translate-x-5 bg-white" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Opportunity Detection */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-medium text-gray-200">Opportunity Detection</span>
                <p className="text-[11px] text-gray-400">
                  Flags high-conviction breakout and mean-reversion setups.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ opportunityDetection: !data.opportunityDetection })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  data.opportunityDetection
                    ? "bg-cyan-500"
                    : "bg-surface-elevated border border-border-color"
                }`}
              >
                <div
                  className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    data.opportunityDetection ? "translate-x-5 bg-white" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Proposal Generation */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-medium text-gray-200">Trade Proposal Generation</span>
                <p className="text-[11px] text-gray-400">
                  Drafts structured trade plans with precise stop loss and take profit targets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ proposalGeneration: !data.proposalGeneration })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  data.proposalGeneration
                    ? "bg-cyan-500"
                    : "bg-surface-elevated border border-border-color"
                }`}
              >
                <div
                  className={`bg-bg-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    data.proposalGeneration ? "translate-x-5 bg-white" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Risk Awareness (Locked ON) */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-200">Risk Awareness</span>
                  <span className="text-[10px] font-mono text-profit bg-profit/10 px-1.5 rounded border border-profit/20">
                    MANDATORY
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Hermes accounts for open risk budget before formulating proposal sizes.
                </p>
              </div>
              <span className="text-xs font-mono text-profit font-semibold px-2 py-1 bg-profit/10 rounded border border-profit/30">
                LOCKED ON
              </span>
            </div>

            {/* Autonomous Execution (Locked OFF) */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-400">Autonomous Execution</span>
                  <span className="text-[10px] font-mono text-loss bg-loss/10 px-1.5 rounded border border-loss/20 flex items-center gap-0.5">
                    <Lock size={10} /> LOCKED OFF
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Autonomous order dispatch is physically prohibited. Owner review is required.
                </p>
              </div>
              <span className="text-xs font-mono text-loss font-semibold px-2 py-1 bg-loss/10 rounded border border-loss/30">
                OFF
              </span>
            </div>
          </div>
        </div>

        {/* Safety Boundary Notice (Section 26) */}
        <div className="p-4 rounded-lg bg-surface border border-border-color space-y-3">
          <div className="flex items-center gap-2 text-warning font-semibold text-xs">
            <AlertTriangle size={15} />
            <span>Architectural Safety Boundary</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-mono">
            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-cyan-400 block font-bold">HERMES</span>
              <span className="text-gray-400 text-[10px]">ANALYZE + PROPOSE</span>
            </div>
            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-warning block font-bold">RISK ENGINE</span>
              <span className="text-gray-400 text-[10px]">VALIDATE</span>
            </div>
            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-profit block font-bold">OWNER</span>
              <span className="text-gray-400 text-[10px]">APPROVE</span>
            </div>
            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-gray-300 block font-bold">EXECUTION</span>
              <span className="text-gray-400 text-[10px]">EXECUTE</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed bg-surface-2 p-2.5 rounded border border-border-color/60">
            &ldquo;Hermes can analyze and propose trades but cannot bypass risk controls or independently execute live trades.&rdquo;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={14} />}
            disabled={!isDirty}
            onClick={onSave}
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            disabled={!isDirty}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
