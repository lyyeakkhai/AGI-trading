"use client";

import React from "react";
import { ActivityEvent } from "@/lib/mockActivityData";
import { ActivityStatusBadge, ActivityTypeBadge } from "./ActivityStatusBadge";
import { ArrowRight, Eye, GitCommit, ExternalLink } from "lucide-react";
import { Button } from "@/components";

interface ActivityTimelineViewProps {
  events: ActivityEvent[];
  onSelectEvent: (ev: ActivityEvent) => void;
  onSelectFlow: (flowId: string) => void;
}

export function ActivityTimelineView({
  events,
  onSelectEvent,
  onSelectFlow,
}: ActivityTimelineViewProps) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border rounded-lg">
        <p className="text-xs font-mono text-text-muted">No activity events found matching criteria.</p>
      </div>
    );
  }

  // Group events by dateGroup
  const groups: { title: string; items: ActivityEvent[] }[] = [];
  ["TODAY", "YESTERDAY", "EARLIER"].forEach((grp) => {
    const matched = events.filter((e) => e.dateGroup === grp);
    if (matched.length > 0) {
      groups.push({ title: grp, items: matched });
    }
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {groups.map((grp) => (
        <div key={grp.title} className="space-y-2.5">
          <div className="flex items-center gap-2 pb-1 border-b border-border/40">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              {grp.title}
            </span>
            <span className="text-[10px] text-text-muted">
              ({grp.items.length} events)
            </span>
          </div>

          <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
            {grp.items.map((ev) => {
              const isRejectOrError = ev.status === "REJECTED" || ev.status === "FAILED";

              return (
                <div
                  key={ev.id}
                  className="relative group p-3 rounded-lg bg-surface-1 border border-border/60 hover:border-cyan-500/40 hover:bg-surface-1/90 transition-colors"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[19px] top-4 w-2 h-2 rounded-full border ${
                      isRejectOrError
                        ? "bg-red-500 border-red-400"
                        : ev.type === "HERMES"
                        ? "bg-cyan-400 border-cyan-300"
                        : "bg-emerald-400 border-emerald-300"
                    }`}
                  />

                  {/* Event Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-text-muted font-semibold">
                        {ev.timeFormatted}
                      </span>
                      <ActivityTypeBadge type={ev.type} />
                      <span className="text-[11px] text-text-muted">via</span>
                      <span className="text-[11px] font-medium text-text-primary">
                        {ev.source}
                      </span>
                      <span className="text-text-muted">·</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-2 text-[10px] font-bold text-cyan-400 border border-border/40">
                        {ev.objectId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ActivityStatusBadge status={ev.status} />
                      {ev.correlationId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFlow(ev.correlationId!);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/20 border border-cyan-500/20 transition-colors"
                          title="View complete trading pipeline flow"
                        >
                          <GitCommit className="w-2.5 h-2.5" />
                          <span>{ev.correlationId}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary & Details preview */}
                  <div className="text-text-primary text-xs leading-relaxed">
                    {ev.summary}
                  </div>

                  {/* Metadata Chips if present */}
                  {ev.details.beforeState && ev.details.afterState && (
                    <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-2 text-[11px] text-text-muted">
                      <span>State:</span>
                      <span className="text-text-muted">{ev.details.beforeState}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="text-emerald-400 font-bold">{ev.details.afterState}</span>
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center justify-between text-[11px]">
                    <span className="text-[10px] text-text-muted">
                      ID: {ev.id} · Env: {ev.environment}
                    </span>
                    <button
                      onClick={() => onSelectEvent(ev)}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <span>Inspect Event</span>
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
