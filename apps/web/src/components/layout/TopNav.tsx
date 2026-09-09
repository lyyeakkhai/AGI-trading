"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";

const navConfig = [
  { href: "/overview", label: "Overview" },
  { href: "/markets", label: "Markets" },
  {
    label: "Trade",
    items: [
      { href: "/trade", label: "Trading Workspace" },
      { href: "/trade?type=spot", label: "Spot" },
      { href: "/trade?type=futures", label: "Futures" },
      { href: "/execution", label: "Orders" },
      { href: "/positions", label: "Positions" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/hermes", label: "Hermes" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/strategies", label: "Strategies" },
      { href: "/research", label: "Research" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { href: "/risk", label: "Risk" },
      { href: "/analytics", label: "Analytics" },
      { href: "/backtests", label: "Backtests" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/live", label: "Execution" },
      { href: "/activity", label: "Activity" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-150 ${
        isActive
          ? "bg-cyan-950/30 text-cyan-400 font-bold"
          : "text-gray-400 hover:text-gray-100 hover:bg-[#151A1E]/70"
      }`}
    >
      {label}
    </Link>
  );
}

function NavDropdown({ label, items, onClickItem }: { label: string; items: { href: string; label: string }[]; onClickItem?: () => void }) {
  const pathname = usePathname();
  const isActive = items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-150 ${
          isActive
            ? "text-cyan-400 font-bold"
            : "text-gray-400 hover:text-gray-100"
        }`}
      >
        {label}
        <ChevronDown size={14} className="opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-[#0D1013] border border-[#222B32] rounded-md shadow-xl py-1 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setIsOpen(false);
                if (onClickItem) onClickItem();
              }}
              className="block px-4 py-2 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-gray-100 hover:bg-[#151A1E]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-gradient-to-r from-[#101417] via-[#090C0E] to-[#0D1013] border-b border-[#222B32] flex items-center justify-between px-4 flex-shrink-0 z-40 relative">
      <div className="flex items-center gap-6">
        <Link href="/overview" className="flex items-center gap-2.5 group">
          <BrandLogo size="md" variant="emblem" />
          <div className="flex flex-col tracking-wider font-mono">
            <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors leading-none">
              AGI
            </span>
            <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors leading-none">
              TRADING
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navConfig.map((item) =>
            item.items ? (
              <NavDropdown key={item.label} label={item.label} items={item.items} />
            ) : (
              <NavLink key={item.href} href={item.href} label={item.label} />
            )
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <AIStatusIndicator state="MONITORING" size="sm" />
        <div className="hidden sm:block w-px h-3.5 bg-[#222B32]" />
        <EnvironmentBadge mode="PAPER" />

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1.5 ml-2 rounded-md text-gray-400 hover:text-white hover:bg-surface-2 border border-[#222B32] transition-colors"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[#0D1013] border-b border-[#222B32] shadow-2xl lg:hidden p-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          {navConfig.map((item) => (
            <div key={item.label || item.href} className="mb-4 last:mb-0">
              {item.items ? (
                <>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-mono font-bold mb-2 px-2">
                    {item.label}
                  </div>
                  <div className="flex flex-col gap-1 pl-2 border-l border-[#222B32] ml-2">
                    {item.items.map((subItem) => (
                      <NavLink
                        key={subItem.href}
                        href={subItem.href}
                        label={subItem.label}
                        onClick={() => setIsMobileMenuOpen(false)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <NavLink
                  href={item.href}
                  label={item.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
