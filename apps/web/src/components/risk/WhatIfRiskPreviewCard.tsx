"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";

interface WhatIfRiskPreviewCardProps {
  currentPortfolioRisk?: number;
  maxPortfolioRisk?: number;
}

export function WhatIfRiskPreviewCard({
  currentPortfolioRisk = 1.8,
  maxPortfolioRisk = 5.0,
}: WhatIfRiskPreviewCardProps) {
  const [proposedSymbol, setProposedSymbol] = useState("BTC/USDT");
  const [proposedRisk, setProposedRisk] = useState("0.8");
  const [proposedRR, setProposedRR] = useState("2.4");

  const propRiskNum = parseFloat(proposedRisk) || 0;
  const propRRNum = parseFloat(proposedRR) || 0;
  const riskAfter = currentPortfolioRisk + propRiskNum;

  const isRiskPassed = riskAfter <= maxPortfolioRisk && propRiskNum <= 1.0;
  const isRRPassed = propRRNum >= 1.5;
  const overallPass = isRiskPassed && isRRPassed;

  return (
    <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <PlayCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-sans font-semibold tracking-normal text-gray-900 dark:text-zinc-50">
              What-If Proposal Risk Simulator
            </h3>
            <p className="text-xs font-sans tracking-tight text-gray-500 dark:text-zinc-400">
              Pre-check impact on total risk envelope before accepting Hermes proposals
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-sans tracking-tight font-bold ${
            overallPass
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {overallPass ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {overallPass ? "SIMULATION PASS" : "SIMULATION BREACH"}
        </span>
      </div>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-3 gap-2 mb-3 font-sans tracking-tight text-xs">
        <div>
          <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Candidate Asset
          </label>
          <select
            value={proposedSymbol}
            onChange={(e) => setProposedSymbol(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-lg p-1.5 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/40 text-xs"
          >
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Proposed Risk %
          </label>
          <input
            type="number"
            step="0.1"
            value={proposedRisk}
            onChange={(e) => setProposedRisk(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-lg p-1.5 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/40 text-xs"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Target R:R
          </label>
          <input
            type="number"
            step="0.1"
            value={proposedRR}
            onChange={(e) => setProposedRR(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-lg p-1.5 text-gray-900 dark:text-zinc-50 focus:outline-none focus:border-cyan-500/40 text-xs"
          />
        </div>
      </div>

      {/* Simulated Outcomes */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5 font-sans tracking-tight text-xs">
        <div>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">Risk Before</span>
          <span className="text-base font-bold text-gray-900 dark:text-zinc-50">
            {currentPortfolioRisk.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">Existing positions</span>
        </div>

        <div>
          <span className="text-xs text-cyan-400 block">Risk After Trade</span>
          <span className={`text-base font-bold ${riskAfter <= maxPortfolioRisk ? "text-emerald-400" : "text-red-400"}`}>
            {riskAfter.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            Limit: {maxPortfolioRisk.toFixed(1)}% max
          </span>
        </div>

        <div>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block">R:R Evaluation</span>
          <span className={`text-base font-bold ${isRRPassed ? "text-cyan-400" : "text-red-400"}`}>
            {propRRNum.toFixed(1)}R
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
            {isRRPassed ? "Meets 1.5R floor" : "Fails 1.5R floor"}
          </span>
        </div>
      </div>
    </div>
  );
}
