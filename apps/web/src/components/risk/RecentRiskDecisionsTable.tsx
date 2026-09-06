"use client";

import React, { useState } from "react";
import { RiskDecisionItem, DecisionStatus } from "@/lib/mockRiskData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from "@/components";
import { CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, Search, FileText } from "lucide-react";

interface RecentRiskDecisionsTableProps {
  decisions: RiskDecisionItem[];
  onSelectDecision: (item: RiskDecisionItem) => void;
}

export function RecentRiskDecisionsTable({
  decisions,
  onSelectDecision,
}: RecentRiskDecisionsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [symbolFilter, setSymbolFilter] = useState<string>("ALL");
  const [timeframeFilter, setTimeframeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filteredDecisions = decisions.filter((d) => {
    if (statusFilter !== "ALL" && d.decision !== statusFilter) return false;
    if (symbolFilter !== "ALL" && d.symbol !== symbolFilter) return false;
    if (timeframeFilter === "TODAY" && !d.timestamp.includes("Today")) return false;
    if (timeframeFilter === "YESTERDAY" && !d.timestamp.includes("Today") && !d.timestamp.includes("Yesterday")) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !d.proposalId.toLowerCase().includes(q) &&
        !d.symbol.toLowerCase().includes(q) &&
        !d.reason.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const getDecisionBadge = (decision: DecisionStatus) => {
    switch (decision) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            APPROVED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3 text-red-400" />
            REJECTED
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col gap-3">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Trade Proposal Validation Decisions
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Deterministic gate pass/fail log for all Hermes-generated trade proposals
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search proposal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border border-border rounded pl-7 pr-2 py-1 text-text-primary text-xs focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
          >
            <option value="ALL">All Decisions</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="bg-background border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
          >
            <option value="ALL">All Symbols</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
          </select>

          <select
            value={timeframeFilter}
            onChange={(e) => setTimeframeFilter(e.target.value)}
            className="bg-background border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
          >
            <option value="ALL">All Timeframes</option>
            <option value="TODAY">Today (24h)</option>
            <option value="YESTERDAY">Last 48h</option>
            <option value="7D">Past 7 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border/60 bg-surface-2/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-surface-2/60 text-[11px] font-mono text-text-muted">
              <TableHead className="py-2.5 px-3">PROPOSAL</TableHead>
              <TableHead className="py-2.5 px-3">SYMBOL</TableHead>
              <TableHead className="py-2.5 px-3">SIDE</TableHead>
              <TableHead className="py-2.5 px-3 text-right">REQUESTED RISK</TableHead>
              <TableHead className="py-2.5 px-3 text-right">R:R</TableHead>
              <TableHead className="py-2.5 px-3">RISK DECISION</TableHead>
              <TableHead className="py-2.5 px-3">REASON / NOTE</TableHead>
              <TableHead className="py-2.5 px-3 text-right">TIMESTAMP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDecisions.map((d) => (
              <TableRow
                key={d.id}
                onClick={() => onSelectDecision(d)}
                className="border-b border-border/30 hover:bg-surface-2/40 text-xs font-mono cursor-pointer transition-colors"
              >
                <TableCell className="py-2.5 px-3 font-semibold text-cyan-400">
                  {d.proposalId}
                </TableCell>
                <TableCell className="py-2.5 px-3 font-medium text-text-primary">
                  {d.symbol}
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      d.side === "LONG"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {d.side === "LONG" ? (
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5" />
                    )}
                    {d.side}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-medium text-text-primary">
                  {d.requestedRiskPercent.toFixed(1)}%
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-cyan-400 font-bold">
                  {d.riskReward.toFixed(1)}R
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  {getDecisionBadge(d.decision)}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-[11px] text-text-muted max-w-xs truncate" title={d.reason}>
                  {d.reason}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-text-muted text-[11px] whitespace-nowrap">
                  {d.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
