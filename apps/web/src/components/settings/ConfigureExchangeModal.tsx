"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldAlert, KeyRound, Lock, EyeOff, Eye, CheckCircle2 } from "lucide-react";

interface ConfigureExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeName: string;
}

export function ConfigureExchangeModal({
  isOpen,
  onClose,
  exchangeName,
}: ConfigureExchangeModalProps) {
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••••••••••");
  const [apiSecret, setApiSecret] = useState("••••••••••••••••••••••••••••••••");
  const [showKey, setShowKey] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveAttempted(true);
  };

  const handleClose = () => {
    setSaveAttempted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-cyan-400">
          <KeyRound size={18} />
          <span>Configure {exchangeName} Connection</span>
        </div>
      }
      subtitle="API key and signing secrets interface."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Credentials
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="p-3 rounded-md bg-warning/10 border border-warning/30 text-gray-200 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-warning">Security Isolation Notice</p>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Real API credentials are never accepted, logged, or saved in this frontend build.
              Simulated paper trading is natively available without exchange authentication.
            </p>
          </div>
        </div>

        {saveAttempted && (
          <div className="p-3 rounded-md bg-loss/10 border border-loss/40 text-loss text-xs flex items-center gap-2 animate-fadeIn">
            <Lock size={15} className="shrink-0" />
            <span>Exchange credentials are unavailable in this frontend-only build.</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                API Key
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
                <span>{showKey ? "Mask" : "Reveal (Masked)"}</span>
              </button>
            </div>
            <Input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              mono
              placeholder="Enter Binance API Key"
              leftIcon={<KeyRound size={14} />}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400 block mb-1">
              API Secret
            </label>
            <Input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              mono
              placeholder="Enter Binance API Secret"
              leftIcon={<Lock size={14} />}
            />
          </div>

          <div className="p-2.5 rounded bg-surface border border-border-color space-y-1.5 text-[11px] text-gray-400">
            <div className="flex items-center justify-between">
              <span>Environment</span>
              <span className="text-gray-200 font-medium">Testnet / Simulation Only</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Permissions Allowed</span>
              <span className="text-profit flex items-center gap-1 font-mono">
                <CheckCircle2 size={11} /> Read Only / Paper
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Live Withdrawals / Orders</span>
              <span className="text-loss font-semibold">Strictly Blocked</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
