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
   <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-8 text-center space-y-3">
    <p className="text-xs font-sans font-bold tracking-normal text-gray-500 dark:text-zinc-400 ">
     No Positions Matched
    </p>
    <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans tracking-normal">
     Try adjusting your filters.
    </p>
   </div>
  );
 }

 return (
  <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 overflow-hidden">
   <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse text-xs font-sans">
     <thead>
      <tr className="border-b border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 rounded-xl text-xs text-gray-500 dark:text-zinc-400 font-bold tracking-normal select-none">
       <th className="py-3 px-4">Symbol / Side</th>
       <th className="py-3 px-4">Size / Value</th>
       <th className="py-3 px-4">Entry Price</th>
       {isClosedView ? (
        <th className="py-3 px-4">Exit Price</th>
       ) : (
        <>
         <th className="py-3 px-4">Current Price</th>
         <th className="py-3 px-4">Stop Loss</th>
         <th className="py-3 px-4">Take Profit</th>
        </>
       )}
       <th className="py-3 px-4">
        {isClosedView ? "Realized P&L" : "Unrealized P&L"}
       </th>
       {isClosedView ? (
        <th className="py-3 px-4">Duration</th>
       ) : (
        <th className="py-3 px-4">Exposure</th>
       )}
       <th className="py-3 px-4">Strategy</th>
       <th className="py-3 px-4">
        {isClosedView ? "Time Closed" : "Time Opened"}
       </th>
       <th className="py-3 px-4">Status</th>
       <th className="py-3 px-4 text-right">Actions</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-gray-100 dark:divide-white/5">
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
            <span className="font-semibold text-gray-900 dark:text-zinc-50 block tracking-tight">
             {pos.symbol}
            </span>
            <span className="text-xs font-sans text-gray-400 dark:text-zinc-500 tracking-normal ">
             {pos.id.split('-')[0]}
            </span>
           </div>
          </div>
         </td>

         {/* Size / Value */}
         <td className="py-4 px-4">
          <span className="text-gray-800 dark:text-zinc-200 block font-bold tracking-tight">
           {pos.quantity} <span className="text-gray-400 dark:text-zinc-500 text-xs tracking-normal">{pos.quantityUnit}</span>
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 font-sans tracking-normal">
           ${pos.positionValue.toLocaleString()}
          </span>
         </td>

         {/* Entry Price */}
         <td className="py-4 px-4 text-gray-600 dark:text-zinc-300 font-semibold tracking-tight">
          ${pos.entryPrice.toLocaleString()}
         </td>

         {/* Current / Exit */}
         {isClosedView ? (
          <td className="py-4 px-4 text-gray-800 dark:text-zinc-200 font-semibold tracking-tight">
           ${pos.exitPrice?.toLocaleString()}
          </td>
         ) : (
          <>
           <td className="py-4 px-4 font-semibold text-gray-900 dark:text-zinc-50 tracking-tight">
            ${pos.currentPrice.toLocaleString()}
           </td>
           <td className="py-4 px-4 text-red-500 font-semibold tracking-tight">
            ${pos.stopLoss.toLocaleString()}
           </td>
           <td className="py-4 px-4 text-green-500 font-semibold tracking-tight">
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
           <span className="text-gray-500 dark:text-zinc-400 font-sans tracking-normal text-xs">{pos.duration}</span>
          ) : (
           <div className="flex items-center gap-2">
            <span className="text-gray-800 dark:text-zinc-200 font-semibold tracking-tight">
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
          <span className="text-gray-500 dark:text-zinc-400 font-bold tracking-normal text-xs block">
           {pos.strategy}
          </span>
         </td>

         {/* Opened / Closed */}
         <td className="py-4 px-4 text-xs font-bold tracking-normal text-gray-400 dark:text-zinc-500 whitespace-nowrap">
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
           className={`inline-flex items-center gap-1.5 text-xs font-sans font-bold tracking-normal px-2.5 py-1.5 transition-colors ${
            isSelected
             ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
             : "bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-white/5 hover:text-cyan-500 hover:border-cyan-900"
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
  </div>
 );
}
