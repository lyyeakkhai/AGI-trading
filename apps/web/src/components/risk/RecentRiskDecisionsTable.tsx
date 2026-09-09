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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-sans tracking-tight bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-sans tracking-tight bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3 text-red-400" />
            Rejected
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-sans tracking-tight bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Warning
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col gap-3">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Trade Proposal Validation Decisions
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Deterministic gate pass/fail log for all Hermes-generated trade proposals
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans tracking-tight">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Search proposal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border border-gray-200 dark:border-white/5 rounded-lg pl-7 pr-2 py-1 text-gray-900 dark:text-zinc-50 text-xs focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-gray-900 dark:text-zinc-50 focus:outline-none"
          >
            <option value="ALL">All Decisions</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="bg-background border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-gray-900 dark:text-zinc-50 focus:outline-none"
          >
            <option value="ALL">All Symbols</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
          </select>

          <select
            value={timeframeFilter}
            onChange={(e) => setTimeframeFilter(e.target.value)}
            className="bg-background border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-gray-900 dark:text-zinc-50 focus:outline-none"
          >
            <option value="ALL">All Timeframes</option>
            <option value="TODAY">Today (24h)</option>
            <option value="YESTERDAY">Last 48h</option>
            <option value="7D">Past 7 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-zinc-800/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              <TableHead className="py-2.5 px-3">Proposal</TableHead>
              <TableHead className="py-2.5 px-3">Symbol</TableHead>
              <TableHead className="py-2.5 px-3">Side</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Requested Risk</TableHead>
              <TableHead className="py-2.5 px-3 text-right">R:R</TableHead>
              <TableHead className="py-2.5 px-3">Risk Decision</TableHead>
              <TableHead className="py-2.5 px-3">REASON / NOTE</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDecisions.map((d) => (
              <TableRow
                key={d.id}
                onClick={() => onSelectDecision(d)}
                className="border-b border-gray-200 dark:border-white/5/30 hover:bg-gray-100 dark:bg-zinc-800/40 text-xs font-sans tracking-tight cursor-pointer transition-colors"
              >
                <TableCell className="py-2.5 px-3 font-semibold text-cyan-400">
                  {d.proposalId}
                </TableCell>
                <TableCell className="py-2.5 px-3 font-medium text-gray-900 dark:text-zinc-50">
                  {d.symbol}
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-lg text-xs font-bold ${
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
                <TableCell className="py-2.5 px-3 text-right font-medium text-gray-900 dark:text-zinc-50">
                  {d.requestedRiskPercent.toFixed(1)}%
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-cyan-400 font-bold">
                  {d.riskReward.toFixed(1)}R
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  {getDecisionBadge(d.decision)}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-xs text-gray-500 dark:text-zinc-400 max-w-xs truncate" title={d.reason}>
                  {d.reason}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-gray-500 dark:text-zinc-400 text-xs whitespace-nowrap">
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
