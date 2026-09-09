"use client";

import React, { useState } from "react";
import { StrategyAnalyticsItem } from "@/lib/mockAnalyticsData";
import { Modal, Button } from "@/components";

interface StrategyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategies: StrategyAnalyticsItem[];
}

export function StrategyComparisonModal({
  isOpen,
  onClose,
  strategies,
}: StrategyComparisonModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    strategies.map((s) => s.id)
  );

  const toggleStrategy = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const comparedStrategies = strategies.filter((s) => selectedIds.includes(s.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quantitative Strategy Comparison"
      size="xl"
    >
      <div className="space-y-4 font-sans text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1">
          <p className="text-text-muted">
            Multi-strategy side-by-side performance comparison across risk, drawdowns, Sharpe, and expectancy metrics.
          </p>

          {/* Strategy Selector Pills */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {strategies.map((s) => {
              const isSelected = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStrategy(s.id)}
                  className={`px-2 py-1 rounded text-xs font-sans border transition-colors ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
                      : "bg-white dark:bg-zinc-900/50 text-gray-400 border-zinc-200 dark:border-white/10 hover:text-gray-200"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50">
                <th className="p-3 text-text-muted font-normal text-xs w-44">METRIC</th>
                {comparedStrategies.map((s) => (
                  <th key={s.id} className="p-3 text-text-primary font-bold text-xs">
                    <span className="text-cyan-400">{s.name}</span>
                    <span className="block text-xs text-text-muted font-normal">
                      {s.version} · {s.status}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr className="bg-white dark:bg-zinc-900/50/20">
                <td className="p-3 text-text-muted font-medium">Net Return</td>
                {comparedStrategies.map((s) => (
                  <td key={s.id} className="p-3 font-bold text-emerald-400 text-sm">
                    +{s.returnPct.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-text-muted">Net P&L</td>
                {comparedStrategies.map((s) => (
                  <td key={s.id} className="p-3 font-bold text-text-primary">
                    +${s.netPnl.toLocaleString()}
                  </td>
                ))}
              </tr>

              <tr className="bg-white dark:bg-zinc-900/50/20">
                <td className="p-3 text-text-muted font-medium">Profit Factor</td>
                {comparedStrategies.map((s) => (
                  <td key={s.id} className="p-3 font-bold text-text-primary">
                    {s.profitFactor.toFixed(2)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-text-muted">Win Rate</td>
                {comparedStrategies.map((s) => (
                  <td key={s.id} className="p-3 text-text-primary">
                    {s.winRate.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="bg-white dark:bg-zinc-900/50/20">
                <td className="p-3 text-text-muted font-medium">Max Drawdown</td>
                {comparedStrategies.map((s) => (
                  <td key={s.id} className="p-3 font-bold text-red-400">
                    {s.maxDrawdown.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-text-muted">Sharpe Ratio</td>
                {comparedStrategies.map((s) => {
                  const sharpe = s.expectancy > 0.4 ? 2.45 : s.expectancy > 0.2 ? 1.82 : 1.34;
                  return (
                    <td key={s.id} className="p-3 text-cyan-300 font-bold">
                      {sharpe.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              <tr className="bg-white dark:bg-zinc-900/50/20">
                <td className="p-3 text-text-muted font-medium">Sortino Ratio</td>
                {comparedStrategies.map((s) => {
                  const sortino = s.expectancy > 0.4 ? 3.12 : s.expectancy > 0.2 ? 2.20 : 1.65;
                  return (
                    <td key={s.id} className="p-3 text-cyan-300 font-bold">
                      {sortino.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-3 text-text-muted">Expectancy</td>
                {comparedStrategies.map((s) => (
                  <td key={s.id} className="p-3 text-cyan-400 font-bold">
                    +{s.expectancy.toFixed(2)}R
                  </td>
                ))}
              </tr>

              <tr className="bg-white dark:bg-zinc-900/50/20">
                <td className="p-3 text-text-muted">Trade Count</td>
                {comparedStrategies.map((s) => (
                  <td key={s.id} className="p-3 text-text-primary">
                    {s.trades} trades
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose} className="text-xs">
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
}
