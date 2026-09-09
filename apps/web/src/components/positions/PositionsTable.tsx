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
      <div className="bg-black border border-zinc-800 p-8 text-center space-y-3">
        <p className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
          SYS_MSG: 404_NO_POSITIONS_MATCHED
        </p>
        <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
          AWAITING_NEW_SIGNALS
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 text-[10px] text-zinc-500 font-bold uppercase tracking-widest select-none">
              <th className="py-3 px-4">SYM / DIR</th>
              <th className="py-3 px-4">SIZE_VAL</th>
              <th className="py-3 px-4">ENT_PRC</th>
              {isClosedView ? (
                <th className="py-3 px-4">EXT_PRC</th>
              ) : (
                <>
                  <th className="py-3 px-4">CUR_PRC</th>
                  <th className="py-3 px-4">STP_LSS</th>
                  <th className="py-3 px-4">TK_PRFT</th>
                </>
              )}
              <th className="py-3 px-4">
                {isClosedView ? "RLZ_PNL" : "UNRLZ_PNL"}
              </th>
              {isClosedView ? (
                <th className="py-3 px-4">DUR</th>
              ) : (
                <th className="py-3 px-4">EXP</th>
              )}
              <th className="py-3 px-4">STRAT</th>
              <th className="py-3 px-4">
                {isClosedView ? "T_CLS" : "T_OPN"}
              </th>
              <th className="py-3 px-4">STAT</th>
              <th className="py-3 px-4 text-right">ACT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {positions.map((pos) => {
              const isSelected = pos.id === selectedPositionId;

              return (
                <tr
                  key={pos.id}
                  onClick={() => onSelectPosition(pos.id)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? "bg-zinc-900/50 border-l-2 border-l-cyan-500"
                      : "hover:bg-zinc-950"
                  }`}
                >
                  {/* Symbol & Side */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol={pos.symbol} size="sm" />
                      <PositionSide side={pos.side} size="sm" />
                      <div>
                        <span className="font-black text-zinc-100 block tracking-tight">
                          {pos.symbol}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">
                          {pos.id.split('-')[0]}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Size / Value */}
                  <td className="py-4 px-4">
                    <span className="text-zinc-300 block font-bold tracking-tight">
                      {pos.quantity} <span className="text-zinc-600 text-[10px] tracking-widest">{pos.quantityUnit}</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest">
                      ${pos.positionValue.toLocaleString()}
                    </span>
                  </td>

                  {/* Entry Price */}
                  <td className="py-4 px-4 text-zinc-400 font-black tracking-tight">
                    ${pos.entryPrice.toLocaleString()}
                  </td>

                  {/* Current / Exit */}
                  {isClosedView ? (
                    <td className="py-4 px-4 text-zinc-300 font-black tracking-tight">
                      ${pos.exitPrice?.toLocaleString()}
                    </td>
                  ) : (
                    <>
                      <td className="py-4 px-4 font-black text-zinc-100 tracking-tight">
                        ${pos.currentPrice.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-red-500 font-black tracking-tight">
                        ${pos.stopLoss.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-green-500 font-black tracking-tight">
                        ${pos.takeProfit.toLocaleString()}
                      </td>
                    </>
                  )}

                  {/* P&L */}
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4">
                    {isClosedView ? (
                      <span className="text-zinc-500 font-mono tracking-widest uppercase text-[10px]">{pos.duration}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-300 font-black tracking-tight">
                          {pos.exposurePercent}%
                        </span>
                        {pos.riskState === "ELEVATED" && (
                          <span title="Elevated risk state">
                            <AlertTriangle
                              size={12}
                              className="text-yellow-500 shrink-0"
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Strategy */}
                  <td className="py-4 px-4">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] block">
                      {pos.strategy}
                    </span>
                  </td>

                  {/* Opened / Closed */}
                  <td className="py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-zinc-600 whitespace-nowrap">
                    {isClosedView ? pos.closedAt || "CLOSED" : pos.openedAt}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <PositionStatusBadge status={pos.status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPosition(pos.id);
                      }}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 transition-colors ${
                        isSelected
                          ? "bg-cyan-950 text-cyan-500 border border-cyan-900"
                          : "bg-black text-zinc-500 border border-zinc-800 hover:text-cyan-500 hover:border-cyan-900"
                      }`}
                    >
                      <span>INSP</span>
                      <ChevronRight size={11} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
