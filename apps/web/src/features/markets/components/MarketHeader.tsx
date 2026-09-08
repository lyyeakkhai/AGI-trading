"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";
import { MarketDetail } from "@/lib/mockMarketData";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
import { ArrowUpRight, ArrowDownRight, Activity, Percent, DollarSign } from "lucide-react";

interface MarketHeaderProps {
  market: MarketDetail;
  className?: string;
}

export function MarketHeader({ market, className = "" }: MarketHeaderProps) {
  const isPositive = market.change24h >= 0;

  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg iron-card border border-[#222B32] border-t-[#3A4752] shadow-lg ${className}`}
    >
      {/* Left: Asset Ticker, Name, Price, and 24h Change */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <CryptoIcon symbol={market.symbol} size="lg" />
            <h1 className="text-xl font-bold font-mono tracking-tight text-gray-100">
              {market.symbol}
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-iron-900 border border-iron-700/60 text-[10px] font-mono text-gray-400 uppercase font-semibold">
              PERPETUAL
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              BINANCE LIVE
            </span>
          </div>
          <span className="text-xs text-gray-400 font-sans">{market.name}</span>
        </div>

        {/* Large Mark Price & Delta */}
        <div className="flex items-baseline gap-3 pl-0 sm:pl-4 sm:border-l sm:border-[#222B32]">
          <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-gray-100">
            ${market.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span
            className={`inline-flex items-center font-mono text-sm font-bold ${
              isPositive ? "text-profit" : "text-loss"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={16} className="shrink-0" />
            ) : (
              <ArrowDownRight size={16} className="shrink-0" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {market.change24h.toFixed(2)}%
            </span>
          </span>
        </div>
      </div>

      {/* Right: Supporting Technical 24h Telemetry */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-mono">
        {/* 24h Range */}
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">24h High / Low</span>
          <div className="flex items-center gap-1.5 text-gray-200">
            <span className="text-gray-100">${market.high24h.toLocaleString()}</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">${market.low24h.toLocaleString()}</span>
          </div>
        </div>

        {/* 24h Volume */}
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">24h Volume</span>
          <span className="text-gray-200 font-medium">{market.quoteVolume24h}</span>
        </div>

        {/* Funding Rate */}
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">Funding (8h)</span>
          <span
            className={`font-semibold ${
              market.fundingRate >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {market.fundingRate >= 0 ? "+" : ""}
            {(market.fundingRate * 100).toFixed(4)}%
          </span>
        </div>

        {/* Open Interest */}
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">Open Interest</span>
          <span className="text-gray-200 font-medium">{market.openInterest}</span>
        </div>

        {/* Regime & Hermes Status */}
        <div className="flex items-center gap-2 pl-0 sm:pl-3 sm:border-l sm:border-[#222B32]">
          <Badge variant="cyan" size="sm">
            {market.trend}
          </Badge>
          <AIStatusIndicator state={market.hermes.state} size="sm" />
        </div>
      </div>
    </div>
  );
}
