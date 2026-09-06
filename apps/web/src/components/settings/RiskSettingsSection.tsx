"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, AlertTriangle, CheckCircle2, RotateCcw, Lock, Power } from "lucide-react";
import { RiskSettings } from "@/lib/mockSettingsData";
import { RiskConfirmationModal, RiskFieldChange } from "./RiskConfirmationModal";

interface RiskSettingsSectionProps {
  data: RiskSettings;
  originalData: RiskSettings;
  onChange: (updated: Partial<RiskSettings>) => void;
  onConfirmSave: (updatedRisk: RiskSettings, changes: RiskFieldChange[]) => void;
  onCancel: () => void;
  isDirty: boolean;
}

export function RiskSettingsSection({
  data,
  originalData,
  onChange,
  onConfirmSave,
  onCancel,
  isDirty,
}: RiskSettingsSectionProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Compute field-by-field changes between original and pending values
  const getChanges = (): RiskFieldChange[] => {
    const list: RiskFieldChange[] = [];
    if (data.maxRiskPerTrade !== originalData.maxRiskPerTrade) {
      list.push({
        label: "Max Risk / Trade",
        previous: originalData.maxRiskPerTrade,
        current: data.maxRiskPerTrade,
        unit: "%",
      });
    }
    if (data.maxPortfolioRisk !== originalData.maxPortfolioRisk) {
      list.push({
        label: "Max Portfolio Risk",
        previous: originalData.maxPortfolioRisk,
        current: data.maxPortfolioRisk,
        unit: "%",
      });
    }
    if (data.maxDailyLoss !== originalData.maxDailyLoss) {
      list.push({
        label: "Max Daily Loss",
        previous: originalData.maxDailyLoss,
        current: data.maxDailyLoss,
        unit: "%",
      });
    }
    if (data.maxOpenPositions !== originalData.maxOpenPositions) {
      list.push({
        label: "Max Open Positions",
        previous: originalData.maxOpenPositions,
        current: data.maxOpenPositions,
      });
    }
    if (data.maxAssetExposure !== originalData.maxAssetExposure) {
      list.push({
        label: "Max Asset Exposure",
        previous: originalData.maxAssetExposure,
        current: data.maxAssetExposure,
        unit: "%",
      });
    }
    if (data.maxCorrelatedExposure !== originalData.maxCorrelatedExposure) {
      list.push({
        label: "Max Correlated Exposure",
        previous: originalData.maxCorrelatedExposure,
        current: data.maxCorrelatedExposure,
        unit: "%",
      });
    }
    if (data.minRiskReward !== originalData.minRiskReward) {
      list.push({
        label: "Minimum R:R",
        previous: originalData.minRiskReward,
        current: data.minRiskReward,
        unit: "R",
      });
    }
    if (data.tradingLock !== originalData.tradingLock) {
      list.push({
        label: "Trading Lock (Kill Switch)",
        previous: originalData.tradingLock ? "ON" : "OFF",
        current: data.tradingLock ? "ON" : "OFF",
      });
    }
    return list;
  };

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>Deterministic Risk Configuration</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Mathematical limits enforcing maximum trade risk, portfolio exposure, and daily circuit breakers.
          </p>
        </div>

        {isDirty && (
          <span className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      {/* Prominent Risk Warning (Section 12) */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/40 flex items-start gap-3 max-w-2xl">
        <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-warning uppercase tracking-wider">
            Critical Risk Boundary Notice
          </h3>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Risk configuration directly impacts future trade validation. Modifying these parameters
            alters deterministic rejection thresholds for all subsequent Hermes trade proposals.
            All modifications require explicit dual-confirmation before taking effect.
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl bg-surface border border-border-color rounded-lg p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Max Risk / Trade (%)"
              type="number"
              step="0.1"
              min="0.1"
              max="5.0"
              value={data.maxRiskPerTrade}
              onChange={(e) => onChange({ maxRiskPerTrade: parseFloat(e.target.value) || 0 })}
              mono
              helperText="Baseline: 1.0%. Strictest per-position equity risk."
            />
          </div>

          <div>
            <Input
              label="Max Portfolio Risk (%)"
              type="number"
              step="0.5"
              min="1.0"
              max="15.0"
              value={data.maxPortfolioRisk}
              onChange={(e) => onChange({ maxPortfolioRisk: parseFloat(e.target.value) || 0 })}
              mono
              helperText="Baseline: 5.0%. Aggregate open stop loss ceiling."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Max Daily Loss (%)"
              type="number"
              step="0.5"
              min="1.0"
              max="10.0"
              value={data.maxDailyLoss}
              onChange={(e) => onChange({ maxDailyLoss: parseFloat(e.target.value) || 0 })}
              mono
              helperText="Baseline: 3.0%. Daily circuit breaker threshold."
            />
          </div>

          <div>
            <Input
              label="Max Open Positions"
              type="number"
              step="1"
              min="1"
              max="20"
              value={data.maxOpenPositions}
              onChange={(e) => onChange({ maxOpenPositions: parseInt(e.target.value, 10) || 0 })}
              mono
              helperText="Baseline: 5 slots. Maximum concurrency."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Max Single Asset Exposure (%)"
              type="number"
              step="5"
              min="10"
              max="100"
              value={data.maxAssetExposure}
              onChange={(e) => onChange({ maxAssetExposure: parseFloat(e.target.value) || 0 })}
              mono
              helperText="Baseline: 40%. Concentration limit per symbol."
            />
          </div>

          <div>
            <Input
              label="Max Correlated Exposure (%)"
              type="number"
              step="5"
              min="10"
              max="100"
              value={data.maxCorrelatedExposure}
              onChange={(e) =>
                onChange({ maxCorrelatedExposure: parseFloat(e.target.value) || 0 })
              }
              mono
              helperText="Baseline: 60%. Combined BTC + ETH cluster limit."
            />
          </div>
        </div>

        <div>
          <Input
            label="Minimum Risk / Reward Ratio (R:R)"
            type="number"
            step="0.1"
            min="1.0"
            max="5.0"
            value={data.minRiskReward}
            onChange={(e) => onChange({ minRiskReward: parseFloat(e.target.value) || 0 })}
            mono
            helperText="Baseline: 1.5R. Proposals below this ratio are rejected."
          />
        </div>

        {/* Emergency Kill Switch */}
        <div className="pt-3 border-t border-border-color">
          <div className="flex items-center justify-between p-3.5 rounded-md bg-surface-2 border border-border-color">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Power size={14} className={data.tradingLock ? "text-loss" : "text-gray-400"} />
                <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Emergency Trading Lock
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    data.tradingLock
                      ? "bg-loss/20 text-loss font-bold border border-loss/30"
                      : "bg-surface text-gray-400 border border-border-color"
                  }`}
                >
                  {data.tradingLock ? "HALTED" : "OFF"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Immediately block all incoming proposals from transitioning into active trades.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onChange({ tradingLock: !data.tradingLock })}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                data.tradingLock
                  ? "bg-loss text-white hover:bg-loss/90"
                  : "bg-surface-elevated text-gray-300 border border-border-color hover:border-loss hover:text-loss"
              }`}
            >
              {data.tradingLock ? "DISABLE LOCK" : "ENGAGE LOCK"}
            </button>
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
          onClick={handleOpenConfirm}
        >
          Save Risk Configuration
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

      {/* Confirmation Modal */}
      <RiskConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => onConfirmSave(data, getChanges())}
        changes={getChanges()}
        newRiskState={data}
      />
    </div>
  );
}
