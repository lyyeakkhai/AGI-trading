import React from "react";
import Link from "next/link";
import type { ExperimentLinkResponse, ExperimentLinkType } from "@/lib/researchApi";
import { GitMerge } from "lucide-react";

const LINK_LABELS: Record<ExperimentLinkType, string> = {
  FOLLOW_UP:   "Follow-up",
  VARIANT:     "Variant",
  REFINEMENT:  "Refinement",
  REPLICATION: "Replication",
  CHALLENGE:   "Challenge",
};

interface Props {
  experimentId: string;
  parentLinks: ExperimentLinkResponse[];
  childLinks: ExperimentLinkResponse[];
}

export function LineageCard({ experimentId, parentLinks, childLinks }: Props) {
  const hasLineage = parentLinks.length > 0 || childLinks.length > 0;

  if (!hasLineage) {
    return (
      <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">
          <GitMerge size={12} /> Lineage
        </div>
        <p className="text-xs text-gray-600 font-mono">No linked experiments.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0E0E0E] border border-[#222B32] rounded-md p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">
        <GitMerge size={12} /> Lineage
      </div>

      {parentLinks.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-mono text-gray-600 uppercase mb-2">Parent Experiments</div>
          <div className="space-y-1.5">
            {parentLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded">
                  {LINK_LABELS[link.link_type] ?? link.link_type}
                </span>
                <Link
                  href={`/research/${link.parent_experiment_id}`}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {link.parent_experiment_id.slice(0, 8)}…
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {childLinks.length > 0 && (
        <div>
          <div className="text-[10px] font-mono text-gray-600 uppercase mb-2">Derived Experiments</div>
          <div className="space-y-1.5">
            {childLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded">
                  {LINK_LABELS[link.link_type] ?? link.link_type}
                </span>
                <Link
                  href={`/research/${link.child_experiment_id}`}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {link.child_experiment_id.slice(0, 8)}…
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
