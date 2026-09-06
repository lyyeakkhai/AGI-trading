"use client";

import React from "react";
import {
  Sliders,
  Shield,
  Layers,
  Cpu,
  ShieldCheck,
  Bell,
  LineChart,
  Layout,
  Lock,
  ChevronRight,
} from "lucide-react";
import { SettingsCategory } from "@/lib/mockSettingsData";

export interface NavItem {
  id: SettingsCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "general",
    label: "General",
    description: "Workspace name, timezone, formatting",
    icon: <Sliders size={16} />,
  },
  {
    id: "trading",
    label: "Trading Mode",
    description: "Paper sandbox vs live execution",
    icon: <Shield size={16} />,
    badge: "PAPER",
  },
  {
    id: "exchanges",
    label: "Exchanges",
    description: "Binance status & mock credentials",
    icon: <Layers size={16} />,
  },
  {
    id: "hermes",
    label: "Hermes",
    description: "Agent behavior, modes & research depth",
    icon: <Cpu size={16} />,
  },
  {
    id: "risk",
    label: "Risk Management",
    description: "Per-trade limits, circuit breakers & R:R",
    icon: <ShieldCheck size={16} />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "In-app alerts & event subscriptions",
    icon: <Bell size={16} />,
  },
  {
    id: "market-data",
    label: "Market Data",
    description: "Mock tick feeds & active tickers",
    icon: <LineChart size={16} />,
  },
  {
    id: "display",
    label: "Display & Theme",
    description: "Obsidian styling & density controls",
    icon: <Layout size={16} />,
  },
  {
    id: "security",
    label: "Security & Sessions",
    description: "Access ledger, sandbox rules & danger zone",
    icon: <Lock size={16} />,
  },
];

interface SettingsNavProps {
  activeCategory: SettingsCategory;
  onSelectCategory: (category: SettingsCategory) => void;
  unsavedCategories: Set<SettingsCategory>;
}

export function SettingsNav({
  activeCategory,
  onSelectCategory,
  unsavedCategories,
}: SettingsNavProps) {
  return (
    <div>
      {/* Mobile / Tablet Category Dropdown */}
      <div className="md:hidden mb-4">
        <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
          Select Category
        </label>
        <div className="relative">
          <select
            value={activeCategory}
            onChange={(e) => onSelectCategory(e.target.value as SettingsCategory)}
            className="w-full appearance-none bg-surface border border-border-color rounded-md text-xs text-gray-200 px-3 py-2 outline-none focus:border-cyan-500"
          >
            {NAV_ITEMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} {unsavedCategories.has(item.id) ? "● (Unsaved)" : ""}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Desktop Sidebar List */}
      <div className="hidden md:flex flex-col gap-1 w-64 shrink-0 pr-4 border-r border-border-color">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">
          Settings Categories
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeCategory === item.id;
          const hasUnsaved = unsavedCategories.has(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCategory(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all text-left group ${
                isActive
                  ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.06)]"
                  : "hover:bg-surface-2 border border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={`${
                    isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {hasUnsaved && (
                  <span
                    className="w-2 h-2 rounded-full bg-warning animate-pulse"
                    title="Unsaved changes in this section"
                  />
                )}
                {item.badge && !hasUnsaved && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-gray-400 border border-border-color">
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  size={12}
                  className={`transition-transform ${
                    isActive ? "text-cyan-400 translate-x-0.5" : "text-gray-600 group-hover:text-gray-400"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
