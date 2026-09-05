"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
import { MarketAssetContext } from "@/lib/mockOverviewData";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";

interface MarketContextWidgetProps {
  markets: MarketAssetContext[];
  className?: string;
}

export function MarketContextWidget({
  markets,
  className = "",
}: MarketContextWidgetProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      {markets.map((m) => {
        const isPositive = m.change24h >= 0;
        return (
          <Link
            key={m.symbol}
            href={`/markets/${m.symbol.replace("/", "-")}`}
            className="group block"
          >
            <Surface
              variant="interactive"
              padded="sm"
              className="flex flex-col justify-between h-full"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CryptoIcon symbol={m.symbol} size="md" />
                  <span className="font-mono tabular-nums text-xs font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">
                    {m.symbol}
                  </span>
                  <span className="text-xs text-gray-400 font-sans hidden sm:inline">
                    {m.name}
                  </span>
                </div>
                <ExternalLink
                  size={12}
                  className="text-gray-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className="font-mono tabular-nums text-base font-bold text-gray-100 tracking-tight">
                  ${m.price.toLocaleString("en-US", {
                    minimumFractionDigits: m.price > 1000 ? 2 : 2,
                  })}
                </span>
                <span
                  className={`inline-flex items-center font-mono tabular-nums text-xs font-bold ${
                    isPositive ? "text-profit" : "text-loss"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight size={13} className="shrink-0" />
                  ) : (
                    <ArrowDownRight size={13} className="shrink-0" />
                  )}
                  <span>
                    {isPositive ? "+" : ""}
                    {m.change24h.toFixed(2)}%
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#222B32]/80 text-xs font-mono text-gray-400">
                <span className="text-gray-300 font-sans truncate max-w-[140px]">
                  {m.regime}
                </span>
                <span className="tabular-nums">Vol: {m.volume24h}</span>
              </div>
            </Surface>
          </Link>
        );
      })}
    </div>
  );
}
