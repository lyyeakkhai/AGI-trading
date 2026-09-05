"use client";

import React from "react";
import { BacktestRecord } from "@/lib/mockBacktestsData";
import { BacktestStatusBadge } from "./BacktestStatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components";
import { CheckSquare, Square, ChevronRight } from "lucide-react";

interface BacktestRegistryTableProps {
  backtests: BacktestRecord[];
  selectedId: string | null;
  onSelectBacktest: (id: string) => void;
  comparedIds: string[];
  onToggleCompare: (id: string, e: React.MouseEvent) => void;
}

export function BacktestRegistryTable({
  backtests,
  selectedId,
  onSelectBacktest,
  comparedIds,
  onToggleCompare,
}: BacktestRegistryTableProps) {
  if (backtests.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border rounded-lg">
        <p className="text-xs font-mono text-text-muted">No backtests matching current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-surface-2/40 hover:bg-surface-2/40">
            <TableHead className="w-10 text-center py-2.5 px-3">
              <span className="sr-only">Compare</span>
            </TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3">BACKTEST</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3">STRATEGY</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3">MARKET / TF</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3">PERIOD</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3 text-right">TRADES</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3 text-right">NET RETURN</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3 text-right">MAX DD</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3 text-right">PROFIT FACTOR</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3">STATUS</TableHead>
            <TableHead className="text-xs font-mono text-text-muted py-2.5 px-3 text-right">CREATED</TableHead>
            <TableHead className="w-8 py-2.5 px-2">
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {backtests.map((bt) => {
            const isSelected = selectedId === bt.id;
            const isCompared = comparedIds.includes(bt.id);
            const isPositive = bt.netReturn >= 0;

            return (
              <TableRow
                key={bt.id}
                onClick={() => onSelectBacktest(bt.id)}
                className={`cursor-pointer transition-colors border-b border-border/50 text-xs font-mono ${
                  isSelected
                    ? "bg-cyan-500/10 hover:bg-cyan-500/15"
                    : "hover:bg-surface-2/60"
                }`}
              >
                {/* Compare Checkbox */}
                <TableCell
                  className="py-2.5 px-3 text-center"
                  onClick={(e) => onToggleCompare(bt.id, e)}
                >
                  <button
                    type="button"
                    className="text-text-muted hover:text-cyan-400 focus:outline-none transition-colors"
                    title={isCompared ? "Remove from comparison" : "Add to comparison (max 3)"}
                  >
                    {isCompared ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </TableCell>

                {/* Backtest ID */}
                <TableCell className="py-2.5 px-3 font-semibold text-text-primary">
                  <div className="flex items-center gap-1.5">
                    {isSelected && <div className="w-1 h-3 rounded-full bg-cyan-400" />}
                    <span>{bt.id}</span>
                  </div>
                </TableCell>

                {/* Strategy + Version */}
                <TableCell className="py-2.5 px-3 text-text-primary">
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">{bt.strategyName}</span>
                    <span className="text-[11px] text-text-muted">{bt.strategyVersion}</span>
                  </div>
                </TableCell>

                {/* Market / TF */}
                <TableCell className="py-2.5 px-3 text-text-primary">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{bt.market}</span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-2 text-[10px] text-text-muted">
                      {bt.timeframe}
                    </span>
                  </div>
                </TableCell>

                {/* Period */}
                <TableCell className="py-2.5 px-3 text-text-muted text-[11px] whitespace-nowrap">
                  {bt.startDate.slice(0, 7)} → {bt.endDate.slice(0, 7)}
                </TableCell>

                {/* Trades */}
                <TableCell className="py-2.5 px-3 text-right font-medium text-text-primary">
                  {bt.tradeCount}
                </TableCell>

                {/* Net Return */}
                <TableCell className="py-2.5 px-3 text-right font-semibold">
                  <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
                    {isPositive ? `+${bt.netReturn.toFixed(1)}%` : `${bt.netReturn.toFixed(1)}%`}
                  </span>
                </TableCell>

                {/* Max DD */}
                <TableCell className="py-2.5 px-3 text-right text-red-400 font-medium">
                  {bt.maxDrawdown.toFixed(1)}%
                </TableCell>

                {/* Profit Factor */}
                <TableCell className="py-2.5 px-3 text-right font-medium text-text-primary">
                  {bt.profitFactor.toFixed(2)}
                </TableCell>

                {/* Status */}
                <TableCell className="py-2.5 px-3">
                  <BacktestStatusBadge status={bt.status} />
                </TableCell>

                {/* Created */}
                <TableCell className="py-2.5 px-3 text-right text-text-muted text-[11px] whitespace-nowrap">
                  {bt.createdAt.slice(0, 10)}
                </TableCell>

                {/* Chevron */}
                <TableCell className="py-2.5 px-2 text-right">
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-cyan-400 translate-x-0.5" : "text-text-muted/40"}`} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
