"use client";

import React from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RecentActivityEvent } from "@/lib/mockOverviewData";
import { Activity, ArrowRight, Bot, Shield, CheckCircle, RefreshCw } from "lucide-react";

interface RecentActivityWidgetProps {
  activities: RecentActivityEvent[];
  className?: string;
}

const typeIconMap = {
  AI: <Bot size={12} className="text-cyan-400" />,
  RISK: <Shield size={12} className="text-profit" />,
  ORDER: <CheckCircle size={12} className="text-warning" />,
  SYSTEM: <RefreshCw size={12} className="text-gray-400" />,
};

const typeBadgeMap = {
  AI: "cyan" as const,
  RISK: "profit" as const,
  ORDER: "warning" as const,
  SYSTEM: "neutral" as const,
};

export function RecentActivityWidget({
  activities,
  className = "",
}: RecentActivityWidgetProps) {
  return (
    <Surface
      variant="iron"
      padded="none"
      className={`flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 iron-header">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-cyan-400" />
          <span className="text-xs font-semibold text-gray-100 uppercase tracking-wide">
            Recent Intelligence Activity
          </span>
          <Badge variant="cyan" size="sm">
            LIVE FEED
          </Badge>
        </div>
        <Link href="/activity">
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight size={12} />}
            className="text-gray-400 hover:text-cyan-400 text-xs font-semibold"
          >
            AUDIT TRAIL
          </Button>
        </Link>
      </div>

      {/* Activity Timeline */}
      <div className="divide-y divide-[#222B32]/60">
        {activities.slice(0, 4).map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 px-4 py-2.5 hover:bg-iron-800/40 transition-colors"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded bg-iron-950 border border-iron-700/60 shrink-0 mt-0.5">
              {typeIconMap[act.type]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-xs font-semibold text-gray-100 truncate">
                  {act.title}
                </span>
                <span className="font-mono tabular-nums text-xs text-gray-400 shrink-0">
                  {act.timestamp}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 truncate font-sans">
                {act.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#222B32] bg-iron-950/60 text-xs font-mono text-gray-400 flex items-center justify-between">
        <span>IMMUTABLE AUDIT LOGGING: ACTIVE</span>
        <span className="text-cyan-400 font-semibold">SYNCED 100%</span>
      </div>
    </Surface>
  );
}
