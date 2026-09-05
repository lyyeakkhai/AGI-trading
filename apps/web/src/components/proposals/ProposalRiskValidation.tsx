"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { ProposalRiskCheck, ProposalRiskDecision } from "@/lib/mockTradeProposalsData";
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, XCircle, Clock } from "lucide-react";

interface ProposalRiskValidationProps {
  decision: ProposalRiskDecision;
  checks: ProposalRiskCheck[];
  rejectionReason?: string;
  className?: string;
}

export function ProposalRiskValidation({
  decision,
  checks,
  rejectionReason,
  className = "",
}: ProposalRiskValidationProps) {
  const isApproved = decision === "APPROVED";
  const isRejected = decision === "REJECTED";

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden border ${
        isRejected
          ? "border-loss/40 bg-loss-dim/5"
          : isApproved
          ? "border-profit/40 bg-profit-dim/5"
          : "border-border-color"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/60 select-none">
        <div className="flex items-center gap-2">
          {isRejected ? (
            <ShieldAlert size={16} className="text-loss" />
          ) : (
            <ShieldCheck size={16} className="text-profit" />
          )}
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Deterministic Risk Engine Interlock
          </span>
        </div>

        <Badge
          variant={isApproved ? "profit" : isRejected ? "loss" : "neutral"}
          size="sm"
        >
          {decision === "APPROVED"
            ? "RISK APPROVED"
            : decision === "REJECTED"
            ? "REJECTED BY RISK"
            : "UNDER REVIEW"}
        </Badge>
      </div>

      {/* Rejection Alert Banner if Rejected */}
      {isRejected && rejectionReason && (
        <div className="p-3 bg-loss-dim/30 border-b border-loss/40 text-loss text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <AlertOctagon size={13} />
            <span>Deterministic Policy Violation</span>
          </div>
          <p className="text-[11px] leading-relaxed font-sans text-gray-200">
            {rejectionReason}
          </p>
        </div>
      )}

      {/* Checks Table */}
      <div className="p-3 space-y-2">
        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-border-color/60">
          <span>Deterministic Safety Check</span>
          <span>Value • Constraint</span>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className={`p-2 rounded flex items-center justify-between gap-3 text-[11px] border ${
                chk.passed
                  ? "bg-bg-950/70 border-border-color/60"
                  : "bg-loss-dim/20 border-loss/40 text-loss"
              }`}
            >
              <div className="flex items-center gap-2">
                {chk.passed ? (
                  <CheckCircle2 size={13} className="text-profit shrink-0" />
                ) : (
                  <XCircle size={13} className="text-loss shrink-0" />
                )}
                <span className={chk.passed ? "text-gray-200" : "text-loss font-semibold"}>
                  {chk.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-right">
                <span className="text-gray-400 text-[10px] hidden sm:inline">
                  [{chk.limit}]
                </span>
                <span
                  className={`font-bold ${
                    chk.passed ? "text-gray-200" : "text-loss"
                  }`}
                >
                  {chk.value}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    chk.passed
                      ? "bg-profit-dim text-profit"
                      : "bg-loss-dim text-loss"
                  }`}
                >
                  {chk.passed ? "PASS" : "FAIL"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Principle Statement */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/30 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>HERMES PROPOSES • RISK ENGINE ENFORCES</span>
        <span className={isApproved ? "text-profit" : "text-loss"}>
          {isApproved ? "7/7 CONSTRAINTS SATISFIED" : "1 OR MORE VIOLATIONS"}
        </span>
      </div>
    </Surface>
  );
}
