"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Play, Eye, Trash2, CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";
import { ExecutionRequest, OrderStatus } from "@/lib/mockExecutionData";

interface ExecutionQueueTableProps {
  requests: ExecutionRequest[];
  onSelectRequest: (req: ExecutionRequest) => void;
  onExecuteRequest: (req: ExecutionRequest) => void;
  onCancelRequest: (req: ExecutionRequest) => void;
  selectedRequestId?: string;
}

export function ExecutionQueueTable({
  requests,
  onSelectRequest,
  onExecuteRequest,
  onCancelRequest,
  selectedRequestId,
}: ExecutionQueueTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-warning/15 text-warning border border-warning/30">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            READY
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            SUBMITTED
          </span>
        );
      case "PARTIALLY_FILLED":
        return (
          <div className="flex flex-col gap-1 min-w-[90px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              PARTIAL
            </span>
            <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border-color">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
        );
      case "FILLED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-profit/15 text-profit border border-profit/30">
            <CheckCircle2 size={11} />
            FILLED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface text-gray-500 border border-border-color">
            <XCircle size={11} />
            CANCELLED
          </span>
        );
      case "FAILED":
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-loss/15 text-loss border border-loss/30">
            <AlertTriangle size={11} />
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface text-gray-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface border border-border-color rounded-lg overflow-hidden flex flex-col">
      {/* Table Filter Bar */}
      <div className="px-4 py-3 border-b border-border-color flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-100 uppercase tracking-wider">
            Execution Queue
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {filteredRequests.length} REQUESTS
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          {["ALL", "READY", "SUBMITTED", "PARTIALLY_FILLED", "FILLED", "FAILED", "CANCELLED"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                statusFilter === filter
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-surface"
              }`}
            >
              {filter === "PARTIALLY_FILLED" ? "PARTIAL" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-color bg-surface text-gray-400 font-mono text-[11px]">
              <th className="py-2.5 px-3">Execution / Proposal</th>
              <th className="py-2.5 px-3">Instrument</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3 text-right">Quantity</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-right">Risk</th>
              <th className="py-2.5 px-3">Dual Sign</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/60 font-mono">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500 italic">
                  No execution requests match the current filter.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequestId === req.id;
                return (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-cyan-500/10 hover:bg-cyan-500/15"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-gray-200">{req.id}</div>
                      <div className="text-[10px] text-gray-500">{req.proposalId}</div>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-gray-200">{req.symbol}</td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          req.side === "LONG"
                            ? "bg-profit/15 text-profit border border-profit/30"
                            : "bg-loss/15 text-loss border border-loss/30"
                        }`}
                      >
                        {req.side}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-gray-300">{req.orderType}</td>

                    <td className="py-2.5 px-3 text-right text-gray-200 font-medium">
                      {req.quantity}
                    </td>

                    <td className="py-2.5 px-3 text-right text-gray-100">
                      ${req.requestedPrice.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right text-profit">{req.riskPercent}%</td>

                    <td className="py-2.5 px-3">
                      <span className="text-profit text-[10px] flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={11} /> APPROVED
                      </span>
                    </td>

                    <td className="py-2.5 px-3">{getStatusBadge(req.status)}</td>

                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === "READY" && (
                          <Button
                            variant="primary"
                            size="xs"
                            leftIcon={<Play size={11} />}
                            onClick={() => onExecuteRequest(req)}
                          >
                            Execute
                          </Button>
                        )}
                        {req.status === "SUBMITTED" && (
                          <Button
                            variant="danger"
                            size="xs"
                            leftIcon={<Trash2 size={11} />}
                            onClick={() => onCancelRequest(req)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Eye size={11} />}
                          onClick={() => onSelectRequest(req)}
                        >
                          Review
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
