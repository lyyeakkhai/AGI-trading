"use client";
import React from "react";
import Link from "next/link";
import type { ExperimentListItem } from "@/lib/researchApi";
import { ExperimentStatusBadge } from "./ExperimentStatusBadge";
import { ConclusionBadge } from "./ConclusionBadge";

interface Props { experiments: ExperimentListItem[] }

export function ExperimentTable({ experiments }: Props) {
  if (experiments.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-8 text-center">
        <p className="text-sm text-gray-600 font-mono">No experiments found.</p>
        <p className="text-xs text-gray-700 mt-1">Create your first research experiment to begin.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md overflow-hidden">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-[#222B32] bg-[#0A0A0A]">
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">ID</th>
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Title</th>
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold hidden sm:table-cell">Asset</th>
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold hidden md:table-cell">Category</th>
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Status</th>
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold hidden lg:table-cell">Conclusion</th>
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold hidden lg:table-cell">Runs</th>
            <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold hidden xl:table-cell">Created</th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((exp, i) => (
            <tr
              key={exp.id}
              className={`border-b border-[#1A1F25] hover:bg-[#131920]/60 transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-[#0B0D10]/30"}`}
            >
              <td className="px-4 py-3">
                <Link href={`/research/${exp.id}`} className="text-cyan-400 hover:text-cyan-300 font-bold">
                  {exp.experiment_id}
                </Link>
              </td>
              <td className="px-4 py-3 max-w-xs">
                <Link href={`/research/${exp.id}`} className="text-gray-200 hover:text-white transition-colors truncate block">
                  {exp.title}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-gray-400">{exp.asset ?? "—"}</span>
                {exp.timeframe && <span className="text-gray-600 ml-1">/ {exp.timeframe}</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-gray-500 capitalize">{exp.category.replace(/_/g, " ")}</span>
              </td>
              <td className="px-4 py-3">
                <ExperimentStatusBadge status={exp.status} />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <ConclusionBadge outcome={exp.conclusion_outcome} />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell text-gray-500 tabular-nums">
                {exp.validation_run_count}
              </td>
              <td className="px-4 py-3 hidden xl:table-cell text-gray-600 tabular-nums">
                {new Date(exp.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
