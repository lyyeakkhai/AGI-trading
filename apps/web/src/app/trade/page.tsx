import { Metadata } from "next";
import { Suspense } from "react";
import { BinanceFuturesDesk } from "@/features/trading/components/BinanceFuturesDesk";

export const metadata: Metadata = {
  title: "BTCUSDT Perp | USDⓈ-M Futures | Binance Futures",
};

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#12161A] text-[#848E9C] font-mono text-xs">
          Loading Binance Futures USD-M desk...
        </div>
      }
    >
      <BinanceFuturesDesk />
    </Suspense>
  );
}
