"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Wallet,
  FileText,
  Bell,
  Settings,
  ArrowLeft,
  ChevronDown,
  Megaphone,
  Sliders,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface AgiSpotHeaderProps {
  onToggleAnnouncementsDrawer?: () => void;
}

export function AgiSpotHeader({ onToggleAnnouncementsDrawer }: AgiSpotHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { label: "Overview", href: "/overview" },
    { label: "Markets", href: "/markets" },
    { label: "Spot", href: "/trade?type=spot", active: true },
    { label: "Futures", href: "/trade?type=futures" },
    { label: "Hermes AI", href: "/hermes" },
    { label: "Opportunities", href: "/opportunities" },
    { label: "Execution", href: "/execution" },
    { label: "Risk Guard", href: "/risk" },
  ];

  return (
    <div className="flex flex-col select-none shrink-0 z-30">
      {/* 1. Main Navigation Bar (48px) */}
      <header className="h-12 bg-[#000000] border-b border-[#242D35] px-3 flex items-center justify-between">
        {/* Left side: AGI Logo + Navigation */}
        <div className="flex items-center gap-4">
          <Link
            href="/overview"
            className="p-1 rounded hover:bg-[#1C1C1C] text-[#8A8A8A] hover:text-[#00E5FF] transition-colors"
            title="Return to AGI Overview"
          >
            <ArrowLeft size={16} />
          </Link>

          {/* Logo & Title */}
          <Link href="/trade?type=spot" className="flex items-center gap-2 group">
            <BrandLogo size="sm" variant="vector" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black tracking-tight text-[#EDEDED] text-[13px] group-hover:text-white transition-colors">
                AGI
              </span>
              <span className="font-mono font-bold text-[#00E5FF] text-[11px] tracking-wider uppercase">
                SPOT
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#0A5965]/40 text-[#00E5FF] text-[9px] font-mono font-bold border border-[#00E5FF]/30">
                PRO DESK
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 text-[12px] font-sans ml-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded transition-colors ${
                  item.active
                    ? "text-[#00E5FF] font-semibold bg-[#00E5FF]/10"
                    : "text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141414]"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: Actions & Utilities */}
        <div className="flex items-center gap-2 text-[#8A8A8A]">
          {/* Quick Search */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-[#0E0E0E] border border-[#242D35] text-xs font-mono text-[#8A8A8A]">
            <Search size={13} />
            <span className="text-[11px]">Search coin, pairs</span>
            <kbd className="text-[9px] bg-[#1C1C1C] px-1 rounded text-[#525252]">⌘K</kbd>
          </div>

          {/* Deposit Button */}
          <button
            type="button"
            className="px-3 py-1 rounded bg-[#00E5FF] text-[#000000] hover:bg-[#33EBFF] font-mono font-bold text-xs shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all cursor-pointer"
          >
            Deposit
          </button>

          {/* Wallet */}
          <button
            type="button"
            className="p-1.5 rounded hover:bg-[#1C1C1C] hover:text-[#00E5FF] transition-colors"
            title="Wallet Overview"
          >
            <Wallet size={16} />
          </button>

          {/* Orders */}
          <button
            type="button"
            className="p-1.5 rounded hover:bg-[#1C1C1C] hover:text-[#00E5FF] transition-colors"
            title="Order History"
          >
            <FileText size={16} />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onToggleAnnouncementsDrawer}
            className="p-1.5 rounded hover:bg-[#1C1C1C] hover:text-[#00E5FF] transition-colors relative"
            title="Announcement Settings"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_6px_#00E5FF]" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onToggleAnnouncementsDrawer}
            className="p-1.5 rounded hover:bg-[#1C1C1C] hover:text-[#00E5FF] transition-colors"
            title="Desk Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* 2. Announcement Ticker Sub-Bar (28px) */}
      <div className="h-7 bg-[#0A0A0A] border-b border-[#242D35] px-3 flex items-center justify-between text-[11px] font-mono text-[#8A8A8A] overflow-hidden">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1 text-[#00E5FF] shrink-0 font-semibold text-[10px] uppercase tracking-wider">
            <Megaphone size={12} />
            <span>Bulletin:</span>
          </div>

          <div className="flex items-center gap-6 animate-none whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="hover:text-[#EDEDED] cursor-pointer transition-colors">
              REZ Trading Tournament: Trade to Share Up to 200,000 USDC Token Vouchers (09-11)
            </span>
            <span className="text-[#242D35]">•</span>
            <span className="hover:text-[#EDEDED] cursor-pointer transition-colors">
              AGI Earn: Enjoy Up to 14% APR with Flexible Staking Products (09-11)
            </span>
            <span className="text-[#242D35]">•</span>
            <span className="hover:text-[#EDEDED] cursor-pointer transition-colors">
              AGI Hermes AI 2.0 Autonomous Engine Deployed to Spot Trading Pairs (09-12)
            </span>
          </div>
        </div>

        {/* Right drawer trigger */}
        <button
          type="button"
          onClick={onToggleAnnouncementsDrawer}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#1C1C1C] text-[#8A8A8A] hover:text-[#00E5FF] transition-colors shrink-0 ml-2 cursor-pointer text-[10px]"
          title="Customize Bulletin Notifications"
        >
          <Sliders size={11} />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  );
}
