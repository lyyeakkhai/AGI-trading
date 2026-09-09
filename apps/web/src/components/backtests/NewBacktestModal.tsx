"use client";

import React, { useState } from "react";
import { Modal, Button } from "@/components";
import { Play, Loader2, CheckCircle2, Sliders, DollarSign, Calendar } from "lucide-react";
import { BacktestRecord } from "@/lib/mockBacktestsData";

interface NewBacktestModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategies: { id: string; name: string; version: string }[];
  onBacktestCreated: (newBt: BacktestRecord) => void;
}

export function NewBacktestModal({
  isOpen,
  onClose,
  strategies,
  onBacktestCreated,
}: NewBacktestModalProps) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || "STRAT-001");
  const [market, setMarket] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1H");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [initialCapital, setInitialCapital] = useState("10000");
  const [feeModel, setFeeModel] = useState("0.10%");
  const [slippage, setSlippage] = useState("0.05%");

  // Execution flow state: idle | configuring | running | completed
  const [executionState, setExecutionState] = useState<"idle" | "configuring" | "running" | "completed">("idle");
  const [progressPct, setProgressPct] = useState(0);

  const selectedStrategy = strategies.find((s) => s.id === strategyId) || strategies[0];

  const handleRun = () => {
    setExecutionState("configuring");
    setProgressPct(15);

    setTimeout(() => {
      setExecutionState("running");
      setProgressPct(45);
    }, 700);

    setTimeout(() => {
      setProgressPct(85);
    }, 1400);

    setTimeout(() => {
      setExecutionState("completed");
      setProgressPct(100);

      const newId = `BT-00${Math.floor(43 + Math.random() * 50)}`;
      const capitalNum = parseFloat(initialCapital) || 10000;
      const netReturn = 21.4;
      const netPnl = Math.round(capitalNum * (netReturn / 100));

      const newBacktest: BacktestRecord = {
        id: newId,
        strategyId: selectedStrategy.id,
        strategyName: selectedStrategy.name,
        strategyVersion: selectedStrategy.version,
        market,
        timeframe,
        startDate,
        endDate,
        initialCapital: capitalNum,
        finalEquity: capitalNum + netPnl,
        grossPnl: netPnl + 280,
        netPnl,
        netReturn,
        maxDrawdown: -7.8,
        averageDrawdown: -2.4,
        longestDrawdown: "24 days",
        winRate: 62.5,
        profitFactor: 1.76,
        expectancy: 0.38,
        tradeCount: 142,
        winningTrades: 89,
        losingTrades: 53,
        averageWinner: 1.32,
        averageLoser: -0.88,
        largestWinner: 3.5,
        largestLoser: -1.9,
        averageHoldingTime: "6h 15m",
        fees: 180,
        slippage: 100,
        executionModel: `Simulated (${feeModel} fees + ${slippage} slip)`,
        status: "completed",
        createdAt: new Date().toISOString(),
        equityCurve: [
          { time: startDate, value: capitalNum },
          { time: "2025-06-01", value: capitalNum + 800 },
          { time: "2025-12-01", value: capitalNum + 1400 },
          { time: "2026-04-01", value: capitalNum + 1750 },
          { time: endDate, value: capitalNum + netPnl },
        ],
        drawdownCurve: [
          { time: startDate, value: 0 },
          { time: "2025-06-01", value: -1.4 },
          { time: "2025-12-01", value: 0 },
          { time: "2026-04-01", value: -5.2 },
          { time: endDate, value: -1.1 },
        ],
        trades: [
          {
            id: `TR-${newId}-1`,
            date: "2025-01-10 14:00",
            symbol: market,
            side: "LONG",
            entryPrice: 42000,
            exitPrice: 43200,
            pnl: 120,
            rMultiple: 1.5,
            duration: "8h 10m",
            exitReason: "Target",
          },
        ],
        regimePerformance: [
          { regime: "Trending Bullish", returnPct: 16.4, profitFactor: 1.95, tradeCount: 68, winRate: 67.6 },
          { regime: "Ranging Consolidation", returnPct: 4.1, profitFactor: 1.25, tradeCount: 50, winRate: 58.0 },
          { regime: "High Volatility Expansion", returnPct: -1.2, profitFactor: 0.94, tradeCount: 24, winRate: 46.0 },
        ],
        timeframePerformance: [
          { timeframe, returnPct: netReturn, profitFactor: 1.76, tested: true },
        ],
        assetPerformance: [
          { asset: market, returnPct: netReturn, profitFactor: 1.76, trades: 142 },
        ],
        oosResults: {
          trainingPeriod: "2025-01-01 → 2025-12-31",
          testingPeriod: "2026-01-01 → 2026-08-31",
          trainingReturn: 16.2,
          oosReturn: 9.8,
          oosProfitFactor: 1.55,
          oosMaxDrawdown: -7.8,
          status: "PASS",
        },
        walkForwardResults: {
          windows: [
            { id: "W1", name: "Window 01", status: "PASS", returnPct: 5.2, pf: 1.68 },
            { id: "W2", name: "Window 02", status: "PASS", returnPct: 4.8, pf: 1.62 },
          ],
          overall: "PASS",
        },
        validationAssessment: {
          historicalBacktest: "PASS",
          outOfSample: "PASS",
          walkForward: "PASS",
          costsIncluded: "PASS",
          dataCoverage: "PASS",
          summary: "Simulation completed cleanly across the designated timeframe. Edge holds after modeled fees.",
          readiness: "READY FOR PAPER TRADING",
        },
        hermesReview: {
          status: "Validated",
          assessment: "Simulation parameters validated. Positive expectancy demonstrated with controlled max drawdown.",
          recommendation: "Approved for forward paper trading validation.",
        },
      };

      setTimeout(() => {
        onBacktestCreated(newBacktest);
        handleClose();
      }, 700);
    }, 2100);
  };

  const handleClose = () => {
    setExecutionState("idle");
    setProgressPct(0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Configure Quantitative Backtest"
      size="lg"
    >
      <div className="space-y-4 font-sans text-xs">
        <p className="text-gray-500 dark:text-zinc-400">
          Define reproducible market parameters, timeframe, date boundaries, and realistic friction assumptions.
        </p>

        {executionState === "idle" ? (
          <div className="space-y-3">
            {/* Strategy Selection */}
            <div>
              <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                Strategy
              </label>
              <select
                value={strategyId}
                onChange={(e) => setStrategyId(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
              >
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.version})
                  </option>
                ))}
              </select>
            </div>

            {/* Market & Timeframe */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                  Market
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="BTC/USDT">BTC/USDT</option>
                  <option value="ETH/USDT">ETH/USDT</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="5M">5M</option>
                  <option value="15M">15M</option>
                  <option value="1H">1H</option>
                  <option value="4H">4H</option>
                  <option value="1D">1D</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Capital & Fees */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                  Initial Capital ($)
                </label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                  Fee Model
                </label>
                <input
                  type="text"
                  value={feeModel}
                  onChange={(e) => setFeeModel(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-zinc-400 uppercase mb-1">
                  Slippage Model
                </label>
                <input
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 shadow-sm border border-gray-200 dark:border-white/5 rounded-xl p-2 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-gray-500 dark:text-zinc-400 text-[11px]">
              Note: Simulation executes across historical local tick datasets. Results are deterministic and subject to multi-stage out-of-sample and walk-forward verification.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-white/5">
              <Button variant="secondary" onClick={handleClose} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRun} className="text-xs flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                <span>Run Backtest</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Running Progress State */
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
            {executionState === "completed" ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            ) : (
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            )}

            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-50 uppercase tracking-wide">
                {executionState === "configuring" && "Configuring Simulation Engine..."}
                {executionState === "running" && "Executing Tick-Level Simulation..."}
                {executionState === "completed" && "Simulation Complete & Validated!"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Processing {market} ({timeframe}) dataset across {startDate} → {endDate}
              </p>
            </div>

            <div className="w-full max-w-sm bg-gray-50 dark:bg-zinc-800/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-cyan-400">{progressPct}% complete</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
