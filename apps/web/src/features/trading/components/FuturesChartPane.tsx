"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  LineStyle,
} from "lightweight-charts";
import {
  Maximize2,
  Camera,
  Settings,
  ChevronDown,
  Activity,
  X,
} from "lucide-react";
import { CandleData, mockMarketDetails } from "@/lib/mockMarketData";

interface FuturesChartPaneProps {
  symbol?: string;
  currentPrice: number;
}

// Generate realistic chart history that visually matches the reference screenshot
// (May to Sept range from ~60k -> 57.7k -> rally to 77.8k)
function generateHistoricalCandles(baseLastPrice: number): CandleData[] {
  const result: CandleData[] = [];
  const days = 140;
  const startTime = Math.floor(new Date("2026-05-01T00:00:00Z").getTime() / 1000);
  const oneDay = 86400;

  let price = 63500;
  for (let i = 0; i < days; i++) {
    const time = (startTime + i * oneDay) as any;
    
    // Simulate trend: drop to ~57.7k at i=50-60, then rally hard up to ~78k
    let dailyTrend = 0;
    if (i < 40) {
      dailyTrend = (Math.random() - 0.52) * 800;
    } else if (i < 65) {
      // Dip to 57,758
      dailyTrend = i === 60 ? -1500 : (Math.random() - 0.55) * 900;
      if (price < 58000 && i >= 60) dailyTrend = Math.abs(dailyTrend);
    } else if (i < 100) {
      // Gradual base build
      dailyTrend = (Math.random() - 0.45) * 700;
    } else if (i < 125) {
      // Breakout rally
      dailyTrend = (Math.random() - 0.35) * 1200;
    } else {
      // Top consolidation around 77k-78k
      dailyTrend = (Math.random() - 0.48) * 600;
    }

    const open = Math.round(price);
    price = Math.max(57758, price + dailyTrend);
    if (i === days - 1) {
      price = baseLastPrice;
    }

    const high = Math.round(Math.max(open, price) + Math.random() * 900 + 100);
    const low = Math.round(Math.min(open, price) - Math.random() * 800 - 50);
    const close = Math.round(price);
    const volume = Math.round((Math.random() * 80000 + 20000) * (i > 115 ? 1.8 : 1));

    result.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });
  }
  return result;
}

// Compute Simple Moving Average
function calculateSMA(candles: CandleData[], period: number) {
  const lineData = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    lineData.push({
      time: candles[i].time,
      value: Math.round(sum / period),
    });
  }
  return lineData;
}

