"use client";

import React from "react";
import Link from "next/link";
import { StrategyAnalyticsItem } from "@/lib/mockAnalyticsData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components";
import { Layers, ArrowUpRight } from "lucide-react";

interface StrategyPerformanceTableProps {
  strategies: StrategyAnalyticsItem[];
}

export function StrategyPerformanceTable({ strategies }: StrategyPerformanceTableProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-zinc-200 dark:border-cyan-900/30 text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold font-medium text-text-primary">
              Performance by Quantitative Strategy
            </h3>
            <p className="text-xs font-sans text-text-muted">
              Live paper trading performance attribution across registered strategy models
            </p>
          </div>
        </div>

        <Link
          href="/strategies"
          className="inline-flex items-center gap-1 text-xs font-sans text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 transition-colors"
        >
          <span>View Strategy Registry</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 text-xs font-sans text-text-muted">
              <TableHead className="py-2.5 px-3">STRATEGY</TableHead>
              <TableHead className="py-2.5 px-3 text-right">TRADES</TableHead>
              <TableHead className="py-2.5 px-3 text-right">NET P&L</TableHead>
              <TableHead className="py-2.5 px-3 text-right">RETURN</TableHead>
              <TableHead className="py-2.5 px-3 text-right">WIN RATE</TableHead>
              <TableHead className="py-2.5 px-3 text-right">PROFIT FACTOR</TableHead>
              <TableHead className="py-2.5 px-3 text-right">MAX DD</TableHead>
              <TableHead className="py-2.5 px-3 text-right">EXPECTANCY</TableHead>
              <TableHead className="py-2.5 px-3">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map((s) => (
              <TableRow
                key={s.id}
                className="border-b border-zinc-200 dark:border-white/10 hover:bg-white dark:bg-zinc-900/50 text-xs font-sans transition-colors"
              >
                <TableCell className="py-2.5 px-3 font-semibold text-text-primary">
                  <Link href="/strategies" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                    <span>{s.name}</span>
                    <span className="text-xs text-text-muted">({s.version})</span>
                  </Link>
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-text-primary">
                  {s.trades}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-bold text-emerald-400">
                  +${s.netPnl.toLocaleString()}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-bold text-emerald-400">
                  +{s.returnPct.toFixed(1)}%
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-text-primary">
                  {s.winRate.toFixed(1)}%
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right font-bold text-text-primary">
                  {s.profitFactor.toFixed(2)}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-red-400">
                  {s.maxDrawdown.toFixed(1)}%
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right text-cyan-400 font-medium">
                  +{s.expectancy.toFixed(2)}R
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {s.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
