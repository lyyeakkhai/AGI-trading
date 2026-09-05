"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from "lucide-react";
import { ReadinessGate, GateStatus } from "@/lib/mockLiveSafetyData";

interface ReadinessGatesCardProps {
  gates: ReadinessGate[];
}

export function ReadinessGatesCard({ gates }: ReadinessGatesCardProps) {
  const passedCount = gates.filter((g) => g.status === "PASS").length;
  const isAllPassed = passedCount === gates.length;

  const getStatusBadge = (status: GateStatus) => {
    switch (status) {
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-profit/15 text-profit border border-profit/30">
            <CheckCircle2 size={11} />
            PASS
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-warning/15 text-warning border border-warning/30">
            <AlertTriangle size={11} />
            WARNING
          </span>
        );
      case "FAIL":
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-loss/15 text-loss border border-loss/30">
            <XCircle size={11} />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface border border-border-color rounded-lg overflow-hidden flex flex-col">
      {/* Header & Score */}
      <div className="px-5 py-4 border-b border-border-color flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-2">
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={16} className="text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
              Production Readiness Matrix
            </h3>
            <p className="text-[11px] text-gray-400">
              12 authoritative security and infrastructure verification gates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-300 font-semibold">
            {passedCount} / {gates.length} Gates Passed
          </span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
              isAllPassed
                ? "bg-profit/15 border-profit/40 text-profit"
                : "bg-warning/15 border-warning/40 text-warning"
            }`}
          >
            {isAllPassed ? "READY FOR LIVE" : "GATED / NOT READY"}
          </span>
        </div>
      </div>

      {/* Gates Grid */}
      <div className="divide-y divide-border-color/60">
        {gates.map((gate) => (
          <div
            key={gate.id}
            className="p-3.5 hover:bg-surface-2 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
          >
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded bg-surface-2 border border-border-color text-gray-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {gate.number}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200">{gate.name}</span>
                  <span className="text-[9px] font-mono text-gray-500 bg-surface px-1.5 py-0.5 rounded border border-border-color">
                    {gate.category}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{gate.detail}</p>
              </div>
            </div>

            <div className="self-end sm:self-center shrink-0">
              {getStatusBadge(gate.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
