"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full bg-bg-950 overflow-hidden text-gray-300 antialiased selection:bg-cyan-500/30">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto bg-bg-950 p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
