"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  mockBacktestsData,
  BacktestRecord,
} from "@/lib/mockBacktestsData";
import { mockStrategiesData } from "@/lib/mockStrategiesData";
import { BacktestSummaryHeader } from "./BacktestSummaryHeader";
import { BacktestFilters, BacktestSortOption } from "./BacktestFilters";
import { BacktestRegistryTable } from "./BacktestRegistryTable";
import { BacktestMetricsSummary } from "./BacktestMetricsSummary";
import { EquityCurveChart } from "./EquityCurveChart";
import { DrawdownChart } from "./DrawdownChart";
import { TradeStatisticsCard } from "./TradeStatisticsCard";
import { ExecutionAssumptionsCard } from "./ExecutionAssumptionsCard";
import { RegimeAnalysisCard } from "./RegimeAnalysisCard";
import { TimeframeAssetCard } from "./TimeframeAssetCard";
import { OutOfSampleCard } from "./OutOfSampleCard";
import { ValidationAssessmentCard } from "./ValidationAssessmentCard";
import { HermesBacktestPanel } from "./HermesBacktestPanel";
import { TradeHistoryTable } from "./TradeHistoryTable";
import { BacktestComparisonModal } from "./BacktestComparisonModal";
import { NewBacktestModal } from "./NewBacktestModal";
import { BacktestStatusBadge } from "./BacktestStatusBadge";
import { Button } from "@/components";
import { ArrowUpRight, SlidersHorizontal, Eye } from "lucide-react";

