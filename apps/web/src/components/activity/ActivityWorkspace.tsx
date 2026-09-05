"use client";

import React, { useState, useMemo } from "react";
import {
  mockActivityEvents,
  mockActivitySummary,
  mockFlowTraces,
  ActivityEvent,
} from "@/lib/mockActivityData";
import { ActivitySummaryHeader } from "./ActivitySummaryHeader";
import { ActivityMetricsSummary } from "./ActivityMetricsSummary";
import { ActivityFiltersBar } from "./ActivityFiltersBar";
import { ActivityTimelineView } from "./ActivityTimelineView";
import { ActivityTableView } from "./ActivityTableView";
import { EventDetailDrawer } from "./EventDetailDrawer";
import { TradingFlowModal } from "./TradingFlowModal";

export function ActivityWorkspace() {
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [dateRange, setDateRange] = useState("TODAY");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [envFilter, setEnvFilter] = useState("ALL");

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return mockActivityEvents.filter((e) => {
      if (typeFilter !== "ALL" && e.type !== typeFilter) return false;
      if (sourceFilter !== "ALL" && e.source !== sourceFilter) return false;
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (envFilter !== "ALL" && e.environment !== envFilter) return false;
      if (dateRange === "TODAY" && e.dateGroup !== "TODAY") return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const mId = e.id.toLowerCase().includes(q);
        const mObj = e.objectId.toLowerCase().includes(q);
        const mSrc = e.source.toLowerCase().includes(q);
        const mSum = e.summary.toLowerCase().includes(q);
        const mFlow = e.correlationId?.toLowerCase().includes(q);
        if (!mId && !mObj && !mSrc && !mSum && !mFlow) return false;
      }

      return true;
    });
  }, [typeFilter, sourceFilter, statusFilter, envFilter, dateRange, search]);

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setSourceFilter("ALL");
    setStatusFilter("ALL");
    setEnvFilter("ALL");
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp", "Type", "Source", "Object", "Status", "Environment", "Summary"];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.timestamp,
      e.type,
      e.source,
      e.objectId,
      e.status,
      e.environment,
      `"${e.summary.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `activity-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(filteredEvents, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `activity-audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeFlow = selectedFlowId ? mockFlowTraces[selectedFlowId] || null : null;

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* 1. Page Header */}
      <ActivitySummaryHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* 2. Operational Metrics Summary */}
      <ActivityMetricsSummary summary={mockActivitySummary} />

      {/* 3. Filters & Search Bar */}
      <ActivityFiltersBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        envFilter={envFilter}
        onEnvChange={setEnvFilter}
        onReset={handleResetFilters}
        totalCount={mockActivityEvents.length}
        filteredCount={filteredEvents.length}
      />

      {/* 4. Active View Mode */}
      {viewMode === "timeline" ? (
        <ActivityTimelineView
          events={filteredEvents}
          onSelectEvent={setSelectedEvent}
          onSelectFlow={setSelectedFlowId}
        />
      ) : (
        <ActivityTableView
          events={filteredEvents}
          onSelectEvent={setSelectedEvent}
          onSelectFlow={setSelectedFlowId}
        />
      )}

      {/* 5. Modals */}
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        onSelectFlow={setSelectedFlowId}
      />

      <TradingFlowModal
        flow={activeFlow}
        isOpen={activeFlow !== null}
        onClose={() => setSelectedFlowId(null)}
      />
    </div>
  );
}
