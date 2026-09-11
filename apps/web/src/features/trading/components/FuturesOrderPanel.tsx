"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  ArrowRightLeft,
  ChevronDown,
  Edit3,
  X,
} from "lucide-react";
import { MarginMode, FuturesOrderType, TimeInForce } from "../types/binanceFutures";

interface FuturesOrderPanelProps {
  currentPrice: number;
}

export function FuturesOrderPanel({ currentPrice }: FuturesOrderPanelProps) {
  // Margin and Leverage states
  const [marginMode, setMarginMode] = useState<MarginMode>("cross");
  const [leverage, setLeverage] = useState<number>(5);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showMarginModal, setShowMarginModal] = useState(false);

  // Order configuration
  const [orderType, setOrderType] = useState<FuturesOrderType>("limit");
  const [price, setPrice] = useState<string>("77803.9");
  const [size, setSize] = useState<string>("");
  const [sizeUnit, setSizeUnit] = useState<"USDT" | "BTC">("USDT");
  const [sliderPercent, setSliderPercent] = useState<number>(0);

  // Checkboxes
  const [isTpSl, setIsTpSl] = useState(false);
  const [tpPrice, setTpPrice] = useState("");
  const [slPrice, setSlPrice] = useState("");
  const [isReduceOnly, setIsReduceOnly] = useState(false);
  const [tif] = useState<TimeInForce>("GTC");

  // Temporary leverage modal slider state
  const [tempLeverage, setTempLeverage] = useState<number>(5);

  const handleBboClick = () => {
    setPrice(currentPrice.toFixed(1));
  };

  const handlePercentClick = (percent: number) => {
    setSliderPercent(percent);
    // Simulate calculating size based on available balance (or dummy 1000 USDT)
    const simulatedAvbl = 1000;
    const calcSize = ((simulatedAvbl * leverage * (percent / 100))).toFixed(2);
    setSize(calcSize === "0.00" ? "" : calcSize);
  };

  return (
    <div className="flex flex-col bg-[#181A20] text-xs select-none border-b border-[#23272E] p-3 space-y-3 font-sans">
      {/* 1. Top Margin & Leverage Bar */}
      <div className="grid grid-cols-3 gap-1.5 font-mono text-[12px]">
        {/* Margin Mode Button */}
        <button
          type="button"
          onClick={() => setShowMarginModal(true)}
          className="flex items-center justify-center py-1 rounded bg-[#2B313A] hover:bg-[#2B313A]/80 text-[#EAECEF] font-semibold transition-colors capitalize"
        >
          {marginMode}
        </button>

        {/* Leverage Button */}
        <button
          type="button"
          onClick={() => {
            setTempLeverage(leverage);
            setShowLeverageModal(true);
          }}
          className="flex items-center justify-center py-1 rounded bg-[#2B313A] hover:bg-[#2B313A]/80 text-[#EAECEF] font-semibold transition-colors"
        >
          {leverage}x
        </button>

        {/* Single-Asset Mode Button */}
        <button
          type="button"
          className="flex items-center justify-center py-1 rounded bg-[#2B313A] hover:bg-[#2B313A]/80 text-[#EAECEF] font-semibold transition-colors"
          title="Single-Asset Mode"
        >
          S
        </button>
      </div>

      {/* 2. Order Type Tabs & Settings */}
      <div className="flex items-center justify-between border-b border-[#23272E] pb-2 text-[12px]">
        <div className="flex items-center gap-4">
          {(["limit", "market", "conditional"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`capitalize font-semibold transition-colors ${
                orderType === type
                  ? "text-[#EAECEF] border-b-2 border-[#F0B90B] pb-1 -mb-[9px]"
                  : "text-[#848E9C] hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="p-1 text-[#848E9C] hover:text-white rounded hover:bg-[#2B313A] transition-colors"
          title="Order Settings"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* 3. Available Balance Row */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-[#848E9C]">Avbl</span>
        <div className="flex items-center gap-1">
          <span className="text-[#EAECEF] font-medium">0.00 USDT</span>
          <button
            type="button"
            className="text-[#F0B90B] hover:opacity-80 transition-opacity"
            title="Transfer assets"
          >
            <ArrowRightLeft size={12} />
          </button>
        </div>
      </div>

      {/* 4. Price Input */}
      {orderType !== "market" && (
        <div className="flex items-center justify-between bg-[#2B313A]/40 border border-[#2B313A] rounded px-2.5 py-1.5 font-mono text-[12px] focus-within:border-[#F0B90B] transition-colors">
          <span className="text-[#848E9C] text-[11px] select-none font-sans">Price</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-transparent text-right text-white focus:outline-none w-28 font-medium"
            />
            <span className="text-[#848E9C] text-[11px]">USDT</span>
            <button
              type="button"
              onClick={handleBboClick}
              className="px-1.5 py-0.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-[10px] text-[#848E9C] hover:text-white transition-colors"
              title="Best Bid Offer"
            >
              BBO
            </button>
          </div>
        </div>
      )}

      {/* 5. Size Input */}
      <div className="flex items-center justify-between bg-[#2B313A]/40 border border-[#2B313A] rounded px-2.5 py-1.5 font-mono text-[12px] focus-within:border-[#F0B90B] transition-colors">
        <span className="text-[#848E9C] text-[11px] select-none font-sans">Size</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0"
            className="bg-transparent text-right text-white placeholder-[#848E9C] focus:outline-none w-28 font-medium"
          />
          <button
            type="button"
            onClick={() => setSizeUnit(sizeUnit === "USDT" ? "BTC" : "USDT")}
            className="flex items-center gap-0.5 text-[#848E9C] hover:text-white text-[11px]"
          >
            <span>{sizeUnit}</span>
            <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {/* 6. Percentage Slider with 5 Diamond Stops */}
      <div className="pt-2 pb-1">
        <div className="relative flex items-center h-4 select-none">
          {/* Slider track line */}
          <div className="absolute left-0 right-0 h-[2px] bg-[#2B313A]" />
          <div
            className="absolute left-0 h-[2px] bg-[#F0B90B] transition-all duration-150"
            style={{ width: `${sliderPercent}%` }}
          />

          {/* 5 Diamond Milestone Stops: 0%, 25%, 50%, 75%, 100% */}
          {[0, 25, 50, 75, 100].map((stop) => {
            const isReached = sliderPercent >= stop;
            return (
              <button
                key={stop}
                type="button"
                onClick={() => handlePercentClick(stop)}
                className={`absolute w-2 h-2 rotate-45 -ml-1 border transition-all duration-150 ${
                  isReached
                    ? "bg-[#F0B90B] border-[#F0B90B] scale-110"
                    : "bg-[#181A20] border-[#2B313A] hover:border-[#848E9C]"
                }`}
                style={{ left: `${stop}%` }}
                title={`${stop}%`}
              />
            );
          })}
        </div>
      </div>

      {/* 7. Conditions & Flags Checkboxes */}
      <div className="space-y-1.5 text-[11px] text-[#848E9C]">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#EAECEF]">
            <input
              type="checkbox"
              checked={isTpSl}
              onChange={(e) => setIsTpSl(e.target.checked)}
              className="w-3 h-3 rounded bg-[#2B313A] border-[#474D57] text-[#F0B90B] focus:ring-0"
            />
            <span>TP/SL</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#EAECEF]">
            <input
              type="checkbox"
              checked={isReduceOnly}
              onChange={(e) => setIsReduceOnly(e.target.checked)}
              className="w-3 h-3 rounded bg-[#2B313A] border-[#474D57] text-[#F0B90B] focus:ring-0"
            />
            <span>Reduce-Only</span>
          </label>

          <span className="font-mono text-[10px] text-[#848E9C]">TIF {tif}</span>
        </div>

        {/* Expandable TP/SL Inputs */}
        {isTpSl && (
          <div className="space-y-1.5 pt-1 font-mono">
            <div className="flex items-center justify-between bg-[#2B313A]/30 border border-[#2B313A] rounded px-2 py-1">
              <span className="text-[10px] text-[#0ECB81]">Take Profit</span>
              <input
                type="text"
                value={tpPrice}
                onChange={(e) => setTpPrice(e.target.value)}
                placeholder="TP Price"
                className="bg-transparent text-right text-white placeholder-[#848E9C] w-24 text-[11px] focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between bg-[#2B313A]/30 border border-[#2B313A] rounded px-2 py-1">
              <span className="text-[10px] text-[#F6465D]">Stop Loss</span>
              <input
                type="text"
                value={slPrice}
                onChange={(e) => setSlPrice(e.target.value)}
                placeholder="SL Price"
                className="bg-transparent text-right text-white placeholder-[#848E9C] w-24 text-[11px] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 8. Dual Action Buttons: Buy/Long and Sell/Short */}
      <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
        <button
          type="button"
          className="w-full py-2.5 rounded bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white font-bold text-[13px] transition-colors shadow-lg active:scale-[0.98]"
        >
          Buy/Long
        </button>

        <button
          type="button"
          className="w-full py-2.5 rounded bg-[#F6465D] hover:bg-[#F6465D]/90 text-white font-bold text-[13px] transition-colors shadow-lg active:scale-[0.98]"
        >
          Sell/Short
        </button>
      </div>

      {/* 9. Order Cost Calculations Row */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#848E9C] pt-1 border-t border-[#23272E]">
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span>Liq Price</span>
            <span className="text-[#EAECEF]">-- USDT</span>
          </div>
          <div className="flex justify-between">
            <span>Cost</span>
            <span className="text-[#EAECEF]">0.00 USDT</span>
          </div>
          <div className="flex justify-between">
            <span>Max</span>
            <span className="text-[#EAECEF]">0.00 USDT</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span>Liq Price</span>
            <span className="text-[#EAECEF]">-- USDT</span>
          </div>
          <div className="flex justify-between">
            <span>Cost</span>
            <span className="text-[#EAECEF]">0.00 USDT</span>
          </div>
          <div className="flex justify-between">
            <span>Max</span>
            <span className="text-[#EAECEF]">0.00 USDT</span>
          </div>
        </div>
      </div>

      {/* 10. Fee Level & Quiz CTA Card */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] text-[#848E9C]">
          <span className="text-[#F0B90B] cursor-pointer hover:underline">% Fee level</span>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded bg-[#2B313A]/50 hover:bg-[#2B313A] border border-[#2B313A] text-white text-[12px] font-medium transition-colors group"
        >
          <Edit3 size={14} className="text-[#F0B90B]" />
          <span>Finish Quiz to Get Started</span>
        </button>
      </div>

      {/* Modal: Adjust Leverage */}
      {showLeverageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Adjust Leverage</h3>
              <button
                type="button"
                onClick={() => setShowLeverageModal(false)}
                className="text-[#848E9C] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center font-mono text-2xl font-bold text-[#F0B90B]">
              {tempLeverage}x
            </div>

            <input
              type="range"
              min={1}
              max={125}
              value={tempLeverage}
              onChange={(e) => setTempLeverage(Number(e.target.value))}
              className="w-full accent-[#F0B90B]"
            />

            <div className="text-[11px] text-[#848E9C]">
              Selecting higher leverage such as [10x+] increases your liquidation risk. Always manage your position size carefully.
            </div>

            <button
              type="button"
              onClick={() => {
                setLeverage(tempLeverage);
                setShowLeverageModal(false);
              }}
              className="w-full py-2 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Modal: Margin Mode */}
      {showMarginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Margin Mode</h3>
              <button
                type="button"
                onClick={() => setShowMarginModal(false)}
                className="text-[#848E9C] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMarginMode("cross");
                  setShowMarginModal(false);
                }}
                className={`p-3 rounded border text-left transition-colors ${
                  marginMode === "cross"
                    ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white"
                    : "border-[#2B313A] text-[#848E9C] hover:text-white"
                }`}
              >
                <div className="font-bold text-sm">Cross</div>
                <div className="text-[10px] mt-1 opacity-80">
                  Shared margin across positions.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMarginMode("isolated");
                  setShowMarginModal(false);
                }}
                className={`p-3 rounded border text-left transition-colors ${
                  marginMode === "isolated"
                    ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white"
                    : "border-[#2B313A] text-[#848E9C] hover:text-white"
                }`}
              >
                <div className="font-bold text-sm">Isolated</div>
                <div className="text-[10px] mt-1 opacity-80">
                  Risk capped to individual position.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
