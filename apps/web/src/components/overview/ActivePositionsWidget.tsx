"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PositionSide } from "@/features/trading/components/PositionSide";
import { PnLDisplay } from "@/features/trading/components/PnLDisplay";
import { RiskBadge } from "@/features/trading/components/RiskBadge";
import { OverviewPosition } from "@/lib/mockOverviewData";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
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
      variant="iron"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 iron-header">
        <div className="flex items-center gap-2">
          <Briefcase size={15} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-100 uppercase tracking-wide">
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
            className="text-gray-400 hover:text-cyan-400 text-xs font-semibold"
          >
            VIEW ALL
          </Button>
        </Link>
      </div>

      {/* Positions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-iron-950/90 border-b border-[#222B32] text-xs uppercase tracking-wider text-gray-400 font-semibold">
            <tr>
              <th className="px-4 py-2 font-semibold">Position</th>
              <th className="px-3 py-2 font-semibold text-right">Entry / Mark</th>
              <th className="px-3 py-2 font-semibold text-right">Unrealized P&L</th>
              <th className="px-4 py-2 font-semibold text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222B32]/60">
            {positions.map((pos) => (
              <tr
                key={pos.id}
                className="hover:bg-iron-800/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol={pos.symbol} size="sm" />
                    <span className="font-mono tabular-nums font-bold text-gray-100">{pos.symbol}</span>
                    <PositionSide side={pos.side} size="sm" />
                    <span className="text-xs font-mono text-gray-400 hidden sm:inline">
                      {pos.size}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-gray-100 font-mono tabular-nums font-semibold">
                      ${pos.markPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 font-mono tabular-nums">
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
      <div className="px-4 py-2 border-t border-[#222B32] bg-iron-950/60 text-[10px] font-mono text-gray-500 flex items-center justify-between">
        <span>EXCHANGE ISOLATION: 100% CROSS MARGIN PROTECTED</span>
        <span>STOP LOSS: HARD LIMIT ACTIVE</span>
      </div>
    </Surface>
  );
}
