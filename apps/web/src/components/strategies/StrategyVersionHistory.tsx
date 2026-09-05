"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { StrategyVersion } from "@/lib/mockStrategiesData";
import { GitCommit, Tag } from "lucide-react";

interface StrategyVersionHistoryProps {
  versions: StrategyVersion[];
  className?: string;
}

export function StrategyVersionHistory({
  versions,
  className = "",
}: StrategyVersionHistoryProps) {
  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-border-color pb-1.5">
        <div className="flex items-center gap-1.5">
          <Tag size={13} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Version Audit History
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">
          REPRODUCIBLE ARCHIVE
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {versions.map((ver) => {
          const isActive = ver.status === "Active";

          return (
            <div
              key={ver.version}
              className={`p-2.5 rounded border transition-colors ${
                isActive
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-bg-950/70 border-border-color"
              }`}
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <GitCommit
                    size={13}
                    className={isActive ? "text-cyan-400" : "text-gray-500"}
                  />
                  <span
                    className={`font-bold ${
                      isActive ? "text-cyan-300" : "text-gray-300"
                    }`}
                  >
                    {ver.version}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {ver.createdAt}
                  </span>
                </div>
                <Badge
                  variant={
                    isActive ? "profit" : ver.status === "Draft" ? "cyan" : "neutral"
                  }
                  size="sm"
                >
                  {ver.status}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed pt-0.5">
                {ver.changeSummary}
              </p>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