export function BacktestsWorkspace() {
  const [backtests, setBacktests] = useState<BacktestRecord[]>(mockBacktestsData);
  const [selectedId, setSelectedId] = useState<string>(mockBacktestsData[0]?.id || "");
  const [strategyFilter, setStrategyFilter] = useState<string>("ALL");
  const [marketFilter, setMarketFilter] = useState<string>("ALL");
  const [timeframeFilter, setTimeframeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<BacktestSortOption>("recent");

  // Comparison State
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // New Backtest Modal State
  const [isNewBacktestOpen, setIsNewBacktestOpen] = useState(false);

  // Strategies list for dropdowns
  const strategyOptions = useMemo(() => {
    return mockStrategiesData.map((s) => ({
      id: s.id,
      name: s.name,
      version: s.version,
    }));
  }, []);

  // Filter & Sort Backtests
  const filteredBacktests = useMemo(() => {
    return backtests
      .filter((b) => {
        if (strategyFilter !== "ALL" && b.strategyId !== strategyFilter) return false;
        if (marketFilter !== "ALL" && b.market !== marketFilter) return false;
        if (timeframeFilter !== "ALL" && b.timeframe !== timeframeFilter) return false;
        if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchId = b.id.toLowerCase().includes(q);
          const matchStrat = b.strategyName.toLowerCase().includes(q);
          const matchMarket = b.market.toLowerCase().includes(q);
          const matchVer = b.strategyVersion.toLowerCase().includes(q);
          if (!matchId && !matchStrat && !matchMarket && !matchVer) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "netReturn") return b.netReturn - a.netReturn;
        if (sortBy === "profitFactor") return b.profitFactor - a.profitFactor;
        if (sortBy === "maxDrawdown") return b.maxDrawdown - a.maxDrawdown; // least negative first
        if (sortBy === "tradeCount") return b.tradeCount - a.tradeCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [backtests, strategyFilter, marketFilter, timeframeFilter, statusFilter, search, sortBy]);

  // Selected Backtest
  const selectedBacktest = useMemo(() => {
    return backtests.find((b) => b.id === selectedId) || filteredBacktests[0] || backtests[0];
  }, [backtests, selectedId, filteredBacktests]);

  // Handle Comparison Toggle
  const handleToggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    setComparedIds((prev) => prev.filter((item) => item !== id));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setStrategyFilter("ALL");
    setMarketFilter("ALL");
    setTimeframeFilter("ALL");
    setStatusFilter("ALL");
    setSearch("");
    setSortBy("recent");
  };

  // On New Backtest Created
  const handleBacktestCreated = (newBt: BacktestRecord) => {
    setBacktests((prev) => [newBt, ...prev]);
    setSelectedId(newBt.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <BacktestSummaryHeader
        strategies={strategyOptions}
        selectedStrategyId={strategyFilter}
        onSelectStrategy={setStrategyFilter}
        onOpenNewBacktest={() => setIsNewBacktestOpen(true)}
        onOpenComparison={() => setIsCompareModalOpen(true)}
        comparisonCount={comparedIds.length}
      />

      {/* 2. Filters & Search */}
      <BacktestFilters
        search={search}
        onSearchChange={setSearch}
        marketFilter={marketFilter}
        onMarketChange={setMarketFilter}
        timeframeFilter={timeframeFilter}
        onTimeframeChange={setTimeframeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
        totalCount={backtests.length}
        filteredCount={filteredBacktests.length}
      />

      {/* 3. Backtest Registry Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
            Backtest Registry
          </h2>
          <span className="text-[11px] font-mono text-text-muted">
            Click row to inspect deep analytical breakdown below
          </span>
        </div>
        <BacktestRegistryTable
          backtests={filteredBacktests}
          selectedId={selectedBacktest?.id || null}
          onSelectBacktest={setSelectedId}
          comparedIds={comparedIds}
          onToggleCompare={handleToggleCompare}
        />
      </div>

      {/* Comparison Floating Action Bar if items selected */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-30 p-3 rounded-lg bg-surface-1/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-3">
          <span className="text-text-primary">
            <strong className="text-cyan-400">{comparedIds.length}</strong> backtests selected for comparison
          </span>
          <Button
            variant="primary"
            onClick={() => setIsCompareModalOpen(true)}
            className="text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Open Comparison</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setComparedIds([])}
            className="text-xs py-1.5 px-2 text-text-muted hover:text-text-primary"
          >
            Clear
          </Button>
        </div>
      )}

      {/* 4. Selected Backtest Detailed Analysis Workspace */}
      {selectedBacktest && (
        <div className="space-y-6 pt-4 border-t border-border/80">
          {/* Detailed View Title & Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface-1 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold text-sm">
                {selectedBacktest.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary font-mono">
                    {selectedBacktest.strategyName}
                  </h3>
                  <span className="text-xs text-text-muted font-mono">
                    ({selectedBacktest.strategyVersion})
                  </span>
                  <BacktestStatusBadge status={selectedBacktest.status} />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted mt-0.5">
                  <span>Market: <strong className="text-text-primary">{selectedBacktest.market}</strong></span>
                  <span>·</span>
                  <span>Timeframe: <strong className="text-text-primary">{selectedBacktest.timeframe}</strong></span>
                  <span>·</span>
                  <span>Window: <strong className="text-text-primary">{selectedBacktest.startDate} → {selectedBacktest.endDate}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/strategies"
                className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded bg-surface-2 border border-border hover:border-cyan-500/30 transition-colors"
              >
                <span>View Strategy in Registry</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 5. Key Metrics Summary Grid */}
          <BacktestMetricsSummary backtest={selectedBacktest} />

          {/* 6. Equity Curve Chart */}
          <EquityCurveChart
            data={selectedBacktest.equityCurve}
            initialCapital={selectedBacktest.initialCapital}
            finalEquity={selectedBacktest.finalEquity}
          />

          {/* 7. Drawdown & Trade Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DrawdownChart
              data={selectedBacktest.drawdownCurve}
              maxDrawdown={selectedBacktest.maxDrawdown}
              averageDrawdown={selectedBacktest.averageDrawdown}
              longestDrawdown={selectedBacktest.longestDrawdown}
            />
            <TradeStatisticsCard backtest={selectedBacktest} />
          </div>

          {/* 8. Execution Assumptions & Friction Drag */}
          <ExecutionAssumptionsCard backtest={selectedBacktest} />

          {/* 9. Market Regime Breakdown */}
          <RegimeAnalysisCard regimes={selectedBacktest.regimePerformance} />

          {/* 10. Timeframe & Asset Analysis */}
          <TimeframeAssetCard
            timeframes={selectedBacktest.timeframePerformance}
            assets={selectedBacktest.assetPerformance}
          />

          {/* 11. Out of Sample & Walk-Forward Windows */}
          <OutOfSampleCard
            oos={selectedBacktest.oosResults}
            walkForward={selectedBacktest.walkForwardResults}
          />

          {/* 12. Validation Assessment & Decision Gate */}
          <ValidationAssessmentCard assessment={selectedBacktest.validationAssessment} />

          {/* 13. Hermes AI Quantitative Review */}
          <HermesBacktestPanel
            strategyName={selectedBacktest.strategyName}
            strategyVersion={selectedBacktest.strategyVersion}
            review={selectedBacktest.hermesReview}
          />

          {/* 14. Trade History Table */}
          <TradeHistoryTable trades={selectedBacktest.trades} />
        </div>
      )}

      {/* Modals */}
      <BacktestComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        backtests={backtests.filter((b) => comparedIds.includes(b.id))}
        onRemoveFromCompare={handleRemoveFromCompare}
      />

      <NewBacktestModal
        isOpen={isNewBacktestOpen}
        onClose={() => setIsNewBacktestOpen(false)}
        strategies={strategyOptions}
        onBacktestCreated={handleBacktestCreated}
      />
    </div>
  );
}
