"use client";

import React from "react";
import { TopNav } from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen w-full bg-bg-950 overflow-hidden text-gray-300 antialiased selection:bg-cyan-500/30">
      <TopNav />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-950 p-4 sm:p-6 relative max-w-full">
        {children}
      </main>
    </div>
  );
}
