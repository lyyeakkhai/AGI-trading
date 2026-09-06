"use client";

import React, { useState } from "react";
import { BacktestTrade } from "@/lib/mockBacktestsData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components";
import { History, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TradeHistoryTableProps {
  trades: BacktestTrade[];
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const [filterSide, setFilterSide] = useState<"ALL" | "LONG" | "SHORT">("ALL");
  const [filterReason, setFilterReason] = useState<string>("ALL");

  const filteredTrades = trades.filter((t) => {
    if (filterSide !== "ALL" && t.side !== filterSide) return false;
    if (filterReason !== "ALL" && t.exitReason !== filterReason) return false;
    return true;
  });

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col gap-3">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Simulated Trade History
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Granular tick/candle level executions with exact entry, stop/target exits, and R-multiples.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value as any)}
            className="bg-background border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
          >
            <option value="ALL">All Sides</option>
            <option value="LONG">Longs Only</option>
            <option value="SHORT">Shorts Only</option>
          </select>

          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="bg-background border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
          >
            <option value="ALL">All Exit Reasons</option>
            <option value="Target">Target</option>
            <option value="Stop">Stop Loss</option>
            <option value="Trailing Stop">Trailing Stop</option>
            <option value="Time Limit">Time Limit</option>
          </select>

          <span className="text-[11px] text-text-muted">
            {filteredTrades.length} of {trades.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border/60 bg-surface-2/20 max-h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-surface-2/60 text-[11px] font-mono text-text-muted sticky top-0 z-10">
              <TableHead className="py-2 px-3">#</TableHead>
              <TableHead className="py-2 px-3">DATE / TIME</TableHead>
              <TableHead className="py-2 px-3">SYMBOL</TableHead>
              <TableHead className="py-2 px-3">SIDE</TableHead>
              <TableHead className="py-2 px-3 text-right">ENTRY</TableHead>
              <TableHead className="py-2 px-3 text-right">EXIT</TableHead>
              <TableHead className="py-2 px-3 text-right">P&L ($)</TableHead>
              <TableHead className="py-2 px-3 text-right">R-MULTIPLE</TableHead>
              <TableHead className="py-2 px-3 text-right">DURATION</TableHead>
              <TableHead className="py-2 px-3">EXIT REASON</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrades.map((t, idx) => {
              const isProfit = t.pnl >= 0;
              return (
                <TableRow
                  key={t.id}
                  className="border-b border-border/30 hover:bg-surface-2/40 text-xs font-mono transition-colors"
                >
                  <TableCell className="py-2 px-3 text-text-muted text-[11px]">{t.id}</TableCell>
                  <TableCell className="py-2 px-3 text-text-primary whitespace-nowrap">{t.date}</TableCell>
                  <TableCell className="py-2 px-3 font-semibold text-text-primary">{t.symbol}</TableCell>
                  <TableCell className="py-2 px-3">
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        t.side === "LONG"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {t.side === "LONG" ? (
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      ) : (
                        <ArrowDownRight className="w-2.5 h-2.5" />
                      )}
                      {t.side}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right text-text-primary">
                    ${t.entryPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right text-text-primary">
                    ${t.exitPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right font-bold">
                    <span className={isProfit ? "text-emerald-400" : "text-red-400"}>
                      {isProfit ? `+$${t.pnl.toFixed(1)}` : `-$${Math.abs(t.pnl).toFixed(1)}`}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right font-semibold">
                    <span className={t.rMultiple >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {t.rMultiple >= 0 ? `+${t.rMultiple.toFixed(1)}R` : `${t.rMultiple.toFixed(1)}R`}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right text-text-muted text-[11px]">
                    {t.duration}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        t.exitReason === "Target"
                          ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20"
                          : t.exitReason === "Stop"
                          ? "bg-red-950/40 text-red-300 border border-red-500/20"
                          : "bg-surface-2 text-text-muted border border-border"
                      }`}
                    >
                      {t.exitReason}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
