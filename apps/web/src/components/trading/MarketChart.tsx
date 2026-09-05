"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  ColorType,
  CrosshairMode,
  LineStyle,
  Time,
} from "lightweight-charts";
import { CandleData, AIMarketMarker, PositionContext } from "@/lib/mockMarketData";
import { Maximize2, Eye, EyeOff, Sparkles, BarChart2 } from "lucide-react";

export interface MarketChartProps {
  candles: CandleData[];
  aiMarkers?: AIMarketMarker[];
  position?: PositionContext;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  availableTimeframes?: string[];
  symbol?: string;
  height?: number;
  className?: string;
}

export function MarketChart({
  candles,
  aiMarkers = [],
  position,
  timeframe,
  onTimeframeChange,
  availableTimeframes = ["1m", "5m", "15m", "1h", "4h", "1D"],
  symbol = "BTC/USDT",
  height = 480,
  className = "",
}: MarketChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Local chart display settings
  const [showVolume, setShowVolume] = useState(true);
  const [showAIMarkers, setShowAIMarkers] = useState(true);

  // Active hover crosshair bar stats
  const [hoveredBar, setHoveredBar] = useState<CandleData | null>(null);

  // Keep candles ref updated for crosshair without chart recreation
  const candlesRef = useRef(candles);
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  // Default to the last bar if not hovering
  const latestBar = candles.length > 0 ? candles[candles.length - 1] : null;
  const activeBar = hoveredBar || latestBar;

  // Initialize Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: "#080C10" },
        textColor: "#94A3B8",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#132027" },
        horzLines: { color: "#132027" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#263D46",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#131C23",
        },
        horzLine: {
          color: "#263D46",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#131C23",
        },
      },
      rightPriceScale: {
        borderColor: "#1B2A32",
        scaleMargins: {
          top: 0.1,
          bottom: 0.22, // Space reserved for volume histogram
        },
      },
      timeScale: {
        borderColor: "#1B2A32",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00E676",
      downColor: "#FF3B30",
      borderVisible: false,
      wickUpColor: "#00E676",
      wickDownColor: "#FF3B30",
    });
    candleSeriesRef.current = candleSeries;

    // Volume Series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // Overlay directly on the main pane
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Subscribe to crosshair move for legend data
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredBar(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as any;
      if (data && data.open !== undefined) {
        // Find matching candle with volume from ref
        const match = candlesRef.current.find((c) => c.time === param.time);
        setHoveredBar({
          time: param.time,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: match ? match.volume : 0,
        });
      } else {
        setHoveredBar(null);
      }
    });

    // ResizeObserver for robust responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !containerRef.current) return;
      const { width: newWidth } = entries[0].contentRect;
      if (newWidth > 0 && chartRef.current) {
        chartRef.current.applyOptions({ width: newWidth });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      priceLinesRef.current = [];
    };
  }, [height]);

  // Update Data & Options when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    // 1. Set Candle Data
    candleSeriesRef.current.setData(candles as any);

    // 2. Set Volume Data
    if (showVolume) {
      const volumeData = candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color:
          c.close >= c.open
            ? "rgba(0, 230, 118, 0.38)"
            : "rgba(255, 59, 48, 0.38)",
      }));
      volumeSeriesRef.current.setData(volumeData as any);
      volumeSeriesRef.current.applyOptions({ visible: true });
    } else {
      volumeSeriesRef.current.applyOptions({ visible: false });
    }

    // 3. Set AI Markers
    if (showAIMarkers && aiMarkers.length > 0) {
      candleSeriesRef.current.setMarkers(aiMarkers as any);
    } else {
      candleSeriesRef.current.setMarkers([]);
    }

    // 4. Set Position Lines if active
    // Clear old lines
    priceLinesRef.current.forEach((line) => {
      candleSeriesRef.current?.removePriceLine(line);
    });
    priceLinesRef.current = [];

    if (position && position.entryPrice) {
      const entryLine = candleSeriesRef.current.createPriceLine({
        price: position.entryPrice,
        color: "#22DFFF",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `ENTRY $${position.entryPrice.toLocaleString()}`,
      });

      const stopLine = candleSeriesRef.current.createPriceLine({
        price: position.stopPrice,
        color: "#FF3B30",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `STOP $${position.stopPrice.toLocaleString()}`,
      });

      const targetLine = candleSeriesRef.current.createPriceLine({
        price: position.targetPrice,
        color: "#00E676",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `TARGET $${position.targetPrice.toLocaleString()}`,
      });

      priceLinesRef.current = [entryLine, stopLine, targetLine];
    }
  }, [candles, aiMarkers, position, showVolume, showAIMarkers]);

  // Fit content helper
  const handleFitContent = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  return (
    <div className={`flex flex-col w-full bg-bg-900 border border-border-color rounded-lg overflow-hidden ${className}`}>
      {/* 1. Professional Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border-color bg-surface-2/40 select-none">
        {/* Left: Symbol and Timeframe Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-gray-100">{symbol}</span>
            <span className="px-1.5 py-0.2 rounded bg-bg-950 border border-border-color text-[10px] font-mono text-cyan-400">
              PERP
            </span>
          </div>

          <div className="h-4 w-px bg-border-color hidden sm:block" />

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-0.5 bg-bg-950 p-0.5 rounded border border-border-color">
            {availableTimeframes.map((tf) => {
              const isActive = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    isActive
                      ? "bg-cyan-dim/50 text-cyan-300 border border-cyan-500/40 shadow-[0_0_6px_rgba(0,229,255,0.2)] font-bold"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Toggles & Chart Utilities */}
        <div className="flex items-center gap-1.5">
          {/* Volume toggle */}
          <button
            type="button"
            onClick={() => setShowVolume((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
              showVolume
                ? "bg-surface-2 text-gray-200 border-border-hi"
                : "bg-transparent text-gray-500 border-border-color hover:text-gray-300"
            }`}
            title="Toggle Volume Series"
          >
            <BarChart2 size={12} className={showVolume ? "text-cyan-400" : "text-gray-500"} />
            <span className="hidden sm:inline">VOL</span>
          </button>

          {/* AI Markers toggle */}
          <button
            type="button"
            onClick={() => setShowAIMarkers((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
              showAIMarkers
                ? "bg-cyan-dim/30 text-cyan-300 border-cyan-500/40 shadow-[0_0_6px_rgba(0,229,255,0.15)]"
                : "bg-transparent text-gray-500 border-border-color hover:text-gray-300"
            }`}
            title="Toggle Hermes AI Market Markers"
          >
            <Sparkles size={12} className={showAIMarkers ? "text-cyan-400" : "text-gray-500"} />
            <span className="hidden sm:inline">AI SIGNALS</span>
          </button>

          {/* Fit content */}
          <button
            type="button"
            onClick={handleFitContent}
            className="p-1 rounded bg-surface-2 border border-border-color text-gray-400 hover:text-gray-200 hover:border-border-hi transition-colors"
            title="Fit Chart to Content"
            aria-label="Reset chart scale"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* 2. OHLCV Bar Hover Legend */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1.5 border-b border-border-color/60 bg-bg-950 text-[11px] font-mono select-none">
        {activeBar ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-gray-400">
            <span className="text-gray-500">
              O: <strong className="text-gray-200">${activeBar.open.toLocaleString()}</strong>
            </span>
            <span className="text-gray-500">
              H: <strong className="text-gray-200">${activeBar.high.toLocaleString()}</strong>
            </span>
            <span className="text-gray-500">
              L: <strong className="text-gray-200">${activeBar.low.toLocaleString()}</strong>
            </span>
            <span className="text-gray-500">
              C:{" "}
              <strong
                className={activeBar.close >= activeBar.open ? "text-profit" : "text-loss"}
              >
                ${activeBar.close.toLocaleString()}
              </strong>
            </span>
            {showVolume && (
              <span className="text-gray-500">
                Vol: <strong className="text-gray-300">{activeBar.volume.toLocaleString()}</strong>
              </span>
            )}
            <span
              className={`font-semibold ${
                activeBar.close >= activeBar.open ? "text-profit" : "text-loss"
              }`}
            >
              {activeBar.close >= activeBar.open ? "+" : ""}
              {(
                ((activeBar.close - activeBar.open) / activeBar.open) *
                100
              ).toFixed(2)}
              %
            </span>
          </div>
        ) : (
          <span className="text-gray-500">STREAM ACTIVE</span>
        )}

        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span className="text-gray-400">TRADINGVIEW ENGINE</span>
          </span>
          <span className="hidden md:inline">• 100 BARS</span>
        </div>
      </div>

      {/* 3. Lightweight Charts Canvas Container */}
      <div
        ref={containerRef}
        className="w-full relative bg-bg-900"
        style={{ height }}
      />
    </div>
  );
}
