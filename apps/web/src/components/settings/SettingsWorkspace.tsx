"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  SettingsState,
  SettingsCategory,
  initialSettingsData,
  searchableSettings,
  SearchableSettingItem,
  initialSettingsActivityLog,
  SettingsActivityEvent,
  RiskSettings,
} from "@/lib/mockSettingsData";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsNav } from "./SettingsNav";
import { GeneralSettingsSection } from "./GeneralSettingsSection";
import { TradingModeSection } from "./TradingModeSection";
import { ExchangeConnectionsSection } from "./ExchangeConnectionsSection";
import { HermesSettingsSection } from "./HermesSettingsSection";
import { RiskSettingsSection } from "./RiskSettingsSection";
import { RiskFieldChange } from "./RiskConfirmationModal";
import { MarketDataSection } from "./MarketDataSection";
import { NotificationSettingsSection } from "./NotificationSettingsSection";
import { DisplaySettingsSection } from "./DisplaySettingsSection";
import { SecuritySettingsSection } from "./SecuritySettingsSection";
import { UnsavedChangesModal } from "./UnsavedChangesModal";
import { CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";

export function SettingsWorkspace() {
  // Committed (saved) state
  const [confirmedState, setConfirmedState] = useState<SettingsState>(initialSettingsData);
  // Working draft state
  const [draftState, setDraftState] = useState<SettingsState>(initialSettingsData);

  // Navigation
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("general");
  const [pendingTargetCategory, setPendingTargetCategory] = useState<SettingsCategory | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Feedback
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Activity events log (Section 25)
  const [activityEvents, setActivityEvents] = useState<SettingsActivityEvent[]>(
    initialSettingsActivityLog
  );
  const [latestEvent, setLatestEvent] = useState<SettingsActivityEvent | null>(null);

  // Determine dirty state per category
  const dirtyMap = useMemo(() => {
    const isGeneralDirty =
      JSON.stringify(draftState.general) !== JSON.stringify(confirmedState.general);
    const isTradingDirty =
      JSON.stringify(draftState.trading) !== JSON.stringify(confirmedState.trading);
    const isExchangeDirty =
      JSON.stringify(draftState.exchange) !== JSON.stringify(confirmedState.exchange);
    const isHermesDirty =
      JSON.stringify(draftState.hermes) !== JSON.stringify(confirmedState.hermes);
    const isRiskDirty =
      JSON.stringify(draftState.risk) !== JSON.stringify(confirmedState.risk);
    const isNotificationsDirty =
      JSON.stringify(draftState.notifications) !== JSON.stringify(confirmedState.notifications);
    const isMarketDataDirty =
      JSON.stringify(draftState.marketData) !== JSON.stringify(confirmedState.marketData);
    const isDisplayDirty =
      JSON.stringify(draftState.display) !== JSON.stringify(confirmedState.display);
    const isSecurityDirty = false;

    const set = new Set<SettingsCategory>();
    if (isGeneralDirty) set.add("general");
    if (isTradingDirty) set.add("trading");
    if (isExchangeDirty) set.add("exchanges");
    if (isHermesDirty) set.add("hermes");
    if (isRiskDirty) set.add("risk");
    if (isNotificationsDirty) set.add("notifications");
    if (isMarketDataDirty) set.add("market-data");
    if (isDisplayDirty) set.add("display");
    if (isSecurityDirty) set.add("security");

    return {
      set,
      isGeneralDirty,
      isTradingDirty,
      isExchangeDirty,
      isHermesDirty,
      isRiskDirty,
      isNotificationsDirty,
      isMarketDataDirty,
      isDisplayDirty,
      totalUnsaved: set.size,
    };
  }, [draftState, confirmedState]);

  // Search filter
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return searchableSettings.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch category guard
  const handleSelectCategory = (newCat: SettingsCategory) => {
    if (newCat === activeCategory) return;
    if (dirtyMap.set.has(activeCategory)) {
      setPendingTargetCategory(newCat);
      setIsUnsavedModalOpen(true);
    } else {
      setActiveCategory(newCat);
    }
  };

  const handleDiscardChanges = () => {
    // Revert draft for currently active category
    setDraftState((prev) => ({
      ...prev,
      [activeCategory === "exchanges"
        ? "exchange"
        : activeCategory === "market-data"
        ? "marketData"
        : activeCategory]:
        confirmedState[
          activeCategory === "exchanges"
            ? "exchange"
            : activeCategory === "market-data"
            ? "marketData"
            : activeCategory
        ],
    }));
    setIsUnsavedModalOpen(false);
    if (pendingTargetCategory) {
      setActiveCategory(pendingTargetCategory);
      setPendingTargetCategory(null);
    }
    showToast("Unsaved changes discarded.");
  };

  // Record mock activity audit event
  const recordEvent = (
    category: string,
    title: string,
    description: string,
    field: string,
    prevVal: string,
    newVal: string
  ) => {
    const newEvt: SettingsActivityEvent = {
      id: `SET-EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      category,
      title,
      description,
      changedField: field,
      previousValue: prevVal,
      newValue: newVal,
      source: "Owner",
    };
    setActivityEvents((prev) => [newEvt, ...prev]);
    setLatestEvent(newEvt);
  };

  // Section Save Handlers
  const handleSaveGeneral = () => {
    const prev = confirmedState.general.workspaceName;
    const next = draftState.general.workspaceName;
    setConfirmedState((prev) => ({ ...prev, general: draftState.general }));
    recordEvent(
      "General",
      "Workspace Preferences Updated",
      `Saved workspace configurations (Timezone: ${draftState.general.timezone}).`,
      "Workspace Name",
      prev,
      next
    );
    showToast("General settings saved successfully.");
  };

  const handleCancelGeneral = () => {
    setDraftState((prev) => ({ ...prev, general: confirmedState.general }));
    showToast("General changes reverted.");
  };

  const handleSaveHermes = () => {
    const prevMode = confirmedState.hermes.operatingMode;
    const nextMode = draftState.hermes.operatingMode;
    setConfirmedState((prev) => ({ ...prev, hermes: draftState.hermes }));
    recordEvent(
      "Hermes",
      "Agent Parameters Updated",
      `Hermes operating mode set to ${nextMode} with ${draftState.hermes.researchDepth} research depth.`,
      "Operating Mode",
      prevMode,
      nextMode
    );
    showToast("Hermes configuration saved.");
  };

  const handleCancelHermes = () => {
    setDraftState((prev) => ({ ...prev, hermes: confirmedState.hermes }));
    showToast("Hermes changes reverted.");
  };

  const handleConfirmSaveRisk = (updatedRisk: RiskSettings, changes: RiskFieldChange[]) => {
    const summaryStr = changes.map((c) => `${c.label} (${c.previous} → ${c.current})`).join(", ");
    setConfirmedState((prev) => ({ ...prev, risk: updatedRisk }));
    setDraftState((prev) => ({ ...prev, risk: updatedRisk }));
    recordEvent(
      "Risk",
      "Risk Limits Confirmed & Enforced",
      `Updated deterministic risk constraints: ${summaryStr || "Limits refreshed"}.`,
      changes[0]?.label || "Risk Boundary",
      String(changes[0]?.previous || "1.0%"),
      String(changes[0]?.current || "1.0%")
    );
    showToast("Risk configuration confirmed and enforced.");
  };

  const handleCancelRisk = () => {
    setDraftState((prev) => ({ ...prev, risk: confirmedState.risk }));
    showToast("Risk changes reverted.");
  };

  const handleSaveMarketData = () => {
    setConfirmedState((prev) => ({ ...prev, marketData: draftState.marketData }));
    recordEvent(
      "Market Data",
      "Feed Parameters Updated",
      `Tick update interval set to ${draftState.marketData.updateFrequency}.`,
      "Update Frequency",
      confirmedState.marketData.updateFrequency,
      draftState.marketData.updateFrequency
    );
    showToast("Market data configuration saved.");
  };

  const handleCancelMarketData = () => {
    setDraftState((prev) => ({ ...prev, marketData: confirmedState.marketData }));
    showToast("Market data changes reverted.");
  };

  const handleSaveNotifications = () => {
    setConfirmedState((prev) => ({ ...prev, notifications: draftState.notifications }));
    recordEvent(
      "Notifications",
      "Alert Preferences Updated",
      "Updated alert subscription preferences and dispatch triggers.",
      "Notification Matrix",
      "Previous",
      "Updated"
    );
    showToast("Notification preferences saved.");
  };

  const handleCancelNotifications = () => {
    setDraftState((prev) => ({ ...prev, notifications: confirmedState.notifications }));
    showToast("Notification changes reverted.");
  };

  const handleSaveDisplay = () => {
    setConfirmedState((prev) => ({ ...prev, display: draftState.display }));
    recordEvent(
      "Display",
      "Interface Density Updated",
      `Density set to ${draftState.display.density}.`,
      "Interface Density",
      confirmedState.display.density,
      draftState.display.density
    );
    showToast("Display preferences saved.");
  };

  const handleCancelDisplay = () => {
    setDraftState((prev) => ({ ...prev, display: confirmedState.display }));
    showToast("Display changes reverted.");
  };

  // Danger Zone Actions
  const handleResetSettings = () => {
    setConfirmedState(initialSettingsData);
    setDraftState(initialSettingsData);
    recordEvent(
      "Danger Zone",
      "Settings Factory Reset",
      "Restored factory defaults across all configuration categories.",
      "Global Configuration",
      "Custom",
      "Factory Default"
    );
    showToast("Settings restored to factory defaults.");
  };

  const handleClearMockData = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
    recordEvent(
      "Danger Zone",
      "Mock Memory Cache Cleared",
      "Flushed browser simulation storage and ephemeral tick cache.",
      "Memory Cache",
      "Populated",
      "Cleared"
    );
    showToast("Mock session storage cleared.");
  };

  const handleResetWorkspace = () => {
    recordEvent(
      "Danger Zone",
      "Workspace UI State Re-initialized",
      "Reset layout docking, table columns, and filter preferences.",
      "Workspace Layout",
      "Custom",
      "Default"
    );
    showToast("Workspace layout reset to default.");
  };

  const handleSelectSearchResult = (item: SearchableSettingItem) => {
    setActiveCategory(item.category);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-bg-950 text-gray-100 flex flex-col">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-surface-elevated border border-profit/50 text-profit shadow-2xl animate-fadeIn text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Header with Status, Summary & Search */}
        <SettingsHeader
          settings={confirmedState}
          unsavedCount={dirtyMap.totalUnsaved}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
        />

        {/* Mock Activity Telemetry Banner (Section 25: Conceptual Audit Connection) */}
        {latestEvent && (
          <div className="p-3 rounded-md bg-surface border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <div>
                <span className="font-semibold text-gray-200">{latestEvent.title}</span>
                <span className="text-gray-400 ml-2">{latestEvent.description}</span>
                <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                  Field: <span className="text-gray-300">{latestEvent.changedField}</span> | Delta:{" "}
                  <span className="text-gray-400 line-through">{latestEvent.previousValue}</span>{" "}
                  <ArrowRight size={10} className="inline text-cyan-400" />{" "}
                  <span className="text-profit">{latestEvent.newValue}</span> | Source:{" "}
                  <span className="text-gray-200">{latestEvent.source}</span>
                </div>
              </div>
            </div>
            <Link
              href="/activity"
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 font-medium"
            >
              <span>View Audit Log</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {/* Content Area: Sidebar Navigation + Active Category Form */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <SettingsNav
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            unsavedCategories={dirtyMap.set}
          />

          <div className="flex-1 w-full min-w-0">
            {activeCategory === "general" && (
              <GeneralSettingsSection
                data={draftState.general}
                onChange={(upd) =>
                  setDraftState((prev) => ({
                    ...prev,
                    general: { ...prev.general, ...upd },
                  }))
                }
                onSave={handleSaveGeneral}
                onCancel={handleCancelGeneral}
                isDirty={dirtyMap.isGeneralDirty}
              />
            )}

            {activeCategory === "trading" && (
              <TradingModeSection data={draftState.trading} />
            )}

            {activeCategory === "exchanges" && (
              <ExchangeConnectionsSection data={draftState.exchange} />
            )}

            {activeCategory === "hermes" && (
              <HermesSettingsSection
                data={draftState.hermes}
                onChange={(upd) =>
                  setDraftState((prev) => ({
                    ...prev,
                    hermes: { ...prev.hermes, ...upd },
                  }))
                }
                onSave={handleSaveHermes}
                onCancel={handleCancelHermes}
                isDirty={dirtyMap.isHermesDirty}
              />
            )}

            {activeCategory === "risk" && (
              <RiskSettingsSection
                data={draftState.risk}
                originalData={confirmedState.risk}
                onChange={(upd) =>
                  setDraftState((prev) => ({
                    ...prev,
                    risk: { ...prev.risk, ...upd },
                  }))
                }
                onConfirmSave={handleConfirmSaveRisk}
                onCancel={handleCancelRisk}
                isDirty={dirtyMap.isRiskDirty}
              />
            )}

            {activeCategory === "notifications" && (
              <NotificationSettingsSection
                data={draftState.notifications}
                onChange={(upd) =>
                  setDraftState((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, ...upd },
                  }))
                }
                onSave={handleSaveNotifications}
                onCancel={handleCancelNotifications}
                isDirty={dirtyMap.isNotificationsDirty}
              />
            )}

            {activeCategory === "market-data" && (
              <MarketDataSection
                data={draftState.marketData}
                onChange={(upd) =>
                  setDraftState((prev) => ({
                    ...prev,
                    marketData: { ...prev.marketData, ...upd },
                  }))
                }
                onSave={handleSaveMarketData}
                onCancel={handleCancelMarketData}
                isDirty={dirtyMap.isMarketDataDirty}
              />
            )}

            {activeCategory === "display" && (
              <DisplaySettingsSection
                data={draftState.display}
                onChange={(upd) =>
                  setDraftState((prev) => ({
                    ...prev,
                    display: { ...prev.display, ...upd },
                  }))
                }
                onSave={handleSaveDisplay}
                onCancel={handleCancelDisplay}
                isDirty={dirtyMap.isDisplayDirty}
              />
            )}

            {activeCategory === "security" && (
              <SecuritySettingsSection
                data={draftState.security}
                onResetSettings={handleResetSettings}
                onClearMockData={handleClearMockData}
                onResetWorkspace={handleResetWorkspace}
              />
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Guard Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onStay={() => {
          setIsUnsavedModalOpen(false);
          setPendingTargetCategory(null);
        }}
        onDiscard={handleDiscardChanges}
        pendingCount={dirtyMap.totalUnsaved}
      />
    </div>
  );
}
