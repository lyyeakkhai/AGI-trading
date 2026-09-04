"use client";

import React, { useState } from "react";
import { Maximize2, RefreshCw, BarChart2, Layers } from "lucide-react";
import { Surface } from "../ui/Surface";
import { IconButton } from "../ui/IconButton";
import { Spinner } from "../ui/LoadingState";

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  symbol?: string;
  timeframes?: string[];
  activeTimeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  toolbarExtra?: React.ReactNode;
  footerExtra?: React.ReactNode;
  height?: string | number;
}

const defaultTimeframes = ["1m", "5m", "15m", "1h", "4h", "1D"];

export function ChartContainer({
  title = "Market Chart",
  symbol,
  timeframes = defaultTimeframes,
  activeTimeframe = "15m",
  onTimeframeChange,
  onRefresh,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No chart series loaded",
  toolbarExtra,
  footerExtra,
  height = 420,
  children,
  className = "",
  ...props
}: ChartContainerProps) {
  const [selectedTf, setSelectedTf] = useState(activeTimeframe);

  const handleTfClick = (tf: string) => {
    setSelectedTf(tf);
    onTimeframeChange?.(tf);
  };

  return (
    <Surface
      variant="default"
      padded="none"
      className={`flex flex-col w-full overflow-hidden ${className}`}
      {...props}
    >
      {/* Top Header / Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-color bg-surface-2/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-cyan-500" />
            <span className="text-xs font-semibold text-gray-200 tracking-tight">
              {title}
            </span>
            {symbol && (
              <span className="px-1.5 py-0.5 rounded bg-bg-950 border border-border-color text-[11px] font-mono font-bold text-cyan-400">
                {symbol}
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-border-color hidden sm:block" />

          {/* Timeframe selector */}
          <div className="hidden sm:flex items-center gap-0.5">
            {timeframes.map((tf) => {
              const isActive = (onTimeframeChange ? activeTimeframe : selectedTf) === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleTfClick(tf)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    isActive
                      ? "bg-cyan-dim/40 text-cyan-400 border border-cyan-500/40 shadow-[0_0_6px_rgba(0,229,255,0.15)] font-bold"
                      : "text-gray-400 hover:text-gray-200 hover:bg-surface"
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-1.5">
          {toolbarExtra}
          {onRefresh && (
            <IconButton
              icon={<RefreshCw size={13} />}
              aria-label="Refresh chart data"
              size="xs"
              variant="ghost"
              onClick={onRefresh}
            />
          )}
          <IconButton
            icon={<Layers size={13} />}
            aria-label="Indicators"
            size="xs"
            variant="ghost"
          />
          <IconButton
            icon={<Maximize2 size={13} />}
            aria-label="Maximize chart"
            size="xs"
            variant="ghost"
          />
        </div>
      </div>

      {/* Main Chart Area */}
      <div
        className="relative w-full bg-bg-950 flex items-center justify-center overflow-hidden"
        style={{ height }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-cyan-400 font-mono text-xs">
            <Spinner size="md" variant="cyan" />
            <span>SYNCING MARKET DATASTREAM...</span>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-2 text-gray-500 font-mono text-xs">
            <BarChart2 size={24} className="text-gray-600" />
            <span>{emptyMessage}</span>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {children || (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-gray-600">
                CHART CANVAS READY [LIGHTWEIGHT CHARTS READY]
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar / Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border-color bg-surface-2/40 text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span className="text-gray-400">FEED ACTIVE</span>
          </span>
          <span className="hidden sm:inline text-gray-500">
            ENGINE: 12ms LATENCY
          </span>
        </div>
        {footerExtra && <div>{footerExtra}</div>}
      </div>
    </Surface>
  );
}
