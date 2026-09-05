"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabList, TabTrigger, TabContent } from "@/components/ui/Tabs";
import { PositionSide } from "@/components/trading/PositionSide";
import { PnLDisplay } from "@/components/trading/PnLDisplay";
import { RiskBadge } from "@/components/trading/RiskBadge";
import { ConfidenceIndicator } from "@/components/trading/ConfidenceIndicator";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";
import { AIActivityBadge } from "@/components/ai/AIActivityBadge";
import { MarketDetail } from "@/lib/mockMarketData";
import {
  Briefcase,
  Bot,
  Sliders,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Target,
  AlertTriangle,
} from "lucide-react";

interface MarketDetailsPanelProps {
  market: MarketDetail;
  className?: string;
}

export function MarketDetailsPanel({ market, className = "" }: MarketDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("hermes");

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Tab Controls Bar */}
      <div className="px-3 pt-2 border-b border-border-color bg-surface-2/40">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabList variant="line" className="gap-2">
            <TabTrigger
              value="hermes"
              icon={<Bot size={13} className="text-cyan-400" />}
              badge={
                <span className="px-1 py-0.2 rounded bg-cyan-dim/40 text-cyan-300 text-[9px] font-mono font-bold">
                  {market.hermes.confidence}%
                </span>
              }
            >
              Hermes Intelligence
            </TabTrigger>

            <TabTrigger
              value="position"
              icon={<Briefcase size={13} />}
              badge={
                market.position ? (
                  <span className="px-1 py-0.2 rounded bg-profit-dim text-profit text-[9px] font-mono font-bold">
                    OPEN
                  </span>
                ) : undefined
              }
            >
              Position Context
            </TabTrigger>

            <TabTrigger value="technicals" icon={<Sliders size={13} />}>
              Orderbook & Technicals
            </TabTrigger>
          </TabList>

          {/* TAB 1: HERMES INTELLIGENCE */}
          <TabContent value="hermes" className="p-4 space-y-4 pt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-color/60">
              <div className="flex items-center gap-2">
                <AIStatusIndicator state={market.hermes.state} size="sm" />
                <span className="font-mono text-xs font-semibold text-gray-200">
                  {market.hermes.signalType}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-gray-400">
                  Audit: {market.hermes.lastAudit}
                </span>
                <Link href="/hermes">
                  <Button
                    variant="ghost"
                    size="xs"
                    rightIcon={<ArrowRight size={12} />}
                    className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px]"
                  >
                    HERMES LOGS
                  </Button>
                </Link>
              </div>
            </div>

            {/* Rationale Observation */}
            <div className="space-y-1.5 bg-bg-950/70 p-3 rounded border border-border-color">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center justify-between">
                <span>Autonomous Market Reasoning</span>
                <span className="text-gray-400 font-normal">MODEL: HERMES CORE</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                &ldquo;{market.hermes.reasoning}&rdquo;
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded bg-surface-2/60 border border-border-color space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-400">
                  Confidence Score
                </span>
                <ConfidenceIndicator score={market.hermes.confidence} />
              </div>

              <div className="p-2.5 rounded bg-surface-2/60 border border-border-color space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-400">
                  Active Regime
                </span>
                <div className="font-mono text-xs font-bold text-gray-200 truncate">
                  {market.regime}
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface-2/60 border border-border-color space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-400">
                  Risk Engine Status
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-profit">
                  <ShieldCheck size={13} />
                  <span>DETERMINISTIC VERIFIED</span>
                </div>
              </div>
            </div>
          </TabContent>

          {/* TAB 2: POSITION CONTEXT */}
          <TabContent value="position" className="p-4 space-y-4 pt-3">
            {market.position ? (
              <div className="space-y-4">
                {/* Position Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-surface-2/60 border border-border-color">
                  <div className="flex items-center gap-3">
                    <PositionSide side={market.position.side} size="md" />
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-100">
                        {market.position.symbol}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 ml-2">
                        Size: {market.position.size}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono text-gray-400">
                        Unrealized P&L
                      </span>
                      <PnLDisplay
                        amount={market.position.unrealizedPnL}
                        percentage={market.position.unrealizedPnLPct}
                        size="md"
                        layout="inline"
                      />
                    </div>
                    <RiskBadge level={market.position.riskLevel} />
                  </div>
                </div>

                {/* Price Lines & Levels Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-2.5 rounded bg-bg-950 border border-cyan-500/30">
                    <span className="text-[10px] text-gray-400 uppercase block">
                      Entry Price
                    </span>
                    <span className="text-gray-100 font-bold text-sm">
                      ${market.position.entryPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-bg-950 border border-loss/30">
                    <span className="text-[10px] text-loss uppercase block">
                      Stop Loss
                    </span>
                    <span className="text-loss font-bold text-sm">
                      ${market.position.stopPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-bg-950 border border-profit/30">
                    <span className="text-[10px] text-profit uppercase block">
                      Take Profit
                    </span>
                    <span className="text-profit font-bold text-sm">
                      ${market.position.targetPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-bg-950 border border-border-color">
                    <span className="text-[10px] text-gray-400 uppercase block">
                      Liquidation Est.
                    </span>
                    <span className="text-gray-300 font-bold text-sm">
                      ${market.position.liquidationPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                  <span>Target Risk/Reward: {market.position.riskReward} R:R</span>
                  <Link href="/positions">
                    <Button variant="outline" size="xs">
                      MANAGE IN POSITIONS →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="flex justify-center text-gray-500">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase text-gray-300">
                  No Active Position on {market.symbol}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Capital is 100% safeguarded. When an AI setup meets deterministic risk
                  parameters, a structured proposal will be queued for owner approval.
                </p>
                <div className="pt-2">
                  <Link href="/opportunities">
                    <Button variant="secondary" size="xs">
                      VIEW PENDING OPPORTUNITIES
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabContent>

          {/* TAB 3: ORDERBOOK & TECHNICALS */}
          <TabContent value="technicals" className="p-4 space-y-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Orderbook Depth */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-400">
                  <span>Level 2 Depth Snapshot</span>
                  <span>Spread: {market.spread}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-bg-950 p-2.5 rounded border border-border-color">
                  {/* Bids */}
                  <div className="space-y-1">
                    <div className="text-[9px] text-gray-400 font-bold uppercase border-b border-border-color pb-1">
                      Bid Price • Size
                    </div>
                    {market.orderBook.bids.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between text-profit">
                        <span>${b.price.toLocaleString()}</span>
                        <span className="text-gray-400">{b.size}</span>
                      </div>
                    ))}
                  </div>

                  {/* Asks */}
                  <div className="space-y-1">
                    <div className="text-[9px] text-gray-400 font-bold uppercase border-b border-border-color pb-1">
                      Ask Price • Size
                    </div>
                    {market.orderBook.asks.map((a, idx) => (
                      <div key={idx} className="flex items-center justify-between text-loss">
                        <span>${a.price.toLocaleString()}</span>
                        <span className="text-gray-400">{a.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-gray-400">
                  Technical Indicator Suite
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-surface-2/60 border border-border-color">
                    <span className="text-[10px] text-gray-400 block">RSI (14)</span>
                    <span
                      className={`font-bold ${
                        market.technicals.rsi14 > 70
                          ? "text-loss"
                          : market.technicals.rsi14 < 30
                          ? "text-profit"
                          : "text-gray-200"
                      }`}
                    >
                      {market.technicals.rsi14}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-surface-2/60 border border-border-color">
                    <span className="text-[10px] text-gray-400 block">Support / Resist</span>
                    <span className="font-bold text-gray-200 text-[11px]">
                      ${market.technicals.support.toLocaleString()} / ${market.technicals.resistance.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-surface-2/60 border border-border-color">
                    <span className="text-[10px] text-gray-400 block">EMA 20 / 50</span>
                    <span className="font-bold text-gray-200 text-[11px]">
                      ${market.technicals.ema20.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-surface-2/60 border border-border-color">
                    <span className="text-[10px] text-gray-400 block">EMA 200 (Long Term)</span>
                    <span className="font-bold text-cyan-400 text-[11px]">
                      ${market.technicals.ema200.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabContent>
        </Tabs>
      </div>

      {/* Footer System Status */}
      <div className="px-4 py-2 border-t border-border-color bg-surface-2/20 text-[10px] font-mono text-gray-400 flex items-center justify-between select-none">
        <span>MARKET ANALYSIS FEED: ACTIVE</span>
        <span className="text-profit font-semibold">PRE-TRADE INTERLOCK ENGAGED</span>
      </div>
    </Surface>
  );
}
