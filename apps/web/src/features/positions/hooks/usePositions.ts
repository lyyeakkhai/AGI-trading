import { useState, useEffect } from "react";
import { PositionItem } from "@/lib/mockPositionsData";

interface UsePositionsResult {
  positions: PositionItem[];
  isConnected: boolean;
  error: Error | null;
}

/**
 * WebSocket hook for real-time positions updates.
 */
export function usePositions(url: string = "ws://localhost:8000/api/v1/ws/portfolio"): UsePositionsResult {
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "positions_update" && Array.isArray(data.positions)) {
            setPositions(data.positions);
          } else if (data.type === "position_update") {
            // Handle single position update
            setPositions((prev) => {
              const existingIndex = prev.findIndex((p) => p.id === data.position.id);
              if (existingIndex >= 0) {
                const next = [...prev];
                next[existingIndex] = data.position;
                return next;
              }
              return [...prev, data.position];
            });
          }
        } catch (err) {
          console.error("Failed to parse position WebSocket message", err);
        }
      };

      ws.onerror = (event) => {
        setError(new Error("WebSocket error"));
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to connect to WebSocket"));
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [url]);

  return { positions, isConnected, error };
}
