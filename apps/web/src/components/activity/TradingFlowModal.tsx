"use client";

import React from "react";
import { TradingFlowTrace } from "@/lib/mockActivityData";
import { ActivityStatusBadge } from "./ActivityStatusBadge";
import { Modal, Button } from "@/components";
import { GitCommit, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface TradingFlowModalProps {
  flow: TradingFlowTrace | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TradingFlowModal({
  flow,
  isOpen,
  onClose,
}: TradingFlowModalProps) {
  if (!flow) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trading Pipeline Lifecycle Trace — ${flow.flowId}`}
      size="lg"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Flow Header */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-zinc-50 text-sm">{flow.symbol}</span>
              <span className="text-gray-500 dark:text-gray-400">{flow.side}</span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-cyan-400">{flow.strategy}</span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
              Current Stage: <strong className="text-gray-900 dark:text-zinc-50">{flow.currentStage}</strong>
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
              flow.overallStatus === "COMPLETED"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {flow.overallStatus === "COMPLETED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {flow.overallStatus}
          </span>
        </div>

        {/* Step-by-Step Lifecycle Ladder */}
        <div className="space-y-2 relative pl-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-cyan-500/30">
          {flow.steps.map((step, idx) => (
            <div
              key={step.stage}
              className="relative p-3 rounded-xl bg-gray-100 dark:bg-zinc-800/50/60 border border-gray-200 dark:border-white/10/40 space-y-1"
            >
              {/* Step indicator dot */}
              <div className="absolute -left-[18px] top-3.5 w-2 h-2 rounded-full bg-cyan-400 border border-cyan-300" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-900 dark:text-zinc-50">
                    {idx + 1}. {step.stage}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-xl bg-white dark:bg-zinc-900/50 text-[10px] text-cyan-400 font-bold">
                    {step.objectId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{step.timestamp}</span>
                  <ActivityStatusBadge status={step.status} />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {step.summary}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-white/10">
          <Button variant="secondary" onClick={onClose} className="text-xs">
            Close Trace
          </Button>
        </div>
      </div>
    </Modal>
  );
}
