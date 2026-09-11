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
    "Hermes AI Stream",
    "Risk Guard Engine",
    "Market Share Analytics",
    "Protocol v2.4",
    "Latency: 12ms",
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
    <footer className="h-7 min-h-[28px] max-h-[28px] bg-[#000000] border-t border-[#242D35] flex items-center justify-between text-[11px] font-mono select-none overflow-hidden z-20 shrink-0 relative">
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
      <div className="flex items-center gap-2 shrink-0 px-3 h-full border-r border-[#242D35] bg-[#000000] z-10">
        <div className="relative flex items-center justify-center">
          {connectionStatus === "connected" ? (
            <>
              <span className="absolute w-2.5 h-2.5 rounded-full bg-[#00E676]/40 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676]" />
            </>
          ) : connectionStatus === "connecting" ? (
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] shadow-[0_0_6px_#FF3B30]" />
          )}
        </div>

        <span
          className={`font-sans text-[11px] font-medium tracking-tight select-none whitespace-nowrap hidden sm:inline ${
            connectionStatus === "connected"
              ? "text-[#00E676]"
              : connectionStatus === "connecting"
              ? "text-[#00E5FF]"
              : "text-[#FF3B30]"
          }`}
        >
          {connectionStatus === "connected"
            ? "Stable connection"
            : connectionStatus === "connecting"
            ? "Connecting..."
            : "Disconnected"}
        </span>

        {connectionStatus === "disconnected" ? (
          <WifiOff size={12} className="text-[#FF3B30] opacity-90 shrink-0" />
        ) : (
          <Wifi
            size={12}
            className={`shrink-0 ${
              connectionStatus === "connected" ? "text-[#00E676]" : "text-[#00E5FF]"
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
                <span className="text-[#8A8A8A] group-hover:text-[#EDEDED] transition-colors font-medium">
                  {p.symbol}
                </span>
                <span
                  className={`font-semibold ${
                    isPos ? "text-[#00E676]" : "text-[#FF3B30]"
                  }`}
                >
                  {isPos ? "+" : ""}
                  {p.changePercent.toFixed(2)}%
                </span>
                <span className="text-[#EDEDED] tabular-nums">
                  {formatPrice(p.price)}
                </span>
                <span className="text-[#2B313A] ml-2 select-none">|</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Right: Footer Navigation Links */}
      <div className="hidden lg:flex items-center gap-4 xl:gap-5 px-3 shrink-0 border-l border-[#242D35] h-full font-sans text-[11px] text-[#8A8A8A] bg-[#000000] z-10 select-none">
        {footerLinks.map((link) => (
          <button
            key={link}
            type="button"
            className="hover:text-[#EDEDED] transition-colors whitespace-nowrap cursor-pointer focus:outline-none"
          >
            {link}
          </button>
        ))}
      </div>
    </footer>
  );
}
