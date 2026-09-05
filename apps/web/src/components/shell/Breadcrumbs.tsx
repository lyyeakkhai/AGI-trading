"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const routeLabels: Record<string, string> = {
  overview: "Overview",
  hermes: "Hermes AI",
  markets: "Markets",
  opportunities: "Opportunities",
  "trade-proposals": "Trade Proposals",
  positions: "Positions & Portfolio",
  strategies: "Strategy Registry",
  backtests: "Backtests",
  risk: "Risk Management",
  analytics: "Analytics",
  activity: "Activity & Audit",
  settings: "Settings",
  execution: "Execution Queue",
  live: "Live Trading Controls",
  "design-system": "Design System",
};

export function Breadcrumbs({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || pathname === "/overview") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumbs" className={`hidden md:flex items-center gap-1.5 text-xs text-gray-400 ${className}`}>
      <Link href="/overview" className="hover:text-cyan-400 transition-colors">
        Overview
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label = routeLabels[segment] || segment.toUpperCase();

        return (
          <React.Fragment key={href}>
            <ChevronRight size={12} className="text-gray-600 shrink-0" />
            {isLast ? (
              <span className="text-gray-200 font-medium truncate max-w-[140px]">{label}</span>
            ) : (
              <Link href={href} className="hover:text-cyan-400 transition-colors truncate max-w-[140px]">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
