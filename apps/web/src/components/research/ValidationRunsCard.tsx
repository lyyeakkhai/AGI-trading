import React from "react";
import type { ValidationRunResponse } from "@/lib/researchApi";
import { ValidationRunTypeBadge } from "./ValidationRunTypeBadge";
import { ValidationMetricsCard } from "./ValidationMetricsCard";

interface Props { runs: ValidationRunResponse[] }

export function ValidationRunsCard({ runs }: Props) {
  if (runs.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">Validation Runs</div>
        <p className="text-xs text-gray-600 font-mono">No validation runs recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Validation Runs</div>
      {runs.map((run) => (
        <div key={run.id} className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ValidationRunTypeBadge runType={run.run_type} />
              {run.passed != null && (
                <span className={`text-[10px] font-mono font-bold ${run.passed ? "text-green-400" : "text-red-400"}`}>
                  {run.passed ? "PASSED" : "FAILED"}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-600">
              {new Date(run.created_at).toLocaleDateString()}
            </span>
          </div>
          {run.description && (
            <p className="text-xs text-gray-400">{run.description}</p>
          )}
          {run.metrics && <ValidationMetricsCard metrics={run.metrics} title="Results" />}
          {run.notes && (
            <div>
              <div className="text-[10px] font-mono uppercase text-gray-600 mb-1">Notes</div>
              <p className="text-xs text-gray-400">{run.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
