"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
 PositionItem,
 mockOpenPositions,
 mockClosedPositions,
 allMockPositions,
 mockPortfolioSummary,
 mockPortfolioHealth,
 mockAssetAllocations,
 mockGlobalPositionAlerts,
 PositionFilterState,
 defaultPositionFilters,
} from "@/lib/mockPositionsData";
import { PortfolioSummaryHeader } from "./PortfolioSummaryHeader";
import { PortfolioExposureBar } from "./PortfolioExposureBar";
import { PortfolioHealthCard } from "./PortfolioHealthCard";
import { PositionAlertsList } from "./PositionAlertsList";
import { PositionFilters } from "./PositionFilters";
import { PositionsTable } from "./PositionsTable";
import { PositionDetailDrawer } from "./PositionDetailDrawer";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Briefcase, Zap, ArrowRight } from "lucide-react";

interface PositionsWorkspaceProps {
 initialPositionId?: string;
}

export function PositionsWorkspace({ initialPositionId }: PositionsWorkspaceProps) {
 // Local state
 const [openPositions] = useState<PositionItem[]>(mockOpenPositions);
 const [closedPositions] = useState<PositionItem[]>(mockClosedPositions);
 const [filters, setFilters] = useState<PositionFilterState>(defaultPositionFilters);

 // Selected position state
 const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
  initialPositionId || openPositions[0]?.id || null
 );

 // Filtered & Sorted Positions
 const displayedPositions = useMemo(() => {
  let list: PositionItem[] = [];

  // 1. Tab Selection
  if (filters.tab === "open") {
   list = [...openPositions];
  } else if (filters.tab === "closed") {
   list = [...closedPositions];
  } else {
   list = [...openPositions, ...closedPositions];
  }

  // 2. Search
  if (filters.search.trim()) {
   const q = filters.search.toLowerCase().trim();
   list = list.filter(
    (p) =>
     p.symbol.toLowerCase().includes(q) ||
     p.strategy.toLowerCase().includes(q) ||
     p.id.toLowerCase().includes(q) ||
     p.thesis.rationale.toLowerCase().includes(q) ||
     p.thesis.setup.toLowerCase().includes(q)
   );
  }

  // 3. Asset
  if (filters.asset !== "All") {
   list = list.filter((p) => p.symbol === filters.asset);
  }

  // 4. Direction
  if (filters.direction !== "All") {
   list = list.filter((p) => p.side === filters.direction);
  }

  // 5. Strategy
  if (filters.strategy !== "All") {
   list = list.filter((p) => p.strategy === filters.strategy);
  }

  // 6. Risk State
  if (filters.riskState !== "All") {
   list = list.filter((p) => p.riskState === filters.riskState);
  }

  // 7. Sorting
  list.sort((a, b) => {
   switch (filters.sortBy) {
    case "pnl-desc": {
     const aPnl = a.status === "CLOSED" ? a.realizedPnl : a.unrealizedPnl;
     const bPnl = b.status === "CLOSED" ? b.realizedPnl : b.unrealizedPnl;
     return bPnl - aPnl;
    }
    case "pnl-asc": {
     const aPnl = a.status === "CLOSED" ? a.realizedPnl : a.unrealizedPnl;
     const bPnl = b.status === "CLOSED" ? b.realizedPnl : b.unrealizedPnl;
     return aPnl - bPnl;
    }
    case "pnl-pct-desc":
     return b.unrealizedPnlPercent - a.unrealizedPnlPercent;
    case "exposure-desc":
     return b.exposurePercent - a.exposurePercent;
    case "risk-desc":
     return b.riskPercent - a.riskPercent;
    case "newest":
     return b.openedTimestamp - a.openedTimestamp;
    case "asset":
     return a.symbol.localeCompare(b.symbol);
    case "default":
    default: {
     // Open positions first, then by PnL
     const aOpen = a.status === "OPEN" ? 1 : 0;
     const bOpen = b.status === "OPEN" ? 1 : 0;
     if (aOpen !== bOpen) return bOpen - aOpen;
     return b.unrealizedPnl - a.unrealizedPnl;
    }
   }
  });

  return list;
 }, [openPositions, closedPositions, filters]);

 // Find currently selected position object
 const selectedPosition = useMemo(() => {
  if (!selectedPositionId) return null;
  return allMockPositions.find((p) => p.id === selectedPositionId) || null;
 }, [selectedPositionId]);

 return (
  <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen font-sans">
   {/* 1. Page Header & Financial Metrics */}
   <PortfolioSummaryHeader
    metrics={mockPortfolioSummary}
    openCount={openPositions.length}
   />

   {/* 2. Top Analytical Widgets Grid: Exposure & Health & Alerts */}
   <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
    {/* Exposure Progress Bar */}
    <div className="lg:col-span-6">
     <PortfolioExposureBar
      totalExposurePercent={mockPortfolioSummary.totalExposure}
      availablePercent={parseFloat(
       (100 - mockPortfolioSummary.totalExposure).toFixed(1)
      )}
      allocations={mockAssetAllocations}
      className="h-full"
     />
    </div>

    {/* Portfolio Health */}
    <div className="lg:col-span-6">
     <PortfolioHealthCard
      health={mockPortfolioHealth}
      className="h-full"
     />
    </div>
   </div>

   {/* Operational Alerts Strip */}
   <PositionAlertsList alerts={mockGlobalPositionAlerts} />

   {/* 3. Filter, Search & Sort Toolbar */}
   <PositionFilters
    filters={filters}
    onFilterChange={setFilters}
    openCount={openPositions.length}
    closedCount={closedPositions.length}
    totalCount={openPositions.length + closedPositions.length}
   />

   {/* 4. Positions Table */}
   {displayedPositions.length > 0 ? (
    <PositionsTable
     positions={displayedPositions}
     selectedPositionId={selectedPositionId}
     onSelectPosition={(id) => setSelectedPositionId(id)}
     isClosedView={filters.tab === "closed"}
    />
   ) : (
    /* Empty State */
    <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-12 text-center space-y-4">
     <div className="w-14 h-14 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 mx-auto flex items-center justify-center text-gray-400 dark:text-zinc-500">
      <Briefcase size={24} />
     </div>
     <div>
      <h3 className="text-sm font-sans font-semibold tracking-normal text-gray-800 dark:text-zinc-200">
       No Open Positions
      </h3>
      <p className="text-xs text-gray-400 dark:text-zinc-500 font-sans tracking-normal mt-2 max-w-md mx-auto">
       Hermes is scanning markets. No paper positions active under current filters.
      </p>
     </div>
     <div className="pt-4">
      <Link href="/opportunities">
       <Button variant="primary" size="sm" className="font-sans tracking-normal text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-cyan-900">
        <Zap size={13} className="mr-2" />
        <span>Scan Opportunities</span>
        <ArrowRight size={13} className="ml-2" />
       </Button>
      </Link>
     </div>
    </div>
   )}

   {/* 5. Right-side Position Detail Drawer */}
   <PositionDetailDrawer
    position={selectedPosition}
    onClose={() => setSelectedPositionId(null)}
    portfolioExposureTotal={mockPortfolioSummary.totalExposure}
   />
  </div>
 );
}
