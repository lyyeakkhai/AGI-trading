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
  Shield,
  Activity,
  Bot,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function BinanceFuturesHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { label: "Overview", href: "/overview", hasChevron: false },
    { label: "Markets", href: "/markets", hasChevron: false },
    { label: "Futures", href: "/trade", hasChevron: true, active: true },
    { label: "Hermes AI", href: "/hermes", hasChevron: false },
    { label: "Opportunities", href: "/opportunities", hasChevron: false },
    { label: "Execution", href: "/execution", hasChevron: false },
    { label: "Risk Guard", href: "/risk", hasChevron: false },
    { label: "Analytics", href: "/analytics", hasChevron: false },
  ];

  return (
    <header className="h-12 bg-[#000000] border-b border-[#242D35] px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left side: AGI Brand Logo + Platform Navigation */}
      <div className="flex items-center gap-4">
        {/* Return to AGI Overview */}
        <Link
          href="/overview"
          className="p-1 rounded hover:bg-[#1C1C1C] text-[#8A8A8A] hover:text-[#00E5FF] transition-colors"
          title="Return to AGI Overview"
        >
          <ArrowLeft size={16} />
        </Link>

        {/* AGI Futures Brand Logo */}
        <Link href="/trade" className="flex items-center gap-2 group">
          <BrandLogo size="sm" variant="vector" />
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black tracking-tight text-[#EDEDED] text-[13px] group-hover:text-white transition-colors">
                AGI
              </span>
              <span className="font-mono font-bold text-[#00E5FF] text-[11px] tracking-wider uppercase">
                FUTURES
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#0A5965]/40 text-[#00E5FF] text-[9px] font-mono font-bold border border-[#00E5FF]/30">
                PRO DESK
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden xl:flex items-center gap-1 text-[12px] font-sans ml-2">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.hasChevron && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded transition-colors ${
                  item.active
                    ? "text-[#00E5FF] font-semibold bg-[#00E5FF]/10"
                    : "text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1C]"
                }`}
              >
                <span>{item.label}</span>
                {item.hasChevron && <ChevronDown size={11} className="opacity-70" />}
              </Link>

              {activeDropdown === item.label && item.hasChevron && (
                <div className="absolute top-full left-0 mt-0.5 w-44 bg-[#0E0E0E] border border-[#242D35] rounded shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] text-[#8A8A8A] font-mono border-b border-[#242D35] uppercase">
                    AGI Execution Desks
                  </div>
                  <Link
                    href="/trade"
                    className="w-full block text-left px-3 py-2 text-[12px] text-[#00E5FF] font-medium bg-[#141414] hover:bg-[#1C1C1C]"
                  >
                    USDⓈ-M Futures
                  </Link>
                  <Link
                    href="/markets"
                    className="w-full block text-left px-3 py-2 text-[12px] text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1C]"
                  >
                    Spot & Multi-Asset
                  </Link>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right side utilities: Telemetry & User Controls */}
      <div className="flex items-center gap-2 sm:gap-3 text-[#8A8A8A]">
        {/* Risk Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A5965]/20 border border-[#00E5FF]/20 text-[11px] font-mono text-[#00E5FF]">
          <Shield size={12} className="text-[#00E5FF]" />
          <span>Risk Engine: Active</span>
        </div>

        {/* Hermes Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-[#141414] border border-[#242D35] text-[11px] font-mono text-[#00E676]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
          <span>Hermes 78% Bullish</span>
        </div>

        <button
          type="button"
          className="p-1.5 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
          title="Account / Profile"
        >
          <User size={15} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
          title="Assets / Margin Balance"
        >
          <Wallet size={15} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
          title="Execution Orders"
        >
          <FileText size={15} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
          title="Layout Settings"
        >
          <Grid size={15} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
          title="System Notifications"
        >
          <Bell size={15} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
          title="Trading Terminal Preferences"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
