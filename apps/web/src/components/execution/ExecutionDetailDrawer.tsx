"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  X,
  ShieldCheck,
  Play,
  Trash2,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { ExecutionRequest } from "@/lib/mockExecutionData";

interface ExecutionDetailDrawerProps {
  request: ExecutionRequest | null;
  onClose: () => void;
  onExecute: (req: ExecutionRequest) => void;
  onCancel: (req: ExecutionRequest) => void;
}

export function ExecutionDetailDrawer({
  request,
  onClose,
  onExecute,
  onCancel,
}: ExecutionDetailDrawerProps) {
  if (!request) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-elevated border-l border-border-hi shadow-2xl flex flex-col animate-fadeIn">
      {/* Drawer Header */}
      <div className="p-4 border-b border-border-color flex items-center justify-between bg-surface">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
              Execution Trace // {request.id}
            </h3>
            <span className="text-[10px] font-mono text-gray-400">
              Idempotency: {request.idempotencyKey}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-surface-2 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Dual Signature Authorization Chain (Section 12) */}
        <div className="bg-surface border border-border-color rounded-lg p-3.5 space-y-2.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-profit" />
            <span>Authorization Chain</span>
          </span>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="p-2 rounded bg-surface-2 border border-border-color/60 flex items-center justify-between">
              <span className="text-gray-400">1. Trade Proposal</span>
              <span className="text-cyan-300 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> {request.proposalId}
              </span>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60 flex items-center justify-between">
              <span className="text-gray-400">2. Deterministic Risk</span>
              <span className="text-profit font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> {request.riskDecisionId} (PASSED)
              </span>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60 flex items-center justify-between">
              <span className="text-gray-400">3. Owner Dual-Sign</span>
              <span className="text-profit font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> {request.approvalId} (SIGNED)
              </span>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60 flex items-center justify-between">
              <span className="text-gray-400">4. Gateway State</span>
              <span className="text-warning font-bold">{request.status}</span>
            </div>
          </div>
        </div>

        {/* Order Specifications */}
        <div className="bg-surface border border-border-color rounded-lg p-3.5 space-y-2.5 font-mono">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Execution Parameters
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-surface-2 border border-border-color/60">
              <span className="text-gray-500 text-[10px] block">INSTRUMENT</span>
              <span className="text-gray-200 font-bold">{request.symbol}</span>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60">
              <span className="text-gray-500 text-[10px] block">DIRECTION</span>
              <span
                className={`font-bold ${
                  request.side === "LONG" ? "text-profit" : "text-loss"
                }`}
              >
                {request.side}
              </span>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60">
              <span className="text-gray-500 text-[10px] block">QUANTITY</span>
              <span className="text-cyan-300 font-bold">{request.quantity}</span>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60">
              <span className="text-gray-500 text-[10px] block">LIMIT PRICE</span>
              <span className="text-gray-100 font-bold">
                ${request.requestedPrice.toLocaleString()}
              </span>
            </div>

            {request.stopPrice && (
              <div className="p-2 rounded bg-surface-2 border border-border-color/60">
                <span className="text-gray-500 text-[10px] block">STOP LOSS</span>
                <span className="text-loss font-bold">${request.stopPrice.toLocaleString()}</span>
              </div>
            )}

            {request.takeProfitPrice && (
              <div className="p-2 rounded bg-surface-2 border border-border-color/60">
                <span className="text-gray-500 text-[10px] block">TAKE PROFIT</span>
                <span className="text-profit font-bold">
                  ${request.takeProfitPrice.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Execution Quality Metrics (If filled) */}
        {request.avgFillPrice && (
          <div className="bg-surface border border-profit/30 rounded-lg p-3.5 space-y-2 font-mono">
            <span className="text-[10px] font-bold text-profit uppercase tracking-wider block">
              Execution Quality Report
            </span>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
              <div className="p-2 rounded bg-surface-2 border border-border-color">
                <span className="text-gray-500 text-[9px] block">AVG FILL</span>
                <span className="text-gray-100 font-bold">
                  ${request.avgFillPrice.toLocaleString()}
                </span>
              </div>

              <div className="p-2 rounded bg-surface-2 border border-border-color">
                <span className="text-gray-500 text-[9px] block">SLIPPAGE</span>
                <span className="text-cyan-300 font-bold">+{request.slippageBps} bps</span>
              </div>

              <div className="p-2 rounded bg-surface-2 border border-border-color">
                <span className="text-gray-500 text-[9px] block">COMMISSION</span>
                <span className="text-gray-200 font-bold">${request.feeUsd}</span>
              </div>
            </div>
          </div>
        )}

        {/* Vertical Lifecycle Timeline (Section 27) */}
        <div className="bg-surface border border-border-color rounded-lg p-3.5 space-y-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Lifecycle Audit Trail
          </span>

          <div className="relative pl-4 space-y-4 border-l border-border-color">
            {request.timeline.map((step, idx) => (
              <div key={idx} className="relative space-y-0.5 text-[11px]">
                <span
                  className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-bg-950 ${
                    step.status === "COMPLETED"
                      ? "border-profit bg-profit"
                      : step.status === "ACTIVE"
                      ? "border-cyan-400 bg-cyan-400 animate-pulse"
                      : step.status === "FAILED"
                      ? "border-loss bg-loss"
                      : "border-gray-600"
                  }`}
                />
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-gray-200">{step.label}</span>
                  <span className="text-[10px] text-gray-500">{step.timestamp}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live trading locked notice */}
        <div className="p-3 rounded-md bg-loss/10 border border-loss/30 text-loss text-[11px] flex items-start gap-2">
          <Lock size={14} className="shrink-0 mt-0.5" />
          <span>
            Live trading endpoints are disabled. Orders are simulated in in-memory paper match
            execution.
          </span>
        </div>
      </div>

      {/* Drawer Actions Footer */}
      <div className="p-4 border-t border-border-color bg-surface flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
        {request.status === "READY" && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play size={13} />}
            onClick={() => onExecute(request)}
          >
            Execute Paper Order
          </Button>
        )}
        {request.status === "SUBMITTED" && (
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={13} />}
            onClick={() => onCancel(request)}
          >
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}
