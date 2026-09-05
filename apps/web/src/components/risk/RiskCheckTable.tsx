"use client";

import React from "react";
import { RiskCheckItem, CheckStatus } from "@/lib/mockRiskData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

interface RiskCheckTableProps {
  checks: RiskCheckItem[];
}

export function RiskCheckTable({ checks }: RiskCheckTableProps) {
  const getStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            PASS
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      case "FAIL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3 text-red-400" />
            FAIL
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-lg bg-surface-1 border border-border flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
              Pre-Trade Deterministic Risk Checks
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Continuous validation pipeline verifying every incoming proposal against real-time portfolio metrics
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-400">
          6/6 Checks Operational
        </span>
      </div>

      <div className="overflow-x-auto rounded border border-border/60 bg-surface-2/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-surface-2/60 text-[11px] font-mono text-text-muted">
              <TableHead className="py-2 px-3">CHECK ID</TableHead>
              <TableHead className="py-2 px-3">RULE / CRITERIA</TableHead>
              <TableHead className="py-2 px-3">CURRENT VALUE</TableHead>
              <TableHead className="py-2 px-3">CONFIGURED LIMIT</TableHead>
              <TableHead className="py-2 px-3">STATUS</TableHead>
              <TableHead className="py-2 px-3">DESCRIPTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((chk) => (
              <TableRow
                key={chk.id}
                className="border-b border-border/30 hover:bg-surface-2/40 text-xs font-mono transition-colors"
              >
                <TableCell className="py-2.5 px-3 text-text-muted">{chk.id}</TableCell>
                <TableCell className="py-2.5 px-3 font-semibold text-text-primary">
                  {chk.name}
                </TableCell>
                <TableCell className="py-2.5 px-3 font-medium text-text-primary">
                  {chk.current}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-text-muted">
                  {chk.limit}
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  {getStatusBadge(chk.status)}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-[11px] text-text-muted">
                  {chk.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
