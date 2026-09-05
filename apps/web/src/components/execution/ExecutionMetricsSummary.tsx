"use client";

import React from "react";
import { Metric } from "@/components/ui/Metric";
import { ExecutionMetrics } from "@/lib/mockExecutionData";

interface ExecutionMetricsSummaryProps {
  metrics: ExecutionMetrics;
}

export function ExecutionMetricsSummary({ metrics }: ExecutionMetricsSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Metric
        label="Ready to Execute"
        value={metrics.readyToExecute}
        subtext="Approved by owner & risk"
      />
      <Metric
        label="In-Flight / Submitted"
        value={metrics.submitted}
        subtext="Resting on simulated book"
      />
      <Metric
        label="Filled Today"
        value={metrics.filledToday}
        subtext="Completed paper executions"
      />
      <Metric
        label="Fill Rate"
        value={`${metrics.fillRatePercent}%`}
        subtext="0 unhandled rejections"
      />
      <Metric
        label="Avg Execution Time"
        value={`${metrics.avgExecutionTimeMs}ms`}
        subtext="Local match latency"
      />
      <Metric
        label="Avg Slippage"
        value={`+${metrics.avgSlippageBps} bps`}
        subtext="Execution price vs limit"
      />
    </div>
  );
}
