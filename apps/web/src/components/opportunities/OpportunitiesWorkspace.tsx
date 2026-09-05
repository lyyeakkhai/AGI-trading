"use client";

import React, { useState, useMemo } from "react";
import { OpportunitySummaryHeader } from "./OpportunitySummaryHeader";
import { OpportunityRadar } from "./OpportunityRadar";
import { OpportunityFilters, OpportunityFilterState } from "./OpportunityFilters";
import { OpportunityTable } from "./OpportunityTable";
import { OpportunityDetailDrawer } from "./OpportunityDetailDrawer";
import {
  mockOpportunities,
  mockOpportunitySummary,
  mockHermesScannerState,
  OpportunityItem,
} from "@/lib/mockOpportunitiesData";
import { RiskLevel } from "@/components/trading/RiskBadge";

const defaultFilters: OpportunityFilterState = {
  search: "",
  market: "All",
  direction: "All",
  timeframe: "All",
  strategy: "All",
  confidence: "All",
  status: "Active",
  sortBy: "confidence-desc",
};

export function OpportunitiesWorkspace() {
  const [filters, setFilters] = useState<OpportunityFilterState>(defaultFilters);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<OpportunityItem | null>(null);

  // Filter & Search & Sort Pipeline
  const filteredOpportunities = useMemo(() => {
    let list = [...mockOpportunities];

    // 1. Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (opp) =>
          opp.symbol.toLowerCase().includes(q) ||
          opp.name.toLowerCase().includes(q) ||
          opp.setup.toLowerCase().includes(q) ||
          opp.strategy.toLowerCase().includes(q) ||
          opp.marketRegime.toLowerCase().includes(q)
      );
    }

    // 2. Market filter
    if (filters.market !== "All") {
      list = list.filter((opp) => opp.symbol === filters.market);
    }

    // 3. Direction filter
    if (filters.direction !== "All") {
      list = list.filter((opp) => opp.direction === filters.direction);
    }

    // 4. Timeframe filter
    if (filters.timeframe !== "All") {
      list = list.filter((opp) => opp.timeframe === filters.timeframe);
    }

    // 5. Confidence filter
    if (filters.confidence === "high") {
      list = list.filter((opp) => opp.confidence >= 70);
    } else if (filters.confidence === "medium") {
      list = list.filter((opp) => opp.confidence >= 50 && opp.confidence < 70);
    } else if (filters.confidence === "low") {
      list = list.filter((opp) => opp.confidence < 50);
    }

    // 6. Status filter
    if (filters.status === "Active") {
      list = list.filter((opp) => opp.status !== "Expired");
    } else if (filters.status !== "All") {
      list = list.filter((opp) => opp.status === filters.status);
    }

    // 7. Sorting
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "confidence-desc":
          return b.confidence - a.confidence;
        case "confidence-asc":
          return a.confidence - b.confidence;
        case "newest":
          return b.detectedTimestamp - a.detectedTimestamp;
        case "risk": {
          const rank: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, BLOCKED: 4 };
          return (rank[b.riskState] || 0) - (rank[a.riskState] || 0);
        }
        case "symbol":
          return a.symbol.localeCompare(b.symbol);
        default:
          return b.confidence - a.confidence;
      }
    });

    return list;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleSelectOpportunity = (opp: OpportunityItem) => {
    // If clicking already selected, keep it active or allow re-selection
    setSelectedOpportunity(opp);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* 1. Opportunity Summary & Hermes Scanner Header */}
      <OpportunitySummaryHeader
        metrics={mockOpportunitySummary}
        scannerState={mockHermesScannerState}
      />

      {/* 2. Visual Opportunity Radar Deck */}
      <OpportunityRadar
        opportunities={mockOpportunities}
        selectedOpportunityId={selectedOpportunity?.id}
        onSelectOpportunity={handleSelectOpportunity}
      />

      {/* 3. Search, Filter & Sort Controls */}
      <OpportunityFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        resultCount={filteredOpportunities.length}
        totalCount={mockOpportunities.length}
      />

      {/* 4. Table & Selected Opportunity Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Table: Full width if no selection, or 7 cols if detail open */}
        <div
          className={`${
            selectedOpportunity ? "lg:col-span-7" : "lg:col-span-12"
          } transition-all duration-200`}
        >
          <OpportunityTable
            opportunities={filteredOpportunities}
            selectedOpportunityId={selectedOpportunity?.id}
            onSelectOpportunity={handleSelectOpportunity}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Detail Drawer / Panel: 5 cols on lg */}
        {selectedOpportunity && (
          <div className="lg:col-span-5 w-full sticky top-4">
            <OpportunityDetailDrawer
              opportunity={selectedOpportunity}
              onClose={() => setSelectedOpportunity(null)}
              className="rounded-lg border border-border-color max-h-[85vh]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
