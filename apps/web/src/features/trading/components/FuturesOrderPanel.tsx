"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  SlidersHorizontal,
  ArrowRightLeft,
  ChevronDown,
  Edit3,
  X,
  AlertTriangle,
  CheckCircle2,
  Check,
  Plus,
  Minus,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { MarginMode, FuturesOrderType, TimeInForce } from "../types/binanceFutures";

interface FuturesOrderPanelProps {
  currentPrice: number;
}

export function FuturesOrderPanel({ currentPrice }: FuturesOrderPanelProps) {
  // Margin and Leverage states
  const [marginMode, setMarginMode] = useState<MarginMode>("cross");
  const [leverage, setLeverage] = useState<number>(20);
  const [assetMode, setAssetMode] = useState<"single" | "multi">("single");
  const [availableBalance, setAvailableBalance] = useState<number>(1000.0);

  // Modals visibility
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [showAssetModeModal, setShowAssetModeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  // Order configuration
  const [orderType, setOrderType] = useState<FuturesOrderType>("limit");
  const [price, setPrice] = useState<string>(
    currentPrice > 0 ? currentPrice.toFixed(1) : "77803.9"
  );
  const [size, setSize] = useState<string>("");
  const [sizeUnit, setSizeUnit] = useState<"USDT" | "BTC">("USDT");
  const [sliderPercent, setSliderPercent] = useState<number>(0);

  // Conditional order states
  const [triggerPrice, setTriggerPrice] = useState<string>(
    currentPrice > 0 ? (currentPrice * 1.005).toFixed(1) : "78200.0"
  );
  const [triggerType, setTriggerType] = useState<"mark" | "last">("mark");

  // Checkboxes & Execution Settings
  const [isTpSl, setIsTpSl] = useState(false);
  const [tpPrice, setTpPrice] = useState("");
  const [slPrice, setSlPrice] = useState("");
  const [isReduceOnly, setIsReduceOnly] = useState(false);
  const [isPostOnly, setIsPostOnly] = useState(false);
  const [tif, setTif] = useState<TimeInForce>("GTC");

  // Temporary modal states
  const [tempLeverage, setTempLeverage] = useState<number>(20);
  const [tempMarginMode, setTempMarginMode] = useState<MarginMode>("cross");
  const [tempAssetMode, setTempAssetMode] = useState<"single" | "multi">("single");

  // Transfer modal state
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferDirection, setTransferDirection] = useState<"toFutures" | "toSpot">("toFutures");

  // Quiz modal state
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizError, setQuizError] = useState("");

  // Feedback toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync state with localStorage & cross-component event bus
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedBalance = localStorage.getItem("binance_futures_balance");
    if (savedBalance) {
      const parsed = parseFloat(savedBalance);
      if (!isNaN(parsed)) setAvailableBalance(parsed);
    }

    const savedQuiz = localStorage.getItem("binance_futures_quiz_completed");
    if (savedQuiz === "true") setQuizCompleted(true);

    const savedAssetMode = localStorage.getItem("binance_futures_asset_mode");
    if (savedAssetMode === "single" || savedAssetMode === "multi") {
      setAssetMode(savedAssetMode);
      setTempAssetMode(savedAssetMode);
    }

    const savedMarginMode = localStorage.getItem("binance_futures_margin_mode");
    if (savedMarginMode === "cross" || savedMarginMode === "isolated") {
      setMarginMode(savedMarginMode);
      setTempMarginMode(savedMarginMode);
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: string;
        balance?: number;
        assetMode?: "single" | "multi";
        marginMode?: MarginMode;
        quizCompleted?: boolean;
      }>;
      if (!customEvent.detail) return;
      const { type, balance, assetMode: aMode, marginMode: mMode, quizCompleted: qDone } = customEvent.detail;

      if (type === "BALANCE_CHANGE" && balance !== undefined) {
        setAvailableBalance(balance);
      }
      if (type === "ASSET_MODE_CHANGE" && aMode) {
        setAssetMode(aMode);
      }
      if (type === "MARGIN_MODE_CHANGE" && mMode) {
        setMarginMode(mMode);
      }
      if (type === "QUIZ_COMPLETE" && qDone !== undefined) {
        setQuizCompleted(qDone);
      }
    };

    window.addEventListener("BINANCE_FUTURES_SYNC", handleSync);
    return () => window.removeEventListener("BINANCE_FUTURES_SYNC", handleSync);
  }, []);

  // Update default price when currentPrice first loads
  useEffect(() => {
    if (currentPrice > 0 && price === "77803.9") {
      setPrice(currentPrice.toFixed(1));
      setTriggerPrice((currentPrice * 1.005).toFixed(1));
    }
  }, [currentPrice, price]);

  // Effective price based on order type
  const effectivePrice = useMemo(() => {
    if (orderType === "market") {
      return currentPrice > 0 ? currentPrice : 77803.9;
    }
    const parsed = parseFloat(price);
    return parsed > 0 ? parsed : (currentPrice > 0 ? currentPrice : 77803.9);
  }, [orderType, price, currentPrice]);

  // Maximum nominal order size possible with available balance and leverage
  const maxNotional = useMemo(() => {
    return availableBalance * leverage;
  }, [availableBalance, leverage]);

  const maxQuantityBtc = useMemo(() => {
    return effectivePrice > 0 ? maxNotional / effectivePrice : 0;
  }, [maxNotional, effectivePrice]);

  // Handle BBO (Best Bid Offer) click
  const handleBboClick = () => {
    if (currentPrice > 0) {
      setPrice(currentPrice.toFixed(1));
      showToast(`Price set to BBO: ${currentPrice.toFixed(1)} USDT`, "info");
    }
  };

  // Slider change handler
  const handlePercentClick = (percent: number) => {
    setSliderPercent(percent);
    if (percent === 0) {
      setSize("");
      return;
    }
    if (sizeUnit === "USDT") {
      const calcSize = (maxNotional * (percent / 100)).toFixed(2);
      setSize(calcSize);
    } else {
      const calcSize = (maxQuantityBtc * (percent / 100)).toFixed(4);
      setSize(calcSize);
    }
  };

  // Size text change handler
  const handleSizeInputChange = (val: string) => {
    // Only allow numbers and decimal point
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setSize(val);

    const num = parseFloat(val);
    if (isNaN(num) || num <= 0 || maxNotional <= 0) {
      setSliderPercent(0);
      return;
    }

    if (sizeUnit === "USDT") {
      const pct = Math.min(100, Math.max(0, (num / maxNotional) * 100));
      setSliderPercent(Math.round(pct));
    } else {
      const notional = num * effectivePrice;
      const pct = Math.min(100, Math.max(0, (notional / maxNotional) * 100));
      setSliderPercent(Math.round(pct));
    }
  };

  // Switch size unit (USDT <-> BTC)
  const handleSelectUnit = (unit: "USDT" | "BTC") => {
    if (unit === sizeUnit) {
      setShowUnitDropdown(false);
      return;
    }
    setSizeUnit(unit);
    setShowUnitDropdown(false);

    const num = parseFloat(size);
    if (!isNaN(num) && num > 0 && effectivePrice > 0) {
      if (unit === "BTC") {
        setSize((num / effectivePrice).toFixed(4));
      } else {
        setSize((num * effectivePrice).toFixed(2));
      }
    }
  };

  // Live order calculations
  const parsedSize = parseFloat(size);
  const validSize = !isNaN(parsedSize) && parsedSize > 0;

  const notionalValue = useMemo(() => {
    if (!validSize) return 0;
    return sizeUnit === "USDT" ? parsedSize : parsedSize * effectivePrice;
  }, [validSize, sizeUnit, parsedSize, effectivePrice]);

  const positionBtc = useMemo(() => {
    if (!validSize || effectivePrice <= 0) return 0;
    return sizeUnit === "BTC" ? parsedSize : parsedSize / effectivePrice;
  }, [validSize, sizeUnit, parsedSize, effectivePrice]);

  // Margin Cost = Initial Margin + estimated taker fee (0.05%)
  const estMarginCost = useMemo(() => {
    if (!validSize || notionalValue <= 0 || leverage <= 0) return 0;
    const initialMargin = notionalValue / leverage;
    const estFee = notionalValue * 0.0005;
    return initialMargin + estFee;
  }, [validSize, notionalValue, leverage]);

  // Maintenance Margin Rate for BTCUSDT tier 1 is 0.4% (0.004)
  const mmr = 0.004;

  // Estimated Liquidation Price for Buy/Long
  const buyLiqPrice = useMemo(() => {
    if (!validSize || effectivePrice <= 0 || leverage <= 0) return null;
    const liq = effectivePrice * (1 - (1 / leverage) + mmr);
    return liq > 0 ? liq : 0;
  }, [validSize, effectivePrice, leverage, mmr]);

  // Estimated Liquidation Price for Sell/Short
  const sellLiqPrice = useMemo(() => {
    if (!validSize || effectivePrice <= 0 || leverage <= 0) return null;
    const liq = effectivePrice * (1 + (1 / leverage) - mmr);
    return liq > 0 ? liq : 0;
  }, [validSize, effectivePrice, leverage, mmr]);

  // Order submission
  const handleOrderSubmit = (side: "buy" | "sell") => {
    if (!validSize || notionalValue <= 0) {
      showToast("Please enter a valid order size", "error");
      return;
    }

    if (estMarginCost > availableBalance) {
      showToast(
        `Insufficient margin: required ${estMarginCost.toFixed(2)} USDT, available ${availableBalance.toFixed(2)} USDT`,
        "error"
      );
      return;
    }

    const sideLabel = side === "buy" ? "Buy / Long" : "Sell / Short";
    const qtyText = `${positionBtc.toFixed(4)} BTC`;
    const priceText = orderType === "market" ? "Market" : `${effectivePrice.toFixed(1)} USDT`;

    // Simulate order placement
    showToast(`Order Placed: ${sideLabel} ${qtyText} @ ${priceText}`, "success");

    // Deduct estimated margin cost to keep balance reactive
    const newBal = Math.max(0, availableBalance - estMarginCost);
    setAvailableBalance(newBal);
    if (typeof window !== "undefined") {
      localStorage.setItem("binance_futures_balance", newBal.toString());
      window.dispatchEvent(
        new CustomEvent("BINANCE_FUTURES_SYNC", {
          detail: { type: "BALANCE_CHANGE", balance: newBal },
        })
      );
    }
  };

  // Transfer action
  const handleExecuteTransfer = () => {
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid transfer amount", "error");
      return;
    }

    let newBal = availableBalance;
    if (transferDirection === "toFutures") {
      newBal += amt;
      showToast(`Successfully transferred ${amt.toFixed(2)} USDT to Futures`, "success");
    } else {
      if (amt > availableBalance) {
        showToast("Transfer amount exceeds available futures margin balance", "error");
        return;
      }
      newBal -= amt;
      showToast(`Successfully transferred ${amt.toFixed(2)} USDT to Spot`, "success");
    }

    setAvailableBalance(newBal);
    setTransferAmount("");
    setShowTransferModal(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("binance_futures_balance", newBal.toString());
      window.dispatchEvent(
        new CustomEvent("BINANCE_FUTURES_SYNC", {
          detail: { type: "BALANCE_CHANGE", balance: newBal },
        })
      );
    }
  };

  // Quiz submission
  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < 3) {
      setQuizError("Please answer all questions before submitting.");
      return;
    }
    // Correct answers: Q1 -> 2 (125x), Q2 -> 1 (Liquidated), Q3 -> 0 (Only position margin)
    if (quizAnswers[1] !== 2 || quizAnswers[2] !== 1 || quizAnswers[3] !== 0) {
      setQuizError("One or more answers are incorrect. Review the rules and try again.");
      return;
    }

    setQuizError("");
    setQuizCompleted(true);
    setShowQuizModal(false);
    showToast("Quiz passed! Futures Trading verified successfully.", "success");

    if (typeof window !== "undefined") {
      localStorage.setItem("binance_futures_quiz_completed", "true");
      window.dispatchEvent(
        new CustomEvent("BINANCE_FUTURES_SYNC", {
          detail: { type: "QUIZ_COMPLETE", quizCompleted: true },
        })
      );
    }
  };

  return (
    <div className="flex flex-col bg-[#181A20] text-xs select-none border-b border-[#23272E] p-3 space-y-3 font-sans relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`absolute top-2 left-2 right-2 z-50 p-2.5 rounded text-xs flex items-center justify-between shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-[#0ECB81] text-black font-semibold"
              : toast.type === "error"
              ? "bg-[#F6465D] text-white font-semibold"
              : "bg-[#2B313A] text-[#EAECEF] border border-[#F0B90B]"
          }`}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Top Margin & Leverage Bar */}
      <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
        {/* Margin Mode Button */}
        <button
          type="button"
          onClick={() => {
            setTempMarginMode(marginMode);
            setShowMarginModal(true);
          }}
          className="flex items-center justify-center py-1.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-[#EAECEF] font-semibold transition-colors capitalize active:scale-[0.98] cursor-pointer"
          title="Margin Mode (Cross / Isolated)"
        >
          {marginMode}
        </button>

        {/* Leverage Button */}
        <button
          type="button"
          onClick={() => {
            setTempLeverage(leverage);
            setShowLeverageModal(true);
          }}
          className="flex items-center justify-center py-1.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-[#EAECEF] font-semibold transition-colors active:scale-[0.98] cursor-pointer"
          title="Adjust Leverage"
        >
          {leverage}x
        </button>

        {/* Single-Asset Mode Button (S / M) */}
        <button
          type="button"
          onClick={() => {
            setTempAssetMode(assetMode);
            setShowAssetModeModal(true);
          }}
          className="flex items-center justify-center py-1.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-[#EAECEF] font-semibold transition-colors active:scale-[0.98] cursor-pointer"
          title={assetMode === "single" ? "Single-Asset Mode (USDT only)" : "Multi-Assets Mode (Shared margin)"}
        >
          {assetMode === "single" ? "S" : "M"}
        </button>
      </div>

      {/* 2. Order Type Tabs & Settings */}
      <div className="flex items-center justify-between border-b border-[#23272E] pb-2 text-xs relative">
        <div className="flex items-center gap-4 font-sans">
          {(["limit", "market", "conditional"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`capitalize font-semibold transition-colors pb-1 cursor-pointer ${
                orderType === type
                  ? "text-[#EAECEF] border-b-2 border-[#F0B90B] -mb-[9px]"
                  : "text-[#848E9C] hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Settings Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="p-1 text-[#848E9C] hover:text-white rounded hover:bg-[#2B313A] transition-colors cursor-pointer"
            title="Order Settings & Time In Force"
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* Settings Dropdown Popover */}
          {showSettingsMenu && (
            <div className="absolute right-0 top-7 w-48 bg-[#1E2329] border border-[#2B313A] rounded shadow-2xl p-2.5 z-40 space-y-2.5 text-xs font-sans">
              <div className="flex items-center justify-between font-semibold text-[#EAECEF] border-b border-[#2B313A] pb-1">
                <span>Order Settings</span>
                <button
                  type="button"
                  onClick={() => setShowSettingsMenu(false)}
                  className="text-[#848E9C] hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Time In Force */}
              <div>
                <span className="text-[#848E9C] block mb-1">Time in Force (TIF)</span>
                <div className="grid grid-cols-3 gap-1 font-mono">
                  {(["GTC", "IOC", "FOK"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTif(item)}
                      className={`py-1 rounded text-center transition-colors cursor-pointer ${
                        tif === item
                          ? "bg-[#F0B90B] text-black font-bold"
                          : "bg-[#2B313A] text-[#848E9C] hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post-Only Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-[#848E9C] hover:text-white pt-1">
                <input
                  type="checkbox"
                  checked={isPostOnly}
                  onChange={(e) => setIsPostOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-[#2B313A] border-[#474D57] text-[#F0B90B] focus:ring-0 cursor-pointer"
                />
                <span>Post-Only</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 3. Available Balance Row & Transfer Shortcut */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#848E9C] font-sans">Avbl</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#EAECEF] font-medium tabular-nums">
            {availableBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            USDT
          </span>
          <button
            type="button"
            onClick={() => {
              setTransferAmount("");
              setShowTransferModal(true);
            }}
            className="text-[#F0B90B] hover:opacity-80 transition-opacity p-0.5 cursor-pointer"
            title="Transfer assets between Spot & Futures"
          >
            <ArrowRightLeft size={13} />
          </button>
        </div>
      </div>

      {/* 4. Trigger Price (For Conditional Orders) */}
      {orderType === "conditional" && (
        <div className="flex items-center justify-between bg-[#2B313A]/40 border border-[#2B313A] rounded px-2.5 py-1.5 font-mono text-xs focus-within:border-[#F0B90B] transition-colors">
          <span className="text-[#848E9C] select-none font-sans">Trigger Price</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              className="bg-transparent text-right text-white focus:outline-none w-28 font-medium tabular-nums"
              placeholder="0.0"
            />
            <span className="text-[#848E9C]">USDT</span>
            <button
              type="button"
              onClick={() => setTriggerType(triggerType === "mark" ? "last" : "mark")}
              className="px-1.5 py-0.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-xs text-[#F0B90B] font-semibold transition-colors capitalize font-sans cursor-pointer"
              title="Toggle Trigger Price Reference"
            >
              {triggerType}
            </button>
          </div>
        </div>
      )}

      {/* 5. Price Input (Limit or Conditional Limit) */}
      {orderType !== "market" ? (
        <div className="flex items-center justify-between bg-[#2B313A]/40 border border-[#2B313A] rounded px-2.5 py-1.5 font-mono text-xs focus-within:border-[#F0B90B] transition-colors">
          <span className="text-[#848E9C] select-none font-sans">Price</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-transparent text-right text-white focus:outline-none w-28 font-medium tabular-nums"
              placeholder="0.0"
            />
            <span className="text-[#848E9C]">USDT</span>
            <button
              type="button"
              onClick={handleBboClick}
              className="px-1.5 py-0.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-xs text-[#848E9C] hover:text-white transition-colors font-sans cursor-pointer"
              title="Set to Best Bid / Offer (Current Price)"
            >
              BBO
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-[#2B313A]/20 border border-[#2B313A] rounded px-2.5 py-2 font-mono text-xs text-[#848E9C]">
          <span className="font-sans">Price</span>
          <span className="font-medium text-[#EAECEF]">Market Price</span>
        </div>
      )}

      {/* 6. Size Input with Unit Dropdown */}
      <div className="relative">
        <div className="flex items-center justify-between bg-[#2B313A]/40 border border-[#2B313A] rounded px-2.5 py-1.5 font-mono text-xs focus-within:border-[#F0B90B] transition-colors">
          <span className="text-[#848E9C] select-none font-sans">Size</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={size}
              onChange={(e) => handleSizeInputChange(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-right text-white placeholder-[#848E9C] focus:outline-none w-28 font-medium tabular-nums"
            />
            {/* Unit Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setShowUnitDropdown(!showUnitDropdown)}
              className="flex items-center gap-0.5 text-[#848E9C] hover:text-white text-xs font-semibold px-1 py-0.5 rounded hover:bg-[#2B313A] cursor-pointer"
            >
              <span>{sizeUnit}</span>
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showUnitDropdown && (
          <div className="absolute right-0 top-10 w-24 bg-[#1E2329] border border-[#2B313A] rounded shadow-2xl z-40 overflow-hidden text-xs font-mono">
            <button
              type="button"
              onClick={() => handleSelectUnit("USDT")}
              className={`w-full px-3 py-1.5 text-left transition-colors flex items-center justify-between cursor-pointer ${
                sizeUnit === "USDT" ? "bg-[#2B313A] text-[#F0B90B] font-bold" : "text-[#EAECEF] hover:bg-[#2B313A]"
              }`}
            >
              <span>USDT</span>
              {sizeUnit === "USDT" && <Check size={12} />}
            </button>
            <button
              type="button"
              onClick={() => handleSelectUnit("BTC")}
              className={`w-full px-3 py-1.5 text-left transition-colors flex items-center justify-between cursor-pointer ${
                sizeUnit === "BTC" ? "bg-[#2B313A] text-[#F0B90B] font-bold" : "text-[#EAECEF] hover:bg-[#2B313A]"
              }`}
            >
              <span>BTC</span>
              {sizeUnit === "BTC" && <Check size={12} />}
            </button>
          </div>
        )}
      </div>

      {/* 7. Percentage Slider with the exact 5 milestone diamond markers (0%, 25%, 50%, 75%, 100%) */}
      <div className="pt-2 pb-3">
        <div className="relative flex items-center h-4 select-none">
          {/* Background track line */}
          <div className="absolute left-0 right-0 h-[3px] bg-[#2B313A] rounded-full" />

          {/* Active filled track line */}
          <div
            className="absolute left-0 h-[3px] bg-[#F0B90B] rounded-full transition-all duration-100"
            style={{ width: `${sliderPercent}%` }}
          />

          {/* Range input layer for continuous drag */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderPercent}
            onChange={(e) => handlePercentClick(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title={`${sliderPercent}%`}
          />

          {/* 5 Milestone Diamond Markers: 0%, 25%, 50%, 75%, 100% */}
          {[0, 25, 50, 75, 100].map((stop) => {
            const isReached = sliderPercent >= stop;
            return (
              <button
                key={stop}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePercentClick(stop);
                }}
                className={`absolute w-2.5 h-2.5 rotate-45 -translate-x-1/2 -translate-y-1/2 top-1/2 border transition-all duration-150 z-20 cursor-pointer ${
                  isReached
                    ? "bg-[#F0B90B] border-[#F0B90B] scale-110 shadow-[0_0_6px_rgba(240,185,11,0.6)]"
                    : "bg-[#181A20] border-[#474D57] hover:border-[#848E9C]"
                }`}
                style={{ left: `${stop}%` }}
                title={`${stop}%`}
              />
            );
          })}
        </div>

        {/* Milestone Labels */}
        <div className="relative flex justify-between text-[11px] font-mono text-[#848E9C] pt-1 select-none">
          {[0, 25, 50, 75, 100].map((stop) => (
            <button
              key={stop}
              type="button"
              onClick={() => handlePercentClick(stop)}
              className={`hover:text-white transition-colors cursor-pointer ${
                sliderPercent === stop ? "text-[#F0B90B] font-bold" : ""
              }`}
            >
              {stop}%
            </button>
          ))}
        </div>
      </div>

      {/* 8. Conditions & Flags Checkboxes */}
      <div className="space-y-2 text-xs text-[#848E9C] font-sans">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#EAECEF]">
            <input
              type="checkbox"
              checked={isTpSl}
              onChange={(e) => setIsTpSl(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#2B313A] border-[#474D57] text-[#F0B90B] focus:ring-0 cursor-pointer"
            />
            <span>TP/SL</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#EAECEF]">
            <input
              type="checkbox"
              checked={isReduceOnly}
              onChange={(e) => setIsReduceOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#2B313A] border-[#474D57] text-[#F0B90B] focus:ring-0 cursor-pointer"
            />
            <span>Reduce-Only</span>
          </label>

          <span className="font-mono text-xs text-[#848E9C]">TIF {tif}</span>
        </div>

        {/* Expandable TP/SL Inputs */}
        {isTpSl && (
          <div className="space-y-1.5 pt-1 font-mono">
            <div className="flex items-center justify-between bg-[#2B313A]/30 border border-[#2B313A] rounded px-2.5 py-1.5">
              <span className="text-xs text-[#0ECB81] font-sans font-medium">Take Profit</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  placeholder="TP Price"
                  className="bg-transparent text-right text-white placeholder-[#848E9C] w-24 text-xs focus:outline-none tabular-nums"
                />
                <span className="text-[#848E9C]">USDT</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#2B313A]/30 border border-[#2B313A] rounded px-2.5 py-1.5">
              <span className="text-xs text-[#F6465D] font-sans font-medium">Stop Loss</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  placeholder="SL Price"
                  className="bg-transparent text-right text-white placeholder-[#848E9C] w-24 text-xs focus:outline-none tabular-nums"
                />
                <span className="text-[#848E9C]">USDT</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. Dual Action Buttons: Buy/Long and Sell/Short */}
      <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
        <button
          type="button"
          onClick={() => handleOrderSubmit("buy")}
          className="w-full py-2.5 rounded bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white font-bold text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Buy / Long</span>
        </button>

        <button
          type="button"
          onClick={() => handleOrderSubmit("sell")}
          className="w-full py-2.5 rounded bg-[#F6465D] hover:bg-[#F6465D]/90 text-white font-bold text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Sell / Short</span>
        </button>
      </div>

      {/* 10. Live Estimated Margin Cost and Liquidation Price Row */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono text-[#848E9C] pt-2 border-t border-[#23272E]">
        {/* Buy/Long Calculations */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-sans">Liq Price</span>
            <span className="text-[#EAECEF] font-semibold tabular-nums">
              {buyLiqPrice !== null
                ? `${buyLiqPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} USDT`
                : "-- USDT"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans">Cost</span>
            <span className="text-[#EAECEF] font-semibold tabular-nums">
              {estMarginCost.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans">Max</span>
            <span className="text-[#EAECEF] font-semibold tabular-nums">
              {sizeUnit === "USDT"
                ? `${maxNotional.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} USDT`
                : `${maxQuantityBtc.toFixed(3)} BTC`}
            </span>
          </div>
        </div>

        {/* Sell/Short Calculations */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-sans">Liq Price</span>
            <span className="text-[#EAECEF] font-semibold tabular-nums">
              {sellLiqPrice !== null
                ? `${sellLiqPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} USDT`
                : "-- USDT"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans">Cost</span>
            <span className="text-[#EAECEF] font-semibold tabular-nums">
              {estMarginCost.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans">Max</span>
            <span className="text-[#EAECEF] font-semibold tabular-nums">
              {sizeUnit === "USDT"
                ? `${maxNotional.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} USDT`
                : `${maxQuantityBtc.toFixed(3)} BTC`}
            </span>
          </div>
        </div>
      </div>

      {/* 11. Fee Level & Quiz CTA Card */}
      <div className="space-y-2 pt-1 font-sans">
        <div className="flex items-center justify-between text-xs text-[#848E9C]">
          <span
            onClick={() => showToast("VIP 0 Tier: Maker 0.0200% / Taker 0.0500%", "info")}
            className="text-[#F0B90B] cursor-pointer hover:underline flex items-center gap-1 font-medium"
          >
            <span>% Fee level</span>
            <ExternalLink size={11} />
          </span>
          <span className="font-mono text-xs text-[#848E9C]">
            Maker 0.020% / Taker 0.050%
          </span>
        </div>

        {/* Quiz Button / Verified State */}
        {!quizCompleted ? (
          <button
            type="button"
            onClick={() => {
              setQuizError("");
              setShowQuizModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded bg-[#2B313A]/60 hover:bg-[#2B313A] border border-[#2B313A] hover:border-[#F0B90B] text-white text-xs font-semibold transition-all group active:scale-[0.98] cursor-pointer"
          >
            <Edit3 size={15} className="text-[#F0B90B] group-hover:scale-110 transition-transform" />
            <span>Finish Quiz to Get Started</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between p-2 rounded bg-[#0ECB81]/10 border border-[#0ECB81]/30 text-xs">
            <div className="flex items-center gap-1.5 text-[#0ECB81] font-semibold">
              <CheckCircle2 size={15} />
              <span>Futures Trading Verified</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuizAnswers({});
                setQuizError("");
                setShowQuizModal(true);
              }}
              className="text-[#848E9C] hover:text-white underline text-[11px] cursor-pointer"
            >
              Review
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: Adjust Leverage (1x - 125x) */}
      {showLeverageModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <h3 className="text-white font-bold text-sm">Adjust Leverage</h3>
              <button
                type="button"
                onClick={() => setShowLeverageModal(false)}
                className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper + Display */}
            <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded p-2">
              <button
                type="button"
                onClick={() => setTempLeverage((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded bg-[#2B313A] hover:bg-[#363D47] text-white flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <div className="text-center font-mono text-2xl font-bold text-[#F0B90B] tabular-nums">
                {tempLeverage}x
              </div>
              <button
                type="button"
                onClick={() => setTempLeverage((prev) => Math.min(125, prev + 1))}
                className="w-8 h-8 rounded bg-[#2B313A] hover:bg-[#363D47] text-white flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={1}
                max={125}
                value={tempLeverage}
                onChange={(e) => setTempLeverage(Number(e.target.value))}
                className="w-full accent-[#F0B90B] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#848E9C]">
                <span>1x</span>
                <span>25x</span>
                <span>50x</span>
                <span>75x</span>
                <span>100x</span>
                <span>125x</span>
              </div>
            </div>

            {/* Quick Multiplier Chips */}
            <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
              {[1, 5, 10, 20, 50, 75, 100, 125].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setTempLeverage(lvl)}
                  className={`py-1 rounded border transition-colors cursor-pointer ${
                    tempLeverage === lvl
                      ? "border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B] font-bold"
                      : "border-[#2B313A] bg-[#2B313A]/50 text-[#848E9C] hover:text-white"
                  }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>

            {/* Max Position Tier Info */}
            <div className="text-xs text-[#848E9C] bg-[#181A20] p-2 rounded space-y-1 font-sans">
              <div className="flex justify-between">
                <span>Max position at {tempLeverage}x:</span>
                <span className="text-[#EAECEF] font-mono font-medium">
                  {tempLeverage <= 20
                    ? "5,000,000 USDT"
                    : tempLeverage <= 50
                    ? "1,000,000 USDT"
                    : tempLeverage <= 100
                    ? "250,000 USDT"
                    : "50,000 USDT"}
                </span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-2 text-xs text-[#F0B90B] bg-[#F0B90B]/10 border border-[#F0B90B]/20 p-2.5 rounded leading-relaxed">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                Selecting higher leverage such as [20x+] increases your liquidation risk. Always manage your position size carefully.
              </span>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={() => {
                setLeverage(tempLeverage);
                setShowLeverageModal(false);
                showToast(`Leverage updated to ${tempLeverage}x`, "info");
              }}
              className="w-full py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Margin Mode (Cross / Isolated) */}
      {showMarginModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <h3 className="text-white font-bold text-sm">Margin Mode</h3>
              <button
                type="button"
                onClick={() => setShowMarginModal(false)}
                className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTempMarginMode("cross")}
                className={`p-3 rounded border text-left transition-colors cursor-pointer ${
                  tempMarginMode === "cross"
                    ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white"
                    : "border-[#2B313A] text-[#848E9C] hover:text-white"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Cross</span>
                  {tempMarginMode === "cross" && <Check size={14} className="text-[#F0B90B]" />}
                </div>
                <div className="text-xs mt-1.5 opacity-80 leading-relaxed">
                  Shared margin across all cross positions under the same asset.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTempMarginMode("isolated")}
                className={`p-3 rounded border text-left transition-colors cursor-pointer ${
                  tempMarginMode === "isolated"
                    ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white"
                    : "border-[#2B313A] text-[#848E9C] hover:text-white"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Isolated</span>
                  {tempMarginMode === "isolated" && <Check size={14} className="text-[#F0B90B]" />}
                </div>
                <div className="text-xs mt-1.5 opacity-80 leading-relaxed">
                  Risk capped strictly to individual allocated position margin.
                </div>
              </button>
            </div>

            <div className="text-xs text-[#848E9C] bg-[#181A20] p-2.5 rounded leading-relaxed">
              Switching margin mode only applies to subsequent contracts and does not affect already opened positions.
            </div>

            <button
              type="button"
              onClick={() => {
                setMarginMode(tempMarginMode);
                setShowMarginModal(false);
                showToast(`Margin mode switched to ${tempMarginMode.toUpperCase()}`, "info");
                if (typeof window !== "undefined") {
                  localStorage.setItem("binance_futures_margin_mode", tempMarginMode);
                  window.dispatchEvent(
                    new CustomEvent("BINANCE_FUTURES_SYNC", {
                      detail: { type: "MARGIN_MODE_CHANGE", marginMode: tempMarginMode },
                    })
                  );
                }
              }}
              className="w-full py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Asset Mode (Single-Asset vs Multi-Assets) */}
      {showAssetModeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <h3 className="text-white font-bold text-sm">Asset Mode</h3>
              <button
                type="button"
                onClick={() => setShowAssetModeModal(false)}
                className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setTempAssetMode("single")}
                className={`w-full p-3 rounded border text-left transition-colors cursor-pointer ${
                  tempAssetMode === "single"
                    ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white"
                    : "border-[#2B313A] text-[#848E9C] hover:text-white"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Single-Asset Mode (S)</span>
                  {tempAssetMode === "single" && <Check size={15} className="text-[#F0B90B]" />}
                </div>
                <div className="text-xs mt-1.5 opacity-80 leading-relaxed">
                  Only USDT is used as margin. Supports both Cross and Isolated margin modes.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTempAssetMode("multi")}
                className={`w-full p-3 rounded border text-left transition-colors cursor-pointer ${
                  tempAssetMode === "multi"
                    ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white"
                    : "border-[#2B313A] text-[#848E9C] hover:text-white"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Multi-Assets Mode (M)</span>
                  {tempAssetMode === "multi" && <Check size={15} className="text-[#F0B90B]" />}
                </div>
                <div className="text-xs mt-1.5 opacity-80 leading-relaxed">
                  Margin is shared across USDT, USDC, and other eligible crypto collateral assets.
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setAssetMode(tempAssetMode);
                setShowAssetModeModal(false);
                showToast(
                  `Switched to ${tempAssetMode === "single" ? "Single-Asset" : "Multi-Assets"} Mode`,
                  "info"
                );
                if (typeof window !== "undefined") {
                  localStorage.setItem("binance_futures_asset_mode", tempAssetMode);
                  window.dispatchEvent(
                    new CustomEvent("BINANCE_FUTURES_SYNC", {
                      detail: { type: "ASSET_MODE_CHANGE", assetMode: tempAssetMode },
                    })
                  );
                }
              }}
              className="w-full py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Transfer Assets Shortcut Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <h3 className="text-white font-bold text-sm">Transfer Assets</h3>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Direction Selector */}
            <div className="bg-[#181A20] border border-[#2B313A] rounded p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#848E9C]">From</span>
                <span className="text-white font-semibold">
                  {transferDirection === "toFutures" ? "Fiat and Spot" : "USDⓈ-M Futures"}
                </span>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setTransferDirection(
                      transferDirection === "toFutures" ? "toSpot" : "toFutures"
                    )
                  }
                  className="p-1.5 rounded-full bg-[#2B313A] hover:bg-[#363D47] text-[#F0B90B] transition-colors cursor-pointer"
                  title="Reverse Transfer Direction"
                >
                  <ArrowRightLeft size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#848E9C]">To</span>
                <span className="text-white font-semibold">
                  {transferDirection === "toFutures" ? "USDⓈ-M Futures" : "Fiat and Spot"}
                </span>
              </div>
            </div>

            {/* Coin Selector */}
            <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded px-3 py-2 text-xs">
              <span className="text-[#848E9C]">Asset</span>
              <span className="text-white font-mono font-bold">USDT (Tether)</span>
            </div>

            {/* Amount Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded px-3 py-2 text-xs font-mono focus-within:border-[#F0B90B]">
                <input
                  type="text"
                  placeholder="Amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="bg-transparent text-white placeholder-[#848E9C] focus:outline-none w-full tabular-nums font-medium"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#848E9C]">USDT</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (transferDirection === "toFutures") {
                        setTransferAmount("5000.00");
                      } else {
                        setTransferAmount(availableBalance.toFixed(2));
                      }
                    }}
                    className="text-[#F0B90B] font-bold text-xs hover:underline font-sans cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[#848E9C] font-mono">
                <span>Available to transfer:</span>
                <span>
                  {transferDirection === "toFutures"
                    ? "5,000.00 USDT (Spot)"
                    : `${availableBalance.toFixed(2)} USDT (Futures)`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExecuteTransfer}
              className="w-full py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors cursor-pointer"
            >
              Confirm Transfer
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Binance Futures Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#F0B90B]" />
                <h3 className="text-white font-bold text-sm">Binance Futures Knowledge Quiz</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#848E9C] leading-relaxed">
              Complete this mandatory quiz to ensure you understand leverage, liquidation risks, and margin mechanics before trading USDⓈ-M Futures.
            </p>

            {quizError && (
              <div className="p-2.5 bg-[#F6465D]/10 border border-[#F6465D]/30 text-[#F6465D] text-xs rounded font-medium">
                {quizError}
              </div>
            )}

            {/* Question 1 */}
            <div className="space-y-2 bg-[#181A20] p-3 rounded border border-[#2B313A] text-xs">
              <span className="font-semibold text-white block">
                1. What is the maximum available leverage on BTCUSDT Perpetual Contracts?
              </span>
              {[
                { label: "20x", val: 0 },
                { label: "50x", val: 1 },
                { label: "125x", val: 2 },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className="flex items-center gap-2 cursor-pointer text-[#848E9C] hover:text-white"
                >
                  <input
                    type="radio"
                    name="q1"
                    checked={quizAnswers[1] === opt.val}
                    onChange={() => setQuizAnswers({ ...quizAnswers, 1: opt.val })}
                    className="text-[#F0B90B] focus:ring-0 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Question 2 */}
            <div className="space-y-2 bg-[#181A20] p-3 rounded border border-[#2B313A] text-xs">
              <span className="font-semibold text-white block">
                2. What happens when your account Margin Ratio reaches 100%?
              </span>
              {[
                { label: "A warning email is sent with no action taken", val: 0 },
                { label: "Your position will be liquidated to prevent further loss", val: 1 },
                { label: "Margin is automatically deposited from Spot wallet", val: 2 },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className="flex items-center gap-2 cursor-pointer text-[#848E9C] hover:text-white"
                >
                  <input
                    type="radio"
                    name="q2"
                    checked={quizAnswers[2] === opt.val}
                    onChange={() => setQuizAnswers({ ...quizAnswers, 2: opt.val })}
                    className="text-[#F0B90B] focus:ring-0 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Question 3 */}
            <div className="space-y-2 bg-[#181A20] p-3 rounded border border-[#2B313A] text-xs">
              <span className="font-semibold text-white block">
                3. In Isolated Margin mode, what is the maximum potential loss?
              </span>
              {[
                { label: "Only the margin allocated specifically to that position", val: 0 },
                { label: "All assets in your USDⓈ-M Futures account", val: 1 },
                { label: "Both your Spot and Futures balances", val: 2 },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className="flex items-center gap-2 cursor-pointer text-[#848E9C] hover:text-white"
                >
                  <input
                    type="radio"
                    name="q3"
                    checked={quizAnswers[3] === opt.val}
                    onChange={() => setQuizAnswers({ ...quizAnswers, 3: opt.val })}
                    className="text-[#F0B90B] focus:ring-0 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  // Auto-fill correct answers for quick testing
                  setQuizAnswers({ 1: 2, 2: 1, 3: 0 });
                }}
                className="py-2 px-3 rounded bg-[#2B313A] hover:bg-[#363D47] text-[#848E9C] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Auto-Fill Answers
              </button>
              <button
                type="button"
                onClick={handleQuizSubmit}
                className="flex-1 py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 text-xs transition-colors cursor-pointer"
              >
                Submit & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
