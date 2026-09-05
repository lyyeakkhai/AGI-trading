"use client";

import React, { useState, useMemo } from "react";
import {
  mockAnalyticsSummary,
  mockEquityBenchmark,
  mockDrawdownAnalysis,
  mockMonthlyReturns,
  mockPnlDistribution,
  mockStrategyPerformance,
  mockAssetPerformance,
  mockTimeframePerformance,
  mockRegimePerformance,
  mockDirectionalPerformance,
  mockConsistencyMetrics,
  mockConfidenceCalibration,
  mockHermesFunnelStages,
  mockHermesPerformanceReview,
} from "@/lib/mockAnalyticsData";
import { AnalyticsSummaryHeader } from "./AnalyticsSummaryHeader";
import { AnalyticsFilters, AnalyticsFilterState } from "./AnalyticsFilters";
import { AnalyticsSummaryCards } from "./AnalyticsSummaryCards";
import { TradePerformance } from "./TradePerformance";
import { EquityBenchmarkChart } from "./EquityBenchmarkChart";
import { DrawdownAnalyticsCard } from "./DrawdownAnalyticsCard";
import { PnlDistributionChart } from "./PnlDistributionChart";
import { ReturnsByPeriodTable } from "./ReturnsByPeriodTable";
import { StrategyPerformanceTable } from "./StrategyPerformanceTable";
import { AssetTimeframeRegimeCards } from "./AssetTimeframeRegimeCards";
import { DirectionalConsistencyCard } from "./DirectionalConsistencyCard";
import { ExecutionQualityCard } from "./ExecutionQualityCard";
import { ConfidenceCalibrationCard } from "./ConfidenceCalibrationCard";
import { HermesFunnelCard } from "./HermesFunnelCard";
import { HermesAnalyticsPanel } from "./HermesAnalyticsPanel";
import { StrategyComparisonModal } from "./StrategyComparisonModal";

const initialFilters: AnalyticsFilterState = {
  strategy: "All",
  asset: "All",
  timeframe: "All",
  regime: "All",
  direction: "All",
};

export function AnalyticsWorkspace() {
  const [timeframe, setTimeframe] = useState("90D");
  const [filters, setFilters] = useState<AnalyticsFilterState>(initialFilters);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Reactive data filtering based on header timeframe
  const filteredEquityData = useMemo(() => {
    const totalPoints = mockEquityBenchmark.length;
    let sliceCount = totalPoints;

    switch (timeframe) {
      case "7D":
        sliceCount = Math.min(totalPoints, 7);
        break;
      case "30D":
        sliceCount = Math.min(totalPoints, 30);
        break;
      case "90D":
        sliceCount = Math.min(totalPoints, 60);
        break;
      case "YTD":
      case "1Y":
        sliceCount = Math.min(totalPoints, 90);
        break;
      default:
        sliceCount = totalPoints;
    }

    return mockEquityBenchmark.slice(-sliceCount);
  }, [timeframe]);

  // Reactive strategy table filtering
  const filteredStrategies = useMemo(() => {
    if (filters.strategy === "All") return mockStrategyPerformance;
    return mockStrategyPerformance.filter(
      (s) => s.name.toLowerCase().includes(filters.strategy.toLowerCase())
    );
  }, [filters.strategy]);

  // Reactive asset cards filtering
  const filteredAssets = useMemo(() => {
    if (filters.asset === "All") return mockAssetPerformance;
    return mockAssetPerformance.filter((a) => a.asset === filters.asset);
  }, [filters.asset]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <AnalyticsSummaryHeader
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      {/* 2. Attribution Filters */}
      <AnalyticsFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* 3. Top Performance Summary Cards */}
      <AnalyticsSummaryCards summary={mockAnalyticsSummary} />

      {/* 4. Trade Performance & Attribution Metrics */}
      <TradePerformance summary={mockAnalyticsSummary} />

      {/* 5. Equity Curve vs Benchmark Alpha (Reactively Sliced) */}
      <EquityBenchmarkChart data={filteredEquityData} />

      {/* 6. Drawdown & P&L R-Multiple Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DrawdownAnalyticsCard data={mockDrawdownAnalysis} />
        <PnlDistributionChart distribution={mockPnlDistribution} />
      </div>

      {/* 7. Monthly/Weekly Returns & Strategy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReturnsByPeriodTable periods={mockMonthlyReturns} />
        <StrategyPerformanceTable strategies={filteredStrategies} />
      </div>

      {/* 8. Market Regimes, Assets & Timeframes */}
      <AssetTimeframeRegimeCards
        assets={filteredAssets}
        timeframes={mockTimeframePerformance}
        regimes={mockRegimePerformance}
      />

      {/* 9. Long vs Short Directional Bias & Performance Consistency */}
      <DirectionalConsistencyCard
        directional={mockDirectionalPerformance}
        consistency={mockConsistencyMetrics}
      />

      {/* 10. Execution Quality, AI Calibration & Intelligence Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ExecutionQualityCard summary={mockAnalyticsSummary} />
        <ConfidenceCalibrationCard data={mockConfidenceCalibration} />
        <HermesFunnelCard stages={mockHermesFunnelStages} />
      </div>

      {/* 11. Hermes Performance Intelligence Review */}
      <HermesAnalyticsPanel review={mockHermesPerformanceReview} />

      {/* Strategy Comparison Modal */}
      <StrategyComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        strategies={mockStrategyPerformance}
      />
    </div>
  );
}
