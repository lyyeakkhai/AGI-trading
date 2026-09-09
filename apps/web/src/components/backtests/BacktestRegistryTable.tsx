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
      <div className="p-8 text-center bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl">
        <p className="text-xs font-sans text-gray-500 dark:text-zinc-400">No backtests matching current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-50 dark:bg-zinc-800/50">
            <TableHead className="w-10 text-center py-2.5 px-3">
              <span className="sr-only">Compare</span>
            </TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3">BACKTEST</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3">STRATEGY</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3">MARKET / TIMEFRAME</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3">PERIOD</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3 text-right">TRADES</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3 text-right">NET RETURN</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3 text-right">MAX DRAWDOWN</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3 text-right">PROFIT FACTOR</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3">STATUS</TableHead>
            <TableHead className="text-xs font-sans text-gray-500 dark:text-zinc-400 py-2.5 px-3 text-right">CREATED</TableHead>
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
                className={`cursor-pointer transition-colors border-b border-gray-200/50 dark:border-white/5 text-xs font-sans ${
                  isSelected
                    ? "bg-cyan-500/10 hover:bg-cyan-500/15"
                    : "hover:bg-gray-50 dark:bg-zinc-800/50"
                }`}
              >
                {/* Compare Checkbox */}
                <TableCell
                  className="py-2.5 px-3 text-center"
                  onClick={(e) => onToggleCompare(bt.id, e)}
                >
                  <button
                    type="button"
                    className="text-gray-500 dark:text-zinc-400 hover:text-cyan-400 focus:outline-none transition-colors"
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
                <TableCell className="py-2.5 px-3 font-semibold text-gray-900 dark:text-zinc-50">
                  <div className="flex items-center gap-1.5">
                    {isSelected && <div className="w-1 h-3 rounded-full bg-cyan-400" />}
                    <span>{bt.id}</span>
                  </div>
                </TableCell>

                {/* Strategy + Version */}
                <TableCell className="py-2.5 px-3 text-gray-900 dark:text-zinc-50">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-zinc-50">{bt.strategyName}</span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400">{bt.strategyVersion}</span>
                  </div>
                </TableCell>

                {/* Market / TF */}
                <TableCell className="py-2.5 px-3 text-gray-900 dark:text-zinc-50">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{bt.market}</span>
                    <span className="px-1.5 py-0.2 rounded-xl bg-gray-50 dark:bg-zinc-800/50 text-[10px] text-gray-500 dark:text-zinc-400">
                      {bt.timeframe}
                    </span>
                  </div>
                </TableCell>

                {/* Period */}
                <TableCell className="py-2.5 px-3 text-gray-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                  {bt.startDate.slice(0, 7)} → {bt.endDate.slice(0, 7)}
                </TableCell>

                {/* Trades */}
                <TableCell className="py-2.5 px-3 text-right font-medium text-gray-900 dark:text-zinc-50">
                  {bt.tradeCount}
                </TableCell>

                {/* Net Return */}
                <TableCell className="py-2.5 px-3 text-right font-semibold">
                  <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
                    {isPositive ? `+${bt.netReturn.toFixed(1)}%` : `${bt.netReturn.toFixed(1)}%`}
                  </span>
                </TableCell>

                {/* Max Drawdown */}
                <TableCell className="py-2.5 px-3 text-right text-red-400 font-medium">
                  {bt.maxDrawdown.toFixed(1)}%
                </TableCell>

                {/* Profit Factor */}
                <TableCell className="py-2.5 px-3 text-right font-medium text-gray-900 dark:text-zinc-50">
                  {bt.profitFactor.toFixed(2)}
                </TableCell>

                {/* Status */}
                <TableCell className="py-2.5 px-3">
                  <BacktestStatusBadge status={bt.status} />
                </TableCell>

                {/* Created */}
                <TableCell className="py-2.5 px-3 text-right text-gray-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                  {bt.createdAt.slice(0, 10)}
                </TableCell>

                {/* Chevron */}
                <TableCell className="py-2.5 px-2 text-right">
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-cyan-400 translate-x-0.5" : "text-gray-500 dark:text-zinc-400/40"}`} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
