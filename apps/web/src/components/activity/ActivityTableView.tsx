"use client";

import React, { useState, useMemo } from "react";
import { ActivityEvent } from "@/lib/mockActivityData";
import { ActivityStatusBadge, ActivityTypeBadge } from "./ActivityStatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { Eye, GitCommit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface ActivityTableViewProps {
  events: ActivityEvent[];
  onSelectEvent: (ev: ActivityEvent) => void;
  onSelectFlow: (flowId: string) => void;
}

type SortField = "timestamp" | "type" | "source" | "status" | "environment";

export function ActivityTableView({
  events,
  onSelectEvent,
  onSelectFlow,
}: ActivityTableViewProps) {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "timestamp":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "source":
          comparison = a.source.localeCompare(b.source);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "environment":
          comparison = a.environment.localeCompare(b.environment);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [events, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="text-gray-600 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={11} className="text-cyan-400" />
    ) : (
      <ArrowDown size={11} className="text-cyan-400" />
    );
  };

  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900/50 border border-border/50 rounded-xl shadow-sm">
        <p className="text-xs font-sans text-text-muted">No activity events matching filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-1 font-sans text-xs">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-surface-2/60 text-[11px] font-sans text-text-muted select-none">
            <TableHead
              onClick={() => handleSort("timestamp")}
              className="py-2.5 px-3 cursor-pointer hover:text-gray-200 group transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>TIMESTAMP</span>
                {renderSortIcon("timestamp")}
              </div>
            </TableHead>

            <TableHead
              onClick={() => handleSort("type")}
              className="py-2.5 px-3 cursor-pointer hover:text-gray-200 group transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>TYPE</span>
                {renderSortIcon("type")}
              </div>
            </TableHead>

            <TableHead
              onClick={() => handleSort("environment")}
              className="py-2.5 px-3 cursor-pointer hover:text-gray-200 group transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>ENV</span>
                {renderSortIcon("environment")}
              </div>
            </TableHead>

            <TableHead
              onClick={() => handleSort("source")}
              className="py-2.5 px-3 cursor-pointer hover:text-gray-200 group transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>SOURCE</span>
                {renderSortIcon("source")}
              </div>
            </TableHead>

            <TableHead className="py-2.5 px-3">OBJECT</TableHead>

            <TableHead
              onClick={() => handleSort("status")}
              className="py-2.5 px-3 cursor-pointer hover:text-gray-200 group transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>STATUS</span>
                {renderSortIcon("status")}
              </div>
            </TableHead>

            <TableHead className="py-2.5 px-3">FLOW</TableHead>
            <TableHead className="py-2.5 px-3">SUMMARY</TableHead>
            <TableHead className="py-2.5 px-3 text-right">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEvents.map((ev) => (
            <TableRow
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              className="border-b border-border/40 hover:bg-surface-2/40 cursor-pointer transition-colors"
            >
              <TableCell className="py-2.5 px-3 text-text-muted text-[11px] whitespace-nowrap">
                {ev.timeFormatted}
              </TableCell>

              <TableCell className="py-2.5 px-3">
                <ActivityTypeBadge type={ev.type} />
              </TableCell>

              <TableCell className="py-2.5 px-3">
                <EnvironmentBadge
                  mode={ev.environment === "DEV" ? "DEVELOPMENT" : ev.environment}
                  className="scale-90 origin-left"
                />
              </TableCell>

              <TableCell className="py-2.5 px-3 font-medium text-text-primary">
                {ev.source}
              </TableCell>

              <TableCell className="py-2.5 px-3 text-cyan-400 font-bold">
                {ev.objectId}
              </TableCell>

              <TableCell className="py-2.5 px-3">
                <ActivityStatusBadge status={ev.status} />
              </TableCell>

              <TableCell className="py-2.5 px-3">
                {ev.correlationId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFlow(ev.correlationId!);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 px-1.5 py-0.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20"
                  >
                    <GitCommit className="w-2.5 h-2.5" />
                    <span>{ev.correlationId}</span>
                  </button>
                ) : (
                  <span className="text-text-muted text-[10px]">—</span>
                )}
              </TableCell>

              <TableCell className="py-2.5 px-3 text-text-primary max-w-md truncate" title={ev.summary}>
                {ev.summary}
              </TableCell>

              <TableCell className="py-2.5 px-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(ev);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 p-1 rounded-xl"
                  title="Inspect Event"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
