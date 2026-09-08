import React, { useEffect, useRef } from "react";
import { ISeriesApi, IPriceLine, LineStyle } from "lightweight-charts";
import { PositionItem } from "@/lib/mockPositionsData";

export interface ChartOverlayProps {
  series: ISeriesApi<"Candlestick"> | null;
  position: PositionItem | null;
}

export function ChartOverlay({ series, position }: ChartOverlayProps) {
  const priceLinesRef = useRef<IPriceLine[]>([]);

  useEffect(() => {
    if (!series) return;

    // Clear old lines
    priceLinesRef.current.forEach((line) => {
      try {
        series.removePriceLine(line);
      } catch (e) {
        // Ignore errors if line is already removed
      }
    });
    priceLinesRef.current = [];

    if (position && position.entryPrice) {
      const entryLine = series.createPriceLine({
        price: position.entryPrice,
        color: "#22DFFF",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `ENTRY $${position.entryPrice.toLocaleString()}`,
      });
      priceLinesRef.current.push(entryLine);
    }
    
    if (position && position.stopLoss) {
      const stopLine = series.createPriceLine({
        price: position.stopLoss,
        color: "#FF3B30",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `SL $${position.stopLoss.toLocaleString()}`,
      });
      priceLinesRef.current.push(stopLine);
    }
    
    if (position && position.takeProfit) {
      const targetLine = series.createPriceLine({
        price: position.takeProfit,
        color: "#00E676",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `TP $${position.takeProfit.toLocaleString()}`,
      });
      priceLinesRef.current.push(targetLine);
    }

    return () => {
      // Clean up lines on unmount
      priceLinesRef.current.forEach((line) => {
        try {
          series.removePriceLine(line);
        } catch (e) {
          // Ignore
        }
      });
      priceLinesRef.current = [];
    };
  }, [series, position]);

  return null;
}
