"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { marketApi } from "@/lib/marketApi";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Bot,
  Zap,
  Briefcase,
  GitMerge,
  History,
  ShieldAlert,
  BarChart3,
  Activity,
  Settings,
  FileText,
  Workflow,
  Radio,
  X,
  LucideIcon,
} from "lucide-react";
import { CryptoIcon } from "@/components/ui/CryptoIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

function NavigationItem({ href, icon: Icon, label, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/hermes" && pathname.startsWith("/agent")) ||
    (href === "/trade-proposals" && pathname.startsWith("/proposals"));

  return (
    <Link
      href={href}
      title={label}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-150 ${
        isActive
          ? "bg-gradient-to-r from-cyan-950/30 to-[#12161A]/60 text-cyan-400 border border-cyan-500/35 shadow-[inset_0_1px_0_rgba(0,229,255,0.2),0_0_12px_rgba(0,229,255,0.08)] font-bold"
          : "text-gray-400 hover:text-gray-100 hover:bg-[#151A1E]/70 hover:border-[#222B32] border border-transparent font-medium"
      }`}
    >
      <Icon size={18} className={isActive ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]" : "text-gray-400"} />
      <span>{label}</span>
    </Link>
  );
}

function Brand() {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-[#222B32]">
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
    </div>
  );
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const [liveTickers, setLiveTickers] = useState<
    Array<{ symbol: string; pair: string; price: string; change: string; up: boolean }>
  >([
    { symbol: "BTC", pair: "BTC/USDT", price: "$79,350", change: "-0.5%", up: false },
    { symbol: "ETH", pair: "ETH/USDT", price: "$2,450", change: "-0.3%", up: false },
    { symbol: "SOL", pair: "SOL/USDT", price: "$101", change: "-1.4%", up: false },
    { symbol: "BNB", pair: "BNB/USDT", price: "$714", change: "-0.5%", up: false },
    { symbol: "XRP", pair: "XRP/USDT", price: "$1.40", change: "-0.8%", up: false },
  ]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLive() {
      const data = await marketApi.getTickers();
      if (!isMounted || !data || data.length === 0) return;
      const targetSymbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"];
      const filtered = data
        .filter((t) => targetSymbols.includes(t.symbol))
        .map((t) => {
          const base = t.symbol.split("/")[0];
          const formattedPrice =
            t.price >= 1000
              ? `$${t.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              : t.price >= 1
              ? `$${t.price.toFixed(2)}`
              : `$${t.price.toFixed(4)}`;
          return {
            symbol: base,
            pair: t.symbol,
            price: formattedPrice,
            change: `${t.change24h >= 0 ? "+" : ""}${t.change24h.toFixed(1)}%`,
            up: t.change24h >= 0,
          };
        });
      if (filtered.length > 0) {
        setLiveTickers(filtered);
      }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navContent = (
    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-mono font-bold mb-2 px-3">
          Workspace
        </div>
        <nav className="space-y-1">
          <NavigationItem href="/overview" icon={LayoutDashboard} label="Overview" onClick={onClose} />
          <NavigationItem href="/markets" icon={LineChart} label="Markets" onClick={onClose} />
          <NavigationItem href="/hermes" icon={Bot} label="Hermes" onClick={onClose} />
          <NavigationItem href="/opportunities" icon={Zap} label="Opportunities" onClick={onClose} />
          <NavigationItem href="/trade-proposals" icon={FileText} label="Proposals" onClick={onClose} />
          <NavigationItem href="/execution" icon={Workflow} label="Execution" onClick={onClose} />
          <NavigationItem href="/positions" icon={Briefcase} label="Positions" onClick={onClose} />
          <NavigationItem href="/strategies" icon={GitMerge} label="Strategies" onClick={onClose} />
          <NavigationItem href="/backtests" icon={History} label="Backtests" onClick={onClose} />
          <NavigationItem href="/risk" icon={ShieldAlert} label="Risk" onClick={onClose} />
          <NavigationItem href="/analytics" icon={BarChart3} label="Analytics" onClick={onClose} />
        </nav>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-mono font-bold mb-2 px-3">
          System
        </div>
        <nav className="space-y-1">
          <NavigationItem href="/live" icon={Radio} label="Live Controls" onClick={onClose} />
          <NavigationItem href="/activity" icon={Activity} label="Activity" onClick={onClose} />
          <NavigationItem href="/settings" icon={Settings} label="Settings" onClick={onClose} />
        </nav>
      </div>

      {/* Mini Market Ticker */}
      <div className="border-t border-[#222B32] pt-3 pb-1 px-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-mono font-bold">
            Live Binance
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] font-mono uppercase text-cyan-400 font-semibold">Feed</span>
          </span>
        </div>
        <div className="space-y-1.5">
          {liveTickers.map((t) => (
            <div key={t.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CryptoIcon symbol={t.symbol} size="sm" />
                <span className="text-xs font-mono text-gray-300">{t.pair}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono tabular-nums text-gray-100">{t.price}</span>
                <span className={`text-[10px] font-mono tabular-nums font-semibold ${t.up ? "text-profit" : "text-loss"}`}>
                  {t.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#101417] via-[#080A0C] to-[#040506] border-r border-[#222B32] flex-shrink-0">
        <Brand />
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-bg-950/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-[#101417] via-[#080A0C] to-[#040506] border-r border-[#222B32] shadow-2xl z-10 animate-fadeIn">
            <div className="h-14 flex items-center justify-between px-4 border-b border-[#222B32]">
              <Brand />
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-100 hover:bg-surface-2 transition-colors"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
