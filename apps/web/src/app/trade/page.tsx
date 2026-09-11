import { Metadata } from "next";
import { Suspense } from "react";
import { BinanceFuturesDesk } from "@/features/trading/components/BinanceFuturesDesk";

export const metadata: Metadata = {
  title: "BTCUSDT Perp | AGI Futures Desk | AI Algorithmic Trading",
};

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#000000] text-[#00E5FF] font-mono text-xs">
          Loading AGI Futures Pro Desk...
        </div>
      }
    >
      <BinanceFuturesDesk />
    </Suspense>
  );
}
