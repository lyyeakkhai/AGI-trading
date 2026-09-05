"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { StrategyStatusBadge } from "./StrategyStatusBadge";
import { StrategyItem } from "@/lib/mockStrategiesData";
import { ChevronRight, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

interface StrategyRegistryTableProps {
  strategies: StrategyItem[];
  selectedStrategyId: string | null;
  onSelectStrategy: (id: string) => void;
}

export function StrategyRegistryTable({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
}: StrategyRegistryTableProps) {
  if (strategies.length === 0) {
    return (
      <Surface variant="default" padded="lg" className="text-center py-12 space-y-2">
        <p className="text-xs font-mono text-gray-400">
          No strategies matched your filter parameters.
        </p>
        <p className="text-[11px] text-gray-500 font-sans">
          Reset filters or adjust search criteria to inspect the registry.
        </p>
      </Surface>
    );
  }

  return (
    <Surface variant="default" padded="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-border-color bg-surface-2/40 text-[10px] text-gray-400 uppercase tracking-wider select-none">
              <th className="py-2.5 px-3">Strategy / Version</th>
              <th className="py-2.5 px-3">Market / TF</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Validation Stage</th>
              <th className="py-2.5 px-3">Paper Status</th>
              <th className="py-2.5 px-3">Live Status</th>
              <th className="py-2.5 px-3">Win Rate</th>
              <th className="py-2.5 px-3">Profit Factor</th>
              <th className="py-2.5 px-3">Updated</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {strategies.map((strat) => {
              const isSelected = strat.id === selectedStrategyId;

              return (
                <tr
                  key={strat.id}
                  onClick={() => onSelectStrategy(strat.id)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? "bg-cyan-500/10 border-l-2 border-l-cyan-400"
                      : "hover:bg-surface-2/60"
                  }`}
                >
                  {/* Strategy Name & Version */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-100 block">
                            {strat.name}
                          </span>
                          <span className="text-[10px] px-1 rounded bg-surface-2 text-cyan-400 border border-border-color">
                            {strat.version}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {strat.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Market & Timeframe */}
                  <td className="py-3 px-3">
                    <span className="text-gray-200 block font-semibold">
                      {strat.primaryMarket}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {strat.primaryTimeframe}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3">
                    <span className="text-gray-300">{strat.type}</span>
                  </td>

                  {/* Validation Stage */}
                  <td className="py-3 px-3">
                    <span className="text-cyan-400 font-semibold block text-[11px]">
                      {strat.validationStage}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Gate audit active
                    </span>
                  </td>

                  {/* Paper Status */}
                  <td className="py-3 px-3">
                    {strat.paperApproved ? (
                      <Badge variant="profit" size="sm">
                        <CheckCircle2 size={10} className="mr-1" />
                        APPROVED
                      </Badge>
                    ) : strat.status === "DRAFT" ? (
                      <Badge variant="cyan" size="sm">
                        DRAFT
                      </Badge>
                    ) : strat.status === "ARCHIVED" ? (
                      <Badge variant="neutral" size="sm">
                        ARCHIVED
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        <Clock size={10} className="mr-1" />
                        PENDING
                      </Badge>
                    )}
                  </td>

                  {/* Live Status */}
                  <td className="py-3 px-3">
                    <Badge variant="neutral" size="sm">
                      <XCircle size={10} className="mr-1 text-gray-500" />
                      LOCKED
                    </Badge>
                  </td>

                  {/* Win Rate */}
                  <td className="py-3 px-3 font-semibold text-gray-200">
                    {strat.performance.winRatePercent > 0
                      ? `${strat.performance.winRatePercent}%`
                      : "—"}
                  </td>

                  {/* Profit Factor */}
                  <td className="py-3 px-3 font-semibold text-cyan-400">
                    {strat.performance.profitFactor > 0
                      ? strat.performance.profitFactor.toFixed(2)
                      : "—"}
                  </td>

                  {/* Updated */}
                  <td className="py-3 px-3 text-[11px] text-gray-500 whitespace-nowrap">
                    {strat.updatedAt}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStrategy(strat.id);
                      }}
                      className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-surface-2 text-gray-400 hover:text-cyan-400 border border-border-color"
                      }`}
                    >
                      <span>Inspect</span>
                      <ChevronRight size={11} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Surface>
  );
}
