"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { AgiSpotDesk } from "@/features/trading/components/AgiSpotDesk";
import { BinanceFuturesDesk } from "@/features/trading/components/BinanceFuturesDesk";

export function TradeDeskContainer() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  if (type === "futures") {
    return <BinanceFuturesDesk />;
  }

  return <AgiSpotDesk />;
}
