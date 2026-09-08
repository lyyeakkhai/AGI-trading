"use client";

import React, { useState } from "react";
import { tradingPlanSchema, TradingPlan } from "../schemas/tradingPlan.schema";
import { tradingApi } from "../api/tradingApi";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

interface OrderPanelProps {
  initialMarketType: "spot" | "futures";
  initialSymbol: string;
}

export function OrderPanel({ initialMarketType, initialSymbol }: OrderPanelProps) {
  const [marketType, setMarketType] = useState<"spot" | "futures">(initialMarketType);
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [leverage, setLeverage] = useState<number>(10);
  const [reduceOnly, setReduceOnly] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const plan: TradingPlan = {
        symbol: initialSymbol,
        market: marketType === "spot" ? "SPOT" : "FUTURES",
        direction,
        type: orderType,
        risk_percent: riskPercent,
        reduce_only: reduceOnly,
        time_in_force: "GTC",
        ...(marketType === "futures" && { leverage }),
      };

      // Validate with Zod
      tradingPlanSchema.parse(plan);

      // Call API
      const result = await tradingApi.createPlan(plan);
      setSuccess("Order placed successfully");
      console.log("Order result:", result);
    } catch (err: any) {
      if (err.errors) {
        // Zod error
        setError(err.errors[0].message);
      } else {
        // API error
        setError(err.message || "Failed to place order");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#101417]">
      {/* Tabs */}
      <div className="flex p-2 gap-1 border-b border-[#222B32]">
        <button
          onClick={() => setMarketType("spot")}
          className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase rounded ${
            marketType === "spot" ? "bg-[#1A2126] text-cyan-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Spot
        </button>
        <button
          onClick={() => setMarketType("futures")}
          className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase rounded ${
            marketType === "futures" ? "bg-[#1A2126] text-cyan-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          USDⓈ-M
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Direction */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("LONG")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border ${
              direction === "LONG"
                ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                : "bg-[#1A2126] border-transparent text-gray-400 hover:bg-[#222B32]"
            }`}
          >
            <TrendingUp size={16} />
            <span className="font-mono font-bold text-xs uppercase tracking-wider">Long</span>
          </button>
          <button
            type="button"
            onClick={() => setDirection("SHORT")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border ${
              direction === "SHORT"
                ? "bg-rose-950/30 border-rose-500/50 text-rose-400"
                : "bg-[#1A2126] border-transparent text-gray-400 hover:bg-[#222B32]"
            }`}
          >
            <TrendingDown size={16} />
            <span className="font-mono font-bold text-xs uppercase tracking-wider">Short</span>
          </button>
        </div>

        {/* Order Type */}
        <div className="flex gap-2 bg-[#1A2126] p-1 rounded">
          {["MARKET", "LIMIT", "STOP_LOSS"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type as any)}
              className={`flex-1 py-1 text-[10px] font-mono font-bold uppercase tracking-wide rounded ${
                orderType === type ? "bg-[#222B32] text-gray-100 shadow" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Leverage (Futures Only) */}
        {marketType === "futures" && (
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Leverage</label>
              <span className="text-[10px] font-mono text-cyan-400">{leverage}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="125"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        )}

        {/* Risk Percentage */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Risk % of Capital</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-[#1A2126] border border-[#222B32] rounded px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:border-cyan-500/50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">%</span>
          </div>
        </div>

        {/* Reduce Only Checkbox (Futures Only) */}
        {marketType === "futures" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="w-3.5 h-3.5 bg-[#1A2126] border-[#222B32] rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-[#101417]"
            />
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Reduce Only</span>
          </label>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded flex items-start gap-2">
            <AlertCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-mono text-rose-300">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-mono text-emerald-300">{success}</p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[#222B32]">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded text-sm font-mono font-bold uppercase tracking-wider transition-colors ${
              direction === "LONG"
                ? "bg-emerald-500 hover:bg-emerald-400 text-[#040506]"
                : "bg-rose-500 hover:bg-rose-400 text-[#040506]"
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#040506]/30 border-t-[#040506] rounded-full animate-spin" />
            ) : (
              `Execute ${direction}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
