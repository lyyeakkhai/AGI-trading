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
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Live Position Risk Attribution
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Active positions consuming portfolio risk budget and real-time distance to invalidation stop
            </p>
          </div>
        </div>

        <Link
          href="/positions"
          className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-surface-2 border border-border transition-colors"
        >
          <span>Positions Workspace</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-border/60 bg-surface-2/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-surface-2/60 text-[11px] font-mono text-text-muted">
              <TableHead className="py-2.5 px-3">SYMBOL</TableHead>
              <TableHead className="py-2.5 px-3">SIDE</TableHead>
              <TableHead className="py-2.5 px-3 text-right">SIZE</TableHead>
              <TableHead className="py-2.5 px-3 text-right">ENTRY</TableHead>
              <TableHead className="py-2.5 px-3 text-right">CURRENT</TableHead>
              <TableHead className="py-2.5 px-3 text-right">STOP LOSS</TableHead>
              <TableHead className="py-2.5 px-3 text-right">DIST TO STOP</TableHead>
              <TableHead className="py-2.5 px-3 text-right">RISK ($)</TableHead>
              <TableHead className="py-2.5 px-3 text-right">RISK (%)</TableHead>
              <TableHead className="py-2.5 px-3 text-right">UNREALIZED P&L</TableHead>
              <TableHead className="py-2.5 px-3">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((p) => {
              const isProfit = p.unrealizedPnl >= 0;
              return (
                <TableRow
                  key={p.id}
                  className="border-b border-border/30 hover:bg-surface-2/40 text-xs font-mono transition-colors"
                >
                  <TableCell className="py-2.5 px-3 font-semibold text-text-primary">
                    {p.symbol}
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      {p.side}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-mono font-medium text-text-primary">
                    {p.positionSize}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-text-primary">
                    ${p.entryPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-medium text-text-primary">
                    ${p.currentPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-amber-400 font-medium">
                    ${p.stopPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-text-muted">
                    {p.distanceToStopPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-bold text-text-primary">
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
