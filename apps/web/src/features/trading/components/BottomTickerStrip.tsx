"use client";

import React from "react";
import { Wifi } from "lucide-react";
import { TickerMarqueeItem } from "../types/binanceFutures";

interface BottomTickerStripProps {
  connectionStatus?: "connected" | "connecting" | "disconnected";
}

export function BottomTickerStrip({ connectionStatus = "connected" }: BottomTickerStripProps) {
  const pairs: TickerMarqueeItem[] = [
    { symbol: "RAYSOLUSDT", changePercent: 24.33, price: 1.5959 },
    { symbol: "MARSCOINUSDT", changePercent: 18.64, price: 0.1324 },
    { symbol: "BTCUSDT", changePercent: 1.12, price: 77840.4 },
    { symbol: "SAGAUSDT", changePercent: 7.17, price: 0.01614 },
    { symbol: "ZECUSDT", changePercent: -1.1, price: 1157.07 },
    { symbol: "IOSTUSDT", changePercent: -14.54, price: 0.000937 },
    { symbol: "VTHOUSDT", changePercent: -5.12, price: 0.00215 },
  ];

  const footerLinks = [
    "Campaign Center",
    "Announcements",
    "Disclaimer",
    "Futures Chatroom",
    "Cookie Preferences",
  ];

  return (
    <footer className="h-7 bg-[#12161A] border-t border-[#23272E] px-3 flex items-center justify-between text-[11px] font-mono select-none overflow-hidden z-20 shrink-0">
      {/* Left: Connection Status */}
      <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-[#23272E]">
        <span
          className={`w-2 h-2 rounded-full ${
            connectionStatus === "connected"
              ? "bg-[#0ECB81] shadow-[0_0_6px_#0ECB81]"
              : "bg-[#F0B90B] animate-pulse"
          }`}
        />
        <span className="text-[#0ECB81] font-sans text-[11px] font-medium hidden sm:inline">
          Stable connection
        </span>
        <Wifi size={11} className="text-[#0ECB81] opacity-80" />
      </div>

      {/* Center: Live Pairs Ticker Tape */}
      <div className="flex-1 overflow-hidden px-3">
        <div className="flex items-center gap-6 whitespace-nowrap overflow-x-auto no-scrollbar">
          {pairs.map((p) => {
            const isPos = p.changePercent >= 0;
            return (
              <div key={p.symbol} className="flex items-center gap-1.5 shrink-0">
                <span className="text-[#848E9C] hover:text-white cursor-pointer transition-colors font-medium">
                  {p.symbol}
                </span>
                <span className={`font-semibold ${isPos ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                  {isPos ? "+" : ""}
                  {p.changePercent.toFixed(2)}%
                </span>
                <span className="text-[#EAECEF]">{p.price}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Quick Links */}
      <div className="hidden lg:flex items-center gap-4 text-[#848E9C] font-sans text-[11px] shrink-0 pl-3 border-l border-[#23272E]">
        {footerLinks.map((link) => (
          <button
            key={link}
            type="button"
            className="hover:text-white transition-colors cursor-pointer"
          >
            {link}
          </button>
        ))}
      </div>
    </footer>
  );
}
