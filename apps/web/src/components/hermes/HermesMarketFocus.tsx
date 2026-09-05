"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { MarketFocusItem } from "@/lib/mockHermesData";
import { Eye, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";

interface HermesMarketFocusProps {
  markets: MarketFocusItem[];
  className?: string;
}

export function HermesMarketFocus({
  markets,
  className = "",
}: HermesMarketFocusProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-surface-2/50 select-none">
        <div className="flex items-center gap-2">
          <Eye size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Market Focus
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          SURVEILLANCE LIST
        </span>
      </div>

      {/* Markets List */}
      <div className="divide-y divide-border-color/50">
        {markets.map((m) => {
          const isPositive = m.change24h >= 0;
          const symbolUrl = `/markets/${m.symbol.replace("/", "-")}`;

          return (
            <Link
              key={m.symbol}
              href={symbolUrl}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-hover/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-100 group-hover:text-cyan-300 transition-colors">
                      {m.symbol}
                    </span>
                    <span className="text-[10px] text-gray-400">{m.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 line-clamp-1">
                    {m.attentionReason}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-gray-200">
                    ${m.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold ${
                      isPositive ? "text-profit" : "text-loss"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight size={11} />
                    ) : (
                      <ArrowDownRight size={11} />
                    )}
                    {isPositive ? "+" : ""}
                    {m.change24h.toFixed(2)}%
                  </span>
                </div>

                <Badge
                  variant={
                    m.attentionLevel === "High Attention"
                      ? "cyan"
                      : m.attentionLevel === "Active Observation"
                      ? "outline"
                      : "neutral"
                  }
                  size="sm"
                >
                  {m.attentionLevel}
                </Badge>

                <ExternalLink
                  size={12}
                  className="text-gray-500 group-hover:text-cyan-400 transition-colors hidden sm:block"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </Surface>
  );
}
