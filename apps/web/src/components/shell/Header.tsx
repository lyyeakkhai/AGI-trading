"use client";

import { usePathname } from "next/navigation";
import { Activity, Server } from "lucide-react";

function PageTitle() {
  const pathname = usePathname();
  const path = pathname.split("/")[1] || "";
  
  const title =
    path === "agent"
      ? "Hermes"
      : path === "trade-proposals" || path === "proposals"
      ? "Trade Proposals"
      : path
      ? path.charAt(0).toUpperCase() + path.slice(1)
      : "Overview";

  return (
    <div className="text-lg font-medium text-gray-200">
      {title}
    </div>
  );
}

function EnvironmentIndicator() {
  return (
    <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-surface-2 border border-border-hi rounded-md">
      <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.6)] animate-pulse" />
      <span className="text-xs font-mono text-cyan-400 font-medium">PAPER</span>
    </div>
  );
}

function HermesStatus() {
  return (
    <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-surface-2 border border-border-hi rounded-md">
      <Activity size={14} className="text-cyan-500" />
      <span className="hidden md:inline text-xs font-bold text-gray-400">HERMES</span>
      <span className="text-xs font-mono text-cyan-500">MONITORING</span>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-surface-2 border border-border-hi rounded-md">
      <Server size={14} className="text-profit" />
      <span className="hidden md:inline text-xs font-mono text-gray-300">SYSTEM ONLINE</span>
    </div>
  );
}

export function Header() {
  return (
    <header className="h-16 bg-surface border-b border-border-color flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center truncate mr-4">
        <PageTitle />
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <HermesStatus />
        <SystemStatus />
        <div className="hidden md:block w-px h-4 bg-border-hi mx-1"></div>
        <EnvironmentIndicator />
      </div>
    </header>
  );
}
