"use client";

import React, { useEffect, useState } from "react";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import type { ChartDrawing, ChartAnnotation } from "@/features/trading/hooks/useChartDrawings";

export interface ChartOverlayProps {
  chart: IChartApi | null;
  series: ISeriesApi<"Candlestick"> | null;
  drawings?: ChartDrawing[];
  annotations?: ChartAnnotation[];
  visible?: boolean;
}

const DEFAULT_DRAWINGS: ChartDrawing[] = [];
const DEFAULT_ANNOTATIONS: ChartAnnotation[] = [];

export const ChartOverlay = React.memo(function ChartOverlay({
  chart,
  series,
  drawings = DEFAULT_DRAWINGS,
  annotations = DEFAULT_ANNOTATIONS,
  visible = true,
}: ChartOverlayProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!chart) return;

    const handleUpdate = () => {
      setTick((prev) => prev + 1);
    };

    const timeScale = chart.timeScale();
    try {
      timeScale.subscribeVisibleTimeRangeChange(handleUpdate);
      timeScale.subscribeVisibleLogicalRangeChange(handleUpdate);
    } catch {
      // Ignore subscription errors
    }

    window.addEventListener("resize", handleUpdate);

    return () => {
      try {
        timeScale.unsubscribeVisibleTimeRangeChange(handleUpdate);
        timeScale.unsubscribeVisibleLogicalRangeChange(handleUpdate);
      } catch {
        // Ignore unsubscription errors
      }
      window.removeEventListener("resize", handleUpdate);
    };
  }, [chart]);

  if (!visible || !chart || !series) {
    return null;
  }

  const parseTimeToCoordinate = (timeInput: number | string | undefined | null): number | null => {
    if (timeInput === undefined || timeInput === null || !chart) return null;
    try {
      let t: any = timeInput;
      if (typeof t === "string") {
        const num = Number(t);
        if (!isNaN(num)) {
          t = num;
        } else {
          const parsedMs = Date.parse(t);
          if (!isNaN(parsedMs)) {
            t = Math.floor(parsedMs / 1000);
          }
        }
      }
      if (typeof t === "number" && t > 1e11) {
        t = Math.floor(t / 1000);
      }
      const coord = chart.timeScale().timeToCoordinate(t as Time);
      if (coord !== null) return coord;
      
      // Extrapolate future/past coordinates
      const timeScale = chart.timeScale();
      const logicalRange = timeScale.getVisibleLogicalRange();
      if (logicalRange && logicalRange.from !== null && logicalRange.to !== null) {
        const t1 = timeScale.coordinateToTime(timeScale.logicalToCoordinate(logicalRange.from) as number);
        const t2 = timeScale.coordinateToTime(timeScale.logicalToCoordinate(logicalRange.to) as number);
        
        if (t1 && t2 && typeof t1 === "number" && typeof t2 === "number" && t2 !== t1) {
           const x1 = timeScale.logicalToCoordinate(logicalRange.from);
           const x2 = timeScale.logicalToCoordinate(logicalRange.to);
           if (x1 !== null && x2 !== null) {
              const pixelsPerSec = (x2 - x1) / (t2 - t1);
              return x2 + (t - t2) * pixelsPerSec;
           }
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const parsePriceToCoordinate = (priceInput: number | string | undefined | null): number | null => {
    if (priceInput === undefined || priceInput === null || !series) return null;
    try {
      const priceNum = typeof priceInput === "string" ? parseFloat(priceInput) : priceInput;
      if (isNaN(priceNum)) return null;
      return series.priceToCoordinate(priceNum);
    } catch {
      return null;
    }
  };

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-hidden">
      {/* Drawings */}
      {drawings
        .filter((d) => d.is_active !== false)
        .map((drawing) => {
          const type = drawing.drawing_type?.toLowerCase() || "";
          const params = drawing.parameters || {};

          // 1. Lines / Trendlines
          if (type.includes("line") || type.includes("trend")) {
            const p1 = params.p1;
            const p2 = params.p2;
            const x1 = parseTimeToCoordinate(p1?.time);
            const y1 = parsePriceToCoordinate(p1?.price);
            const x2 = parseTimeToCoordinate(p2?.time);
            const y2 = parsePriceToCoordinate(p2?.price);

            if (x1 === null || y1 === null || x2 === null || y2 === null) {
              return null;
            }

            const strokeColor = params.color || "#00E5FF";
            const strokeWidth = params.width || 1.5;
            const dashArray =
              params.style === "dashed"
                ? "5,5"
                : params.style === "dotted"
                ? "2,2"
                : undefined;

            return (
              <g key={drawing.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                />
                {(params.text || params.label) && (
                  <text
                    x={x2 + 4}
                    y={y2 - 4}
                    fill={strokeColor}
                    fontSize="11"
                    fontFamily="var(--font-jetbrains-mono), monospace"
                  >
                    {params.text || params.label}
                  </text>
                )}
              </g>
            );
          }

          // 2. Zones (Support / Resistance / Zone)
          if (type.includes("zone") || type.includes("supp") || type.includes("res")) {
            const priceLow = params.price_low;
            const priceHigh = params.price_high;
            const y1 = parsePriceToCoordinate(priceHigh);
            const y2 = parsePriceToCoordinate(priceLow);

            if (y1 === null || y2 === null) return null;

            const minY = Math.min(y1, y2);
            const height = Math.max(2, Math.abs(y2 - y1));

            const x1 = params.start_time ? (parseTimeToCoordinate(params.start_time) ?? 0) : 0;
            const x2 = params.end_time ? (parseTimeToCoordinate(params.end_time) ?? 4000) : 4000;
            const startX = Math.min(x1, x2);
            const width = Math.max(20, Math.abs(x2 - x1));

            const isSupp = type.includes("supp");
            const isRes = type.includes("res");
            const fillColor =
              params.color ||
              (isSupp
                ? "rgba(0, 230, 118, 0.15)"
                : isRes
                ? "rgba(255, 59, 48, 0.15)"
                : "rgba(0, 229, 255, 0.15)");
            const strokeColor = isSupp
              ? "#00E676"
              : isRes
              ? "#FF3B30"
              : "#00E5FF";

            return (
              <g key={drawing.id}>
                <rect
                  x={startX}
                  y={minY}
                  width={width}
                  height={height}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1}
                  strokeDasharray="4,2"
                />
                {params.label && (
                  <text
                    x={startX + 6}
                    y={minY + 12}
                    fill={strokeColor}
                    fontSize="11"
                    fontFamily="var(--font-jetbrains-mono), monospace"
                    fontWeight="600"
                  >
                    {params.label}
                  </text>
                )}
              </g>
            );
          }

          // 3. Markers
          if (type.includes("marker")) {
            const x = parseTimeToCoordinate(params.time);
            const y = parsePriceToCoordinate(params.price);
            if (x === null || y === null) return null;

            const color = params.color || "#00E5FF";

            return (
              <g key={drawing.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill={color}
                  stroke="#080C10"
                  strokeWidth={1.5}
                />
                {(params.label || params.text) && (
                  <text
                    x={x + 6}
                    y={y + 3}
                    fill={color}
                    fontSize="11"
                    fontFamily="var(--font-jetbrains-mono), monospace"
                  >
                    {params.label || params.text}
                  </text>
                )}
              </g>
            );
          }

          return null;
        })}

      {/* Annotations */}
      {annotations.map((ann) => {
        const x = parseTimeToCoordinate(ann.time_ms);
        const y = parsePriceToCoordinate(ann.price);
        if (x === null || y === null) return null;

        const textWidth = Math.max(36, ann.text.length * 6.5 + 14);

        return (
          <g key={ann.id}>
            <circle cx={x} cy={y} r={3} fill="#00E5FF" />
            <rect
              x={x + 6}
              y={y - 11}
              width={textWidth}
              height={20}
              rx={3}
              fill="#101417"
              stroke="#22DFFF"
              strokeWidth={0.8}
            />
            <text
              x={x + 12}
              y={y + 3}
              fill="#E2E8F0"
              fontSize="11"
              fontFamily="var(--font-jetbrains-mono), monospace"
            >
              {ann.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
});
