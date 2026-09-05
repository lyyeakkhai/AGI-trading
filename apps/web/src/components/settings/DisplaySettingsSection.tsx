"use client";

import React from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Layout, CheckCircle2, RotateCcw, Monitor, Sparkles } from "lucide-react";
import { DisplaySettings, DisplayDensity } from "@/lib/mockSettingsData";

interface DisplaySettingsSectionProps {
  data: DisplaySettings;
  onChange: (updated: Partial<DisplaySettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
}

export function DisplaySettingsSection({
  data,
  onChange,
  onSave,
  onCancel,
  isDirty,
}: DisplaySettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Layout size={16} className="text-cyan-400" />
            <span>Display &amp; Terminal Interface</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Obsidian Intelligence visual styling, layout density, and chart appearance.
          </p>
        </div>

        {isDirty && (
          <span className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="space-y-4 max-w-2xl bg-surface border border-border-color rounded-lg p-5">
        {/* Fixed Obsidian Theme */}
        <div className="flex items-center justify-between p-3.5 rounded-md bg-surface-2 border border-border-color">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-100">{data.theme}</span>
              <p className="text-[11px] text-gray-400">
                Dark Quantum / Cyan Intelligence terminal design system
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
            SYSTEM LOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400 block mb-1">
              Appearance
            </label>
            <div className="p-2.5 rounded bg-surface-2 border border-border-color text-xs text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Monitor size={14} className="text-gray-400" />
                <span>Exclusively Dark Mode</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400">NATIVE</span>
            </div>
          </div>

          <div>
            <Select
              label="Interface Density"
              value={data.density}
              onChange={(e) =>
                onChange({ density: e.target.value as DisplayDensity })
              }
              options={[
                { label: "Comfortable (Standard 16px row padding)", value: "Comfortable" },
                { label: "Compact (High information density 12px)", value: "Compact" },
              ]}
              helperText="Spacing scale for tables and metric summaries."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Primary Chart Style"
              value={data.chartStyle}
              onChange={(e) =>
                onChange({ chartStyle: e.target.value as "Candles" | "Line" })
              }
              options={[
                { label: "Candlesticks (OHLC)", value: "Candles" },
                { label: "Step Line (Close prices)", value: "Line" },
              ]}
              helperText="Visual format in TradingView lightweight chart viewports."
            />
          </div>

          <div>
            <Select
              label="Animations & Motion"
              value={data.animations}
              onChange={(e) =>
                onChange({ animations: e.target.value as "Reduced" | "Standard" })
              }
              options={[
                { label: "Reduced (Fastest, zero eye strain)", value: "Reduced" },
                { label: "Standard (Subtle state transitions)", value: "Standard" },
              ]}
              helperText="Industrial function-first motion profile per DESIGN.md."
            />
          </div>
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
