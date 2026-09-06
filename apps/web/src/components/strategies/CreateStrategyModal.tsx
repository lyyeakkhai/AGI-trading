"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { StrategyItem, StrategyType } from "@/lib/mockStrategiesData";
import { Sparkles } from "lucide-react";

interface CreateStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStrategy: (strategy: StrategyItem) => void;
}

export function CreateStrategyModal({
  isOpen,
  onClose,
  onCreateStrategy,
}: CreateStrategyModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [market, setMarket] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1H");
  const [type, setType] = useState<StrategyType>("Momentum");
  const [initialIdea, setInitialIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStrategy: StrategyItem = {
      id: `STRAT-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      version: "v0.1",
      status: "DRAFT",
      type,
      primaryMarket: market,
      primaryTimeframe: timeframe,
      validationStage: "Trading Idea",
      paperApproved: false,
      liveApproved: false,
      updatedAt: "Just now",
      updatedTimestamp: Date.now(),
      definition: {
        marketUniverse: [market],
        timeframes: [timeframe],
        description:
          description.trim() ||
          "Newly registered algorithmic trading hypothesis under initial definition.",
        entryConditions: [initialIdea.trim() || "Initial breakout or momentum trigger"],
        exitConditions: ["Risk model stop loss", "Take profit target"],
        invalidationConditions: ["Structure invalidation rule"],
        defaultRiskPercent: 0.50,
        maxRiskPercent: 1.00,
        typicalRR: "2.0R",
        maxConcurrentPositions: 1,
        preferredRegime: "Under Evaluation",
      },
      validationGates: [
        {
          id: "GATE-01",
          name: "Historical Backtest",
          status: "NOT_STARTED",
          threshold: "Pending formal parameter coding",
          actual: "Unvalidated Idea",
        },
        {
          id: "GATE-02",
          name: "Out-of-Sample",
          status: "NOT_STARTED",
          threshold: "Gate 1 required",
          actual: "Locked",
        },
        {
          id: "GATE-03",
          name: "Walk-Forward",
          status: "NOT_STARTED",
          threshold: "Gate 2 required",
          actual: "Locked",
        },
        {
          id: "GATE-04",
          name: "Paper Trading",
          status: "NOT_STARTED",
          threshold: "Gate 3 required",
          actual: "Locked",
        },
        {
          id: "GATE-05",
          name: "Tiny Live",
          status: "NOT_STARTED",
          threshold: "Pilot approval",
          actual: "Locked",
        },
        {
          id: "GATE-06",
          name: "Final Evaluation",
          status: "NOT_STARTED",
          threshold: "Certification",
          actual: "Locked",
        },
      ],
      performance: {
        netReturnPercent: 0,
        winRatePercent: 0,
        profitFactor: 0,
        expectancy: "—",
        maxDrawdownPercent: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        totalTrades: 0,
        avgWinner: "—",
        avgLoser: "—",
        equityCurve: [{ step: 1, equity: 10000 }],
      },
      usage: {
        activeOpportunitiesCount: 0,
        pendingProposalsCount: 0,
        openPositionsCount: 0,
        closedPositionsCount: 0,
        samplePositions: [],
      },
      versions: [
        {
          version: "v0.1",
          status: "Draft",
          createdAt: "Just now",
          changeSummary: "Initial draft creation in strategy registry.",
        },
      ],
      hermesContext: {
        activeMarkets: [market],
        timeframe,
        currentUsage: "Draft state. Not attached to live Hermes radar.",
        assessment:
          "Draft hypothesis created by owner. Ready for formal parameter specification and backtesting.",
      },
    };

    onCreateStrategy(newStrategy);
    setName("");
    setDescription("");
    setInitialIdea("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Strategy Draft"
      subtitle="Register a formal trading hypothesis into the strategy validation pipeline."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {/* Strategy Name */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
            Strategy Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Volatility Compression Rebound"
            required
            className="w-full"
          />
        </div>

        {/* Market & Timeframe */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
              Primary Market
            </label>
            <Select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              options={[
                { value: "BTC/USDT", label: "BTC/USDT" },
                { value: "ETH/USDT", label: "ETH/USDT" },
                { value: "Multi-Asset", label: "Multi-Asset (BTC + ETH)" },
              ]}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
              Primary Timeframe
            </label>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              options={[
                { value: "15M", label: "15M (Intraday)" },
                { value: "1H", label: "1H (Swing)" },
                { value: "4H", label: "4H (Macro)" },
                { value: "1D", label: "1D (Daily)" },
              ]}
            />
          </div>
        </div>

        {/* Strategy Type */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
            Strategy Type
          </label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as StrategyType)}
            options={[
              { value: "Trend", label: "Trend Following" },
              { value: "Breakout", label: "Breakout Continuation" },
              { value: "Mean Reversion", label: "Mean Reversion" },
              { value: "Momentum", label: "Momentum Expansion" },
              { value: "Volatility", label: "Volatility Cascade Reversal" },
            ]}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of market edge and technical thesis..."
            rows={2}
            className="w-full bg-bg-950 border border-border-color rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Initial Idea / Entry Thesis */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
            Initial Entry Thesis
          </label>
          <textarea
            value={initialIdea}
            onChange={(e) => setInitialIdea(e.target.value)}
            placeholder="Key technical triggers or quantitative conditions for entering..."
            rows={2}
            className="w-full bg-bg-950 border border-border-color rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-color">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            <Sparkles size={12} className="mr-1.5" />
            Create Draft Strategy
          </Button>
        </div>
      </form>
    </Modal>
  );
}
