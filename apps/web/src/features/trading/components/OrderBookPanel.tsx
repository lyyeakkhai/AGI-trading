"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { OrderBookRow } from "../types/binanceFutures";

interface OrderBookPanelProps {
  asks: OrderBookRow[];
  bids: OrderBookRow[];
  currentPrice: number;
  markPrice: number;
  onSelectPrice?: (price: number) => void;
}

const PRECISION_OPTIONS = ["0.01", "0.1", "1", "10", "50", "100"] as const;

export function OrderBookPanel({
  asks,
  bids,
  currentPrice,
  markPrice,
  onSelectPrice,
}: OrderBookPanelProps) {
  const [viewMode, setViewMode] = useState<"both" | "asks" | "bids">("both");
  const [precision, setPrecision] = useState<string>("0.1");
  const [isPrecisionOpen, setIsPrecisionOpen] = useState(false);
  const precisionRef = useRef<HTMLDivElement>(null);

  // Close precision dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (precisionRef.current && !precisionRef.current.contains(event.target as Node)) {
        setIsPrecisionOpen(false);
      }
    }
    if (isPrecisionOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPrecisionOpen]);

  // Track price movement direction (up / down)
  const prevPriceRef = useRef(currentPrice);
  const [priceDirection, setPriceDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    if (currentPrice > prevPriceRef.current) {
      setPriceDirection("up");
    } else if (currentPrice < prevPriceRef.current) {
      setPriceDirection("down");
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  const decimals = useMemo(() => {
    if (precision.includes(".")) {
      return precision.split(".")[1].length;
    }
    return 0;
  }, [precision]);

  const formatPrice = (p: number) => {
    return p.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatSize = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(2)}K`;
    return val.toFixed(2);
  };

  // Sort asks descending (highest price at top, lowest ask at bottom next to spread)
  const sortedAsks = useMemo(() => {
    const list = [...asks].sort((a, b) => b.price - a.price);
    if (list.length === 0) return [];

    // In asks-only mode, if fewer than 14 rows, extrapolate higher price rows
    if (viewMode === "asks" && list.length < 14) {
      const step = parseFloat(precision) || 0.1;
      const needed = 14 - list.length;
      const topPrice = list[0].price;
      const extra: OrderBookRow[] = [];
      for (let i = needed; i >= 1; i--) {
        const p = Math.round((topPrice + i * step) * 100) / 100;
        const s = Math.round((((i * 17) % 80) + 20) * 100) / 100;
        extra.push({ price: p, size: s, sum: s, depthPercent: Math.round(((i * 13) % 50) + 20) });
      }
      return [...extra, ...list];
    }
    return list;
  }, [asks, viewMode, precision]);

  // Sort bids descending (highest bid at top next to spread, lower bids below)
  const sortedBids = useMemo(() => {
    const list = [...bids].sort((a, b) => b.price - a.price);
    if (list.length === 0) return [];

    // In bids-only mode, if fewer than 14 rows, extrapolate lower price rows
    if (viewMode === "bids" && list.length < 14) {
      const step = parseFloat(precision) || 0.1;
      const needed = 14 - list.length;
      const bottomPrice = list[list.length - 1].price;
      const extra: OrderBookRow[] = [];
      for (let i = 1; i <= needed; i++) {
        const p = Math.round((bottomPrice - i * step) * 100) / 100;
        const s = Math.round((((i * 19) % 80) + 20) * 100) / 100;
        extra.push({ price: p, size: s, sum: s, depthPercent: Math.round(((i * 11) % 50) + 20) });
      }
      return [...list, ...extra];
    }
    return list;
  }, [bids, viewMode, precision]);

  const visibleAsks = useMemo(() => {
    if (viewMode === "bids") return [];
    if (viewMode === "asks") return sortedAsks.slice(-14);
    return sortedAsks.slice(-7);
  }, [sortedAsks, viewMode]);

  const visibleBids = useMemo(() => {
    if (viewMode === "asks") return [];
    if (viewMode === "bids") return sortedBids.slice(0, 14);
    return sortedBids.slice(0, 7);
  }, [sortedBids, viewMode]);

  // Max sum for visual depth percentage calculation
  const maxDepthSum = useMemo(() => {
    const all = [...visibleAsks, ...visibleBids];
    return Math.max(...all.map((r) => r.sum || r.size), 1);
  }, [visibleAsks, visibleBids]);

  // Calculate spread between lowest ask and highest bid
  const spread = useMemo(() => {
    const lowestAsk = visibleAsks.length > 0 ? visibleAsks[visibleAsks.length - 1].price : currentPrice + 0.1;
    const highestBid = visibleBids.length > 0 ? visibleBids[0].price : currentPrice - 0.1;
    return Math.max(0, Math.round((lowestAsk - highestBid) * 100) / 100);
  }, [visibleAsks, visibleBids, currentPrice]);

  const renderSpreadRow = () => {
    const isUp = priceDirection === "up" || currentPrice >= markPrice;
    return (
      <div className="my-0.5 py-1 px-3 bg-[#0E0E0E] border-y border-[#242D35] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectPrice?.(currentPrice)}
            className={`text-sm font-bold font-mono hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer ${
              isUp ? "text-[#00E676]" : "text-[#FF3B30]"
            }`}
            title="Click to select Last Traded Price"
          >
            <span>{formatPrice(currentPrice)}</span>
            {isUp ? (
              <ArrowUp size={13} className="text-[#00E676] stroke-[2.5]" />
            ) : (
              <ArrowDown size={13} className="text-[#FF3B30] stroke-[2.5]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onSelectPrice?.(markPrice)}
            className="text-xs font-mono text-[#8A8A8A] hover:text-[#EDEDED] cursor-pointer transition-colors"
            title="Click to select Mark Price"
          >
            {formatPrice(markPrice)}
          </button>
        </div>
        <div className="text-xs font-mono text-[#8A8A8A] flex items-center gap-1">
          <span className="text-[11px] font-sans text-[#5E6673]">Spread</span>
          <span>{formatPrice(spread)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-xs select-none border-b border-[#242D35]">
      {/* 1. Header Toolbar */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-[#242D35]">
        <span className="font-sans font-semibold text-[#EDEDED] text-xs">Order Book</span>

        {/* Controls: Mode toggles, precision, more */}
        <div className="flex items-center gap-1.5">
          {/* Mode Toggles */}
          <div className="flex items-center gap-0.5 bg-[#0E0E0E] p-0.5 rounded border border-[#242D35]">
            {/* Both */}
            <button
              type="button"
              onClick={() => setViewMode("both")}
              className={`p-1 rounded flex flex-col gap-0.5 w-5 h-5 justify-center items-center transition-colors cursor-pointer ${
                viewMode === "both" ? "bg-[#1C1C1C] text-white" : "text-[#8A8A8A] hover:bg-[#1C1C1C]/50"
              }`}
              title="Default (Buy & Sell Orders)"
            >
              <div className="w-3 h-1 bg-[#FF3B30] rounded-[0.5px]" />
              <div className="w-3 h-1 bg-[#00E676] rounded-[0.5px]" />
            </button>

            {/* Bids only */}
            <button
              type="button"
              onClick={() => setViewMode("bids")}
              className={`p-1 rounded flex flex-col gap-0.5 w-5 h-5 justify-center items-center transition-colors cursor-pointer ${
                viewMode === "bids" ? "bg-[#1C1C1C] text-white" : "text-[#8A8A8A] hover:bg-[#1C1C1C]/50"
              }`}
              title="Buy Orders Only"
            >
              <div className="w-3 h-1 bg-[#00E676] rounded-[0.5px]" />
              <div className="w-3 h-1 bg-[#00E676] rounded-[0.5px]" />
            </button>

            {/* Asks only */}
            <button
              type="button"
              onClick={() => setViewMode("asks")}
              className={`p-1 rounded flex flex-col gap-0.5 w-5 h-5 justify-center items-center transition-colors cursor-pointer ${
                viewMode === "asks" ? "bg-[#1C1C1C] text-white" : "text-[#8A8A8A] hover:bg-[#1C1C1C]/50"
              }`}
              title="Sell Orders Only"
            >
              <div className="w-3 h-1 bg-[#FF3B30] rounded-[0.5px]" />
              <div className="w-3 h-1 bg-[#FF3B30] rounded-[0.5px]" />
            </button>
          </div>

          {/* Tick Precision Dropdown */}
          <div className="relative" ref={precisionRef}>
            <button
              type="button"
              onClick={() => setIsPrecisionOpen((prev) => !prev)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0E0E0E] border border-[#242D35] text-xs font-mono text-[#8A8A8A] hover:text-[#EDEDED] hover:border-[#474D57] transition-colors cursor-pointer"
              title="Tick Precision"
            >
              <span>{precision}</span>
              <ChevronDown size={11} className={`transition-transform duration-150 ${isPrecisionOpen ? "rotate-180" : ""}`} />
            </button>

            {isPrecisionOpen && (
              <div className="absolute right-0 top-full mt-1 w-20 py-1 bg-[#0E0E0E] border border-[#242D35] rounded shadow-xl z-50">
                {PRECISION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setPrecision(opt);
                      setIsPrecisionOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                      precision === opt
                        ? "text-[#00E5FF] bg-[#1C1C1C]/50 font-medium"
                        : "text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1C]/30"
                    }`}
                  >
                    <span>{opt}</span>
                    {precision === opt && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="p-1 text-[#8A8A8A] hover:text-white rounded hover:bg-[#1C1C1C] transition-colors cursor-pointer"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* 2. Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1 text-xs font-sans text-[#8A8A8A] border-b border-[#242D35]/50">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Size (USDT)</div>
        <div className="text-right">Sum (USDT)</div>
      </div>

      {/* 3. Table Rows Container */}
      <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden font-mono text-xs">
        {viewMode === "bids" && renderSpreadRow()}

        {/* Asks (Sell Orders - Red #FF3B30) */}
        {visibleAsks.length > 0 && (
          <div className="flex flex-col justify-end space-y-[1px]">
            {visibleAsks.map((row, idx) => {
              const depthPercent =
                row.depthPercent > 0
                  ? Math.min(100, Math.max(2, row.depthPercent))
                  : Math.min(100, Math.max(2, Math.round(((row.sum || row.size) / maxDepthSum) * 100)));

              return (
                <div
                  key={`ask-${idx}-${row.price}`}
                  onClick={() => onSelectPrice?.(row.price)}
                  className="grid grid-cols-3 px-3 py-[1px] relative hover:bg-[#1C1C1C]/40 cursor-pointer group leading-tight"
                >
                  {/* Visual Depth Percentage Bar (#FF3B30 for asks) */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#FF3B30]/15 group-hover:bg-[#FF3B30]/25 pointer-events-none transition-all duration-150 ease-out"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <div className="text-left text-[#FF3B30] font-medium z-10">
                    {formatPrice(row.price)}
                  </div>
                  <div className="text-right text-[#EDEDED] z-10">
                    {formatSize(row.size)}
                  </div>
                  <div className="text-right text-[#8A8A8A] z-10">
                    {formatSize(row.sum)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "both" && renderSpreadRow()}

        {/* Bids (Buy Orders - Green #00E676) */}
        {visibleBids.length > 0 && (
          <div className="flex flex-col space-y-[1px]">
            {visibleBids.map((row, idx) => {
              const depthPercent =
                row.depthPercent > 0
                  ? Math.min(100, Math.max(2, row.depthPercent))
                  : Math.min(100, Math.max(2, Math.round(((row.sum || row.size) / maxDepthSum) * 100)));

              return (
                <div
                  key={`bid-${idx}-${row.price}`}
                  onClick={() => onSelectPrice?.(row.price)}
                  className="grid grid-cols-3 px-3 py-[1px] relative hover:bg-[#1C1C1C]/40 cursor-pointer group leading-tight"
                >
                  {/* Visual Depth Percentage Bar (#00E676 for bids) */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#00E676]/15 group-hover:bg-[#00E676]/25 pointer-events-none transition-all duration-150 ease-out"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <div className="text-left text-[#00E676] font-medium z-10">
                    {formatPrice(row.price)}
                  </div>
                  <div className="text-right text-[#EDEDED] z-10">
                    {formatSize(row.size)}
                  </div>
                  <div className="text-right text-[#8A8A8A] z-10">
                    {formatSize(row.sum)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "asks" && renderSpreadRow()}
      </div>
    </div>
  );
}
