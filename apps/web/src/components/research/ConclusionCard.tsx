import React from "react";
import type { ExperimentConclusion } from "@/lib/researchApi";
import { ConclusionBadge } from "./ConclusionBadge";

interface Props { conclusion: ExperimentConclusion }

export function ConclusionCard({ conclusion }: Props) {
  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Conclusion</div>
        <ConclusionBadge outcome={conclusion.outcome} />
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase text-gray-600 mb-1">Evidence Summary</div>
        <p className="text-sm text-gray-300 leading-relaxed">{conclusion.evidence_summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {conclusion.strengths.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase text-green-700 mb-2">Strengths</div>
            <ul className="space-y-1">
              {conclusion.strengths.map((s, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-green-500 mt-0.5">+</span><span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {conclusion.weaknesses.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase text-yellow-700 mb-2">Weaknesses</div>
            <ul className="space-y-1">
              {conclusion.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-yellow-500 mt-0.5">~</span><span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {conclusion.failure_reasons.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase text-red-700 mb-2">Failure Reasons</div>
          <ul className="space-y-1">
            {conclusion.failure_reasons.map((r, i) => (
              <li key={i} className="text-xs text-red-400/80 flex gap-2">
                <span className="text-red-500 mt-0.5">✗</span><span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {conclusion.lessons_learned && (
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-1">Lessons Learned</div>
          <p className="text-sm text-gray-400 italic">{conclusion.lessons_learned}</p>
        </div>
      )}

      {conclusion.next_experiment_suggestion && (
        <div className="border border-cyan-900/40 bg-cyan-950/10 rounded p-3">
          <div className="text-[10px] font-mono uppercase text-cyan-700 mb-1">Next Research Direction</div>
          <p className="text-xs text-cyan-300">{conclusion.next_experiment_suggestion}</p>
        </div>
      )}
    </div>
  );
}
