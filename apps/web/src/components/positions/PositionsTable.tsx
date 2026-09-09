"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { PositionSide } from "@/features/trading/components/PositionSide";
import { PnLDisplay } from "@/features/trading/components/PnLDisplay";
import { PositionStatusBadge } from "./PositionStatusBadge";
import { PositionItem } from "@/lib/mockPositionsData";
import { ChevronRight, ShieldAlert, AlertTriangle } from "lucide-react";
import { CryptoIcon } from "@/components/ui/CryptoIcon";

interface PositionsTableProps {
  positions: PositionItem[];
  selectedPositionId: string | null;
  onSelectPosition: (id: string) => void;
  isClosedView?: boolean;
}

export function PositionsTable({
  positions,
  selectedPositionId,
  onSelectPosition,
  isClosedView = false,
}: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <Surface variant="default" padded="lg" className="text-center py-12 space-y-2">
        <p className="text-xs font-mono text-gray-400">
          No positions matched your selected filter criteria.
        </p>
        <p className="text-[11px] text-gray-500 font-sans">
          Clear filters or search terms to see active positions.
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
              <th className="py-2.5 px-3">Symbol / Side</th>
              <th className="py-2.5 px-3">Size / Value</th>
              <th className="py-2.5 px-3">Entry</th>
              {isClosedView ? (
                <th className="py-2.5 px-3">Exit Price</th>
              ) : (
                <>
                  <th className="py-2.5 px-3">Current</th>
                  <th className="py-2.5 px-3">Stop Loss</th>
                  <th className="py-2.5 px-3">Take Profit</th>
                </>
              )}
              <th className="py-2.5 px-3">
                {isClosedView ? "Realized P&L" : "Unrealized P&L"}
              </th>
              {isClosedView ? (
                <th className="py-2.5 px-3">Duration</th>
              ) : (
                <th className="py-2.5 px-3">Exposure</th>
              )}
              <th className="py-2.5 px-3">Strategy</th>
              <th className="py-2.5 px-3">
                {isClosedView ? "Closed" : "Opened"}
              </th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {positions.map((pos) => {
              const isSelected = pos.id === selectedPositionId;

              return (
                <tr
                  key={pos.id}
                  onClick={() => onSelectPosition(pos.id)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? "bg-cyan-500/10 border-l-2 border-l-cyan-400"
                      : "hover:bg-surface-2/60"
                  }`}
                >
                  {/* Symbol & Side */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={pos.symbol} size="sm" />
                      <PositionSide side={pos.side} size="sm" />
                      <div>
                        <span className="font-bold text-gray-100 block">
                          {pos.symbol}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {pos.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Size / Value */}
                  <td className="py-3 px-3">
                    <span className="text-gray-200 block font-semibold">
                      {pos.quantity} {pos.quantityUnit}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      ${pos.positionValue.toLocaleString()}
                    </span>
                  </td>

                  {/* Entry Price */}
                  <td className="py-3 px-3 text-gray-300">
                    ${pos.entryPrice.toLocaleString()}
                  </td>

                  {/* Current / Exit */}
                  {isClosedView ? (
                    <td className="py-3 px-3 text-gray-200 font-semibold">
                      ${pos.exitPrice?.toLocaleString()}
                    </td>
                  ) : (
                    <>
                      <td className="py-3 px-3 font-semibold text-gray-100">
                        ${pos.currentPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-loss">
                        ${pos.stopLoss.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-profit">
                        ${pos.takeProfit.toLocaleString()}
                      </td>
                    </>
                  )}

                  {/* P&L */}
                  <td className="py-3 px-3">
                    {isClosedView ? (
                      <PnLDisplay
                        amount={pos.realizedPnl}
                        percentage={
                          (pos.realizedPnl / pos.positionValue) * 100
                        }
                        size="sm"
                      />
                    ) : (
                      <PnLDisplay
                        amount={pos.unrealizedPnl}
                        percentage={pos.unrealizedPnlPercent}
                        size="sm"
                      />
                    )}
                  </td>

                  {/* Duration or Exposure */}
                  <td className="py-3 px-3">
                    {isClosedView ? (
                      <span className="text-gray-400">{pos.duration}</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-200 font-bold">
                          {pos.exposurePercent}%
                        </span>
                        {pos.riskState === "ELEVATED" && (
                          <span title="Elevated risk state">
                            <AlertTriangle
                              size={12}
                              className="text-warning shrink-0"
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Strategy */}
                  <td className="py-3 px-3">
                    <span className="text-gray-300 max-w-[130px] truncate block">
                      {pos.strategy}
                    </span>
                  </td>

                  {/* Opened / Closed */}
                  <td className="py-3 px-3 text-[11px] text-gray-500 whitespace-nowrap">
                    {isClosedView ? pos.closedAt || "Closed" : pos.openedAt}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <PositionStatusBadge status={pos.status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPosition(pos.id);
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
