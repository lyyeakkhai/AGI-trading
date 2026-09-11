"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  User,
  Wallet,
  FileText,
  Grid,
  Globe,
  Headphones,
  Bell,
  Settings,
  ArrowLeft,
} from "lucide-react";

export function BinanceFuturesHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { label: "Futures", hasChevron: true },
    { label: "Options", hasChevron: true },
    { label: "Trading Bots", hasChevron: true },
    { label: "Copy Trading", hasChevron: false },
    { label: "Smart Money", hasChevron: false },
    { label: "Campaigns", hasChevron: true },
    { label: "Data", hasChevron: true },
    { label: "More", hasChevron: true },
  ];

  return (
    <header className="h-12 bg-[#181A20] border-b border-[#23272E] px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left side: Brand Logo + Nav links */}
      <div className="flex items-center gap-5">
        {/* Binance Logo and Brand */}
        <div className="flex items-center gap-2">
          {/* Quick return to AGI platform if desired */}
          <Link
            href="/overview"
            className="p-1 rounded hover:bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] transition-colors"
            title="Return to AGI Overview"
          >
            <ArrowLeft size={16} />
          </Link>

          <Link href="/trade" className="flex items-center gap-1.5 group">
            {/* Binance Diamond Logo */}
            <svg
              className="w-5 h-5 text-[#F0B90B] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.5L7.75 6.75L12 11L16.25 6.75L12 2.5Z" />
              <path d="M2.5 12L6.75 7.75L11 12L6.75 16.25L2.5 12Z" />
              <path d="M21.5 12L17.25 7.75L13 12L17.25 16.25L21.5 12Z" />
              <path d="M12 21.5L16.25 17.25L12 13L7.75 17.25L12 21.5Z" />
              <path d="M12 14.5L14.5 12L12 9.5L9.5 12L12 14.5Z" />
            </svg>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-sans font-black tracking-tight text-white text-[13px]">
                  BINANCE
                </span>
                <span className="font-sans font-bold text-[#F0B90B] text-[10px] tracking-wider uppercase">
                  FUTURES
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="hidden xl:flex items-center gap-1 text-[12px] font-sans">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.hasChevron && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]/50 transition-colors ${
                  item.label === "Futures" ? "text-[#EAECEF] font-semibold" : ""
                }`}
              >
                <span>{item.label}</span>
                {item.hasChevron && <ChevronDown size={12} className="opacity-70" />}
              </button>

              {activeDropdown === item.label && item.hasChevron && (
                <div className="absolute top-full left-0 mt-0.5 w-44 bg-[#1E2329] border border-[#2B313A] rounded shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] text-[#848E9C] font-mono border-b border-[#2B313A]">
                    {item.label} Markets
                  </div>
                  <button className="w-full text-left px-3 py-2 text-[12px] text-[#EAECEF] hover:bg-[#2B313A]">
                    USDⓈ-M Futures
                  </button>
                  <button className="w-full text-left px-3 py-2 text-[12px] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B313A]">
                    COIN-M Futures
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center gap-2 sm:gap-3 text-[#848E9C]">
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="Account / Profile"
        >
          <User size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="Assets / Wallet"
        >
          <Wallet size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="Orders"
        >
          <FileText size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="Layout Settings"
        >
          <Grid size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="Language & Currency"
        >
          <Globe size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="24/7 Support"
        >
          <Headphones size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="Notifications"
        >
          <Bell size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#EAECEF] hover:bg-[#2B313A] rounded transition-colors"
          title="Preferences"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
