"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { PositionItem } from "@/lib/mockPositionsData";
import { ArrowUpRight, ArrowDownRight, Target, ShieldAlert, Crosshair } from "lucide-react";

interface PositionPriceLevelsProps {
  position: PositionItem;
  className?: string;
}

export function PositionPriceLevels({
  position,
  className = "",
}: PositionPriceLevelsProps) {
  const isLong = position.side === "LONG";

  // Calculate percentage distances from current price
  const toStopPct = Math.abs(
    ((position.currentPrice - position.stopLoss) / position.currentPrice) * 100
  ).toFixed(2);

  const toTargetPct = Math.abs(
    ((position.takeProfit - position.currentPrice) / position.currentPrice) * 100
  ).toFixed(2);

  // Profit / Loss distance in points
  const stopDistancePts = Math.abs(position.entryPrice - position.stopLoss).toLocaleString();
  const targetDistancePts = Math.abs(position.takeProfit - position.entryPrice).toLocaleString();

  return (
    <Surface variant="default" padded="md" className={`space-y-4 ${className}`}>
      {/* Title & R:R */}
      <div className="flex items-center justify-between border-b border-border-color pb-2">
        <div className="flex items-center gap-2">
          <Crosshair size={14} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase text-gray-200">
            Execution Price Ladder
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-400">Risk:Reward</span>
          <span className="font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
            {position.riskReward}
          </span>
        </div>
      </div>

      {/* Vertical Ladder Layout */}
      <div className="space-y-2 font-mono text-xs">
        {/* 1. Take Profit (Upper Bound) */}
        <div className="flex items-center justify-between p-2.5 rounded bg-bg-950 border border-profit/30 text-profit">
          <div className="flex items-center gap-2">
            <Target size={14} className="shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">
                Take Profit
              </span>
              <span className="text-sm font-bold text-profit">
                ${position.takeProfit.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">From Current</span>
            <span className="text-profit font-semibold">
              +{toTargetPct}% ({targetDistancePts} pts)
            </span>
          </div>
        </div>

        {/* 2. Current Market Price (Active Level) */}
        <div className="flex items-center justify-between p-2.5 rounded bg-surface-2/80 border border-cyan-500/40 text-gray-200 shadow-[0_0_12px_rgba(0,229,255,0.08)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <span className="text-[10px] text-cyan-400 font-semibold block uppercase">
                Current Market Price
              </span>
              <span className="text-sm font-bold text-gray-100">
                ${position.currentPrice.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">P&L Status</span>
            <span
              className={`font-semibold ${
                position.unrealizedPnl >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {position.unrealizedPnl >= 0 ? "+" : ""}
              ${position.unrealizedPnl.toFixed(2)} ({position.unrealizedPnlPercent > 0 ? "+" : ""}
              {position.unrealizedPnlPercent}%)
            </span>
          </div>
        </div>

        {/* 3. Entry Trigger */}
        <div className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color text-gray-300">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase">
              Entry Price
            </span>
            <span className="font-bold text-gray-200">
              ${position.entryPrice.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block">Execution</span>
            <span className="text-gray-400 text-[11px]">{position.openedAt}</span>
          </div>
        </div>

        {/* 4. Stop Loss (Lower Bound) */}
        <div className="flex items-center justify-between p-2.5 rounded bg-bg-950 border border-loss/30 text-loss">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">
                Stop Loss (Hard Gate)
              </span>
              <span className="text-sm font-bold text-loss">
                ${position.stopLoss.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">Stop Buffer</span>
            <span className="text-loss font-semibold">
              -{toStopPct}% ({stopDistancePts} pts)
            </span>
          </div>
        </div>
      </div>

      {/* Sizing & Capital Allocation Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-color text-xs font-mono">
        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 block uppercase">Position Size</span>
          <span className="text-gray-200 font-bold">
            {position.quantity} {position.quantityUnit}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 block uppercase">Notional Value</span>
          <span className="text-gray-200 font-bold">
            ${position.positionValue.toLocaleString()}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 block uppercase">Allocated Margin</span>
          <span className="text-cyan-400 font-bold">
            ${position.margin.toFixed(2)}
          </span>
        </div>

        <div className="p-2 rounded bg-bg-950/60 border border-border-color">
          <span className="text-[10px] text-gray-500 block uppercase">Leverage</span>
          <span className="text-gray-200 font-bold">
            {position.leverage}x Cross
          </span>
        </div>
      </div>
    </Surface>
  );
}
