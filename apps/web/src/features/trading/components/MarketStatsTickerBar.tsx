"use client";

import React, { useState } from "react";
import { Star, ChevronDown, MoreHorizontal, LayoutGrid } from "lucide-react";
import { FuturesTickerStats } from "../types/binanceFutures";

interface MarketStatsTickerBarProps {
  ticker: FuturesTickerStats;
}

export function MarketStatsTickerBar({ ticker }: MarketStatsTickerBarProps) {
  const [isFavorited, setIsFavorited] = useState(true);

  const isPositive = ticker.priceChange >= 0;

  return (
    <div className="h-11 bg-[#181A20] border-b border-[#23272E] px-3 flex items-center justify-between text-xs select-none overflow-x-auto no-scrollbar shrink-0">
      {/* Left: Symbol & Current Price */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Star & Coin Badge & Symbol */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFavorited(!isFavorited)}
            className="text-[#848E9C] hover:text-[#F0B90B] transition-colors"
            title="Add to Favorites"
          >
            <Star
              size={15}
              className={isFavorited ? "fill-[#F0B90B] text-[#F0B90B]" : "text-[#848E9C]"}
            />
          </button>

          {/* BTC Icon */}
          <div className="w-5 h-5 rounded-full bg-[#F7931A] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
            ₿
          </div>

          {/* Symbol & Market Type */}
          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="font-bold text-white text-[14px] font-mono tracking-tight group-hover:text-[#F0B90B] transition-colors">
              {ticker.symbol}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#2B313A] text-[#848E9C] text-[10px] font-mono font-medium">
              Perp
            </span>
            <ChevronDown size={14} className="text-[#848E9C] group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Large Current Price & 24h Change */}
        <div className="flex items-baseline gap-2 font-mono">
          <span
            className={`text-[16px] font-bold tracking-tight ${
              isPositive ? "text-[#0ECB81]" : "text-[#F6465D]"
            }`}
          >
            {ticker.lastPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span
            className={`text-[11px] font-medium ${
              isPositive ? "text-[#0ECB81]" : "text-[#F6465D]"
            }`}
          >
            {isPositive ? "+" : ""}
            {ticker.priceChange.toFixed(1)} {isPositive ? "+" : ""}
            {ticker.priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Center/Right: Detailed 24h Metrics */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-[#848E9C] shrink-0 ml-4">
        {/* Mark & Index */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">Mark</span>
          <span className="text-[#EAECEF]">
            {ticker.markPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">Index</span>
          <span className="text-[#EAECEF]">
            {ticker.indexPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        {/* Funding / Countdown */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">Funding (8h) / Countdown</span>
          <span className="text-[#EAECEF]">
            <span className="text-[#F6465D] font-medium">
              {(ticker.fundingRate * 100).toFixed(5)}%
            </span>{" "}
            / {ticker.countdownFormatted}
          </span>
        </div>

        {/* 24h High & Low */}
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">24h High</span>
          <span className="text-[#EAECEF]">
            {ticker.high24h.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">24h Low</span>
          <span className="text-[#EAECEF]">
            {ticker.low24h.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        {/* 24h Volume BTC & USDT */}
        <div className="hidden lg:flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">24h Vol(BTC)</span>
          <span className="text-[#EAECEF]">
            {ticker.volumeBtc.toLocaleString("en-US", { maximumFractionDigits: 3 })}
          </span>
        </div>

        <div className="hidden xl:flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">24h Vol(USDT)</span>
          <span className="text-[#EAECEF]">
            {ticker.volumeUsdt.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Open Interest */}
        <div className="hidden 2xl:flex flex-col leading-tight">
          <span className="text-[10px] text-[#848E9C]/80">Open Interest(USDT)</span>
          <span className="text-[#EAECEF]">
            {ticker.openInterestUsdt.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1 text-[#848E9C] border-l border-[#23272E] pl-2">
          <button
            type="button"
            className="p-1 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
            title="Customise layout"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            className="p-1 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
            title="More Options"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
