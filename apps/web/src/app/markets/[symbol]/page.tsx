"use client";

import { useParams } from "next/navigation";
import { MarketsWorkspace } from "@/components/markets/MarketsWorkspace";

export default function SymbolMarketPage() {
  const params = useParams();
  const rawSymbol = (params?.symbol as string) || "BTC-USDT";
  const normalizedKey = rawSymbol.replace("/", "-").toUpperCase();

  return <MarketsWorkspace initialSymbolKey={normalizedKey} />;
}
