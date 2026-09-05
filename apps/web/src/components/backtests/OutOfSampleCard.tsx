"use client";

import React from "react";
import { OOSResult, WalkForwardWindow } from "@/lib/mockBacktestsData";
import { CheckCircle2, XCircle, Split, Repeat } from "lucide-react";

interface OutOfSampleCardProps {
  oos: OOSResult;
  walkForward: {
    windows: WalkForwardWindow[];
    overall: "PASS" | "FAIL";
  };
}

export function OutOfSampleCard({ oos, walkForward }: OutOfSampleCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Out of Sample Validation */}
      <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Split className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Out-of-Sample (OOS) Validation
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${
              oos.status === "PASS"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {oos.status === "PASS" ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
            {oos.status}
          </span>
        </div>

        {/* Windows */}
        <div className="space-y-2 mb-3 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded bg-surface-2/40 border border-border/30">
            <span className="text-text-muted">In-Sample Training:</span>
            <span className="text-text-primary font-medium">{oos.trainingPeriod}</span>
            <span className="text-emerald-400 font-bold">+{oos.trainingReturn.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-cyan-950/20 border border-cyan-500/20">
            <span className="text-cyan-400 font-medium">Out-of-Sample Test:</span>
            <span className="text-text-primary font-medium">{oos.testingPeriod}</span>
            <span className="text-emerald-400 font-bold">+{oos.oosReturn.toFixed(1)}%</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">OOS Profit Factor</span>
            <span className="text-text-primary font-bold text-sm">
              {oos.oosProfitFactor.toFixed(2)}
            </span>
          </div>
          <div className="p-2 rounded bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">OOS Max Drawdown</span>
            <span className="text-red-400 font-bold text-sm">
              {oos.oosMaxDrawdown.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Walk-Forward Validation */}
      <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Repeat className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Walk-Forward Rolling Windows
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${
              walkForward.overall === "PASS"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {walkForward.overall === "PASS" ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
            OVERALL {walkForward.overall}
          </span>
        </div>

        {/* Windows list */}
        <div className="space-y-1.5 text-xs font-mono">
          {walkForward.windows.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-1.5 px-2 rounded bg-surface-2/40 border border-border/30"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${w.status === "PASS" ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-text-primary">{w.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={w.returnPct >= 0 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                  {w.returnPct >= 0 ? `+${w.returnPct.toFixed(1)}%` : `${w.returnPct.toFixed(1)}%`}
                </span>
                <span className="text-text-muted text-[11px]">PF {w.pf.toFixed(2)}</span>
                <span
                  className={`text-[10px] font-bold px-1 rounded ${
                    w.status === "PASS" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                  }`}
                >
                  {w.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
