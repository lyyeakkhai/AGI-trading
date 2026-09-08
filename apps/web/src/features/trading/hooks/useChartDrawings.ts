"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface DrawingPoint {
  time: number | string;
  price: number;
}

export interface ChartDrawing {
  id: string;
  symbol: string;
  timeframe?: string | null;
  drawing_type: string; // e.g. "trendline", "support_zone", "resistance_zone", "marker", "line"
  parameters: {
    // Line parameters
    p1?: DrawingPoint;
    p2?: DrawingPoint;
    line_type?: string;
    width?: number;
    style?: "solid" | "dashed" | "dotted";
    // Zone parameters
    price_low?: number;
    price_high?: number;
    start_time?: number | string | null;
    end_time?: number | string | null;
    zone_type?: string;
    // Marker parameters
    time?: number | string;
    price?: number;
    marker_type?: string;
    position?: "aboveBar" | "belowBar" | "inBar";
    // Common
    color?: string;
    label?: string;
    text?: string;
    [key: string]: any;
  };
  reason?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ChartAnnotation {
  id: string;
  symbol: string;
  time_ms: number;
  price: number;
  text: string;
  created_at?: string | null;
}

export interface VisibleRange {
  symbol: string;
  timeframe?: string | null;
  from_time?: number | string | null;
  to_time?: number | string | null;
  min_price?: number | null;
  max_price?: number | null;
  bar_count?: number | null;
}

export interface UseChartDrawingsOptions {
  pollIntervalMs?: number;
  enabled?: boolean;
  token?: string;
}

export function useChartDrawings(
  symbol: string,
  timeframe?: string,
  options: UseChartDrawingsOptions = {}
) {
  const { pollIntervalMs = 4000, enabled = true, token } = options;

  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([]);
  const [visibleRange, setVisibleRange] = useState<VisibleRange | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchDrawings = useCallback(async () => {
    if (!enabled || !symbol) return;

    try {
      const q = new URLSearchParams({ symbol });
      if (timeframe) q.set("timeframe", timeframe);

      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      const authToken =
        token ||
        (typeof process !== "undefined"
          ? process.env.NEXT_PUBLIC_HERMES_TOKEN
          : undefined);
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/v1/tools/chart/state?${q.toString()}`, {
        headers,
      });

      if (!res.ok) {
        // If 403, service token may not be configured in client, log graceful warning
        if (res.status === 403) {
          console.warn("Chart drawings API requires Hermes authentication.");
          setError("Hermes authentication required");
          return;
        }
        throw new Error(`Failed to fetch chart state: ${res.statusText}`);
      }

      const data = await res.json();
      if (isMountedRef.current) {
        setDrawings(data.drawings || []);
        setAnnotations(data.annotations || []);
        if (data.visible_range) {
          setVisibleRange(data.visible_range);
        }
        setError(null);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("useChartDrawings fetch error:", err.message || err);
        setError(err.message || "Failed to fetch chart drawings");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [symbol, timeframe, enabled, token]);

  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    fetchDrawings();

    if (!enabled || pollIntervalMs <= 0) {
      return () => {
        isMountedRef.current = false;
      };
    }

    const intervalId = setInterval(fetchDrawings, pollIntervalMs);
    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchDrawings, enabled, pollIntervalMs]);

  return {
    drawings,
    annotations,
    visibleRange,
    isLoading,
    error,
    refetch: fetchDrawings,
  };
}
