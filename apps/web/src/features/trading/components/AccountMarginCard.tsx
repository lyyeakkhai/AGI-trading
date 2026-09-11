"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowRightLeft,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Check,
  X,
  CreditCard,
  RefreshCw,
  Wallet,
  Coins,
  ShieldCheck,
} from "lucide-react";

export function AccountMarginCard() {
  // Account balance states (synced with localStorage & cross-component event bus)
  const [marginBalance, setMarginBalance] = useState<number>(1000.0);
  const [walletBalance, setWalletBalance] = useState<number>(1000.0);
  const [maintMargin] = useState<number>(0.0);
  const [unrealizedPnl] = useState<number>(0.0);
  const [hideBalance, setHideBalance] = useState<boolean>(false);
  const [assetMode, setAssetMode] = useState<"single" | "multi">("single");

  // Modals state
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showBuyCryptoModal, setShowBuyCryptoModal] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [showAssetModeModal, setShowAssetModeModal] = useState<boolean>(false);

  // Transfer modal fields
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferDirection, setTransferDirection] = useState<"toFutures" | "toSpot">("toFutures");

  // Buy Crypto modal fields
  const [buyFiatAmount, setBuyFiatAmount] = useState<string>("500");
  const [buyPaymentMethod, setBuyPaymentMethod] = useState<"card" | "apple" | "bank">("card");

  // Swap modal fields
  const [swapFromCoin, setSwapFromCoin] = useState<"USDC" | "BTC" | "ETH">("USDC");
  const [swapAmount, setSwapAmount] = useState<string>("500");

  // Temporary asset mode
  const [tempAssetMode, setTempAssetMode] = useState<"single" | "multi">("single");

  // Tooltip & Toast state
  const [showRatioInfo, setShowRatioInfo] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync state with localStorage & window event listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedBalance = localStorage.getItem("binance_futures_balance");
    if (savedBalance) {
      const parsed = parseFloat(savedBalance);
      if (!isNaN(parsed)) {
        setMarginBalance(parsed);
        setWalletBalance(parsed);
      }
    }

    const savedAssetMode = localStorage.getItem("binance_futures_asset_mode");
    if (savedAssetMode === "single" || savedAssetMode === "multi") {
      setAssetMode(savedAssetMode);
      setTempAssetMode(savedAssetMode);
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: string;
        balance?: number;
        assetMode?: "single" | "multi";
      }>;
      if (!customEvent.detail) return;
      const { type, balance, assetMode: aMode } = customEvent.detail;

      if (type === "BALANCE_CHANGE" && balance !== undefined) {
        setMarginBalance(balance);
        setWalletBalance(balance);
      }
      if (type === "ASSET_MODE_CHANGE" && aMode) {
        setAssetMode(aMode);
      }
    };

    window.addEventListener("BINANCE_FUTURES_SYNC", handleSync);
    return () => window.removeEventListener("BINANCE_FUTURES_SYNC", handleSync);
  }, []);

  // Margin Ratio calculation: (Maintenance Margin / Margin Balance) * 100%
  const marginRatio = useMemo(() => {
    if (marginBalance <= 0) return 0;
    return (maintMargin / marginBalance) * 100;
  }, [maintMargin, marginBalance]);

  // Color mapping based on risk level
  const ratioColor = useMemo(() => {
    if (marginRatio >= 80) return "text-[#F6465D]";
    if (marginRatio >= 50) return "text-[#F0B90B]";
    return "text-[#0ECB81]";
  }, [marginRatio]);

  const strokeColor = useMemo(() => {
    if (marginRatio >= 80) return "#F6465D";
    if (marginRatio >= 50) return "#F0B90B";
    return "#0ECB81";
  }, [marginRatio]);

  // Gauge circumference: circle with r=14 -> C = 2 * PI * 14 ≈ 87.96
  const circumference = 87.96;
  const clampedRatio = Math.min(100, Math.max(0, marginRatio));
  const strokeDash = (clampedRatio / 100) * circumference;

  // Execute Transfer
  const handleExecuteTransfer = () => {
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid transfer amount", "error");
      return;
    }

    let newBal = marginBalance;
    if (transferDirection === "toFutures") {
      newBal += amt;
      showToast(`Successfully transferred ${amt.toFixed(2)} USDT to Futures`, "success");
    } else {
      if (amt > marginBalance) {
        showToast("Transfer amount exceeds available futures margin balance", "error");
        return;
      }
      newBal -= amt;
      showToast(`Successfully transferred ${amt.toFixed(2)} USDT to Spot`, "success");
    }

    setMarginBalance(newBal);
    setWalletBalance(newBal);
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

  // Execute Buy Crypto
  const handleExecuteBuyCrypto = () => {
    const fiatAmt = parseFloat(buyFiatAmount);
    if (isNaN(fiatAmt) || fiatAmt <= 0) {
      showToast("Please enter a valid fiat amount", "error");
      return;
    }

    // 1:1 conversion for simulation (e.g. 500 USD -> 500 USDT)
    const newBal = marginBalance + fiatAmt;
    setMarginBalance(newBal);
    setWalletBalance(newBal);
    setShowBuyCryptoModal(false);
    showToast(`Successfully purchased ${fiatAmt.toFixed(2)} USDT via ${buyPaymentMethod.toUpperCase()}`, "success");

    if (typeof window !== "undefined") {
      localStorage.setItem("binance_futures_balance", newBal.toString());
      window.dispatchEvent(
        new CustomEvent("BINANCE_FUTURES_SYNC", {
          detail: { type: "BALANCE_CHANGE", balance: newBal },
        })
      );
    }
  };

  // Execute Swap
  const handleExecuteSwap = () => {
    const amt = parseFloat(swapAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid swap amount", "error");
      return;
    }

    // Rates: USDC 1.0, BTC 77,800, ETH 2,850
    let usdtReceived = amt;
    if (swapFromCoin === "USDC") usdtReceived = amt * 1.0;
    else if (swapFromCoin === "BTC") usdtReceived = amt * 77800;
    else if (swapFromCoin === "ETH") usdtReceived = amt * 2850;

    const newBal = marginBalance + usdtReceived;
    setMarginBalance(newBal);
    setWalletBalance(newBal);
    setShowSwapModal(false);
    showToast(
      `Swapped ${amt} ${swapFromCoin} for ${usdtReceived.toFixed(2)} USDT`,
      "success"
    );

    if (typeof window !== "undefined") {
      localStorage.setItem("binance_futures_balance", newBal.toString());
      window.dispatchEvent(
        new CustomEvent("BINANCE_FUTURES_SYNC", {
          detail: { type: "BALANCE_CHANGE", balance: newBal },
        })
      );
    }
  };

  // Switch Asset Mode
  const handleSaveAssetMode = () => {
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
  };

  return (
    <div className="flex flex-col bg-[#181A20] p-3 text-xs select-none space-y-3 font-sans relative">
      {/* Toast Banner */}
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

      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#EAECEF] text-sm">Account</span>
          <button
            type="button"
            onClick={() => setHideBalance(!hideBalance)}
            className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
            title={hideBalance ? "Show balance" : "Hide balance"}
          >
            {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setTempAssetMode(assetMode);
            setShowAssetModeModal(true);
          }}
          className="flex items-center gap-1 text-[#F0B90B] hover:opacity-80 transition-opacity font-semibold text-xs cursor-pointer"
          title="Switch Asset Mode"
        >
          <ArrowRightLeft size={13} />
          <span>Switch</span>
        </button>
      </div>

      {/* 2. Margin Ratio Gauge Row */}
      <div className="flex items-center justify-between border-b border-[#23272E] pb-2 relative">
        <div className="flex items-center gap-1.5">
          <span className="text-[#848E9C] text-xs">Margin Ratio</span>
          <button
            type="button"
            onClick={() => setShowRatioInfo(!showRatioInfo)}
            className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
            title="Margin Ratio Details"
          >
            <HelpCircle size={13} />
          </button>

          {/* Ratio Info Popover */}
          {showRatioInfo && (
            <div className="absolute left-0 top-7 w-64 bg-[#1E2329] border border-[#2B313A] rounded shadow-2xl p-2.5 z-40 text-xs text-[#EAECEF] space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center justify-between border-b border-[#2B313A] pb-1">
                <span>Margin Ratio Explained</span>
                <button
                  type="button"
                  onClick={() => setShowRatioInfo(false)}
                  className="text-[#848E9C] hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-[#848E9C]">
                <strong className="text-white">Margin Ratio</strong> = (Maintenance Margin / Margin Balance) × 100%.
              </p>
              <p className="text-[#848E9C]">
                When Margin Ratio reaches <strong className="text-[#F6465D]">100%</strong>, your position will be liquidated. Keep this value as low as possible.
              </p>
            </div>
          )}
        </div>

        {/* Circular Arc Gauge Indicator */}
        <div className="flex items-center gap-2 font-mono">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36">
              {/* Background circular track */}
              <circle
                cx="18"
                cy="18"
                r="14"
                className="text-[#2B313A]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
              />
              {/* Foreground progress arc */}
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke={strokeColor}
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset="0"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300"
              />
            </svg>
          </div>
          <span className={`${ratioColor} font-bold text-xs tabular-nums`}>
            {marginRatio.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 3. Maintenance Margin & Margin Balance */}
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-[#848E9C]">
          <span className="font-sans">Maintenance Margin</span>
          <span className="text-[#EAECEF] font-medium tabular-nums">
            {hideBalance ? "****" : `${maintMargin.toFixed(4)} USDT`}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#848E9C]">
          <span className="font-sans">Margin Balance</span>
          <span className="text-[#EAECEF] font-medium tabular-nums">
            {hideBalance
              ? "****"
              : `${marginBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })} USDT`}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#848E9C]">
          <span className="font-sans">Wallet Balance</span>
          <span className="text-[#EAECEF] font-medium tabular-nums">
            {hideBalance
              ? "****"
              : `${walletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })} USDT`}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#848E9C]">
          <span className="font-sans">Unrealized PnL</span>
          <span className="text-[#0ECB81] font-medium tabular-nums">
            {hideBalance ? "****" : `+${unrealizedPnl.toFixed(4)} USDT`}
          </span>
        </div>
      </div>

      {/* 4. Single-Asset Mode Button */}
      <div>
        <button
          type="button"
          onClick={() => {
            setTempAssetMode(assetMode);
            setShowAssetModeModal(true);
          }}
          className="w-full py-1.5 rounded bg-[#2B313A]/60 hover:bg-[#2B313A] border border-[#2B313A] hover:border-[#F0B90B] text-[#EAECEF] text-xs font-medium transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>{assetMode === "single" ? "Single-Asset Mode" : "Multi-Assets Mode"}</span>
          <span className="text-[#848E9C] text-[11px] font-mono">
            ({assetMode === "single" ? "USDT" : "Multi"})
          </span>
        </button>
      </div>

      {/* 5. Deposit / Onboarding Callout Card */}
      <div className="p-3 rounded bg-[#1E2329] border border-[#2B313A] space-y-2.5">
        <div className="flex items-start gap-2 text-[#848E9C] text-xs leading-relaxed">
          <AlertCircle size={15} className="text-[#F0B90B] shrink-0 mt-0.5" />
          <span>To start trading, please transfer assets to your Futures account.</span>
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 text-xs font-medium font-sans">
          <button
            type="button"
            onClick={() => {
              setTransferAmount("");
              setShowTransferModal(true);
            }}
            className="py-1.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-white transition-colors text-center cursor-pointer"
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => setShowBuyCryptoModal(true)}
            className="py-1.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-white transition-colors text-center cursor-pointer"
          >
            Buy Crypto
          </button>
          <button
            type="button"
            onClick={() => setShowSwapModal(true)}
            className="py-1.5 rounded bg-[#2B313A] hover:bg-[#363D47] text-white transition-colors text-center cursor-pointer"
          >
            Swap
          </button>
        </div>
      </div>

      {/* MODAL 1: Transfer Assets */}
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
                  title="Reverse Direction"
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

            {/* Asset */}
            <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded px-3 py-2 text-xs">
              <span className="text-[#848E9C]">Asset</span>
              <span className="text-white font-mono font-bold">USDT (Tether)</span>
            </div>

            {/* Amount */}
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
                        setTransferAmount(marginBalance.toFixed(2));
                      }
                    }}
                    className="text-[#F0B90B] font-bold text-xs hover:underline font-sans cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[#848E9C] font-mono">
                <span>Available:</span>
                <span>
                  {transferDirection === "toFutures"
                    ? "5,000.00 USDT (Spot)"
                    : `${marginBalance.toFixed(2)} USDT (Futures)`}
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

      {/* MODAL 2: Buy Crypto */}
      {showBuyCryptoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#F0B90B]" />
                <h3 className="text-white font-bold text-sm">Buy Crypto</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBuyCryptoModal(false)}
                className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Spend Amount */}
            <div className="space-y-1">
              <span className="text-[#848E9C] text-xs">Spend</span>
              <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded px-3 py-2 text-xs font-mono focus-within:border-[#F0B90B]">
                <input
                  type="text"
                  value={buyFiatAmount}
                  onChange={(e) => setBuyFiatAmount(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full tabular-nums font-medium"
                />
                <span className="text-[#EAECEF] font-bold shrink-0">USD</span>
              </div>
            </div>

            {/* Receive Estimate */}
            <div className="space-y-1">
              <span className="text-[#848E9C] text-xs">Receive (Estimated)</span>
              <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded px-3 py-2 text-xs font-mono">
                <span className="text-[#0ECB81] font-bold text-sm tabular-nums">
                  ≈ {parseFloat(buyFiatAmount) > 0 ? parseFloat(buyFiatAmount).toFixed(2) : "0.00"}
                </span>
                <span className="text-[#EAECEF] font-bold shrink-0">USDT</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <span className="text-[#848E9C] text-xs">Payment Method</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: "card", label: "Card" },
                  { id: "apple", label: "Apple Pay" },
                  { id: "bank", label: "Bank wire" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setBuyPaymentMethod(m.id as "card" | "apple" | "bank")}
                    className={`py-2 rounded border text-center font-medium transition-colors cursor-pointer ${
                      buyPaymentMethod === m.id
                        ? "border-[#F0B90B] bg-[#F0B90B]/10 text-[#F0B90B]"
                        : "border-[#2B313A] bg-[#2B313A]/50 text-[#848E9C] hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExecuteBuyCrypto}
              className="w-full py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors cursor-pointer"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Instant Swap / Convert */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-lg w-full max-w-sm p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-[#F0B90B]" />
                <h3 className="text-white font-bold text-sm">Instant Convert & Swap</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSwapModal(false)}
                className="text-[#848E9C] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* From Coin */}
            <div className="space-y-1">
              <span className="text-[#848E9C] text-xs">From</span>
              <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded px-3 py-2 text-xs font-mono focus-within:border-[#F0B90B]">
                <input
                  type="text"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full tabular-nums font-medium"
                />
                <select
                  value={swapFromCoin}
                  onChange={(e) => setSwapFromCoin(e.target.value as "USDC" | "BTC" | "ETH")}
                  className="bg-[#2B313A] text-white rounded px-2 py-1 outline-none text-xs font-sans font-bold cursor-pointer"
                >
                  <option value="USDC">USDC</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>

            {/* To Coin (USDT) */}
            <div className="space-y-1">
              <span className="text-[#848E9C] text-xs">To</span>
              <div className="flex items-center justify-between bg-[#181A20] border border-[#2B313A] rounded px-3 py-2 text-xs font-mono">
                <span className="text-[#0ECB81] font-bold text-sm tabular-nums">
                  ≈{" "}
                  {parseFloat(swapAmount) > 0
                    ? swapFromCoin === "USDC"
                      ? (parseFloat(swapAmount) * 1.0).toFixed(2)
                      : swapFromCoin === "BTC"
                      ? (parseFloat(swapAmount) * 77800).toFixed(2)
                      : (parseFloat(swapAmount) * 2850).toFixed(2)
                    : "0.00"}
                </span>
                <span className="text-white font-bold">USDT</span>
              </div>
            </div>

            <div className="text-xs text-[#848E9C] bg-[#181A20] p-2 rounded flex items-center justify-between font-mono">
              <span className="font-sans">Conversion Fee:</span>
              <span className="text-[#0ECB81] font-semibold">0.00% (Zero Fee)</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteSwap}
              className="w-full py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors cursor-pointer"
            >
              Confirm Swap
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Asset Mode Switch Modal */}
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
                  <span>Single-Asset Mode</span>
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
                  <span>Multi-Assets Mode</span>
                  {tempAssetMode === "multi" && <Check size={15} className="text-[#F0B90B]" />}
                </div>
                <div className="text-xs mt-1.5 opacity-80 leading-relaxed">
                  Margin is shared across USDT, USDC, and other eligible crypto collateral assets.
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveAssetMode}
              className="w-full py-2.5 bg-[#F0B90B] text-black font-bold rounded hover:bg-[#F0B90B]/90 transition-colors cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
