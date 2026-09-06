"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, RotateCcw, Trash2, RefreshCw } from "lucide-react";
import { DangerConfirmationModal, DangerActionType } from "./DangerConfirmationModal";

interface DangerZoneSectionProps {
  onResetSettings: () => void;
  onClearMockData: () => void;
  onResetWorkspace: () => void;
}

export function DangerZoneSection({
  onResetSettings,
  onClearMockData,
  onResetWorkspace,
}: DangerZoneSectionProps) {
  const [activeAction, setActiveAction] = useState<DangerActionType | null>(null);

  const handleConfirm = () => {
    if (activeAction === "RESET_SETTINGS") {
      onResetSettings();
    } else if (activeAction === "CLEAR_MOCK_DATA") {
      onClearMockData();
    } else if (activeAction === "RESET_WORKSPACE") {
      onResetWorkspace();
    }
    setActiveAction(null);
  };

  return (
    <div className="space-y-4 max-w-2xl pt-4 border-t border-loss/30">
      <div className="flex items-center gap-2 text-loss">
        <AlertOctagon size={16} />
        <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
      </div>
      <p className="text-[11px] text-gray-400">
        Destructive state actions for sandbox clearing and factory resets. All actions require confirmation.
      </p>

      <div className="bg-surface border border-loss/30 rounded-lg divide-y divide-border-color/60 overflow-hidden">
        {/* Reset Settings */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-loss/5 transition-colors">
          <div>
            <span className="text-xs font-semibold text-gray-200">Reset All Settings</span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Revert all workspace preferences, risk limits, and Hermes modes to factory defaults.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<RotateCcw size={13} />}
            onClick={() => setActiveAction("RESET_SETTINGS")}
          >
            Reset Settings
          </Button>
        </div>

        {/* Clear Mock Session Data */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-loss/5 transition-colors">
          <div>
            <span className="text-xs font-semibold text-gray-200">Clear Mock Cache</span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Purge temporary browser memory ticks, simulation logs, and local caches.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={13} />}
            onClick={() => setActiveAction("CLEAR_MOCK_DATA")}
          >
            Clear Mock Data
          </Button>
        </div>

        {/* Reset Workspace Views */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-loss/5 transition-colors">
          <div>
            <span className="text-xs font-semibold text-gray-200">Reset Workspace UI</span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Restore default column widths, table filters, and panel dock positions.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={() => setActiveAction("RESET_WORKSPACE")}
          >
            Reset Workspace
          </Button>
        </div>
      </div>

      <DangerConfirmationModal
        isOpen={activeAction !== null}
        actionType={activeAction}
        onClose={() => setActiveAction(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
