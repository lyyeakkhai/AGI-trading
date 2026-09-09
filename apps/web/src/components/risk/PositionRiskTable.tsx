"use client";

import React from "react";
import Link from "next/link";
import { PositionRiskItem } from "@/lib/mockRiskData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components";
import { ShieldCheck, ArrowUpRight, ExternalLink } from "lucide-react";

interface PositionRiskTableProps {
  positions: PositionRiskItem[];
}

export function PositionRiskTable({ positions }: PositionRiskTableProps) {
  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Live Position Risk Attribution
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Active positions consuming portfolio risk budget and real-time distance to invalidation stop
            </p>
          </div>
        </div>

        <Link
          href="/positions"
          className="inline-flex items-center gap-1 text-xs font-sans tracking-tight text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 transition-colors"
        >
          <span>Positions Workspace</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-zinc-800/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              <TableHead className="py-2.5 px-3">Symbol</TableHead>
              <TableHead className="py-2.5 px-3">Side</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Size</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Entry</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Current</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Stop Loss</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Dist to Stop</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Risk ($)</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Risk (%)</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Unrealized P&L</TableHead>
              <TableHead className="py-2.5 px-3">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((p) => {
              const isProfit = p.unrealizedPnl >= 0;
              return (
                <TableRow
                  key={p.id}
                  className="border-b border-gray-200 dark:border-white/5/30 hover:bg-gray-100 dark:bg-zinc-800/40 text-xs font-sans tracking-tight transition-colors"
                >
                  <TableCell className="py-2.5 px-3 font-semibold text-gray-900 dark:text-zinc-50">
                    {p.symbol}
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      {p.side}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-sans tracking-tight font-medium text-gray-900 dark:text-zinc-50">
                    {p.positionSize}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-gray-900 dark:text-zinc-50">
                    ${p.entryPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-medium text-gray-900 dark:text-zinc-50">
                    ${p.currentPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-amber-400 font-medium">
                    ${p.stopPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-gray-500 dark:text-zinc-400">
                    {p.distanceToStopPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-bold text-gray-900 dark:text-zinc-50">
                    ${p.riskAmount.toFixed(1)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    {p.portfolioRiskPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-bold">
                    <span className={isProfit ? "text-emerald-400" : "text-red-400"}>
                      {isProfit ? `+$${p.unrealizedPnl.toFixed(1)}` : `-$${Math.abs(p.unrealizedPnl).toFixed(1)}`}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.status}
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
