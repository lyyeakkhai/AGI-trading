"use client";

import React, { useState, useMemo } from "react";
import {
  StrategyItem,
  mockStrategies,
  mockStrategySummary,
  StrategyFilterState,
  defaultStrategyFilters,
  StrategySummaryMetrics,
} from "@/lib/mockStrategiesData";
import { StrategySummaryHeader } from "./StrategySummaryHeader";
import { StrategyFilters } from "./StrategyFilters";
import { StrategyRegistryTable } from "./StrategyRegistryTable";
import { StrategyDetailDrawer } from "./StrategyDetailDrawer";
import { CreateStrategyModal } from "./CreateStrategyModal";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { GitMerge, Plus } from "lucide-react";

interface StrategiesWorkspaceProps {
  initialStrategyId?: string;
}

export function StrategiesWorkspace({
  initialStrategyId,
}: StrategiesWorkspaceProps) {
  const { showToast } = useToast();

  // Local state initialized with deterministic mock strategies
  const [strategies, setStrategies] = useState<StrategyItem[]>(mockStrategies);
  const [filters, setFilters] = useState<StrategyFilterState>(defaultStrategyFilters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Selected strategy for inspection drawer
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    initialStrategyId || strategies[0]?.id || null
  );

  // Re-compute summary metrics dynamically
  const metrics: StrategySummaryMetrics = useMemo(() => {
    return {
      activeStrategies: strategies.filter((s) => s.status === "ACTIVE").length,
      paperApproved: strategies.filter((s) => s.paperApproved).length,
      underValidation: strategies.filter(
        (s) =>
          s.status === "UNDER_VALIDATION" ||
          s.validationStage === "Walk-Forward" ||
          s.validationStage === "Out-of-Sample"
      ).length,
      backtested: strategies.filter(
        (s) =>
          s.performance.totalTrades > 0 ||
          s.validationStage === "Backtest" ||
          s.paperApproved
      ).length,
      liveApproved: strategies.filter((s) => s.liveApproved).length,
    };
  }, [strategies]);

  // Filtered & Sorted strategies
  const displayedStrategies = useMemo(() => {
    let list = [...strategies];

    // 1. Status Filter
    if (filters.status !== "All") {
      list = list.filter((s) => s.status === filters.status);
    }

    // 2. Validation Stage Filter
    if (filters.validationStage !== "All") {
      list = list.filter((s) => s.validationStage === filters.validationStage);
    }

    // 3. Market Filter
    if (filters.market !== "All") {
      list = list.filter(
        (s) =>
          s.primaryMarket === filters.market ||
          s.definition.marketUniverse.includes(filters.market)
      );
    }

    // 4. Timeframe Filter
    if (filters.timeframe !== "All") {
      list = list.filter((s) => s.primaryTimeframe === filters.timeframe);
    }

    // 5. Type Filter
    if (filters.type !== "All") {
      list = list.filter((s) => s.type === filters.type);
    }

    // 6. Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.version.toLowerCase().includes(q) ||
          s.primaryMarket.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          s.definition.description.toLowerCase().includes(q)
      );
    }

    // 7. Sorting
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "stage": {
          const stageOrder = [
            "Trading Idea",
            "Formal Strategy",
            "Backtest",
            "Out-of-Sample",
            "Walk-Forward",
            "Paper Trading",
            "Tiny Live",
            "Performance Evaluation",
            "Approved",
          ];
          return stageOrder.indexOf(b.validationStage) - stageOrder.indexOf(a.validationStage);
        }
        case "return-desc":
          return b.performance.netReturnPercent - a.performance.netReturnPercent;
        case "winrate-desc":
          return b.performance.winRatePercent - a.performance.winRatePercent;
        case "pf-desc":
          return b.performance.profitFactor - a.performance.profitFactor;
        case "drawdown-asc":
          return a.performance.maxDrawdownPercent - b.performance.maxDrawdownPercent;
        case "newest":
          return b.updatedTimestamp - a.updatedTimestamp;
        case "name":
          return a.name.localeCompare(b.name);
        case "default":
        default: {
          // Active strategies first, then by net return
          const aActive = a.status === "ACTIVE" ? 1 : 0;
          const bActive = b.status === "ACTIVE" ? 1 : 0;
          if (aActive !== bActive) return bActive - aActive;
          return b.performance.netReturnPercent - a.performance.netReturnPercent;
        }
      }
    });

    return list;
  }, [strategies, filters]);

  // Find active strategy
  const selectedStrategy = useMemo(() => {
    if (!selectedStrategyId) return null;
    return strategies.find((s) => s.id === selectedStrategyId) || null;
  }, [selectedStrategyId, strategies]);

  // Handle Create Strategy locally
  const handleCreateStrategy = (newStrategy: StrategyItem) => {
    setStrategies((prev) => [newStrategy, ...prev]);
    setSelectedStrategyId(newStrategy.id);

    showToast({
      title: "Strategy Draft Created",
      message: `${newStrategy.name} registered into Strategy Registry as a draft.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Header & Summary Metrics */}
      <StrategySummaryHeader
        metrics={metrics}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 2. Filter, Search & Sort Toolbar */}
      <StrategyFilters
        filters={filters}
        onFilterChange={setFilters}
        totalCount={displayedStrategies.length}
      />

      {/* 3. Strategy Registry Table */}
      {displayedStrategies.length > 0 ? (
        <StrategyRegistryTable
          strategies={displayedStrategies}
          selectedStrategyId={selectedStrategyId}
          onSelectStrategy={(id) => setSelectedStrategyId(id)}
        />
      ) : (
        /* Empty State */
        <Surface
          variant="default"
          padded="lg"
          className="text-center py-16 space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-surface-2 border border-border-color mx-auto flex items-center justify-center text-gray-500">
            <GitMerge size={22} />
          </div>
          <h3 className="text-sm font-mono font-bold uppercase text-gray-200">
            No Strategies Found
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto font-sans leading-relaxed">
            No trading strategies matched your current filter criteria. Reset
            filters or create a new strategy draft.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={13} className="mr-1.5" />
              <span>Create Strategy</span>
            </Button>
          </div>
        </Surface>
      )}

      {/* 4. Right-side Strategy Detail Drawer */}
      <StrategyDetailDrawer
        strategy={selectedStrategy}
        onClose={() => setSelectedStrategyId(null)}
      />

      {/* 5. Create Strategy Modal */}
      <CreateStrategyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStrategy={handleCreateStrategy}
      />
    </div>
  );
}
