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
      <div className="space-y-4 font-mono text-xs">
        <p className="text-text-muted text-xs">
          Side-by-side metric comparison across {backtests.length} candidate strategies and parameter runs.
        </p>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded border border-border bg-surface-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2/60">
                <th className="p-3 text-text-muted font-normal text-xs w-44">METRIC</th>
                {backtests.map((b) => (
                  <th key={b.id} className="p-3 text-text-primary font-bold text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-cyan-400">{b.id}</span>
                        <span className="block text-[11px] text-text-muted font-normal">
                          {b.strategyName} {b.strategyVersion}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFromCompare(b.id)}
                        className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-surface-2 transition-colors"
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
                <td className="p-3 text-text-muted">Market & Timeframe</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-text-primary">
                    {b.market} ({b.timeframe})
                  </td>
                ))}
              </tr>

              {/* Net Return */}
              <tr className="bg-surface-2/20">
                <td className="p-3 text-text-muted font-medium">Net Return</td>
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
                <td className="p-3 text-text-muted">Net Realized P&L</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 font-bold text-text-primary">
                    ${b.netPnl.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Max Drawdown */}
              <tr className="bg-surface-2/20">
                <td className="p-3 text-text-muted font-medium">Max Drawdown</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 font-bold text-red-400">
                    {b.maxDrawdown.toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* Profit Factor */}
              <tr>
                <td className="p-3 text-text-muted">Profit Factor</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 font-bold text-text-primary">
                    {b.profitFactor.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Expectancy */}
              <tr className="bg-surface-2/20">
                <td className="p-3 text-text-muted">Expectancy (R)</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-cyan-400 font-bold">
                    {b.expectancy >= 0 ? `+${b.expectancy.toFixed(2)}R` : `${b.expectancy.toFixed(2)}R`}
                  </td>
                ))}
              </tr>

              {/* Win Rate */}
              <tr>
                <td className="p-3 text-text-muted">Win Rate</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-text-primary">
                    {b.winRate.toFixed(1)}% ({b.winningTrades}W / {b.losingTrades}L)
                  </td>
                ))}
              </tr>

              {/* Trade Count */}
              <tr className="bg-surface-2/20">
                <td className="p-3 text-text-muted">Total Trades</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-text-primary">
                    {b.tradeCount} trades
                  </td>
                ))}
              </tr>

              {/* Friction (Fees + Slip) */}
              <tr>
                <td className="p-3 text-text-muted">Friction Drag</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3 text-amber-400">
                    ${b.fees + b.slippage} (${b.fees} fees, ${b.slippage} slip)
                  </td>
                ))}
              </tr>

              {/* Validation Gate */}
              <tr className="bg-surface-2/20">
                <td className="p-3 text-text-muted font-medium">Validation Gate</td>
                {backtests.map((b) => (
                  <td key={b.id} className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
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
          <Button variant="secondary" onClick={onClose} className="text-xs font-mono">
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
}
