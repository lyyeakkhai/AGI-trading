"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Star,
  ArrowUpDown,
  ArrowLeft,
  X,
  Check,
  Flame,
  Bot,
  Zap,
} from "lucide-react";
import { TradeRecord } from "../types/binanceFutures";
import { mockMarketDetails, watchlistSymbols, MarketDetail } from "@/lib/mockMarketData";
import { CryptoIcon } from "@/components/ui/CryptoIcon";

interface SpotMarketsTradesColumnProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  trades: TradeRecord[];
  isAnnouncementDrawerOpen: boolean;
  onCloseAnnouncementDrawer: () => void;
}

export function SpotMarketsTradesColumn({
  currentSymbol,
  onSelectSymbol,
  trades,
  isAnnouncementDrawerOpen,
  onCloseAnnouncementDrawer,
}: SpotMarketsTradesColumnProps) {
  // Markets filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "new" | "hermes" | "gainers">("all");
  const [activeQuote, setActiveQuote] = useState<"USDT" | "USDC" | "BNB" | "BTC">("USDT");
  const [activeTradeTab, setActiveTradeTab] = useState<"market" | "my">("market");

  // Announcement drawer settings
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(true);
  const [announcementFilters, setAnnouncementFilters] = useState<Record<string, boolean>>({
    "Important Notice": true,
    "Hot Campaign": true,
    "New Trading Pair": true,
    "New Blog": true,
    "What's Happening": true,
    "Other": true,
  });

  const toggleAnnouncementFilter = (key: string) => {
    setAnnouncementFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Mock markets list
  const markets: MarketDetail[] = useMemo(() => {
    return watchlistSymbols
      .map((k) => mockMarketDetails[k])
      .filter((m): m is MarketDetail => Boolean(m));
  }, []);

  // Filtered market pairs
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

    if (activeCategory === "new") {
      list = list.slice(2, 8);
    } else if (activeCategory === "hermes") {
      list = list.filter((m) => m.hermes && m.hermes.confidence >= 75);
    } else if (activeCategory === "gainers") {
      list = [...list].sort((a, b) => b.change24h - a.change24h);
    }

    return list;
  }, [markets, searchQuery, activeCategory]);

  return (
    <div className="flex flex-col h-full bg-[#0E0E0E] text-[#EDEDED] font-mono text-xs select-none relative overflow-hidden">
      {/* ================= TOP SECTION: MARKETS WATCHLIST (50%) ================= */}
      <div className="flex-1 min-h-0 flex flex-col border-b border-[#242D35]">
        {/* Search input */}
        <div className="p-2 border-b border-[#242D35] bg-[#0A0A0A] shrink-0 space-y-1.5">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-[#8A8A8A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coin / pair..."
              className="w-full bg-[#141414] border border-[#242D35] focus:border-[#00E5FF] text-[#EDEDED] text-[11px] font-mono pl-7 pr-6 py-1 rounded outline-none transition-colors placeholder:text-[#525252]"
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

          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                  : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("new")}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === "new"
                  ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                  : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
              }`}
            >
              New
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("hermes")}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
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
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                activeCategory === "gainers"
                  ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
                  : "text-[#8A8A8A] hover:text-[#EDEDED] bg-[#141414]"
              }`}
            >
              <Zap size={10} />
              Gainers
            </button>
          </div>

          {/* Quote Tabs (USDT, USDC, BNB, BTC) */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#8A8A8A] border-t border-[#1C1C1C] pt-1">
            {(["USDT", "USDC", "BNB", "BTC"] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setActiveQuote(q)}
                className={`px-1 py-0.2 hover:text-[#00E5FF] cursor-pointer ${
                  activeQuote === q ? "text-[#00E5FF] font-bold border-b border-[#00E5FF]" : ""
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 px-2.5 py-1 text-[10px] text-[#8A8A8A] bg-[#0A0A0A] border-b border-[#242D35] shrink-0">
          <div className="col-span-6 flex items-center gap-0.5 cursor-pointer hover:text-[#EDEDED]">
            <span>Pair</span>
            <ArrowUpDown size={10} />
          </div>
          <div className="col-span-6 flex items-center justify-end gap-0.5 cursor-pointer hover:text-[#EDEDED] text-right">
            <span>Price / 24h</span>
            <ArrowUpDown size={10} />
          </div>
        </div>

        {/* Pairs List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1C1C1C] no-scrollbar">
          {filteredMarkets.map((market) => {
            const rawSym = market.symbol.replace("/", "");
            const isCurrent =
              currentSymbol.toUpperCase() === rawSym.toUpperCase() ||
              currentSymbol.toUpperCase() === market.symbol.toUpperCase();
            const isPos = market.change24h >= 0;

            return (
              <button
                key={market.symbol}
                type="button"
                onClick={() => onSelectSymbol(rawSym)}
                className={`w-full grid grid-cols-12 px-2.5 py-1.5 items-center text-left hover:bg-[#181818] transition-colors cursor-pointer group outline-none ${
                  isCurrent ? "bg-[#00E5FF]/10 border-l-2 border-[#00E5FF]" : ""
                }`}
              >
                {/* Left: Star, Icon, Pair, Leverage tag */}
                <div className="col-span-6 flex items-center gap-1.5 overflow-hidden">
                  <Star size={11} className="text-[#525252] hover:text-[#00E5FF] shrink-0" />
                  <CryptoIcon symbol={market.symbol} size="sm" />
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-bold text-[11px] ${
                          isCurrent ? "text-[#00E5FF]" : "text-[#EDEDED] group-hover:text-white"
                        }`}
                      >
                        {market.baseAsset}
                      </span>
                      <span className="text-[9px] text-[#8A8A8A]">/{activeQuote}</span>
                    </div>
                  </div>
                  <span className="px-1 py-0.1 rounded bg-[#1C1C1C] text-[8px] text-[#8A8A8A] font-mono border border-[#242D35]">
                    5x
                  </span>
                </div>

                {/* Right: Price and 24h % pill */}
                <div className="col-span-6 flex flex-col items-end justify-center">
                  <span className="text-[#EDEDED] font-medium text-[11px]">
                    {market.price.toLocaleString("en-US", {
                      minimumFractionDigits: market.price < 1 ? 4 : 2,
                      maximumFractionDigits: market.price < 1 ? 4 : 2,
                    })}
                  </span>
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-bold mt-0.5 ${
                      isPos
                        ? "bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30"
                        : "bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/30"
                    }`}
                  >
                    {isPos ? "+" : ""}
                    {market.change24h.toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= BOTTOM SECTION: TRADES (50%) ================= */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Trades Tabs: Market Trades / My Trades */}
        <div className="h-8 px-2.5 border-b border-[#242D35] bg-[#0A0A0A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTradeTab("market")}
              className={`text-[11px] font-sans transition-colors cursor-pointer ${
                activeTradeTab === "market"
                  ? "text-[#EDEDED] font-semibold border-b border-[#00E5FF] pb-1"
                  : "text-[#8A8A8A] hover:text-[#EDEDED]"
              }`}
            >
              Market Trades
            </button>
            <button
              type="button"
              onClick={() => setActiveTradeTab("my")}
              className={`text-[11px] font-sans transition-colors cursor-pointer ${
                activeTradeTab === "my"
                  ? "text-[#EDEDED] font-semibold border-b border-[#00E5FF] pb-1"
                  : "text-[#8A8A8A] hover:text-[#EDEDED]"
              }`}
            >
              My Trades
            </button>
          </div>
        </div>

        {/* Trades Header */}
        <div className="grid grid-cols-12 px-2.5 py-1 text-[10px] text-[#8A8A8A] bg-[#0E0E0E] border-b border-[#242D35] shrink-0">
          <div className="col-span-5 text-left">Price (USDT)</div>
          <div className="col-span-4 text-right">Amount (BTC)</div>
          <div className="col-span-3 text-right">Time</div>
        </div>

        {/* Trade Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#181818] no-scrollbar">
          {trades.map((t) => {
            const isBuy = t.side === "buy";
            return (
              <div
                key={t.id}
                className="grid grid-cols-12 px-2.5 py-1 text-[11px] items-center hover:bg-[#141414] transition-colors"
              >
                <div
                  className={`col-span-5 text-left font-semibold ${
                    isBuy ? "text-[#00E676]" : "text-[#FF3B30]"
                  }`}
                >
                  {t.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="col-span-4 text-right text-[#EDEDED]">
                  {t.amount.toFixed(4)}
                </div>
                <div className="col-span-3 text-right text-[#8A8A8A] text-[10px]">
                  {t.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= ANNOUNCEMENT SETTINGS DRAWER OVERLAY ================= */}
      {isAnnouncementDrawerOpen && (
        <div className="absolute inset-0 bg-[#0E0E0E]/95 backdrop-blur-md z-40 flex flex-col animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-3 border-b border-[#242D35] flex items-center justify-between bg-[#0A0A0A] shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCloseAnnouncementDrawer}
                className="p-1 rounded hover:bg-[#1C1C1C] text-[#8A8A8A] hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
              </button>
              <span className="font-mono text-xs font-bold text-[#EDEDED]">
                Announcement Settings
              </span>
            </div>

            <button
              type="button"
              onClick={onCloseAnnouncementDrawer}
              className="p-1 rounded hover:bg-[#1C1C1C] text-[#8A8A8A] hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
            {/* Master Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-[#242D35]">
              <span className="text-[#EDEDED] font-semibold">Settings</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementsEnabled}
                  onChange={(e) => setAnnouncementsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#242D35] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00E5FF]" />
              </label>
            </div>

            {/* Checkbox Category List */}
            <div className="space-y-3">
              {Object.keys(announcementFilters).map((key) => (
                <label
                  key={key}
                  className="flex items-center justify-between text-[#8A8A8A] hover:text-[#EDEDED] cursor-pointer py-1"
                >
                  <span>{key}</span>
                  <input
                    type="checkbox"
                    checked={announcementsEnabled && announcementFilters[key]}
                    disabled={!announcementsEnabled}
                    onChange={() => toggleAnnouncementFilter(key)}
                    className="rounded accent-[#00E5FF] w-4 h-4 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {/* Footnote Notice */}
            <div className="pt-4 border-t border-[#242D35] text-[10px] text-[#8A8A8A] leading-relaxed">
              * Once turned off, the announcement will no longer display on the trading page.
              Re-enable or view them <span className="text-[#00E5FF] underline cursor-pointer">here</span> if you
              want to get notified.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
