"use client";

import React from "react";
import { ValidationAssessment } from "@/lib/mockBacktestsData";
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from "lucide-react";

interface ValidationAssessmentCardProps {
  assessment: ValidationAssessment;
}

export function ValidationAssessmentCard({ assessment }: ValidationAssessmentCardProps) {
  const isReady = assessment.readiness === "READY FOR PAPER TRADING";
  const isRejected = assessment.readiness === "REJECTED";

  const gates = [
    { name: "Historical In-Sample", status: assessment.historicalBacktest },
    { name: "Out-of-Sample Retention", status: assessment.outOfSample },
    { name: "Walk-Forward Windows", status: assessment.walkForward },
    { name: "Friction & Costs Deducted", status: assessment.costsIncluded },
    { name: "Macro Data Coverage", status: assessment.dataCoverage },
  ];

  return (
    <div
      className={`p-4 rounded-lg border flex flex-col justify-between ${
        isReady
          ? "bg-emerald-950/10 border-emerald-500/30"
          : isRejected
          ? "bg-red-950/10 border-red-500/30"
          : "bg-amber-950/10 border-amber-500/30"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded border ${
              isReady
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : isRejected
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            {isReady ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Validation Assessment & Decision Gate
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Objective quantitative gate criteria for progression along the strategy validation ladder.
            </p>
          </div>
        </div>

        {/* Readiness Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold tracking-wider ${
            isReady
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10"
              : isRejected
              ? "bg-red-500/20 text-red-300 border border-red-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          }`}
        >
          {isReady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {assessment.readiness}
        </span>
      </div>

      {/* Gates Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3">
        {gates.map((g) => (
          <div
            key={g.name}
            className="p-2 rounded bg-surface-1/80 border border-border/50 flex flex-col justify-between font-mono text-xs"
          >
            <span className="text-[10px] text-text-muted">{g.name}</span>
            <div className="flex items-center gap-1 mt-1">
              {g.status === "PASS" ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <XCircle className="w-3 h-3 text-red-400" />
              )}
              <span className={`font-bold ${g.status === "PASS" ? "text-emerald-400" : "text-red-400"}`}>
                {g.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary assessment text */}
      <div className="p-2.5 rounded bg-surface-1/60 border border-border/40 text-xs font-mono text-text-primary leading-relaxed">
        <span className="text-text-muted mr-1.5">Decision Note:</span>
        {assessment.summary}
      </div>
    </div>
  );
}
