"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { MarketDetail } from "@/lib/mockMarketData";
import { ArrowUpRight, ArrowDownRight, Layers, Briefcase } from "lucide-react";

interface WatchlistProps {
  markets: MarketDetail[];
  selectedSymbolKey: string;
  onSelectSymbol: (symbolKey: string) => void;
  className?: string;
}

export function Watchlist({
  markets,
  selectedSymbolKey,
  onSelectSymbol,
  className = "",
}: WatchlistProps) {
  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-color bg-surface-2/60 select-none">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-cyan-500" />
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
            Market Watchlist
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          {markets.length} ASSETS
        </span>
      </div>

      {/* Symbol List */}
      <div className="divide-y divide-border-color/60 overflow-y-auto">
        {markets.map((m) => {
          const key = m.symbol.replace("/", "-");
          const isSelected = selectedSymbolKey === key;
          const isPositive = m.change24h >= 0;

          return (
            <button
              key={m.symbol}
              type="button"
              onClick={() => onSelectSymbol(key)}
              className={`w-full text-left p-3 transition-all duration-150 flex flex-col gap-1 outline-none ${
                isSelected
                  ? "bg-cyan-dim/20 border-l-2 border-l-cyan-500 shadow-[inset_0_0_12px_rgba(0,229,255,0.08)]"
                  : "hover:bg-surface-hover/70 border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? "text-cyan-300" : "text-gray-200"
                    }`}
                  >
                    {m.symbol}
                  </span>
                  {m.position && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                      title="Active Position Open"
                    />
                  )}
                </div>

                <span
                  className={`inline-flex items-center font-mono text-xs font-semibold ${
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

              <div className="flex items-center justify-between w-full text-[11px] font-mono">
                <span className="text-gray-100 font-medium">
                  ${m.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                  {m.regime.split(" ")[0]}
                </span>
              </div>

              {m.position && (
                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-mono text-cyan-400">
                  <Briefcase size={10} />
                  <span>
                    {m.position.side} • {m.position.size}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Watchlist Footer */}
      <div className="px-3 py-1.5 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>PERP MARGIN</span>
        <span className="text-cyan-400">SYNC ACTIVE</span>
      </div>
    </Surface>
  );
}
