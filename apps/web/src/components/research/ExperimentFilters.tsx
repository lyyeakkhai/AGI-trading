"use client";
import React from "react";
import type { ExperimentStatus, ExperimentCategory, ConclusionOutcome } from "@/lib/researchApi";

interface Props {
  status: string;
  category: string;
  asset: string;
  conclusion: string;
  onStatusChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onAssetChange: (v: string) => void;
  onConclusionChange: (v: string) => void;
}

const select = "bg-[#0E0E0E] border border-[#222B32] text-xs font-mono text-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-600 appearance-none cursor-pointer";

export function ExperimentFilters({ status, category, asset, conclusion, onStatusChange, onCategoryChange, onAssetChange, onConclusionChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select className={select} value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="">All Statuses</option>
        {(["DRAFT","READY","RUNNING","COMPLETED","VALIDATED","REJECTED","ARCHIVED"] as ExperimentStatus[]).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select className={select} value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">All Categories</option>
        {(["trend_following","breakout","momentum","mean_reversion","volatility","volume","market_structure","multi_factor","other"] as ExperimentCategory[]).map(c => (
          <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
        ))}
      </select>
      <select className={select} value={asset} onChange={(e) => onAssetChange(e.target.value)}>
        <option value="">All Assets</option>
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
      </select>
      <select className={select} value={conclusion} onChange={(e) => onConclusionChange(e.target.value)}>
        <option value="">All Conclusions</option>
        {(["SUPPORTED","PARTIALLY_SUPPORTED","REJECTED","INCONCLUSIVE"] as ConclusionOutcome[]).map(o => (
          <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}
