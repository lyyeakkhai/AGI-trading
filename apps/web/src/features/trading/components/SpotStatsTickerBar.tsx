"use client";

import React, { useState } from "react";
import { Star, ChevronRight, ShieldCheck, Flame, Tag } from "lucide-react";
import { FuturesTickerStats } from "../types/binanceFutures";
import { CryptoIcon } from "@/components/ui/CryptoIcon";

interface SpotStatsTickerBarProps {
  ticker: FuturesTickerStats;
  onSelectSymbol?: (symbol: string) => void;
}

export function SpotStatsTickerBar({ ticker }: SpotStatsTickerBarProps) {
  const [isFavorited, setIsFavorited] = useState(true);

  const isPositive = ticker.priceChange >= 0;

  // Format symbol as base/quote e.g. BTC/USDT
  const baseAsset = ticker.symbol.endsWith("USDT")
    ? ticker.symbol.replace("USDT", "")
    : ticker.symbol.endsWith("USDC")
    ? ticker.symbol.replace("USDC", "")
    : ticker.symbol;
  const quoteAsset = ticker.symbol.endsWith("USDT")
    ? "USDT"
    : ticker.symbol.endsWith("USDC")
    ? "USDC"
    : "USDT";

  return (
    <div className="h-11 bg-[#0E0E0E] border-b border-[#242D35] px-3 flex items-center justify-between text-xs select-none overflow-x-auto no-scrollbar shrink-0 z-20">
      {/* Left: Star, Symbol, Coin Badge, Category link, Price */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Star & Coin Badge & Symbol */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFavorited(!isFavorited)}
            className="text-[#8A8A8A] hover:text-[#00E5FF] transition-colors cursor-pointer"
            title="Add to Favorites"
          >
            <Star
              size={15}
              className={isFavorited ? "fill-[#00E5FF] text-[#00E5FF]" : "text-[#8A8A8A]"}
            />
          </button>

          <div className="shrink-0 flex items-center justify-center">
            <CryptoIcon symbol={ticker.symbol} size="sm" />
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[#EDEDED] text-[14px] font-mono tracking-tight">
                {baseAsset}/{quoteAsset}
              </span>
            </div>
            <a
              href="#about"
              className="text-[10px] text-[#00E5FF] hover:underline flex items-center font-sans"
            >
              <span>{baseAsset} Price</span>
              <ChevronRight size={10} />
            </a>
          </div>
        </div>

        {/* Large Current Price & 24h Change */}
        <div className="flex items-baseline gap-2 font-mono">
          <span
            className={`text-[16px] font-bold tracking-tight ${
              isPositive ? "text-[#00E676]" : "text-[#FF3B30]"
            }`}
          >
            {ticker.lastPrice.toLocaleString("en-US", {
              minimumFractionDigits: ticker.lastPrice < 1 ? 4 : 2,
              maximumFractionDigits: ticker.lastPrice < 1 ? 4 : 2,
            })}
          </span>
          <span
            className={`text-[11px] font-medium ${
              isPositive ? "text-[#00E676]" : "text-[#FF3B30]"
            }`}
          >
            {isPositive ? "+" : ""}
            {ticker.priceChange.toFixed(2)} {isPositive ? "+" : ""}
            {ticker.priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Center/Right: Detailed 24h Metrics */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-[#8A8A8A] shrink-0 ml-4">
        {/* 24h High & Low */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h High</span>
          <span className="text-[#EDEDED]">
            {ticker.high24h.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h Low</span>
          <span className="text-[#EDEDED]">
            {ticker.low24h.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Volumes */}
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h Vol({baseAsset})</span>
          <span className="text-[#EDEDED]">
            {ticker.volumeBtc.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="hidden lg:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">24h Vol({quoteAsset})</span>
          <span className="text-[#EDEDED]">
            {ticker.volumeUsdt.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Networks */}
        <div className="hidden xl:flex flex-col leading-tight">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans">Networks</span>
          <span className="text-[#EDEDED]">{baseAsset} (5)</span>
        </div>

        {/* Token Tags */}
        <div className="hidden 2xl:flex items-center gap-1 border-l border-[#242D35] pl-3">
          <span className="text-[10px] text-[#8A8A8A]/80 font-sans mr-1">Token Tags:</span>
          <span className="px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#EDEDED] text-[10px] border border-[#242D35]">
            Payments
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#0A5965]/30 text-[#00E5FF] text-[10px] border border-[#00E5FF]/30 flex items-center gap-0.5">
            <Flame size={10} />
            Vol: Hot
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#8A8A8A] text-[10px] border border-[#242D35] flex items-center gap-0.5">
            <ShieldCheck size={10} className="text-[#00E676]" />
            Protection
          </span>
        </div>
      </div>
    </div>
  );
}
