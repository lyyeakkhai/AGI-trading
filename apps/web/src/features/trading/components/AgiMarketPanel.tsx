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
  PanelLeftClose,
} from "lucide-react";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
import { mockMarketDetails, watchlistSymbols, MarketDetail } from "@/lib/mockMarketData";

interface AgiMarketPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  isDocked?: boolean;
}

// Global Crypto Market Share & Sector Dominance data
const MARKET_SHARE_METRICS = [
  { name: "BTC", fullName: "Bitcoin", share: 58.4, color: "#00E5FF", delta: "+0.34%" },
  { name: "ETH", fullName: "Ethereum", share: 16.2, color: "#6366F1", delta: "-0.12%" },
  { name: "SOL", fullName: "Solana", share: 6.8, color: "#A855F7", delta: "+0.85%" },
  { name: "ALTS", fullName: "Altcoins", share: 18.6, color: "#728594", delta: "-0.28%" },
];

export function AgiMarketPanel({
  isOpen = true,
  onClose,
  currentSymbol,
  onSelectSymbol,
  isDocked = false,
}: AgiMarketPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "high_vol" | "hermes" | "gainers">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus input when opened if not docked
  useEffect(() => {
    if (!isDocked && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, isDocked]);

  // Handle ESC key if floating
  useEffect(() => {
    if (isDocked || !isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose?.();
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isDocked]);

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

  if (!isOpen && !isDocked) return null;

  const containerClasses = isDocked
    ? "h-full w-full flex flex-col bg-[#0E0E0E] select-none font-sans text-xs overflow-hidden"
    : "fixed top-14 left-4 w-[540px] max-w-[95vw] bg-[#0E0E0E] border border-[#242D35] rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.9)] z-50 flex flex-col max-h-[600px] overflow-hidden select-none font-sans text-xs animate-in fade-in duration-100";

  return (
    <div ref={panelRef} className={containerClasses}>
      {/* 1. Header Toolbar */}
      <div className="p-2.5 border-b border-[#242D35] bg-[#0A0A0A] space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            <span className="font-mono text-[12px] font-bold tracking-tight text-[#EDEDED] uppercase">
              Markets & Sector Share
            </span>
            <span className="px-1 py-0.2 rounded bg-[#0A5965]/40 border border-[#00E5FF]/30 text-[9px] font-mono text-[#00E5FF] font-semibold">
              PERP
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[#8A8A8A] hover:text-[#00E5FF] hover:bg-[#1C1C1C] transition-colors cursor-pointer"
              title={isDocked ? "Collapse Markets Sidebar" : "Close (Esc)"}
            >
              {isDocked ? <PanelLeftClose size={15} /> : <X size={15} />}
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-[#8A8A8A]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coin / pair..."
            className="w-full bg-[#141414] border border-[#242D35] focus:border-[#00E5FF] text-[#EDEDED] text-xs font-mono pl-7 pr-6 py-1 rounded outline-none transition-colors placeholder:text-[#525252]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-[#8A8A8A] hover:text-white cursor-pointer"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            All ({markets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("high_vol")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === "high_vol"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            <TrendingUp size={10} />
            Vol
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("hermes")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === "hermes"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            <Bot size={10} className="text-[#00E5FF]" />
            Hermes
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("gainers")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === "gainers"
                ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
            }`}
          >
            <Zap size={10} />
            Gainers
          </button>
        </div>
      </div>

      {/* 2. Market Share & Dominance Intelligence Section */}
      <div className="p-2 bg-[#121212] border-b border-[#242D35] shrink-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#8A8A8A]">
            <PieChart size={12} className="text-[#00E5FF]" />
            <span className="text-[#EDEDED] font-semibold">Sector Dominance</span>
          </div>
          <span className="text-[9px] font-mono text-[#00E5FF]">
            Macro: Bullish Exp
          </span>
        </div>

        {/* Stacked Dominance Bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-[#1C1C1C] border border-[#242D35]/50">
          {MARKET_SHARE_METRICS.map((item) => (
            <div
              key={item.name}
              style={{ width: `${item.share}%`, backgroundColor: item.color }}
              className="h-full transition-all duration-300 relative group"
              title={`${item.fullName} Share: ${item.share}% (${item.delta})`}
            />
          ))}
        </div>

        {/* Dominance Metric Pills (Compact 4-column) */}
        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
          {MARKET_SHARE_METRICS.map((item) => (
            <div
              key={item.name}
              className="px-1 py-0.5 bg-[#0A0A0A] border border-[#242D35] rounded flex flex-col"
              title={`${item.fullName} Dominance: ${item.share}%`}
            >
              <div className="flex items-center gap-0.5 text-[#8A8A8A]">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
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
      <div className="grid grid-cols-12 px-2.5 py-1 text-[10px] font-mono text-[#8A8A8A] bg-[#0A0A0A] border-b border-[#242D35]/80 uppercase shrink-0">
        <div className="col-span-5 text-left">Asset</div>
        <div className="col-span-4 text-right">Price</div>
        <div className="col-span-3 text-right">24h %</div>
      </div>

      {/* 4. Scrollable Market Pairs List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1C1C1C] font-mono text-xs no-scrollbar">
        {filteredMarkets.length === 0 ? (
          <div className="py-8 text-center text-[#8A8A8A] text-xs font-mono">
            No markets matching &quot;{searchQuery}&quot;
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
                  if (!isDocked) onClose?.();
                }}
                className={`w-full grid grid-cols-12 px-2.5 py-1.5 items-center text-left hover:bg-[#181818] transition-colors cursor-pointer group outline-none ${
                  isCurrent ? "bg-[#00E5FF]/10 border-l-2 border-[#00E5FF]" : ""
                }`}
              >
                {/* Symbol & Name */}
                <div className="col-span-5 flex items-center gap-1.5 overflow-hidden">
                  <CryptoIcon symbol={market.symbol} size="sm" />
                  <div className="flex flex-col leading-tight truncate">
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-bold text-xs ${
                          isCurrent ? "text-[#00E5FF]" : "text-[#EDEDED] group-hover:text-white"
                        }`}
                      >
                        {market.baseAsset}
                      </span>
                      <span className="text-[9px] text-[#8A8A8A]">/USDT</span>
                    </div>
                    <span className="text-[9px] text-[#8A8A8A] truncate font-sans">
                      {market.name}
                    </span>
                  </div>
                </div>

                {/* Last Price */}
                <div className="col-span-4 text-right text-[#EDEDED] font-medium text-xs">
                  {market.price.toLocaleString("en-US", {
                    minimumFractionDigits: market.price < 1 ? 4 : 2,
                    maximumFractionDigits: market.price < 1 ? 4 : 2,
                  })}
                </div>

                {/* 24h Change */}
                <div className="col-span-3 text-right">
                  <span
                    className={`inline-flex items-center justify-end font-semibold text-[11px] ${
                      isPos ? "text-[#00E676]" : "text-[#FF3B30]"
                    }`}
                  >
                    {isPos ? (
                      <ArrowUpRight size={11} className="shrink-0" />
                    ) : (
                      <ArrowDownRight size={11} className="shrink-0" />
                    )}
                    <span>
                      {isPos ? "+" : ""}
                      {market.change24h.toFixed(2)}%
                    </span>
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 5. Footer status */}
      <div className="px-2.5 py-1 bg-[#0A0A0A] border-t border-[#242D35] flex items-center justify-between text-[10px] font-mono text-[#8A8A8A] shrink-0">
        <span>Click to switch desk</span>
        <span className="text-[#00E5FF]">{filteredMarkets.length} perpetuals</span>
      </div>
    </div>
  );
}
