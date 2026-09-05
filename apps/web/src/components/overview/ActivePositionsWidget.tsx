"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/components/trading/PositionSide";
import { PnLDisplay } from "@/components/trading/PnLDisplay";
import { RiskBadge } from "@/components/trading/RiskBadge";
import { OverviewPosition } from "@/lib/mockOverviewData";
import { Briefcase, ArrowRight } from "lucide-react";

interface ActivePositionsWidgetProps {
  positions: OverviewPosition[];
  className?: string;
}

export function ActivePositionsWidget({
  positions,
  className = "",
}: ActivePositionsWidgetProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/40">
        <div className="flex items-center gap-2">
          <Briefcase size={15} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Active Open Positions
          </span>
          <Badge variant="neutral" size="sm">
            {positions.length} OPEN
          </Badge>
        </div>
        <Link href="/positions">
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight size={12} />}
            className="text-gray-400 hover:text-cyan-400 font-mono text-[11px]"
          >
            VIEW ALL
          </Button>
        </Link>
      </div>

      {/* Positions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-bg-900/60 border-b border-border-color text-[10px] font-mono uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-4 py-2 font-medium">Position</th>
              <th className="px-3 py-2 font-medium text-right">Entry / Mark</th>
              <th className="px-3 py-2 font-medium text-right">Unrealized P&L</th>
              <th className="px-4 py-2 font-medium text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/60 font-mono">
            {positions.map((pos) => (
              <tr
                key={pos.id}
                className="hover:bg-surface-hover/70 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-100">{pos.symbol}</span>
                    <PositionSide side={pos.side} size="sm" />
                    <span className="text-[10px] text-gray-500 hidden sm:inline">
                      {pos.size}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-gray-100 font-medium">
                      ${pos.markPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Entry: ${pos.entryPrice.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <PnLDisplay
                    amount={pos.unrealizedPnL}
                    percentage={pos.unrealizedPnLPct}
                    size="sm"
                    layout="inline"
                    className="justify-end"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <RiskBadge level={pos.riskLevel} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-500 flex items-center justify-between">
        <span>EXCHANGE ISOLATION: 100% CROSS MARGIN PROTECTED</span>
        <span>STOP LOSS: HARD LIMIT ACTIVE</span>
      </div>
    </Surface>
  );
}