export function FuturesChartPane({ symbol = "BTCUSDT", currentPrice }: FuturesChartPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [activeTab, setActiveTab] = useState<"Chart" | "Info" | "Data">("Chart");
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [viewStyle, setViewStyle] = useState<"Original" | "Trading View" | "Depth">("Original");
  const [showOrderPill, setShowOrderPill] = useState(true);
  const [pillSize, setPillSize] = useState("");
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  const timeframes = ["Time", "1s", "15m", "1h", "4h", "1D", "1W"];

  // Prepare candle data
  const candles = useMemo(() => {
    return generateHistoricalCandles(currentPrice);
  }, [currentPrice]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  // Initialize Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 450,
      layout: {
        background: { type: ColorType.Solid, color: "#12161A" },
        textColor: "#848E9C",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1E2329" },
        horzLines: { color: "#1E2329" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#474D57",
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: "#474D57",
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: "#23272E",
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: "#23272E",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlesticks
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#0ECB81",
      downColor: "#F6465D",
      borderVisible: false,
      wickUpColor: "#0ECB81",
      wickDownColor: "#F6465D",
    });
    candleSeries.setData(candles as any);
    candleSeriesRef.current = candleSeries;

    // Moving Averages: MA7 (Yellow), MA25 (Pink), MA99 (Purple)
    const ma7Series = chart.addLineSeries({
      color: "#F0B90B",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    ma7Series.setData(calculateSMA(candles, 7) as any);

    const ma25Series = chart.addLineSeries({
      color: "#E040FB",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    ma25Series.setData(calculateSMA(candles, 25) as any);

    const ma99Series = chart.addLineSeries({
      color: "#7C4DFF",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    ma99Series.setData(calculateSMA(candles, 99) as any);

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
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? "rgba(14, 203, 129, 0.45)" : "rgba(246, 70, 93, 0.45)",
      })) as any
    );
    volumeSeriesRef.current = volumeSeries;

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

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !containerRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles]);

  return (
    <div className="flex flex-col h-full w-full bg-[#12161A] select-none relative overflow-hidden border-r border-[#23272E]">
      {/* 1. Sub-nav tabs & utilities row */}
      <div className="h-8 border-b border-[#23272E] px-3 flex items-center justify-between text-xs font-sans bg-[#181A20]">
        <div className="flex items-center gap-4">
          {(["Chart", "Info", "Data"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-8 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-white border-[#F0B90B] font-semibold"
                  : "text-[#848E9C] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right chart tools */}
        <div className="flex items-center gap-2 text-[#848E9C]">
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#2B313A] transition-colors"
            title="Technical Indicators"
          >
            <Activity size={14} />
          </button>
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#2B313A] transition-colors"
            title="Screenshot"
          >
            <Camera size={14} />
          </button>
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#2B313A] transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-[#2B313A] transition-colors"
            title="Chart Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* 2. Timeframe & View Styles Toolbar */}
      <div className="h-8 border-b border-[#23272E] px-3 flex items-center justify-between text-[11px] font-mono bg-[#12161A]">
        {/* Left: Timeframes */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                timeframe === tf
                  ? "text-[#F0B90B] font-bold bg-[#2B313A]/50"
                  : "text-[#848E9C] hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
          <ChevronDown size={12} className="text-[#848E9C] cursor-pointer hover:text-white ml-0.5" />

          <div className="h-3 w-px bg-[#23272E] mx-1" />

          <button
            type="button"
            className="flex items-center gap-1 text-[#848E9C] hover:text-white px-1 py-0.5 rounded"
          >
            <span>Last Price</span>
            <ChevronDown size={10} />
          </button>
        </div>

        {/* Right: Original / Trading View / Depth switch */}
        <div className="flex items-center gap-1 bg-[#181A20] p-0.5 rounded border border-[#23272E]">
          {(["Original", "Trading View", "Depth"] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setViewStyle(style)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                viewStyle === style
                  ? "bg-[#2B313A] text-white font-semibold"
                  : "text-[#848E9C] hover:text-white"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 3. OHLC Hover Legend Bar */}
      <div className="px-3 py-1 bg-[#12161A] flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-[#848E9C] border-b border-[#1E2329]">
        {activeCandle && (
          <>
            <span className="text-white font-semibold">BTCUSDT Perp</span>
            <span>
              O: <strong className="text-white">{activeCandle.open.toLocaleString()}</strong>
            </span>
            <span>
              H: <strong className="text-white">{activeCandle.high.toLocaleString()}</strong>
            </span>
            <span>
              L: <strong className="text-white">{activeCandle.low.toLocaleString()}</strong>
            </span>
            <span>
              C:{" "}
              <strong
                className={activeCandle.close >= activeCandle.open ? "text-[#0ECB81]" : "text-[#F6465D]"}
              >
                {activeCandle.close.toLocaleString()}
              </strong>
            </span>
            <span>
              CHANGE:{" "}
              <span
                className={activeCandle.close >= activeCandle.open ? "text-[#0ECB81]" : "text-[#F6465D]"}
              >
                {(
                  ((activeCandle.close - activeCandle.open) / activeCandle.open) *
                  100
                ).toFixed(2)}
                %
              </span>
            </span>
            <span className="hidden xl:inline">
              Range:{" "}
              <span className="text-[#848E9C]">
                {(
                  ((activeCandle.high - activeCandle.low) / activeCandle.low) *
                  100
                ).toFixed(2)}
                %
              </span>
            </span>
          </>
        )}
      </div>

      {/* 4. Canvas Chart with Floating In-Chart Order Pill */}
      <div className="flex-1 w-full relative min-h-[350px]">
        {/* Floating In-Chart Quick Order Widget */}
        {showOrderPill && (
          <div className="absolute top-3 left-4 z-20 flex items-center bg-[#1E2329]/95 border border-[#2B313A] rounded shadow-2xl p-1 gap-1.5 backdrop-blur-sm select-none">
            {/* Buy / Long Button */}
            <button
              type="button"
              className="flex flex-col items-center justify-center bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white px-2.5 py-1 rounded text-left transition-colors font-mono"
            >
              <span className="text-[10px] font-sans font-bold leading-tight">Buy/Long</span>
              <span className="text-[11px] font-bold leading-tight">
                {(currentPrice + 0.1).toFixed(2)}
              </span>
            </button>

            {/* Size Input */}
            <div className="flex flex-col justify-center px-1.5 font-mono">
              <span className="text-[9px] text-[#848E9C] font-sans leading-none mb-0.5">Size (USDT)</span>
              <input
                type="text"
                value={pillSize}
                onChange={(e) => setPillSize(e.target.value)}
                placeholder="Enter Size"
                className="bg-transparent text-[11px] text-white placeholder-[#848E9C] focus:outline-none w-20 leading-tight"
              />
            </div>

            {/* Sell / Short Button */}
            <button
              type="button"
              className="flex flex-col items-center justify-center bg-[#F6465D] hover:bg-[#F6465D]/90 text-white px-2.5 py-1 rounded text-left transition-colors font-mono"
            >
              <span className="text-[10px] font-sans font-bold leading-tight">Sell/Short</span>
              <span className="text-[11px] font-bold leading-tight">
                {currentPrice.toFixed(2)}
              </span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowOrderPill(false)}
              className="p-1 text-[#848E9C] hover:text-white rounded hover:bg-[#2B313A] transition-colors"
              title="Close Quick Trade Pill"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Chart Canvas Container */}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
