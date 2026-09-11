"use client";

import React, { useState, useMemo } from "react";
import {
  Info,
  ChevronDown,
  Plus,
  RefreshCw,
  ExternalLink,
  Wallet,
  Check,
  CheckCircle2,
  X,
  Zap,
} from "lucide-react";

interface SpotDualOrderPanelProps {
  currentPrice: number;
  symbol?: string;
  onPriceSelect?: (price: number) => void;
}

export function SpotDualOrderPanel({
  currentPrice,
  symbol = "BTCUSDT",
}: SpotDualOrderPanelProps) {
  const baseAsset = symbol.endsWith("USDT")
    ? symbol.replace("USDT", "")
    : symbol.endsWith("USDC")
    ? symbol.replace("USDC", "")
    : "BTC";
  const quoteAsset = symbol.endsWith("USDC") ? "USDC" : "USDT";

  // Mode & Order Type
  const [tradingMode, setTradingMode] = useState<"spot" | "cross" | "isolated" | "grid">("spot");
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop_limit">("limit");

  // Buy Form State
  const [buyPrice, setBuyPrice] = useState<string>(
    currentPrice > 0 ? currentPrice.toFixed(2) : "77071.44"
  );
  const [buyAmount, setBuyAmount] = useState<string>("");
  const [buyPercent, setBuyPercent] = useState<number>(0);
  const [buyTpSl, setBuyTpSl] = useState(false);
  const [buyTp, setBuyTp] = useState("");
  const [buySl, setBuySl] = useState("");

  // Sell Form State
  const [sellPrice, setSellPrice] = useState<string>(
    currentPrice > 0 ? currentPrice.toFixed(2) : "77071.44"
  );
  const [sellAmount, setSellAmount] = useState<string>("");
  const [sellPercent, setSellPercent] = useState<number>(0);
  const [sellTpSl, setSellTpSl] = useState(false);
  const [sellTp, setSellTp] = useState("");
  const [sellSl, setSellSl] = useState("");

  // Tooltip notice state
  const [showWalletNotice, setShowWalletNotice] = useState(true);

  // Available Balances
  const avblUsdt = 1000.0;
  const avblBtc = 0.05;

  // Sync BBO price
  const handleBuyBbo = () => {
    setBuyPrice(currentPrice.toFixed(2));
  };
  const handleSellBbo = () => {
    setSellPrice(currentPrice.toFixed(2));
  };

  // Percent sliders
  const handleBuySliderChange = (pct: number) => {
    setBuyPercent(pct);
    const p = parseFloat(buyPrice) || currentPrice || 1;
    const maxBtc = avblUsdt / p;
    const calculatedAmount = (maxBtc * (pct / 100)).toFixed(5);
    setBuyAmount(calculatedAmount);
  };

  const handleSellSliderChange = (pct: number) => {
    setSellPercent(pct);
    const calculatedAmount = (avblBtc * (pct / 100)).toFixed(5);
    setSellAmount(calculatedAmount);
  };

  // Computed Totals
  const buyTotal = useMemo(() => {
    const p = orderType === "market" ? currentPrice : parseFloat(buyPrice) || 0;
    const a = parseFloat(buyAmount) || 0;
    return (p * a).toFixed(2);
  }, [orderType, buyPrice, buyAmount, currentPrice]);

  const sellTotal = useMemo(() => {
    const p = orderType === "market" ? currentPrice : parseFloat(sellPrice) || 0;
    const a = parseFloat(sellAmount) || 0;
    return (p * a).toFixed(2);
  }, [orderType, sellPrice, sellAmount, currentPrice]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleExecuteOrder = (side: "BUY" | "SELL") => {
    const amt = side === "BUY" ? buyAmount : sellAmount;
    if (!amt || parseFloat(amt) <= 0) {
      setToastMsg(`Please enter a valid ${baseAsset} amount.`);
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }
    setToastMsg(`✓ ${side} ${amt} ${baseAsset} submitted successfully!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const sliderMilestones = [0, 25, 50, 75, 100];

  return (
    <div className="flex flex-col h-full bg-[#0E0E0E] text-[#EDEDED] font-mono text-xs select-none relative overflow-y-auto no-scrollbar">
      {/* 1. Header Bar: Spot / Cross / Isolated / Grid Mode Tabs */}
      <div className="h-9 border-b border-[#242D35] px-3 flex items-center justify-between bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-4">
          {(["spot", "cross", "isolated", "grid"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTradingMode(mode)}
              className={`h-9 capitalize font-sans text-xs tracking-tight transition-all relative flex items-center px-1 cursor-pointer ${
                tradingMode === mode
                  ? "text-[#00E5FF] font-semibold"
                  : "text-[#8A8A8A] hover:text-[#EDEDED]"
              }`}
            >
              <span>{mode}</span>
              {tradingMode === mode && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              )}
            </button>
          ))}
        </div>

        {/* Fee Level Link */}
        <div className="flex items-center gap-1.5 text-[#8A8A8A] hover:text-[#00E5FF] text-[11px] font-sans cursor-pointer transition-colors">
          <span>% Fee Level</span>
        </div>
      </div>

      {/* 2. Sub-Tabs: Limit / Market / Stop Limit */}
      <div className="h-8 border-b border-[#242D35] px-3 flex items-center justify-between bg-[#0E0E0E] shrink-0 text-[11px]">
        <div className="flex items-center gap-3">
          {(["limit", "market", "stop_limit"] as const).map((ot) => (
            <button
              key={ot}
              type="button"
              onClick={() => setOrderType(ot)}
              className={`transition-colors cursor-pointer ${
                orderType === ot
                  ? "text-[#EDEDED] font-semibold"
                  : "text-[#8A8A8A] hover:text-[#EDEDED]"
              }`}
            >
              {ot === "stop_limit" ? "Stop Limit" : ot.charAt(0).toUpperCase() + ot.slice(1)}
            </button>
          ))}
          <Info size={12} className="text-[#8A8A8A] hover:text-[#00E5FF] cursor-pointer" />
        </div>

        <div className="flex items-center gap-3 text-[#8A8A8A]">
          <button type="button" className="hover:text-[#00E5FF] flex items-center gap-1 cursor-pointer">
            <RefreshCw size={11} />
            <span className="font-sans">Recurring</span>
          </button>
          <button type="button" className="hover:text-[#00E5FF] flex items-center gap-1 cursor-pointer">
            <Zap size={11} className="text-[#00E5FF]" />
            <span className="font-sans">Buy with EUR</span>
          </button>
        </div>
      </div>

      {/* 3. Dual Forms Layout: Buy (Left) and Sell (Right) */}
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* ================= LEFT COLUMN: BUY FORM ================= */}
        <div className="flex flex-col space-y-2.5">
          {/* Price input */}
          <div className="relative flex items-center bg-[#141414] border border-[#242D35] focus-within:border-[#00E5FF] rounded px-2.5 py-1.5 transition-colors">
            <span className="text-[#8A8A8A] text-[11px] font-sans w-14">Price</span>
            <input
              type="text"
              value={orderType === "market" ? "Market Price" : buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              disabled={orderType === "market"}
              className="flex-1 bg-transparent text-right font-mono text-xs text-[#EDEDED] outline-none"
            />
            <span className="text-[#8A8A8A] text-[11px] ml-1.5">{quoteAsset}</span>
            {orderType !== "market" && (
              <button
                type="button"
                onClick={handleBuyBbo}
                className="ml-2 text-[10px] text-[#00E5FF] hover:text-[#33EBFF] px-1 py-0.2 rounded bg-[#0A5965]/30 border border-[#00E5FF]/30 cursor-pointer"
              >
                BBO
              </button>
            )}
          </div>

          {/* Amount input */}
          <div className="relative flex items-center bg-[#141414] border border-[#242D35] focus-within:border-[#00E5FF] rounded px-2.5 py-1.5 transition-colors">
            <span className="text-[#8A8A8A] text-[11px] font-sans w-14">Amount</span>
            <input
              type="text"
              placeholder="0.00"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="flex-1 bg-transparent text-right font-mono text-xs text-[#EDEDED] outline-none"
            />
            <span className="text-[#8A8A8A] text-[11px] ml-1.5">{baseAsset}</span>
          </div>

          {/* Percentage Slider with 5 Milestone Dots */}
          <div className="pt-1 pb-1.5 px-1 space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={buyPercent}
                onChange={(e) => handleBuySliderChange(Number(e.target.value))}
                className="w-full accent-[#00E5FF] h-1 bg-[#1C1C1C] rounded cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#8A8A8A]">
              {sliderMilestones.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleBuySliderChange(m)}
                  className={`hover:text-[#00E5FF] cursor-pointer ${
                    buyPercent === m ? "text-[#00E5FF] font-bold" : ""
                  }`}
                >
                  {m}%
                </button>
              ))}
            </div>
          </div>

          {/* Total input */}
          <div className="relative flex items-center bg-[#141414] border border-[#242D35] rounded px-2.5 py-1.5">
            <span className="text-[#8A8A8A] text-[11px] font-sans w-14">Total</span>
            <span className="flex-1 text-right font-mono text-xs text-[#EDEDED]">
              {buyTotal && parseFloat(buyTotal) > 0 ? buyTotal : "Minimum 5"}
            </span>
            <span className="text-[#8A8A8A] text-[11px] ml-1.5">{quoteAsset}</span>
          </div>

          {/* TP/SL Checkbox */}
          <div className="space-y-1.5 pt-0.5">
            <label className="flex items-center gap-1.5 text-[11px] text-[#8A8A8A] hover:text-[#EDEDED] cursor-pointer">
              <input
                type="checkbox"
                checked={buyTpSl}
                onChange={(e) => setBuyTpSl(e.target.checked)}
                className="rounded accent-[#00E5FF]"
              />
              <span>TP/SL</span>
            </label>

            {buyTpSl && (
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#141414] rounded border border-[#242D35]">
                <div>
                  <span className="text-[10px] text-[#8A8A8A]">Take Profit</span>
                  <input
                    type="text"
                    placeholder="USDT"
                    value={buyTp}
                    onChange={(e) => setBuyTp(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#242D35] px-1.5 py-0.5 rounded text-[11px] outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8A8A]">Stop Loss</span>
                  <input
                    type="text"
                    placeholder="USDT"
                    value={buySl}
                    onChange={(e) => setBuySl(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#242D35] px-1.5 py-0.5 rounded text-[11px] outline-none focus:border-[#FF3B30]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Balances & Limits */}
          <div className="space-y-0.5 text-[11px] text-[#8A8A8A]">
            <div className="flex justify-between items-center">
              <span>Avbl</span>
              <div className="flex items-center gap-1 text-[#EDEDED]">
                <span>{avblUsdt.toFixed(4)} {quoteAsset}</span>
                <button
                  type="button"
                  className="p-0.5 rounded bg-[#1C1C1C] hover:text-[#00E5FF] transition-colors cursor-pointer"
                  title="Deposit funds"
                >
                  <Plus size={10} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Max Buy</span>
              <span className="text-[#EDEDED]">
                {((avblUsdt / (parseFloat(buyPrice) || currentPrice || 1))).toFixed(5)} {baseAsset}
              </span>
            </div>
          </div>

          {/* Action Button: Green Buy BTC */}
          <button
            type="button"
            onClick={() => handleExecuteOrder("BUY")}
            className="w-full py-2.5 rounded bg-[#00E676] hover:bg-[#00C853] text-[#000000] font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(0,230,118,0.2)] cursor-pointer mt-1"
          >
            Buy {baseAsset}
          </button>
        </div>

        {/* ================= RIGHT COLUMN: SELL FORM ================= */}
        <div className="flex flex-col space-y-2.5">
          {/* Price input */}
          <div className="relative flex items-center bg-[#141414] border border-[#242D35] focus-within:border-[#00E5FF] rounded px-2.5 py-1.5 transition-colors">
            <span className="text-[#8A8A8A] text-[11px] font-sans w-14">Price</span>
            <input
              type="text"
              value={orderType === "market" ? "Market Price" : sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              disabled={orderType === "market"}
              className="flex-1 bg-transparent text-right font-mono text-xs text-[#EDEDED] outline-none"
            />
            <span className="text-[#8A8A8A] text-[11px] ml-1.5">{quoteAsset}</span>
            {orderType !== "market" && (
              <button
                type="button"
                onClick={handleSellBbo}
                className="ml-2 text-[10px] text-[#00E5FF] hover:text-[#33EBFF] px-1 py-0.2 rounded bg-[#0A5965]/30 border border-[#00E5FF]/30 cursor-pointer"
              >
                BBO
              </button>
            )}
          </div>

          {/* Amount input */}
          <div className="relative flex items-center bg-[#141414] border border-[#242D35] focus-within:border-[#00E5FF] rounded px-2.5 py-1.5 transition-colors">
            <span className="text-[#8A8A8A] text-[11px] font-sans w-14">Amount</span>
            <input
              type="text"
              placeholder="0.00"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="flex-1 bg-transparent text-right font-mono text-xs text-[#EDEDED] outline-none"
            />
            <span className="text-[#8A8A8A] text-[11px] ml-1.5">{baseAsset}</span>
          </div>

          {/* Percentage Slider with 5 Milestone Dots */}
          <div className="pt-1 pb-1.5 px-1 space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={sellPercent}
                onChange={(e) => handleSellSliderChange(Number(e.target.value))}
                className="w-full accent-[#FF3B30] h-1 bg-[#1C1C1C] rounded cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#8A8A8A]">
              {sliderMilestones.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSellSliderChange(m)}
                  className={`hover:text-[#FF3B30] cursor-pointer ${
                    sellPercent === m ? "text-[#FF3B30] font-bold" : ""
                  }`}
                >
                  {m}%
                </button>
              ))}
            </div>
          </div>

          {/* Total input */}
          <div className="relative flex items-center bg-[#141414] border border-[#242D35] rounded px-2.5 py-1.5">
            <span className="text-[#8A8A8A] text-[11px] font-sans w-14">Total</span>
            <span className="flex-1 text-right font-mono text-xs text-[#EDEDED]">
              {sellTotal && parseFloat(sellTotal) > 0 ? sellTotal : "Minimum 5"}
            </span>
            <span className="text-[#8A8A8A] text-[11px] ml-1.5">{quoteAsset}</span>
          </div>

          {/* TP/SL Checkbox */}
          <div className="space-y-1.5 pt-0.5">
            <label className="flex items-center gap-1.5 text-[11px] text-[#8A8A8A] hover:text-[#EDEDED] cursor-pointer">
              <input
                type="checkbox"
                checked={sellTpSl}
                onChange={(e) => setSellTpSl(e.target.checked)}
                className="rounded accent-[#FF3B30]"
              />
              <span>TP/SL</span>
            </label>

            {sellTpSl && (
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#141414] rounded border border-[#242D35]">
                <div>
                  <span className="text-[10px] text-[#8A8A8A]">Take Profit</span>
                  <input
                    type="text"
                    placeholder="USDT"
                    value={sellTp}
                    onChange={(e) => setSellTp(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#242D35] px-1.5 py-0.5 rounded text-[11px] outline-none focus:border-[#00E676]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#8A8A8A]">Stop Loss</span>
                  <input
                    type="text"
                    placeholder="USDT"
                    value={sellSl}
                    onChange={(e) => setSellSl(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#242D35] px-1.5 py-0.5 rounded text-[11px] outline-none focus:border-[#FF3B30]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Balances & Limits */}
          <div className="space-y-0.5 text-[11px] text-[#8A8A8A]">
            <div className="flex justify-between items-center">
              <span>Avbl</span>
              <div className="flex items-center gap-1 text-[#EDEDED]">
                <span>{avblBtc.toFixed(8)} {baseAsset}</span>
                <button
                  type="button"
                  className="p-0.5 rounded bg-[#1C1C1C] hover:text-[#00E5FF] transition-colors cursor-pointer"
                  title="Deposit funds"
                >
                  <Plus size={10} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Max Sell</span>
              <span className="text-[#EDEDED]">
                {(avblBtc * (parseFloat(sellPrice) || currentPrice || 1)).toFixed(2)} {quoteAsset}
              </span>
            </div>
          </div>

          {/* Action Button: Red Sell BTC */}
          <button
            type="button"
            onClick={() => handleExecuteOrder("SELL")}
            className="w-full py-2.5 rounded bg-[#FF3B30] hover:bg-[#E02E24] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(255,59,48,0.2)] cursor-pointer mt-1"
          >
            Sell {baseAsset}
          </button>
        </div>
      </div>

      {/* 4. Wallet Feature Tooltip Callout (From Screenshot) */}
      {showWalletNotice && (
        <div className="mx-3 mb-2 p-2 bg-[#141414] border border-[#242D35] rounded flex items-start justify-between text-[10px] font-sans text-[#8A8A8A]">
          <div className="flex items-start gap-2">
            <Wallet size={13} className="text-[#00E5FF] shrink-0 mt-0.5" />
            <span>
              Now you can place Spot orders using assets in your Flexible or Funding Wallet. This
              feature is enabled by default. Click <strong className="text-[#EDEDED]">&apos;Avbl&apos;</strong> to
              view or adjust this setting.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowWalletNotice(false)}
            className="text-[#8A8A8A] hover:text-white ml-2 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {toastMsg && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#00E5FF] text-[#000000] font-mono text-xs font-bold rounded shadow-[0_0_16px_rgba(0,229,255,0.4)] z-50 animate-in fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
