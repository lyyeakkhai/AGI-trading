"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";

interface PositionSizeCalculatorCardProps {
  initialEquity?: number;
}

export function PositionSizeCalculatorCard({
  initialEquity = 12480,
}: PositionSizeCalculatorCardProps) {
  const [equity, setEquity] = useState(initialEquity.toString());
  const [riskPercent, setRiskPercent] = useState("1.0");
  const [entryPrice, setEntryPrice] = useState("114000");
  const [stopPrice, setStopPrice] = useState("112500");

  const eqNum = parseFloat(equity) || 0;
  const riskPctNum = parseFloat(riskPercent) || 0;
  const entryNum = parseFloat(entryPrice) || 0;
  const stopNum = parseFloat(stopPrice) || 0;

  const priceDiff = Math.abs(entryNum - stopNum);
  const riskAmount = (eqNum * riskPctNum) / 100;
  const positionUnits = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const notionalValue = positionUnits * entryNum;

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              Position Sizing Calculator
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Deterministic capital allocation based on stop-loss distance
            </p>
          </div>
        </div>
        <span className="text-xs font-sans tracking-tight text-cyan-400">
          Risk = Equity × Risk%
        </span>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-sans tracking-tight text-xs">
        <div>
          <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Account Equity ($)
          </label>
          <input
            type="number"
            value={equity}
            onChange={(e) => setEquity(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-lg p-1.5 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/40 text-xs"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Risk % Per Trade
          </label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-lg p-1.5 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/40 text-xs"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Entry Price ($)
          </label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-lg p-1.5 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/40 text-xs"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Stop Price ($)
          </label>
          <input
            type="number"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-lg p-1.5 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/40 text-xs"
          />
        </div>
      </div>

      {/* Computed Outputs */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 font-sans tracking-tight text-xs">
        <div>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Risk Capital</span>
          <span className="text-base font-bold text-emerald-400">
            ${riskAmount.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            {riskPctNum}% of equity
          </span>
        </div>

        <div>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Position Size</span>
          <span className="text-base font-bold text-cyan-400">
            {positionUnits.toFixed(4)} Units
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            Stop dist: ${priceDiff.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Notional Exposure</span>
          <span className="text-base font-bold text-gray-900 dark:text-zinc-50">
            ${notionalValue.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            {eqNum > 0 ? `${((notionalValue / eqNum) * 100).toFixed(1)}% portfolio` : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
