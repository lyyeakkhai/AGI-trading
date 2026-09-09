"use client";

import React from "react";
import { PeriodReturn } from "@/lib/mockAnalyticsData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components";
import { Calendar } from "lucide-react";

interface ReturnsByPeriodTableProps {
  periods: PeriodReturn[];
}

export function ReturnsByPeriodTable({ periods }: ReturnsByPeriodTableProps) {
  const [periodMode, setPeriodMode] = React.useState<"monthly" | "weekly">("monthly");

  const weeklyData: PeriodReturn[] = React.useMemo(() => [
    { period: "W35 (Current)", returnPct: 2.1, pnl: 485, trades: 14, winRate: 64.3 },
    { period: "W34", returnPct: 3.4, pnl: 790, trades: 22, winRate: 68.2 },
    { period: "W33", returnPct: -0.8, pnl: -175, trades: 18, winRate: 50.0 },
    { period: "W32", returnPct: 4.2, pnl: 940, trades: 26, winRate: 73.1 },
    { period: "W31", returnPct: 1.5, pnl: 320, trades: 15, winRate: 60.0 },
    { period: "W30", returnPct: 2.8, pnl: 610, trades: 19, winRate: 63.2 },
  ], []);

  const activePeriods = periodMode === "monthly" ? periods : weeklyData;

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-200 dark:border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-zinc-200 dark:border-cyan-900/30 text-cyan-400">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold font-medium text-text-primary">
              {periodMode === "monthly" ? "Monthly" : "Weekly"} Yield Consistency
            </h3>
            <p className="text-xs font-sans text-text-muted">
              Realized yield after fees and execution friction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded bg-white dark:bg-zinc-900/50 p-0.5 border border-zinc-200 dark:border-zinc-200 dark:border-white/10 text-xs font-sans">
            <button
              type="button"
              onClick={() => setPeriodMode("monthly")}
              className={`px-2 py-0.5 rounded transition-colors ${
                periodMode === "monthly"
                  ? "bg-cyan-500/20 text-cyan-400 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriodMode("weekly")}
              className={`px-2 py-0.5 rounded transition-colors ${
                periodMode === "weekly"
                  ? "bg-cyan-500/20 text-cyan-400 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-zinc-200 dark:border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50/60 text-xs font-sans text-text-muted">
              <TableHead className="py-2 px-3">PERIOD</TableHead>
              <TableHead className="py-2 px-3 text-right">RETURN</TableHead>
              <TableHead className="py-2 px-3 text-right">NET P&L</TableHead>
              <TableHead className="py-2 px-3 text-right">TRADES</TableHead>
              <TableHead className="py-2 px-3 text-right">WIN RATE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activePeriods.map((p) => {
              const isProfit = p.returnPct >= 0;
              return (
                <TableRow
                  key={p.period}
                  className="border-b border-zinc-200 dark:border-zinc-200 dark:border-white/10 hover:bg-white dark:bg-zinc-900/50/40 text-xs font-sans transition-colors"
                >
                  <TableCell className="py-2 px-3 font-semibold text-text-primary">
                    {p.period}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right font-bold">
                    <span className={isProfit ? "text-emerald-400" : "text-red-400"}>
                      {isProfit ? `+${p.returnPct.toFixed(1)}%` : `${p.returnPct.toFixed(1)}%`}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right font-medium">
                    <span className={isProfit ? "text-emerald-400" : "text-red-400"}>
                      {isProfit ? `+$${p.pnl}` : `-$${Math.abs(p.pnl)}`}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right text-text-muted">
                    {p.trades}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-right text-text-primary">
                    {p.winRate.toFixed(1)}%
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
