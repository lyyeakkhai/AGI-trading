"use client";

import React from "react";
import { Wifi, WifiOff } from "lucide-react";
import { TickerMarqueeItem } from "../types/binanceFutures";

interface BottomTickerStripProps {
  connectionStatus?: "connected" | "connecting" | "disconnected";
}

export function BottomTickerStrip({ connectionStatus = "connected" }: BottomTickerStripProps) {
  // Live crypto pairs featuring the exact tickers and percentage changes requested
  const pairs: TickerMarqueeItem[] = [
    { symbol: "RAYSOLUSDT", changePercent: 24.33, price: 1.5959 },
    { symbol: "MARSCOINUSDT", changePercent: 18.64, price: 0.1324 },
    { symbol: "BTCUSDT", changePercent: 1.12, price: 77840.4 },
    { symbol: "SAGAUSDT", changePercent: 7.17, price: 0.01614 },
    { symbol: "ZECUSDT", changePercent: -1.1, price: 1157.07 },
    { symbol: "IOSTUSDT", changePercent: -14.54, price: 0.000937 },
    { symbol: "VTHOUSDT", changePercent: -5.12, price: 0.00215 },
    { symbol: "SOLUSDT", changePercent: 4.21, price: 188.45 },
    { symbol: "ETHUSDT", changePercent: 2.85, price: 3124.5 },
    { symbol: "DOGEUSDT", changePercent: 6.48, price: 0.1842 },
    { symbol: "BNBUSDT", changePercent: 1.45, price: 624.8 },
    { symbol: "NEARUSDT", changePercent: -3.22, price: 4.891 },
  ];

  // Duplicated list for seamless 60fps infinite marquee loop
  const marqueeItems = [...pairs, ...pairs];

  const footerLinks = [
    "Campaign Center",
    "Announcements",
    "Disclaimer",
    "Futures Chatroom",
    "Cookie Preferences",
  ];

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    }
    if (price < 0.01) {
      return price.toFixed(6);
    }
    return price.toFixed(4);
  };

  return (
    <footer className="h-7 min-h-[28px] max-h-[28px] bg-[#12161A] border-t border-[#23272E] flex items-center justify-between text-[11px] font-mono select-none overflow-hidden z-20 shrink-0 relative">
      <style>{`
        @keyframes bottomTickerMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .bottom-ticker-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: bottomTickerMarquee 38s linear infinite;
          will-change: transform;
        }
        .bottom-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. Left: Glowing Green Stable Connection Dot & Wifi Icon */}
      <div className="flex items-center gap-2 shrink-0 px-3 h-full border-r border-[#23272E] bg-[#12161A] z-10">
        <div className="relative flex items-center justify-center">
          {connectionStatus === "connected" ? (
            <>
              <span className="absolute w-2.5 h-2.5 rounded-full bg-[#0ECB81]/40 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] shadow-[0_0_8px_#0ECB81]" />
            </>
          ) : connectionStatus === "connecting" ? (
            <span className="w-2 h-2 rounded-full bg-[#F0B90B] shadow-[0_0_6px_#F0B90B] animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#F6465D] shadow-[0_0_6px_#F6465D]" />
          )}
        </div>

        <span
          className={`font-sans text-[11px] font-medium tracking-tight select-none whitespace-nowrap hidden sm:inline ${
            connectionStatus === "connected"
              ? "text-[#0ECB81]"
              : connectionStatus === "connecting"
              ? "text-[#F0B90B]"
              : "text-[#F6465D]"
          }`}
        >
          {connectionStatus === "connected"
            ? "Stable connection"
            : connectionStatus === "connecting"
            ? "Connecting..."
            : "Disconnected"}
        </span>

        {connectionStatus === "disconnected" ? (
          <WifiOff size={12} className="text-[#F6465D] opacity-90 shrink-0" />
        ) : (
          <Wifi
            size={12}
            className={`shrink-0 ${
              connectionStatus === "connected" ? "text-[#0ECB81]" : "text-[#F0B90B]"
            } opacity-90`}
          />
        )}
      </div>

      {/* 2. Center: Continuous Scrolling Marquee with Live Crypto Pairs */}
      <div className="flex-1 overflow-hidden h-full flex items-center px-2 relative mask-radial">
        <div className="bottom-ticker-track">
          {marqueeItems.map((p, index) => {
            const isPos = p.changePercent >= 0;
            return (
              <div
                key={`${p.symbol}-${index}`}
                className="flex items-center gap-1.5 shrink-0 px-3 cursor-pointer group"
                title={`${p.symbol}: ${isPos ? "+" : ""}${p.changePercent.toFixed(2)}% | ${formatPrice(p.price)}`}
              >
                <span className="text-[#848E9C] group-hover:text-[#EAECEF] transition-colors font-medium">
                  {p.symbol}
                </span>
                <span
                  className={`font-semibold ${
                    isPos ? "text-[#0ECB81]" : "text-[#F6465D]"
                  }`}
                >
                  {isPos ? "+" : ""}
                  {p.changePercent.toFixed(2)}%
                </span>
                <span className="text-[#EAECEF] tabular-nums">
                  {formatPrice(p.price)}
                </span>
                <span className="text-[#2B313A] ml-2 select-none">|</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Right: Footer Navigation Links */}
      <div className="hidden lg:flex items-center gap-4 xl:gap-5 px-3 shrink-0 border-l border-[#23272E] h-full font-sans text-[11px] text-[#848E9C] bg-[#12161A] z-10 select-none">
        {footerLinks.map((link) => (
          <button
            key={link}
            type="button"
            className="hover:text-[#EAECEF] transition-colors whitespace-nowrap cursor-pointer focus:outline-none"
          >
            {link}
          </button>
        ))}
      </div>
    </footer>
  );
}
