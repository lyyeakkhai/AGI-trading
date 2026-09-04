"use client";

import React, { useState } from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { EvidenceItem } from "@/lib/mockHermesData";
import { ShieldAlert, CheckCircle2, MinusCircle, AlertCircle, Filter } from "lucide-react";

interface HermesEvidenceProps {
  evidenceItems: EvidenceItem[];
  className?: string;
}

export function HermesEvidence({
  evidenceItems,
  className = "",
}: HermesEvidenceProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Technical", "Market & Liquidity", "Risk Engine"];

  const filteredItems =
    filterCategory === "All"
      ? evidenceItems
      : evidenceItems.filter((i) => i.category === filterCategory);

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header with Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Observable Evidence Matrix
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            ({evidenceItems.length} SIGNALS)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-bg-950 p-0.5 rounded border border-border-color">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                filterCategory === cat
                  ? "bg-cyan-dim/40 text-cyan-300 font-bold border border-cyan-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Items Rows */}
      <div className="divide-y divide-border-color/50 max-h-[360px] overflow-y-auto">
        {filteredItems.map((item, idx) => {
          let statusIcon = <MinusCircle size={14} className="text-gray-400" />;
          let polarityBg = "bg-gray-800/40 text-gray-300";

          if (item.polarity === "positive") {
            statusIcon = <CheckCircle2 size={14} className="text-profit" />;
            polarityBg = "bg-profit-dim/30 text-profit";
          } else if (item.polarity === "negative") {
            statusIcon = <AlertCircle size={14} className="text-loss" />;
            polarityBg = "bg-loss-dim/30 text-loss";
          }

          return (
            <div
              key={idx}
              className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-surface-hover/50 transition-colors"
            >
              {/* Left: Polarity icon and signal */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0">{statusIcon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-gray-200 truncate">
                    {item.signal}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {item.category} • Weight: {item.weight}
                  </span>
                </div>
              </div>

              {/* Right: Signal Value & Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] text-gray-300 font-semibold">
                  {item.value}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${polarityBg}`}
                >
                  {item.polarity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>GROUNDED IN ON-CHAIN & EXCHANGE TELEMETRY</span>
        <span className="text-cyan-400">ZERO UNSUPPORTED HEURISTICS</span>
      </div>
    </Surface>
  );
}
