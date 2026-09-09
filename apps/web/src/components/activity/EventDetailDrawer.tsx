"use client";

import React from "react";
import Link from "next/link";
import { ActivityEvent } from "@/lib/mockActivityData";
import { ActivityStatusBadge, ActivityTypeBadge } from "./ActivityStatusBadge";
import { Modal, Button } from "@/components";
import { ArrowRight, ArrowUpRight, GitCommit, FileText, Info } from "lucide-react";

interface EventDetailDrawerProps {
  event: ActivityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectFlow?: (flowId: string) => void;
}

export function EventDetailDrawer({
  event,
  isOpen,
  onClose,
  onSelectFlow,
}: EventDetailDrawerProps) {
  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Operational Audit Log — ${event.id}`}
      size="lg"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Header Badges */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm">
          <div className="flex items-center gap-2">
            <ActivityTypeBadge type={event.type} />
            <span className="text-text-muted">·</span>
            <span className="font-bold text-text-primary">{event.source}</span>
            <span className="text-text-muted">·</span>
            <span className="text-cyan-400 font-bold">{event.objectId}</span>
          </div>

          <ActivityStatusBadge status={event.status} />
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Timestamp</span>
            <span className="font-bold text-text-primary mt-0.5 block">{event.timeFormatted}</span>
          </div>
          <div className="p-2 rounded-xl bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Environment</span>
            <span className="font-bold text-cyan-400 mt-0.5 block">{event.environment}</span>
          </div>
          <div className="p-2 rounded-xl bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Object Type</span>
            <span className="font-bold text-text-primary mt-0.5 block">{event.objectType}</span>
          </div>
          <div className="p-2 rounded-xl bg-surface-2/60 border border-border/40">
            <span className="text-[10px] text-text-muted block">Correlation ID</span>
            {event.correlationId ? (
              <span className="font-bold text-cyan-400 mt-0.5 block">{event.correlationId}</span>
            ) : (
              <span className="text-text-muted mt-0.5 block">—</span>
            )}
          </div>
        </div>

        {/* Summary & Description */}
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-border/50 shadow-sm/60 space-y-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wider block">Operational Summary</span>
          <p className="text-text-primary text-xs leading-relaxed font-semibold">
            {event.summary}
          </p>
          <p className="text-text-muted text-xs leading-relaxed">
            {event.details.description}
          </p>
        </div>

        {/* State Transitions if available */}
        {event.details.beforeState && event.details.afterState && (
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-text-muted block">Previous State</span>
              <span className="font-medium text-text-primary">{event.details.beforeState}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <span className="text-[10px] text-cyan-400 block">Resulting State</span>
              <span className="font-bold text-emerald-400">{event.details.afterState}</span>
            </div>
          </div>
        )}

        {/* Metrics if available */}
        {event.details.metrics && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">Attached Telemetry Metrics</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(event.details.metrics).map(([k, v]) => (
                <div key={k} className="p-2 rounded-xl bg-surface-2/40 border border-border/30">
                  <span className="text-[10px] text-text-muted block">{k}</span>
                  <span className="font-bold text-text-primary block mt-0.5">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {event.correlationId && onSelectFlow && (
              <Button
                variant="secondary"
                onClick={() => {
                  onClose();
                  onSelectFlow(event.correlationId!);
                }}
                className="text-xs flex items-center gap-1 text-cyan-400 border-cyan-500/30"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>View Full Pipeline Trace</span>
              </Button>
            )}

            {event.relatedLinks && event.relatedLinks.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-cyan-400 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border transition-colors"
              >
                <span>Inspect {link.id}</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            ))}
          </div>

          <Button variant="secondary" onClick={onClose} className="text-xs">
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
}
