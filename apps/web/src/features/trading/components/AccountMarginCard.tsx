"use client";

import React from "react";
import { ArrowRightLeft, AlertCircle } from "lucide-react";

export function AccountMarginCard() {
  return (
    <div className="flex flex-col bg-[#181A20] p-3 text-xs select-none space-y-3 font-sans">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#EAECEF] text-[13px]">Account</span>
        <button
          type="button"
          className="flex items-center gap-1 text-[#F0B90B] hover:opacity-80 transition-opacity font-medium text-[11px]"
        >
          <ArrowRightLeft size={12} />
          <span>Switch</span>
        </button>
      </div>

      {/* 2. Margin Ratio Gauge Row */}
      <div className="flex items-center justify-between border-b border-[#23272E] pb-2">
        <span className="text-[#848E9C] text-[11px]">Margin Ratio</span>
        <div className="flex items-center gap-1.5 font-mono">
          {/* Circular/Arc Gauge Indicator */}
          <div className="relative w-4 h-4 flex items-center justify-center">
            <svg className="w-4 h-4 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#2B313A]"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#0ECB81]"
                strokeDasharray="0, 100"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <span className="text-[#0ECB81] font-semibold text-[12px]">0.00%</span>
        </div>
      </div>

      {/* 3. Maintenance Margin & Margin Balance */}
      <div className="space-y-1 text-[11px] font-mono">
        <div className="flex items-center justify-between text-[#848E9C]">
          <span>Maintenance Margin</span>
          <span className="text-[#EAECEF]">0.0000 USDT</span>
        </div>
        <div className="flex items-center justify-between text-[#848E9C]">
          <span>Margin Balance</span>
          <span className="text-[#EAECEF]">0.0000 USDT</span>
        </div>
      </div>

      {/* 4. Single-Asset Mode Button */}
      <div>
        <button
          type="button"
          className="w-full py-1.5 rounded bg-[#2B313A]/50 hover:bg-[#2B313A] border border-[#2B313A] text-[#EAECEF] text-[11px] font-medium transition-colors text-center"
        >
          Single-Asset Mode
        </button>
      </div>

      {/* 5. Transfer / Onboarding Callout Card */}
      <div className="p-2.5 rounded bg-[#1E2329] border border-[#2B313A] space-y-2.5">
        <div className="flex items-start gap-2 text-[#848E9C] text-[11px] leading-relaxed">
          <AlertCircle size={15} className="text-[#F0B90B] shrink-0 mt-0.5" />
          <span>To start trading, please transfer assets to your Futures account.</span>
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 text-[11px] font-medium font-sans">
          <button
            type="button"
            className="py-1 rounded bg-[#2B313A] hover:bg-[#363D47] text-white transition-colors text-center"
          >
            Transfer
          </button>
          <button
            type="button"
            className="py-1 rounded bg-[#2B313A] hover:bg-[#363D47] text-white transition-colors text-center"
          >
            Buy Crypto
          </button>
          <button
            type="button"
            className="py-1 rounded bg-[#2B313A] hover:bg-[#363D47] text-white transition-colors text-center"
          >
            Swap
          </button>
        </div>
      </div>
    </div>
  );
}
