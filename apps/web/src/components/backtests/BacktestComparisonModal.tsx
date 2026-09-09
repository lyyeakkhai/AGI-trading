"use client";

import React from "react";
import { BacktestRecord } from "@/lib/mockBacktestsData";
import { Modal, Button } from "@/components";
import { SlidersHorizontal, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface BacktestComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  backtests: BacktestRecord[];
  onRemoveFromCompare: (id: string) => void;
}

export function BacktestComparisonModal({
  isOpen,
  onClose,
  backtests,
  onRemoveFromCompare,
}: BacktestComparisonModalProps) {
  if (backtests.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quantitative Backtest Comparison"
      size="xl"
    >
      <div className="space-y-4 font-sans text-xs">
        <p className="text-gray-500 dark:text-zinc-400 text-xs">
          Side-by-side metric comparison across {backtests.length} candidate strategies and parameter runs.
        </p>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50">
                <th className="p-3 text-gray-500 dark:text-zinc-400 font-normal text-xs w-44">METRIC</th>
                {backtests.map((b) => (
                  <th key={b.id} className="p-3 text-gray-900 dark:text-zinc-50 font-bold text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-cyan-400">{b.id}</span>
                        <span className="block text-[11px] text-gray-500 dark:text-zinc-400 font-normal">
                          {b.strategyName} {b.strategyVersion}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFromCompare(b.id)}
                        className="text-gray-500 dark:text-zinc-400 hover:text-red-400 p-1 rounded-xl hover:bg-gray-50 dark:bg-zinc-800/50 transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {/* Market / Timeframe */}
              <tr>
                <td className="p-3 text-gray-500 dark:text-zinc-400">Market & Timeframe</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-gray-900 dark:text-zinc-50">
                    {b.market} ({b.timeframe})
                  </td>
                ))}
              </tr>

              {/* Net Return */}
              <tr className="bg-gray-50 dark:bg-zinc-800/50">
                <td className="p-3 text-gray-500 dark:text-zinc-400 font-medium">Net Return</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 font-bold text-sm">
                    <span className={b.netReturn >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {b.netReturn >= 0 ? `+${b.netReturn.toFixed(1)}%` : `${b.netReturn.toFixed(1)}%`}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Realized Net P&L */}
              <tr>
                <td className="p-3 text-gray-500 dark:text-zinc-400">Net Realized P&L</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 font-bold text-gray-900 dark:text-zinc-50">
                    ${b.netPnl.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Max Drawdown */}
              <tr className="bg-gray-50 dark:bg-zinc-800/50">
                <td className="p-3 text-gray-500 dark:text-zinc-400 font-medium">Max Drawdown</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 font-bold text-red-400">
                    {b.maxDrawdown.toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* Profit Factor */}
              <tr>
                <td className="p-3 text-gray-500 dark:text-zinc-400">Profit Factor</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 font-bold text-gray-900 dark:text-zinc-50">
                    {b.profitFactor.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Expectancy */}
              <tr className="bg-gray-50 dark:bg-zinc-800/50">
                <td className="p-3 text-gray-500 dark:text-zinc-400">Expectancy (R)</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-cyan-400 font-bold">
                    {b.expectancy >= 0 ? `+${b.expectancy.toFixed(2)}R` : `${b.expectancy.toFixed(2)}R`}
                  </td>
                ))}
              </tr>

              {/* Win Rate */}
              <tr>
                <td className="p-3 text-gray-500 dark:text-zinc-400">Win Rate</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-gray-900 dark:text-zinc-50">
                    {b.winRate.toFixed(1)}% ({b.winningTrades}W / {b.losingTrades}L)
                  </td>
                ))}
              </tr>

              {/* Trade Count */}
              <tr className="bg-gray-50 dark:bg-zinc-800/50">
                <td className="p-3 text-gray-500 dark:text-zinc-400">Total Trades</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-gray-900 dark:text-zinc-50">
                    {b.tradeCount} trades
                  </td>
                ))}
              </tr>

              {/* Friction (Fees + Slip) */}
              <tr>
                <td className="p-3 text-gray-500 dark:text-zinc-400">Friction Drag</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-amber-400">
                    ${b.fees + b.slippage} (${b.fees} fees, ${b.slippage} slip)
                  </td>
                ))}
              </tr>

              {/* Validation Gate */}
              <tr className="bg-gray-50 dark:bg-zinc-800/50">
                <td className="p-3 text-gray-500 dark:text-zinc-400 font-medium">Validation Gate</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[11px] font-bold ${
                        b.validationAssessment.readiness === "READY FOR PAPER TRADING"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {b.validationAssessment.readiness}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose} className="text-xs font-sans">
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
}
