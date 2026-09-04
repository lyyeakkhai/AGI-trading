"use client";

import Link from "next/link";
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
  LucideIcon
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

function NavigationItem({ href, icon: Icon, label }: NavItemProps) {
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
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
        isActive
          ? "bg-surface-2 text-cyan-500 border border-border-hi shadow-[0_0_10px_rgba(0,229,255,0.1)]"
          : "text-gray-400 hover:text-gray-200 hover:bg-surface-2 border border-transparent"
      }`}
    >
      <Icon size={18} className={isActive ? "text-cyan-500" : "text-gray-500"} />
      <span className="font-medium hidden md:block">{label}</span>
    </Link>
  );
}

function Brand() {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-border-color">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-cyan-500 rounded-sm shadow-[0_0_12px_rgba(0,229,255,0.3)] flex items-center justify-center">
          <div className="w-2 h-2 bg-bg-950 rounded-sm" />
        </div>
        <div className="hidden md:flex flex-col tracking-wider">
          <span className="text-[10px] font-bold text-gray-300 leading-none">AGI</span>
          <span className="text-xs font-bold text-cyan-500 leading-none">TRADING</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-16 md:w-64 bg-bg-900 border-r border-border-color flex flex-col flex-shrink-0 transition-all duration-300">
      <Brand />
      
      <div className="flex-1 overflow-y-auto py-4 px-2 md:px-3 space-y-6">
        <div>
          <div className="hidden md:block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-3">
            Workspace
          </div>
          <nav className="space-y-1">
            <NavigationItem href="/overview" icon={LayoutDashboard} label="Overview" />
            <NavigationItem href="/markets" icon={LineChart} label="Markets" />
            <NavigationItem href="/hermes" icon={Bot} label="Hermes" />
            <NavigationItem href="/opportunities" icon={Zap} label="Opportunities" />
            <NavigationItem href="/trade-proposals" icon={FileText} label="Proposals" />
            <NavigationItem href="/positions" icon={Briefcase} label="Positions" />
            <NavigationItem href="/strategies" icon={GitMerge} label="Strategies" />
            <NavigationItem href="/backtests" icon={History} label="Backtests" />
            <NavigationItem href="/risk" icon={ShieldAlert} label="Risk" />
            <NavigationItem href="/analytics" icon={BarChart3} label="Analytics" />
          </nav>
        </div>

        <div>
          <div className="hidden md:block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-3">
            System
          </div>
          <nav className="space-y-1">
            <NavigationItem href="/activity" icon={Activity} label="Activity" />
            <NavigationItem href="/settings" icon={Settings} label="Settings" />
          </nav>
        </div>
      </div>
    </aside>
  );
}
