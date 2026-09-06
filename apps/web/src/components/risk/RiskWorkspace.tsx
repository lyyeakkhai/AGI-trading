"use client";

import React, { useState } from "react";
import {
  mockRiskOverview,
  mockExposureOverview,
  mockPositionRisks,
  mockRiskLimits,
  mockRiskChecks,
  mockRiskDecisions,
  mockRiskEvents,
  mockSafetyStatus,
  RiskDecisionItem,
} from "@/lib/mockRiskData";
import { RiskSummaryHeader } from "./RiskSummaryHeader";
import { RiskBudgetCard } from "./RiskBudgetCard";
import { DailyLossProtectionCard } from "./DailyLossProtectionCard";
import { PortfolioExposureCard } from "./PortfolioExposureCard";
import { ConcentrationRiskCard } from "./ConcentrationRiskCard";
import { PositionRiskTable } from "./PositionRiskTable";
import { RiskLimitsCard } from "./RiskLimitsCard";
import { RiskCheckTable } from "./RiskCheckTable";
import { RecentRiskDecisionsTable } from "./RecentRiskDecisionsTable";
import { RiskDecisionDetailModal } from "./RiskDecisionDetailModal";
import { PositionSizeCalculatorCard } from "./PositionSizeCalculatorCard";
import { WhatIfRiskPreviewCard } from "./WhatIfRiskPreviewCard";
import { HermesRiskPanel } from "./HermesRiskPanel";
import { RiskActivityTimeline } from "./RiskActivityTimeline";
import { SafetyStatusCard } from "./SafetyStatusCard";
import { Modal, Button } from "@/components";
import { ShieldCheck, Lock, AlertTriangle } from "lucide-react";

export function RiskWorkspace() {
  const [selectedDecision, setSelectedDecision] = useState<RiskDecisionItem | null>(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <RiskSummaryHeader
        overview={mockRiskOverview}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
      />

      {/* 2. Top Metric Cards: Risk Budget & Daily Loss Circuit Breaker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskBudgetCard overview={mockRiskOverview} />
        <DailyLossProtectionCard overview={mockRiskOverview} />
      </div>

      {/* 3. Exposure & Correlation Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PortfolioExposureCard
          exposure={mockExposureOverview}
          portfolioEquity={mockRiskOverview.portfolioEquity}
        />
        <ConcentrationRiskCard exposure={mockExposureOverview} />
      </div>

      {/* 4. Active Position Risk Attribution */}
      <PositionRiskTable positions={mockPositionRisks} />

      {/* 5. Configured Institutional Risk Limits */}
      <RiskLimitsCard limits={mockRiskLimits} />

      {/* 6. Pre-Trade Deterministic Checks Table */}
      <RiskCheckTable checks={mockRiskChecks} />

      {/* 7. Recent Proposal Risk Decisions Table */}
      <RecentRiskDecisionsTable
        decisions={mockRiskDecisions}
        onSelectDecision={setSelectedDecision}
      />

      {/* 8. Interactive Calculators & Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PositionSizeCalculatorCard initialEquity={mockRiskOverview.portfolioEquity} />
        <WhatIfRiskPreviewCard
          currentPortfolioRisk={mockRiskOverview.portfolioRisk}
          maxPortfolioRisk={mockRiskOverview.maxPortfolioRisk}
        />
      </div>

      {/* 9. Bottom Intelligence & Safety Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HermesRiskPanel
          portfolioRisk={mockRiskOverview.portfolioRisk}
          availableRisk={mockRiskOverview.availableRisk}
          warningCount={0}
        />
        <RiskActivityTimeline events={mockRiskEvents} />
        <SafetyStatusCard
          safety={mockSafetyStatus}
          onOpenControls={() => setIsSafetyModalOpen(true)}
        />
      </div>

      {/* Decision Detail Modal */}
      <RiskDecisionDetailModal
        decision={selectedDecision}
        isOpen={selectedDecision !== null}
        onClose={() => setSelectedDecision(null)}
      />

      {/* Safety Controls Status Modal */}
      <Modal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        title="Institutional Trading Safety Controls"
        size="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300 block">Paper Trading Mode Active</span>
              <p className="text-text-muted text-[11px] mt-0.5">
                All order executions are routed strictly to the local paper simulation engine. Live exchange order routing is locked.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-2 rounded bg-surface-1 border border-border">
              <span className="text-text-muted">Trading Lock:</span>
              <span className="font-bold text-emerald-400">OFF (Paper Active)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-1 border border-border">
              <span className="text-text-muted">Live Trading:</span>
              <span className="font-bold text-text-muted">DISABLED</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-1 border border-border">
              <span className="text-text-muted">Emergency Kill-Switch:</span>
              <span className="font-bold text-emerald-400">STANDBY / INACTIVE</span>
            </div>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Note: Live trading controls, physical API credentials, and hardware kill switches will be managed in Task 18 (Live Trading Controls).
          </p>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setIsSafetyModalOpen(false)} className="text-xs">
              Dismiss
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
