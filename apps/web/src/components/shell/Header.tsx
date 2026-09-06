"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

function PageTitle() {
  const pathname = usePathname();
  const path = pathname.split("/")[1] || "";

  const title =
    path === "agent" || path === "hermes"
      ? "Hermes AI"
      : path === "trade-proposals" || path === "proposals"
      ? "Trade Proposals"
      : path === "risk"
      ? "Risk Engine"
      : path === "backtests"
      ? "Backtest Registry"
      : path === "analytics"
      ? "Performance Analytics"
      : path === "activity"
      ? "Activity & Audit"
      : path === "settings"
      ? "System Configuration"
      : path === "opportunities"
      ? "Opportunity Detection"
      : path === "positions"
      ? "Positions & Portfolio"
      : path === "strategies"
      ? "Strategy Registry"
      : path === "markets"
      ? "Markets & Chart"
      : path
      ? path.charAt(0).toUpperCase() + path.slice(1)
      : "Command Center";

  return <div className="text-sm sm:text-base font-semibold text-gray-100 tracking-tight">{title}</div>;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  return (
    <header className="h-14 bg-gradient-to-r from-[#101417] via-[#090C0E] to-[#0D1013] border-b border-[#222B32] flex items-center justify-between px-3 sm:px-5 flex-shrink-0 z-20">
      <div className="flex items-center gap-3 truncate mr-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-2 border border-[#222B32] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <div className="md:hidden flex items-center">
          <BrandLogo size="sm" variant="emblem" />
        </div>
        <PageTitle />
        <div className="hidden lg:block w-px h-4 bg-[#222B32] mx-1" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <AIStatusIndicator state="MONITORING" size="sm" />
        <div className="hidden lg:block">
          <StatusIndicator status="online" size="sm" label="ONLINE" />
        </div>
        <div className="hidden sm:block w-px h-3.5 bg-[#222B32]" />
        <EnvironmentBadge mode="PAPER" />
      </div>
    </header>
  );
}
