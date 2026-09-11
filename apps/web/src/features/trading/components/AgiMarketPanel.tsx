"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  X,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Bot,
  Zap,
} from "lucide-react";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
import { mockMarketDetails, watchlistSymbols, MarketDetail } from "@/lib/mockMarketData";

interface AgiMarketPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

// Global Crypto Market Share & Sector Dominance data
const MARKET_SHARE_METRICS = [
  { name: "BTC Dominance", share: 58.4, color: "#00E5FF", delta: "+0.34%" },
  { name: "ETH Dominance", share: 16.2, color: "#6366F1", delta: "-0.12%" },
  { name: "SOL Dominance", share: 6.8, color: "#A855F7", delta: "+0.85%" },
  { name: "Altcoin Share", share: 18.6, color: "#728594", delta: "-0.28%" },
];

export function AgiMarketPanel({
  isOpen,
  onClose,
  currentSymbol,
  onSelectSymbol,
}: AgiMarketPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "high_vol" | "hermes" | "gainers">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Handle ESC key and click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Gather market list from mock data
  const markets: MarketDetail[] = useMemo(() => {
    return watchlistSymbols
      .map((k) => mockMarketDetails[k])
      .filter((m): m is MarketDetail => Boolean(m));
  }, []);

  // Filter markets by search and category
  const filteredMarkets = useMemo(() => {
    let list = markets;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, "");
      list = list.filter((m) => {
        const sym = m.symbol.toLowerCase().replace(/[^a-z0-9]/g, "");
        const name = m.name.toLowerCase();
        return sym.includes(q) || name.includes(q);
      });
    }

    if (activeCategory === "high_vol") {
      list = [...list].sort((a, b) => {
        const valA = parseFloat(a.quoteVolume24h.replace(/[^0-9.]/g, "")) || 0;
        const valB = parseFloat(b.quoteVolume24h.replace(/[^0-9.]/g, "")) || 0;
        return valB - valA;
      });
    } else if (activeCategory === "hermes") {
      list = list.filter((m) => m.hermes && m.hermes.confidence >= 75);
    } else if (activeCategory === "gainers") {
      list = [...list].sort((a, b) => b.change24h - a.change24h);
    }

    return list;
  }, [markets, searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-1 w-[540px] max-w-[95vw] bg-[#0E0E0E] border border-[#242D35] rounded-md shadow-[0_12px_32px_rgba(0,0,0,0.85)] z-50 flex flex-col max-h-[580px] overflow-hidden select-none font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      {/* 1. Header: Title, Search bar, and Close */}
      <div className="p-3 border-b border-[#242D35] bg-[#0A0A0A] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            <span className="font-mono text-[13px] font-bold tracking-tight text-[#EDEDED]">
              AGI MARKET PANEL
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#1C1C1C] border border-[#242D35] text-[10px] font-mono text-[#00E5FF] font-semibold">
              USDⓈ-M PERP
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1C] transition-colors"
            title="Close (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-[#8A8A8A]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crypto pair, asset name, or Hermes signal..."
            className="w-full bg-[#141414] border border-[#242D35] focus:border-[#00E5FF] text-[#EDEDED] text-xs font-mono pl-8 pr-7 py-1.5 rounded outline-none transition-colors placeholder:text-[#525252]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-[#8A8A8A] hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              activeCategory === "all"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            All Pairs ({markets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("high_vol")}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
              activeCategory === "high_vol"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            <TrendingUp size={11} />
            Top Volume
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("hermes")}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
              activeCategory === "hermes"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            <Bot size={11} className="text-[#00E5FF]" />
            Hermes High Confidence
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("gainers")}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
              activeCategory === "gainers"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            <Zap size={11} />
            Gainers
          </button>
        </div>
      </div>

      {/* 2. Market Share & Dominance Intelligence Section */}
      <div className="px-3 py-2.5 bg-[#121212] border-b border-[#242D35] shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8A8A8A]">
            <PieChart size={13} className="text-[#00E5FF]" />
            <span className="text-[#EDEDED] font-semibold">Crypto Market Share & Sector Dominance</span>
          </div>
          <span className="text-[10px] font-mono text-[#00E5FF] font-medium">
            Macro Regime: Bullish Expansion
          </span>
        </div>

        {/* Stacked Dominance Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#1C1C1C] mb-2 border border-[#242D35]/50">
          {MARKET_SHARE_METRICS.map((item) => (
            <div
              key={item.name}
              style={{ width: `${item.share}%`, backgroundColor: item.color }}
              className="h-full transition-all duration-300 relative group"
              title={`${item.name}: ${item.share}% (${item.delta})`}
            />
          ))}
        </div>

        {/* Dominance Metric Pills */}
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
          {MARKET_SHARE_METRICS.map((item) => (
            <div
              key={item.name}
              className="px-1.5 py-1 bg-[#0A0A0A] border border-[#242D35] rounded flex flex-col"
            >
              <div className="flex items-center gap-1 text-[#8A8A8A]">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name.replace(" Dominance", "")}</span>
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[#EDEDED] font-bold">{item.share}%</span>
                <span
                  className={item.delta.startsWith("+") ? "text-[#00E676]" : "text-[#FF3B30]"}
                >
                  {item.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Market Pairs Table Header */}
      <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-mono text-[#8A8A8A] bg-[#0A0A0A] border-b border-[#242D35]/80 uppercase shrink-0">
        <div className="col-span-5 text-left">Market Asset</div>
        <div className="col-span-3 text-right">Price (USDT)</div>
        <div className="col-span-2 text-right">24h Change</div>
        <div className="col-span-2 text-right">24h Vol</div>
      </div>

      {/* 4. Scrollable Market Pairs List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1C1C1C] font-mono text-xs">
        {filteredMarkets.length === 0 ? (
          <div className="py-8 text-center text-[#8A8A8A] text-xs font-mono">
            No crypto pairs matching "{searchQuery}"
          </div>
        ) : (
          filteredMarkets.map((market) => {
            const rawSym = market.symbol.replace("/", "");
            const isCurrent =
              currentSymbol.toUpperCase() === rawSym.toUpperCase() ||
              currentSymbol.toUpperCase() === market.symbol.toUpperCase();
            const isPos = market.change24h >= 0;

            return (
              <button
                key={market.symbol}
                type="button"
                onClick={() => {
                  onSelectSymbol(rawSym);
                  onClose();
                }}
                className={`w-full grid grid-cols-12 px-3 py-2 items-center text-left hover:bg-[#181818] transition-colors cursor-pointer group outline-none ${
                  isCurrent ? "bg-[#00E5FF]/10 border-l-2 border-[#00E5FF]" : ""
                }`}
              >
                {/* Symbol & Name & Hermes Tag */}
                <div className="col-span-5 flex items-center gap-2">
                  <CryptoIcon symbol={market.symbol} size="sm" />
                  <div className="flex flex-col leading-tight truncate">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-bold ${
                          isCurrent ? "text-[#00E5FF]" : "text-[#EDEDED] group-hover:text-white"
                        }`}
                      >
                        {market.symbol.replace("/", "")}
                      </span>
                      <span className="px-1 py-0.2 rounded bg-[#1C1C1C] text-[9px] text-[#8A8A8A]">
                        PERP
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8A8A8A] truncate max-w-[130px] font-sans">
                      {market.name}
                    </span>
                  </div>
                </div>

                {/* Last Price */}
                <div className="col-span-3 text-right text-[#EDEDED] font-medium">
                  {market.price.toLocaleString("en-US", {
                    minimumFractionDigits: market.price < 1 ? 4 : 2,
                    maximumFractionDigits: market.price < 1 ? 4 : 2,
                  })}
                </div>

                {/* 24h Change */}
                <div className="col-span-2 text-right">
                  <span
                    className={`inline-flex items-center font-semibold text-[11px] ${
                      isPos ? "text-[#00E676]" : "text-[#FF3B30]"
                    }`}
                  >
                    {isPos ? (
                      <ArrowUpRight size={12} className="shrink-0" />
                    ) : (
                      <ArrowDownRight size={12} className="shrink-0" />
                    )}
                    <span>
                      {isPos ? "+" : ""}
                      {market.change24h.toFixed(2)}%
                    </span>
                  </span>
                </div>

                {/* 24h Volume */}
                <div className="col-span-2 text-right text-[#8A8A8A] text-[11px]">
                  {market.quoteVolume24h}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 5. Footer shortcut indicator */}
      <div className="px-3 py-1.5 bg-[#0A0A0A] border-t border-[#242D35] flex items-center justify-between text-[10px] font-mono text-[#8A8A8A] shrink-0">
        <div className="flex items-center gap-2">
          <span>Click pair to switch desk</span>
          <span>•</span>
          <span className="text-[#00E5FF]">Press Esc to dismiss</span>
        </div>
        <span>{filteredMarkets.length} perpetual markets active</span>
      </div>
    </div>
  );
}
