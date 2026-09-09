"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { PositionSide } from "@/features/trading/components/PositionSide";
import { PnLDisplay } from "@/features/trading/components/PnLDisplay";
import { PositionStatusBadge } from "./PositionStatusBadge";
import { PositionPriceLevels } from "./PositionPriceLevels";
import { PositionRisk } from "./PositionRisk";
import { PositionHermesPanel } from "./PositionHermesPanel";
import { PositionThesis } from "./PositionThesis";
import { PositionLifecycle } from "./PositionLifecycle";
import { PositionAlertsList } from "./PositionAlertsList";
import { PositionItem } from "@/lib/mockPositionsData";
import {
  X,
  ExternalLink,
  LineChart,
  FileText,
  Zap,
  Bot,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface PositionDetailDrawerProps {
  position: PositionItem | null;
  onClose: () => void;
  portfolioExposureTotal: number;
}

export function PositionDetailDrawer({
  position,
  onClose,
  portfolioExposureTotal,
}: PositionDetailDrawerProps) {
  if (!position) return null;

  const isClosed = position.status === "CLOSED";

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-bg-900 border-l border-border-color shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* 1. Header Strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-color bg-surface-2/60">
        <div className="flex items-center gap-2.5">
          <PositionSide side={position.side} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-100 font-mono">
                {position.symbol}
              </span>
              <PositionStatusBadge status={position.status} size="sm" />
            </div>
            <span className="text-[10px] font-mono text-gray-500">
              ID: {position.id} • {position.strategy}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-surface-2 transition-colors"
          title="Close Inspector"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* PnL and Notional Hero Metric Card */}
        <Surface variant="default" padded="md" className="space-y-3 bg-bg-950">
          <div className="flex items-center justify-between border-b border-border-color pb-2">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase block">
                {isClosed ? "Realized Net P&L" : "Unrealized Floating P&L"}
              </span>
              <div className="mt-0.5">
                {isClosed ? (
                  <PnLDisplay
                    amount={position.realizedPnl}
                    percentage={(position.realizedPnl / position.positionValue) * 100}
                    size="lg"
                  />
                ) : (
                  <PnLDisplay
                    amount={position.unrealizedPnl}
                    percentage={position.unrealizedPnlPercent}
                    size="lg"
                  />
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">
                Position Value
              </span>
              <span className="text-base font-mono font-bold text-gray-100 block">
                ${position.positionValue.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {position.quantity} {position.quantityUnit} @ {position.leverage}x
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-surface-2/40 border border-border-color">
              <span className="text-[10px] text-gray-500 block">ENTRY PRICE</span>
              <span className="font-bold text-gray-200">
                ${position.entryPrice.toLocaleString()}
              </span>
            </div>

            <div className="p-2 rounded bg-surface-2/40 border border-border-color">
              <span className="text-[10px] text-gray-500 block">
                {isClosed ? "EXIT PRICE" : "CURRENT PRICE"}
              </span>
              <span className="font-bold text-gray-100">
                ${(isClosed ? position.exitPrice : position.currentPrice)?.toLocaleString()}
              </span>
            </div>

            <div className="p-2 rounded bg-surface-2/40 border border-border-color">
              <span className="text-[10px] text-gray-500 block">MARGIN</span>
              <span className="font-bold text-cyan-400">
                ${position.margin.toFixed(2)}
              </span>
            </div>
          </div>
        </Surface>

        {/* 3. Execution Price Ladder */}
        {!isClosed && <PositionPriceLevels position={position} />}

        {/* 4. Position Risk & Exposure Box */}
        <PositionRisk
          position={position}
          portfolioExposureTotal={portfolioExposureTotal}
        />

        {/* 5. Hermes Operational Monitoring Panel */}
        <PositionHermesPanel position={position} />

        {/* 6. Original Trade Thesis & Provenance */}
        <PositionThesis position={position} />

        {/* 7. Position Alerts (if any) */}
        {position.alerts && position.alerts.length > 0 && (
          <PositionAlertsList alerts={position.alerts} />
        )}

        {/* 8. Position Lifecycle Pipeline */}
        <PositionLifecycle isClosed={isClosed} />

        {/* 9. Cross-Terminal Navigation Section */}
        <Surface variant="default" padded="md" className="space-y-2.5">
          <span className="text-xs font-mono font-bold uppercase text-gray-200 block border-b border-border-color pb-1.5">
            Cross-Workspace Exploration
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <Link
              href={`/markets/${position.symbol.replace("/", "_")}`}
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <LineChart size={13} className="text-cyan-400" />
                <span>View Market</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>

            <Link
              href={`/trade-proposals/${position.proposalId}`}
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <FileText size={13} className="text-cyan-400" />
                <span>View Proposal</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>

            <Link
              href="/opportunities"
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="text-cyan-400" />
                <span>View Opportunity</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>

            <Link
              href="/hermes"
              className="flex items-center justify-between p-2 rounded bg-bg-950 border border-border-color hover:border-cyan-500/40 hover:text-cyan-400 text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <Bot size={13} className="text-cyan-400" />
                <span>View Hermes</span>
              </div>
              <ExternalLink size={11} className="text-gray-500 group-hover:text-cyan-400" />
            </Link>
          </div>
        </Surface>

        {/* 10. Execution Safety Disclaimer */}
        <div className="p-3 rounded bg-surface-2/40 border border-border-color text-xs font-mono text-gray-400 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <Lock size={12} className="text-cyan-400" />
            <span>EXECUTION CONTROLS DISABLED</span>
          </div>
          <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
            Paper portfolio monitoring only. Direct market order placement and manual close operations are locked by deterministic safety gates.
          </p>
        </div>
      </div>
    </div>
  );
}
