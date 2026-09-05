"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { Surface } from "./Surface";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  title = "SYSTEM ANOMALY DETECTED",
  message,
  code,
  onRetry,
  compact = false,
  className = "",
  ...props
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        role="alert"
        className={`flex items-center justify-between gap-3 px-3 py-2 bg-loss-dim/60 border border-loss/40 rounded-md text-loss ${className}`}
        {...props}
      >
        <div className="flex items-center gap-2 text-xs">
          <AlertTriangle size={15} className="shrink-0 text-loss" />
          <span className="font-mono">{message}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-[11px] font-mono underline hover:text-white transition-colors"
          >
            RETRY
          </button>
        )}
      </div>
    );
  }

  return (
    <Surface
      variant="default"
      padded="lg"
      className={`flex flex-col items-center justify-center text-center py-10 px-4 border-loss/30 bg-loss-dim/10 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-loss-dim/80 border border-loss/50 text-loss mb-3 shadow-[0_0_12px_rgba(255,59,48,0.2)]">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-xs font-mono font-bold tracking-wider text-loss uppercase mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-300 max-w-sm mb-2 leading-relaxed">
        {message}
      </p>
      {code && (
        <span className="inline-block px-2 py-0.5 rounded bg-bg-950 border border-border-color font-mono text-[10px] text-gray-500 mb-4">
          ERR_CODE: {code}
        </span>
      )}
      {onRetry && (
        <Button
          variant="danger"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={13} />}
        >
          RETRY OPERATION
        </Button>
      )}
    </Surface>
  );
}
