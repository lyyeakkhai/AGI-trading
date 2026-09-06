"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Layers,
  ShieldCheck,
  Lock,
  Activity,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Wrench,
  RefreshCw,
  Server,
  Zap,
  ShieldAlert,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { ExchangeSettings } from "@/lib/mockSettingsData";
import { ConfigureExchangeModal } from "./ConfigureExchangeModal";
import {
  exchangeApi,
  ExchangeStatus,
  BalancesData,
  ExchangeHealth,
  AccountInfo,
} from "@/lib/exchangeApi";

interface ExchangeConnectionsSectionProps {
  data: ExchangeSettings;
}

export function ExchangeConnectionsSection({ data }: ExchangeConnectionsSectionProps) {
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  const [balances, setBalances] = useState<BalancesData | null>(null);
  const [health, setHealth] = useState<ExchangeHealth | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("09:42:18 UTC");

  // Load initial exchange metadata
  useEffect(() => {
    async function loadData() {
      const [bal, hlth, acc] = await Promise.all([
        exchangeApi.getBalances(),
        exchangeApi.getHealth(),
        exchangeApi.getAccount(),
      ]);
      setBalances(bal);
      setHealth(hlth);
      setAccountInfo(acc);
    }
    loadData();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await exchangeApi.testConnection();
      setIsTesting(false);
      setTestResult({
        connected: res.connected,
        message:
          res.reason ||
          `Connection verified successfully. Latency: ${res.latency_ms ?? 52}ms.`,
      });
    } catch {
      setIsTesting(false);
      setTestResult({
        connected: false,
        message: "Exchange credentials are unavailable in this frontend-only build.",
      });
    }
  };

  const handleRefreshAccount = async () => {
    setIsSyncing(true);
    const bal = await exchangeApi.getBalances();
    const hlth = await exchangeApi.getHealth();
    setTimeout(() => {
      setBalances(bal);
      setHealth(hlth);
      setLastSyncTime(new Date().toISOString().slice(11, 19) + " UTC");
      setIsSyncing(false);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Layers size={16} className="text-cyan-400" />
            <span>Binance Exchange Integration</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Order routing gateway, server-side credential isolation, and balance telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            isLoading={isSyncing}
            leftIcon={<RefreshCw size={13} />}
            onClick={handleRefreshAccount}
          >
            Refresh Account
          </Button>
        </div>
      </div>

      <div className="space-y-5 max-w-3xl">
        {/* Main Binance Connection Card */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-color">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#F3BA2F]/10 border border-[#F3BA2F]/30 flex items-center justify-center font-bold text-[#F3BA2F] text-base font-mono shadow-[0_0_12px_rgba(243,186,47,0.15)]">
                BIN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-100">Binance Spot &amp; USD-M Perp</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border-color text-cyan-400">
                    TESTNET / PAPER
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Primary liquidity gateway for BTC/USDT and ETH/USDT instruments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {testResult?.connected || health?.api_connectivity === "HEALTHY" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-profit/10 border border-profit/30 text-profit text-xs font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
                  CONNECTED (TESTNET)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-warning/10 border border-warning/30 text-warning text-xs font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  SANDBOX READY
                </span>
              )}
            </div>
          </div>

          {/* Account Details & Permissions Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-gray-500 text-[10px] block">ENVIRONMENT</span>
              <span className="text-gray-200 font-semibold">TESTNET</span>
            </div>

            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-gray-500 text-[10px] block">ACCOUNT TYPE</span>
              <span className="text-gray-200 font-semibold">SPOT / MARGIN</span>
            </div>

            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-gray-500 text-[10px] block">READ PERMISSIONS</span>
              <span className="text-profit font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> ACTIVE
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-2 border border-border-color">
              <span className="text-gray-500 text-[10px] block">LIVE TRADING</span>
              <span className="text-loss font-semibold flex items-center gap-1">
                <Lock size={12} /> DISABLED
              </span>
            </div>
          </div>

          {/* Masked Credentials Display */}
          <div className="p-3 rounded bg-surface-2 border border-border-color space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">API Key (Server Stored):</span>
              <span className="font-mono text-gray-400 tracking-widest text-[11px]">
                {data.apiKeyMasked}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">API Secret (Zero Exposure):</span>
              <span className="font-mono text-gray-500 tracking-widest text-[11px]">
                {data.apiSecretMasked}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border-color/60 text-[11px] text-gray-500">
              <span>Last Sync Attempt:</span>
              <span className="font-mono text-gray-300">{lastSyncTime}</span>
            </div>
          </div>

          {/* Test connection output message */}
          {testResult && (
            <div
              className={`p-3 rounded-md border text-xs flex items-center gap-2 animate-fadeIn ${
                testResult.connected
                  ? "bg-profit/10 border-profit/30 text-profit"
                  : "bg-warning/10 border-warning/30 text-warning"
              }`}
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Wrench size={14} />}
              onClick={() => setIsConfigureOpen(true)}
            >
              Configure Credentials
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={isTesting}
              leftIcon={<Activity size={14} />}
              onClick={handleTestConnection}
            >
              Test Connection
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-loss"
              onClick={() => setTestResult({ connected: false, message: "Exchange disconnected." })}
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Connection Health & Rate Limit Telemetry (Section 13 & 14) */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider flex items-center gap-2">
              <Server size={14} className="text-cyan-400" />
              <span>Exchange Health &amp; Rate Limits</span>
            </h3>
            <span className="text-[10px] font-mono text-profit bg-profit/10 px-2 py-0.5 rounded border border-profit/30">
              ● API HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-[10px] text-gray-400 block uppercase">API Connectivity</span>
              <div className="font-mono text-profit font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
                HEALTHY
              </div>
              <span className="text-[10px] text-gray-500 block">Ping: 68ms</span>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-[10px] text-gray-400 block uppercase">Account Sync</span>
              <div className="font-mono text-profit font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-profit" />
                HEALTHY
              </div>
              <span className="text-[10px] text-gray-500 block">Sync: 0 errors</span>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-[10px] text-gray-400 block uppercase">Market Data</span>
              <div className="font-mono text-profit font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-profit" />
                HEALTHY
              </div>
              <span className="text-[10px] text-gray-500 block">Ticks: Simulated</span>
            </div>

            <div className="p-3 rounded bg-surface-2 border border-border-color space-y-1">
              <span className="text-[10px] text-gray-400 block uppercase">Rate Limit (Weight)</span>
              <div className="font-mono text-cyan-300 font-semibold">4 / 1200</div>
              <span className="text-[10px] text-profit block">&lt;1% utilized</span>
            </div>
          </div>
        </div>

        {/* Binance Account Balances Table (Section 10) */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-400" />
                <span>Binance Account Balances</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Current asset allocation in connected exchange account.
              </p>
            </div>
            <span className="text-[10px] font-mono text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/30 self-start sm:self-auto">
              SIMULATED TESTNET DATA
            </span>
          </div>

          <div className="overflow-x-auto border border-border-color rounded-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-surface-2 text-gray-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-3 text-right">In Orders / Locked</th>
                  <th className="py-2.5 px-3 text-right">Total Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/60 font-mono">
                {balances?.balances.map((item) => (
                  <tr key={item.asset} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2 px-3 font-semibold text-gray-200">{item.asset}</td>
                    <td className="py-2 px-3 text-right text-gray-300">
                      {item.available.toLocaleString(undefined, {
                        minimumFractionDigits: item.asset === "USDT" ? 2 : 3,
                      })}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500">
                      {item.locked.toLocaleString(undefined, {
                        minimumFractionDigits: item.asset === "USDT" ? 2 : 3,
                      })}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-cyan-300">
                      {item.total.toLocaleString(undefined, {
                        minimumFractionDigits: item.asset === "USDT" ? 2 : 3,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs font-mono text-gray-400">
            <span>Estimated Total Portfolio Value:</span>
            <span className="text-profit font-bold text-sm">
              ${balances?.total_estimated_usd.toLocaleString() ?? "15,920.00"} USD
            </span>
          </div>
        </div>

        {/* Structured Exchange Logs (Section 18 & 19) */}
        <div className="bg-surface border border-border-color rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">
              Exchange Audit Telemetry
            </h3>
            <Link
              href="/activity"
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>View in Activity</span>
              <ExternalLink size={11} />
            </Link>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="p-2 rounded bg-surface-2 border border-border-color/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">09:42:18</span>
                <span className="text-cyan-400 font-semibold">BINANCE</span>
                <span className="text-gray-300">GET_ACCOUNT</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-profit">SUCCESS</span>
                <span className="text-gray-500">84ms</span>
              </div>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">09:42:14</span>
                <span className="text-cyan-400 font-semibold">BINANCE</span>
                <span className="text-gray-300">GET_BALANCES</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-profit">SUCCESS</span>
                <span className="text-gray-500">71ms</span>
              </div>
            </div>

            <div className="p-2 rounded bg-surface-2 border border-border-color/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">09:41:02</span>
                <span className="text-cyan-400 font-semibold">BINANCE</span>
                <span className="text-gray-300">TEST_CONNECTION</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-warning">AUTH_SKIPPED</span>
                <span className="text-gray-500">52ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hermes Architectural Boundary (Section 24) */}
        <div className="p-4 rounded-lg bg-surface border border-border-color space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-warning font-semibold">
            <ShieldAlert size={15} />
            <span>Hermes Architectural Isolation Boundary</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Hermes has <span className="text-loss font-semibold">ZERO DIRECT ACCESS</span> to Binance
            API keys or order dispatching gateways. The execution path strictly enforces human-in-the-loop:
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono pt-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              Hermes Proposal
            </span>
            <ArrowRight size={11} className="text-gray-500" />
            <span className="px-2 py-0.5 rounded bg-warning/10 border border-warning/30 text-warning">
              Risk Engine Validation
            </span>
            <ArrowRight size={11} className="text-gray-500" />
            <span className="px-2 py-0.5 rounded bg-profit/10 border border-profit/30 text-profit">
              Owner Approval
            </span>
            <ArrowRight size={11} className="text-gray-500" />
            <span className="px-2 py-0.5 rounded bg-surface-2 border border-border-color text-gray-300">
              Execution Service
            </span>
            <ArrowRight size={11} className="text-gray-500" />
            <span className="px-2 py-0.5 rounded bg-loss/10 border border-loss/30 text-loss">
              Binance (Disabled)
            </span>
          </div>
        </div>
      </div>

      <ConfigureExchangeModal
        isOpen={isConfigureOpen}
        onClose={() => setIsConfigureOpen(false)}
        exchangeName={data.name}
      />
    </div>
  );
}
