"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { PositionAlert } from "@/lib/mockPositionsData";
import { Bell, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PositionAlertsListProps {
 alerts: PositionAlert[];
 className?: string;
}

export function PositionAlertsList({
 alerts,
 className = "",
}: PositionAlertsListProps) {
 if (!alerts || alerts.length === 0) return null;

 return (
  <Surface variant="default" padded="md" className={`space-y-2.5 ${className}`}>
   <div className="flex items-center justify-between border-b border-border-color pb-1.5">
    <div className="flex items-center gap-2">
     <Bell size={14} className="text-indigo-600 dark:text-indigo-400" />
     <span className="text-xs font-sans font-bold text-gray-200">
      Position Alerts & Signals
     </span>
    </div>
    <span className="text-xs font-sans text-gray-500">
     HERMES RUNTIME
    </span>
   </div>

   <div className="space-y-1.5">
    {alerts.map((alert) => (
     <div
      key={alert.id}
      className="flex items-start justify-between gap-2 p-2 rounded bg-bg-950/70 border border-border-color text-xs font-sans"
     >
      <div className="flex items-start gap-2">
       {alert.type === "success" && (
        <CheckCircle2 size={13} className="text-profit shrink-0 mt-0.5" />
       )}
       {alert.type === "warning" && (
        <AlertTriangle size={13} className="text-warning shrink-0 mt-0.5" />
       )}
       {alert.type === "info" && (
        <Info size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
       )}
       <span className="text-gray-300 leading-snug">{alert.message}</span>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
       {alert.timestamp}
      </span>
     </div>
    ))}
   </div>
  </Surface>
 );
}
