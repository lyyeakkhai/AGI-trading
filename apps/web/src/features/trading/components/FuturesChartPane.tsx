"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  LineStyle,
  Time,
} from "lightweight-charts";
import {
  Maximize2,
  Minimize2,
  Camera,
  Settings,
  ChevronDown,
  Activity,
  X,
  Zap,
  Check,
  TrendingUp,
  Pencil,
  Type,
  Ruler,
  Crosshair,
  ArrowUpDown,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { CandleData } from "@/lib/mockMarketData";

interface FuturesChartPaneProps {
  symbol?: string;
  currentPrice: number;
}

// Deterministic pseudo-random generator to guarantee identical candle output on SSR and Client
function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate realistic chart history proportionally scaled to baseLastPrice for any asset/timeframe
function generateCandlesForTimeframe(timeframe: string, baseLastPrice: number): CandleData[] {
  const result: CandleData[] = [];
  const now = Math.floor(new Date("2026-09-11T14:15:00Z").getTime() / 1000);
  const random = createPRNG(12345 + (timeframe.charCodeAt(0) || 42) * 100);

  // Timeframe-specific parameters
  let bars = 140;
  let interval = 86400; // 1D
  let volatility = 0.015; // 1.5% daily volatility

  if (timeframe === "1W") {
    bars = 104;
    interval = 86400 * 7;
    volatility = 0.035;
  } else if (timeframe === "4h") {
    bars = 150;
    interval = 14400;
    volatility = 0.008;
  } else if (timeframe === "1h") {
    bars = 168;
    interval = 3600;
    volatility = 0.004;
  } else if (timeframe === "15m") {
    bars = 160;
    interval = 900;
    volatility = 0.002;
  } else if (timeframe === "1s") {
    bars = 180;
    interval = 1;
    volatility = 0.0002;
  } else if (timeframe === "Time") {
    bars = 180;
    interval = 1;
    volatility = 0.00015;
  }

  const startTime = now - bars * interval;
  const targetLast = baseLastPrice > 0 ? baseLastPrice : 77841.9;

  // Generate normalized random walk backwards from 1.0 (so final bar is exactly 1.0 * targetLast)
  const normPath = new Array<number>(bars);
  normPath[bars - 1] = 1.0;

  for (let i = bars - 2; i >= 0; i--) {
    // Gentle sine oscillation + random noise creates realistic market cycles
    const cycle = Math.sin((i / bars) * Math.PI * 3) * (volatility * 0.3);
    const shock = (random() - 0.49) * volatility + cycle;
    normPath[i] = Math.max(0.3, normPath[i + 1] * (1 - shock));
  }

  const precision = targetLast < 1 ? 4 : targetLast < 10 ? 3 : 2;

  // Build OHLC bars from normalized path
  for (let i = 0; i < bars; i++) {
    const time = (startTime + i * interval) as Time;
    const currentNorm = normPath[i];
    const prevNorm = i > 0 ? normPath[i - 1] : currentNorm * (1 - (random() - 0.5) * volatility);

    const openVal = prevNorm * targetLast;
    const closeVal = i === bars - 1 ? targetLast : currentNorm * targetLast;

    const wiggle = Math.abs(closeVal - openVal) + targetLast * (volatility * 0.5);
    const highVal = Math.max(openVal, closeVal) + random() * wiggle;
    const lowVal = Math.max(targetLast * 0.1, Math.min(openVal, closeVal) - random() * wiggle);

    const open = Number(openVal.toFixed(precision));
    const close = Number(closeVal.toFixed(precision));
    const high = Number(Math.max(open, close, highVal).toFixed(precision));
    const low = Number(Math.min(open, close, lowVal).toFixed(precision));

    const baseVol = targetLast > 10000 ? 8000 : 80000;
    const volume = Math.round((random() * 0.8 + 0.2) * baseVol * (i > bars - 20 ? 1.3 : 1.0));

    result.push({ time, open, high, low, close, volume });
  }

  return result;
}

// Compute Simple Moving Average with 2 decimal places
function calculateSMA(candles: CandleData[], period: number) {
  const lineData: { time: Time; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    lineData.push({
      time: candles[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }
  return lineData;
}

export function FuturesChartPane({ symbol = "BTCUSDT", currentPrice }: FuturesChartPaneProps) {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series references
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const ma7SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma25SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma99SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Workspace UI states
  const [activeTab, setActiveTab] = useState<"Chart" | "Info" | "Data">("Chart");
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [showTfDropdown, setShowTfDropdown] = useState(false);
  const [viewStyle, setViewStyle] = useState<"Original" | "Trading View" | "Depth">("Original");

  // Floating Quick Order Pill State
  const [showOrderPill, setShowOrderPill] = useState(true);
  const [pillSize, setPillSize] = useState("");
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // Technical Indicators & Settings Modals
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMAs, setShowMAs] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // TradingView drawing tools state
  const [activeTvTool, setActiveTvTool] = useState<string>("crosshair");

  // Depth Chart zoom level state
  const [depthZoom, setDepthZoom] = useState<number>(0.05); // 5% default

  // Hover candle state for legend
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  const timeframes = ["Time", "1s", "15m", "1h", "4h", "1D", "1W"];
  const extraTimeframes = ["1m", "3m", "5m", "30m", "2h", "6h", "8h", "12h", "3D", "1M"];

  // Prepare candle data based on current timeframe
  const candles = useMemo(() => {
    return generateCandlesForTimeframe(timeframe, currentPrice);
  }, [timeframe, currentPrice]);

  // Compute Moving Averages
  const ma7Data = useMemo(() => calculateSMA(candles, 7), [candles]);
  const ma25Data = useMemo(() => calculateSMA(candles, 25), [candles]);
  const ma99Data = useMemo(() => calculateSMA(candles, 99), [candles]);

  // Build quick map for lookup on hover
  const ma7Map = useMemo(() => new Map(ma7Data.map((d) => [d.time, d.value])), [ma7Data]);
  const ma25Map = useMemo(() => new Map(ma25Data.map((d) => [d.time, d.value])), [ma25Data]);
  const ma99Map = useMemo(() => new Map(ma99Data.map((d) => [d.time, d.value])), [ma99Data]);

  // Active candle displayed in OHLC legend (hovered or latest)
  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const activeCandle = hoveredCandle || latestCandle;
  const activeMa7 = activeCandle ? ma7Map.get(activeCandle.time) : undefined;
  const activeMa25 = activeCandle ? ma25Map.get(activeCandle.time) : undefined;
  const activeMa99 = activeCandle ? ma99Map.get(activeCandle.time) : undefined;

  // Handle Quick Order action with toast feedback
  const handleQuickOrder = (side: "buy" | "sell") => {
    const actionSide = side === "buy" ? "Buy/Long" : "Sell/Short";
    const priceText =
      side === "buy"
        ? (currentPrice + 0.1).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const sizeText = pillSize.trim() ? `${pillSize} USDT` : "100.00 USDT";

    setOrderToast(`${actionSide} ${sizeText} @ ${priceText} Submitted`);
    setTimeout(() => {
      setOrderToast(null);
    }, 3000);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!outerContainerRef.current) return;
    if (!document.fullscreenElement) {
      outerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Zoom and Scale Controls
  const handleZoomIn = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (logicalRange) {
      const barsCount = logicalRange.to - logicalRange.from;
      const reduction = Math.max(2, Math.round(barsCount * 0.25));
      timeScale.setVisibleLogicalRange({
        from: logicalRange.from + reduction / 2,
        to: logicalRange.to - reduction / 2,
      });
    } else {
      const current = (timeScale as any).options?.()?.barSpacing || 10;
      timeScale.applyOptions({ barSpacing: Math.min(current * 1.35, 60) });
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (logicalRange) {
      const barsCount = logicalRange.to - logicalRange.from;
      const expansion = Math.max(2, Math.round(barsCount * 0.3));
      timeScale.setVisibleLogicalRange({
        from: logicalRange.from - expansion / 2,
        to: logicalRange.to + expansion / 2,
      });
    } else {
      const current = (timeScale as any).options?.()?.barSpacing || 10;
      timeScale.applyOptions({ barSpacing: Math.max(current / 1.35, 2) });
    }
  };

  const handleResetZoom = () => {
    if (!chartRef.current) return;
    chartRef.current.timeScale().applyOptions({ barSpacing: 10, rightOffset: 12 });
    chartRef.current.timeScale().fitContent();
    chartRef.current.priceScale("right").applyOptions({ autoScale: true });
  };

  // Initialize and maintain Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current || viewStyle === "Depth" || activeTab !== "Chart") return;

    const width = chartContainerRef.current.clientWidth || 800;
    const height = chartContainerRef.current.clientHeight || 400;

    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#8A8A8A",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#151A1E" },
        horzLines: { color: "#151A1E" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#474D57",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#2B313A",
        },
        horzLine: {
          color: "#474D57",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#2B313A",
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        axisDoubleClickReset: {
          time: true,
          price: true,
        },
        mouseWheel: true,
        pinch: true,
      },
      rightPriceScale: {
        borderColor: "#23272E",
        scaleMargins: {
          top: 0.1,
          bottom: 0.22,
        },
        alignLabels: true,
        autoScale: true,
      },
      timeScale: {
        borderColor: "#23272E",
        timeVisible: timeframe !== "1D" && timeframe !== "1W",
        secondsVisible: timeframe === "Time" || timeframe === "1s",
        barSpacing: 10,
        minBarSpacing: 1,
        rightOffset: 12,
      },
    });

    chartRef.current = chart;

    // Candlestick Series (hidden if timeframe is "Time")
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00E676",
      downColor: "#FF3B30",
      borderVisible: false,
      wickUpColor: "#00E676",
      wickDownColor: "#FF3B30",
    });
    candleSeriesRef.current = candleSeries;

    // Area Series (visible only if timeframe is "Time")
    const areaSeries = chart.addAreaSeries({
      topColor: "rgba(0, 229, 255, 0.35)",
      bottomColor: "rgba(0, 229, 255, 0.02)",
      lineColor: "#00E5FF",
      lineWidth: 2,
    });
    areaSeriesRef.current = areaSeries;

    // Moving Averages: MA7, MA25, MA99
    const ma7Series = chart.addLineSeries({
      color: "#00E5FF",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: true,
      priceLineVisible: false,
    });
    ma7SeriesRef.current = ma7Series;

    const ma25Series = chart.addLineSeries({
      color: "#A855F7",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: true,
      priceLineVisible: false,
    });
    ma25SeriesRef.current = ma25Series;

    const ma99Series = chart.addLineSeries({
      color: "#6366F1",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: true,
      priceLineVisible: false,
    });
    ma99SeriesRef.current = ma99Series;

    // Volume histogram
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Populate initial data immediately
    if (timeframe === "Time") {
      candleSeries.applyOptions({ visible: false });
      areaSeries.applyOptions({ visible: true });
      areaSeries.setData(
        candles.map((c) => ({
          time: c.time,
          value: c.close,
        })) as any
      );
    } else {
      areaSeries.applyOptions({ visible: false });
      candleSeries.applyOptions({ visible: true });
      candleSeries.setData(candles as any);
    }

    if (showMAs && timeframe !== "Time") {
      ma7Series.setData(ma7Data as any);
      ma25Series.setData(ma25Data as any);
      ma99Series.setData(ma99Data as any);
    }

    if (showVolume) {
      volumeSeries.setData(
        candles.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(0, 230, 118, 0.45)" : "rgba(255, 59, 48, 0.45)",
        })) as any
      );
    }

    chart.timeScale().fitContent();

    // Crosshair hover tracking
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as any;
      if (data && data.open !== undefined) {
        const found = candles.find((c) => c.time === param.time);
        setHoveredCandle({
          time: param.time,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: found?.volume || 0,
        });
      } else {
        setHoveredCandle(null);
      }
    });

    // Resize observer attached directly to the chart container
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartContainerRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        chart.applyOptions({ width: w, height: h });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [viewStyle, activeTab]);

  // Update chart data when timeframe, candles, or indicators change
  useEffect(() => {
    if (!chartRef.current || viewStyle === "Depth" || activeTab !== "Chart") return;

    if (timeframe === "Time") {
      // Area series mode
      candleSeriesRef.current?.applyOptions({ visible: false });
      areaSeriesRef.current?.applyOptions({ visible: true });
      areaSeriesRef.current?.setData(
        candles.map((c) => ({
          time: c.time,
          value: c.close,
        })) as any
      );
    } else {
      // Candlestick series mode
      areaSeriesRef.current?.applyOptions({ visible: false });
      candleSeriesRef.current?.applyOptions({ visible: true });
      candleSeriesRef.current?.setData(candles as any);
    }

    // Moving Averages
    ma7SeriesRef.current?.applyOptions({ visible: showMAs && timeframe !== "Time" });
    ma25SeriesRef.current?.applyOptions({ visible: showMAs && timeframe !== "Time" });
    ma99SeriesRef.current?.applyOptions({ visible: showMAs && timeframe !== "Time" });

    if (showMAs && timeframe !== "Time") {
      ma7SeriesRef.current?.setData(ma7Data as any);
      ma25SeriesRef.current?.setData(ma25Data as any);
      ma99SeriesRef.current?.setData(ma99Data as any);
    }

    // Volume
    volumeSeriesRef.current?.applyOptions({ visible: showVolume });
    if (showVolume) {
      volumeSeriesRef.current?.setData(
        candles.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(14, 203, 129, 0.45)" : "rgba(246, 70, 93, 0.45)",
        })) as any
      );
    }

    // Adjust timeScale options according to timeframe
    chartRef.current.timeScale().applyOptions({
      timeVisible: timeframe !== "1D" && timeframe !== "1W",
      secondsVisible: timeframe === "Time" || timeframe === "1s",
    });

    chartRef.current.timeScale().fitContent();
  }, [candles, timeframe, ma7Data, ma25Data, ma99Data, showMAs, showVolume, viewStyle, activeTab]);

  return (
    <div
      ref={outerContainerRef}
      className="flex flex-col h-full w-full bg-[#000000] select-none relative overflow-hidden border-r border-[#242D35]"
    >
      {/* 1. Sub-nav tabs & utilities row */}
      <div className="h-8 border-b border-[#242D35] px-3 flex items-center justify-between text-xs font-sans bg-[#0E0E0E] shrink-0">
        {/* Left: Tabs */}
        <div className="flex items-center gap-4">
          {(["Chart", "Info", "Data"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-8 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-white border-[#00E5FF] font-semibold"
                  : "text-[#8A8A8A] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right: Chart tools */}
        <div className="flex items-center gap-1.5 text-[#8A8A8A]">
          {/* Quick Order Pill toggle if closed */}
          {!showOrderPill && activeTab === "Chart" && viewStyle !== "Depth" && (
            <button
              type="button"
              onClick={() => setShowOrderPill(true)}
              className="flex items-center gap-1 text-[11px] text-[#8A8A8A] hover:text-[#00E5FF] px-1.5 py-0.5 rounded hover:bg-[#1C1C1C] transition-colors mr-1"
              title="Show Quick Order Pill"
            >
              <Zap size={12} className="text-[#00E5FF]" />
              <span className="font-sans">Order Pill</span>
            </button>
          )}

          {/* Technical Indicators */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIndicatorsModal((prev) => !prev)}
              className={`p-1 rounded transition-colors ${
                showIndicatorsModal ? "text-[#00E5FF] bg-[#1C1C1C]" : "hover:text-white hover:bg-[#1C1C1C]"
              }`}
              title="Technical Indicators (MA, Volume)"
            >
              <Activity size={14} />
            </button>
            {showIndicatorsModal && (
              <div className="absolute right-0 top-7 z-30 w-44 bg-[#0E0E0E] border border-[#242D35] rounded shadow-2xl p-2 text-xs font-sans text-white">
                <div className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2 px-1">
                  Indicators
                </div>
                <label className="flex items-center justify-between px-1 py-1 hover:bg-[#1C1C1C] rounded cursor-pointer">
                  <span>Moving Averages</span>
                  <input
                    type="checkbox"
                    checked={showMAs}
                    onChange={(e) => setShowMAs(e.target.checked)}
                    className="accent-[#00E5FF]"
                  />
                </label>
                <label className="flex items-center justify-between px-1 py-1 hover:bg-[#1C1C1C] rounded cursor-pointer">
                  <span>Volume Histogram</span>
                  <input
                    type="checkbox"
                    checked={showVolume}
                    onChange={(e) => setShowVolume(e.target.checked)}
                    className="accent-[#00E5FF]"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Zoom and Scale Controls */}
          {activeTab === "Chart" && viewStyle !== "Depth" && (
            <div className="flex items-center gap-0.5 border-r border-[#242D35] pr-1 mr-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 hover:text-white rounded hover:bg-[#1C1C1C] transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 hover:text-white rounded hover:bg-[#1C1C1C] transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 hover:text-[#00E5FF] rounded hover:bg-[#1C1C1C] transition-colors"
                title="Reset Zoom / Auto Fit"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          )}

          {/* Screenshot */}
          <button
            type="button"
            onClick={() => {
              setOrderToast("Chart snapshot captured to clipboard");
              setTimeout(() => setOrderToast(null), 2500);
            }}
            className="p-1 hover:text-white rounded hover:bg-[#1C1C1C] transition-colors"
            title="Screenshot"
          >
            <Camera size={14} />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:text-white rounded hover:bg-[#1C1C1C] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Chart Settings */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettingsModal((prev) => !prev)}
              className={`p-1 rounded transition-colors ${
                showSettingsModal ? "text-[#00E5FF] bg-[#1C1C1C]" : "hover:text-white hover:bg-[#1C1C1C]"
              }`}
              title="Chart Settings"
            >
              <Settings size={14} />
            </button>
            {showSettingsModal && (
              <div className="absolute right-0 top-7 z-30 w-48 bg-[#0E0E0E] border border-[#242D35] rounded shadow-2xl p-2 text-xs font-sans text-white">
                <div className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2 px-1">
                  Chart Settings
                </div>
                <label className="flex items-center justify-between px-1 py-1 hover:bg-[#1C1C1C] rounded cursor-pointer">
                  <span>Quick Order Pill</span>
                  <input
                    type="checkbox"
                    checked={showOrderPill}
                    onChange={(e) => setShowOrderPill(e.target.checked)}
                    className="accent-[#00E5FF]"
                  />
                </label>
                <label className="flex items-center justify-between px-1 py-1 hover:bg-[#1C1C1C] rounded cursor-pointer">
                  <span>MA Lines</span>
                  <input
                    type="checkbox"
                    checked={showMAs}
                    onChange={(e) => setShowMAs(e.target.checked)}
                    className="accent-[#00E5FF]"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab === "Chart" && (
        <>
          {/* 2. Timeframe & View Styles Toolbar */}
          <div className="h-8 border-b border-[#242D35] px-3 flex items-center justify-between text-[11px] font-mono bg-[#000000] shrink-0">
            {/* Left: Timeframes */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    timeframe === tf
                      ? "text-[#00E5FF] font-bold bg-[#1C1C1C]/60 shadow-sm"
                      : "text-[#8A8A8A] hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}

              {/* Dropdown for extra intervals */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTfDropdown((prev) => !prev)}
                  className="p-1 text-[#8A8A8A] hover:text-white rounded hover:bg-[#1C1C1C]"
                  title="More intervals"
                >
                  <ChevronDown size={12} />
                </button>
                {showTfDropdown && (
                  <div className="absolute left-0 top-7 z-30 grid grid-cols-2 gap-1 w-28 bg-[#0E0E0E] border border-[#242D35] rounded shadow-2xl p-1.5 text-xs font-mono">
                    {extraTimeframes.map((etf) => (
                      <button
                        key={etf}
                        type="button"
                        onClick={() => {
                          setTimeframe(etf);
                          setShowTfDropdown(false);
                        }}
                        className={`px-1.5 py-1 rounded text-center transition-colors ${
                          timeframe === etf
                            ? "text-[#00E5FF] font-bold bg-[#1C1C1C]"
                            : "text-[#8A8A8A] hover:text-white hover:bg-[#1C1C1C]/50"
                        }`}
                      >
                        {etf}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-3 w-px bg-[#23272E] mx-1" />

              <button
                type="button"
                className="flex items-center gap-1 text-[#8A8A8A] hover:text-white px-1 py-0.5 rounded font-sans text-[11px]"
              >
                <span>Price</span>
                <ChevronDown size={10} />
              </button>
            </div>

            {/* Right: Original / Trading View / Depth switch */}
            <div className="flex items-center gap-1 bg-[#0E0E0E] p-0.5 rounded border border-[#242D35]">
              {(["Original", "Trading View", "Depth"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setViewStyle(style)}
                  className={`px-2 py-0.5 rounded text-[10px] font-sans transition-colors ${
                    viewStyle === style
                      ? "bg-[#1C1C1C] text-white font-semibold shadow-sm"
                      : "text-[#8A8A8A] hover:text-white"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 3. OHLC & Moving Averages Legend Bar */}
          {viewStyle !== "Depth" && (
            <div className="px-3 py-1 bg-[#000000] flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-[#8A8A8A] border-b border-[#242D35] shrink-0">
              {activeCandle && (
                <>
                  <span className="text-white font-semibold font-sans">BTCUSDT Perp</span>
                  <span>
                    O:{" "}
                    <strong className="text-white">
                      {activeCandle.open.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                  <span>
                    H:{" "}
                    <strong className="text-white">
                      {activeCandle.high.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                  <span>
                    L:{" "}
                    <strong className="text-white">
                      {activeCandle.low.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                  <span>
                    C:{" "}
                    <strong
                      className={
                        activeCandle.close >= activeCandle.open ? "text-[#00E676]" : "text-[#FF3B30]"
                      }
                    >
                      {activeCandle.close.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </span>
                  <span>
                    CHANGE:{" "}
                    <span
                      className={
                        activeCandle.close >= activeCandle.open ? "text-[#00E676]" : "text-[#FF3B30]"
                      }
                    >
                      {(
                        ((activeCandle.close - activeCandle.open) / activeCandle.open) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                  </span>

                  {/* MA Legend indicators */}
                  {showMAs && timeframe !== "Time" && (
                    <>
                      {activeMa7 !== undefined && (
                        <span className="text-[#00E5FF] font-semibold">
                          MA(7):{" "}
                          {activeMa7.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                      {activeMa25 !== undefined && (
                        <span className="text-[#A855F7] font-semibold">
                          MA(25):{" "}
                          {activeMa25.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                      {activeMa99 !== undefined && (
                        <span className="text-[#6366F1] font-semibold">
                          MA(99):{" "}
                          {activeMa99.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </>
                  )}

                  {/* Volume */}
                  {showVolume && (
                    <span>
                      Vol(BTC):{" "}
                      <strong
                        className={
                          activeCandle.close >= activeCandle.open ? "text-[#00E676]" : "text-[#FF3B30]"
                        }
                      >
                        {activeCandle.volume.toLocaleString("en-US")}
                      </strong>
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* 4. Canvas Chart Body / TradingView Rail / Depth View */}
          <div className="flex-1 w-full relative min-h-[350px] flex overflow-hidden">
            {/* Left Drawing Toolbar for TradingView Mode */}
            {viewStyle === "Trading View" && (
              <div className="w-10 bg-[#0E0E0E] border-r border-[#242D35] flex flex-col items-center py-2 gap-2 text-[#8A8A8A] shrink-0 z-10">
                {[
                  { id: "crosshair", icon: Crosshair, label: "Crosshair" },
                  { id: "trendline", icon: TrendingUp, label: "Trendline" },
                  { id: "brush", icon: Pencil, label: "Brush" },
                  { id: "text", icon: Type, label: "Text Note" },
                  { id: "position", icon: ArrowUpDown, label: "Long/Short Position" },
                  { id: "measure", icon: Ruler, label: "Measure Ruler" },
                  { id: "trash", icon: Trash2, label: "Clear Drawings" },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTvTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setActiveTvTool(tool.id)}
                      className={`p-1.5 rounded transition-colors ${
                        isActive
                          ? "bg-[#1C1C1C] text-[#00E5FF]"
                          : "hover:text-white hover:bg-[#1C1C1C]/60"
                      }`}
                      title={tool.label}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Center Area */}
            <div className="flex-1 relative w-full h-full min-h-0">
              {/* Dedicated Lightweight Charts Canvas Mount Point */}
              <div
                ref={chartContainerRef}
                suppressHydrationWarning
                className={`w-full h-full ${viewStyle === "Depth" ? "hidden" : "block"}`}
              />

              {/* Floating Quick Order Pill */}
              {showOrderPill && viewStyle !== "Depth" && (
                <div className="absolute top-3 left-3 z-20 flex items-center bg-[#0E0E0E]/95 border border-[#242D35] rounded shadow-2xl p-1 gap-1.5 backdrop-blur-md select-none transition-all">
                  {/* Buy / Long Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickOrder("buy")}
                    className="flex flex-col items-center justify-center bg-[#00E676] hover:bg-[#00E676]/90 active:scale-[0.98] text-white px-2.5 py-1 rounded text-left transition-all font-mono shadow-sm"
                  >
                    <span className="text-[10px] font-sans font-bold leading-tight uppercase tracking-wider">
                      Buy/Long
                    </span>
                    <span className="text-[11px] font-bold leading-tight">
                      {(currentPrice + 0.1).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </button>

                  {/* Size Input */}
                  <div className="flex flex-col justify-center px-2 py-0.5 bg-[#14171A] border border-[#242D35] rounded font-mono">
                    <span className="text-[9px] text-[#8A8A8A] font-sans font-semibold uppercase leading-none mb-0.5">
                      Size (USDT)
                    </span>
                    <input
                      type="text"
                      value={pillSize}
                      onChange={(e) => setPillSize(e.target.value)}
                      placeholder="100.00"
                      className="bg-transparent text-[11px] text-white placeholder-[#5E6673] focus:outline-none w-20 leading-tight font-mono"
                    />
                  </div>

                  {/* Sell / Short Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickOrder("sell")}
                    className="flex flex-col items-center justify-center bg-[#FF3B30] hover:bg-[#FF3B30]/90 active:scale-[0.98] text-white px-2.5 py-1 rounded text-left transition-all font-mono shadow-sm"
                  >
                    <span className="text-[10px] font-sans font-bold leading-tight uppercase tracking-wider">
                      Sell/Short
                    </span>
                    <span className="text-[11px] font-bold leading-tight">
                      {currentPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setShowOrderPill(false)}
                    className="p-1 text-[#8A8A8A] hover:text-white rounded hover:bg-[#1C1C1C] transition-colors"
                    title="Close Quick Trade Pill"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Order Feedback Toast */}
              {orderToast && (
                <div className="absolute top-16 left-3 z-30 flex items-center gap-2 bg-[#0E0E0E] border border-[#00E676] text-white text-xs font-mono px-3 py-1.5 rounded shadow-2xl animate-fade-in backdrop-blur-md">
                  <Check size={14} className="text-[#00E676]" />
                  <span>{orderToast}</span>
                </div>
              )}

              {/* Floating Mini Chart Zoom HUD (TradingView Style, bottom-right) */}
              {viewStyle !== "Depth" && (
                <div className="absolute bottom-8 right-16 z-20 flex items-center bg-[#0E0E0E]/90 border border-[#242D35] rounded px-1 py-0.5 text-xs text-[#8A8A8A] gap-0.5 shadow-lg backdrop-blur select-none">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 hover:text-white hover:bg-[#1C1C1C] rounded transition-colors"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-1.5 py-0.5 text-[10px] font-mono text-[#8A8A8A] hover:text-[#00E5FF] hover:bg-[#1C1C1C] rounded transition-colors"
                    title="Auto Fit Chart"
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 hover:text-white hover:bg-[#1C1C1C] rounded transition-colors"
                    title="Zoom In (+)"
                  >
                    <ZoomIn size={12} />
                  </button>
                </div>
              )}

              {/* ViewStyle === "Depth": Dedicated Market Depth Chart */}
              {viewStyle === "Depth" ? (
                <DepthChartPane currentPrice={currentPrice} depthZoom={depthZoom} onZoomChange={setDepthZoom} />
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Contract Specifications Panel when "Info" tab is active */}
      {activeTab === "Info" && <ContractInfoPane symbol={symbol} currentPrice={currentPrice} />}

      {/* Market Data Analytics Panel when "Data" tab is active */}
      {activeTab === "Data" && <MarketDataPane symbol={symbol} currentPrice={currentPrice} />}
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-component: Dedicated Market Depth Chart
// --------------------------------------------------------------------------
interface DepthChartPaneProps {
  currentPrice: number;
  depthZoom: number;
  onZoomChange: (zoom: number) => void;
}

function DepthChartPane({ currentPrice, depthZoom, onZoomChange }: DepthChartPaneProps) {
  const [hoverData, setHoverData] = useState<{
    side: "Bid" | "Ask";
    price: number;
    amount: number;
    total: number;
  } | null>(null);

  // Generate synthetic depth curve
  const { bids, asks } = useMemo(() => {
    const steps = 30;
    const bidStep = (currentPrice * depthZoom) / steps;
    const askStep = (currentPrice * depthZoom) / steps;

    const generatedBids: { price: number; amount: number; total: number }[] = [];
    let bidSum = 0;
    for (let i = 0; i < steps; i++) {
      const price = currentPrice - (steps - i) * bidStep;
      const amount = Math.round((Math.sin(i * 0.2) + 1.2) * 45 + ((i * 17) % 20));
      bidSum += amount;
      generatedBids.push({ price, amount, total: bidSum });
    }

    const generatedAsks: { price: number; amount: number; total: number }[] = [];
    let askSum = 0;
    for (let i = 0; i < steps; i++) {
      const price = currentPrice + (i + 1) * askStep;
      const amount = Math.round((Math.cos(i * 0.2) + 1.2) * 45 + ((i * 13) % 20));
      askSum += amount;
      generatedAsks.push({ price, amount, total: askSum });
    }

    return { bids: generatedBids, asks: generatedAsks };
  }, [currentPrice, depthZoom]);

  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 1000,
    asks[asks.length - 1]?.total || 1000
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#000000] p-4 text-xs font-mono select-none">
      {/* Top Depth Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[#242D35]">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold font-sans">Market Depth Curve</span>
          <span className="text-[#8A8A8A]">Mid Price:</span>
          <span className="text-white font-bold">
            {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
          </span>
        </div>

        {/* Zoom selector */}
        <div className="flex items-center gap-1 bg-[#0E0E0E] p-0.5 rounded border border-[#242D35]">
          <span className="text-[10px] text-[#8A8A8A] px-1 font-sans">Zoom:</span>
          {[0.01, 0.02, 0.05, 0.1].map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => onZoomChange(z)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                depthZoom === z
                  ? "bg-[#1C1C1C] text-[#00E5FF] font-bold"
                  : "text-[#8A8A8A] hover:text-white"
              }`}
            >
              {(z * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      {/* SVG Depth Graphic */}
      <div className="flex-1 relative w-full pt-4">
        {hoverData && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0E0E0E]/95 border border-[#242D35] px-3 py-1.5 rounded shadow-xl flex items-center gap-3 text-xs z-20">
            <span
              className={`font-bold ${
                hoverData.side === "Bid" ? "text-[#00E676]" : "text-[#FF3B30]"
              }`}
            >
              {hoverData.side}
            </span>
            <span>Price: {hoverData.price.toFixed(1)}</span>
            <span>Cumulative: {hoverData.total.toLocaleString("en-US")} BTC</span>
          </div>
        )}

        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00E676" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF3B30" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="500" y1="0" x2="500" y2="280" stroke="#23272E" strokeDasharray="4,4" />
          <line x1="0" y1="70" x2="1000" y2="70" stroke="#1E2329" />
          <line x1="0" y1="140" x2="1000" y2="140" stroke="#1E2329" />
          <line x1="0" y1="210" x2="1000" y2="210" stroke="#1E2329" />

          {/* Bid Area (Left side: 0 to 500) */}
          <path
            d={`M 0 280 ${bids
              .map((b, i) => {
                const x = (i / (bids.length - 1)) * 500;
                const y = 280 - (b.total / maxTotal) * 250;
                return `L ${x} ${y}`;
              })
              .join(" ")} L 500 280 Z`}
            fill="url(#bidGrad)"
            stroke="#00E676"
            strokeWidth="1.5"
          />

          {/* Ask Area (Right side: 500 to 1000) */}
          <path
            d={`M 500 280 ${asks
              .map((a, i) => {
                const x = 500 + (i / (asks.length - 1)) * 500;
                const y = 280 - (a.total / maxTotal) * 250;
                return `L ${x} ${y}`;
              })
              .join(" ")} L 1000 280 Z`}
            fill="url(#askGrad)"
            stroke="#FF3B30"
            strokeWidth="1.5"
          />
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[10px] text-[#8A8A8A] pt-2 border-t border-[#242D35]">
          <span>{(currentPrice * (1 - depthZoom)).toFixed(1)}</span>
          <span className="text-[#00E676] font-bold">BIDS</span>
          <span className="text-white font-bold">{currentPrice.toFixed(1)}</span>
          <span className="text-[#FF3B30] font-bold">ASKS</span>
          <span>{(currentPrice * (1 + depthZoom)).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-component: Contract Specifications (Info Tab)
// --------------------------------------------------------------------------
function ContractInfoPane({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  const specs = [
    { label: "Contract Type", value: "Perpetual Futures (USD-M)" },
    { label: "Settlement Asset", value: "USDT" },
    { label: "Underlying Index", value: "BTCUSDT Index" },
    { label: "Tick Size", value: "0.10 USDT" },
    { label: "Lot Size", value: "0.001 BTC" },
    { label: "Max Leverage", value: "125x" },
    { label: "Maintenance Margin Rate", value: "0.40%" },
    { label: "Funding Interval", value: "Every 8 hours" },
    { label: "Delivery Date", value: "Perpetual" },
    { label: "Max Market Order Size", value: "100.00 BTC" },
    { label: "Index Price", value: `${(currentPrice - 6.4).toFixed(1)} USDT` },
    { label: "Mark Price", value: `${(currentPrice - 12.6).toFixed(1)} USDT` },
  ];

  return (
    <div className="flex-1 w-full bg-[#000000] p-6 overflow-y-auto no-scrollbar font-sans text-xs">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">
            {symbol} Perpetual Contract Specifications
          </h3>
          <p className="text-[#8A8A8A]">
            Detailed parameters and trading rules governing the {symbol} USD-M Perpetual Market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="bg-[#0E0E0E] border border-[#242D35] p-3 rounded flex flex-col justify-between"
            >
              <span className="text-[#8A8A8A] text-[11px] uppercase tracking-wider mb-1">
                {spec.label}
              </span>
              <span className="text-white font-mono font-semibold text-xs">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-component: Market Data Analytics (Data Tab)
// --------------------------------------------------------------------------
function MarketDataPane({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  return (
    <div className="flex-1 w-full bg-[#000000] p-6 overflow-y-auto no-scrollbar font-sans text-xs">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">
            {symbol} Futures Market Intelligence
          </h3>
          <p className="text-[#8A8A8A]">
            Macro positioning, open interest distribution, and liquidity flow indicators.
          </p>
        </div>

        {/* 1. Long / Short Ratio */}
        <div className="bg-[#0E0E0E] border border-[#242D35] p-4 rounded space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Top Trader Long / Short Ratio (Accounts)</span>
            <span className="text-[#8A8A8A] font-mono">1.66</span>
          </div>
          <div className="h-3 w-full bg-[#23272E] rounded flex overflow-hidden">
            <div className="bg-[#00E676] h-full" style={{ width: "62.4%" }} />
            <div className="bg-[#FF3B30] h-full" style={{ width: "37.6%" }} />
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-[#00E676]">Long: 62.4%</span>
            <span className="text-[#FF3B30]">Short: 37.6%</span>
          </div>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#0E0E0E] border border-[#242D35] p-4 rounded">
            <div className="text-[#8A8A8A] text-[11px] uppercase mb-1">24h Open Interest</div>
            <div className="text-white font-mono text-base font-bold">$8,239,420,736</div>
            <div className="text-[#00E676] font-mono text-[11px] mt-1">+3.42% 24h</div>
          </div>
          <div className="bg-[#0E0E0E] border border-[#242D35] p-4 rounded">
            <div className="text-[#8A8A8A] text-[11px] uppercase mb-1">Taker Buy / Sell Volume</div>
            <div className="text-white font-mono text-base font-bold">1.18 Ratio</div>
            <div className="text-[#8A8A8A] font-mono text-[11px] mt-1">$6.16B / $5.21B</div>
          </div>
          <div className="bg-[#0E0E0E] border border-[#242D35] p-4 rounded">
            <div className="text-[#8A8A8A] text-[11px] uppercase mb-1">24h Liquidations</div>
            <div className="text-white font-mono text-base font-bold">$38,421,900</div>
            <div className="text-[#FF3B30] font-mono text-[11px] mt-1">$24.2M Shorts wiped</div>
          </div>
        </div>
      </div>
    </div>
  );
}
