"use client";

import React, { useState } from "react";
import { SlidersHorizontal, Check, ArrowUpDown } from "lucide-react";
import { PositionRow } from "../types/binanceFutures";

interface PositionsOrdersTableProps {
  positions?: PositionRow[];
  currentSymbol?: string;
}

export function PositionsOrdersTable({
  positions = [],
  currentSymbol = "BTCUSDT",
}: PositionsOrdersTableProps) {
  const [activeTab, setActiveTab] = useState<string>("Positions(0)");
  const [hideOtherSymbols, setHideOtherSymbols] = useState<boolean>(false);
  const [historyPeriod, setHistoryPeriod] = useState<string>("1D");

  const tabs = [
    "Positions(0)",
    "Open Orders(0)",
    "Order History",
    "Trade History",
    "Transaction History",
    "Position History",
    "Bots",
    "Assets",
  ] as const;

  // Exact 15 columns required by Binance Futures USD-M design specification
  const positionColumns = [
    { key: "symbol", label: "Symbol", align: "text-left" },
    { key: "size", label: "Size", align: "text-right" },
    { key: "entryPrice", label: "Entry Price", align: "text-right" },
    { key: "breakEvenPrice", label: "Break Even Price", align: "text-right" },
    { key: "markPrice", label: "Mark Price", align: "text-right" },
    { key: "liqPrice", label: "Liq.Price", align: "text-right" },
    { key: "marginRatio", label: "Margin Ratio", align: "text-right" },
    { key: "margin", label: "Margin", align: "text-right" },
    { key: "pnlRoi", label: "PNL(ROI %)", align: "text-right" },
    { key: "estFundingFee", label: "Est. Funding Fee", align: "text-right" },
    { key: "mktCloseAll", label: "MKT Close All", align: "text-center" },
    { key: "pnlCloseAll", label: "PnL-Based Close All", align: "text-center" },
    { key: "reverse", label: "Reverse", align: "text-center" },
    { key: "tpSlPosition", label: "TP/SL for position", align: "text-center" },
    { key: "tpSl", label: "TP/SL", align: "text-center" },
  ] as const;

  const openOrdersColumns = [
    { key: "time", label: "Date", align: "text-left" },
    { key: "symbol", label: "Symbol", align: "text-left" },
    { key: "type", label: "Type", align: "text-left" },
    { key: "side", label: "Side", align: "text-left" },
    { key: "price", label: "Price", align: "text-right" },
    { key: "amount", label: "Amount", align: "text-right" },
    { key: "filled", label: "Filled", align: "text-right" },
    { key: "total", label: "Total", align: "text-right" },
    { key: "trigger", label: "Trigger Conditions", align: "text-left" },
    { key: "tpSl", label: "TP/SL", align: "text-center" },
    { key: "reduceOnly", label: "Reduce Only", align: "text-center" },
    { key: "postOnly", label: "Post Only", align: "text-center" },
    { key: "action", label: "Action", align: "text-center" },
  ];

  const orderHistoryColumns = [
    { key: "time", label: "Date", align: "text-left" },
    { key: "symbol", label: "Symbol", align: "text-left" },
    { key: "type", label: "Type", align: "text-left" },
    { key: "side", label: "Side", align: "text-left" },
    { key: "avgPrice", label: "Average Price", align: "text-right" },
    { key: "price", label: "Price", align: "text-right" },
    { key: "executed", label: "Executed", align: "text-right" },
    { key: "amount", label: "Amount", align: "text-right" },
    { key: "reduceOnly", label: "Reduce Only", align: "text-center" },
    { key: "postOnly", label: "Post Only", align: "text-center" },
    { key: "status", label: "Status", align: "text-center" },
  ];

  const tradeHistoryColumns = [
    { key: "time", label: "Date", align: "text-left" },
    { key: "symbol", label: "Symbol", align: "text-left" },
    { key: "side", label: "Side", align: "text-left" },
    { key: "price", label: "Price", align: "text-right" },
    { key: "qty", label: "Quantity", align: "text-right" },
    { key: "fee", label: "Fee", align: "text-right" },
    { key: "realizedPnl", label: "Realized PNL", align: "text-right" },
    { key: "role", label: "Role", align: "text-center" },
  ];

  const transactionColumns = [
    { key: "time", label: "Date", align: "text-left" },
    { key: "type", label: "Type", align: "text-left" },
    { key: "amount", label: "Amount", align: "text-right" },
    { key: "asset", label: "Asset", align: "text-left" },
  ];

  const positionHistoryColumns = [
    { key: "symbol", label: "Symbol", align: "text-left" },
    { key: "time", label: "Closing Time", align: "text-left" },
    { key: "side", label: "Side", align: "text-left" },
    { key: "entryPrice", label: "Entry Price", align: "text-right" },
    { key: "closePrice", label: "Close Price", align: "text-right" },
    { key: "closedPnl", label: "Closed PNL", align: "text-right" },
    { key: "maxSize", label: "Max Size", align: "text-right" },
  ];

  const botsColumns = [
    { key: "strategy", label: "Strategy", align: "text-left" },
    { key: "symbol", label: "Symbol", align: "text-left" },
    { key: "status", label: "Status", align: "text-center" },
    { key: "runtime", label: "Runtime", align: "text-left" },
    { key: "investment", label: "Investment", align: "text-right" },
    { key: "totalProfit", label: "Total Profit", align: "text-right" },
    { key: "gridProfit", label: "Grid Profit", align: "text-right" },
    { key: "action", label: "Action", align: "text-center" },
  ];

  const assetsColumns = [
    { key: "asset", label: "Asset", align: "text-left" },
    { key: "walletBalance", label: "Wallet Balance", align: "text-right" },
    { key: "unrealizedPnl", label: "Unrealized PNL", align: "text-right" },
    { key: "marginBalance", label: "Margin Balance", align: "text-right" },
    { key: "maintMargin", label: "Maintenance Margin", align: "text-right" },
    { key: "availableMargin", label: "Available Margin", align: "text-right" },
  ];

  const filteredPositions = hideOtherSymbols
    ? positions.filter((p) => p.symbol === currentSymbol)
    : positions;

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "Positions(0)":
        return "You have no position.";
      case "Open Orders(0)":
        return "You have no open orders.";
      case "Order History":
        return "No order history in this period.";
      case "Trade History":
        return "No trade history in this period.";
      case "Transaction History":
        return "No transaction history.";
      case "Position History":
        return "No position history.";
      case "Bots":
        return "No active trading bots.";
      case "Assets":
        return "No assets available.";
      default:
        return "You have no position.";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-xs select-none border-t border-[#242D35]">
      {/* 1. Tabs & Right Controls */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#242D35] bg-[#000000] shrink-0">
        {/* Left: Tab list */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar font-sans h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-full text-[12px] transition-colors whitespace-nowrap relative border-b-2 flex items-center ${
                  isActive
                    ? "text-[#EDEDED] border-[#00E5FF] font-semibold"
                    : "text-[#8A8A8A] border-transparent hover:text-[#EDEDED] font-medium"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right: Hide Other Symbols toggle, History Period & Table Column Options */}
        <div className="flex items-center gap-3 shrink-0 ml-4 font-sans text-[12px] text-[#8A8A8A]">
          {/* History period selector for history tabs */}
          {activeTab.includes("History") && (
            <div className="flex items-center gap-1 bg-[#0E0E0E] p-0.5 rounded border border-[#242D35] text-[10px]">
              {["1D", "1W", "1M", "3M"].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setHistoryPeriod(period)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    historyPeriod === period
                      ? "bg-[#1C1C1C] text-white font-medium"
                      : "text-[#8A8A8A] hover:text-[#EDEDED]"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}

          {/* Hide Other Symbols checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={hideOtherSymbols}
            onClick={() => setHideOtherSymbols(!hideOtherSymbols)}
            className="flex items-center gap-1.5 cursor-pointer group focus:outline-none"
          >
            <div
              className={`w-3.5 h-3.5 rounded-[2px] border transition-colors flex items-center justify-center shrink-0 ${
                hideOtherSymbols
                  ? "bg-[#00E5FF] border-[#00E5FF] text-[#181A20]"
                  : "bg-[#0E0E0E] border-[#474D57] group-hover:border-[#848E9C]"
              }`}
            >
              {hideOtherSymbols && <Check size={10} strokeWidth={3.5} />}
            </div>
            <span className="text-[11px] text-[#8A8A8A] group-hover:text-[#EDEDED] select-none transition-colors">
              Hide Other Symbols
            </span>
          </button>

          {/* Customise table columns */}
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#1C1C1C] transition-colors"
            title="Customise table columns"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* 2. Horizontally Scrollable Table Canvas */}
      <div className="flex-1 overflow-x-auto no-scrollbar flex flex-col min-w-0">
        {/* Render Table Header based on active tab */}
        {activeTab === "Positions(0)" && (
          <div className="min-w-[1645px] grid grid-cols-[140px_100px_105px_115px_105px_100px_100px_100px_120px_120px_105px_135px_80px_130px_80px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {positionColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Open Orders(0)" && (
          <div className="min-w-[1300px] grid grid-cols-[140px_110px_90px_70px_110px_110px_100px_110px_140px_90px_90px_90px_80px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {openOrdersColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Order History" && (
          <div className="min-w-[1250px] grid grid-cols-[140px_110px_90px_70px_110px_110px_110px_110px_90px_90px_110px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {orderHistoryColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Trade History" && (
          <div className="min-w-[950px] grid grid-cols-[150px_120px_80px_120px_120px_110px_130px_100px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {tradeHistoryColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Transaction History" && (
          <div className="min-w-[650px] grid grid-cols-[180px_140px_160px_140px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {transactionColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Position History" && (
          <div className="min-w-[900px] grid grid-cols-[130px_160px_80px_130px_130px_130px_120px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {positionHistoryColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Bots" && (
          <div className="min-w-[950px] grid grid-cols-[130px_110px_90px_110px_120px_120px_120px_90px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {botsColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Assets" && (
          <div className="min-w-[850px] grid grid-cols-[100px_140px_140px_140px_160px_150px] px-3 py-2 text-[11px] font-sans font-medium text-[#8A8A8A] border-b border-[#242D35] bg-[#000000] shrink-0">
            {assetsColumns.map((col) => (
              <div key={col.key} className={`truncate px-1.5 ${col.align}`}>
                {col.label}
              </div>
            ))}
          </div>
        )}

        {/* 3. Table Rows or Illustrated Empty State */}
        {activeTab === "Positions(0)" && filteredPositions.length > 0 ? (
          <div className="min-w-[1645px] flex flex-col font-mono text-[12px]">
            {filteredPositions.map((pos) => {
              const isProfit = pos.pnl >= 0;
              return (
                <div
                  key={pos.symbol}
                  className="grid grid-cols-[140px_100px_105px_115px_105px_100px_100px_100px_120px_120px_105px_135px_80px_130px_80px] px-3 py-2 border-b border-[#242D35]/50 hover:bg-[#0E0E0E]/60 transition-colors items-center text-[#EDEDED]"
                >
                  <div className="flex items-center gap-1 font-semibold text-white px-1.5">
                    <span className="text-[#00E676] text-[10px] font-bold">●</span>
                    <span>{pos.symbol}</span>
                    <span className="text-[10px] px-1 bg-[#1C1C1C] rounded text-[#8A8A8A] font-normal">
                      Perp
                    </span>
                  </div>
                  <div className={`px-1.5 text-right font-medium ${pos.size > 0 ? "text-[#00E676]" : "text-[#FF3B30]"}`}>
                    {pos.size > 0 ? `+${pos.size}` : pos.size}
                  </div>
                  <div className="px-1.5 text-right">{pos.entryPrice.toFixed(1)}</div>
                  <div className="px-1.5 text-right text-[#8A8A8A]">{pos.breakEvenPrice.toFixed(1)}</div>
                  <div className="px-1.5 text-right">{pos.markPrice.toFixed(1)}</div>
                  <div className="px-1.5 text-right text-[#FF3B30] font-medium">{pos.liqPrice.toFixed(1)}</div>
                  <div className="px-1.5 text-right text-[#00E676]">{pos.marginRatio.toFixed(2)}%</div>
                  <div className="px-1.5 text-right">{pos.margin.toFixed(2)}</div>
                  <div className={`px-1.5 text-right font-semibold ${isProfit ? "text-[#00E676]" : "text-[#FF3B30]"}`}>
                    {isProfit ? `+${pos.pnl.toFixed(2)}` : pos.pnl.toFixed(2)} ({isProfit ? `+${pos.roi.toFixed(2)}` : pos.roi.toFixed(2)}%)
                  </div>
                  <div className="px-1.5 text-right text-[#8A8A8A]">{pos.estFundingFee.toFixed(4)}</div>
                  <div className="px-1.5 text-center">
                    <button type="button" className="px-1.5 py-0.5 text-[11px] font-sans bg-[#1C1C1C] hover:bg-[#262626] text-[#EDEDED] rounded transition-colors">
                      Market
                    </button>
                  </div>
                  <div className="px-1.5 text-center">
                    <button type="button" className="px-1.5 py-0.5 text-[11px] font-sans bg-[#1C1C1C] hover:bg-[#262626] text-[#EDEDED] rounded transition-colors">
                      Close All
                    </button>
                  </div>
                  <div className="px-1.5 text-center">
                    <button type="button" className="p-1 hover:text-[#00E5FF] transition-colors" title="Reverse position">
                      <ArrowUpDown size={12} />
                    </button>
                  </div>
                  <div className="px-1.5 text-center text-[#8A8A8A] font-sans text-[11px]">
                    <span className="hover:text-white cursor-pointer underline decoration-dotted">Add TP/SL</span>
                  </div>
                  <div className="px-1.5 text-center text-[#8A8A8A] font-sans text-[11px]">
                    <span className="hover:text-white cursor-pointer">--/--</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Illustrated Empty State Canvas */
          <div className="flex-1 flex flex-col items-center justify-center py-8 min-h-[160px] text-[#8A8A8A]">
            <EmptyStateGraphic title={getEmptyStateMessage()} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Pixel-perfect illustrated empty state vector graphic matching Binance Futures USD-M design system
 */
function EmptyStateGraphic({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg
        width="116"
        height="94"
        viewBox="0 0 116 94"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-2.5"
      >
        <defs>
          <linearGradient id="binanceCardGrad" x1="24" y1="10" x2="86" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#222832" />
            <stop offset="100%" stopColor="#14181F" />
          </linearGradient>
          <linearGradient id="goldFoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#63EBFF" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="finderBadgeGrad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2B323D" />
            <stop offset="100%" stopColor="#171B22" />
          </linearGradient>
          <radialGradient id="binanceGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Ground Glow & Shadow */}
        <ellipse cx="58" cy="85" rx="46" ry="7" fill="url(#binanceGroundShadow)" />

        {/* Underlying secondary document sheet (rotated 5 degrees for physical desk depth) */}
        <g transform="rotate(5 58 48)">
          <rect
            x="32"
            y="14"
            width="52"
            height="62"
            rx="3.5"
            fill="#171C23"
            stroke="#272F3B"
            strokeWidth="0.9"
          />
        </g>

        {/* Primary foreground ledger card */}
        <path
          d="M27 15C27 12.7909 28.7909 11 31 11H67L81 25V72C81 74.2091 79.2091 76 77 76H31C28.7909 76 27 74.2091 27 72V15Z"
          fill="url(#binanceCardGrad)"
          stroke="#2F3845"
          strokeWidth="1"
        />

        {/* Folded Top-Right Corner */}
        <path
          d="M67 11V23C67 24.1046 67.8954 25 69 25H81L67 11Z"
          fill="#2A323F"
          stroke="#384353"
          strokeWidth="0.8"
        />
        <path
          d="M67 11L81 25"
          stroke="url(#goldFoldGrad)"
          strokeWidth="1.2"
        />

        {/* Embossed ledger stripes representing vacant trade positions */}
        <rect x="35" y="22" width="22" height="3.5" rx="1.75" fill="#384252" />
        <rect x="35" y="32" width="36" height="2.5" rx="1.25" fill="#222934" />
        <rect x="35" y="39" width="30" height="2.5" rx="1.25" fill="#222934" />
        <rect x="35" y="46" width="34" height="2.5" rx="1.25" fill="#222934" />
        <rect x="35" y="53" width="26" height="2.5" rx="1.25" fill="#222934" />

        {/* Faint subtle candlestick trace across row 3 */}
        <line x1="58" y1="36" x2="58" y2="45" stroke="#00E676" strokeWidth="0.8" strokeOpacity="0.4" />
        <rect x="56.7" y="38" width="2.6" height="3.5" rx="0.5" fill="#00E676" fillOpacity="0.45" />

        {/* Floating Scanner / Finder Lens Badge with Binance Yellow Accent */}
        <g transform="translate(64, 49)">
          {/* Badge drop shadow */}
          <circle cx="16" cy="16" r="14.5" fill="#000000" fillOpacity="0.4" />
          {/* Badge body */}
          <circle cx="15" cy="15" r="14" fill="url(#finderBadgeGrad)" stroke="#3E4857" strokeWidth="1.2" />
          {/* Binance Gold subtle glow ring */}
          <circle cx="15" cy="15" r="14" fill="#00E5FF" fillOpacity="0.04" />
          {/* Magnifying Glass search icon */}
          <circle cx="13.5" cy="13.5" r="5" stroke="#00E5FF" strokeWidth="1.6" />
          <line x1="17.2" y1="17.2" x2="21" y2="21" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Ambient sparkle stars */}
        <path
          d="M20 34L21.2 37.8L25 39L21.2 40.2L20 44L18.8 40.2L15 39L18.8 37.8L20 34Z"
          fill="#00E5FF"
          fillOpacity="0.65"
        />
        <circle cx="89" cy="19" r="1.5" fill="#00E5FF" fillOpacity="0.5" />
      </svg>
      <span className="text-[13px] font-sans font-medium text-[#8A8A8A] tracking-tight">
        {title}
      </span>
    </div>
  );
}
