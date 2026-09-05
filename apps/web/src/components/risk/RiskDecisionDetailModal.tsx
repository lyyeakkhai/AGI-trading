"use client";

import React from "react";
import Link from "next/link";
import { RiskDecisionItem } from "@/lib/mockRiskData";
import { Modal, Button } from "@/components";
import { CheckCircle2, XCircle, ShieldAlert, ArrowUpRight, ArrowRight, ShieldCheck, AlertOctagon } from "lucide-react";

interface RiskDecisionDetailModalProps {
  decision: RiskDecisionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RiskDecisionDetailModal({
  decision,
  isOpen,
  onClose,
}: RiskDecisionDetailModalProps) {
  if (!decision) return null;

  const isApproved = decision.decision === "APPROVED";

  const checkList = [
    { name: "Per-Trade Risk (< 1.0%)", status: decision.checks.perTradeRisk },
    { name: "Portfolio Risk Envelope (< 5.0%)", status: decision.checks.portfolioRisk },
    { name: "Daily Loss Circuit Breaker", status: decision.checks.dailyLoss },
    { name: "Asset Exposure Concentration", status: decision.checks.assetExposure },
    { name: "Open Positions Ceiling (< 5)", status: decision.checks.openPositions },
    { name: "Minimum Risk/Reward (> 1.5R)", status: decision.checks.riskReward },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deterministic Risk Evaluation — ${decision.proposalId}`}
      size="lg"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-3 rounded bg-surface-1 border border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary text-sm">{decision.symbol}</span>
              <span className="text-text-muted">{decision.side}</span>
              <span className="text-text-muted">·</span>
              <span className="text-cyan-400">{decision.riskReward}R Hurdle</span>
            </div>
            {decision.strategyName && (
              <span className="text-[11px] text-text-muted block mt-0.5">
                Strategy: {decision.strategyName}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold ${
              isApproved
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {isApproved ? <ShieldCheck className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
            {decision.decision}
          </span>
        </div>

        {/* Portfolio Impact Comparison */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Current Risk</span>
            <span className="text-base font-bold text-text-primary">
              {decision.riskBeforePercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-muted block mt-0.5">Before proposal</span>
          </div>

          <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30">
            <span className="text-[10px] text-cyan-400 block">Requested Add</span>
            <span className="text-base font-bold text-cyan-300">
              +{decision.requestedRiskPercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-muted block mt-0.5">Incremental capital at risk</span>
          </div>

          <div className="p-2.5 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Risk After Trade</span>
            <span className={`text-base font-bold ${decision.riskAfterPercent <= decision.maxLimitPercent ? "text-emerald-400" : "text-red-400"}`}>
              {decision.riskAfterPercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-muted block mt-0.5">Limit: {decision.maxLimitPercent.toFixed(1)}% max</span>
          </div>
        </div>

        {/* Checks Evaluation Matrix */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] uppercase tracking-wider text-text-muted">
            Individual Gate Validations
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {checkList.map((c) => (
              <div
                key={c.name}
                className="p-2 rounded bg-surface-2/40 border border-border/30 flex items-center justify-between"
              >
                <span className="text-text-primary text-[11px]">{c.name}</span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    c.status === "PASS"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-red-400 bg-red-500/10"
                  }`}
                >
                  {c.status === "PASS" ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <XCircle className="w-2.5 h-2.5" />
                  )}
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Rationale */}
        <div className={`p-3 rounded border text-xs leading-relaxed ${isApproved ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-300" : "bg-red-950/10 border-red-500/20 text-red-300"}`}>
          <span className="font-bold block mb-1">
            {isApproved ? "Validation Passed:" : "Rejection Reason:"}
          </span>
          {decision.reason}
        </div>

        {/* Suggested Action for Rejection */}
        {decision.suggestedAction && (
          <div className="p-3 rounded bg-amber-950/10 border border-amber-500/20 text-amber-300 text-xs">
            <span className="font-bold block mb-1">Required Quantitative Adjustment:</span>
            {decision.suggestedAction}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href="/trade-proposals"
            className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
          >
            <span>Inspect in Trade Proposals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Button variant="secondary" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
