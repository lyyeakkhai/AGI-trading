"use client";

import React from "react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { ValidationGate } from "@/lib/mockStrategiesData";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

interface ValidationGateListProps {
  gates: ValidationGate[];
  className?: string;
}

export function ValidationGateList({
  gates,
  className = "",
}: ValidationGateListProps) {
  return (
    <Surface variant="default" padded="md" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-border-color pb-1.5">
        <span className="text-xs font-mono font-bold uppercase text-gray-200">
          Validation Gate Requirements
        </span>
        <span className="text-[10px] font-mono text-gray-500">
          MATHEMATICAL AUDIT TRAIL
        </span>
      </div>

      <div className="space-y-1.5 font-mono text-xs">
        {gates.map((gate) => {
          let badgeVariant: "profit" | "warning" | "loss" | "neutral" = "neutral";
          let icon = <Clock size={12} className="text-gray-500" />;

          if (gate.status === "PASS") {
            badgeVariant = "profit";
            icon = <CheckCircle2 size={12} className="text-profit" />;
          } else if (gate.status === "IN_PROGRESS") {
            badgeVariant = "warning";
            icon = <AlertCircle size={12} className="text-warning" />;
          } else if (gate.status === "FAIL") {
            badgeVariant = "loss";
            icon = <XCircle size={12} className="text-loss" />;
          }

          return (
            <div
              key={gate.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded bg-bg-950/70 border border-border-color hover:border-border-hi transition-colors"
            >
              <div className="flex items-center gap-2">
                {icon}
                <div>
                  <span className="font-semibold text-gray-200 block text-xs">
                    {gate.name}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    Criteria: {gate.threshold}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[11px] text-gray-300 font-semibold block">
                    {gate.actual}
                  </span>
                  {gate.date && (
                    <span className="text-[10px] text-gray-500 block">
                      {gate.date}
                    </span>
                  )}
                </div>
                <Badge variant={badgeVariant} size="sm">
                  {gate.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
