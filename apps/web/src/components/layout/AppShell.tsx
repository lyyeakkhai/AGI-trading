"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isImmersiveTrade = pathname === "/trade" || pathname?.startsWith("/trade");

  if (isImmersiveTrade) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#000000] text-[#EDEDED] antialiased selection:bg-cyan-500/30">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-bg-950 overflow-hidden text-gray-300 antialiased selection:bg-cyan-500/30">
      <TopNav />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-950 p-4 sm:p-6 relative max-w-full">
        {children}
      </main>
    </div>
  );
}
