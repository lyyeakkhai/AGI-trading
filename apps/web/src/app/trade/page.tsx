import { Metadata } from "next";
import { Suspense } from "react";
import { TradeDeskContainer } from "./TradeDeskContainer";

export const metadata: Metadata = {
  title: "BTC/USDT | AGI Spot Desk & Futures | AI Algorithmic Trading",
};

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#000000] text-[#00E5FF] font-mono text-xs">
          Loading AGI Trading Desk...
        </div>
      }
    >
      <TradeDeskContainer />
    </Suspense>
  );
}
