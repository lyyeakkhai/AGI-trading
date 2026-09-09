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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-sans tracking-tight bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Pass
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-sans tracking-tight bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Warning
          </span>
        );
      case "FAIL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-sans tracking-tight bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3 text-red-400" />
            Fail
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Pre-Trade Deterministic Risk Checks
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Continuous validation pipeline verifying every incoming proposal against real-time portfolio metrics
            </p>
          </div>
        </div>
        <span className="text-xs font-sans tracking-tight text-emerald-400">
          6/6 Checks Operational
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-zinc-800/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              <TableHead className="py-2 px-3">Check Id</TableHead>
              <TableHead className="py-2 px-3">RULE / CRITERIA</TableHead>
              <TableHead className="py-2 px-3">Current Value</TableHead>
              <TableHead className="py-2 px-3">Configured Limit</TableHead>
              <TableHead className="py-2 px-3">Status</TableHead>
              <TableHead className="py-2 px-3">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((chk) => (
              <TableRow
                key={chk.id}
                className="border-b border-gray-200 dark:border-white/5/30 hover:bg-gray-100 dark:hover:bg-zinc-800/40 text-xs font-sans tracking-tight transition-colors"
              >
                <TableCell className="py-2.5 px-3 text-gray-500 dark:text-zinc-400">{chk.id}</TableCell>
                <TableCell className="py-2.5 px-3 font-semibold text-gray-900 dark:text-zinc-50">
                  {chk.name}
                </TableCell>
                <TableCell className="py-2.5 px-3 font-medium text-gray-900 dark:text-zinc-50">
                  {chk.current}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-gray-500 dark:text-zinc-400">
                  {chk.limit}
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  {getStatusBadge(chk.status)}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-xs text-gray-500 dark:text-zinc-400">
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
