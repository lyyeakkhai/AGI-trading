"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { GeneralSettings } from "@/lib/mockSettingsData";
import { Sliders, CheckCircle2, RotateCcw } from "lucide-react";

interface GeneralSettingsSectionProps {
  data: GeneralSettings;
  onChange: (updated: Partial<GeneralSettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
}

export function GeneralSettingsSection({
  data,
  onChange,
  onSave,
  onCancel,
  isDirty,
}: GeneralSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Sliders size={16} className="text-cyan-400" />
            <span>General Settings</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Core environment parameters, workspace identification, and localization formats.
          </p>
        </div>

        {isDirty && (
          <span className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="space-y-4 max-w-2xl bg-surface border border-border-color rounded-lg p-5">
        <div>
          <Input
            label="Workspace Name"
            value={data.workspaceName}
            onChange={(e) => onChange({ workspaceName: e.target.value })}
            helperText="Custom identifier displayed in system telemetry and audit events."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Timezone"
              value={data.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              options={[
                { label: "Asia/Phnom_Penh (UTC+7)", value: "Asia/Phnom_Penh" },
                { label: "UTC (Coordinated Universal Time)", value: "UTC" },
                { label: "America/New_York (EST / EDT)", value: "America/New_York" },
                { label: "Europe/London (GMT / BST)", value: "Europe/London" },
                { label: "Asia/Singapore (SGT UTC+8)", value: "Asia/Singapore" },
                { label: "Asia/Tokyo (JST UTC+9)", value: "Asia/Tokyo" },
              ]}
              helperText="Determines timestamp display on chart candles and activity ledger."
            />
          </div>

          <div>
            <Select
              label="Base Currency"
              value={data.currency}
              onChange={(e) => onChange({ currency: e.target.value })}
              options={[
                { label: "USD ($ - United States Dollar)", value: "USD" },
                { label: "USDT (Tether USD)", value: "USDT" },
                { label: "EUR (€ - Euro)", value: "EUR" },
              ]}
              helperText="Settlement currency used for portfolio valuation."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Language"
              value={data.language}
              onChange={(e) => onChange({ language: e.target.value })}
              options={[
                { label: "English (US)", value: "English" },
              ]}
              helperText="Interface display language."
            />
          </div>

          <div>
            <Select
              label="Date Format"
              value={data.dateFormat}
              onChange={(e) => onChange({ dateFormat: e.target.value })}
              options={[
                { label: "YYYY-MM-DD (ISO 8601)", value: "YYYY-MM-DD" },
                { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
                { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
              ]}
              helperText="Formatting pattern for dates across tables and charts."
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400 block mb-1">
            Default Trading Mode
          </label>
          <div className="flex items-center gap-3 p-3 rounded-md bg-surface-2 border border-border-color">
            <div className="flex-1">
              <span className="text-xs font-semibold text-gray-200">PAPER SIMULATION</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Default sandbox mode. Real orders cannot be broadcast from this workspace.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-profit px-2 py-0.5 rounded bg-profit/10 border border-profit/30">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Save / Cancel Action Bar */}
      <div className="flex items-center gap-2 pt-2">
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
