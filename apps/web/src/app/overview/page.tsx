"use client";

import React, { useState } from "react";
import {
  mockPortfolioMetrics,
  mockMarketContexts,
  mockHermesOverview,
  mockOpportunities,
  mockPositions,
  mockRiskSummary,
  mockRecentActivities,
} from "@/lib/mockOverviewData";
import { PortfolioSummaryHeader } from "@/components/overview/PortfolioSummaryHeader";
import { PerformanceChart } from "@/components/overview/PerformanceChart";
import { MarketContextWidget } from "@/components/overview/MarketContextWidget";
import { HermesOverviewCard } from "@/components/overview/HermesOverviewCard";
import { OpportunitiesWidget } from "@/components/overview/OpportunitiesWidget";
import { ActivePositionsWidget } from "@/components/overview/ActivePositionsWidget";
import { RiskStatusWidget } from "@/components/overview/RiskStatusWidget";
import { RecentActivityWidget } from "@/components/overview/RecentActivityWidget";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { RefreshCw, Radio } from "lucide-react";

export default function OverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast({
        type: "ai",
        title: "Telemetry Refreshed",
        message: "Portfolio equity, orderbooks, and Hermes state resynchronized.",
      });
    }, 600);
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-color">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-100 uppercase font-mono">
              AI Trading Command Center
            </h1>
            <Badge variant="cyan" size="sm" dot pulse>
              <Radio size={10} className="mr-1 inline text-cyan-400" />
              LIVE TELEMETRY
            </Badge>
          </div>
          <p className="text-xs text-gray-400 font-sans">
            Continuous autonomous market surveillance, risk surveillance, and quantitative execution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<RefreshCw size={12} className={isRefreshing ? "animate-spin text-cyan-400" : ""} />}
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="font-mono"
          >
            SYNC FEEDS
          </Button>
        </div>
      </div>

      {/* 2. Portfolio Summary Metric Cards */}
      <section aria-label="Portfolio Summary">
        <PortfolioSummaryHeader metrics={mockPortfolioMetrics} />
      </section>

      {/* 3. Main Intelligence Area: Performance & Market Context (Left) vs Hermes Panel (Right) */}
      <section aria-label="Intelligence and Trajectory" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 7 Cols */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <PerformanceChart />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold mb-2">
              Primary Market Context
            </div>
            <MarketContextWidget markets={mockMarketContexts} />
          </div>
        </div>

        {/* Right Column: 5 Cols */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <HermesOverviewCard hermes={mockHermesOverview} className="h-full" />
        </div>
      </section>

      {/* 4. Lower Operations: Opportunities & Active Positions */}
      <section aria-label="Opportunities and Active Positions" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OpportunitiesWidget opportunities={mockOpportunities} />
        <ActivePositionsWidget positions={mockPositions} />
      </section>

      {/* 5. System Interlock: Risk Status & Recent Activity */}
      <section aria-label="Risk and System Audit" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RiskStatusWidget risk={mockRiskSummary} />
        <RecentActivityWidget activities={mockRecentActivities} />
      </section>
    </div>
  );
}
