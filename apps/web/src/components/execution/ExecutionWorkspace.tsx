"use client";

import React, { useState, useMemo } from "react";
import {
  ExecutionRequest,
  ExecutionMetrics,
  initialExecutionRequests,
  initialExecutionMetrics,
} from "@/lib/mockExecutionData";
import { ExecutionHeader } from "./ExecutionHeader";
import { ExecutionMetricsSummary } from "./ExecutionMetricsSummary";
import { ExecutionQueueTable } from "./ExecutionQueueTable";
import { ExecutionDetailDrawer } from "./ExecutionDetailDrawer";
import { ExecuteConfirmModal } from "./ExecuteConfirmModal";
import { CancelConfirmModal } from "./CancelConfirmModal";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export function ExecutionWorkspace() {
  const [requests, setRequests] = useState<ExecutionRequest[]>(initialExecutionRequests);
  const [metrics, setMetrics] = useState<ExecutionMetrics>(initialExecutionMetrics);
  const [serviceStatus, setServiceStatus] = useState<"READY" | "LOCKED" | "PAUSED">("READY");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<ExecutionRequest | null>(null);
  const [executingRequest, setExecutingRequest] = useState<ExecutionRequest | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState<ExecutionRequest | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Search filtering
  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.proposalId.toLowerCase().includes(q) ||
        r.symbol.toLowerCase().includes(q) ||
        (r.exchangeOrderId && r.exchangeOrderId.toLowerCase().includes(q))
    );
  }, [requests, searchQuery]);

  // Execute Paper Order Handler
  const handleConfirmExecute = () => {
    if (!executingRequest) return;
    if (serviceStatus === "LOCKED") {
      showToast("Execution blocked: Engine is currently in LOCKED state.");
      return;
    }

    // Double-execution protection
    if (executingRequest.status === "FILLED" || executingRequest.status === "SUBMITTED") {
      showToast(`Double-execution blocked: ${executingRequest.id} is already in-flight or filled.`);
      return;
    }

    const fillPrice =
      executingRequest.side === "LONG"
        ? Math.round(executingRequest.requestedPrice * 1.0003 * 100) / 100
        : Math.round(executingRequest.requestedPrice * 0.9997 * 100) / 100;
    const nowTime = new Date().toISOString().slice(11, 19);

    const updatedTimeline = [
      ...executingRequest.timeline,
      {
        label: "Order Submitted",
        timestamp: nowTime,
        status: "COMPLETED" as const,
        detail: "Placed on simulated orderbook.",
      },
      {
        label: "Order Filled",
        timestamp: nowTime,
        status: "COMPLETED" as const,
        detail: `100% paper filled @ $${fillPrice.toLocaleString()} (+3.0 bps slippage).`,
      },
      {
        label: "Position Created",
        timestamp: nowTime,
        status: "COMPLETED" as const,
        detail: `Added position ${executingRequest.symbol} ${executingRequest.side} to portfolio.`,
      },
    ];

    const updated: ExecutionRequest = {
      ...executingRequest,
      status: "FILLED",
      submittedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      completedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      exchangeOrderId: `BIN-SIM-${Date.now().toString().slice(-5)}`,
      avgFillPrice: fillPrice,
      filledQuantity: executingRequest.quantity,
      remainingQuantity: "0.00",
      slippageBps: 3.0,
      feeUsd: 2.15,
      timeline: updatedTimeline,
    };

    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedRequest?.id === updated.id) {
      setSelectedRequest(updated);
    }

    // Update metrics
    setMetrics((prev) => ({
      ...prev,
      readyToExecute: Math.max(0, prev.readyToExecute - 1),
      filledToday: prev.filledToday + 1,
    }));

    showToast(
      `Order ${updated.id} filled @ $${fillPrice.toLocaleString()} USD (${updated.quantity})`
    );
    setExecutingRequest(null);
  };

  // Cancel Order Handler
  const handleConfirmCancel = () => {
    if (!cancellingRequest) return;

    const nowTime = new Date().toISOString().slice(11, 19);
    const updated: ExecutionRequest = {
      ...cancellingRequest,
      status: "CANCELLED",
      failureReason: "User manually cancelled resting limit order.",
      timeline: [
        ...cancellingRequest.timeline,
        {
          label: "Order Cancelled",
          timestamp: nowTime,
          status: "FAILED",
          detail: "Cancelled by owner.",
        },
      ],
    };

    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedRequest?.id === updated.id) {
      setSelectedRequest(updated);
    }

    setMetrics((prev) => ({
      ...prev,
      submitted: Math.max(0, prev.submitted - 1),
      cancelled: prev.cancelled + 1,
    }));

    showToast(`Order ${updated.id} cancelled successfully.`);
    setCancellingRequest(null);
  };

  const handleToggleLock = () => {
    const next = serviceStatus === "READY" ? "LOCKED" : "READY";
    setServiceStatus(next);
    showToast(`Execution Engine status set to: ${next}`);
  };

  return (
    <div className="min-h-screen bg-bg-950 text-gray-100 flex flex-col">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-surface-elevated border border-profit/50 text-profit shadow-2xl animate-fadeIn text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <ExecutionHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          serviceStatus={serviceStatus}
          onToggleLock={handleToggleLock}
        />

        {/* Metric Cards */}
        <ExecutionMetricsSummary metrics={metrics} />

        {/* Main Queue Table */}
        <ExecutionQueueTable
          requests={filteredRequests}
          onSelectRequest={(req) => setSelectedRequest(req)}
          onExecuteRequest={(req) => setExecutingRequest(req)}
          onCancelRequest={(req) => setCancellingRequest(req)}
          selectedRequestId={selectedRequest?.id}
        />
      </div>

      {/* Drawer */}
      <ExecutionDetailDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onExecute={(req) => setExecutingRequest(req)}
        onCancel={(req) => setCancellingRequest(req)}
      />

      {/* Confirmation Modals */}
      <ExecuteConfirmModal
        isOpen={executingRequest !== null}
        request={executingRequest}
        onClose={() => setExecutingRequest(null)}
        onConfirm={handleConfirmExecute}
      />

      <CancelConfirmModal
        isOpen={cancellingRequest !== null}
        request={cancellingRequest}
        onClose={() => setCancellingRequest(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
