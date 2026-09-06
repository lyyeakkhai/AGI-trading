"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Search, ShieldAlert, Cpu, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SettingsState, SearchableSettingItem } from "@/lib/mockSettingsData";

interface SettingsHeaderProps {
  settings: SettingsState;
  unsavedCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchableSettingItem[];
  onSelectSearchResult: (item: SearchableSettingItem) => void;
}

export function SettingsHeader({
  settings,
  unsavedCount,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
}: SettingsHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  return (
    <div className="space-y-4 pb-4 border-b border-border-color">
      {/* Top Bar: Title, Status, Warnings, Unsaved Changes, Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">
              System Configuration
            </h1>
            <Badge variant="cyan" size="sm" className="font-mono">
              OBSIDIAN v1.4
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Autonomous agent parameters, deterministic risk constraints, and environment controls.
          </p>
        </div>

        {/* Global System Health & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-profit/10 border border-profit/30 text-profit text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span className="font-semibold">HEALTHY</span>
          </div>

          {/* Warning count badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/30 text-warning text-xs font-mono">
            <AlertTriangle size={12} />
            <span>0 Errors / 1 Warning</span>
          </div>

          {/* Unsaved Changes badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
              unsavedCount > 0
                ? "bg-warning/20 border border-warning/50 text-warning font-semibold animate-pulse"
                : "bg-surface-2 border border-border-color text-gray-500"
            }`}
          >
            <span>Unsaved Changes:</span>
            <span className="font-bold">{unsavedCount}</span>
          </div>

          {/* Search Bar with quick dropdown */}
          <div className="relative w-full sm:w-64">
            <div className="relative flex items-center">
              <Search
                size={14}
                className="absolute left-2.5 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search settings..."
                className="w-full bg-surface border border-border-color rounded-md text-xs text-gray-200 placeholder-gray-500 pl-8 pr-3 py-1.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 text-gray-500 hover:text-gray-300 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Results Popup */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-surface-elevated border border-border-hi rounded-md shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-border-color/60">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-gray-500 text-center italic">
                    No matching settings found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => onSelectSearchResult(item)}
                      className="w-full text-left px-3 py-2 hover:bg-surface-2 transition-colors flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-200">{item.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 line-clamp-1">
                        {item.description}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Summary Bar (Section 24) */}
      <div className="p-2.5 rounded-lg bg-surface border border-border-color flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <Activity size={13} className="text-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Active Profile:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-2 py-0.5 rounded bg-surface-2 border border-border-color text-gray-300 flex items-center gap-1.5">
            <span className="text-gray-500">MODE:</span>
            <span className="text-profit font-semibold">{settings.trading.mode}</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-surface-2 border border-border-color text-gray-300 flex items-center gap-1.5">
            <span className="text-gray-500">EXCHANGE:</span>
            <span className="text-warning">
              {settings.exchange.status === "CONNECTED" ? "CONNECTED" : "Not Connected"}
            </span>
          </div>

          <div className="px-2 py-0.5 rounded bg-surface-2 border border-border-color text-gray-300 flex items-center gap-1.5">
            <span className="text-gray-500">HERMES:</span>
            <span className="text-cyan-400 font-semibold">{settings.hermes.status}</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-surface-2 border border-border-color text-gray-300 flex items-center gap-1.5">
            <span className="text-gray-500">RISK:</span>
            <span className="text-profit flex items-center gap-1">
              <CheckCircle2 size={11} /> Configured
            </span>
          </div>

          <div className="px-2 py-0.5 rounded bg-surface-2 border border-border-color text-gray-300 flex items-center gap-1.5">
            <span className="text-gray-500">FEED:</span>
            <span className="text-gray-300">{settings.marketData.dataMode}</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-surface-2 border border-border-color text-gray-300 flex items-center gap-1.5">
            <span className="text-gray-500">NOTIFICATIONS:</span>
            <span className="text-gray-300">In-App</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-loss/10 border border-loss/30 text-loss flex items-center gap-1 font-semibold">
            <ShieldAlert size={11} />
            <span>LIVE TRADING: DISABLED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
