"use client";

import React, { useState } from "react";
import { Star, ChevronDown, MoreHorizontal, LayoutGrid, Layers } from "lucide-react";
import { FuturesTickerStats } from "../types/binanceFutures";
import { CryptoIcon } from "@/components/ui/CryptoIcon";

interface MarketStatsTickerBarProps {
  ticker: FuturesTickerStats;
  onSelectSymbol?: (symbol: string) => void;
  onToggleMarketPanel?: () => void;
  isMarketPanelOpen?: boolean;
}

export function MarketStatsTickerBar({
  ticker,
  onToggleMarketPanel,
  isMarketPanelOpen = true,
}: MarketStatsTickerBarProps) {
  const [isFavorited, setIsFavorited] = useState(true);

  const isPositive = ticker.priceChange >= 0;

  return (
    <div className="h-11 bg-[#0E0E0E] border-b border-[#242D35] px-3 flex items-center justify-between text-xs select-none overflow-x-auto no-scrollbar shrink-0 relative z-30">
      {/* Left: Symbol & Current Price & Markets Toggle */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Star & Coin Badge & Symbol */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFavorited(!isFavorited)}
            className="text-[#8A8A8A] hover:text-[#00E5FF] transition-colors"
            title="Add to Favorites"
          >
            <Star
              size={15}
              className={isFavorited ? "fill-[#00E5FF] text-[#00E5FF]" : "text-[#8A8A8A]"}
            />
          </button>

          {/* Crypto Coin Icon */}
          <div className="shrink-0 flex items-center justify-center">
            <CryptoIcon symbol={ticker.symbol} size="sm" />
          </div>

          {/* Symbol & Market Type with Interactive Market Panel Toggle */}
          <button
            type="button"
            onClick={() => onToggleMarketPanel?.()}
            className={`flex items-center gap-1.5 px-2 py-1 rounded bg-[#141414] hover:bg-[#1C1C1C] border transition-all cursor-pointer group ${
              isMarketPanelOpen
                ? "border-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                : "border-[#242D35] hover:border-[#00E5FF]/50"
            }`}
            title="Toggle AGI Market Panel & Sector Dominance"
          >
            <Layers size={13} className="text-[#00E5FF]" />
            <span className="font-bold text-[#EDEDED] text-[13px] font-mono tracking-tight group-hover:text-[#00E5FF] transition-colors">
              {ticker.symbol}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#0A5965]/40 text-[#00E5FF] text-[10px] font-mono font-medium border border-[#00E5FF]/30">
              Perp
            </span>
            <ChevronDown
              size={13}
              className={`text-[#8A8A8A] group-hover:text-[#00E5FF] transition-transform duration-150 ${
                isMarketPanelOpen ? "rotate-180 text-[#00E5FF]" : ""
              }`}
            />
          </button>
        </div>

        {/* Large Current Price & 24h Change */}
        <div className="flex items-baseline gap-2 font-mono">
          <span
            className={`text-[16px] font-bold tracking-tight ${
              isPositive ? "text-[#00E676]" : "text-[#FF3B30]"
            }`}
          >
            {ticker.lastPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span
            className={`text-[11px] font-medium ${
              isPositive ? "text-[#00E676]" : "text-[#FF3B30]"
            }`}
          >
            {isPositive ? "+" : ""}
            {ticker.priceChange.toFixed(1)} {isPositive ? "+" : ""}
            {ticker.priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Center/Right: Detailed 24h Metrics */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-[#8A8A8A] shrink-0 ml-4">
        {/* Mark & Index */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">Mark</span>
          <span className="text-[#EDEDED]">
            {ticker.markPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">Index</span>
          <span className="text-[#EDEDED]">
            {ticker.indexPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        {/* Funding / Countdown */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">Funding (8h) / Countdown</span>
          <span className="text-[#EDEDED]">
            <span className="text-[#FF3B30] font-medium">
              {(ticker.fundingRate * 100).toFixed(5)}%
            </span>{" "}
            / {ticker.countdownFormatted}
          </span>
        </div>

        {/* 24h High & Low */}
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h High</span>
          <span className="text-[#EDEDED]">
            {ticker.high24h.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h Low</span>
          <span className="text-[#EDEDED]">
            {ticker.low24h.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        {/* 24h Volume */}
        <div className="hidden lg:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h Vol(BTC)</span>
          <span className="text-[#EDEDED]">
            {ticker.volumeBtc.toLocaleString("en-US", { maximumFractionDigits: 3 })}
          </span>
        </div>

        <div className="hidden xl:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h Vol(USDT)</span>
          <span className="text-[#EDEDED]">
            {ticker.volumeUsdt.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Open Interest */}
        <div className="hidden 2xl:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">Open Interest(USDT)</span>
          <span className="text-[#EDEDED]">
            {ticker.openInterestUsdt.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1 text-[#8A8A8A] border-l border-[#242D35] pl-2">
          <button
            type="button"
            className="p-1 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
            title="Customise layout"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            className="p-1 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
            title="More Options"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
