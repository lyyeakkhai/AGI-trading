import React from "react";
import type { HypothesisConfig } from "@/lib/researchApi";

interface Props { hypothesis: HypothesisConfig }

export function HypothesisCard({ hypothesis }: Props) {
  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4 space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">Hypothesis</div>

      <div>
        <div className="text-[10px] font-mono uppercase text-gray-600 mb-1">Statement</div>
        <p className="text-sm text-gray-200 leading-relaxed font-mono">{hypothesis.statement}</p>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase text-gray-600 mb-1">Rationale</div>
        <p className="text-sm text-gray-400 leading-relaxed">{hypothesis.rationale}</p>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase text-gray-600 mb-1">Expected Behavior</div>
        <p className="text-sm text-gray-400 leading-relaxed">{hypothesis.expected_behavior}</p>
      </div>

      {hypothesis.assumptions.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-600 mb-2">Assumptions</div>
          <ul className="space-y-1">
            {hypothesis.assumptions.map((a, i) => (
              <li key={i} className="text-xs text-gray-400 flex gap-2">
                <span className="text-cyan-500 mt-0.5">▸</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hypothesis.invalidation_criteria.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase text-red-600/70 mb-2">Invalidation Criteria</div>
          <ul className="space-y-1">
            {hypothesis.invalidation_criteria.map((c, i) => (
              <li key={i} className="text-xs text-red-400/80 flex gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
