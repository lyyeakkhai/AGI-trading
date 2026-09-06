"use client";

import React from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LineChart, CheckCircle2, RotateCcw, Activity, Database } from "lucide-react";
import { MarketDataSettings } from "@/lib/mockSettingsData";

interface MarketDataSectionProps {
  data: MarketDataSettings;
  onChange: (updated: Partial<MarketDataSettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
}

export function MarketDataSection({
  data,
  onChange,
  onSave,
  onCancel,
  isDirty,
}: MarketDataSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <LineChart size={16} className="text-cyan-400" />
            <span>Market Data Feed</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time tick generation frequency, supported market instruments, and candle aggregation.
          </p>
        </div>

        {isDirty && (
          <span className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="space-y-4 max-w-2xl bg-surface border border-border-color rounded-lg p-5">
        {/* Provider Status */}
        <div className="flex items-center justify-between p-3.5 rounded-md bg-surface-2 border border-border-color">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-200">{data.provider}</span>
              <p className="text-[11px] text-gray-400">
                Deterministic mathematical random-walk Brownian tick generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-profit/10 border border-profit/30 text-profit text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span>{data.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Tick Update Frequency"
              value={data.updateFrequency}
              onChange={(e) =>
                onChange({
                  updateFrequency: e.target.value as "10s" | "30s" | "1m" | "5m",
                })
              }
              options={[
                { label: "10 Seconds (High cadence)", value: "10s" },
                { label: "30 Seconds", value: "30s" },
                { label: "1 Minute (Default)", value: "1m" },
                { label: "5 Minutes (Low cadence)", value: "5m" },
              ]}
              helperText="Interval between simulated price bar updates."
            />
          </div>

          <div>
            <Select
              label="Default Chart Timeframe"
              value={data.defaultTimeframe}
              onChange={(e) =>
                onChange({
                  defaultTimeframe: e.target.value as "15m" | "1H" | "4H" | "1D",
                })
              }
              options={[
                { label: "15 Minutes (15m)", value: "15m" },
                { label: "1 Hour (1H - Standard)", value: "1H" },
                { label: "4 Hours (4H)", value: "4H" },
                { label: "1 Day (1D)", value: "1D" },
              ]}
              helperText="Initial resolution loaded in Markets workspace."
            />
          </div>
        </div>

        {/* Supported Markets Universe */}
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400 block mb-1.5">
            Active Market Instruments
          </label>
          <div className="flex flex-wrap gap-2">
            {data.markets.map((market) => (
              <div
                key={market}
                className="px-3 py-1.5 rounded-md bg-surface-2 border border-border-color text-xs font-mono font-medium text-gray-200 flex items-center gap-2"
              >
                <Activity size={12} className="text-cyan-400" />
                <span>{market}</span>
                <span className="text-[10px] text-profit font-semibold">FEED ACTIVE</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            Currently restricted to primary tier-1 crypto pairs for high liquidity integrity.
          </p>
        </div>

        {/* Simulated mode notice */}
        <div className="p-3 rounded-md bg-surface-2 border border-border-color/60 text-[11px] text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-300">Data Mode: SIMULATED. </span>
          Prices simulate realistic geometric Brownian motion with volatility clustering. Real
          exchange WebSockets are not connected in this task.
        </div>
      </div>

      {/* Save / Cancel Action Bar */}
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
  );
}
