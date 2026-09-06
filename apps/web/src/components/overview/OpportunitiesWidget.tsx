"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { ConfidenceIndicator } from "@/components/trading/ConfidenceIndicator";
import { OverviewOpportunity } from "@/lib/mockOverviewData";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
import { Zap, ArrowRight } from "lucide-react";

interface OpportunitiesWidgetProps {
  opportunities: OverviewOpportunity[];
  className?: string;
}

export function OpportunitiesWidget({
  opportunities,
  className = "",
}: OpportunitiesWidgetProps) {
  return (
    <Surface
      variant="iron"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 iron-header">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-100 uppercase tracking-wide">
            Detected Opportunities
          </span>
          <Badge variant="cyan" size="sm" dot pulse>
            {opportunities.length} ACTIVE
          </Badge>
        </div>
        <Link href="/opportunities">
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight size={12} />}
            className="text-gray-400 hover:text-cyan-400 text-xs font-semibold"
          >
            VIEW ALL
          </Button>
        </Link>
      </div>

      {/* Opportunities List */}
      <div className="divide-y divide-[#222B32]/70">
        {opportunities.map((opp) => (
          <Link
            key={opp.id}
            href={`/opportunities?selected=${opp.id}`}
            className="group block hover:bg-iron-800/40 transition-colors px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <CryptoIcon symbol={opp.symbol} size="sm" />
                <span className="font-mono tabular-nums text-xs font-bold text-gray-100 group-hover:text-cyan-300 transition-colors">
                  {opp.symbol}
                </span>
                <PositionSide side={opp.side} size="sm" />
                <span className="text-xs text-gray-400 font-sans hidden sm:inline">
                  {opp.strategy}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs uppercase text-gray-400 font-medium">
                    Risk/Reward
                  </span>
                  <span className="text-xs font-mono tabular-nums font-bold text-gray-200">
                    {opp.riskReward} R:R
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ConfidenceIndicator score={opp.confidence} size="sm" />
                  <Badge
                    variant={opp.status === "PROPOSAL READY" ? "cyan" : "neutral"}
                    size="sm"
                  >
                    {opp.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-[#222B32] bg-iron-950/60 text-[10px] font-mono text-gray-500 flex items-center justify-between">
        <span>STRATEGY ENGINE: SCAN INTERVAL 60s</span>
        <span>LAST AUDIT: NOMINAL</span>
      </div>
    </Surface>
  );
}
